'use client';

import React, { useState } from 'react';
import { FiSave, FiShare2, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function MarketingPage() {
  const [marketingConfig, setMarketingConfig] = useState({
    facebookPixelId: '123456789012345',
    facebookAccessToken: 'EAABsbCS1i8kBA...',
    tiktokPixelId: 'C7ABCDE123456789',
    tiktokAccessToken: 'tt_app_token_99...',
    googleAnalyticsId: 'G-XYZ1234567',
  });

  const handleSaveTracking = () => {
    toast.success('Cập nhật cấu hình Marketing & Tracking Pixel thành công!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Marketing & Tracking Pixels</h1>
        <button className={styles.saveBtn} onClick={handleSaveTracking}>
          <FiSave /> Lưu Cấu Hình Pixel
        </button>
      </div>

      {/* Facebook Pixel */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiShare2 style={{ color: '#3b82f6' }} />
            <span>Facebook Pixel & Conversions API (CAPI)</span>
          </div>
        </h3>
        <div className={styles.gridTwo}>
          <div className={styles.inputGroup}>
            <label>Pixel ID</label>
            <input
              type="text"
              className={styles.input}
              value={marketingConfig.facebookPixelId}
              onChange={(e) =>
                setMarketingConfig({ ...marketingConfig, facebookPixelId: e.target.value })
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Conversions API Token</label>
            <input
              type="password"
              className={styles.input}
              value={marketingConfig.facebookAccessToken}
              onChange={(e) =>
                setMarketingConfig({ ...marketingConfig, facebookAccessToken: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* TikTok Pixel */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTarget style={{ color: '#ec4899' }} />
            <span>TikTok Pixel & Events API</span>
          </div>
        </h3>
        <div className={styles.gridTwo}>
          <div className={styles.inputGroup}>
            <label>TikTok Pixel ID</label>
            <input
              type="text"
              className={styles.input}
              value={marketingConfig.tiktokPixelId}
              onChange={(e) =>
                setMarketingConfig({ ...marketingConfig, tiktokPixelId: e.target.value })
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <label>TikTok Events API Access Token</label>
            <input
              type="password"
              className={styles.input}
              value={marketingConfig.tiktokAccessToken}
              onChange={(e) =>
                setMarketingConfig({ ...marketingConfig, tiktokAccessToken: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Google Analytics 4 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTarget style={{ color: '#f59e0b' }} />
            <span>Google Analytics 4 (GA4)</span>
          </div>
        </h3>
        <div className={styles.inputGroup}>
          <label>Measurement ID (G-XXXXXXXXXX)</label>
          <input
            type="text"
            className={styles.input}
            value={marketingConfig.googleAnalyticsId}
            onChange={(e) =>
              setMarketingConfig({ ...marketingConfig, googleAnalyticsId: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
