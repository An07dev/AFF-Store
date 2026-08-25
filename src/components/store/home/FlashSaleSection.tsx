'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiClock, FiZap, FiArrowRight } from 'react-icons/fi';
import styles from '@/app/(store)/page.module.css';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
}

function calcDiscount(price: number, salePrice: number) {
  if (!price || !salePrice || price <= salePrice) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

interface FlashSaleCountdownProps {
  slots?: any[];
}

// Subcomponent that isolates the 1000ms tick to ONLY 3 digital numbers
const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = memo(({ slots }) => {
  const [countdown, setCountdown] = useState({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!slots || slots.length === 0) return;

    const updateTimer = () => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const curSec = now.getSeconds();
      const currentTotalMinutes = curHour * 60 + curMin;

      const activeSlot = slots.find((s: any) => {
        if (!s.startTime || !s.endTime) return false;
        const [sh, sm] = s.startTime.split(':').map((n: string) => parseInt(n, 10) || 0);
        const [eh, em] = s.endTime.split(':').map((n: string) => parseInt(n, 10) || 0);
        const startTotal = sh * 60 + (sm || 0);
        const endTotal = eh * 60 + (em || 0);
        return currentTotalMinutes >= startTotal && currentTotalMinutes < endTotal;
      });

      if (activeSlot) {
        const [eh, em] = activeSlot.endTime.split(':').map((n: string) => parseInt(n, 10) || 0);
        const endTotalSeconds = eh * 3600 + (em || 0) * 60;
        const curTotalSeconds = curHour * 3600 + curMin * 60 + curSec;
        const diffSeconds = Math.max(0, endTotalSeconds - curTotalSeconds);

        const h = String(Math.floor(diffSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((diffSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(diffSeconds % 60).padStart(2, '0');
        setCountdown({ hours: h, minutes: m, seconds: s });
      } else {
        setCountdown({ hours: '00', minutes: '00', seconds: '00' });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [slots]);

  return (
    <div className={styles.flashCountdownBox}>
      <div className={styles.countdownTimer}>
        <span className={styles.countdownDigit}>{countdown.hours}</span>
        <span className={styles.countdownColon}>:</span>
        <span className={styles.countdownDigit}>{countdown.minutes}</span>
        <span className={styles.countdownColon}>:</span>
        <span className={styles.countdownDigit}>{countdown.seconds}</span>
      </div>
    </div>
  );
});

FlashSaleCountdown.displayName = 'FlashSaleCountdown';

interface FlashSaleSectionProps {
  flashSaleConfig: any;
  onSeeAll: () => void;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

const FlashSaleSectionComponent: React.FC<FlashSaleSectionProps> = ({
  flashSaleConfig,
  onSeeAll,
  sectionRef,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (flashSaleConfig?.activeSlot?.id) {
      setSelectedSlotId(flashSaleConfig.activeSlot.id);
    } else if (flashSaleConfig?.slots?.[0]?.id) {
      setSelectedSlotId(flashSaleConfig.slots[0].id);
    }
  }, [flashSaleConfig?.activeSlot?.id, flashSaleConfig?.slots]);

  const hasFlashContent = Boolean(
    flashSaleConfig &&
    flashSaleConfig.isActive &&
    (
      (flashSaleConfig.slots && flashSaleConfig.slots.some((s: any) => s.items && s.items.length > 0)) ||
      (flashSaleConfig.items && flashSaleConfig.items.length > 0)
    )
  );

  if (!hasFlashContent) return null;

  const selectedSlot = flashSaleConfig?.slots?.find((s: any) => s.id === selectedSlotId);
  const isLiveSlot = selectedSlot
    ? selectedSlot.status === 'live' || flashSaleConfig.activeSlot?.id === selectedSlot.id
    : true;
  const isUpcomingSlot = !isLiveSlot && selectedSlot?.status === 'upcoming';
  const isPassedSlot = !isLiveSlot && (selectedSlot?.status === 'passed' || selectedSlot?.status === 'ended');

  const itemsToRender =
    selectedSlot && selectedSlot.items && selectedSlot.items.length > 0
      ? selectedSlot.items
      : flashSaleConfig?.items && flashSaleConfig.items.length > 0
        ? flashSaleConfig.items
        : [];

  return (
    <div ref={sectionRef} className={styles.flashSaleSection}>
      <div className={styles.flashHeader}>
        {/* Top Bar: Brand Logo + Countdown Clock + "Xem tất cả" Pill Button */}
        <div className={styles.flashHeaderTop}>
          <div className={styles.flashTitleGroup}>
            <span className={styles.flashLogo}>
              ⚡ FLASH SALE
            </span>
            <FlashSaleCountdown slots={flashSaleConfig.slots} />
          </div>

          <button
            type="button"
            className={styles.seeAllBtn}
            onClick={onSeeAll}
          >
            <span>Xem tất cả</span>
            <FiChevronRight size={12} />
          </button>
        </div>

        {/* Campaign Tagline / Subtitle Banner (Customized from Admin) */}
        {(flashSaleConfig.title || flashSaleConfig.subtitle) && (
          <div className={styles.flashCampaignBanner}>
            {flashSaleConfig.title && (
              <span className={styles.flashCampaignTitle}>
                {flashSaleConfig.title}
              </span>
            )}
            {flashSaleConfig.subtitle && (
              <span className={styles.flashCampaignSubtitle}>
                {flashSaleConfig.title ? '• ' : ''}{flashSaleConfig.subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Time Slots Selector Tabs (Shopee Style) */}
      {flashSaleConfig?.slots && flashSaleConfig.slots.length > 0 && (
        <div className={styles.flashSlotTabs}>
          {flashSaleConfig.slots.map((slot: any) => {
            const isSelected = selectedSlotId === slot.id;
            const isLive = slot.status === 'live' || flashSaleConfig.activeSlot?.id === slot.id;
            const statusText = isLive
              ? '🔥 Đang diễn ra'
              : slot.status === 'passed'
                ? 'Đã qua'
                : 'Sắp diễn ra';

            return (
              <div
                key={slot.id}
                className={`${styles.flashSlotTab} ${isSelected ? styles.flashSlotTabActive : ''}`}
                onClick={() => setSelectedSlotId(slot.id)}
              >
                <span className={styles.slotTime}>
                  {slot.startTime || '12:00'} - {slot.endTime || '18:00'}
                </span>
                <span className={styles.slotStatus}>
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Slot Status Notice & Carousel */}
      {(() => {
        if (isUpcomingSlot) {
          return (
            <div className={styles.slotUpcomingBox}>
              <div className={styles.slotUpcomingIconCircle}>
                <FiClock size={22} />
              </div>
              <div className={styles.slotNoticeBody}>
                <div className={styles.slotNoticeHeadRow}>
                  <span className={styles.slotUpcomingTag}>Sắp mở bán</span>
                  <span className={styles.slotNoticeTimeText}>
                    {selectedSlot?.startTime || '00:00'} - {selectedSlot?.endTime || '00:00'}
                  </span>
                </div>
                <p className={styles.slotNoticeMessage}>
                  Khung giờ này sắp diễn ra với mức giá ưu đãi cực sốc. Hãy chuẩn bị sẵn sàng và quay lại đúng giờ để săn deal bạn nhé!
                </p>
              </div>
            </div>
          );
        }

        if (isPassedSlot) {
          const liveSlot = flashSaleConfig?.slots?.find(
            (s: any) => s.status === 'live' || flashSaleConfig.activeSlot?.id === s.id
          );

          return (
            <div className={styles.slotPassedBox}>
              <div className={styles.slotPassedIconCircle}>
                <FiClock size={22} />
              </div>
              <div className={styles.slotNoticeBody}>
                <div className={styles.slotNoticeHeadRow}>
                  <span className={styles.slotPassedTag}>Khung giờ đã kết thúc</span>
                  <span className={styles.slotNoticeTimeText}>
                    {selectedSlot?.startTime || '00:00'} - {selectedSlot?.endTime || '00:00'}
                  </span>
                </div>
                <p className={styles.slotNoticeMessage}>
                  Ưu đãi Flash Sale cho khung giờ này đã khép lại. Vui lòng chọn khung giờ đang diễn ra để không bỏ lỡ các deal giảm giá cực sốc!
                </p>
                {liveSlot && (
                  <button
                    type="button"
                    className={styles.slotSwitchActionBtn}
                    onClick={() => setSelectedSlotId(liveSlot.id)}
                  >
                    <FiZap size={14} className={styles.flashIconPulse} />
                    <span>Săn deal khung giờ đang diễn ra ({liveSlot.startTime} - {liveSlot.endTime})</span>
                    <FiArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        }

        // LIVE SLOT: Render products with Flash Price & Fire progress bar
        if (itemsToRender.length === 0) {
          return (
            <div className={styles.slotEmptyBox}>
              <div className={styles.slotEmptyIconCircle}>
                <FiClock size={22} />
              </div>
              <div className={styles.slotNoticeBody}>
                <div className={styles.slotNoticeHeadRow}>
                  <span className={styles.slotEmptyTag}>Đang cập nhật</span>
                </div>
                <p className={styles.slotNoticeMessage}>
                  Sản phẩm trong khung giờ này đang được chuẩn bị và cập nhật, bạn vui lòng quay lại sau ít phút nhé!
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className={styles.flashCarousel}>
            {itemsToRender.map((item: any, i: number) => {
              const originalPrice = item.originalPrice || item.price || 0;
              const salePrice = item.flashPrice || item.salePrice || item.price || 0;
              const discount =
                item.discountPercent ||
                (originalPrice > salePrice ? calcDiscount(originalPrice, salePrice) : 0);
              const soldPercent = item.soldPercent || Math.min(95, Math.max(25, ((i + 3) * 18) % 100));
              const soldText = item.soldCount ? `Đã bán ${item.soldCount}` : 'Đang bán chạy';

              return (
                <Link
                  href={`/product/${item.slug}`}
                  key={item._id || i}
                  className={styles.flashCard}
                >
                  <div className={styles.flashImgWrap}>
                    <img
                      src={
                        item.image ||
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'
                      }
                      alt={item.name || ''}
                      className={styles.flashImg}
                      loading="lazy"
                      decoding="async"
                    />
                    {discount > 0 && (
                      <div className={styles.shopeeDiscountFlag}>
                        -{discount}%
                      </div>
                    )}
                  </div>
                  <div className={styles.flashInfo}>
                    <div className={styles.flashPrice} style={{ color: '#f97316' }}>
                      {formatPrice(salePrice)}
                    </div>
                    {originalPrice > salePrice && (
                      <div className={styles.flashOldPrice}>
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                    <div className={styles.fireProgressBar}>
                      <div
                        className={styles.fireFill}
                        style={{ width: `${soldPercent}%` }}
                      />
                      <span className={styles.fireText}>
                        🔥 {soldText}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export const FlashSaleSection = memo(FlashSaleSectionComponent);
export default FlashSaleSection;
