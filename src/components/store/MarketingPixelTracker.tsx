'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { clientCache } from '@/lib/clientCache';
import { IMarketingConfig } from '@/types/marketing';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

function getStoredUtm(): { utmSource: string; utmMedium: string; utmCampaign: string; source: string } {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '', source: 'direct' };
  }
  try {
    const raw = sessionStorage.getItem('shopbig_utm_data');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { utmSource: '', utmMedium: '', utmCampaign: '', source: 'direct' };
}

export default function MarketingPixelTracker() {
  const pathname = usePathname();
  const [config, setConfig] = useState<IMarketingConfig | null>(null);
  const lastTrackedPathRef = useRef<string>('');

  // 1. Capture UTM & Traffic Sources on landing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || '';
      const utmMedium = urlParams.get('utm_medium') || '';
      const utmCampaign = urlParams.get('utm_campaign') || '';
      const fbclid = urlParams.get('fbclid') || '';
      const ttclid = urlParams.get('ttclid') || '';
      const gclid = urlParams.get('gclid') || '';
      const ref = document.referrer.toLowerCase();

      let detectedSource = 'direct';
      if (utmSource.toLowerCase().includes('facebook') || utmSource.toLowerCase().includes('fb') || fbclid || ref.includes('facebook.com') || ref.includes('fb.me')) {
        detectedSource = 'facebook';
      } else if (utmSource.toLowerCase().includes('tiktok') || ttclid || ref.includes('tiktok.com')) {
        detectedSource = 'tiktok';
      } else if (utmSource.toLowerCase().includes('google') || gclid || ref.includes('google.com')) {
        detectedSource = 'google';
      } else if (utmSource) {
        detectedSource = utmSource.toLowerCase();
      }

      const currentStored = sessionStorage.getItem('shopbig_utm_data');
      if (!currentStored || utmSource || fbclid || ttclid || gclid) {
        sessionStorage.setItem(
          'shopbig_utm_data',
          JSON.stringify({
            utmSource,
            utmMedium,
            utmCampaign,
            source: detectedSource,
            referrer: document.referrer,
          })
        );
      }
    } catch (e) {
      console.warn('Error reading UTM parameters:', e);
    }
  }, []);

  // 2. Load Marketing Config with Client Cache (60s TTL)
  useEffect(() => {
    async function loadMarketingConfig() {
      try {
        const data = await clientCache.fetchWithCache(
          'public_marketing_config',
          async () => {
            const res = await apiFetch('/api/settings/marketing');
            return await res.json();
          },
          60000
        );
        if (data?.success && data?.data) {
          setConfig(data.data);
        }
      } catch (err) {
        console.error('Error loading marketing tracker config:', err);
      }
    }
    loadMarketingConfig();
  }, []);

  // 3. Initialize Facebook Pixel
  useEffect(() => {
    if (!config?.facebookEnabled || !config?.facebookPixelId) return;
    if (typeof window === 'undefined') return;

    if (!window.fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s?.parentNode?.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    if (window.fbq) {
      window.fbq('init', config.facebookPixelId);
      window.fbq('track', 'PageView');
    }
  }, [config?.facebookEnabled, config?.facebookPixelId]);

  // 4. Initialize TikTok Pixel
  useEffect(() => {
    if (!config?.tiktokEnabled || !config?.tiktokPixelId) return;
    if (typeof window === 'undefined') return;

    if (!window.ttq) {
      /* eslint-disable */
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t: any) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
            ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e: any, n: any) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          (ttq._i = ttq._i || {}),
            (ttq._i[e] = []),
            (ttq._i[e]._u = i),
            (ttq._t = ttq._t || {}),
            (ttq._t[e] = +new Date()),
            (ttq._o = ttq._o || {}),
            (ttq._o[e] = n || {});
          var o = document.createElement('script');
          (o.type = 'text/javascript'), (o.async = !0), (o.src = i + '?sdkid=' + e + '&lib=' + t);
          var a = document.getElementsByTagName('script')[0];
          a?.parentNode?.insertBefore(o, a);
        };
      })(window, document, 'ttq');
      /* eslint-enable */
    }

    if (window.ttq) {
      window.ttq.load(config.tiktokPixelId);
      window.ttq.page();
    }
  }, [config?.tiktokEnabled, config?.tiktokPixelId]);

  // 5. Initialize Google Analytics 4 (GA4)
  useEffect(() => {
    if (!config?.googleEnabled || !config?.googleAnalyticsId) return;
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      config.googleAnalyticsId
    )}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', config.googleAnalyticsId);
  }, [config?.googleEnabled, config?.googleAnalyticsId]);

  // 6. Track PageView & Auto Record Real Event to Database
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname || pathname === lastTrackedPathRef.current) return;
    lastTrackedPathRef.current = pathname;

    // Client-side pixels
    if (config?.facebookEnabled && window.fbq) {
      window.fbq('track', 'PageView');
    }
    if (config?.tiktokEnabled && window.ttq) {
      window.ttq.page();
    }
    if (config?.googleEnabled && window.gtag && config.googleAnalyticsId) {
      window.gtag('event', 'page_view', { page_path: pathname });
    }

    // Record real PageView event into MongoDB
    const utmData = getStoredUtm();
    apiFetch('/api/tracking/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'PageView',
        eventId: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        eventSourceUrl: window.location.href,
        userData: utmData,
        customData: {},
      }),
    }).catch(() => {});
  }, [pathname, config]);

  // 7. Global Event Listener for E-commerce actions (AddToCart, Purchase, ViewContent)
  useEffect(() => {
    const handleCustomTracking = async (e: CustomEvent) => {
      const { eventName, eventId, customData, userData } = e.detail || {};
      if (!eventName) return;

      const evtId = eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const utmData = { ...getStoredUtm(), ...(userData || {}) };

      // Client-side Facebook Pixel
      if (config?.facebookEnabled && window.fbq) {
        window.fbq('track', eventName, customData || {}, { eventID: evtId });
      }

      // Client-side TikTok Pixel
      if (config?.tiktokEnabled && window.ttq) {
        window.ttq.track(eventName, customData || {}, { event_id: evtId });
      }

      // Client-side Google Analytics
      if (config?.googleEnabled && window.gtag) {
        window.gtag('event', eventName, customData || {});
      }

      // Record Real Event in MongoDB & Dispatch Server CAPI
      try {
        await apiFetch('/api/tracking/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName,
            eventId: evtId,
            eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
            customData,
            userData: utmData,
          }),
        });
      } catch (capiErr) {
        console.warn('Tracking dispatch error:', capiErr);
      }
    };

    window.addEventListener('shopbig-track-event' as any, handleCustomTracking as any);
    return () => {
      window.removeEventListener('shopbig-track-event' as any, handleCustomTracking as any);
    };
  }, [config]);

  return null;
}
