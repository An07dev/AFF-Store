'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiZap,
  FiSave,
  FiExternalLink,
  FiPlus,
  FiTrash2,
  FiClock,
  FiTrendingUp,
  FiShoppingBag,
  FiCheckCircle,
  FiAlertCircle,
  FiSliders,
  FiPercent,
  FiBell,
  FiEye,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import AdminLoading from '@/components/admin/AdminLoading';
import ProductSelectModal from '@/components/admin/ProductSelectModal';
import styles from './page.module.css';

export default function AdminFlashSalePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Campaign Config State
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState('⚡ SIÊU SALE GIỜ VÀNG - GIẢM TỚI 50%');
  const [subtitle, setSubtitle] = useState('Săn deal chớp nhoáng • Số lượng có hạn • Giá rẻ vô địch');
  const [campaignType, setCampaignType] = useState<'daily_slots' | 'custom_range'>('daily_slots');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Daily Slots
  const [slots, setSlots] = useState([
    { id: 'slot_1', startHour: 0, startMinute: 0, endHour: 9, endMinute: 0, label: '00:00 - 09:00', enabled: true },
    { id: 'slot_2', startHour: 9, startMinute: 0, endHour: 12, endMinute: 0, label: '09:00 - 12:00', enabled: true },
    { id: 'slot_3', startHour: 12, startMinute: 0, endHour: 18, endMinute: 0, label: '12:00 - 18:00', enabled: true },
    { id: 'slot_4', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, label: '18:00 - 21:00', enabled: true },
    { id: 'slot_5', startHour: 21, startMinute: 0, endHour: 24, endMinute: 0, label: '21:00 - 24:00', enabled: true },
  ]);

  // Flash Sale Items
  const [items, setItems] = useState<any[]>([]);

  // FOMO Settings
  const [fomoSettings, setFomoSettings] = useState({
    enableLivePurchasePopup: true,
    popupIntervalSeconds: 25,
    enableCheckoutTimer: true,
    checkoutTimerMinutes: 15,
    enableViewerCount: true,
  });

  // Current Live Info
  const [activeSlotLabel, setActiveSlotLabel] = useState('');
  const [countdownText, setCountdownText] = useState('00:00:00');

  // Load Config from API
  const loadFlashSale = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/flash-sale');
      const data = await res.json();
      if (data.success && data.data) {
        const fs = data.data;
        setIsActive(fs.isActive !== undefined ? fs.isActive : true);
        setTitle(fs.title || '');
        setSubtitle(fs.subtitle || '');
        setCampaignType(fs.type || 'daily_slots');
        if (fs.slots && fs.slots.length > 0) setSlots(fs.slots);
        if (fs.items) {
          setItems(
            fs.items.map((it: any) => ({
              _id: it._id,
              productId: it.productId?._id || it.productId,
              product: it.productId || {},
              originalPrice: it.originalPrice || it.productId?.price || 0,
              flashPrice: it.flashPrice || Math.round((it.originalPrice || 0) * 0.7),
              discountPercent: it.discountPercent || 30,
              flashStock: it.flashStock || 50,
              soldCount: it.soldCount || 0,
              isActive: it.isActive !== undefined ? it.isActive : true,
            }))
          );
        }
        if (fs.fomoSettings) setFomoSettings(fs.fomoSettings);
        if (fs.startTime) setStartTime(fs.startTime.substring(0, 16));
        if (fs.endTime) setEndTime(fs.endTime.substring(0, 16));
      }
    } catch (err) {
      console.error('Error loading Flash Sale config:', err);
      toast.error('Lỗi khi tải cấu hình Flash Sale');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashSale();
  }, []);

  // Update Live Countdown Timer for preview
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const curSec = now.getSeconds();
      const totalMinutes = curHour * 60 + curMin;

      const activeSlot = slots.find(
        (s) => s.enabled && totalMinutes >= s.startHour * 60 && totalMinutes < s.endHour * 60
      );

      if (activeSlot) {
        setActiveSlotLabel(activeSlot.label);
        const endTotalSeconds = activeSlot.endHour * 3600 + (activeSlot.endMinute || 0) * 60;
        const curTotalSeconds = curHour * 3600 + curMin * 60 + curSec;
        const diffSeconds = Math.max(0, endTotalSeconds - curTotalSeconds);

        const hrs = Math.floor(diffSeconds / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);
        const secs = diffSeconds % 60;
        setCountdownText(
          `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      } else {
        setActiveSlotLabel('Ngoài khung giờ');
        setCountdownText('--:--:--');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [slots]);

  // Slot toggle handler
  const handleToggleSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Add Products handler
  const handleAddProducts = (newProducts: any[]) => {
    const newItems = newProducts.map((p) => {
      const origPrice = p.price || 0;
      const discount = 35;
      const fPrice = Math.round((origPrice * (100 - discount)) / 100000) * 1000;
      return {
        productId: p._id,
        product: p,
        originalPrice: origPrice,
        flashPrice: fPrice > 0 ? fPrice : Math.round(origPrice * 0.65),
        discountPercent: discount,
        flashStock: Math.max(20, Math.min(100, p.stock || 50)),
        soldCount: Math.floor(Math.random() * 12) + 5,
        isActive: true,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    toast.success(`Đã thêm ${newProducts.length} sản phẩm vào Flash Sale`);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field
  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'discountPercent') {
        const pct = Math.max(0, Math.min(99, Number(value) || 0));
        target.discountPercent = pct;
        target.flashPrice = Math.round((target.originalPrice * (100 - pct)) / 100000) * 1000;
      } else if (field === 'flashPrice') {
        const price = Math.max(0, Number(value) || 0);
        target.flashPrice = price;
        target.discountPercent =
          target.originalPrice > 0
            ? Math.max(0, Math.round(((target.originalPrice - price) / target.originalPrice) * 100))
            : 0;
      } else {
        target[field] = value;
      }

      updated[index] = target;
      return updated;
    });
  };

  // Save all settings to API
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        title,
        subtitle,
        isActive,
        type: campaignType,
        slots,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        items: items.map((it) => ({
          productId: it.productId,
          originalPrice: it.originalPrice,
          flashPrice: it.flashPrice,
          discountPercent: it.discountPercent,
          flashStock: it.flashStock,
          soldCount: it.soldCount,
          isActive: it.isActive,
        })),
        fomoSettings,
      };

      const res = await apiFetch('/api/admin/flash-sale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Đã lưu cấu hình Flash Sale & FOMO thành công!');
        loadFlashSale();
      } else {
        toast.error(data.message || 'Lỗi lưu cấu hình');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading text="Đang tải cấu hình Flash Sale..." />;

  const totalSold = items.reduce((sum, it) => sum + (Number(it.soldCount) || 0), 0);
  const totalStock = items.reduce((sum, it) => sum + (Number(it.flashStock) || 0), 0);
  const soldOutPercent = totalStock > 0 ? Math.round((totalSold / totalStock) * 100) : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <FiZap style={{ color: '#f97316' }} /> Quản Trị Flash Sale & FOMO Engine
          </h1>
          <p className={styles.subtitle}>
            Tự động chạy khung giờ vàng, thanh tiến độ cháy hàng và đồng hồ đếm ngược kích thích mua hàng
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/?tab=products&filter=flash-sale" target="_blank" className={styles.btnPreviewWeb}>
            <FiEye /> Xem ngoài Web <FiExternalLink size={12} />
          </Link>
          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave /> {saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
          </button>
        </div>
      </div>

      {/* Live Status Banner */}
      <div
        className={`${styles.statusBanner} ${
          isActive ? styles.statusBannerLive : styles.statusBannerInactive
        }`}
      >
        <div className={styles.statusIndicator}>
          {isActive && <div className={styles.pulseDot} />}
          <span className={styles.statusText}>
            Trạng thái Flash Sale:{' '}
            <strong style={{ color: isActive ? '#f97316' : '#9ca3af' }}>
              {isActive ? `🟢 ĐANG BẬT (${activeSlotLabel})` : '⚪ ĐANG TẮT'}
            </strong>
          </span>
        </div>

        {isActive && (
          <div className={styles.countdownDisplay}>
            <span>Kết thúc slot sau:</span>
            <span className={styles.countdownTimer}>{countdownText}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Sản Phẩm Trong Flash Sale</span>
          <span className={styles.statValue} style={{ color: '#38bdf8' }}>
            {items.filter((i) => i.isActive).length} / {items.length} món
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tổng Suất Bán Giới Hạn</span>
          <span className={styles.statValue}>{totalStock} suất</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tiến Độ Cháy Hàng (Sold)</span>
          <span className={styles.statValue} style={{ color: '#f97316' }}>
            🔥 {totalSold} ({soldOutPercent}%)
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Thời Lượng Đồng Hồ Checkout</span>
          <span className={styles.statValue} style={{ color: '#10b981' }}>
            {fomoSettings.checkoutTimerMinutes} phút
          </span>
        </div>
      </div>

      {/* 1. Campaign Settings Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiSliders style={{ color: '#f97316' }} /> Cấu Hình Chiến Dịch Flash Sale
          </div>
          <div className={styles.toggleWrapper} onClick={() => setIsActive(!isActive)}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isActive ? '#f97316' : '#9ca3af' }}>
              {isActive ? 'BẬT Flash Sale' : 'TẮT Flash Sale'}
            </span>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Tiêu đề hiển thị ngoài trang chủ:</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="⚡ SIÊU SALE GIỜ VÀNG - GIẢM TỚI 50%"
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Mô tả phụ (Subtitle):</label>
            <input
              type="text"
              className={styles.input}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Săn deal chớp nhoáng • Số lượng có hạn..."
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Chế độ chạy Flash Sale:</label>
            <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="campaignType"
                  value="daily_slots"
                  checked={campaignType === 'daily_slots'}
                  onChange={() => setCampaignType('daily_slots')}
                  style={{ accentColor: '#f97316', width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 600 }}>
                  ⚡ Khung Giờ Vàng Hàng Ngày (Tự động lặp lại Shopee Style)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="campaignType"
                  value="custom_range"
                  checked={campaignType === 'custom_range'}
                  onChange={() => setCampaignType('custom_range')}
                  style={{ accentColor: '#f97316', width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 600 }}>
                  📅 Sự Kiện Cố Định Theo Ngày (VD: Siêu Sale 9.9, Black Friday)
                </span>
              </label>
            </div>
          </div>

          {campaignType === 'daily_slots' ? (
            <div className={styles.formGroupFull}>
              <label className={styles.label}>Các Khung Giờ Hoạt Động (Slots):</label>
              <div className={styles.slotsGrid}>
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className={`${styles.slotCard} ${s.enabled ? styles.slotCardActive : ''}`}
                    onClick={() => handleToggleSlot(s.id)}
                  >
                    <div>
                      <div className={styles.slotLabel}>{s.label}</div>
                      <div className={styles.slotSub}>
                        {s.enabled ? '🟢 Đang kích hoạt' : '⚪ Đã tắt'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={() => handleToggleSlot(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ accentColor: '#f97316', width: 18, height: 18, cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Thời gian bắt đầu:</label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Thời gian kết thúc:</label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Flash Sale Products Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiShoppingBag style={{ color: '#38bdf8' }} /> Danh Sách Sản Phẩm Flash Sale ({items.length})
          </div>
          <button
            type="button"
            className={styles.btnAddProduct}
            onClick={() => setIsProductModalOpen(true)}
          >
            <FiPlus /> Thêm Sản Phẩm Vào Flash Sale
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted, #9ca3af)' }}>
            Chưa có sản phẩm nào trong Flash Sale. Bấm <strong>"+ Thêm Sản Phẩm"</strong> để bắt đầu.
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>Bật</th>
                  <th>Sản phẩm</th>
                  <th style={{ width: 120 }}>Giá gốc</th>
                  <th style={{ width: 110 }}>% Giảm</th>
                  <th style={{ width: 140 }}>Giá Flash Sale</th>
                  <th style={{ width: 110 }}>Suất bán</th>
                  <th style={{ width: 110 }}>Đã bán 🔥</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const prod = item.product || {};
                  return (
                    <tr key={idx} style={{ opacity: item.isActive ? 1 : 0.5 }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item.isActive}
                          onChange={(e) => handleItemChange(idx, 'isActive', e.target.checked)}
                          style={{ accentColor: '#f97316', width: 18, height: 18, cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div className={styles.tableProductCell}>
                          <img
                            src={prod.images?.[0] || '/file.svg'}
                            alt={prod.name || 'Sản phẩm'}
                            className={styles.tableThumb}
                          />
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.875rem' }}>{prod.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted, #9ca3af)' }}>
                              Tồn kho thực tế: {prod.stock || 0} cái
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--admin-text-muted, #9ca3af)' }}>
                        {formatPrice(item.originalPrice)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            className={styles.tableInput}
                            value={item.discountPercent || ''}
                            onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                            style={{ width: 65 }}
                          />
                          <span style={{ fontWeight: 700, color: '#f97316' }}>%</span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          step={1000}
                          min={0}
                          className={styles.tableInput}
                          value={item.flashPrice || ''}
                          onChange={(e) => handleItemChange(idx, 'flashPrice', e.target.value)}
                          style={{ color: '#f97316', fontWeight: 800 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className={styles.tableInput}
                          value={item.flashStock || ''}
                          onChange={(e) => handleItemChange(idx, 'flashStock', e.target.value)}
                          style={{ width: 80 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          className={styles.tableInput}
                          value={item.soldCount || ''}
                          onChange={(e) => handleItemChange(idx, 'soldCount', e.target.value)}
                          style={{ width: 80, color: '#f97316' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={styles.btnDeleteRow}
                          onClick={() => handleRemoveItem(idx)}
                          title="Xóa khỏi Flash Sale"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. FOMO & Social Proof Settings Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiBell style={{ color: '#10b981' }} /> Hiệu Ứng Tâm Lý FOMO & Social Proof
          </div>
        </div>

        <div className={styles.fomoGrid}>
          {/* Live purchase popup */}
          <div className={styles.fomoOption}>
            <div className={styles.fomoOptionHeader}>
              <span className={styles.fomoOptionTitle}>🔔 Popup "Khách vừa mua"</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={fomoSettings.enableLivePurchasePopup}
                  onChange={(e) =>
                    setFomoSettings((prev) => ({
                      ...prev,
                      enableLivePurchasePopup: e.target.checked,
                    }))
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <p className={styles.fomoOptionDesc}>
              Hiển thị thông báo nhỏ góc trái màn hình: <em>"Anh Minh (Hà Nội) vừa đặt mua 2 phút trước"</em>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted, #9ca3af)' }}>
                Tần suất lặp:
              </span>
              <input
                type="number"
                min={10}
                max={120}
                value={fomoSettings.popupIntervalSeconds}
                onChange={(e) =>
                  setFomoSettings((prev) => ({
                    ...prev,
                    popupIntervalSeconds: Number(e.target.value) || 25,
                  }))
                }
                className={styles.input}
                style={{ width: 70, padding: '4px 8px' }}
              />
              <span style={{ fontSize: '0.8125rem' }}>giây</span>
            </div>
          </div>

          {/* Checkout lock timer */}
          <div className={styles.fomoOption}>
            <div className={styles.fomoOptionHeader}>
              <span className={styles.fomoOptionTitle}>⏳ Đồng hồ giữ đơn tại Checkout</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={fomoSettings.enableCheckoutTimer}
                  onChange={(e) =>
                    setFomoSettings((prev) => ({
                      ...prev,
                      enableCheckoutTimer: e.target.checked,
                    }))
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <p className={styles.fomoOptionDesc}>
              Đếm ngược giữ ưu đãi Flash Sale trên trang `/checkout` để thôi thúc khách hoàn tất thanh toán.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted, #9ca3af)' }}>
                Thời gian giữ đơn:
              </span>
              <input
                type="number"
                min={5}
                max={60}
                value={fomoSettings.checkoutTimerMinutes}
                onChange={(e) =>
                  setFomoSettings((prev) => ({
                    ...prev,
                    checkoutTimerMinutes: Number(e.target.value) || 15,
                  }))
                }
                className={styles.input}
                style={{ width: 70, padding: '4px 8px' }}
              />
              <span style={{ fontSize: '0.8125rem' }}>phút</span>
            </div>
          </div>

          {/* Real-time viewer count */}
          <div className={styles.fomoOption}>
            <div className={styles.fomoOptionHeader}>
              <span className={styles.fomoOptionTitle}>👁️ Số người đang cùng xem</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={fomoSettings.enableViewerCount}
                  onChange={(e) =>
                    setFomoSettings((prev) => ({
                      ...prev,
                      enableViewerCount: e.target.checked,
                    }))
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <p className={styles.fomoOptionDesc}>
              Hiển thị số lượng người đang xem sản phẩm trên trang chi tiết: <em>"🔥 18 người đang xem lúc này"</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Product Select Modal */}
      <ProductSelectModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelect={handleAddProducts}
        existingProductIds={items.map((it) => it.productId)}
      />
    </div>
  );
}
