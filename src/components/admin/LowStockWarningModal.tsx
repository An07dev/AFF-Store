'use client';

import React from 'react';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import styles from './LowStockWarningModal.module.css';

export interface ILowStockItem {
  productName: string;
  productImage: string;
  variantTitle?: string;
  orderedQuantity: number;
  availableStock: number;
  deficit: number;
}

interface LowStockWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderCode?: string;
  items: ILowStockItem[];
  loading?: boolean;
}

export default function LowStockWarningModal({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  items,
  loading = false,
}: LowStockWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.warningIconWrap}>
            <FiAlertTriangle size={24} />
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>Cảnh Báo Tồn Kho Không Đủ</h3>
            <p className={styles.subtitle}>
              Đơn hàng {orderCode ? <strong>#{orderCode}</strong> : ''} có sản phẩm vượt quá số lượng tồn kho thực tế hiện tại.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sản phẩm / Phân loại</th>
                  <th style={{ width: 85, textAlign: 'center' }}>Đặt mua</th>
                  <th style={{ width: 95, textAlign: 'center' }}>Tồn kho</th>
                  <th style={{ width: 85, textAlign: 'center' }}>Thiếu</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={it.productImage || '/file.svg'}
                          alt={it.productName}
                          className={styles.productThumb}
                        />
                        <div>
                          <div className={styles.productName}>{it.productName}</div>
                          {it.variantTitle && (
                            <div className={styles.variantTag}>
                              Phân loại: <strong>{it.variantTitle}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{it.orderedQuantity}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={styles.stockBadgeRed}>{it.availableStock}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={styles.deficitBadge}>-{it.deficit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.noteBox}>
            💡 <strong>Lưu ý:</strong> Bạn vẫn có thể chọn <strong>"Vẫn Duyệt Đơn"</strong> nếu hàng sắp về (bán âm/pre-order) hoặc bấm <strong>"Quay lại kiểm tra"</strong> để liên hệ khách đổi sang mẫu khác.
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Quay lại kiểm tra
          </button>
          <button
            type="button"
            className={styles.forceConfirmBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            <FiCheck size={16} />
            {loading ? 'Đang duyệt...' : 'Vẫn Duyệt Đơn Này'}
          </button>
        </div>
      </div>
    </div>
  );
}
