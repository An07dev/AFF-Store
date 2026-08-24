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
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiHome,
  FiTag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart, getCartItemPrice, getCartItemOriginalPrice, getCartItemStock } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice } from '@/lib/utils';
import BannerNotice from '@/components/common/BannerNotice';
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
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

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
    return acc + getCartItemPrice(item) * item.quantity;
  }, 0);

  // Cart total is purely the subtotal of selected products (shipping is calculated at checkout)
  const selectedTotalAmount = selectedSubtotal;

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

  const handleConfirmClearCart = () => {
    clearCart();
    setIsClearModalOpen(false);
    toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
  };

  const handleRemoveSelectedItems = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm cần xóa');
      return;
    }
    selectedItems.forEach((item, idx) => {
      removeFromCart(item._id || idx);
    });
    toast.success('Đã xóa các sản phẩm đã chọn');
  };

  const shopName = theme?.pageTitles?.logoText || 'ShopTik Store';

  return (
    <div className={styles.page}>
      {/* =========================================================================
          1. MOBILE VIEW (< 1024px) - 100% ORIGINAL & UNTOUCHED MOBILE STRUCTURE
          ========================================================================= */}
      <div className={styles.mobileView}>
        {/* Fixed Top Navigation */}
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
            <button className={styles.clearBtn} onClick={() => setIsClearModalOpen(true)}>
              Xóa hết
            </button>
          ) : (
            <div style={{ width: 32 }} />
          )}
        </nav>

        {/* Empty State */}
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
          /* Scrollable Cart Content */
          <div className={styles.scrollArea}>
            <BannerNotice />

            {/* Shop Section Card */}
            <div className={styles.shopSection}>
              <div className={styles.shopHeader}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  id="shopSelectAllMobile"
                />
                <label htmlFor="shopSelectAllMobile" className={styles.shopTitle}>
                  <span>{shopName}</span>
                  <FiChevronRight size={14} color="#888" />
                </label>
              </div>

              {/* List of Cart Items */}
              {items.map((item, idx) => {
                const itemId = item._id || item.productId || `item_${idx}`;
                const isChecked = isItemSelected(itemId);
                const itemPrice = getCartItemPrice(item);
                const originalPrice = getCartItemOriginalPrice(item);
                const hasDiscount = originalPrice > itemPrice;
                const itemStock = getCartItemStock(item);
                const isAtMaxStock = item.quantity >= itemStock;

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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span className={styles.itemPrice}>{formatPrice(itemPrice)}</span>
                            {hasDiscount && (
                              <span style={{ fontSize: 11, color: '#64748b', textDecoration: 'line-through' }}>
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>
                          {isAtMaxStock && itemStock > 0 && (
                            <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>
                              (Tối đa: {itemStock} trong kho)
                            </span>
                          )}
                        </div>

                        <div className={styles.stepper}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item._id || idx, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Giảm số lượng"
                          >
                            <FiMinus size={11} />
                          </button>
                          <span className={styles.qtyVal}>{item.quantity}</span>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => {
                              if (item.quantity >= itemStock) {
                                toast.error(`Kho chỉ còn tối đa ${itemStock} sản phẩm!`);
                                return;
                              }
                              updateQuantity(item._id || idx, item.quantity + 1);
                            }}
                            disabled={isAtMaxStock}
                            aria-label="Tăng số lượng"
                            title={isAtMaxStock ? `Kho chỉ còn ${itemStock} sản phẩm` : undefined}
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

            {/* Mobile Order Summary Calculation Card */}
            <div className={styles.mobileSummaryCard}>
              <div className={styles.mobileSummaryHeader}>
                <span className={styles.mobileSummaryTitle}>Chi Tiết Thanh Toán</span>
                <span className={styles.mobileSummaryCount}>{selectedCount} sản phẩm đã chọn</span>
              </div>

              <div className={styles.mobileSummaryRows}>
                <div className={styles.mobileSummaryRow}>
                  <span>Tổng tiền hàng:</span>
                  <span>{formatPrice(selectedSubtotal)}</span>
                </div>
                <div className={styles.mobileSummaryRow}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Tính khi thanh toán
                  </span>
                </div>
                <div className={styles.mobileSummaryDivider} />
                <div className={styles.mobileSummaryTotalRow}>
                  <span className={styles.mobileSummaryTotalLabel}>Tổng số tiền cần trả:</span>
                  <span className={styles.mobileSummaryTotalNum}>{formatPrice(selectedTotalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Bottom Bar on Mobile */}
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

      {/* =========================================================================
          2. PC & TABLET VIEW (>= 1024px) - LUXURY 2-COLUMN SHOPPING CART DASHBOARD
          ========================================================================= */}
      <div className={styles.pcView}>
        {/* Top Breadcrumb / Header */}
        <div className={styles.pcHeader}>
          <div className={styles.pcBreadcrumb}>
            <Link href="/" className={styles.pcBreadcrumbLink}>
              <FiHome size={14} /> Trang Chủ
            </Link>
            <span className={styles.pcBreadcrumbDivider}>/</span>
            <span className={styles.pcBreadcrumbActive}>Giỏ Hàng ({cartCount})</span>
          </div>

          <Link href="/" className={styles.pcContinueShoppingLink}>
            <FiChevronLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>

        {items.length === 0 ? (
          /* PC Empty State */
          <div className={styles.pcEmptyCard}>
            <div className={styles.pcEmptyIconWrap}>
              <FiShoppingBag size={48} />
            </div>
            <h2 className={styles.pcEmptyTitle}>Giỏ hàng của bạn đang trống</h2>
            <p className={styles.pcEmptyDesc}>
              Chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn ưu đãi hấp dẫn ngay hôm nay!
            </p>
            <Link href="/" className={styles.pcExploreBtn}>
              <span>Khám Phá Sản Phẩm Ngay</span>
              <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* PC 2-Column Cart Layout */
          <div className={styles.pcLayoutGrid}>
            {/* Left Column: Cart Items Table */}
            <div className={styles.pcLeftCol}>
              {/* Items Table Container */}
              <div className={styles.pcTableCard}>
                {/* Table Header */}
                <div className={styles.pcTableHeader}>
                  <div className={styles.pcColSelect}>
                    <input
                      type="checkbox"
                      className={styles.pcCheckbox}
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      id="pcSelectAllHeader"
                    />
                    <label htmlFor="pcSelectAllHeader" className={styles.pcHeaderLabel}>
                      Tất cả ({items.length} sản phẩm)
                    </label>
                  </div>
                  <div className={styles.pcColPrice}>Đơn giá</div>
                  <div className={styles.pcColQty}>Số lượng</div>
                  <div className={styles.pcColTotal}>Thành tiền</div>
                  <div className={styles.pcColAction}>Thao tác</div>
                </div>

                {/* Shop Badge Strip */}
                <div className={styles.pcShopStrip}>
                  <input
                    type="checkbox"
                    className={styles.pcCheckbox}
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    id="pcShopSelectAll"
                  />
                  <span className={styles.pcMallBadge}>MALL</span>
                  <label htmlFor="pcShopSelectAll" className={styles.pcShopTitle}>
                    {shopName}
                  </label>
                </div>

                {/* Items List */}
                <div className={styles.pcItemsList}>
                  {items.map((item, idx) => {
                    const itemId = item._id || item.productId || `item_${idx}`;
                    const isChecked = isItemSelected(itemId);
                    const itemPrice = getCartItemPrice(item);
                    const originalPrice = getCartItemOriginalPrice(item);
                    const hasDiscount = originalPrice > itemPrice;
                    const itemStock = getCartItemStock(item);
                    const isAtMaxStock = item.quantity >= itemStock;
                    const itemSubtotal = itemPrice * item.quantity;

                    return (
                      <div
                        key={itemId}
                        className={`${styles.pcItemRow} ${isChecked ? styles.pcItemRowSelected : ''}`}
                      >
                        {/* 1. Select & Product Info */}
                        <div className={styles.pcColSelect}>
                          <input
                            type="checkbox"
                            className={styles.pcCheckbox}
                            checked={isChecked}
                            onChange={() => handleToggleItem(itemId)}
                          />
                          <div className={styles.pcItemThumbWrap}>
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                              alt={item.name}
                              className={styles.pcItemThumb}
                            />
                          </div>
                          <div className={styles.pcItemDetails}>
                            <Link
                              href={`/product/${item.slug || item.productId || ''}`}
                              className={styles.pcItemName}
                            >
                              {item.name}
                            </Link>
                            {item.variant?.name && (
                              <span className={styles.pcVariantBadge}>
                                Phân loại: {item.variant.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 2. Unit Price */}
                        <div className={styles.pcColPrice}>
                          <span className={styles.pcUnitPrice}>{formatPrice(itemPrice)}</span>
                          {hasDiscount && (
                            <span className={styles.pcOriginalPrice}>{formatPrice(originalPrice)}</span>
                          )}
                        </div>

                        {/* 3. Quantity Stepper */}
                        <div className={styles.pcColQty}>
                          <div className={styles.pcStepper}>
                            <button
                              type="button"
                              className={styles.pcQtyBtn}
                              onClick={() => updateQuantity(item._id || idx, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Giảm số lượng"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className={styles.pcQtyVal}>{item.quantity}</span>
                            <button
                              type="button"
                              className={styles.pcQtyBtn}
                              onClick={() => {
                                if (item.quantity >= itemStock) {
                                  toast.error(`Kho chỉ còn tối đa ${itemStock} sản phẩm!`);
                                  return;
                                }
                                updateQuantity(item._id || idx, item.quantity + 1);
                              }}
                              disabled={isAtMaxStock}
                              aria-label="Tăng số lượng"
                              title={isAtMaxStock ? `Kho chỉ còn ${itemStock} sản phẩm` : undefined}
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          {isAtMaxStock && itemStock > 0 && (
                            <span className={styles.pcStockWarning}>Còn {itemStock} SP</span>
                          )}
                        </div>

                        {/* 4. Total Amount */}
                        <div className={styles.pcColTotal}>
                          <span className={styles.pcItemTotal}>{formatPrice(itemSubtotal)}</span>
                        </div>

                        {/* 5. Delete Action */}
                        <div className={styles.pcColAction}>
                          <button
                            type="button"
                            className={styles.pcDeleteBtn}
                            onClick={() => removeFromCart(item._id || idx)}
                            title="Xóa sản phẩm này"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table Footer Controls */}
                <div className={styles.pcTableFooter}>
                  <div className={styles.pcFooterLeft}>
                    <input
                      type="checkbox"
                      className={styles.pcCheckbox}
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      id="pcSelectAllFooter"
                    />
                    <label htmlFor="pcSelectAllFooter" className={styles.pcFooterLabel}>
                      Chọn tất cả ({items.length})
                    </label>

                    <button
                      type="button"
                      className={styles.pcBulkActionBtn}
                      onClick={handleRemoveSelectedItems}
                      disabled={selectedCount === 0}
                    >
                      Xóa đã chọn ({selectedCount})
                    </button>

                    <button
                      type="button"
                      className={styles.pcBulkActionBtn}
                      onClick={() => setIsClearModalOpen(true)}
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  <span className={styles.pcSelectedNote}>
                    Đã chọn <strong>{selectedCount}</strong> sản phẩm
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card (Sticky) */}
            <div className={styles.pcRightCol}>
              <div className={styles.pcSummaryCard}>
                <h3 className={styles.pcSummaryTitle}>Tóm Tắt Đơn Hàng</h3>

                <div className={styles.pcSummaryRows}>
                  <div className={styles.pcSummaryRow}>
                    <span className={styles.pcRowLabel}>Tổng số lượng</span>
                    <span className={styles.pcRowVal}>{selectedCount} sản phẩm</span>
                  </div>

                  <div className={styles.pcSummaryRow}>
                    <span className={styles.pcRowLabel}>Tạm tính</span>
                    <span className={styles.pcRowVal}>{formatPrice(selectedSubtotal)}</span>
                  </div>

                  <div className={styles.pcSummaryRow}>
                    <span className={styles.pcRowLabel}>Phí vận chuyển</span>
                    <span className={styles.pcRowVal} style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      Tính khi thanh toán
                    </span>
                  </div>
                </div>

                <div className={styles.pcDivider} />

                {/* Grand Total */}
                <div className={styles.pcGrandTotalRow}>
                  <div className={styles.pcTotalLabelGroup}>
                    <span className={styles.pcGrandTotalLabel}>Tổng thanh toán</span>
                    <span className={styles.pcVatNotice}>(Đã bao gồm VAT nếu có)</span>
                  </div>
                  <span className={styles.pcGrandTotalAmount}>{formatPrice(selectedTotalAmount)}</span>
                </div>

                {/* Checkout CTA Button */}
                <button
                  type="button"
                  className={styles.pcCheckoutBtn}
                  onClick={handleProceedCheckout}
                  disabled={selectedCount === 0}
                >
                  <span>Tiến Hành Đặt Hàng ({selectedCount})</span>
                  <FiArrowRight size={17} />
                </button>

                {/* Trust Badges */}
                <div className={styles.pcTrustSection}>
                  <div className={styles.pcTrustRow}>
                    <FiShield size={16} className={styles.pcTrustIcon} />
                    <span>Bảo mật thanh toán 100%</span>
                  </div>
                  <div className={styles.pcTrustRow}>
                    <FiCheckCircle size={16} className={styles.pcTrustIcon} />
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                  </div>
                  <div className={styles.pcTrustRow}>
                    <FiTruck size={16} className={styles.pcTrustIcon} />
                    <span>Giao hàng toàn quốc siêu tốc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. CLEAR CART CONFIRMATION MODAL (SHARED)
          ========================================================================= */}
      {isClearModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsClearModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <FiTrash2 size={24} />
            </div>
            <h3 className={styles.modalTitle}>Xóa tất cả sản phẩm?</h3>
            <p className={styles.modalDesc}>
              Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng không?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setIsClearModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleConfirmClearCart}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}