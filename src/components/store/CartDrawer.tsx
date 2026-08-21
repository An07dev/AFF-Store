'use client';

import React from 'react';
import Link from 'next/link';
import { FiX, FiTrash2, FiShoppingBag, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, updateQuantity, removeFromCart, totalAmount, setCheckoutItems } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeDrawer}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Giỏ hàng của bạn ({items.length})</h3>
          <button className={styles.closeBtn} onClick={closeDrawer}>
            <FiX />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <FiShoppingBag className={styles.emptyIcon} />
              <p>Giỏ hàng đang trống</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item._id || idx} className={styles.cartItem}>
                <img
                  src={item.image || '/file.svg'}
                  alt={item.name}
                  className={styles.itemImg}
                />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  {item.variant?.name && (
                    <span className={styles.itemVariant}>{item.variant.name}</span>
                  )}
                  <span className={styles.itemPrice}>
                    {formatPrice((item.variant?.price || item.price) * item.quantity)}
                  </span>
                </div>

                <div className={styles.quantityControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item._id || idx, item.quantity - 1)}
                  >
                    <FiMinus />
                  </button>
                  <span className={styles.qtyVal}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item._id || idx, item.quantity + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item._id || idx)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Tổng tiền tạm tính:</span>
              <span className={styles.totalPrice}>{formatPrice(totalAmount)}</span>
            </div>
            <Link
              href="/checkout"
              className={styles.checkoutBtn}
              onClick={() => {
                setCheckoutItems(items);
                closeDrawer();
              }}
            >
              Tiến hành thanh toán
            </Link>
            <Link href="/cart" className={styles.viewCartBtn} onClick={closeDrawer}>
              Xem chi tiết giỏ hàng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}