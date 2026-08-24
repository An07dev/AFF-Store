const mongoose = require('mongoose');
const fs = require('fs');

let mongoUri = 'mongodb://localhost:27017/webbanhang';
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    mongoUri = match[1].trim();
  }
}

const detailedDescriptions = {
  // 1. Áo Polo Nam
  'ao-polo-nam-phoi-co-det-bo-cao-cap': `✨ GIỚI THIỆU SẢN PHẨM:
Áo Polo Nam Phối Cổ Dệt Bo là mẫu áo basic chuẩn mực của phái mạnh hiện đại. Thiết kế tối giản nhưng sang trọng với phần cổ dệt bo phối màu tinh tế, tôn lên nét nam tính, thanh lịch khi đi làm, đi chơi hay gặp gỡ đối tác.

🌟 ĐẶC ĐIỂM NỔI BẬT & CHẤT LIỆU:
• Vải Cotton Organic 95% + 5% Spandex: Thấm hút mồ hôi siêu tốc, mang lại cảm giác thoáng mát cả ngày dài.
• Co giãn 4 chiều đa chiều: Thoải mái vận động thể thao hoặc ngồi làm việc văn phòng suốt 8 tiếng.
• Công nghệ Dệt Compact: Giảm thiểu 99% tình trạng xơ xù lông sau khi giặt máy.
• Cổ áo & Tay áo: Dệt bo dày dặn, không bị quăn mép hay nhão form sau nhiều lần sử dụng.
• Cúc áo dập chìm sang trọng, đường may đôi chắc chắn tại vai và nách.

📋 BẢNG THÔNG SỐ KỸ THUẬT & SIZE:
• Kiểu dáng: Regular Fit tôn dáng
• Màu sắc: Đen Phối Trắng, Trắng Phối Đen, Xanh Navy
• Bảng size chi tiết:
  - Size M: Cân nặng 50 - 60kg | Chiều cao 1m60 - 1m68 (Dài áo: 67cm, Rộng ngực: 48cm)
  - Size L: Cân nặng 60 - 70kg | Chiều cao 1m68 - 1m75 (Dài áo: 69cm, Rộng ngực: 50cm)
  - Size XL: Cân nặng 70 - 82kg | Chiều cao 1m73 - 1m82 (Dài áo: 72cm, Rộng ngực: 53cm)

🎁 HƯỚNG DẪN GIẶT & BẢO QUẢN:
• Nên lộn trái áo khi giặt và phơi trong bóng râm để giữ màu bền lâu nhất.
• Không sử dụng hóa chất tẩy rửa mạnh hoặc nước nóng trên 40°C.
• Ủi ở nhiệt độ trung bình (dưới 150°C).

🛡️ CHÍNH SÁCH BÁN HÀNG & CAM KẾT:
• 100% hình ảnh thực tế tự chụp tại studio.
• Hỗ trợ đổi size miễn phí tận nhà trong vòng 7 ngày nếu không vừa vặn.
• Hoàn tiền 100% nếu phát hiện sản phẩm lỗi từ nhà sản xuất.`,

  // 2. Quần Jean Nam
  'quan-jean-nam-ong-suong-form-rong': `✨ GIỚI THIỆU SẢN PHẨM:
Quần Jean Nam Ống Suông Form Rộng là item không thể thiếu trong tủ đồ giới trẻ yêu phong cách Streetwear cá tính. Form quần suông đứng giúp che khuyết điểm chân vòng kiềng, tôn chiều cao vượt bậc và cực kỳ dễ phối cùng mọi loại áo.

🌟 ĐẶC ĐIỂM NỔI BẬT & CHẤT LIỆU:
• Vải Denim 12oz Cao Cấp: Độ dày chuẩn xuất khẩu, mềm mại và đứng form hoàn hảo.
• Công nghệ Wash Màu Enzyme: Màu wash loang vintage tự nhiên, bền màu không phai ra quần áo khác khi giặt.
• Khóa kéo kim loại YKK cao cấp: Chống kẹt, kéo êm ái, đinh tán chống bung chỉ tại các góc túi.
• Ống suông rộng rãi: Tạo cảm giác phóng khoáng, thoáng khí, không gây bí bách hay gò bó.

📋 BẢNG THÔNG SỐ KỸ THUẬT & SIZE:
• Kiểu dáng: Straight Loose (Ống suông rộng vừa phải)
• Chiều dài quần: 98 - 104cm
• Bảng size tham khảo:
  - Size 29: Cân nặng 48 - 56kg | Vòng eo 74cm | Dài quần 99cm
  - Size 30: Cân nặng 56 - 63kg | Vòng eo 77cm | Dài quần 101cm
  - Size 31: Cân nặng 63 - 70kg | Vòng eo 80cm | Dài quần 103cm
  - Size 32: Cân nặng 70 - 78kg | Vòng eo 84cm | Dài quần 105cm

💡 GỢI Ý PHỐI ĐỒ CỰC CHẤT:
• Phối cùng Áo Thun Oversized + Giày Sneaker cổ thấp cho phong cách học sinh, sinh viên năng động.
• Phối cùng Áo Sơ Mi Khoác Ngoài + Tanktop trắng bên trong cho outfit dạo phố, chụp ảnh du lịch.

🛡️ CHÍNH SÁCH BẢO HÀNH & ĐỔI TRẢ:
• Kiểm tra hàng trước khi thanh toán (Ship COD toàn quốc).
• Đổi trả trong 7 ngày nếu có lỗi đường may hoặc sai kích cỡ.`,

  // 3. Váy Đầm Maxi Nữ
  'vay-dam-maxi-nu-dang-chu-a-co-vuong-tay-bong': `✨ GIỚI THIỆU SẢN PHẨM:
Váy Đầm Maxi Cổ Vuông Tay Bồng mang đến vẻ đẹp ngọt ngào, thướt tha chuẩn phong cách "Nàng Thơ". Chiếc đầm được thiết kế tỉ mỉ để tôn vinh nét nữ tính, thanh lịch, thích hợp cho những chuyến du lịch biển, tiệc sinh nhật hay buổi hẹn hò lãng mạn.

🌟 ĐIỂM NHẤN THIẾT KẾ ĐỘC ĐÁO:
• Cổ vuông thanh lịch: Khéo léo khoe trọn phần xương quai xanh quyến rũ và chiếc cổ thon dài.
• Tay bồng tiểu thư: Che khuyết điểm bắp tay to, tạo điểm nhấn bồng bềnh sang trọng.
• Dáng chữ A xòe nhẹ: Thắt eo cao giúp đôi chân trông dài hơn, che khuyết điểm vòng 2 và hông cực kỳ hiệu quả.
• Chất liệu Tơ Gân Hạt 2 lớp: Lớp ngoài óng ả mềm mại, bên trong lót lụa Habutai mát mịn, kín đáo 100% không lo lộ nội y.

📋 BẢNG THÔNG SỐ & HƯỚNG DẪN CHỌN SIZE:
• Màu sắc: Trắng Tinh Khôi, Vàng Kem Nhẹ, Xanh Pastel
• Chiều dài đầm: 115 - 120cm (Qua bắp chân tôn dáng)
• Bảng size chuẩn:
  - Size S: 42 - 48kg | Vòng ngực 82-86cm | Vòng eo 62-66cm
  - Size M: 49 - 55kg | Vòng ngực 86-90cm | Vòng eo 66-72cm
  - Size L: 56 - 62kg | Vòng ngực 90-94cm | Vòng eo 72-78cm

🎁 BẢO QUẢN SẢN PHẨM:
• Nên giặt tay hoặc cho vào túi giặt khi giặt máy ở chế độ nhẹ nhàng.
• Là/ủi bằng bàn là hơi nước ở nhiệt độ vừa phải.`,

  // 4. Set Đồ Nữ Áo Blazer Croptop
  'set-do-nu-ao-blazer-croptop-chan-vay-xep-ly': `✨ GIỚI THIỆU SẢN PHẨM:
Set Đồ Nữ Áo Blazer Croptop Kèm Chân Váy Xếp Ly là sự kết hợp hoàn hảo giữa phong cách công sở trẻ trung và xu hướng K-Pop năng động. Bộ trang phục giúp bạn nổi bật trong mọi khung hình, từ giảng đường, văn phòng đến các buổi tiệc cuối tuần.

🌟 ĐẶC ĐIỂM CHẤT LIỆU & FORM DÁNG:
• Chất vải Tuyết Mưa Vitex Cao Cấp: Dày dặn vừa phải, không nhăn, không bai xù và giữ nếp ly sắc nét.
• Áo Blazer dáng lửng Croptop: Có đệm vai mỏng định hình dáng thẳng tắp, khoe trọn vòng eo thon gọn.
• Chân váy chữ A xếp ly tennis: Tích hợp quần bảo hộ may liền bên trong giúp bạn thoải mái vận động mà không lo sự cố.
• Cúc áo bọc vải đồng màu sang trọng, đường may giấu chỉ cao cấp.

📋 THÔNG SỐ BẢNG SIZE:
• Màu sắc: Nâu Be Hàn Quốc, Đen Quý Phái, Xám Khói
• Kích thước:
  - Size S: Dưới 48kg (Eo dưới 66cm)
  - Size M: 48 - 54kg (Eo 67 - 71cm)
  - Size L: 55 - 60kg (Eo 72 - 76cm)

🛡️ CAM KẾT CHẤT LƯỢNG:
• Hàng may xưởng kỹ từng đường kim mũi chỉ.
• Hỗ trợ đổi size nếu mặc không vừa vặn trong vòng 7 ngày.`,

  // 5. Củ Sạc GaN 65W
  'cu-sac-nhanh-gan-65w-3-cong-type-c-usb-a': `✨ GIỚI THIỆU SẢN PHẨM:
Củ Sạc Nhanh GaN 65W 3 Cổng là giải pháp sạc tất cả trong một cho toàn bộ hệ sinh thái thiết bị của bạn. Được chế tạo bằng vật liệu bán dẫn Gallium Nitride (GaN III) tiên tiến nhất, sản phẩm mang lại hiệu suất sạc vượt trội trong kích thước siêu nhỏ gọn chỉ bằng 50% củ sạc thông thường.

⚡ TÍNH NĂNG CÔNG NGHỆ NỔI BẬT:
• Công suất đỉnh 65W: Sạc đầy 50% pin iPhone chỉ trong 25 phút; sạc đầy MacBook Pro 13" trong 1.5 giờ.
• 3 Cổng sạc thông minh: 2x Type-C (PD 3.0 / PPS) + 1x USB-A (QC 4.0+), cho phép sạc đồng thời Laptop, Điện thoại và Tai nghe.
• Chip Phân Phối Điện Năng Tự Động: Tự nhận diện thiết bị để cung cấp dòng điện tối ưu, bảo vệ tuổi thọ pin.
• 8 Lớp Bảo Vệ An Toàn: Chống quá nhiệt, chống quá áp, chống đoản mạch và tự ngắt nguồn khi sạc đầy 100%.
• Thiết kế chân cắm gập 90 độ tiện lợi khi bỏ túi xách, balo mang đi làm, du lịch.

📋 THÔNG SỐ KỸ THUẬT:
• Model: GaN-65W Pro Fast Charger
• Nguồn vào: AC 100-240V ~ 50/60Hz, 1.5A Max
• Nguồn ra:
  - Type-C1 / C2: 5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/3.25A (65W Max)
  - USB-A: 4.5V/5A, 5V/4.5A, 9V/3A, 12V/2.5A, 20V/1.5A (30W Max)
  - C1 + C2: 45W + 20W (65W)
  - C1 + A: 45W + 18W (63W)
• Trọng lượng: 110g

🛡️ CHÍNH SÁCH BẢO HÀNH:
• Bảo hành 12 tháng lỗi 1 đổi 1 mới hoàn toàn.
• Tương thích 100% với Apple iPhone, Samsung Galaxy, Xiaomi, iPad, MacBook và Laptop Dell, HP, Lenovo.`,

  // 6. Pin Sạc Dự Phòng Magsafe 10.000mAh
  'pin-sac-du-phong-magsafe-khong-day-10000mah': `✨ GIỚI THIỆU SẢN PHẨM:
Pin Sạc Dự Phòng Không Dây Magsafe 10.000mAh là người bạn đồng hành hoàn hảo cho iPhone 12/13/14/15/16 Series và các dòng điện thoại hỗ trợ sạc Qi. Thiết kế siêu mỏng nhẹ cùng lực hút từ tính siêu mạnh mang lại trải nghiệm sạc không dây tự do không vướng víu.

🌟 ĐIỂM NỔI BẬT KHÔNG THỂ BỎ QUA:
• Nam châm N52 Siêu Cường: Hút dính chắc chắn vào lưng máy, lắc mạnh không rơi.
• Sạc không dây 15W Max + Sạc nhanh có dây Type-C PD 20W 2 chiều.
• Chân đỡ kim loại gập mở thông minh: Biến pin sạc thành giá đỡ điện thoại xem video ngang/dọc rảnh tay.
• Màn hình LED kỹ thuật số: Hiển thị chính xác % pin còn lại.
• Lõi pin Lithium Polymer cao cấp: Chống cháy nổ, được phép mang lên máy bay an toàn.

📋 THÔNG SỐ KỸ THUẬT:
• Dung lượng: 10.000mAh / 3.7V (37Wh)
• Hiệu suất chuyển đổi: > 75%
• Cổng sạc Type-C In/Out: 5V-3A / 9V-2.22A / 12V-1.67A (20W Max)
• Sạc không dây Wireless: 5W / 7.5W / 10W / 15W
• Kích thước: 105 x 68 x 16mm | Trọng lượng: 195g

🛡️ BẢO HÀNH CHÍNH HÃNG:
• Bảo hành 12 tháng 1 đổi 1 nếu có lỗi từ nhà sản xuất.`,

  // 7. Tai Nghe Bluetooth ANC
  'tai-nghe-bluetooth-tws-chong-on-anc': `✨ GIỚI THIỆU SẢN PHẨM:
Tai Nghe Bluetooth True Wireless Pro ANC mang lại chất lượng âm thanh đẳng cấp Studio trong tầm tay. Được trang bị công nghệ chống ồn chủ động Hybrid ANC và màng loa Composite 13mm, chiếc tai nghe sẽ đưa bạn vào thế giới âm nhạc sống động và chân thực nhất.

🌟 CÔNG NGHỆ & TÍNH NĂNG VƯỢT TRỘI:
• Chống ồn chủ động ANC -35dB: Khử triệt để tiếng ồn động cơ xe cộ, tiếng quạt gió và tạp âm văn phòng.
• Chế độ Xuyên Âm (Transparency Mode): Nghe rõ âm thanh môi trường xung quanh và trò chuyện mà không cần tháo tai nghe.
• Màng loa Titan 13mm: Âm bass đánh sâu, đầm chắc, dải mid trong trẻo và treble chi tiết.
• 4 Micro ENC Lọc Tiếng Ồn Đàm Thoại: Đàm thoại to rõ kể cả khi đang chạy xe máy ngoài đường.
• Cảm ứng chạm đa điểm: Dễ dàng chuyển bài, chỉnh âm lượng, nhận cuộc gọi hay bật tắt ANC chỉ bằng 1 chạm.
• Bluetooth 5.3 Mới Nhất: Kết nối ổn định trong phạm vi 15m, độ trễ siêu thấp 40ms chơi game không delay.

📋 THÔNG SỐ KỸ THUẬT:
• Thời lượng pin tai nghe: 6 - 7 giờ liên tục (Tắt ANC), 5 giờ (Bật ANC)
• Tổng thời lượng cùng Dock sạc: Lên đến 35 giờ
• Thời gian sạc: 1.5 giờ (Cổng Type-C)
• Kháng nước & mồ hôi: Chuẩn IPX5

🛡️ BẢO HÀNH CHÍNH HÃNG:
• Bảo hành 12 tháng, đổi mới trong 30 ngày đầu nếu lỗi kết nối hoặc pin.`,

  // 8. Loa Bluetooth Mini IPX7
  'loa-bluetooth-mini-cam-tay-chong-nuoc-ipx7-led-rgb': `✨ GIỚI THIỆU SẢN PHẨM:
Loa Bluetooth Mini Cầm Tay RGB là món phụ kiện khuấy động mọi bữa tiệc dã ngoại, cắm trại hay góc làm việc cá nhân. Kích thước nhỏ gọn nằm trọn trong lòng bàn tay nhưng sở hữu công suất âm thanh 10W mạnh mẽ cùng dải đèn LED RGB chuyển động theo nhịp điệu bài hát.

🌟 ĐẶC ĐIỂM NỔI BẬT:
• Âm thanh vòm 360 độ: Màng loa bass thụ động phía dưới tăng cường độ nảy của âm trầm cực kỳ đã tai.
• Đèn LED RGB 7 chế độ nháy: Ánh sáng đồng bộ mượt mà theo từng giai điệu bài hát.
• Chuẩn chống nước IPX7: Yên tâm sử dụng bên hồ bơi, bãi biển hay dưới trời mưa rào.
• Ghép đôi TWS 2 Loa: Kết nối 2 loa cùng lúc tạo thành hệ thống âm thanh vòm Stereo cực đỉnh.

📋 THÔNG SỐ KỸ THUẬT:
• Công suất thực: 10W RMS
• Chuẩn Bluetooth: 5.3 (Khoảng cách 15m)
• Dung lượng pin: 1800mAh (Phát nhạc liên tục 8 - 10 tiếng)
• Cổng hỗ trợ: Bluetooth, Thẻ nhớ TF MicroSD, Cổng AUX 3.5mm, Cổng sạc Type-C

🛡️ CHÍNH SÁCH BẢO HÀNH:
• Đổi mới 1:1 trong 30 ngày nếu có lỗi âm thanh hoặc không kết nối được.
• Bảo hành toàn diện 12 tháng.`,

  // 9. Đồng Hồ Thông Minh AMOLED
  'dong-ho-thong-minh-smartwatch-amoled-nghe-goi': `✨ GIỚI THIỆU SẢN PHẨM:
Smartwatch AMOLED Pro là chiếc đồng hồ thông minh thời thượng kết hợp giữa thiết kế kim loại cao cấp và các công nghệ theo dõi sức khỏe hàng đầu. Sở hữu màn hình AMOLED tràn viền rực rỡ và tính năng nghe gọi trực tiếp qua Bluetooth, sản phẩm giúp bạn không bao giờ bỏ lỡ các thông báo quan trọng.

🌟 TÍNH NĂNG ĐẲNG CẤP:
• Màn hình AMOLED 1.95 inch: Độ phân giải 410x502 pixel siêu nét, màu đen sâu thẳm, Always-On Display (Màn hình luôn sáng).
• Nghe gọi đàm thoại 2 chiều: Loa ngoài âm lượng lớn và micro chống ồn HD, hỗ trợ đồng bộ danh bạ từ điện thoại.
• Trợ lý sức khỏe 24/7: Cảm biến quang học đo nhịp tim liên tục, đo nồng độ oxy SpO2, đo huyết áp, theo dõi giấc ngủ REM và mức độ căng thẳng.
• Hơn 100 chế độ tập luyện: Chạy bộ, đạp xe, bơi lội, gym, yoga... tính toán chính xác lượng calo tiêu thụ.
• Nhận thông báo đa nền tảng: Zalo, Facebook Messenger, SMS, cuộc gọi đến, Email.
• Kho hơn 200+ mặt đồng hồ miễn phí: Tùy biến hình nền cá nhân bằng ảnh chụp từ điện thoại.

📋 THÔNG SỐ KỸ THUẬT:
• Khung viền: Hợp kim kẽm mạ PVD chống trầy
• Chuẩn chống nước: IP68 (Kháng nước đi mưa, rửa tay)
• Dung lượng pin: 300mAh (Sử dụng 7 - 10 ngày thông thường, 20 ngày chế độ chờ)
• Ứng dụng kết nối: Hỗ trợ cả iOS (iPhone) & Android tiếng Việt 100%

🛡️ BẢO HÀNH CHÍNH HÃNG:
• Bảo hành 12 tháng phần cứng, hỗ trợ cập nhật phần mềm trọn đời.`,

  // 10. Máy Phun Sương Tạo Ẩm Tinh Dầu
  'may-phun-suong-tao-am-khuech-tan-tinh-dau-led': `✨ GIỚI THIỆU SẢN PHẨM:
Máy Phun Sương Tạo Ẩm Khuếch Tán Tinh Dầu giúp cân bằng độ ẩm không khí, bảo vệ hệ hô hấp và mang lại không gian sống thơm ngát, thư thái như đang ở Spa. Thiết kế vân gỗ sang trọng còn là món đồ decor tuyệt đẹp cho phòng ngủ, phòng khách hay bàn làm việc.

🌟 LỢI ÍCH & TÍNH NĂNG VƯỢT TRỘI:
• Công nghệ sóng siêu âm 2.4MHz: Phân tách nước và tinh dầu thành hàng triệu hạt sương nano siêu mịn, không làm ướt sàn nhà hay đồ gỗ.
• Dung tích lớn 500ml: Phun sương liên tục từ 10 - 14 tiếng, có chức năng tự ngắt thông minh khi hết nước an toàn tuyệt đối.
• Đèn ngủ LED 7 màu: Có thể chọn chế độ tự chuyển màu lung linh hoặc cố định 1 tone màu ấm dịu nhẹ.
• Có Remote điều khiển từ xa: Hẹn giờ 1h / 3h / 6h hoặc phun ngắt quãng tiện lợi.
• Vận hành siêu êm ái (< 25dB): Giúp bé ngủ ngon giấc và gia đình thư giãn trọn vẹn.

📋 THÔNG SỐ KỸ THUẬT:
• Nguồn điện: Adapter DC 24V / 0.65A
• Công suất: 12W
• Diện tích sử dụng hiệu quả: 20 - 40m²
• Bộ sản phẩm gồm: 1 Máy tạo ẩm, 1 Củ nguồn, 1 Remote, 1 Cốc đong nước, 1 Sách hướng dẫn.

🛡️ BẢO HÀNH & HẬU MÃI:
• Bảo hành 6 tháng lỗi 1 đổi 1 tại nhà.`,

  // 11. Máy Hút Bụi Mini 9000Pa
  'may-hut-bui-cam-tay-khong-day-mini-9000pa': `✨ GIỚI THIỆU SẢN PHẨM:
Máy Hút Bụi Cầm Tay Không Dây 9000Pa là giải pháp vệ sinh nhanh chóng cho ô tô, góc làm việc, sofa và giường nệm. Trọng lượng siêu nhẹ chỉ 350g giúp thao tác hút sạch bụi bẩn ở những góc hẹp nhất mà máy hút bụi lớn không thể chạm tới.

🌟 ĐẶC ĐIỂM NỔI BẬT:
• Động cơ Turbo lõi đồng lực hút 9000Pa: Dễ dàng hút sạch tàn thuốc lá, vụn bánh mì, lông thú cưng, bụi mịn và tóc rụng.
• Lõi lọc HEPA Nano đa tầng: Ngăn chặn 99.9% bụi mịn thoát ra không khí, có thể tháo rời rửa sạch bằng nước.
• Thiết kế không dây tiện dụng: Pin sạc Type-C dùng được mọi lúc mọi nơi mà không cần cắm dây rườm rà.
• Bộ 4 đầu hút chuyên dụng: Đầu hút dẹt khe hẹp, đầu hút bàn chải quét sofa, đầu hút sàn và ống nối dài.

📋 THÔNG SỐ SẢN PHẨM:
• Công suất định mức: 120W | Lực hút: 9000Pa
• Dung lượng pin: 4000mAh (Thời gian hút liên tục 25 - 30 phút)
• Dung tích hộc chứa bụi: 200ml
• Cổng sạc: USB Type-C 5V/2A

🛡️ BẢO HÀNH:
• Bảo hành 12 tháng động cơ, 1 đổi 1 trong 15 ngày đầu.`,

  // 12. Son Kem Lì Mịn Môi
  'son-kem-li-min-moi-khang-nuoc-do-gach': `✨ GIỚI THIỆU SẢN PHẨM:
Son Kem Lì Velvet Lip Tint là bí quyết cho đôi môi quyến rũ, căng mọng và cuốn hút mọi ánh nhìn. Chất son kem xốp mịn lướt nhẹ trên môi như nhung, mang lại sắc màu rạng rỡ và độ bám màu bền bỉ suốt cả ngày.

🌟 BẢNG MÀU HOT TREND TÔN DA:
• #01 Đỏ Gạch Ánh Cam: Tone màu quốc dân tôn da, làm trắng răng, phù hợp mọi tone da từ ngăm đến trắng.
• #02 Đỏ Đất Trầm: Sắc sảo, quý phái, cực kỳ sang chảnh trong các buổi tiệc tối.
• #03 Hồng Khô MLBB: Tự nhiên, trong trẻo, phù hợp đi học, đi làm hàng ngày không cần makeup cầu kỳ.

💄 CHẤT SON & THÀNH PHẦN DƯỠNG:
• Công nghệ Micro-Pigment: Lên màu chuẩn xác chỉ sau 1 lần quẹt, che phủ hoàn toàn rãnh môi và thâm viền môi.
• Bổ sung tinh dầu Macadamia & Vitamin E: Giúp môi luôn mềm mại, không gây cảm giác khô căng hay bong tróc.
• Kháng nước & Lâu trôi: Độ bền màu lên đến 8 - 12 tiếng, không để lại vết son trên thành cốc khi uống nước.

🛡️ CAM KẾT CHÍNH HÃNG:
• 100% không chứa chì hay chất cấm độc hại, an toàn cho cả mẹ bầu.
• Đổi trả miễn phí nếu sản phẩm bị gãy, lỗi đầu cọ khi nhận hàng.`,

  // 13. Balo Laptop Chống Nước
  'balo-nam-nu-thoi-trang-chong-nuoc-laptop-15-inch': `✨ GIỚI THIỆU SẢN PHẨM:
Balo Laptop Thời Trang Đa Năng được thiết kế dành riêng cho học sinh, sinh viên và dân văn phòng cần một chiếc balo bền bỉ, sang trọng và bảo vệ tối đa các thiết bị điện tử giá trị.

🌟 ĐẶC ĐIỂM THIẾT KẾ VƯỢT TRỘI:
• Vải Oxford 900D Kháng Nước Cao Cấp: Chống trầy xước, chống bám bụi và chống thấm nước tuyệt đối khi gặp mưa bất chợt.
• Ngăn Chống Sốc Laptop Riêng Biệt: Đệm mút hạt massage êm ái bảo vệ an toàn cho Laptop kích thước đến 15.6 inch.
• Quai đeo đệm lưới Air-Mesh 3 lớp: Giảm 40% áp lực lên vai và cột sống, chống đau mỏi khi mang nặng.
• Đa ngăn chứa khoa học: Gồm 1 ngăn chính rộng rãi, 1 ngăn laptop, 2 ngăn phụ phía trước, 2 túi đựng nước bên hông và 1 ngăn chống trộm bí mật sau lưng.
• Tích hợp Cổng sạc USB thông minh bên hông balo.

📋 THÔNG SỐ KỸ THUẬT:
• Kích thước: 44 x 31 x 15 cm (Đựng vừa sách vở khổ A4, Laptop 15.6")
• Trọng lượng siêu nhẹ: 650g
• Màu sắc: Đen Classic, Xám Tro Hiện Đại, Xanh Navy

🛡️ CHÍNH SÁCH BẢO HÀNH:
• Bảo hành 12 tháng đường may, khóa kéo và quai xách.`,

  // 14. Kính Râm Unisex UV400
  'kinh-ram-thoi-trang-unisex-gong-vuong-uv400': `✨ GIỚI THIỆU SẢN PHẨM:
Kính Râm Thời Trang Unisex Gọng Vuông là phụ kiện thời trang không thể thiếu để tạo nên diện mạo sang chảnh và bảo vệ thị lực tối đa dưới ánh nắng mặt trời nhiệt đới.

🌟 ĐẶC ĐIỂM & CÔNG NGHỆ TRÒNG KÍNH:
• Tròng kính Phân Cực Polarized Chuẩn UV400: Loại bỏ 100% tia tử ngoại UVA/UVB gây hại cho mắt, chống chói lóa mắt khi lái xe hay đi biển.
• Gọng nhựa Acetate dẻo dai nguyên khối: Trọng lượng siêu nhẹ, không gây tì đè sống mũi và ôm sát khuôn mặt.
• Bản lề hợp kim đúc chắc chắn: Đóng mở mượt mà hàng nghìn lần không lo lỏng ốc hay gãy gọng.
• Form kính vuông cá tính: Phù hợp với mọi dáng mặt tròn, trái xoan, mặt vuông hay dài của cả nam và nữ.

📋 THÔNG SỐ SẢN PHẨM:
• Chiều rộng tròng: 54mm | Chiều cao tròng: 48mm | Cầu mũi: 18mm | Dài càng kính: 145mm
• Bộ sản phẩm gồm: 1 Kính râm cao cấp, 1 Hộp da đựng kính chống va đập, 1 Khăn lau kính micro-fiber.

🛡️ BẢO HÀNH CHÍNH HÃNG:
• Bảo hành 6 tháng 1 đổi 1 nếu gọng kính bị lỗi lỏng lẻo hoặc xước tròng khi nhận hàng.`,

  // 15. Giày Sneaker Thể Thao
  'giay-sneaker-the-thao-nam-nu-de-cao-su-duc-em-chan': `✨ GIỚI THIỆU SẢN PHẨM:
Giày Sneaker Thể Thao Nam Nữ Cổ Thấp là mẫu giày quốc dân luôn dẫn đầu bảng xếp hạng thời trang trẻ. Thiết kế phong cách Retro năng động, đường nét cắt may tỉ mỉ và đế đệm êm chân mang lại sự tự tin trên từng bước di chuyển.

🌟 ĐẶC ĐIỂM CHẤT LIỆU CAO CẤP:
• Da Microfiber Cao Cấp Phối Da Lộn: Bề mặt da lì mịn màng, chống bám bụi và cực kỳ dễ dàng lau chùi vệ sinh.
• Đế Cao Su Đúc Nguyên Khối: Độ ma sát bám đường cực cao, xẻ rãnh chống trơn trượt trên sàn ướt, độ cao đế 3.5cm giúp hack chiều cao tự nhiên.
• Lót giày EVA Tổ Ong Kháng Khuẩn: Êm ái, đàn hồi tốt và thoáng khí ngăn ngừa mùi hôi chân suốt 24h.
• Dây giày dệt mật độ cao chống xù, cổ giày đệm êm ái chống cọ xát gây đau gót chân.

📋 BẢNG SIZE GIÀY CHUẨN:
• Màu sắc: Đỏ Đô Phối Trắng, Trắng Kem Classic, Đen All-Black
• Size: 38, 39, 40, 41, 42, 43
  - Size 38: Chiều dài bàn chân 23.5 - 24.0 cm
  - Size 39: Chiều dài bàn chân 24.0 - 24.5 cm
  - Size 40: Chiều dài bàn chân 24.5 - 25.0 cm
  - Size 41: Chiều dài bàn chân 25.0 - 25.5 cm
  - Size 42: Chiều dài bàn chân 25.5 - 26.0 cm
  - Size 43: Chiều dài bàn chân 26.0 - 26.5 cm

🎁 BẢO QUẢN GIÀY ĐÚNG CÁCH:
• Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp gay gắt.
• Vệ sinh giày bằng bọt chuyên dụng hoặc khăn ẩm mềm.

🛡️ CHÍNH SÁCH BÁN HÀNG:
• Hỗ trợ đổi size trong vòng 7 ngày nếu không vừa chân.
• Kiểm tra hàng trước khi nhận và thanh toán (Ship COD toàn quốc).`,
};

async function updateDescriptions() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const db = mongoose.connection.db;

  let count = 0;
  for (const [slug, desc] of Object.entries(detailedDescriptions)) {
    const res = await db.collection('products').updateOne(
      { slug },
      { $set: { description: desc } }
    );
    if (res.matchedCount > 0) {
      count++;
      console.log(`✓ [${count}/15] Đã cập nhật mô tả chi tiết cho: ${slug}`);
    } else {
      console.warn(`! Không tìm thấy sản phẩm có slug: ${slug}`);
    }
  }

  console.log(`\n🎉 Hoàn thành cập nhật mô tả chi tiết cho ${count} sản phẩm!`);
  process.exit(0);
}

updateDescriptions().catch((err) => {
  console.error('Error updating descriptions:', err);
  process.exit(1);
});
