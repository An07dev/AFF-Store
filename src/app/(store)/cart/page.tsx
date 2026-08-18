'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiTruck,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice } from '@/lib/utils';
import styles from './page.module.css';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    cartCount,
    setCheckoutItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { theme } = useTheme();

  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});

  // By default, select all items if empty map
  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedItemIds[item._id || item.productId] !== false);

  const handleToggleSelectAll = () => {
    const nextState = !isAllSelected;
    const newMap: Record<string, boolean> = {};
    items.forEach((item) => {
      newMap[item._id || item.productId] = nextState;
    });
    setSelectedItemIds(newMap);
  };

  const handleToggleItem = (id: string) => {
    setSelectedItemIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const isItemSelected = (id: string) => {
    return selectedItemIds[id] !== false;
  };

  const selectedItems = items.filter((i) => isItemSelected(i._id || i.productId));
  const selectedCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);

  const selectedSubtotal = selectedItems.reduce((acc, item) => {
    const itemPrice = item.variant?.price || item.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const selectedShippingFee = selectedSubtotal >= 500000 || selectedSubtotal === 0 ? 0 : 30000;
  const selectedTotalAmount = selectedSubtotal + selectedShippingFee;

  const handleProceedCheckout = () => {
    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }
    if (selectedCount === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      return;
    }
    // Set only the selected items for checkout
    setCheckoutItems(selectedItems);
    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?')) {
      clearCart();
    }
  };

  const shopName = theme?.pageTitles?.logoText || 'ShopTik Store';

  return (
    <div className={styles.page}>
      {/* ===== FIXED TOP NAVIGATION ===== */}
      <nav className={styles.topNav}>
        <button
          className={styles.navBtn}
          onClick={() => router.back()}
          aria-label="Quay lại"
        >
          <FiChevronLeft size={22} />
        </button>

        <div className={styles.navTitle}>Giỏ hàng ({cartCount})</div>

        {items.length > 0 ? (
          <button className={styles.clearBtn} onClick={handleClearCart}>
            Xóa hết
          </button>
        ) : (
          <div style={{ width: 32 }} />
        )}
      </nav>

      {/* ===== EMPTY CART STATE ===== */}
      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <FiShoppingBag className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
          <p className={styles.emptyDesc}>
            Hãy khám phá các sản phẩm hot và thêm vào giỏ để nhận nhiều ưu đãi nhé!
          </p>
          <Link href="/" className={styles.exploreBtn}>
            Khám phá sản phẩm ngay
          </Link>
        </div>
      ) : (
        /* ===== SCROLLABLE CART CONTENT ===== */
        <div className={styles.scrollArea}>
          {/* Freeship Alert Banner */}
          <div className={styles.freeshipBanner}>
            <FiTruck size={15} />
            <span>
              {selectedSubtotal >= 500000
                ? '🎉 Đơn hàng đã đủ điều kiện Miễn Phí Vận Chuyển!'
                : `Thêm ${formatPrice(500000 - selectedSubtotal)}đ để được Freeship toàn quốc!`}
            </span>
          </div>

          {/* Shop Section Card */}
          <div className={styles.shopSection}>
            <div className={styles.shopHeader}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                id="shopSelectAll"
              />
              <label htmlFor="shopSelectAll" className={styles.shopTitle}>
                <span>{shopName}</span>
                <FiChevronRight size={14} color="#888" />
              </label>
            </div>

            {/* List of Cart Items */}
            {items.map((item, idx) => {
              const itemId = item._id || item.productId || `item_${idx}`;
              const isChecked = isItemSelected(itemId);
              const itemPrice = item.variant?.price || item.price;

              return (
                <div key={itemId} className={styles.itemCard}>
                  <div className={styles.itemLeft}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isChecked}
                      onChange={() => handleToggleItem(itemId)}
                    />
                    <div className={styles.itemImgWrap}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                        alt={item.name}
                        className={styles.itemImg}
                      />
                    </div>
                  </div>

                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>

                    {item.variant?.name && (
                      <span className={styles.variantPill}>
                        Phân loại: {item.variant.name}
                      </span>
                    )}

                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>{formatPrice(itemPrice)}</span>

                      <div className={styles.stepper}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item._id || idx, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={11} />
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item._id || idx, item.quantity + 1)}
                        >
                          <FiPlus size={11} />
                        </button>
                      </div>

                      <button
                        className={styles.removeIconBtn}
                        onClick={() => removeFromCart(item._id || idx)}
                        title="Xóa sản phẩm"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== FIXED BOTTOM CHECKOUT BAR ===== */}
      {items.length > 0 && (
        <div className={styles.bottomBar}>
          <label className={styles.selectAllGroup}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
            />
            <span>Tất cả</span>
          </label>

          <div className={styles.totalGroup}>
            <span className={styles.totalLabel}>Tổng thanh toán</span>
            <span className={styles.totalAmount}>{formatPrice(selectedTotalAmount)}</span>
          </div>

          <button className={styles.checkoutBtn} onClick={handleProceedCheckout}>
            Mua Hàng ({selectedCount})
          </button>
        </div>
      )}
    </div>
  );
}