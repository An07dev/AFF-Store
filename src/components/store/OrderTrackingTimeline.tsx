'use client';

import React, { useState, useEffect } from 'react';
import {
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiPackage,
  FiList,
  FiMap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import type { UnifiedTrackingResult } from '@/lib/shipping/unifiedTracker';
import OrderTrackingMap from './OrderTrackingMap';
import styles from './OrderTrackingTimeline.module.css';

interface OrderTrackingTimelineProps {
  orderCode?: string;
  trackingCode?: string;
  carrier?: string;
  initialData?: UnifiedTrackingResult;
  embedded?: boolean;
}

export default function OrderTrackingTimeline({
  orderCode,
  trackingCode,
  carrier,
  initialData,
  embedded = true,
}: OrderTrackingTimelineProps) {
  const [data, setData] = useState<UnifiedTrackingResult | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');

  const fetchTracking = async () => {
    const code = trackingCode || orderCode;
    if (!code) return;

    setLoading(true);
    try {
      const res = await apiFetch(`/api/shipping/track?code=${encodeURIComponent(code)}&carrier=${encodeURIComponent(carrier || '')}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast.error(json.message || 'Không thể tải hành trình đơn hàng');
      }
    } catch (e) {
      toast.error('Lỗi kết nối khi tra cứu hành trình');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData && (orderCode || trackingCode)) {
      fetchTracking();
    }
  }, [orderCode, trackingCode, carrier]);

  const handleCopyCode = () => {
    if (!data?.trackingCode) return;
    navigator.clipboard.writeText(data.trackingCode);
    setCopied(true);
    toast.success('Đã sao chép mã vận đơn!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className={embedded ? styles.embeddedWrap : styles.trackingCard} style={{ textAlign: 'center', padding: '24px 16px' }}>
        <FiRefreshCw className="animate-spin" size={22} style={{ color: 'var(--primary, #3b82f6)', margin: '0 auto 10px' }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
          Đang đồng bộ hành trình bưu kiện...
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getCarrierBadgeClass = () => {
    switch (data.carrierCode) {
      case 'ghn': return styles.carrierGHN;
      case 'ghtk': return styles.carrierGHTK;
      case 'viettelpost': return styles.carrierVTP;
      default: return styles.carrierStandard;
    }
  };

  return (
    <div className={embedded ? styles.embeddedWrap : styles.trackingCard}>
      {/* 1. Carrier Action & Status Bar */}
      <div className={styles.carrierActionBar}>
        <div className={styles.carrierLeftCol}>
          <div className={`${styles.carrierBadge} ${getCarrierBadgeClass()}`}>
            <FiTruck size={13} />
            <span>{data.carrierName}</span>
          </div>

          <div className={styles.waybillWrap}>
            <span className={styles.waybillLabel}>Mã vận đơn:</span>
            <span className={styles.waybillCode}>{data.trackingCode}</span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={handleCopyCode}
              title="Sao chép mã vận đơn"
            >
              {copied ? <FiCheck size={13} style={{ color: '#10b981' }} /> : <FiCopy size={13} />}
            </button>
          </div>
        </div>

        <div className={styles.carrierRightCol}>
          {data.isLive ? (
            <div className={styles.liveTag} title="Dữ liệu kết nối trực tiếp từ cổng API của hãng vận chuyển">
              <span className={styles.pulseDot}></span>
              <span>API Trực Tiếp ({data.carrierCode.toUpperCase()})</span>
            </div>
          ) : (
            <div className={styles.simTag} title="Hành trình được đồng bộ theo thời gian thực của đơn hàng">
              <span className={styles.pulseDot}></span>
              <span>Đồng Bộ Tự Động</span>
            </div>
          )}

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={fetchTracking}
            title="Làm mới hành trình"
          >
            <FiRefreshCw size={12} />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* 2. View Switcher Tabs (Timeline vs Roadmap) */}
      <div className={styles.viewSwitchWrap}>
        <button
          type="button"
          className={`${styles.switchTabBtn} ${activeTab === 'timeline' ? styles.switchTabActive : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <FiList size={14} />
          <span>Lịch Trình Chi Tiết</span>
        </button>

        <button
          type="button"
          className={`${styles.switchTabBtn} ${activeTab === 'map' ? styles.switchTabActive : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <FiMap size={14} />
          <span>Roadmap</span>
        </button>
      </div>

      {/* 3. Content View Tab 1: Vertical Timeline */}
      {activeTab === 'timeline' && (
        <div className={styles.timelineList}>
          {data.timeline.map((step, idx) => {
            const isCurrent = step.status === 'current';
            const isCompleted = step.status === 'completed';

            return (
              <div
                key={idx}
                className={`${styles.timelineItem} ${isCurrent ? styles.itemCurrent : ''} ${isCompleted ? styles.itemCompleted : ''}`}
              >
                <div className={styles.nodeIcon}>
                  {isCompleted ? <FiCheck size={10} /> : <FiClock size={10} />}
                </div>

                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{step.title}</span>
                  <span className={styles.itemTime}>{step.time}</span>
                </div>

                <div className={styles.itemDesc}>{step.desc}</div>

                {step.location && (
                  <div className={styles.itemLocation}>
                    <FiMapPin size={11} />
                    <span>{step.location}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Content View Tab 2: Interactive Leaflet Roadmap */}
      {activeTab === 'map' && (
        <OrderTrackingMap
          routePoints={data.routePoints || []}
          carrierName={data.carrierName}
          trackingCode={data.trackingCode}
        />
      )}
    </div>
  );
}
