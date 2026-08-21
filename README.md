# 🛍️ ShopTik - Nền Tảng Thương Mại Điện Tử & Vận Hành Tự Động Hóa Toàn Diện

<p align="center">
  <img src="https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&auto=format&fit=crop&q=80" alt="ShopTik Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>Hệ sinh thái E-Commerce thế hệ mới: Vận chuyển Đa Hãng (GHN/GHTK/VTP) • Thanh toán VietQR SePay Tự Động 100% • Marketing Pixel & Conversions API (Meta CAPI & TikTok Events API)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Meta_CAPI-v19.0-0668E1?style=for-the-badge&logo=facebook" alt="Meta CAPI" />
  <img src="https://img.shields.io/badge/TikTok_Events_API-v1.3-000000?style=for-the-badge&logo=tiktok" alt="TikTok Events API" />
  <img src="https://img.shields.io/badge/GHN-Logistics-orange?style=for-the-badge" alt="GHN" />
  <img src="https://img.shields.io/badge/GHTK-Logistics-green?style=for-the-badge" alt="GHTK" />
  <img src="https://img.shields.io/badge/SePay-VietQR-purple?style=for-the-badge" alt="SePay" />
</p>

---

## 📑 MỤC LỤC

1. [✨ Tổng Quan & Tính Năng Nổi Bật](#-tổng-quan--tính-năng-nổi-bật)
2. [🚀 Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
3. [⚙️ Hướng Dẫn Cấu Hình Vận Hành Chi Tiết](#️-hướng-dẫn-cấu-hình-vận-hành-chi-tiết)
   - [3.1. Cấu Hình Giao Hàng Nhanh (GHN)](#31-cấu-hình-giao-hàng-nhanh-ghn)
   - [3.2. Cấu Hình Giao Hàng Tiết Kiệm (GHTK)](#32-cấu-hình-giao-hàng-tiết-kiệm-ghtk)
   - [3.3. Cấu Hình Viettel Post (VTP)](#33-cấu-hình-viettel-post-vtp)
   - [3.4. Cấu Hình Thanh Toán Chuyển Khoản Tự Động SePay (VietQR)](#34-cấu-hình-thanh-toán-chuyển-khoản-tự-động-sepay-vietqr)
   - [3.5. Cấu Hình Facebook Pixel & Meta Conversions API (CAPI)](#35-cấu-hình-facebook-pixel--meta-conversions-api-capi)
   - [3.6. Cấu Hình TikTok Pixel & TikTok Events API](#36-cấu-hình-tiktok-pixel--tiktok-events-api)
   - [3.7. Cấu Hình Gửi Email Thông Báo (Gmail SMTP / Nodemailer)](#37-cấu-hình-gửi-email-thông-báo-gmail-smtp--nodemailer)
4. [🌐 Danh Sách URL Webhook Toàn Hệ Thống](#-danh-sách-url-webhook-toàn-hệ-thống)
5. [🔄 Luồng Vận Hành Tự Động Hóa 1-Chạm](#-luồng-vận-hành-tự-động-hóa-1-chạm)
6. [📱 Thông Tin Tài Khoản Quản Trị](#-thông-tin-tài-khoản-quản-trị)

---

## ✨ TỔNG QUAN & TÍNH NĂNG NỔI BẬT

### 🛍️ 1. Trải Nghiệm Mua Sắm Khách Hàng (Storefront)
- **Giao diện hiện đại & mượt mà:** Xây dựng trên Next.js 15 App Router, tải trang tức thì, hỗ trợ Responsive toàn diện trên Mobile / Tablet / Desktop.
- **Biến thể sản phẩm đa tầng:** Chọn màu sắc, kích cỡ, chất liệu với hình ảnh và mức giá biến thể linh hoạt.
- **Lựa chọn Đơn vị Vận chuyển thông minh tại Checkout:** Khách hàng trực tiếp chọn hãng vận chuyển yêu thích (GHN, GHTK, Viettel Post...), xem thời gian giao hàng dự kiến và phí ship tương ứng (tự động áp dụng Freeship khi đạt ngưỡng đơn hàng).
- **Cổng thanh toán quét mã VietQR Napas247:** Tự sinh mã QR ngân hàng kèm số tiền và mã đơn hàng `ST...`. Khách chuyển khoản $\rightarrow$ Hệ thống tự động xác nhận trong 1 giây mà không cần chụp màn hình chuyển khoản!
- **Tra cứu lộ trình đơn hàng (`/tracking`):** Tiến trình 5 bước minh bạch, tích hợp tra cứu hành trình Shipper và danh sách sản phẩm.

### 🚚 2. Vận Chuyển Đa Hãng Tự Động Hóa (GHN / GHTK / Viettel Post)
- **Tính cước động theo vị trí địa lý:** Gọi API tính phí chuẩn theo Tỉnh / Thành phố / Quận / Huyện.
- **Xuất đơn 1-Click tại Admin (`/admin/orders`):** Hệ thống tự động nhận diện đúng hãng khách hàng đã chọn tại Checkout. Admin chỉ cần 1 cú click là đơn được đẩy sang bưu cục và cấp mã vận đơn thật.
- **Cơ chế Fallback thông minh:** Tự động sinh mã vận đơn dự phòng nội bộ nếu API hãng tạm thời bảo trì hoặc chạm giới hạn tài khoản.
- **Hủy đơn 2 chiều:** Hủy đơn trên web $\rightarrow$ Tự động gửi tín hiệu hủy sang hệ thống hãng vận chuyển và dừng điều phối shipper.

### 📊 3. Đo Lường Marketing & Chuyển Đổi Nâng Cao (Meta CAPI & TikTok Events API)
- **Cơ chế đo lường kép Song Song (Client + Server):**
  - **Client-side Pixel:** Ghi nhận hành vi `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.
  - **Server-side Conversions API:** Máy chủ tự động băm bảo mật SHA-256 (Email, SĐT, IP, User Agent, ttclid) và gửi thẳng sang Meta Graph API v19.0 & TikTok Business API v1.3.
- **Khử trùng lặp 100% (Event Deduplication):** Sử dụng chung mã `event_id` độc nhất cho mỗi lượt hành động, chống tính trùng số liệu đơn hàng.
- **Khắc phục rào cản AdBlock & iOS 14.5+:** Đảm bảo chiến dịch Facebook Ads & TikTok Ads nhận đủ 100% dữ liệu chuyển đổi để tối ưu hóa giá thầu CPA.
- **Báo cáo Phễu Chuyển Đổi Realtime:** Phân tích trực quan tỷ lệ rớt phễu qua từng bước từ Xem hàng $\rightarrow$ Thêm giỏ $\rightarrow$ Checkout $\rightarrow$ Mua hàng thành công.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

### 1. Yêu cầu môi trường:
- **Node.js:** `>= 18.17.0` (Khuyên dùng Node 20.x hoặc 22.x LTS)
- **MongoDB:** Cụm MongoDB Atlas Cloud hoặc MongoDB Local.

### 2. Cài đặt mã nguồn & dependencies:
```bash
# Clone repository
git clone https://github.com/An07dev/AFF-Store.git
cd AFF-Store

# Cài đặt thư viện
npm install
```

### 3. Cấu hình biến môi trường (`.env.local`):
Tạo file `.env.local` tại thư mục gốc với các thông số mẫu:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/webstore?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Vận chuyển (Tùy chọn nạp tĩnh hoặc quản lý động qua /admin/shipping)
GHN_TOKEN=your-ghn-token
GHN_SHOP_ID=your-ghn-shop-id
GHTK_TOKEN=your-ghtk-token

# Thanh toán VietQR
NEXT_PUBLIC_VIETQR_BANK=MSB
NEXT_PUBLIC_VIETQR_ACCOUNT_NO=0528438642
NEXT_PUBLIC_VIETQR_ACCOUNT_NAME="LE VAN AN"
SEPAY_API_KEY=your-sepay-api-key
```

### 4. Khởi chạy máy chủ phát triển (Development):
```bash
npm run dev
```
👉 Mở trình duyệt truy cập: **`http://localhost:3000`**

### 5. Build kiểm tra bản Production:
```bash
npm run build
npm run start
```

---

## ⚙️ HƯỚNG DẪN CẤU HÌNH VẬN HÀNH CHI TIẾT

> 🌐 **Lưu ý:** Thay thế `<YOUR_DOMAIN>` bằng tên miền thật của bạn (Ví dụ: `https://shoptik.vn`).

---

### 3.1. Cấu Hình Giao Hàng Nhanh (GHN)

#### 🔹 Bước 1: Lấy Token API & Shop ID
1. Đăng nhập cổng đối tác: 👉 [khachhang.ghn.vn](https://khachhang.ghn.vn).
2. Vào **Quản lý tài khoản / Thông tin cá nhân**:
   - Copy chuỗi **Token API**.
   - Copy **Mã cửa hàng (Shop ID)**.
3. Đảm bảo mục **Địa chỉ kho lấy hàng** đã có địa chỉ và SĐT kho chính xác.

#### 🔹 Bước 2: Nhập vào Website
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/shipping`**
2. Bấm **`[⚙️ Cấu Hình Token API & Shop ID]`** $\rightarrow$ Chọn tab **GHN**.
3. Dán **Token API** và **Shop ID** $\rightarrow$ Bấm **Lưu cấu hình**.
4. Bấm **`[Kiểm Tra Kết Nối]`** để kiểm tra phản hồi trực tiếp từ server GHN.

---

### 3.2. Cấu Hình Giao Hàng Tiết Kiệm (GHTK)

#### 🔹 Bước 1: Lấy Token API
1. Đăng nhập cổng đối tác: 👉 [khachhang.giaohangtietkiem.vn](https://khachhang.giaohangtietkiem.vn).
2. Vào **Cài đặt tài khoản** $\rightarrow$ **Tích hợp API** $\rightarrow$ Copy chuỗi **Token API**.

#### 🔹 Bước 2: Nhập vào Website
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/shipping`** $\rightarrow$ Chọn tab **GHTK**.
2. Dán **Token API** $\rightarrow$ Bấm **Lưu cấu hình**.

#### 🔹 Bước 3: Cài đặt Webhook trên GHTK
1. Trên cổng GHTK, vào mục **Cấu hình Webhook** và điền:
   - **Trạng thái:** Tích chọn `◉ Hoạt động`.
   - **Data format:** Chọn `JSON`.
   - **URL đích:** 👉 **`https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=ghtk`**
2. Bấm **Lưu thông tin**.

---

### 3.3. Cấu Hình Viettel Post (VTP)

1. Đăng nhập: 👉 [viettelpost.vn](https://viettelpost.vn).
2. Lấy **Token API** hoặc tài khoản Partner.
3. Mở **`https://<YOUR_DOMAIN>/admin/shipping`** $\rightarrow$ Chọn tab **Viettel Post** ➔ Dán thông tin và Lưu cấu hình.
4. Cài đặt Webhook URL trên Viettel Post: 👉 **`https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=viettelpost`**.

---

### 3.4. Cấu Hình Thanh Toán Chuyển Khoản Tự Động SePay (VietQR)

#### 🔹 Bước 1: Cấu hình Tài khoản nhận tiền trên Web
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/payment`**
2. Điền thông tin ngân hàng của bạn:
   - **Ngân hàng:** Chọn ngân hàng thụ hưởng (MBBank, Vietcombank, Techcombank, MSB, ACB...).
   - **Số tài khoản:** Nhập chính xác số tài khoản.
   - **Tên chủ tài khoản:** Nhập tên in hoa không dấu (Ví dụ: `LE VAN AN`).
3. Bấm **Lưu cấu hình tài khoản**.

#### 🔹 Bước 2: Tạo Webhook trên SePay
1. Đăng nhập: 👉 [my.sepay.vn](https://my.sepay.vn) $\rightarrow$ Liên kết tài khoản ngân hàng của bạn.
2. Vào mục **Tích hợp Webhook** $\rightarrow$ Bấm **Thêm Webhook**:
   - **URL Webhook (Gọi lại):** 👉 **`https://<YOUR_DOMAIN>/api/webhooks/sepay`**
   - **Data Format:** Chọn **`JSON`**
   - **Sự kiện kích hoạt:** Tích chọn **`Giao dịch tiền vào (in)`**
   - **Phương thức:** **`POST`**
3. Bấm **Lưu Webhook**.

---

### 3.5. Cấu Hình Facebook Pixel & Meta Conversions API (CAPI)

#### 🔹 Bước 1: Tạo Tập Dữ Liệu (Dataset / Pixel) trên Meta
1. Truy cập Cài đặt doanh nghiệp: 👉 [business.facebook.com/latest/settings/events_dataset_and_pixel](https://business.facebook.com/latest/settings/events_dataset_and_pixel).
2. Tại mục **Tập dữ liệu và pixel** $\rightarrow$ Bấm **`[+ Thêm]`**.
3. Đặt tên (Ví dụ: `ShopTik Pixel`) $\rightarrow$ Bấm **Tạo**.
4. **Gán quyền Quản trị viên (Bắt buộc):** Tích chọn tên tài khoản Facebook của bạn ➔ Bật **Toàn quyền kiểm soát** ➔ Bấm **Chỉ định**.
5. Copy **ID tập dữ liệu (Pixel ID)** *(Dãy số 15-16 chữ số, ví dụ: `1704901287459412`)*.

#### 🔹 Bước 2: Tạo Conversions API Access Token
1. Bấm **`[Mở trong Trình quản lý sự kiện]`** (Events Manager).
2. Chọn tab **Cài đặt (Settings)** $\rightarrow$ Cuộn xuống mục **API chuyển đổi (Conversions API)**.
3. Tại phần *Thiết lập thủ công* $\rightarrow$ Bấm **`[Tạo mã truy cập]`** *(Generate access token)*.
4. Copy mã token dài bắt đầu bằng **`EAAB...`**.

#### 🔹 Bước 3: Lấy Mã Thử Nghiệm (Test Event Code - Khi test)
1. Trong Events Manager, chuyển sang tab **Thử nghiệm sự kiện (Test events)**.
2. Mở mục **"Xác nhận rằng sự kiện của máy chủ được thiết lập đúng cách"** ➔ Copy mã **`TESTxxxxx`**.

#### 🔹 Bước 4: Nhập Cấu Hình Vào Website
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/marketing`** $\rightarrow$ Chọn tab **Facebook Pixel & CAPI**.
2. Gạt sang **Đang Bật**, điền Pixel ID, CAPI Token, Mã TEST ➔ Bấm **Lưu cấu hình**.
3. Bấm nút: **`[🧪 Gửi sự kiện test lên Facebook CAPI]`** để xác thực nhận phản hồi `status: 200` từ Meta!
4. **Vận hành thực tế:** Sau khi test thành công, chỉ cần xóa trống ô Mã TEST và bấm Lưu lại.

---

### 3.6. Cấu Hình TikTok Pixel & TikTok Events API

#### 🔹 Bước 1: Tạo Pixel trên TikTok Ads Manager
1. Truy cập: 👉 [ads.tiktok.com/i18n/event_manager](https://ads.tiktok.com/i18n/event_manager).
2. Bấm **`[Connect data source]`** $\rightarrow$ Chọn **`Web`** $\rightarrow$ Bấm **Next**.
3. Chọn **Thiết lập thủ công** $\rightarrow$ Chọn **`API Pixel và Sự kiện TikTok (Khuyến khích)`**.
4. Đặt tên Pixel (Ví dụ: `ShopTik TikTok Pixel`) $\rightarrow$ Bấm **Tạo nên**.
5. Copy **TikTok Pixel ID** *(Ví dụ: `DA3SC0BC77UC1JSQM8E0`)*.

#### 🔹 Bước 2: Bật Đối Sánh Nâng Cao (AAM) & Chọn Phễu E-commerce
1. Bật công tắc **`Đối sánh nâng cao tự động (AAM)`**.
2. Chọn mẫu phễu **`E-commerce`** (Thương mại điện tử) $\rightarrow$ Bấm **Kế tiếp**.

#### 🔹 Bước 3: Tạo TikTok Events API Access Token
1. Tại bước *Triển khai API Sự kiện*, mục **1. Tạo mã truy cập** $\rightarrow$ Bấm nút màu đen: **`[Tạo mã truy cập]`**.
2. Copy chuỗi Access Token dài $\rightarrow$ Bấm **Kế tiếp** ➔ Bấm **Hoàn thành**.

#### 🔹 Bước 4: Nhập Cấu Hình Vào Website & Test
1. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/marketing`** $\rightarrow$ Chọn tab **TikTok Pixel & Events API**.
2. Gạt sang **Đang Bật**, điền Pixel ID và Token $\rightarrow$ Bấm **Lưu cấu hình**.
3. Bấm nút màu hồng: **`[🧪 Gửi sự kiện test lên TikTok Events API]`** ➔ Nhận phản hồi `code: 0, message: "OK"` từ TikTok!

---

### 3.7. Cấu Hình Gửi Email Thông Báo (Gmail SMTP / Nodemailer)

1. Đăng nhập Gmail gửi thư và đảm bảo đã bật **Xác minh 2 bước** tại: 👉 [myaccount.google.com/security](https://myaccount.google.com/security).
2. Tạo mật khẩu ứng dụng tại: 👉 [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) ➔ Copy chuỗi 16 ký tự.
3. Mở trang quản trị: 👉 **`https://<YOUR_DOMAIN>/admin/settings`** $\rightarrow$ Tab **Cấu Hình Email (SMTP)**:
   - **Tài khoản Email gửi:** Điền địa chỉ Gmail (vd: `cuahang.shoptik@gmail.com`).
   - **Mật khẩu SMTP:** Dán chuỗi 16 ký tự vừa tạo.
   - **Email Admin nhận thông báo:** Điền email của chủ shop.
4. Bấm **Lưu Cấu Hình Email** và bấm **`[Gửi Thử Email]`** để kiểm tra gửi thư tức thì.

---

## 🌐 DANH SÁCH URL WEBHOOK TOÀN HỆ THỐNG

| Dịch Vụ / Đối Tác | Phương Thức | URL Webhook Listener | Mục Đích Sử Dụng |
| :--- | :---: | :--- | :--- |
| **Giao Hàng Nhanh (GHN)** | `POST` | `https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=ghn` | Cập nhật lộ trình bưu tá GHN |
| **Giao Hàng Tiết Kiệm (GHTK)** | `POST` | `https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=ghtk` | Cập nhật lộ trình bưu tá GHTK |
| **Viettel Post (VTP)** | `POST` | `https://<YOUR_DOMAIN>/api/webhooks/shipping?carrier=viettelpost` | Cập nhật lộ trình bưu tá Viettel Post |
| **Thanh toán SePay VietQR** | `POST` | `https://<YOUR_DOMAIN>/api/webhooks/sepay` | Tự động xác nhận thanh toán Paid trong 1s |

---

## 🔄 LUỒNG VẬN HÀNH TỰ ĐỘNG HÓA 1-CHẠM

```mermaid
graph TD
    A[Khách Đặt Hàng tại Checkout] --> B[Chọn ĐVVC & Tính Phí Ship Tự Động]
    B --> C{Hình Thức Thanh Toán}
    
    C -->|1. Thanh toán COD| D[Đơn tạo trạng thái Pending]
    D --> E[Admin bấm 1-Click Xuất Vận Đơn]
    E --> F[API Hãng cấp Mã Vận Đơn Thật]
    
    C -->|2. Chuyển Khoản VietQR| G[Khách quét mã VietQR Napas247]
    G --> H[SePay bắn Webhook trong 1s]
    H --> I[Hệ thống tự đổi sang Đã Thanh Toán - Paid]
    I --> E
    
    F --> J[Shipper đến kho lấy hàng]
    J --> K[Webhook hãng gửi cập nhật lộ trình]
    K --> L[Trang /tracking nhảy 5 bước Realtime]
    
    A -.-> M[Máy chủ phát Meta CAPI & TikTok Events API]
    M -.-> N[Tối ưu hóa giá thầu Ads & Chống rớt đơn]
```

- **Hủy Đơn 2 Chiều:** Khi đơn bị hủy trên website $\rightarrow$ Hệ thống tự động gửi lệnh hủy API sang GHN/GHTK để hủy vận đơn và dừng điều shipper.

---

## 📱 THÔNG TIN TÀI KHOẢN QUẢN TRỊ

- **Trang Quản Trị:** `https://<YOUR_DOMAIN>/admin`
- **Tài khoản Admin mặc định:**
  - **Email:** `admin@shoptik.vn`
  - **Mật khẩu:** `Admin@123456`
- **File hướng dẫn bổ sung:** Xem chi tiết tại [`HUONG_DAN_CAU_HINH_GHN_GHTK_SEPAY.md`](file:///c:/Users/PC/Desktop/New%20folder/shop-landing/webbanhang/HUONG_DAN_CAU_HINH_GHN_GHTK_SEPAY.md).

---

<p align="center">
  Made with ❤️ by ShopTik Engineering Team
</p>
