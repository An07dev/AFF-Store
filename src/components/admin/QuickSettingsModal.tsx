'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './QuickSettingsModal.module.css';

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSettingsModal({ isOpen, onClose }: QuickSettingsModalProps) {
  const [siteTitle, setSiteTitle] = useState('ShopBig');
  const [hotline, setHotline] = useState('1900 6868');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã lưu cấu hình nhanh!');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Cài đặt nhanh cửa hàng</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Tên cửa hàng</label>
            <input
              type="text"
              className={styles.input}
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Hotline CSKH</label>
            <input
              type="text"
              className={styles.input}
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.saveBtn}>
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}