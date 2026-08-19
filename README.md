# 🛍️ ShopTik - Nền Tảng Thương Mại Điện Tử & Vận Hành Tự Động Hóa

<p align="center">
  <img src="https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&auto=format&fit=crop&q=80" alt="ShopTik Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>Hệ thống E-Commerce hiện đại tích hợp Vận chuyển GHN / GHTK và Cổng thanh toán VietQR SePay tự động 100%</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/GHN-Logistics-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GHTK-Logistics-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SePay-VietQR-purple?style=for-the-badge" />
</p>

---

## 📑 MỤC LỤC

1. [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
2. [🚀 Khởi Chạy Dự Án](#-khởi-chạy-dự-án)
3. [📦 HƯỚNG DẪN CẤU HÌNH VẬN CHUYỂN & THANH TOÁN](#-hướng-dẫn-cấu-hình-vận-chuyển--thanh-toán)
   - [3.1. Cấu Hình Giao Hàng Nhanh (GHN)](#31-cấu-hình-giao-hàng-nhanh-ghn)
   - [3.2. Cấu Hình Giao Hàng Tiết Kiệm (GHTK)](#32-cấu-hình-giao-hàng-tiết-kiệm-ghtk)
   - [3.3. Cấu Hình Thanh Toán Tự Động SePay (VietQR)](#33-cấu-hình-thanh-toán-tự-động-sepay-vietqr)
4. [🌐 Danh Sách URL Webhook Cần Cài Đặt](#-danh-sách-url-webhook-cần-cài-đặt)
5. [🔄 Luồng Vận Hành Tự Động Hóa 1-Chạm](#-luồng-vận-hành-tự-động-hóa-1-chạm)
6. [📱 Thông Tin Tài Khoản Quản Trị](#-thông-tin-tài-khoản-quản-trị)

---

## ✨ TÍNH NĂNG NỔI BẬT

- **🛒 Giao Diện Mua Sắm Khách Hàng:**
  - Trang chủ hiện đại, bộ lọc danh mục, chi tiết sản phẩm đa biến thể (màu sắc, kích cỡ).
  - Giỏ hàng thông minh, tính phí vận chuyển theo thời gian thực (Real-time).
  - **Trang Theo Dõi Đơn Hàng (`/tracking`):** Chuẩn hóa tiến trình 5 bước minh bạch, đồng bộ sản phẩm từ API và hành trình Shipper.

- **🚚 Vận Chuyển Đa Hãng (GHN & GHTK):**
  - Tự động gọi API tính cước thật theo địa chỉ khách hàng.
  - **Duyệt đơn 1-chạm:** Admin chỉ cần bấm Duyệt đơn $\rightarrow$ Tự động đẩy đơn sang hãng khách đã chọn và cấp mã vận đơn thật.
  - **Hủy đơn 2 chiều:** Hủy đơn trên web $\rightarrow$ Tự động hủy đơn trên hệ thống của hãng và dừng điều shipper.
  - **Nhận Webhook 5 bước:** Đồng bộ lộ trình bưu tá giao hàng tự động.

- **⚡ Thanh Toán Chuyển Khoản Tự Động (VietQR + SePay):**
  - Tự động sinh mã VietQR Napas247 kèm đúng số tiền và nội dung chuyển khoản `ST...`.
  - Khách chuyển tiền $\rightarrow$ SePay bắn Webhook trong 1 giây $\rightarrow$ **Tự động chuyển Paid & tự động đẩy hãng vận chuyển ngay lập tức**!

- **⚙️ Bảng Quản Trị Admin Đầy Đủ:**
  - Quản lý sản phẩm, đơn hàng, khách hàng, báo cáo doanh thu.
  - Modal quản trị cấu hình Token API & Shop ID động lưu trực tiếp vào MongoDB Atlas.

---

## 🚀 KHỞI CHẠY DỰ ÁN

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Chạy server phát triển (Development):
```bash
npm run dev
```
👉 Mở trình duyệt truy cập: **`http://localhost:3000`**

### 3. Build kiểm tra bản Production:
```bash
npm run build
```

---

## 📦 HƯỚNG DẪN CẤU HÌNH VẬN CHUYỂN & THANH TOÁN

> 🌐 **Quy Ước Tên Miền:** Thay thế `<YOUR_DOMAIN>` bằng tên miền chính thức của website (Ví dụ: `https://yourdomain.com`).

---

### 3.1. Cấu Hình Giao Hàng Nhanh (GHN)

#### 🔹 Bước 1: Lấy Token & Shop ID trên GHN
1. Đăng nhập cổng đối tác: 👉 [khachhang.ghn.vn](https://khachhang.ghn.vn) (hoặc [sso.ghn.vn](https://sso.ghn.vn)).
2. Vào **Thông tin cá nhân / Quản lý tài khoản**:
   - Copy **Token API** *(Chuỗi dạng UUID do GHN cấp)*.
   - Copy **Mã cửa hàng (Shop ID)** *(Dãy số định danh kho của bạn)*.
3. Đảm bảo mục **Địa chỉ kho** đã có địa chỉ lấy hàng và SĐT kho.

#### 🔹 Bước 2: Nhập vào Website
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/shipping`**
2. Bấm **`[⚙️ Cấu Hình Token API & Shop ID (Modal)]`** $\rightarrow$ Chọn tab **`GHN`**.
3. Dán **Token API** và **Shop ID** $\rightarrow$ Bấm **`Lưu Cấu Hình Vào Database`**.
4. Bấm nút **`[Kiểm Tra Kết Nối]`** để xác thực trực tiếp với server GHN.

---

### 3.2. Cấu Hình Giao Hàng Tiết Kiệm (GHTK)

#### 🔹 Bước 1: Lấy Token API trên GHTK
1. Đăng nhập cổng đối tác: 👉 [khachhang.giaohangtietkiem.vn](https://khachhang.giaohangtietkiem.vn).
2. Vào **Cài đặt tài khoản** $\rightarrow$ **Tích hợp API / Token API** $\rightarrow$ Copy chuỗi **Token API**.

#### 🔹 Bước 2: Nhập vào Website
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/shipping`**
2. Bấm **`[⚙️ Cấu Hình Token API & Shop ID (Modal)]`** $\rightarrow$ Chọn tab **`GHTK`**.
3. Dán **Token API** $\rightarrow$ Bấm **`Lưu Cấu Hình Vào Database`**.
4. Bấm **`[Test API GHTK]`** để xác thực trực tiếp với server GHTK.

#### 🔹 Bước 3: Cài đặt Webhook trên GHTK
1. Trên [khachhang.giaohangtietkiem.vn](https://khachhang.giaohangtietkiem.vn), vào mục **Cấu hình Webhook**.
2. Điền chính xác các ô:

| Tên Trường Trên GHTK | Giá Trị Cần Điền / Chọn |
| :--- | :--- |
| **Trạng thái \*** | Tích chọn **`◉ Hoạt động`** *(màu xanh lá)* |
| **Data format** | Chọn **`JSON`** *(hoặc `application/json`)* |
| **URL đích \*** | 👉 **`https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=ghtk`** |
| **Headers** | Để trống *(không cần điền)* |

3. Bấm **`[Lưu thông tin]`**.

---

### 3.3. Cấu Hình Thanh Toán Tự Động SePay (VietQR)

#### 🔹 Bước 1: Cấu hình Tài khoản nhận tiền trên Web
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/payment`**
2. Điền thông tin tài khoản ngân hàng của bạn:
   - **Ngân hàng:** Chọn ngân hàng thụ hưởng *(ví dụ: `MBBank`, `Vietcombank`, `Techcombank`,...)*.
   - **Số tài khoản \*:** Nhập số tài khoản ngân hàng của bạn.
   - **Tên chủ tài khoản \*:** Nhập tên chủ tài khoản in hoa không dấu *(ví dụ: `NGUYEN VAN A`)*.
3. Bấm **`[Lưu cấu hình tài khoản]`**.

#### 🔹 Bước 2: Cài đặt Webhook trên SePay
1. Đăng nhập: 👉 [my.sepay.vn](https://my.sepay.vn) $\rightarrow$ Liên kết tài khoản ngân hàng của bạn.
2. Vào **Tích hợp Webhook** $\rightarrow$ Bấm **Thêm Webhook**:

| Trường Thông Tin | Giá Trị Cần Điền |
| :--- | :--- |
| **URL Webhook (Gọi lại)** | 👉 **`https://<YOUR_DOMAIN>/api/webhooks/sepay`** |
| **Data Format** | Chọn **`JSON`** |
| **Sự kiện kích hoạt** | Tích chọn **`Giao dịch tiền vào (in)`** |
| **Phương thức** | **`POST`** |

3. Bấm **Lưu Webhook**.

---

## 🌐 DANH SÁCH URL WEBHOOK CẦN CÀI ĐẶT

| Dịch Vụ | Phương Thức | URL Webhook Listener |
| :--- | :---: | :--- |
| **Giao Hàng Nhanh (GHN)** | `POST / GET` | `https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=ghn` |
| **Giao Hàng Tiết Kiệm (GHTK)** | `POST / GET` | `https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=ghtk` |
| **Viettel Post (VTP)** | `POST / GET` | `https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=viettelpost` |
| **Thanh toán SePay VietQR** | `POST / GET` | `https://<YOUR_DOMAIN>/api/webhooks/sepay` |

> 💡 **Ghi chú:** Thay `<YOUR_DOMAIN>` bằng tên miền chính thức của website *(Ví dụ: `https://yourshop.com/api/webhooks/...`)*.

---

## 🔄 LUỒNG VẬN HÀNH TỰ ĐỘNG HÓA 1-CHẠM

```mermaid
graph TD
    A[Khách Đặt Hàng] --> B{Hình Thức Thanh Toán}
    
    B -->|1. Thanh toán COD| C[Đơn tạo trạng thái Pending]
    C --> D[Admin bấm 1 nút 'Duyệt Đơn']
    D --> E[Tự động gọi API GHN / GHTK]
    E --> F[Cấp mã vận đơn & Gọi Shipper đến lấy]
    
    B -->|2. Chuyển Khoản VietQR| G[Khách quét mã QR chuyển tiền]
    G --> H[SePay bắn Webhook trong 1s]
    H --> I[Tự động chốt Đã Thanh Toán - Paid]
    I --> E
    
    F --> J[Shipper lấy hàng & đi giao]
    J --> K[Hãng bắn Webhook về]
    K --> L[Trang /tracking nhảy 5 bước & chốt COD]
```

- **Hủy Đơn:** Khi Admin bấm **`[Hủy đơn]`** $\rightarrow$ Hệ thống tự động gửi lệnh hủy sang GHN / GHTK và dừng điều Shipper!

---

## 📱 THÔNG TIN TÀI KHOẢN QUẢN TRỊ

- **Trang Quản Trị:** `https://your-domain.com/admin`
- **Email:** `admin@shoptik.vn`
- **Mật khẩu:** `Admin@123456`
- **Tài liệu hướng dẫn chuyên sâu:** Xem file [`HUONG_DAN_CAU_HINH_GHN_GHTK_SEPAY.md`](file:///c:/Users/PC/Desktop/New%20folder/shop-landing/webbanhang/HUONG_DAN_CAU_HINH_GHN_GHTK_SEPAY.md)

---

<p align="center">
  Made with ❤️ by ShopTik Team
</p>
