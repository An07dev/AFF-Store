# 📋 TỔNG HỢP CÁC TÍNH NĂNG ĐÃ HOÀN THIỆN (COMPLETED FEATURES)
> **Dự án:** ShopTik / Football Store - Nền tảng Thương mại Điện tử Đa kênh & Bán lẻ Trực tuyến  
> **Công nghệ:** Next.js (App Router), React, TypeScript, MongoDB Atlas (Mongoose), Socket.io, Nodemailer, VietQR & SePay Webhook.

---

## 🌟 MỤC LỤC TÍNH NĂNG
1. [Trải Nghiệm Khách Hàng (Storefront)](#1-trải-nghiệm-khách-hàng-storefront)
2. [Hệ Thống Quản Trị (Admin Portal)](#2-hệ-thống-quản-trị-admin-portal)
3. [Hệ Thống Thanh Toán Tự Động (Payment & VietQR)](#3-hệ-thống-thanh-toán-tự-động-payment--vietqr)
4. [Tích Hợp Vận Chuyển Đa Đơn Vị (Multi-Carrier Shipping)](#4-tích-hợp-vận-chuyển-đa-đơn-vị-multi-carrier-shipping)
5. [Thông Báo Đơn Hàng Qua Email (Automated Email Invoice)](#5-thông-báo-đơn-hàng-qua-email-automated-email-invoice)
6. [Hệ Thống Chat CSKH Real-Time (Socket.io)](#6-hệ-thống-chat-cskh-real-time-socketio)
7. [Bảo Mật & Quản Lý Phiên Làm Việc (Authentication & Security)](#7-bảo-mật--quản-lý-phiên-làm-việc-authentication--security)
8. [Cơ Sở Dữ Liệu & Hạ Tầng API (Backend & Infrastructure)](#8-cơ-sở-dữ-liệu--hạ-tầng-api-backend--infrastructure)

---

## 1. Trải Nghiệm Khách Hàng (Storefront)

### 1.1. Trang Chủ & Duyệt Sản Phẩm (`/`)
- **Banner Hero:** Hiển thị chương trình khuyến mãi, sự kiện nổi bật với hiệu ứng thị giác bắt mắt.
- **Bộ Lọc Thông Minh (Smart Filter):**
  - Lọc theo danh mục sản phẩm (Thời trang Nam, Nữ, Phụ kiện, Giày dép...).
  - Lọc theo khoảng giá linh hoạt.
  - Sắp xếp: Giá tăng dần, Giá giảm dần, Sản phẩm mới nhất, Bán chạy nhất.
- **Tìm Kiếm Sản Phẩm (Search Bar):** Tìm kiếm tức thì theo từ khóa tên sản phẩm.
- **Thẻ Sản Phẩm (Product Card):**
  - Hiển thị ảnh sắc nét, tên, giá gốc, giá khuyến mãi (sale tag), số lượng đã bán, đánh giá sao.
  - Nút **Xem Nhanh (Quick View)** mở modal chi tiết mà không cần chuyển trang.
  - Nút **Thêm Vào Giỏ Hàng** tức thì kèm hiệu ứng toast thông báo.

### 1.2. Trang Chi Tiết Sản Phẩm (`/product/[slug]`)
- **Thư Viện Hình Ảnh:** Xem ảnh sản phẩm chính và chuyển đổi các ảnh thumbnail.
- **Chọn Phân Loại / Biến Thể:** Lựa chọn Màu sắc, Kích cỡ (Size) với trạng thái tồn kho và giá tiền cập nhật theo biến thể được chọn.
- **Bộ Chọn Số Lượng:** Tăng/giảm số lượng mua, kiểm soát không vượt quá tồn kho thực tế.
- **Nút Hành Động:** Nút "Thêm vào giỏ" và nút "Mua ngay" chuyển thẳng đến trang Đặt hàng.
- **Thông Tin & Đánh Giá:** Tab mô tả chi tiết, chính sách đổi trả, đánh giá từ khách hàng.

### 1.3. Giỏ Hàng Nâng Cao (`CartDrawer` & `CartContext`)
- **Drawer Trượt Mượt Mà:** Mở giỏ hàng từ cạnh phải màn hình ở mọi vị trí trên website.
- **Chọn Sản Phẩm Thanh Toán (Selective Checkout):** Checkbox chọn từng sản phẩm hoặc "Chọn tất cả", tổng tiền chỉ tính trên các món được chọn.
- **Thao Tác Nhanh:** Tăng, giảm số lượng hoặc xóa sản phẩm khỏi giỏ trực tiếp trong Drawer.
- **Lưu Trữ Bền Vững:** Tự động đồng bộ giỏ hàng vào `localStorage`, không lo mất khi tải lại trang.

### 1.4. Trang Đặt Hàng & Thanh Toán (`/checkout`)
- **Form Địa Chỉ Chuẩn Việt Nam:** Dropdown 3 cấp liên kết chặt chẽ: **Tỉnh/Thành phố $\rightarrow$ Quận/Huyện $\rightarrow$ Phường/Xã**.
- **So Sánh Cước Vận Chuyển Real-Time:** Tự động tính cước và thời gian dự kiến giao của **3 hãng vận chuyển lớn (GHN, GHTK, Viettel Post)**.
- **Chọn Phương Thức Thanh Toán Động:** Hiển thị các phương thức **COD** hoặc **Chuyển khoản VietQR** theo cấu hình Bật/Tắt của Admin.
- **Ghi Chú Đơn Hàng:** Cho phép khách hàng nhập yêu cầu giao hàng đặc biệt.
- **Dọn Dẹp Giỏ Hàng:** Tự động xóa các mặt hàng đã đặt thành công khỏi giỏ.

### 1.5. Trang Đặt Hàng Thành Công & Hóa Đơn (`/order-success`)
- **Thông Tin Hóa Đơn:** Mã đơn hàng, tên khách, số điện thoại, địa chỉ nhận, danh sách sản phẩm, tiền hàng, phí vận chuyển và tổng thanh toán.
- **Tự Động Sinh Mã VietQR Napas247:** Hiển thị mã QR có sẵn số tiền và nội dung chuyển khoản chính xác để khách quét thanh toán trong 3 giây.
- **Bộ Tra Cứu Đơn Hàng:** Cho phép khách hàng nhập Mã đơn hàng hoặc Số điện thoại để xem lại thông tin đơn hàng bất cứ lúc nào.

---

## 2. Hệ Thống Quản Trị (Admin Portal)

### 2.1. Bảng Điều Khiển Tổng Quan (Dashboard - `/admin`)
- **Chỉ Số Kinh Doanh Trọng Yếu (KPIs):**
  - Tổng doanh thu thực nhận (VNĐ).
  - Tổng số đơn hàng toàn bộ trạng thái.
  - Số lượng khách hàng mới đăng ký.
  - Giá trị đơn hàng trung bình (AOV).
- **Bộ Lọc Khoảng Thời Gian:** Xem thống kê theo *Hôm nay, Hôm qua, 7 ngày qua, 30 ngày qua, Tháng này*.
- **Biểu Đồ Doanh Thu Theo Ngày (Line Chart):** Theo dõi xu hướng tăng trưởng doanh thu trực quan.
- **Biểu Đồ Trạng Thái Đơn Hàng (Donut Chart):** Phân bổ tỷ lệ các đơn *Chờ duyệt, Đã xác nhận, Đang giao, Đã giao, Đã hủy*.
- **Bảng Đơn Hàng Mới & Top Sản Phẩm Bán Chạy.**

### 2.2. Quản Lý Đơn Hàng (`/admin/orders`)
- Danh sách đơn hàng đầy đủ mã đơn, khách hàng, ngày đặt, hãng vận chuyển, tổng tiền và trạng thái.
- **Bộ Lọc Trạng Thái:** Xem theo từng trạng thái đơn hàng và trạng thái thanh toán (Chưa thanh toán / Đã thanh toán).
- **Xem Chi Tiết & Thao Tác:**
  - Xem chi tiết từng món hàng, biến thể, số lượng, tiền thu hộ COD.
  - Cập nhật trạng thái giao hàng: *Chờ duyệt $\rightarrow$ Đã xác nhận $\rightarrow$ Đang giao $\rightarrow$ Đã giao $\rightarrow$ Đã hủy*.
  - Đánh dấu trạng thái thanh toán thủ công hoặc tự động qua Webhook.

### 2.3. Quản Lý Sản Phẩm (`/admin/products`)
- Danh sách sản phẩm dạng bảng lưới với hình ảnh đại diện, danh mục, giá bán, giá khuyến mãi, tồn kho.
- **Thêm Mới / Chỉnh Sửa Sản Phẩm:**
  - Nhập tên, slug tự động, mô tả, danh mục.
  - Thiết lập giá bán, giá khuyến mãi, số lượng tồn kho, nhãn "Sản phẩm nổi bật".
  - **Quản lý biến thể đa thuộc tính:** Thêm các phân loại Màu sắc, Kích cỡ, kèm tồn kho và giá riêng từng biến thể.
  - **Tải lên hình ảnh (Upload):** Kéo thả hoặc chọn ảnh từ máy tính, hỗ trợ lưu trữ Base64 hoặc Cloud Storage.
- **Xóa sản phẩm:** Xóa an toàn kèm hộp thoại xác nhận.

### 2.4. Quản Lý Danh Mục Sản Phẩm (`/admin/categories`)
- Xem toàn bộ cây danh mục sản phẩm của cửa hàng.
- Thêm mới danh mục với Tên, Slug URL thân thiện SEO và Thứ tự sắp xếp hiển thị (`order`).
- Chỉnh sửa thông tin và xóa danh mục.

### 2.5. Quản Lý Khách Hàng (`/admin/customers`)
- Danh bạ khách hàng thu thập từ các lượt đặt hàng và đăng ký tài khoản.
- Xem Tên, Số điện thoại, Email, Địa chỉ giao hàng mặc định, Tổng số đơn đã đặt và Tổng giá trị chi tiêu.

### 2.6. Báo Cáo Doanh Thu & Lợi Nhuận (`/admin/reports`)
- Báo cáo tổng hợp số liệu kinh doanh chi tiết theo tuần, tháng và quý.
- Bảng kê chi tiết đơn hàng hoàn tất, số lượng sản phẩm xuất kho và tỷ lệ hủy đơn.

### 2.7. Cài Đặt Giao Diện Thương Hiệu (`/admin/settings`)
- **Nhận Diện Thương Hiệu:** Cập nhật Logo Shop, Tiêu đề Website, Slogan, Email hỗ trợ, Hotline.
- **Liên Kết Mạng Xã Hội:** Cấu hình link TikTok Shop, Fanpage Facebook, Instagram, YouTube.
- **Tùy Biến Bảng Màu (Color Palette):** Đổi màu chủ đạo (Primary), Màu nền (Background), Màu Card, Màu Chữ để đồng bộ nhận diện thương hiệu.

---

## 3. Hệ Thống Thanh Toán Tự Động (Payment & VietQR)

### 3.1. Cấu Hình Tài Khoản Nhận Tiền (`/admin/payment`)
- **Bật / Tắt Phương Thức Thanh Toán:**
  - Công tắc Bật/Tắt độc lập: **Thanh toán khi nhận hàng (Ship COD)**.
  - Công tắc Bật/Tắt độc lập: **Chuyển khoản Ngân hàng (VietQR / SePay)**.
- **Hỗ Trợ 40+ Ngân Hàng Việt Nam:** MBBank, Vietcombank, Techcombank, BIDV, VietinBank, ACB, VPBank, TPBank, Sacombank, Agribank, Timo, Cake...
- **Cấu hình Số Tài Khoản & Tên Chủ Tài Khoản** in hoa không dấu chuẩn định dạng liên ngân hàng Napas247.

### 3.2. Thanh Toán VietQR Tự Động & SePay Webhook
- **Sinh Mã QR Động:** Tự động tạo ảnh VietQR chuẩn format kèm Số tài khoản, Tên chủ TK, Số tiền đơn hàng và Cú pháp nội dung `Thanh toan <Mã Đơn>`.
- **Tích Hợp SePay Webhook (`/api/webhooks/sepay`):**
  - Lắng nghe biến động số dư tài khoản ngân hàng theo thời gian thực.
  - Tự động khớp lệnh chuyển tiền với Mã đơn hàng tương ứng.
  - **Tự động chuyển trạng thái đơn hàng thành "ĐÃ THANH TOÁN (PAID)"** trong vòng 3 giây ngay khi khách chuyển khoản thành công.
- **Công Cụ Giả Lập Webhook (Simulator):** Cho phép Admin bắn thử dữ liệu chuyển khoản để test hệ thống ngay trên trang quản trị.
- **Công Cụ Kiểm Tra Trạng Thái Thanh Toán:** Tra cứu trạng thái thanh toán của bất kỳ mã đơn hàng nào tức thì.

---

## 4. Tích Hợp Vận Chuyển Đa Đơn Vị (Multi-Carrier Shipping)

### 4.1. Cấu Hình Hãng Vận Chuyển (`/admin/shipping`)
- **3 Đơn Vị Vận Chuyển Hàng Đầu:**
  - **Giao Hàng Nhanh (GHN):** Cấu hình Token API, Shop ID, môi trường Test/Production.
  - **Giao Hàng Tiết Kiệm (GHTK):** Cấu hình API Token, Partner ID.
  - **Viettel Post:** Cấu hình Secret Token, Username tài khoản bưu cục.
- **Bật / Tắt Độc Lập:** Admin có thể linh hoạt bật/tắt từng hãng; hãng nào tắt sẽ tự động được ẩn khỏi trang Checkout của khách hàng.
- **Biểu Phí Cước & Freeship:**
  - Thiết lập cước phí tiêu chuẩn Nội thành & Ngoại thành.
  - Thiết lập giá trị đơn hàng tối thiểu để được **Miễn phí vận chuyển (Freeship)**.

### 4.2. Tính Phí & Lọc Động Tại Checkout (`/api/shipping/calculate`)
- Tự động tính toán chi phí vận chuyển dựa trên vị trí nhận hàng (Tỉnh/Huyện), cân nặng giỏ hàng và giá trị đơn.
- Chỉ trả về và hiển thị các hãng vận chuyển đang được Admin kích hoạt.

---

## 5. Thông Báo Đơn Hàng Qua Email (Automated Email Invoice)

### 5.1. Cấu Hình Gmail SMTP / Nodemailer (`/admin/settings` - Tab Email)
- Tích hợp chuẩn **Nodemailer** tương thích hoàn toàn với Gmail SMTP (`smtp.gmail.com` cổng 465 SSL / 587 TLS).
- Lưu thông tin an toàn trong MongoDB: Tài khoản Gmail gửi, Mật khẩu ứng dụng (Google App Password 16 ký tự), Tên hiển thị người gửi, Email Admin nhận cảnh báo.
- **Công Cụ Gửi Thử Email (Test Connection):** Kiểm tra cấu hình và gửi email test tức thì chỉ bằng 1 cú click.

### 5.2. Mẫu Email Hóa Đơn Tự Động (Email Templates)
- **Gửi Khách Hàng:** Tự động gửi Email hóa đơn xác nhận đơn hàng với giao diện HTML responsive chuyên nghiệp, hiển thị đầy đủ mã đơn, danh sách sản phẩm, địa chỉ giao hàng, phí vận chuyển và tổng tiền.
- **Gửi Chủ Shop / Admin:** Tự động gửi Email thông báo khi có đơn hàng mới phát sinh kèm thông tin khách hàng và giá trị đơn để Admin xử lý đơn kịp thời.
- **Xử Lý Bất Đồng Bộ (Non-blocking):** Quá trình gửi email chạy ngầm, không làm chậm tốc độ phản hồi khi khách bấm Đặt hàng.

---

## 6. Hệ Thống Chat CSKH Real-Time (Socket.io)

### 6.1. Widget Chat Phía Khách Hàng (`ChatFloatingWidget`)
- Bong bóng chat nổi cố định ở góc dưới màn hình.
- Nhắn tin 2 chiều tức thì với nhân viên chăm sóc khách hàng.
- **Gửi Ảnh Qua Chat:** Hỗ trợ chụp/chọn ảnh sản phẩm cần tư vấn gửi trực tiếp trong khung chat.
- **Lưu Phiên Hội Thoại:** Tự động gán `guestId` và lưu lịch sử chat trong `localStorage`, khách hàng tải lại trang vẫn giữ nguyên tin nhắn cũ.
- **Chỉ Báo Soạn Thảo (Typing Indicator):** Hiển thị trạng thái "Shop đang soạn tin nhắn...".

### 6.2. Trung Tâm Tin Nhắn Admin (`/admin/chat`)
- Giao diện 2 cột chuẩn: Cột trái danh sách khách hàng đang chat, Cột phải là khung trò chuyện chi tiết.
- Kết nối phòng tổng `admin_hub`, nhận thông báo âm thanh và badge tin nhắn mới khi có khách nhắn tin.
- Gửi tin nhắn văn bản và hình ảnh phản hồi nhanh chóng cho khách.
- Cơ chế đồng bộ kép (Socket.io + Background Polling) đảm bảo không bị rớt tin nhắn.

---

## 7. Bảo Mật & Quản Lý Phiên Làm Việc (Authentication & Security)

### 7.1. Đăng Nhập & Phân Quyền (`/admin/login`)
- Xác thực tài khoản Email/SĐT và mật khẩu đã được mã hóa bằng **Bcrypt**.
- Kiểm tra phân quyền truy cập: Chỉ các tài khoản có quyền `admin` hoặc `staff` mới được phép vào hệ thống quản trị.
- Cấp mã Token chứa thông tin định danh và thời hạn hết hạn (`exp`).
- Nút **"Tự điền"** tài khoản Admin mẫu giúp quá trình kiểm thử nhanh chóng.

### 7.2. Bảo Vệ Tuyến Đường (Route Guard) & Tự Động Đăng Xuất
- **Bảo Vệ Toàn Diện:** Kiểm tra token trước khi tải bất kỳ trang nào thuộc `/admin/*`. Nếu chưa đăng nhập hoặc token không hợp lệ $\rightarrow$ Chuyển hướng ngay về `/admin/login`.
- **Tự Động Chuyển Hướng Thông Minh:** Nếu Admin đã đăng nhập mà truy cập lại trang login, hệ thống tự động đưa vào Dashboard `/admin`.
- **Watchdog Kiểm Tra Hạn Token:** Quá trình ngầm kiểm tra định kỳ mỗi 15 giây. Khi token hết hạn, hệ thống tự động xóa session, hiển thị thông báo cảnh báo và đưa về trang đăng nhập.
- **Bộ Đón Chặn Lỗi 401 (API Interceptor):** Tích hợp trong `apiFetch`, tự động kích hoạt luồng đăng xuất an toàn nếu máy chủ trả về lỗi Unauthorized.
- **Nút Đăng Xuất Tiện Lợi (Logout):** Bố trí tại góc phải thanh Header và chân thanh menu Sidebar.

---

## 8. Cơ Sở Dữ Liệu & Hạ Tầng API (Backend & Infrastructure)

### 8.1. Mô Hình Dữ Liệu (Mongoose Models - MongoDB Atlas)
- **`User`:** Tài khoản quản trị, nhân viên (Họ tên, email, SĐT, mật khẩu hash, role).
- **`Customer`:** Hồ sơ khách hàng (Họ tên, SĐT, email, địa chỉ, tổng chi tiêu).
- **`Category`:** Danh mục sản phẩm (Tên, slug, icon, thứ tự sắp xếp).
- **`Product`:** Sản phẩm (Tên, slug, giá, giá sale, mô tả, ảnh, tồn kho, số lượng đã bán, danh sách biến thể màu sắc & size).
- **`Order`:** Đơn đặt hàng (Mã đơn, thông tin khách, chi tiết món hàng, phí ship, tổng tiền, phương thức thanh toán, hãng vận chuyển, trạng thái đơn, trạng thái thanh toán).
- **`Message`:** Tin nhắn CSKH (Mã hội thoại, người gửi, nội dung text, link ảnh, thời gian).
- **`Setting`:** Cấu hình hệ thống linh hoạt theo key-value (`theme_settings`, `shipping_config`, `payment_config`, `email_settings`).

### 8.2. Hệ Thống Upload Ảnh Đa Nền Tảng (`/api/upload`)
- **Tương Thích Môi Trường Serverless (Vercel):** Tự động phát hiện lỗi ổ đĩa chỉ đọc (`EROFS`) để chuyển đổi tức thì sang lưu trữ **Base64 Data URL** mà không làm gián đoạn quá trình tải ảnh.
- **Hỗ Trợ Cloud Storage:** Tích hợp sẵn adapter cho **ImgBB** (`IMGBB_API_KEY`) và **Cloudinary** (`CLOUDINARY_CLOUD_NAME`).

### 8.3. Khởi Tạo Dữ Liệu Tự Động (Database Seeder - `/api/seed`)
- Endpoint API khởi tạo toàn bộ dữ liệu mẫu ban đầu:
  - Tài khoản Admin mặc định: `admin@shoptik.vn` / `admin123`.
  - Danh mục mẫu: Thời Trang Nam, Thời Trang Nữ, Phụ Kiện & Giày Dép, Đồ Điện Tử.
  - Các sản phẩm mẫu đa dạng biến thể, hình ảnh sắc nét và số lượng tồn kho.

---

## 🚀 TỔNG KẾT DỰ ÁN

| Module | Trạng Thái Hoàn Thiện | Đã Kiểm Thử |
| :--- | :---: | :---: |
| 🛒 **Storefront & Giỏ hàng & Tra cứu đơn** | ✅ 100% | ✅ PASS |
| 🚚 **Vận chuyển GHN / GHTK / Viettel Post** | ✅ 100% | ✅ PASS |
| 💳 **Thanh toán VietQR & SePay Webhook & Bật/Tắt COD** | ✅ 100% | ✅ PASS |
| 📧 **Gửi Email Hóa đơn & Cảnh báo Admin (SMTP)** | ✅ 100% | ✅ PASS |
| 💬 **Chat CSKH Real-Time (Socket.io & Gửi ảnh)** | ✅ 100% | ✅ PASS |
| 🔐 **Đăng nhập Admin & Tự động đăng xuất hết hạn Token** | ✅ 100% | ✅ PASS |
| 📊 **Dashboard, Quản lý Đơn, Sản phẩm, Danh mục, Báo cáo** | ✅ 100% | ✅ PASS |
| ⚙️ **Cài đặt Giao diện, Màu sắc & Upload ảnh Serverless** | ✅ 100% | ✅ PASS |

*Tài liệu được cập nhật tự động theo phiên bản mã nguồn mới nhất của dự án.*
