# HƯỚNG DẪN CẤU HÌNH TÍCH HỢP GHN, GHTK VÀ SEPAY (VIETQR)
## Dành Cho Cả Hệ Thống Quản Trị Website & Cổng Đối Tác Bên Thứ 3

Tài liệu này hướng dẫn chi tiết từng bước cấu hình kết nối API, lấy Token, cài đặt Webhook tự động và vận hành hệ thống vận chuyển **Giao Hàng Nhanh (GHN)**, **Giao Hàng Tiết Kiệm (GHTK)** cùng **Cổng thanh toán tự động SePay VietQR**.

---

## 📑 MỤC LỤC

1. [Tổng Quan Cơ Chế Tự Động Hóa 2 Chiều](#1-tổng-quan-cơ-chế-tự-động-hóa-2-chiều)
2. [Cấu Hình Giao Hàng Nhanh (GHN)](#2-cấu-hình-giao-hàng-nhanh-ghn)
   - 2.1. Thao tác trên Cổng Đối Tác GHN
   - 2.2. Thao tác trên Trang Quản Trị Website
3. [Cấu Hình Giao Hàng Tiết Kiệm (GHTK)](#3-cấu-hình-giao-hàng-tiết-kiệm-ghtk)
   - 3.1. Thao tác trên Cổng Đối Tác GHTK (Điền form Webhook)
   - 3.2. Thao tác trên Trang Quản Trị Website
4. [Cấu Hình Cổng Thanh Toán Tự Động SePay & VietQR](#4-cấu-hình-cổng-thanh-toán-tự-động-sepay--vietqr)
   - 4.1. Thao tác trên Cổng SePay (my.sepay.vn)
   - 4.2. Thao tác trên Trang Quản Trị Website
5. [Danh Sách URL Webhook Toàn Hệ Thống](#5-danh-sách-url-webhook-toàn-hệ-thống)
6. [Quy Trình Vận Hành Thực Tế (Duyệt Đơn, Điều Shipper, Hủy Đơn)](#6-quy-trình-vận-hành-thực-tế-duyệt-đơn-điều-shipper-hủy-đơn)

---

## 1. TỔNG QUAN CƠ CHẾ TỰ ĐỘNG HÓA 2 CHIỀU

Website của bạn được xây dựng với cơ chế tự động hóa hoàn toàn:
- **Tự động tính cước:** Khách nhập địa chỉ nhận hàng $\rightarrow$ Hệ thống tự gọi API GHN/GHTK lấy giá cước và thời gian giao hàng thực tế.
- **Tự động đẩy đơn 1-Chạm:** Khách đặt đơn $\rightarrow$ Admin bấm **Duyệt Đơn** (hoặc khách quét mã QR chuyển khoản thành công) $\rightarrow$ Hệ thống tự động tạo mã vận đơn với hãng và phân tuyến cho Shipper đến lấy hàng.
- **Tự động hủy đơn 2 chiều:** Khi Admin bấm **Hủy đơn** trên Web $\rightarrow$ Tự động gửi lệnh hủy mã vận đơn sang máy chủ của hãng.
- **Tự động cập nhật 5 bước:** Shipper lấy hàng, đi phát, giao xong $\rightarrow$ Hãng bắn Webhook về $\rightarrow$ Trang `/tracking` tự động nhảy tiến trình và chốt thanh toán COD sang `Paid`.

---

## 2. CẤU HÌNH GIAO HÀNG NHANH (GHN)

### 2.1. Thao Tác Trên Cổng Đối Tác GHN (khachhang.ghn.vn)
1. Đăng nhập vào: 👉 [khachhang.ghn.vn](https://khachhang.ghn.vn) (hoặc [sso.ghn.vn](https://sso.ghn.vn)).
2. **Lấy Token API & Shop ID:**
   - Vào mục **Thông tin cá nhân / Quản lý tài khoản**.
   - Copy chuỗi **Token API** (Ví dụ: `f49c1538-9a10-11f1-98fd-3649f7abce24`).
   - Copy **Mã cửa hàng (Shop ID)** (Ví dụ: `6611723`).
3. **Cài đặt Kho Lấy Hàng:**
   - Vào mục **Quản lý cửa hàng / Địa chỉ kho**.
   - Đảm bảo đã có ít nhất 1 địa chỉ kho và Số điện thoại liên hệ để bưu tá đến lấy hàng.
4. **Cài đặt Nhận Tiền Đối Soát (COD):**
   - Vào mục **Thông tin ngân hàng** $\rightarrow$ Điền số tài khoản ngân hàng để GHN chuyển khoản tiền thu hộ COD định kỳ.

### 2.2. Thao Tác Trên Trang Quản Trị Website (/admin/shipping)
1. Truy cập: 👉 `http://localhost:3000/admin/shipping`
2. Bấm nút **`[⚙️ Cấu Hình Token API & Shop ID (Modal)]`**.
3. Chọn Tab **`GHN (Giao Hàng Nhanh)`**:
   - **Bật kích hoạt:** Tích chọn `Bật kết nối`
   - **Môi trường:** Chọn `Production (Thật)`
   - **Token API:** Dán Token API GHN của bạn
   - **Shop ID:** Dán Shop ID GHN của bạn
4. Bấm **`[Lưu Cấu Hình Vào Database]`**.
5. Bấm nút **`[Kiểm Tra Kết Nối]`** $\rightarrow$ Hệ thống sẽ xác thực với server GHN và báo: `✓ Kết nối GHN thành công! Token hợp lệ (Có X cửa hàng trong tài khoản)`.

---

## 3. CẤU HÌNH GIAO HÀNG TIẾT KIỆM (GHTK)

### 3.1. Thao Tác Trên Cổng Đối Tác GHTK (khachhang.giaohangtietkiem.vn)
1. Đăng nhập vào: 👉 [khachhang.giaohangtietkiem.vn](https://khachhang.giaohangtietkiem.vn).
2. **Lấy Token API:**
   - Vào mục **Cài đặt tài khoản** $\rightarrow$ **Tích hợp API / Token API**.
   - Copy chuỗi **Token API** của bạn (Ví dụ: `4NH4Qx1qc4M1FRbYh1o2aRJgwWZH3Hc0xRVdMoG`).
3. **Cấu Hình Webhook Bắn Dữ Liệu Về Web:**
   - Vào mục **Cấu hình Webhook** $\rightarrow$ Bấm chỉnh sửa.
   - Điền chính xác các ô như sau:

| Tên Trường Trên GHTK | Giá Trị Cần Điền / Chọn |
| :--- | :--- |
| **Trạng thái \*** | Tích chọn **`◉ Hoạt động`** *(màu xanh lá)* |
| **Data format** | Chọn **`JSON`** *(hoặc `application/json`)* |
| **URL đích \*** | 👉 `https://nicotine-mumbling-detract.ngrok-free.dev/api/webhooks/shipping?carrier=ghtk` |
| **Headers** | Để trống *(không cần điền gì)* |

   - Bấm **`[Lưu thông tin]`**.

### 3.2. Thao Tác Trên Trang Quản Trị Website (/admin/shipping)
1. Truy cập: 👉 `http://localhost:3000/admin/shipping`
2. Bấm nút **`[⚙️ Cấu Hình Token API & Shop ID (Modal)]`**.
3. Chọn Tab **`GHTK`**:
   - **Bật kích hoạt:** Tích chọn `Bật kết nối`
   - **Môi trường:** Chọn `Production (Thật)`
   - **Token API:** Dán Token API GHTK của bạn
4. Bấm **`[Lưu Cấu Hình Vào Database]`**.
5. Bấm nút **`[Kiểm Tra Kết Nối]`** $\rightarrow$ Hệ thống gọi trực tiếp server GHTK và báo: `✓ Kết nối GHTK thành công! Token API hợp lệ và hoạt động bình thường`.

---

## 4. CẤU HÌNH CỔNG THANH TOÁN TỰ ĐỘNG SEPAY & VIETQR

### 4.1. Thao Tác Trên Cổng SePay (my.sepay.vn)
1. Đăng ký tài khoản và đăng nhập: 👉 [my.sepay.vn](https://my.sepay.vn).
2. **Liên kết Ngân Hàng:** Kết nối tài khoản ngân hàng của bạn (MBBank, Vietcombank, Techcombank, ACB, VPBank,...) để SePay nhận diện biến động số dư.
3. **Cài Đặt Webhook:**
   - Vào menu **Tích hợp Webhook** $\rightarrow$ Bấm **Thêm Webhook**.
   - Điền các thông tin:

| Trường Thông Tin | Giá Trị Cần Điền |
| :--- | :--- |
| **URL Webhook (Gọi lại)** | 👉 `https://nicotine-mumbling-detract.ngrok-free.dev/api/webhooks/sepay` |
| **Data Format** | Chọn **`JSON`** |
| **Sự kiện kích hoạt** | Tích chọn **`Giao dịch tiền vào (in)`** |
| **Phương thức** | **`POST`** |
| **API Key / Secret** | *(Để trống hoặc copy mã API Key dán vào ô SePay Token trên web)* |

   - Bấm **Lưu Webhook**.

### 4.2. Thao Tác Trên Trang Quản Trị Website (/admin/payment)
1. Truy cập: 👉 `http://localhost:3000/admin/payment`
2. Điền thông tin tài khoản thụ hưởng:
   - **Ngân hàng thụ hưởng:** Chọn ngân hàng tương ứng *(Ví dụ: `MBBank`)*
   - **Số tài khoản ngân hàng \*:** Nhập số tài khoản *(Ví dụ: `0528438642`)*
   - **Tên chủ tài khoản \*:** Nhập tên in hoa không dấu *(Ví dụ: `LE VAN AN`)*
3. Bấm **`[Lưu cấu hình tài khoản]`**.
4. Website sẽ tự động tạo mã **VietQR chuẩn Napas247** tự điền số tiền và mã đơn khi khách hàng thanh toán chuyển khoản.

---

## 5. DANH SÁCH URL WEBHOOK TOÀN HỆ THỐNG

| Dịch Vụ | Phương Thức | URL Webhook Listener |
| :--- | :---: | :--- |
| **Giao Hàng Nhanh (GHN)** | `POST / GET` | `https://nicotine-mumbling-detract.ngrok-free.dev/api/webhooks/shipping?carrier=ghn` |
| **Giao Hàng Tiết Kiệm (GHTK)** | `POST / GET` | `https://nicotine-mumbling-detract.ngrok-free.dev/api/webhooks/shipping?carrier=ghtk` |
| **Viettel Post (VTP)** | `POST / GET` | `https://nicotine-mumbling-detract.ngrok-free.dev/api/webhooks/shipping?carrier=viettelpost` |
| **Thanh toán SePay VietQR** | `POST / GET` | `https://nicotine-mumbling-detract.ngrok-free.dev/api/webhooks/sepay` |

> 💡 **Ghi chú Triển Khai Thực Tế:**  
> Khi bạn chuyển sang chạy trên domain chính thức (Production), chỉ cần thay thế phần đầu domain ngrok bằng tên miền chính thức của bạn (Ví dụ: `https://tenmiencuaban.com/api/webhooks/...`).

---

## 6. QUY TRÌNH VẬN HÀNH THỰC TẾ (DUYỆT ĐƠN, ĐIỀU SHIPPER, HỦY ĐƠN)

### 🛒 1. Đối Với Đơn Hàng COD (Thanh Toán Khi Nhận Hàng):
1. Khách đặt đơn $\rightarrow$ Đơn tạo ở trạng thái `pending`.
2. Admin mở trang chi tiết đơn hàng $\rightarrow$ Bấm nút **`[✓ Duyệt Đơn & Đẩy Sang Hãng]`**:
   - Hệ thống tự động gọi API của hãng khách chọn (GHN hoặc GHTK).
   - Tự động lấy mã vận đơn thật *(ví dụ: `GY844QKV` hoặc `S23147495...`)* và gắn vào đơn.
   - Đơn chuyển sang **`Chờ lấy hàng (Ready to pick)`** trên app bưu tá để Shipper đến lấy hàng.
3. Khi Shipper quét lấy hàng $\rightarrow$ Giao hàng $\rightarrow$ Webhook tự động đồng bộ sang trang `/tracking`.

---

### ⚡ 2. Đối Với Đơn Hàng Chuyển Khoản VietQR (Tự Động 100% Không Cần Admin Bấm):
1. Khách quét mã VietQR trên trang `/payment` để chuyển tiền.
2. Tiền vào tài khoản ngân hàng $\rightarrow$ SePay nhận và bắn Webhook về website trong 1 giây.
3. Hệ thống tự động:
   - ✅ Đổi trạng thái thanh toán thành **`Đã thanh toán (Paid)`**.
   - ✅ **Tự động duyệt đơn (`Confirmed`) và tự động đẩy sang GHN / GHTK** để cấp mã vận đơn thật.
   - ✅ Shipper tự động nhận lệnh đến lấy hàng mà Admin không cần thao tác gì!

---

### ❌ 3. Đối Với Việc Hủy Đơn Hàng:
- Khi Admin bấm **`[Hủy đơn]`** trên website:
  - Trạng thái trên web chuyển thành `Đã hủy (Cancelled)`.
  - Hệ thống **tự động gọi API hủy sang GHN hoặc GHTK** để hủy mã vận đơn và dừng điều Shipper.

---

### 🔍 4. Cách Tra Cứu Đơn Hàng Phía Hãng Vận Chuyển:
- **Giao Hàng Nhanh (GHN):** Tra cứu tại 👉 [donhang.ghn.vn](https://donhang.ghn.vn) hoặc mục *Quản lý đơn hàng* trên [khachhang.ghn.vn](https://khachhang.ghn.vn).
- **Giao Hàng Tiết Kiệm (GHTK):** Tra cứu tại 👉 [i.ghtk.vn](https://i.ghtk.vn) hoặc mục *Vận hành* trên [khachhang.giaohangtietkiem.vn](https://khachhang.giaohangtietkiem.vn).
- **Khách Hàng Tra Cứu 5 Bước:** Tra cứu tại 👉 `http://localhost:3000/tracking?code=MÃ_ĐƠN`.
