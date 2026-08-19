# 📋 DANH SÁCH TỔNG HỢP TOÀN BỘ API DỰ ÁN SHOPTIK

> **Cập nhật:** 2026-08-18  
> **Base URL:** `https://your-domain.com` (hoặc `http://localhost:3000` khi chạy máy local)  
> **Database:** MongoDB Atlas Cloud (`Cluster0` / `webstore`)  
> **Authentication:** Bearer Token trong Header `Authorization: Bearer <token>` hoặc Cookie Session (NextAuth)  
> **Tài khoản Admin mặc định:** `admin@shoptik.vn` / `admin123`

---

## 📑 MỤC LỤC

1. [Xác Thực & Tài Khoản (Authentication)](#1-xác-thực--tài-khoản-authentication)
2. [Quản Lý Sản Phẩm (Products API)](#2-quản-lý-sản-phẩm-products-api)
3. [Quản Lý Danh Mục (Categories API)](#3-quản-lý-danh-mục-categories-api)
4. [Quản Lý Giỏ Hàng (Cart API)](#4-quản-lý-giỏ-hàng-cart-api)
5. [Quản Lý Đơn Hàng (Orders API)](#5-quản-lý-đơn-hàng-orders-api)
6. [Quản Lý Khách Hàng CRM (Customers API)](#6-quản-lý-khách-hàng-crm-customers-api)
7. [Báo Cáo & Thống Kê Dashboard (Reports API)](#7-báo-cáo--thống-kê-dashboard-reports-api)
8. [Vận Chuyển 3 Hãng GHN / GHTK / ViettelPost (Shipping API)](#8-vận-chuyển-3-hãng-ghn--ghtk--viettelpost-shipping-api)
9. [Thanh Toán VietQR & Webhook SePay (Payment API)](#9-thanh-toán-vietqr--webhook-sepay-payment-api)
10. [Cài Đặt Giao Diện & Tiện Ích (Settings, Upload, Seed)](#10-cài-đặt-giao-diện--tiện-ích-settings-upload-seed)

---

## 1. Xác Thực & Tài Khoản (Authentication)

### 1.1. Đăng nhập (Admin, Staff, Customer)
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Request Body:**
```json
{
  "identifier": "admin@shoptik.vn",
  "password": "admin123"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": "67b...",
      "name": "Admin ShopTik",
      "email": "admin@shoptik.vn",
      "phone": "0988888888",
      "role": "admin"
    }
  }
}
```

### 1.2. Đăng ký tài khoản khách hàng
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "khachhang@gmail.com",
  "phone": "0988123456",
  "password": "password123"
}
```

### 1.3. Lấy thông tin tài khoản hiện tại
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

### 1.4. Đổi mật khẩu
- **Method:** `POST`
- **Endpoint:** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

---

## 2. Quản Lý Sản Phẩm (Products API)

### 2.1. Lấy danh sách sản phẩm
- **Method:** `GET`
- **Endpoint:** `/api/products`
- **Query Params:**
  - `page`: Trang (mặc định: `1`)
  - `limit`: Số sản phẩm/trang (mặc định: `10`)
  - `search`: Từ khóa tìm kiếm
  - `category`: Slug hoặc ID danh mục
  - `status`: `active` | `hidden` | `all`
  - `sort`: `newest` | `price-asc` | `price-desc` | `popular`

### 2.2. Thêm sản phẩm mới
- **Method:** `POST`
- **Endpoint:** `/api/products`
- **Request Body:**
```json
{
  "name": "Áo Khoác Bomber Kaki 2 Lớp",
  "price": 380000,
  "salePrice": 299000,
  "category": "67a...",
  "images": ["/uploads/image.jpg"],
  "stock": 50,
  "isFeatured": true,
  "status": "active",
  "description": "Chất liệu kaki cao cấp, chống gió thoáng khí.",
  "variants": [
    { "color": "Đen", "size": "L", "stock": 25, "price": 299000 },
    { "color": "Rêu", "size": "XL", "stock": 25, "price": 299000 }
  ]
}
```

### 2.3. Xem chi tiết sản phẩm
- **Method:** `GET`
- **Endpoint:** `/api/products/{id_hoac_slug}`

### 2.4. Cập nhật sản phẩm
- **Method:** `PUT`
- **Endpoint:** `/api/products/{id}`

### 2.5. Xóa sản phẩm
- **Method:** `DELETE`
- **Endpoint:** `/api/products/{id}`

---

## 3. Quản Lý Danh Mục (Categories API)

### 3.1. Danh sách danh mục (Tự động đếm sản phẩm)
- **Method:** `GET`
- **Endpoint:** `/api/categories`

### 3.2. Thêm danh mục mới
- **Method:** `POST`
- **Endpoint:** `/api/categories`
- **Request Body:**
```json
{
  "name": "Giày Thể Thao Nam",
  "description": "Giày sneaker, chạy bộ",
  "order": 5,
  "isActive": true
}
```

### 3.3. Xem chi tiết / Cập nhật / Xóa danh mục
- **Chi tiết:** `GET /api/categories/{id}`
- **Cập nhật:** `PUT /api/categories/{id}`
- **Xóa:** `DELETE /api/categories/{id}`

---

## 4. Quản Lý Giỏ Hàng (Cart API)

### 4.1. Lấy thông tin giỏ hàng
- **Method:** `GET`
- **Endpoint:** `/api/cart?userId={userId}` (hoặc truyền qua Header `Authorization: Bearer <token>`)

### 4.2. Thêm món vào giỏ hàng
- **Method:** `POST`
- **Endpoint:** `/api/cart`
- **Request Body:**
```json
{
  "userId": "user_123",
  "productId": "67a...",
  "quantity": 1,
  "variant": {
    "color": "Đen",
    "size": "L",
    "price": 299000
  }
}
```

### 4.3. Cập nhật số lượng / Áp dụng Voucher
- **Method:** `PUT`
- **Endpoint:** `/api/cart`
- **Request Body (Cập nhật số lượng):**
```json
{
  "userId": "user_123",
  "itemId": "item_456",
  "quantity": 3
}
```
- **Request Body (Áp dụng voucher `TIKTOK50K`, `FREESHIP`):**
```json
{
  "userId": "user_123",
  "voucherCode": "TIKTOK50K",
  "discountAmount": 50000
}
```

### 4.4. Xóa món / Làm trống giỏ hàng
- **Method:** `DELETE`
- **Endpoint:** `/api/cart?userId={userId}&itemId={itemId}`

---

## 5. Quản Lý Đơn Hàng (Orders API)

### 5.1. Danh sách đơn hàng (Admin)
- **Method:** `GET`
- **Endpoint:** `/api/orders`
- **Query Params:** `page`, `limit`, `status`, `search`, `startDate`, `endDate`

### 5.2. Tạo đơn hàng mới (Checkout)
- **Method:** `POST`
- **Endpoint:** `/api/orders`
- **Request Body:**
```json
{
  "customer": {
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "nguyenvana@gmail.com",
    "address": "Số 10 Phạm Hùng, Phường Mai Dịch, Quận Cầu Giấy, Hà Nội",
    "province": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Phường Mai Dịch"
  },
  "items": [
    {
      "productId": "67a...",
      "name": "Áo Polo Nam Phối Bo Cổ",
      "price": 189000,
      "quantity": 2,
      "image": "/file.svg",
      "variant": { "color": "Đen", "size": "L" }
    }
  ],
  "subtotal": 378000,
  "shippingFee": 22000,
  "discountAmount": 0,
  "totalAmount": 400000,
  "paymentMethod": "bank_transfer",
  "notes": "Giao giờ hành chính"
}
```

### 5.3. Xem chi tiết / Cập nhật trạng thái / Xóa đơn hàng
- **Chi tiết:** `GET /api/orders/{id_hoac_orderCode}`
- **Cập nhật:** `PUT /api/orders/{id}` *(Cập nhật `status: 'confirmed' | 'shipping' | 'delivered' | 'cancelled'`)*
- **Xóa:** `DELETE /api/orders/{id}`

---

## 6. Quản Lý Khách Hàng CRM (Customers API)

### 6.1. Danh sách khách hàng
- **Method:** `GET`
- **Endpoint:** `/api/customers`
- **Query Params:** `page`, `limit`, `search`

### 6.2. Xem hồ sơ & Toàn bộ lịch sử đơn hàng của khách
- **Method:** `GET`
- **Endpoint:** `/api/customers/{id}`

### 6.3. Thêm mới / Cập nhật / Xóa khách hàng
- **Thêm mới:** `POST /api/customers`
- **Cập nhật:** `PUT /api/customers/{id}`
- **Xóa:** `DELETE /api/customers/{id}`

---

## 7. Báo Cáo & Thống Kê Dashboard (Reports API)

### 7.1. Báo cáo tổng hợp số liệu
- **Method:** `GET`
- **Endpoint:** `/api/reports`
- **Query Params:** `period` (`today`, `yesterday`, `7days`, `30days`, `thisMonth`)
- **Dữ liệu trả về:**
  - `totalRevenue`: Tổng doanh thu
  - `totalOrders`: Tổng số đơn hàng
  - `newCustomers`: Số khách hàng mới
  - `averageOrderValue`: Giá trị đơn hàng trung bình (AOV)
  - `revenueByDate`: Mảng doanh thu theo từng ngày vẽ biểu đồ Chart.js
  - `ordersByStatus`: Số đơn theo trạng thái (chờ duyệt, đang giao, đã giao...)
  - `topProducts`: Top 5 sản phẩm bán chạy nhất

---

## 8. Vận Chuyển 3 Hãng GHN / GHTK / ViettelPost (Shipping API)

### 8.1. So sánh cước phí 3 hãng cùng lúc
- **Method:** `POST`
- **Endpoint:** `/api/shipping/calculate`
- **Request Body:**
```json
{
  "province": "Hà Nội",
  "district": "Quận Cầu Giấy",
  "weight": 500,
  "orderValue": 450000
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "ghn": { "fee": 22000, "serviceName": "Giao Nhanh (GHN)", "estimatedTime": "1 ngày" },
    "ghtk": { "fee": 20000, "serviceName": "Giao Hàng Tiết Kiệm (GHTK)", "estimatedTime": "1-2 ngày" },
    "viettelpost": { "fee": 21000, "serviceName": "Viettel Post Tiêu Chuẩn", "estimatedTime": "1-2 ngày" }
  }
}
```

### 8.2. Đẩy đơn sang hãng & Lấy mã vận đơn
- **Method:** `POST`
- **Endpoint:** `/api/shipping/create-order`
- **Request Body:**
```json
{
  "orderId": "67a...",
  "provider": "ghn",
  "orderData": {
    "to_name": "Nguyễn Văn A",
    "to_phone": "0987654321",
    "to_address": "Số 10 Phạm Hùng",
    "cod_amount": 400000,
    "weight": 500
  }
}
```

### 8.3. Cấu hình Token & Biểu phí vận chuyển
- **Lấy cấu hình:** `GET /api/shipping/config`
- **Lưu cấu hình:** `POST /api/shipping/config`
- **Kiểm tra kết nối:** `POST /api/shipping/test`

---

## 9. Thanh Toán VietQR & Webhook SePay (Payment API)

### 9.1. Kiểm tra trạng thái thanh toán realtime (Polling)
- **Method:** `GET`
- **Endpoint:** `/api/payment/status?code={orderCode}` (hoặc `?orderId={id}`)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "67a...",
    "orderCode": "ST466451",
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "totalAmount": 400000,
    "isPaid": true
  }
}
```

### 9.2. Webhook nhận biến động số dư SePay
- **Method:** `POST`
- **Endpoint:** `/api/webhooks/sepay`
- **Request Body từ SePay:**
```json
{
  "id": 998822,
  "gateway": "MBBank",
  "transactionDate": "2026-08-18 10:30:00",
  "accountNumber": "0988123456",
  "transferType": "in",
  "transferAmount": 400000,
  "content": "Thanh toan ST466451",
  "referenceCode": "FT2608189823"
}
```
*(Hệ thống tự động đọc mã `ST466451`, xác minh số tiền $\ge$ giá trị đơn và đổi trạng thái `paid` & `confirmed`)*

---

## 10. Cài Đặt Giao Diện & Tiện Ích (Settings, Upload, Seed)

### 10.1. Cài đặt Giao diện Theme, Chế độ Sáng/Tối, Màu Sắc & Tiêu Đề
- **Lấy cấu hình hiện tại:** `GET /api/settings/theme`
- **Lưu / Cập nhật cấu hình:** `POST /api/settings/theme` hoặc `PUT /api/settings/theme`
- **Request Body mẫu đầy đủ:**
```json
{
  "themeName": "modern-blue",
  "mode": "dark",
  "pageTitles": {
    "siteTitle": "ShopTik - Cửa Hàng Thời Trang & Phụ Kiện Cao Cấp",
    "homeTitle": "Trang Chủ | ShopTik",
    "adminTitle": "ShopTik Quản Trị Hệ Thống",
    "logoText": "ShopTik",
    "logoUrl": "/uploads/logo.png",
    "faviconUrl": "/favicon.ico",
    "metaDescription": "Trải nghiệm mua sắm thời trang trực tuyến thời thượng, giao hàng nhanh chóng toàn quốc.",
    "bannerNotice": "🔥 Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ",
    "showBannerNotice": true
  },
  "buttonColors": {
    "primaryBg": "#3b82f6",
    "primaryText": "#ffffff",
    "primaryHover": "#2563eb",
    "secondaryBg": "#1a1e2b",
    "secondaryText": "#94a3b8",
    "borderRadius": "10px"
  },
  "textColors": {
    "textPrimary": "#f8fafc",
    "textSecondary": "#94a3b8",
    "textMuted": "#64748b",
    "textAccent": "#3b82f6"
  },
  "componentColors": {
    "background": "#090a0f",
    "cardBackground": "#13161f",
    "cardHoverBg": "#1a1e2b",
    "navbarBg": "#090a0f",
    "sidebarBg": "#131826",
    "borderColor": "#232838",
    "accentColor": "#10b981"
  }
}
```
- **Response (200):** Trả về đối tượng cấu hình đầy đủ đã được lưu vào MongoDB Atlas.

### 10.2. Upload ảnh sản phẩm
- **Method:** `POST`
- **Endpoint:** `/api/upload`
- **Format:** `multipart/form-data` (Field `file`)
- **Trả về:** `{ "success": true, "data": { "url": "/uploads/17869..._image.jpg" } }`

### 10.3. Nạp dữ liệu mẫu ban đầu (Seed Data)
- **Method:** `POST`
- **Endpoint:** `/api/seed`
- **Mô tả:** Tự động tạo tài khoản Admin `admin@shoptik.vn`, 4 danh mục và 4 sản phẩm mẫu vào database.
