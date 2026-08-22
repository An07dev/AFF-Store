'use client';

import React from 'react';
import { FiPrinter, FiX, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/lib/utils';
import { generateBarcodeSVG } from '@/lib/barcode';
import styles from './OrderPackingSlipModal.module.css';

interface OrderPackingSlipModalProps {
  orders: any[];
  onClose: () => void;
}

export default function OrderPackingSlipModal({
  orders,
  onClose,
}: OrderPackingSlipModalProps) {
  if (!orders || orders.length === 0) return null;

  // Build Standalone HTML for Isolated Iframe Printing (Guarantees 100% Non-blank Print)
  const generatePrintHTML = () => {
    const slipsHtml = orders
      .map((order, orderIdx) => {
        const barcodeSvg = generateBarcodeSVG(order.orderCode || `ST${orderIdx}`, 36, 180);
        const items = order.items || [];
        const subtotal = items.reduce(
          (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
          0
        );
        const totalQty = items.reduce(
          (sum: number, it: any) => sum + (it.quantity || 1),
          0
        );
        const isPaid = order.paymentStatus === 'paid';
        const carrier = order.shippingCarrier || order.shippingProvider || 'GIAO HÀNG TIÊU CHUẨN';

        const rowsHtml =
          items.length === 0
            ? '<tr><td colspan="5" style="text-align:center; padding: 6px;">Không có thông tin sản phẩm</td></tr>'
            : items
                .map((item: any, idx: number) => {
                  const variant =
                    item.variantTitle ||
                    (item.color || item.size
                      ? [item.color, item.size].filter(Boolean).join(' - ')
                      : '');
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  return `
                  <tr>
                    <td style="text-align: center; border: 1px solid #000; padding: 4px 5px;">${idx + 1}</td>
                    <td style="border: 1px solid #000; padding: 4px 6px;">
                      <div style="font-weight: 700;">${item.name}</div>
                      ${variant ? `<div style="font-size: 9px; color: #333; background: #f1f5f9; display: inline-block; padding: 1px 4px; border-radius: 2px; margin-top: 1px;">Phân loại: ${variant}</div>` : ''}
                    </td>
                    <td style="text-align: center; font-weight: 800; border: 1px solid #000; padding: 4px 5px;">${item.quantity || 1}</td>
                    <td style="text-align: right; border: 1px solid #000; padding: 4px 6px;">${formatPrice(item.price || 0)}</td>
                    <td style="text-align: right; font-weight: 700; border: 1px solid #000; padding: 4px 6px;">${formatPrice(itemTotal)}</td>
                  </tr>
                `;
                })
                .join('');

        return `
        <div class="slip-page">
          <!-- 1. Header with Shop Brand & Barcode -->
          <div class="slip-header">
            <div class="brand-info">
              <div class="shop-name">⚽ SHOTTIK STORE</div>
              <div class="shop-details">Hotline: 0988.888.888 • www.shoptik.vn</div>
              <div class="shop-warehouse">Kho: Số 10 Phạm Hùng, Cầu Giấy, Hà Nội</div>
            </div>

            <div class="barcode-area">
              <div class="barcode-svg">${barcodeSvg}</div>
              <div class="order-date">Ngày đặt: ${formatDate(order.createdAt || new Date())}</div>
            </div>
          </div>

          <!-- 2. Sender & Recipient 2-Column Grid -->
          <div class="grid-sender-recipient">
            <div class="address-box">
              <div class="box-title">📤 Người gửi</div>
              <div class="person-name">ShopTik Logistics</div>
              <div class="person-phone">0988.888.888</div>
              <div class="person-address">Số 10 Phạm Hùng, Cầu Giấy, Hà Nội</div>
            </div>

            <div class="address-box">
              <div class="box-title">📥 Người nhận</div>
              <div class="person-name">${order.customer?.name || 'Khách hàng'}</div>
              <div class="person-phone">📞 ${order.customer?.phone || ''}</div>
              <div class="person-address">${order.customer?.address || 'Địa chỉ nhận hàng'}</div>
            </div>
          </div>

          <!-- 3. Carrier Strip -->
          <div class="carrier-bar">
            <div>ĐVVC: <span class="carrier-tag">${carrier}</span></div>
            ${order.trackingCode ? `<div style="font-size: 10px;">Mã vận đơn: <strong>${order.trackingCode}</strong></div>` : ''}
            <div style="font-size: 9.5px; color: #333;">Phân loại: <strong>${totalQty} món</strong></div>
          </div>

          <!-- 4. Products Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 24px; text-align: center;">STT</th>
                <th>Tên sản phẩm & Phân loại</th>
                <th style="width: 35px; text-align: center;">SL</th>
                <th style="width: 65px; text-align: right;">Đơn giá</th>
                <th style="width: 75px; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- 5. Summary & COD Amount -->
          <div class="summary-section">
            <div class="notes-box">
              <div class="notes-title">📌 Ghi chú giao hàng:</div>
              <div style="font-weight: 700; color: #b45309; margin-bottom: 2px;">• CHO XEM HÀNG, KHÔNG CHO THỬ</div>
              ${order.notes ? `<div>• ${order.notes}</div>` : '<div style="color: #555;">• Giao giờ hành chính, gọi trước khi giao.</div>'}
            </div>

            <div class="cod-card">
              ${
                isPaid
                  ? `
                  <div class="paid-stamp">✓ ĐÃ THANH TOÁN</div>
                  <div style="font-size: 9.5px; color: #15803d; margin-top: 2px; font-weight: 700;">KHÔNG THU TIỀN (0 ₫)</div>
                `
                  : `
                  <div class="cod-label">Tiền Thu Hộ (COD)</div>
                  <div class="cod-amount">${formatPrice(order.totalAmount || 0)}</div>
                  <div style="font-size: 8.5px; color: #475569;">(Đã gồm tiền hàng + ship)</div>
                `
              }
            </div>
          </div>

          <!-- 6. Footer & Signatures -->
          <div class="slip-footer">
            <div>
              <div>🛡️ <strong>Chính sách đổi trả:</strong> Đổi size miễn phí trong 7 ngày.</div>
              <div>Cảm ơn quý khách đã mua sắm tại <strong>ShopTik Store</strong>!</div>
            </div>

            <div class="signature-area">
              <div>Chữ ký người nhận</div>
              <div class="signature-line">(Ký và ghi rõ họ tên)</div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>In Phiếu Đóng Hàng ShopTik</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #000000;
            font-size: 11px;
            line-height: 1.35;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .slip-page {
            width: 100mm;
            min-height: 145mm;
            max-width: 100mm;
            margin: 0 auto 0 auto;
            padding: 6mm 5mm;
            background: #ffffff;
            page-break-after: always;
            break-after: page;
          }
          .slip-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #000000;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .shop-name {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .shop-details {
            font-size: 9.5px;
            color: #222;
            margin-top: 1px;
          }
          .shop-warehouse {
            font-size: 8.5px;
            color: #444;
            margin-top: 1px;
          }
          .barcode-area {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            max-width: 160px;
          }
          .barcode-svg svg {
            width: 145px;
            height: 36px;
            display: block;
          }
          .order-date {
            font-size: 8.5px;
            color: #444;
            margin-top: 2px;
          }
          .grid-sender-recipient {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            border-bottom: 1px solid #000000;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .box-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
            margin-bottom: 2px;
          }
          .person-name {
            font-weight: 700;
            font-size: 11px;
          }
          .person-phone {
            font-weight: 800;
            font-size: 11.5px;
          }
          .person-address {
            font-size: 9.5px;
            color: #111;
            margin-top: 1px;
            line-height: 1.25;
          }
          .carrier-bar {
            background: #f1f5f9;
            border: 1px solid #000000;
            padding: 3px 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .carrier-tag {
            text-transform: uppercase;
            font-weight: 800;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 9.5px;
          }
          .items-table th, .items-table td {
            border: 1px solid #000000;
            padding: 3px 5px;
          }
          .items-table th {
            background: #e2e8f0;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 9px;
          }
          .summary-section {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 6px;
            border-top: 1px solid #000000;
            padding-top: 5px;
            margin-bottom: 6px;
          }
          .notes-box {
            border: 1px dashed #000000;
            padding: 4px 6px;
            font-size: 9px;
            background: #fffbeb;
          }
          .notes-title {
            font-weight: 800;
            text-transform: uppercase;
            font-size: 8.5px;
            margin-bottom: 2px;
          }
          .cod-card {
            border: 2px solid #000000;
            padding: 5px 6px;
            text-align: center;
            background: #f8fafc;
          }
          .cod-label {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .cod-amount {
            font-size: 15px;
            font-weight: 900;
            color: #000000;
            margin: 1px 0;
          }
          .paid-stamp {
            border: 2px solid #16a34a;
            color: #16a34a;
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            padding: 2px 5px;
            display: inline-block;
            border-radius: 3px;
          }
          .slip-footer {
            border-top: 1px solid #000000;
            padding-top: 5px;
            display: flex;
            justify-content: space-between;
            font-size: 8.5px;
            color: #333;
          }
          .signature-area {
            text-align: center;
            width: 120px;
          }
          .signature-line {
            margin-top: 24px;
            border-top: 1px dotted #666;
            padding-top: 1px;
            font-style: italic;
            font-size: 8px;
          }
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${slipsHtml}
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    try {
      // Create an invisible iframe to isolate print stylesheet from Next.js CSS
      const existingIframe = document.getElementById('print-slip-iframe');
      if (existingIframe) {
        document.body.removeChild(existingIframe);
      }

      const printIframe = document.createElement('iframe');
      printIframe.id = 'print-slip-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);

      const doc = printIframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(generatePrintHTML());
        doc.close();

        printIframe.contentWindow?.focus();
        setTimeout(() => {
          printIframe.contentWindow?.print();
          setTimeout(() => {
            if (document.getElementById('print-slip-iframe')) {
              document.body.removeChild(printIframe);
            }
          }, 3000);
        }, 400);
      }
    } catch (e) {
      console.error('Error opening print iframe:', e);
      window.print();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <FiPrinter className={styles.titleIcon} />
            <div>
              <h2 className={styles.title}>
                {orders.length === 1
                  ? `In Phiếu Đóng Hàng #${orders[0]?.orderCode}`
                  : `In ${orders.length} Phiếu Đóng Hàng (Khổ A6)`}
              </h2>
              <p className={styles.subtitle}>
                Chuẩn kích thước A6 (100x150mm) tương thích mọi máy in nhiệt (Xprinter, HPRT, Gprinter...)
              </p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnPrint}
              onClick={handlePrint}
              title="Mở hộp thoại in trình duyệt"
            >
              <FiPrinter /> In ngay ({orders.length} đơn)
            </button>
            <button
              type="button"
              className={styles.btnClose}
              onClick={onClose}
              title="Đóng"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Modal Body / Print Preview Container */}
        <div className={styles.previewContainer}>
          {orders.map((order, orderIdx) => {
            const barcodeSvg = generateBarcodeSVG(order.orderCode || `ST${orderIdx}`, 36, 180);
            const items = order.items || [];
            const subtotal = items.reduce(
              (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
              0
            );
            const totalQty = items.reduce(
              (sum: number, it: any) => sum + (it.quantity || 1),
              0
            );
            const isPaid = order.paymentStatus === 'paid';
            const carrier = order.shippingCarrier || order.shippingProvider || 'GIAO HÀNG TIÊU CHUẨN';

            return (
              <div key={order._id || orderIdx} className={styles.slipPaper}>
                {/* 1. Header with Shop Brand & Barcode */}
                <div className={styles.slipHeader}>
                  <div className={styles.brandInfo}>
                    <div className={styles.shopName}>⚽ SHOTTIK STORE</div>
                    <div className={styles.shopDetails}>
                      Hotline: 0988.888.888 • www.shoptik.vn
                    </div>
                    <div style={{ fontSize: 9, color: '#444', marginTop: 1 }}>
                      Kho: Số 10 Phạm Hùng, Cầu Giấy, Hà Nội
                    </div>
                  </div>

                  <div className={styles.barcodeArea}>
                    <div
                      className={styles.barcodeSvg}
                      dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                    />
                    <div className={styles.orderDateTag}>
                      Ngày đặt: {formatDate(order.createdAt || new Date())}
                    </div>
                  </div>
                </div>

                {/* 2. Sender & Recipient 2-Column Grid */}
                <div className={styles.gridSenderRecipient}>
                  <div className={styles.addressBox}>
                    <div className={styles.boxTitle}>
                      <span>📤 Người gửi</span>
                    </div>
                    <div className={styles.personName}>ShopTik Logistics</div>
                    <div className={styles.personPhone}>0988.888.888</div>
                    <div className={styles.personAddress}>
                      Số 10 Phạm Hùng, Cầu Giấy, Hà Nội
                    </div>
                  </div>

                  <div className={styles.addressBox}>
                    <div className={styles.boxTitle}>
                      <span>📥 Người nhận</span>
                    </div>
                    <div className={styles.personName}>
                      {order.customer?.name || 'Khách hàng'}
                    </div>
                    <div className={styles.personPhone}>
                      📞 {order.customer?.phone || ''}
                    </div>
                    <div className={styles.personAddress}>
                      {order.customer?.address || 'Địa chỉ nhận hàng'}
                    </div>
                  </div>
                </div>

                {/* 3. Carrier Strip */}
                <div className={styles.shippingCarrierBar}>
                  <div>
                    ĐVVC: <span className={styles.carrierTag}>{carrier}</span>
                  </div>
                  {order.trackingCode && (
                    <div style={{ fontSize: 10 }}>
                      Mã vận đơn: <strong>{order.trackingCode}</strong>
                    </div>
                  )}
                  <div style={{ fontSize: 9.5, color: '#444' }}>
                    Phân loại: <strong>{totalQty} món</strong>
                  </div>
                </div>

                {/* 4. Products Table */}
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={{ width: 24 }} className={styles.textCenter}>STT</th>
                      <th>Tên sản phẩm & Phân loại</th>
                      <th style={{ width: 35 }} className={styles.textCenter}>SL</th>
                      <th style={{ width: 65 }} className={styles.textRight}>Đơn giá</th>
                      <th style={{ width: 75 }} className={styles.textRight}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.textCenter}>
                          Không có thông tin sản phẩm
                        </td>
                      </tr>
                    ) : (
                      items.map((item: any, itemIdx: number) => {
                        const variant =
                          item.variantTitle ||
                          (item.color || item.size
                            ? [item.color, item.size].filter(Boolean).join(' - ')
                            : '');
                        const itemTotal = (item.price || 0) * (item.quantity || 1);

                        return (
                          <tr key={itemIdx}>
                            <td className={styles.textCenter}>{itemIdx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{item.name}</div>
                              {variant && (
                                <div className={styles.itemVariantTag}>
                                  Phân loại: {variant}
                                </div>
                              )}
                            </td>
                            <td className={styles.textCenter} style={{ fontWeight: 800 }}>
                              {item.quantity || 1}
                            </td>
                            <td className={styles.textRight}>
                              {formatPrice(item.price || 0)}
                            </td>
                            <td className={styles.textRight} style={{ fontWeight: 700 }}>
                              {formatPrice(itemTotal)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* 5. Summary & COD Amount */}
                <div className={styles.summarySection}>
                  <div className={styles.notesBox}>
                    <div className={styles.notesTitle}>📌 Ghi chú giao hàng:</div>
                    <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 2 }}>
                      • CHO XEM HÀNG, KHÔNG CHO THỬ
                    </div>
                    {order.notes ? (
                      <div>• {order.notes}</div>
                    ) : (
                      <div style={{ color: '#666' }}>• Giao giờ hành chính, gọi trước khi giao.</div>
                    )}
                  </div>

                  <div className={styles.codCard}>
                    {isPaid ? (
                      <div>
                        <div className={styles.paidStamp}>✓ ĐÃ THANH TOÁN</div>
                        <div style={{ fontSize: 9.5, color: '#15803d', marginTop: 2, fontWeight: 700 }}>
                          KHÔNG THU TIỀN (0 ₫)
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.codLabel}>Tiền Thu Hộ (COD)</div>
                        <div className={styles.codAmount}>
                          {formatPrice(order.totalAmount || 0)}
                        </div>
                        <div style={{ fontSize: 8.5, color: '#475569' }}>
                          (Đã bao gồm tiền hàng + cước ship)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Footer & Signatures */}
                <div className={styles.slipFooter}>
                  <div>
                    <div>🛡️ <strong>Chính sách đổi trả:</strong> Đổi size miễn phí trong 7 ngày.</div>
                    <div>Cảm ơn quý khách đã mua sắm tại <strong>ShopTik Store</strong>!</div>
                  </div>

                  <div className={styles.signatureArea}>
                    <div>Chữ ký người nhận</div>
                    <div className={styles.signatureLine}>(Ký và ghi rõ họ tên)</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
