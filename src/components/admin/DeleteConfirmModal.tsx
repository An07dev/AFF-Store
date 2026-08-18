'use client';

import React from 'react';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemTitle?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = 'Xác Nhận Xóa Sản Phẩm',
  message = 'Hành động này sẽ xóa hoàn toàn dữ liệu sản phẩm khỏi hệ thống và không thể khôi phục lại.',
  itemTitle,
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Warning Icon */}
        <div className={styles.iconWrapper}>
          <FiAlertTriangle />
        </div>

        {/* Title & Message */}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>
          {message}
          {itemTitle && (
            <span className={styles.highlightItem}>
              &ldquo;{itemTitle}&rdquo;
            </span>
          )}
        </p>

        {/* Warning Note */}
        <div className={styles.warningBox}>
          ⚠️ <strong>Lưu ý:</strong> Tất cả các liên kết đơn hàng, giỏ hàng liên quan có thể bị ảnh hưởng.
        </div>

        {/* Buttons */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <FiTrash2 /> {isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
