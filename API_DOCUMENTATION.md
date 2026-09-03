# 📚 TÀI LIỆU TỔNG HỢP TOÀN BỘ API (API DOCUMENTATION)
> **Dự án**: ShopBig E-Commerce & Admin Management System  
> **Base URL**: `https://your-domain.com` (hoặc `http://localhost:3000` khi chạy máy local)  
> **Authentication**: Bearer Token trong Header `Authorization: Bearer <token>` hoặc Cookie Session (NextAuth)  
> **Định dạng dữ liệu**: `JSON`

---

## 📑 MỤC LỤC
1. [Xác Thực & Tài Khoản (Authentication)](#1-xác-thực--tài-khoản-authentication)
2. [Quản Lý Sản Phẩm (Products API)](#2-quản-lý-sản-phẩm-products-api)
3. [Quản Lý Danh Mục (Categories API)](#3-quản-lý-danh-mục-categories-api)
4. [Quản Lý Đơn Hàng (Orders API)](#4-quản-lý-đơn-hàng-orders-api)
5. [Quản Lý Khách Hàng CRM (Customers API)](#5-quản-lý-khách-hàng-crm-customers-api)
6. [Báo Cáo & Thống Kê (Reports & Analytics API)](#6-báo-cáo--thống-kê-reports--analytics-api)
7. [Vận Chuyển & Giao Hàng (Shipping API)](#7-vận-chuyển--giao-hàng-shipping-api)
8. [Thanh Toán & Webhook SePay (Payment & Webhooks API)](#8-thanh-toán--webhook-sepay-payment--webhooks-api)
9. [Cài Đặt & Giao Diện (Settings & Theme API)](#9-cài-đặt--giao-diện-settings--theme-api)
10. [Tiện Ích & Upload Ảnh (Utilities API)](#10-tiện-ích--upload-ảnh-utilities-api)

---

## 1. Xác Thực & Tài Khoản (Authentication)

### 1.1. Đăng nhập (Admin / Nhân viên / Khách hàng)
- **Endpoint**: `POST /api/auth/login`
- **Chức năng**: Đăng nhập bằng Email hoặc Số điện thoại
- **Request Body**:
```json
{
  "identifier": "khachhang@gmail.com hoặc 0988123456",
  "password": "password123"
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": "67b...",
      "name": "Nguyễn Văn A",
      "email": "khachhang@gmail.com",
      "phone": "0988123456",
      "role": "customer"
    }
  }
}
```

### 1.2. Đăng ký tài khoản Khách hàng
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "name": "Nguyễn Văn A",
  "email": "khachhang@gmail.com",
  "phone": "0988123456",
  "password": "password123"
}
```
- **Response 201**:
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": "67b...",
      "name": "Nguyễn Văn A",
      "email": "khachhang@gmail.com",
      "phone": "0988123456",
      "role": "customer"
    }
  }
}
```

### 1.3. Lấy thông tin tài khoản hiện tại
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "67b...",
    "name": "Nguyễn Văn A",
    "email": "khachhang@gmail.com",
    "phone": "0988123456",
    "role": "customer"
  }
}
```

### 1.4. Đổi mật khẩu tài khoản
- **Endpoint**: `POST /api/auth/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công!"
}
```

---

## 2. Quản Lý Sản Phẩm (Products API)

### 2.1. Lấy danh sách sản phẩm
- **Endpoint**: `GET /api/products`
- **Query Params**:
  - `page`: Trang hiện tại (Mặc định `1`)
  - `limit`: Số lượng trên trang (Mặc định `10`)
  - `search`: Từ khóa tìm kiếm tên/mã
  - `category`: ID danh mục lọc
  - `status`: `'active'` | `'hidden'` | `'all'`
  - `sort`: Tiêu chí sắp xếp (`newest`, `price-asc`, `price-desc`, `popular`)
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65b...",
      "name": "Áo Polo Nam Phối Bo Cổ",
      "slug": "ao-polo-nam-phoi-bo-co",
      "price": 250000,
      "salePrice": 199000,
      "category": { "_id": "...", "name": "Thời trang Nam" },
      "images": ["https://..."],
      "stock": 100,
      "soldCount": 45,
      "isFeatured": true,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 54,
    "totalPages": 6
  }
}
```

### 2.2. Thêm mới sản phẩm
- **Endpoint**: `POST /api/products`
- **Quyền**: Admin (Yêu cầu Token)
- **Request Body**:
```json
{
  "name": "Quần Jean Slimfit Co Giãn",
  "price": 450000,
  "salePrice": 399000,
  "category": "65b...",
  "images": ["https://..."],
  "stock": 50,
  "description": "Chất liệu denim cao cấp...",
  "isFeatured": false,
  "status": "active",
  "variants": [
    { "color": "Xanh Đậm", "size": "30", "stock": 20 }
  ]
}
```

### 2.3. Xem chi tiết sản phẩm
- **Endpoint**: `GET /api/products/{id}`

### 2.4. Cập nhật thông tin sản phẩm
- **Endpoint**: `PUT /api/products/{id}`
- **Quyền**: Admin (Yêu cầu Token)
- **Request Body**: Tương tự như thêm mới (chỉ truyền các trường cần sửa).

### 2.5. Xóa sản phẩm
- **Endpoint**: `DELETE /api/products/{id}`
- **Quyền**: Admin (Yêu cầu Token)

---

## 3. Quản Lý Danh Mục (Categories API)

### 3.1. Danh sách danh mục (Kèm đếm số sản phẩm tự động)
- **Endpoint**: `GET /api/categories`
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a...",
      "name": "Thời Trang Nam",
      "slug": "thoi-trang-nam",
      "description": "Các sản phẩm quần áo nam",
      "image": "https://...",
      "productCount": 18,
      "order": 1,
      "isActive": true
    }
  ]
}
```

### 3.2. Thêm danh mục mới
- **Endpoint**: `POST /api/categories`
- **Quyền**: Admin
- **Request Body**:
```json
{
  "name": "Phụ Kiện Thời Trang",
  "description": "Thắt lưng, ví da, kính mắt",
  "image": "https://...",
  "order": 3,
  "isActive": true
}
```

### 3.3. Xem chi tiết danh mục
- **Endpoint**: `GET /api/categories/{id}`

### 3.4. Cập nhật danh mục
- **Endpoint**: `PUT /api/categories/{id}`

### 3.5. Xóa danh mục
- **Endpoint**: `DELETE /api/categories/{id}`

---

## 4. Quản Lý Đơn Hàng (Orders API)

### 4.1. Danh sách đơn hàng
- **Endpoint**: `GET /api/orders`
- **Query Params**:
  - `page`: Trang
  - `limit`: Số đơn/trang
  - `status`: `'all'` | `'pending'` | `'confirmed'` | `'shipping'` | `'delivered'` | `'cancelled'`
  - `search`: Tìm theo mã `#ST...`, tên khách, SĐT
  - `startDate`: Ngày bắt đầu `YYYY-MM-DD`
  - `endDate`: Ngày kết thúc `YYYY-MM-DD`

### 4.2. Tạo đơn hàng mới (Từ Checkout)
- **Endpoint**: `POST /api/orders`
- **Request Body**:
```json
{
  "customer": {
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "nguyenvana@gmail.com",
    "address": "Số 10 Phạm Hùng",
    "province": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Phường Mai Dịch"
  },
  "items": [
    { "productId": "...", "name": "Áo Polo", "price": 199000, "quantity": 2, "image": "..." }
  ],
  "shippingFee": 22000,
  "totalAmount": 420000,
  "paymentMethod": "bank_transfer",
  "paymentStatus": "unpaid",
  "notes": "Giao giờ hành chính"
}
```

### 4.3. Xem chi tiết đơn hàng
- **Endpoint**: `GET /api/orders/{id}`

### 4.4. Cập nhật trạng thái đơn hàng
- **Endpoint**: `PUT /api/orders/{id}`
- **Quyền**: Admin
- **Request Body**:
```json
{
  "status": "shipping",
  "paymentStatus": "paid",
  "shippingProvider": "ghn",
  "trackingCode": "GHN-8625107909"
}
```

### 4.5. Xóa đơn hàng
- **Endpoint**: `DELETE /api/orders/{id}`

---

## 5. Quản Lý Khách Hàng CRM (Customers API)

### 5.1. Danh sách khách hàng (Tự động đồng bộ số đơn & chi tiêu từ DB)
- **Endpoint**: `GET /api/customers`
- **Query Params**: `page`, `limit`, `search`
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a...",
      "name": "Trần Thị Mai",
      "phone": "0912345678",
      "email": "mai.tran@gmail.com",
      "address": "123 Lê Duẩn, Đà Nẵng",
      "orderCount": 4,
      "totalSpent": 1580000,
      "createdAt": "2026-08-17T..."
    }
  ]
}
```

### 5.2. Chi tiết khách hàng kèm Lịch sử đơn hàng đã mua
- **Endpoint**: `GET /api/customers/{id}`
- **Response 200**: Trả về hồ sơ khách hàng và mảng `orders` các đơn hàng liên kết.

### 5.3. Thêm mới khách hàng
- **Endpoint**: `POST /api/customers`

### 5.4. Sửa thông tin khách hàng
- **Endpoint**: `PUT /api/customers/{id}`

### 5.5. Xóa khách hàng
- **Endpoint**: `DELETE /api/customers/{id}`

---

## 6. Báo Cáo & Thống Kê (Reports & Analytics API)

### 6.1. Báo cáo kinh doanh tổng hợp
- **Endpoint**: `GET /api/reports`
- **Query Params**:
  - `period`: `'today'` | `'yesterday'` | `'7days'` | `'30days'` | `'thisMonth'` | `'custom'`
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "totalRevenue": 48500000,
    "totalOrders": 126,
    "newCustomers": 38,
    "averageOrderValue": 384920,
    "revenueByDate": [
      { "date": "10/08", "revenue": 5200000, "orders": 12 },
      { "date": "11/08", "revenue": 7800000, "orders": 19 }
    ],
    "ordersByStatus": {
      "pending": 5,
      "confirmed": 12,
      "shipping": 28,
      "delivered": 75,
      "cancelled": 6
    },
    "topProducts": [
      { "_id": "...", "name": "Áo Polo Nam", "totalSold": 64, "revenue": 12736000 }
    ],
    "recentOrders": [...]
  }
}
```

---

## 7. Vận Chuyển & Giao Hàng (Shipping API)

### 7.1. Tính & So sánh cước 3 hãng (GHN, GHTK, ViettelPost)
- **Endpoint**: `POST /api/shipping/calculate`
- **Request Body**:
```json
{
  "province": "Hà Nội",
  "district": "Quận Cầu Giấy",
  "weight": 500,
  "orderValue": 450000
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "ghn": { "fee": 26000, "serviceName": "Giao Nhanh", "estimatedTime": "1 ngày" },
    "ghtk": { "fee": 22000, "serviceName": "Tiết Kiệm", "estimatedTime": "1 - 2 ngày" },
    "viettelpost": { "fee": 24000, "serviceName": "Tiết Kiệm", "estimatedTime": "1 - 2 ngày" }
  }
}
```

### 7.2. Tạo đơn giao hàng sang hãng & sinh mã Tracking
- **Endpoint**: `POST /api/shipping/create-order`
- **Request Body**:
```json
{
  "orderId": "67a...",
  "provider": "ghn",
  "orderData": {
    "to_name": "Nguyễn Văn A",
    "to_phone": "0987654321",
    "to_address": "Số 10 Phạm Hùng",
    "cod_amount": 420000,
    "weight": 500
  }
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Đã tạo vận đơn giao hàng thành công!",
  "data": {
    "provider": "ghn",
    "trackingCode": "GHN-8625107909",
    "fee": 26000
  }
}
```

### 7.3. Lấy cấu hình Token & Biểu phí vận chuyển
- **Endpoint**: `GET /api/shipping/config`
- **Quyền**: Admin

### 7.4. Lưu cấu hình Token & Biểu phí vận chuyển
- **Endpoint**: `POST /api/shipping/config`
- **Quyền**: Admin
- **Request Body**:
```json
{
  "ghnEnabled": true,
  "ghnToken": "ghn_token_...",
  "ghnShopId": "190234",
  "ghtkEnabled": true,
  "ghtkToken": "ghtk_token_...",
  "vtpEnabled": true,
  "vtpToken": "vtp_token_...",
  "defaultInnerFee": 22000,
  "defaultOuterFee": 32000,
  "freeShippingThreshold": 500000
}
```

---

## 8. Thanh Toán & Webhook SePay (Payment & Webhooks API)

### 8.1. Kiểm tra trạng thái thanh toán Realtime (Polling)
- **Endpoint**: `GET /api/payment/status`
- **Query Params**:
  - `orderId`: ID MongoDB của đơn hàng
  - hoặc `code`: Mã đơn hàng `#ST...`
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "orderId": "67a...",
    "orderCode": "ST466451",
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "totalAmount": 375000,
    "paymentMethod": "bank_transfer",
    "isPaid": true,
    "createdAt": "2026-08-17T..."
  }
}
```

### 8.2. Cổng tiếp nhận Webhook biến động số dư từ SePay
- **Endpoint**: `POST /api/webhooks/sepay`
- **URL Cấu hình trên SePay.vn**: `https://your-domain.com/api/webhooks/sepay`
- **Request Body mẫu từ SePay**:
```json
{
  "id": 998822,
  "gateway": "MBBank",
  "transactionDate": "2026-08-17 15:30:00",
  "accountNumber": "VQRQALASG6118",
  "transferType": "in",
  "transferAmount": 375000,
  "content": "Thanh toan don ST466451",
  "referenceCode": "FT2608179823"
}
```
- **Xử lý tự động**: Trích xuất mã đơn $\to$ Khớp số tiền $\to$ Đổi `paymentStatus: 'paid'` & `status: 'confirmed'`.
- **Response 200**: `{ "success": true }`

---

## 9. Cài Đặt & Giao Diện (Settings & Theme API)

### 9.1. Lấy cấu hình Theme & Cửa hàng
- **Endpoint**: `GET /api/settings/theme`
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "themeMode": "dark",
    "primaryColor": "#3b82f6",
    "accentColor": "#10b981",
    "siteTitle": "ShopBig - Cửa Hàng Thời Trang Cao Cấp",
    "logoText": "ShopBig",
    "bannerNotice": "🔥 Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ",
    "showBannerNotice": true,
    "contactHotline": "1900 6868",
    "contactEmail": "support@shopbig.vn",
    "contactAddress": "Số 18, Ngõ 45 Đường Cầu Giấy, Hà Nội"
  }
}
```

### 9.2. Lưu cấu hình Theme & Cửa hàng
- **Endpoint**: `POST /api/settings/theme`
- **Quyền**: Admin

---

## 10. Tiện Ích & Upload Ảnh (Utilities API)

### 10.1. Upload ảnh sản phẩm / avatar
- **Endpoint**: `POST /api/upload`
- **Request Format**: `multipart/form-data` (Field `file`) hoặc `JSON` (`{ "image": "data:image/png;base64,..." }`)
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg"
  }
}
```

### 10.2. Khởi tạo dữ liệu mẫu (Seed Data)
- **Endpoint**: `POST /api/seed`
- **Chức năng**: Khởi tạo tài khoản Admin mặc định (`admin@shopbig.vn` / `admin123`), danh mục mẫu và sản phẩm mẫu ban đầu.

---

## 11. Quản Lý Giỏ Hàng Đa Người Dùng (Cart API - Multi-User)

Hệ thống giỏ hàng hỗ trợ định danh người dùng qua **Bearer Token** (`Authorization: Bearer <token>`) HOẶC tham số **`userId`** (ID của người dùng / khách hàng).

### 11.1. Lấy thông tin giỏ hàng của User
- **Endpoint**: `GET /api/cart`
- **Headers / Query**:
  - Cách 1: `Authorization: Bearer <token>`
  - Cách 2: Query param `?userId=<user_id>`
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "_id": "67b...",
    "userId": "6a82e0d9ab45314ecf78888d",
    "items": [
      {
        "_id": "67b...",
        "productId": {
          "_id": "6a82b5a30725df6b7fa68d44",
          "name": "Sản phẫm test",
          "price": 100000,
          "salePrice": 86000,
          "images": ["https://..."]
        },
        "name": "Sản phẫm test",
        "slug": "san-pham-test",
        "image": "https://...",
        "price": 86000,
        "quantity": 2,
        "variant": {
          "name": "Màu Đen - Size XL",
          "price": 86000
        },
        "selected": true
      }
    ],
    "voucherCode": null,
    "discountAmount": 0,
    "createdAt": "2026-08-17T10:00:00.000Z",
    "updatedAt": "2026-08-17T10:05:00.000Z"
  },
  "summary": {
    "subtotal": 172000,
    "cartTotal": 202000,
    "cartCount": 2,
    "shippingFee": 30000,
    "discountAmount": 0
  }
}
```

### 11.2. Thêm sản phẩm vào giỏ hàng của User
- **Endpoint**: `POST /api/cart`
- **Headers**: `Authorization: Bearer <token>` (hoặc truyền `"userId"` trong Body)
- **Body (JSON)**:
```json
{
  "userId": "6a82e0d9ab45314ecf78888d",
  "productId": "6a82b5a30725df6b7fa68d44",
  "quantity": 1,
  "variant": {
    "name": "Màu Đen - Size XL",
    "price": 86000
  }
}
```
- **Response 201**:
```json
{
  "success": true,
  "message": "Đã thêm sản phẩm vào giỏ hàng thành công",
  "data": { ... },
  "summary": { ... }
}
```

### 11.3. Cập nhật số lượng / Tích chọn / Áp dụng Voucher
- **Endpoint**: `PUT /api/cart`
- **Headers**: `Authorization: Bearer <token>` (hoặc truyền `"userId"` trong Body)
- **Body (JSON) - Cập nhật số lượng món**:
```json
{
  "userId": "6a82e0d9ab45314ecf78888d",
  "itemId": "67b...",
  "quantity": 3
}
```
- **Body (JSON) - Áp dụng Voucher**:
```json
{
  "userId": "6a82e0d9ab45314ecf78888d",
  "voucherCode": "TIKTOK50K",
  "discountAmount": 50000
}
```

### 11.4. Xóa sản phẩm hoặc Làm trống giỏ hàng
- **Endpoint**: `DELETE /api/cart`
- **Query Params**:
  - `userId` *(Tùy chọn nếu có Header Token)*: ID người dùng
  - `itemId` *(Tùy chọn)*: ID của món đồ cần xóa. Nếu không truyền `itemId`, hệ thống sẽ xóa toàn bộ giỏ hàng của user đó.
- **Response 200**:
```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi giỏ hàng",
  "data": { ... },
  "summary": { ... }
}
```

---
*(Tài liệu được cập nhật tự động khớp 100% với mã nguồn dự án)*
