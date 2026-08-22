'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiX, FiCheckCircle } from 'react-icons/fi';
import { apiFetch } from '@/lib/api';
import styles from './FomoLiveNotification.module.css';

interface IFomoEvent {
  id: string;
  buyer: string;
  location: string;
  productName: string;
  productImage: string;
  timeAgo: string;
  quantity: number;
}

export default function FomoLiveNotification() {
  const [events, setEvents] = useState<IFomoEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<IFomoEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [intervalSec, setIntervalSec] = useState(25);

  useEffect(() => {
    async function loadFomoData() {
      try {
        // 1. Check if FlashSale FOMO is enabled
        const fsRes = await apiFetch('/api/flash-sale');
        const fsData = await fsRes.json();
        if (fsData.success && fsData.data) {
          const fomo = fsData.data.fomoSettings;
          if (fomo && !fomo.enableLivePurchasePopup) {
            return; // Disabled by admin
          }
          if (fomo?.popupIntervalSeconds) {
            setIntervalSec(fomo.popupIntervalSeconds);
          }
        }

        // 2. Load events
        const res = await apiFetch('/api/flash-sale/fomo-events');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setEvents(data.data);
        }
      } catch (err) {
        console.error('Error loading FOMO notification data:', err);
      }
    }

    loadFomoData();
  }, []);

  useEffect(() => {
    if (events.length === 0 || isDismissed) return;

    let eventIndex = 0;

    // Initial delay 4 seconds after page loads
    const initialTimeout = setTimeout(() => {
      showNextPopup();
    }, 4000);

    const showNextPopup = () => {
      if (isDismissed) return;
      const event = events[eventIndex % events.length];
      setCurrentEvent(event);
      setIsVisible(true);
      eventIndex++;

      // Hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Periodic loop every intervalSec
    const interval = setInterval(() => {
      showNextPopup();
    }, intervalSec * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [events, isDismissed, intervalSec]);

  if (!currentEvent || isDismissed) return null;

  return (
    <div
      className={`${styles.container} ${
        isVisible ? styles.slideIn : styles.slideOut
      }`}
    >
      <button
        type="button"
        className={styles.closeBtn}
        onClick={() => {
          setIsVisible(false);
          setIsDismissed(true);
        }}
        title="Đóng thông báo"
      >
        <FiX />
      </button>

      <div className={styles.avatarWrap}>
        <img
          src={currentEvent.productImage || '/file.svg'}
          alt={currentEvent.productName}
          className={styles.thumb}
        />
        <div className={styles.checkBadge}>
          <FiCheckCircle size={10} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.buyerLine}>
          <strong className={styles.buyerName}>{currentEvent.buyer}</strong>
          <span className={styles.location}>({currentEvent.location})</span>
        </div>
        <div className={styles.actionLine}>
          Đã đặt mua <strong>{currentEvent.productName}</strong>
        </div>
        <div className={styles.timeLine}>
          <FiShoppingBag size={11} /> {currentEvent.timeAgo} • Đã xác thực
        </div>
      </div>
    </div>
  );
}
