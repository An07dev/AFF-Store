import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import TrackingEvent from '@/models/TrackingEvent';
import { defaultMarketingConfig, IMarketingConfig } from '@/types/marketing';

function hashSha256(val?: string): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventName = 'PageView',
      eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventSourceUrl = '',
      userData = {},
      customData = {},
      isTest = false,
      configOverride,
    } = body;

    await connectToDatabase();
    const settingDoc = await Setting.findOne({ key: 'marketing_settings' });

    const config: IMarketingConfig = configOverride
      ? { ...defaultMarketingConfig, ...(settingDoc?.value || {}), ...configOverride }
      : settingDoc?.value
      ? { ...defaultMarketingConfig, ...settingDoc.value }
      : defaultMarketingConfig;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Determine traffic source
    let source: 'facebook' | 'tiktok' | 'google' | 'direct' | 'other' = 'direct';
    const utmSrc = (userData.utmSource || '').toLowerCase();
    const referrer = (userData.referrer || '').toLowerCase();

    if (utmSrc.includes('facebook') || utmSrc.includes('fb') || referrer.includes('facebook.com') || referrer.includes('fb.me')) {
      source = 'facebook';
    } else if (utmSrc.includes('tiktok') || referrer.includes('tiktok.com')) {
      source = 'tiktok';
    } else if (utmSrc.includes('google') || referrer.includes('google.com')) {
      source = 'google';
    } else if (userData.source && ['facebook', 'tiktok', 'google', 'direct', 'other'].includes(userData.source)) {
      source = userData.source;
    }

    let eventPath = '/';
    try {
      if (eventSourceUrl) {
        eventPath = new URL(eventSourceUrl, 'http://localhost:3000').pathname;
      }
    } catch {
      eventPath = '/';
    }

    // Persist real event in MongoDB
    if (!isTest && ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].includes(eventName)) {
      try {
        await TrackingEvent.create({
          eventName,
          eventId,
          path: eventPath,
          source,
          utmSource: userData.utmSource || '',
          utmMedium: userData.utmMedium || '',
          utmCampaign: userData.utmCampaign || '',
          productName: customData.content_name || '',
          value: customData.value || 0,
          currency: customData.currency || 'VND',
          orderId: customData.order_id || '',
          ip: clientIp,
          userAgent,
        });
      } catch (dbErr) {
        console.error('Error saving tracking event to DB:', dbErr);
      }
    }

    const results: Record<string, any> = {
      facebook: null,
      tiktok: null,
    };

    // 1. Send Facebook CAPI Event
    if (config.facebookEnabled && config.facebookPixelId && config.facebookAccessToken) {
      try {
        const fbPayload: any = {
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl || 'https://shoptik.vn',
              action_source: 'website',
              user_data: {
                em: userData.email ? [hashSha256(userData.email)] : undefined,
                ph: userData.phone ? [hashSha256(userData.phone)] : undefined,
                client_ip_address: clientIp,
                client_user_agent: userAgent,
                fbp: userData.fbp,
                fbc: userData.fbc,
              },
              custom_data: {
                value: customData.value || 0,
                currency: customData.currency || 'VND',
                content_name: customData.content_name,
                content_type: 'product',
                content_ids: customData.content_ids || [],
                num_items: customData.num_items || 1,
                order_id: customData.order_id,
              },
            },
          ],
        };

        if (config.facebookTestEventCode || isTest) {
          fbPayload.test_event_code = config.facebookTestEventCode || 'TEST12345';
        }

        const fbRes = await fetch(
          `https://graph.facebook.com/v19.0/${config.facebookPixelId}/events?access_token=${encodeURIComponent(
            config.facebookAccessToken
          )}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fbPayload),
          }
        );

        const fbData = await fbRes.json();
        results.facebook = {
          success: fbRes.ok,
          status: fbRes.status,
          response: fbData,
        };
      } catch (fbErr: any) {
        results.facebook = {
          success: false,
          error: fbErr.message,
        };
      }
    } else {
      results.facebook = {
        skipped: true,
        message: 'Facebook Pixel CAPI chưa được bật hoặc thiếu Access Token',
      };
    }

    // 2. Send TikTok Events API Event
    if (config.tiktokEnabled && config.tiktokPixelId && config.tiktokAccessToken) {
      try {
        const ttPayload: any = {
          event_source: 'web',
          event_source_id: config.tiktokPixelId,
          data: [
            {
              event: eventName === 'Purchase' ? 'PlaceAnOrder' : eventName === 'AddToCart' ? 'AddToCart' : 'ViewContent',
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              user: {
                email: hashSha256(userData.email),
                phone_number: hashSha256(userData.phone),
                ip: clientIp,
                user_agent: userAgent,
                ttclid: userData.ttclid,
              },
              properties: {
                value: customData.value || 0,
                currency: customData.currency || 'VND',
                content_name: customData.content_name,
                content_type: 'product',
                content_id: Array.isArray(customData.content_ids) ? customData.content_ids[0] : customData.content_ids,
                order_id: customData.order_id,
              },
            },
          ],
        };

        if (config.tiktokTestEventCode || isTest) {
          ttPayload.test_event_code = config.tiktokTestEventCode || 'TEST_CODE';
        }

        const ttRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': config.tiktokAccessToken,
          },
          body: JSON.stringify(ttPayload),
        });

        const ttData = await ttRes.json();
        results.tiktok = {
          success: ttRes.ok,
          status: ttRes.status,
          response: ttData,
        };
      } catch (ttErr: any) {
        results.tiktok = {
          success: false,
          error: ttErr.message,
        };
      }
    } else {
      results.tiktok = {
        skipped: true,
        message: 'TikTok Pixel Events API chưa được bật hoặc thiếu Access Token',
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xử lý phát sự kiện Tracking',
      eventId,
      eventName,
      results,
    });
  } catch (error: any) {
    console.error('Error dispatching tracking event:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi phát sự kiện tracking' },
      { status: 500 }
    );
  }
}
