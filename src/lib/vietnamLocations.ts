export interface LocationDistrict {
  name: string;
  wards?: string[];
}

export interface LocationProvince {
  name: string;
  districts: LocationDistrict[];
}

export const vietnamProvinces: LocationProvince[] = [
  {
    name: 'Hà Nội',
    districts: [
      { name: 'Quận Ba Đình', wards: ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã'] },
      { name: 'Quận Cầu Giấy', wards: ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'] },
      { name: 'Quận Đống Đa', wards: ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Láng Hạ', 'Phường Ô Chợ Dừa'] },
      { name: 'Quận Hoàn Kiếm', wards: ['Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Tràng Tiền'] },
      { name: 'Quận Hai Bà Trưng', wards: ['Phường Bạch Đằng', 'Phường Bách Khoa', 'Phường Minh Khai', 'Phường Trương Định'] },
      { name: 'Quận Hoàng Mai', wards: ['Phường Định Công', 'Phường Giáp Bát', 'Phường Hoàng Liệt', 'Phường Tân Mai'] },
      { name: 'Quận Thanh Xuân', wards: ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Thanh Xuân Bắc'] },
      { name: 'Quận Nam Từ Liêm', wards: ['Phường Cầu Diễn', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Trung Văn'] },
      { name: 'Quận Bắc Từ Liêm', wards: ['Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Phúc Diễn', 'Phường Xuân Đỉnh'] },
      { name: 'Quận Hà Đông', wards: ['Phường Hà Cầu', 'Phường Mộ Lao', 'Phường Quang Trung', 'Phường Vạn Phúc', 'Phường Yên Nghĩa'] },
      { name: 'Quận Long Biên', wards: ['Phường Bồ Đề', 'Phường Đức Giang', 'Phường Ngọc Lâm', 'Phường Thượng Thanh'] },
      { name: 'Quận Tây Hồ', wards: ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Quảng An', 'Phường Thụy Khuê'] },
      { name: 'Huyện Gia Lâm', wards: ['Thị trấn Trâu Quỳ', 'Xã Đa Tốn', 'Xã Kiêu Kỵ', 'Xã Yên Thường'] },
      { name: 'Huyện Đông Anh', wards: ['Thị trấn Đông Anh', 'Xã Hải Bối', 'Xã Vĩnh Ngọc'] },
      { name: 'Huyện Sóc Sơn', wards: ['Thị trấn Sóc Sơn', 'Xã Phù Lỗ', 'Xã Tiên Dược'] },
      { name: 'Huyện Hoài Đức', wards: ['Thị trấn Trạm Trôi', 'Xã An Khánh', 'Xã Vân Canh'] },
      { name: 'Huyện Thanh Trì', wards: ['Thị trấn Văn Điển', 'Xã Tả Thanh Oai', 'Xã Tân Triều'] },
      { name: 'Thị xã Sơn Tây', wards: ['Phường Lê Lợi', 'Phường Ngô Quyền', 'Phường Quang Trung'] }
    ]
  },
  {
    name: 'TP. Hồ Chí Minh',
    districts: [
      { name: 'Quận 1', wards: ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao', 'Phường Tân Định'] },
      { name: 'Quận 3', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Võ Thị Sáu'] },
      { name: 'Quận 4', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 13'] },
      { name: 'Quận 5', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 11'] },
      { name: 'Quận 6', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 12'] },
      { name: 'Quận 7', wards: ['Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Tân Hưng', 'Phường Tân Phong', 'Phường Tân Quy'] },
      { name: 'Quận 8', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'] },
      { name: 'Quận 10', wards: ['Phường 1', 'Phường 2', 'Phường 12', 'Phường 14', 'Phường 15'] },
      { name: 'Quận 11', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 15'] },
      { name: 'Quận 12', wards: ['Phường An Phú Đông', 'Phường Tân Chánh Hiệp', 'Phường Thạnh Lộc'] },
      { name: 'TP. Thủ Đức', wards: ['Phường An Phú', 'Phường Bình Thọ', 'Phường Hiệp Phú', 'Phường Linh Chiểu', 'Phường Thảo Điền', 'Phường Tăng Nhơn Phú A'] },
      { name: 'Quận Bình Thạnh', wards: ['Phường 1', 'Phường 2', 'Phường 15', 'Phường 25', 'Phường 26'] },
      { name: 'Quận Tân Bình', wards: ['Phường 1', 'Phường 2', 'Phường 13', 'Phường 15'] },
      { name: 'Quận Tân Phú', wards: ['Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Tây Thạnh'] },
      { name: 'Quận Gò Vấp', wards: ['Phường 1', 'Phường 3', 'Phường 5', 'Phường 8', 'Phường 11'] },
      { name: 'Quận Phú Nhuận', wards: ['Phường 1', 'Phường 2', 'Phường 8', 'Phường 9'] },
      { name: 'Quận Bình Tân', wards: ['Phường An Lạc', 'Phường Bình Hưng Hòa', 'Phường Tân Tạo'] },
      { name: 'Huyện Hóc Môn', wards: ['Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Tân Thới Nhì'] },
      { name: 'Huyện Bình Chánh', wards: ['Thị trấn Tân Túc', 'Xã Bình Hưng', 'Xã Vĩnh Lộc A'] },
      { name: 'Huyện Củ Chi', wards: ['Thị trấn Củ Chi', 'Xã Tân An Hội', 'Xã Phú Hòa Đông'] },
      { name: 'Huyện Nhà Bè', wards: ['Thị trấn Nhà Bè', 'Xã Phước Kiển', 'Xã Phú Xuân'] },
      { name: 'Huyện Cần Giờ', wards: ['Thị trấn Cần Thạnh', 'Xã Long Hòa', 'Xã Bình Khánh'] }
    ]
  },
  {
    name: 'Đà Nẵng',
    districts: [
      { name: 'Quận Hải Châu', wards: ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Thạch Thang', 'Phường Thanh Bình'] },
      { name: 'Quận Thanh Khê', wards: ['Phường An Khê', 'Phường Chính Gián', 'Phường Tam Thuận', 'Phường Vĩnh Trung'] },
      { name: 'Quận Sơn Trà', wards: ['Phường An Hải Bắc', 'Phường An Hải Tây', 'Phường Phước Mỹ'] },
      { name: 'Quận Ngũ Hành Sơn', wards: ['Phường Khuê Mỹ', 'Phường Mỹ An', 'Phường Hòa Quý'] },
      { name: 'Quận Cẩm Lệ', wards: ['Phường Hòa An', 'Phường Hòa Phát', 'Phường Khuê Trung'] },
      { name: 'Quận Liên Chiểu', wards: ['Phường Hòa Hiệp Bắc', 'Phường Hòa Khánh Bắc', 'Phường Hòa Minh'] },
      { name: 'Huyện Hòa Vang', wards: ['Xã Hòa Châu', 'Xã Hòa Khương', 'Xã Hòa Nhơn'] },
      { name: 'Huyện Hoàng Sa', wards: ['Đặc khu Hoàng Sa'] }
    ]
  },
  {
    name: 'Hải Phòng',
    districts: [
      { name: 'Quận Hồng Bàng', wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu'] },
      { name: 'Quận Ngô Quyền', wards: ['Phường Cầu Đất', 'Phường Lạch Tray', 'Phường Máy Tơ'] },
      { name: 'Quận Lê Chân', wards: ['Phường An Biên', 'Phường Cát Dài', 'Phường Niệm Nghĩa'] },
      { name: 'Quận Hải An', wards: ['Phường Đông Hải', 'Phường Đằng Hải', 'Phường Nam Hải'] },
      { name: 'Quận Kiến An', wards: ['Phường Bắc Sơn', 'Phường Quán Trữ', 'Phường Trần Thành Ngọ'] },
      { name: 'Quận Đồ Sơn', wards: ['Phường Ngọc Xuyên', 'Phường Vạn Hương'] },
      { name: 'Quận Dương Kinh', wards: ['Phường Anh Dũng', 'Phường Hưng Đạo'] },
      { name: 'Huyện Thủy Nguyên', wards: ['Thị trấn Núi Đèo', 'Xã An Lư'] },
      { name: 'Huyện An Dương', wards: ['Thị trấn An Dương', 'Xã An Đồng'] }
    ]
  },
  {
    name: 'Cần Thơ',
    districts: [
      { name: 'Quận Ninh Kiều', wards: ['Phường An Cư', 'Phường An Khánh', 'Phường Hưng Lợi', 'Phường Tân An'] },
      { name: 'Quận Bình Thủy', wards: ['Phường An Thới', 'Phường Bình Thủy', 'Phường Trà An'] },
      { name: 'Quận Cái Răng', wards: ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Lê Bình'] },
      { name: 'Quận Ô Môn', wards: ['Phường Châu Văn Liêm', 'Phường Thới Hòa'] },
      { name: 'Quận Thốt Nốt', wards: ['Phường Thốt Nốt', 'Phường Trung Kiên'] },
      { name: 'Huyện Phong Điền', wards: ['Thị trấn Phong Điền', 'Xã Mỹ Khánh'] }
    ]
  },
  {
    name: 'An Giang',
    districts: [
      { name: 'TP. Long Xuyên', wards: ['Phường Mỹ Bình', 'Phường Mỹ Long', 'Phường Mỹ Phước'] },
      { name: 'TP. Châu Đốc', wards: ['Phường Châu Phú A', 'Phường Núi Sam'] },
      { name: 'Thị xã Tân Châu', wards: ['Phường Long Hưng', 'Phường Long Thạnh'] },
      { name: 'Huyện Chợ Mới', wards: ['Thị trấn Chợ Mới', 'Xã Mỹ An'] },
      { name: 'Huyện Thoại Sơn', wards: ['Thị trấn Núi Sập', 'Thị trấn Phú Hòa'] }
    ]
  },
  {
    name: 'Bà Rịa - Vũng Tàu',
    districts: [
      { name: 'TP. Vũng Tàu', wards: ['Phường 1', 'Phường 2', 'Phường Thắng Tam', 'Phường Nguyễn An Ninh'] },
      { name: 'TP. Bà Rịa', wards: ['Phường Phước Trung', 'Phường Phước Hiệp'] },
      { name: 'Thị xã Phú Mỹ', wards: ['Phường Phú Mỹ', 'Phường Tân Phước'] },
      { name: 'Huyện Long Điền', wards: ['Thị trấn Long Hải', 'Thị trấn Long Điền'] },
      { name: 'Huyện Xuyên Mộc', wards: ['Thị trấn Phước Bửu', 'Xã Bình Châu'] },
      { name: 'Huyện Côn Đảo', wards: ['Trung tâm Côn Đảo'] }
    ]
  },
  {
    name: 'Bắc Giang',
    districts: [
      { name: 'TP. Bắc Giang', wards: ['Phường Hoàng Văn Thụ', 'Phường Ngô Quyền', 'Phường Lê Lợi'] },
      { name: 'Thị xã Việt Yên', wards: ['Phường Bích Động', 'Phường Nếnh'] },
      { name: 'Huyện Hiệp Hòa', wards: ['Thị trấn Thắng', 'Xã Châu Minh'] },
      { name: 'Huyện Lạng Giang', wards: ['Thị trấn Vôi', 'Xã Tân Dĩnh'] },
      { name: 'Huyện Lục Nam', wards: ['Thị trấn Đồi Ngô', 'Xã Phương Sơn'] }
    ]
  },
  {
    name: 'Bắc Kạn',
    districts: [
      { name: 'TP. Bắc Kạn', wards: ['Phường Đức Xuân', 'Phường Sông Cầu'] },
      { name: 'Huyện Ba Bể', wards: ['Thị trấn Chợ Rã', 'Xã Nam Mẫu'] },
      { name: 'Huyện Bạch Thông', wards: ['Thị trấn Phủ Thông'] },
      { name: 'Huyện Chợ Đồn', wards: ['Thị trấn Bằng Lũng'] }
    ]
  },
  {
    name: 'Bạc Liêu',
    districts: [
      { name: 'TP. Bạc Liêu', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 7', 'Phường Nhà Mát'] },
      { name: 'Thị xã Giá Rai', wards: ['Phường 1', 'Phường Hộ Phòng'] },
      { name: 'Huyện Hòa Bình', wards: ['Thị trấn Hòa Bình'] },
      { name: 'Huyện Vĩnh Lợi', wards: ['Thị trấn Châu Hưng'] }
    ]
  },
  {
    name: 'Bắc Ninh',
    districts: [
      { name: 'TP. Bắc Ninh', wards: ['Phường Suối Hoa', 'Phường Tiền An', 'Phường Ninh Xá', 'Phường Võ Cường'] },
      { name: 'TP. Từ Sơn', wards: ['Phường Đông Ngàn', 'Phường Đồng Nguyên', 'Phường Trang Hạ'] },
      { name: 'Thị xã Thuận Thành', wards: ['Phường Hồ', 'Phường Song Hồ'] },
      { name: 'Thị xã Quế Võ', wards: ['Phường Phố Mới', 'Phường Bằng An'] },
      { name: 'Huyện Yên Phong', wards: ['Thị trấn Chờ', 'Xã Đông Phong'] },
      { name: 'Huyện Tiên Du', wards: ['Thị trấn Lim', 'Xã Liên Bão'] }
    ]
  },
  {
    name: 'Bến Tre',
    districts: [
      { name: 'TP. Bến Tre', wards: ['Phường An Hội', 'Phường Phú Khương', 'Phường Phú Tân'] },
      { name: 'Huyện Châu Thành', wards: ['Thị trấn Châu Thành', 'Xã Tân Thạch'] },
      { name: 'Huyện Chợ Lách', wards: ['Thị trấn Chợ Lách', 'Xã Vĩnh Thành'] },
      { name: 'Huyện Mỏ Cày Nam', wards: ['Thị trấn Mỏ Cày'] }
    ]
  },
  {
    name: 'Bình Định',
    districts: [
      { name: 'TP. Quy Nhơn', wards: ['Phường Lê Lợi', 'Phường Trần Phú', 'Phường Nguyễn Văn Cừ', 'Phường Ghềnh Ráng'] },
      { name: 'Thị xã An Nhơn', wards: ['Phường Bình Định', 'Phường Đập Đá'] },
      { name: 'Thị xã Hoài Nhơn', wards: ['Phường Bồng Sơn', 'Phường Tam Quan'] },
      { name: 'Huyện Tuy Phước', wards: ['Thị trấn Tuy Phước', 'Thị trấn Diêu Trì'] }
    ]
  },
  {
    name: 'Bình Dương',
    districts: [
      { name: 'TP. Thủ Dầu Một', wards: ['Phường Chánh Nghĩa', 'Phường Hiệp An', 'Phường Phú Hòa', 'Phường Phú Cường'] },
      { name: 'TP. Thuận An', wards: ['Phường An Phú', 'Phường Lái Thiêu', 'Phường Thuận Giao', 'Phường Bình Hòa'] },
      { name: 'TP. Dĩ An', wards: ['Phường An Bình', 'Phường Dĩ An', 'Phường Tân Bình', 'Phường Đông Hòa'] },
      { name: 'TP. Tân Uyên', wards: ['Phường Uyên Hưng', 'Phường Tân Phước Khánh', 'Phường Thái Hòa'] },
      { name: 'TP. Bến Cát', wards: ['Phường Mỹ Phước', 'Phường Thới Hòa', 'Phường Tân Định'] },
      { name: 'Huyện Bàu Bàng', wards: ['Thị trấn Lai Uyên'] }
    ]
  },
  {
    name: 'Bình Phước',
    districts: [
      { name: 'TP. Đồng Xoài', wards: ['Phường Tân Phú', 'Phường Tân Đồng', 'Phường Tân Bình'] },
      { name: 'Thị xã Phước Long', wards: ['Phường Long Phước', 'Phường Thác Mơ'] },
      { name: 'Thị xã Chơn Thành', wards: ['Phường Hưng Long', 'Phường Thành Tâm'] },
      { name: 'Thị xã Bình Long', wards: ['Phường An Lộc', 'Phường Phú Đức'] }
    ]
  },
  {
    name: 'Bình Thuận',
    districts: [
      { name: 'TP. Phan Thiết', wards: ['Phường Mũi Né', 'Phường Hàm Tiến', 'Phường Phú Thủy', 'Phường Đức Nghĩa'] },
      { name: 'Thị xã La Gi', wards: ['Phường Phước Hội', 'Phường Tân An'] },
      { name: 'Huyện Hàm Thuận Bắc', wards: ['Thị trấn Ma Lâm'] },
      { name: 'Huyện Hàm Thuận Nam', wards: ['Thị trấn Thuận Nam'] }
    ]
  },
  {
    name: 'Cà Mau',
    districts: [
      { name: 'TP. Cà Mau', wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 8', 'Phường 9'] },
      { name: 'Huyện Năm Căn', wards: ['Thị trấn Năm Căn'] },
      { name: 'Huyện Ngọc Hiển', wards: ['Thị trấn Rạch Gốc', 'Xã Đất Mũi'] },
      { name: 'Huyện Cái Nước', wards: ['Thị trấn Cái Nước'] }
    ]
  },
  {
    name: 'Cao Bằng',
    districts: [
      { name: 'TP. Cao Bằng', wards: ['Phường Hợp Giang', 'Phường Sông Bằng', 'Phường Tân Giang'] },
      { name: 'Huyện Trùng Khánh', wards: ['Thị trấn Trùng Khánh', 'Xã Đàm Thủy'] },
      { name: 'Huyện Quảng Hòa', wards: ['Thị trấn Quảng Uyên'] }
    ]
  },
  {
    name: 'Đắk Lắk',
    districts: [
      { name: 'TP. Buôn Ma Thuột', wards: ['Phường Thắng Lợi', 'Phường Tân Lợi', 'Phường Tự An', 'Phường Ea Tam'] },
      { name: 'Thị xã Buôn Hồ', wards: ['Phường An Lạc', 'Phường Thiện An'] },
      { name: 'Huyện Cư M\'gar', wards: ['Thị trấn Quảng Phú'] },
      { name: 'Huyện Krông Pắc', wards: ['Thị trấn Phước An'] }
    ]
  },
  {
    name: 'Đắk Nông',
    districts: [
      { name: 'TP. Gia Nghĩa', wards: ['Phường Nghĩa Đức', 'Phường Nghĩa Thành', 'Phường Nghĩa Phú'] },
      { name: 'Huyện Cư Jút', wards: ['Thị trấn Ea T\'ling'] },
      { name: 'Huyện Đắk Mil', wards: ['Thị trấn Đắk Mil'] }
    ]
  },
  {
    name: 'Điện Biên',
    districts: [
      { name: 'TP. Điện Biên Phủ', wards: ['Phường Mường Thanh', 'Phường Tân Thanh', 'Phường Nam Thanh'] },
      { name: 'Thị xã Mường Lay', wards: ['Phường Sông Đà', 'Phường Na Lay'] },
      { name: 'Huyện Điện Biên', wards: ['Xã Thanh Nưa', 'Xã Thanh An'] }
    ]
  },
  {
    name: 'Đồng Nai',
    districts: [
      { name: 'TP. Biên Hòa', wards: ['Phường Bửu Long', 'Phường Quyết Thắng', 'Phường Tân Phong', 'Phường Thống Nhất', 'Phường Trảng Dài'] },
      { name: 'TP. Long Khánh', wards: ['Phường Xuân An', 'Phường Xuân Bình', 'Phường Xuân Trung'] },
      { name: 'Huyện Long Thành', wards: ['Thị trấn Long Thành', 'Xã An Phước'] },
      { name: 'Huyện Nhơn Trạch', wards: ['Xã Hiệp Phước', 'Xã Phước Thiền'] },
      { name: 'Huyện Trảng Bom', wards: ['Thị trấn Trảng Bom', 'Xã Hố Nai 3'] }
    ]
  },
  {
    name: 'Đồng Tháp',
    districts: [
      { name: 'TP. Cao Lãnh', wards: ['Phường 1', 'Phường 2', 'Phường Mỹ Phú'] },
      { name: 'TP. Sa Đéc', wards: ['Phường 1', 'Phường 2', 'Phường Tân Quy Đông'] },
      { name: 'TP. Hồng Ngự', wards: ['Phường An Lộc', 'Phường An Thạnh'] },
      { name: 'Huyện Tháp Mười', wards: ['Thị trấn Mỹ An'] }
    ]
  },
  {
    name: 'Gia Lai',
    districts: [
      { name: 'TP. Pleiku', wards: ['Phường Diên Hồng', 'Phường Hoa Lư', 'Phường Hội Thương', 'Phường Tây Sơn'] },
      { name: 'Thị xã An Khê', wards: ['Phường An Phú', 'Phường Tây Sơn'] },
      { name: 'Thị xã Ayun Pa', wards: ['Phường Cheo Reo', 'Phường Đoàn Kết'] }
    ]
  },
  {
    name: 'Hà Giang',
    districts: [
      { name: 'TP. Hà Giang', wards: ['Phường Trần Phú', 'Phường Minh Khai', 'Phường Nguyễn Trãi'] },
      { name: 'Huyện Đồng Văn', wards: ['Thị trấn Đồng Văn', 'Thị trấn Phố Bảng'] },
      { name: 'Huyện Mèo Vạc', wards: ['Thị trấn Mèo Vạc'] },
      { name: 'Huyện Yên Minh', wards: ['Thị trấn Yên Minh'] }
    ]
  },
  {
    name: 'Hà Nam',
    districts: [
      { name: 'TP. Phủ Lý', wards: ['Phường Minh Khai', 'Phường Lương Khánh Thiện', 'Phường Trần Hưng Đạo'] },
      { name: 'Thị xã Duy Tiên', wards: ['Phường Đồng Văn', 'Phường Hòa Mạc'] },
      { name: 'Huyện Kim Bảng', wards: ['Thị trấn Quế', 'Thị trấn Ba Sao'] }
    ]
  },
  {
    name: 'Hà Tĩnh',
    districts: [
      { name: 'TP. Hà Tĩnh', wards: ['Phường Bắc Hà', 'Phường Nam Hà', 'Phường Trần Phú'] },
      { name: 'Thị xã Hồng Lĩnh', wards: ['Phường Bắc Hồng', 'Phường Nam Hồng'] },
      { name: 'Thị xã Kỳ Anh', wards: ['Phường Sông Trí', 'Phường Kỳ Liên'] },
      { name: 'Huyện Nghi Xuân', wards: ['Thị trấn Tiên Điền', 'Thị trấn Xuân An'] }
    ]
  },
  {
    name: 'Hải Dương',
    districts: [
      { name: 'TP. Hải Dương', wards: ['Phường Quang Trung', 'Phường Trần Phú', 'Phường Lê Thanh Nghị', 'Phường Hải Tân'] },
      { name: 'TP. Chí Linh', wards: ['Phường Sao Đỏ', 'Phường Cộng Hòa'] },
      { name: 'Thị xã Kinh Môn', wards: ['Phường An Lưu', 'Phường Hiệp An'] },
      { name: 'Huyện Cẩm Giàng', wards: ['Thị trấn Lai Cách', 'Thị trấn Cẩm Giàng'] }
    ]
  },
  {
    name: 'Hậu Giang',
    districts: [
      { name: 'TP. Vị Thanh', wards: ['Phường 1', 'Phường 3', 'Phường 4'] },
      { name: 'TP. Ngã Bảy', wards: ['Phường Ngã Bảy', 'Phường Hiệp Thành'] },
      { name: 'Thị xã Long Mỹ', wards: ['Phường Thuận An', 'Phường Bình Thạnh'] }
    ]
  },
  {
    name: 'Hòa Bình',
    districts: [
      { name: 'TP. Hòa Bình', wards: ['Phường Phương Lâm', 'Phường Đồng Tiến', 'Phường Tân Hòa'] },
      { name: 'Huyện Lương Sơn', wards: ['Thị trấn Lương Sơn'] },
      { name: 'Huyện Mai Châu', wards: ['Thị trấn Mai Châu'] }
    ]
  },
  {
    name: 'Hưng Yên',
    districts: [
      { name: 'TP. Hưng Yên', wards: ['Phường Lê Lợi', 'Phường Quang Trung', 'Phường Hiến Nam'] },
      { name: 'Thị xã Mỹ Hào', wards: ['Phường Bần Yên Nhân', 'Phường Bạch Sam'] },
      { name: 'Huyện Văn Giang', wards: ['Thị trấn Văn Giang', 'Xã Phụng Công', 'Xã Xuân Quan'] },
      { name: 'Huyện Yên Mỹ', wards: ['Thị trấn Yên Mỹ'] }
    ]
  },
  {
    name: 'Khánh Hòa',
    districts: [
      { name: 'TP. Nha Trang', wards: ['Phường Lộc Thọ', 'Phường Tân Lập', 'Phường Phước Hải', 'Phường Vĩnh Hải'] },
      { name: 'TP. Cam Ranh', wards: ['Phường Cam Linh', 'Phường Cam Phú'] },
      { name: 'Thị xã Ninh Hòa', wards: ['Phường Ninh Hiệp', 'Phường Ninh Đa'] },
      { name: 'Huyện Diên Khánh', wards: ['Thị trấn Diên Khánh'] },
      { name: 'Huyện Vạn Ninh', wards: ['Thị trấn Vạn Giã'] }
    ]
  },
  {
    name: 'Kiên Giang',
    districts: [
      { name: 'TP. Rạch Giá', wards: ['Phường Vĩnh Thanh Vân', 'Phường Vĩnh Lạc', 'Phường An Hòa'] },
      { name: 'TP. Phú Quốc', wards: ['Phường Dương Đông', 'Phường An Thới', 'Xã Gành Dầu', 'Xã Hàm Ninh'] },
      { name: 'TP. Hà Tiên', wards: ['Phường Đông Hồ', 'Phường Pháo Đài'] }
    ]
  },
  {
    name: 'Kon Tum',
    districts: [
      { name: 'TP. Kon Tum', wards: ['Phường Quyết Thắng', 'Phường Quang Trung', 'Phường Thắng Lợi'] },
      { name: 'Huyện Đắk Hà', wards: ['Thị trấn Đắk Hà'] },
      { name: 'Huyện Ngọc Hồi', wards: ['Thị trấn Plei Kần'] }
    ]
  },
  {
    name: 'Lai Châu',
    districts: [
      { name: 'TP. Lai Châu', wards: ['Phường Quyết Thắng', 'Phường Đoàn Kết', 'Phường Tân Phong'] },
      { name: 'Huyện Phong Thổ', wards: ['Thị trấn Phong Thổ'] },
      { name: 'Huyện Tam Đường', wards: ['Thị trấn Tam Đường'] }
    ]
  },
  {
    name: 'Lâm Đồng',
    districts: [
      { name: 'TP. Đà Lạt', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 8', 'Phường 10'] },
      { name: 'TP. Bảo Lộc', wards: ['Phường 1', 'Phường 2', 'Phường B\'Lao'] },
      { name: 'Huyện Đức Trọng', wards: ['Thị trấn Liên Nghĩa'] },
      { name: 'Huyện Lạc Dương', wards: ['Thị trấn Lạc Dương'] }
    ]
  },
  {
    name: 'Lạng Sơn',
    districts: [
      { name: 'TP. Lạng Sơn', wards: ['Phường Hoàng Văn Thụ', 'Phường Tam Thanh', 'Phường Vĩnh Trại'] },
      { name: 'Huyện Cao Lộc', wards: ['Thị trấn Đồng Đăng', 'Thị trấn Cao Lộc'] },
      { name: 'Huyện Hữu Lũng', wards: ['Thị trấn Hữu Lũng'] }
    ]
  },
  {
    name: 'Lào Cai',
    districts: [
      { name: 'TP. Lào Cai', wards: ['Phường Kim Tân', 'Phường Cốc Lếu', 'Phường Bắc Cường'] },
      { name: 'Thị xã Sa Pa', wards: ['Phường Sa Pa', 'Phường Cầu Mây', 'Phường Hàm Rồng'] },
      { name: 'Huyện Bát Xát', wards: ['Thị trấn Bát Xát'] }
    ]
  },
  {
    name: 'Long An',
    districts: [
      { name: 'TP. Tân An', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Khánh Hậu'] },
      { name: 'Thị xã Kiến Tường', wards: ['Phường 1', 'Phường 2'] },
      { name: 'Huyện Bến Lức', wards: ['Thị trấn Bến Lức'] },
      { name: 'Huyện Đức Hòa', wards: ['Thị trấn Hậu Nghĩa', 'Thị trấn Đức Hòa'] },
      { name: 'Huyện Cần Giuộc', wards: ['Thị trấn Cần Giuộc'] }
    ]
  },
  {
    name: 'Nam Định',
    districts: [
      { name: 'TP. Nam Định', wards: ['Phường Trần Hưng Đạo', 'Phường Vị Hoàng', 'Phường Năng Tĩnh'] },
      { name: 'Huyện Hải Hậu', wards: ['Thị trấn Yên Định', 'Thị trấn Cồn'] },
      { name: 'Huyện Giao Thủy', wards: ['Thị trấn Ngô Đồng'] },
      { name: 'Huyện Ý Yên', wards: ['Thị trấn Lâm'] }
    ]
  },
  {
    name: 'Nghệ An',
    districts: [
      { name: 'TP. Vinh', wards: ['Phường Lê Lợi', 'Phường Quang Trung', 'Phường Trường Thi', 'Phường Hưng Dũng'] },
      { name: 'Thị xã Cửa Lò', wards: ['Phường Nghi Hương', 'Phường Thu Thủy'] },
      { name: 'Thị xã Thái Hòa', wards: ['Phường Hòa Hiếu', 'Phường Quang Tiến'] },
      { name: 'Thị xã Hoàng Mai', wards: ['Phường Quỳnh Thiện', 'Phường Mai Hùng'] },
      { name: 'Huyện Diễn Châu', wards: ['Thị trấn Diễn Châu'] },
      { name: 'Huyện Quỳnh Lưu', wards: ['Thị trấn Cầu Giát'] }
    ]
  },
  {
    name: 'Ninh Bình',
    districts: [
      { name: 'TP. Ninh Bình', wards: ['Phường Đông Thành', 'Phường Tân Thành', 'Phường Vân Giang'] },
      { name: 'TP. Tam Điệp', wards: ['Phường Bắc Sơn', 'Phường Trung Sơn'] },
      { name: 'Huyện Hoa Lư', wards: ['Thị trấn Thiên Tôn'] },
      { name: 'Huyện Gia Viễn', wards: ['Thị trấn Me'] }
    ]
  },
  {
    name: 'Ninh Thuận',
    districts: [
      { name: 'TP. Phan Rang - Tháp Chàm', wards: ['Phường Kinh Dinh', 'Phường Thanh Sơn', 'Phường Mỹ Hương'] },
      { name: 'Huyện Ninh Hải', wards: ['Thị trấn Khánh Hải'] },
      { name: 'Huyện Ninh Phước', wards: ['Thị trấn Phước Dân'] }
    ]
  },
  {
    name: 'Phú Thọ',
    districts: [
      { name: 'TP. Việt Trì', wards: ['Phường Gia Cẩm', 'Phường Tiên Cát', 'Phường Nông Trang'] },
      { name: 'Thị xã Phú Thọ', wards: ['Phường Âu Cơ', 'Phường Hùng Vương'] },
      { name: 'Huyện Lâm Thao', wards: ['Thị trấn Lâm Thao', 'Thị trấn Hùng Sơn'] }
    ]
  },
  {
    name: 'Phú Yên',
    districts: [
      { name: 'TP. Tuy Hòa', wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 7'] },
      { name: 'Thị xã Sông Cầu', wards: ['Phường Xuân Phú', 'Phường Xuân Yên'] },
      { name: 'Thị xã Đông Hòa', wards: ['Phường Hòa Hiệp Bắc', 'Phường Hòa Vinh'] }
    ]
  },
  {
    name: 'Quảng Bình',
    districts: [
      { name: 'TP. Đồng Hới', wards: ['Phường Đồng Mỹ', 'Phường Hải Đình', 'Phường Bắc Lý'] },
      { name: 'Thị xã Ba Đồn', wards: ['Phường Ba Đồn', 'Phường Quảng Thọ'] },
      { name: 'Huyện Bố Trạch', wards: ['Thị trấn Hoàn Lão', 'Thị trấn Phong Nha'] }
    ]
  },
  {
    name: 'Quảng Nam',
    districts: [
      { name: 'TP. Tam Kỳ', wards: ['Phường An Mỹ', 'Phường Phước Hòa', 'Phường Tân Thạnh'] },
      { name: 'TP. Hội An', wards: ['Phường Minh An', 'Phường Cẩm Phô', 'Phường Sơn Phong'] },
      { name: 'Thị xã Điện Bàn', wards: ['Phường Vĩnh Điện', 'Phường Điện Ngọc'] },
      { name: 'Huyện Núi Thành', wards: ['Thị trấn Núi Thành'] }
    ]
  },
  {
    name: 'Quảng Ngãi',
    districts: [
      { name: 'TP. Quảng Ngãi', wards: ['Phường Lê Hồng Phong', 'Phường Trần Phú', 'Phường Nghĩa Chánh'] },
      { name: 'Thị xã Đức Phổ', wards: ['Phường Nguyễn Nghiêm', 'Phường Phổ Thạnh'] },
      { name: 'Huyện Bình Sơn', wards: ['Thị trấn Châu Ổ'] }
    ]
  },
  {
    name: 'Quảng Ninh',
    districts: [
      { name: 'TP. Hạ Long', wards: ['Phường Bãi Cháy', 'Phường Hồng Gai', 'Phường Cao Xanh', 'Phường Hồng Hải'] },
      { name: 'TP. Móng Cái', wards: ['Phường Trần Phú', 'Phường Ka Long', 'Phường Trà Cổ'] },
      { name: 'TP. Cẩm Phả', wards: ['Phường Cẩm Trung', 'Phường Cẩm Thành'] },
      { name: 'TP. Uông Bí', wards: ['Phường Quang Trung', 'Phường Thanh Sơn'] },
      { name: 'Thị xã Đông Triều', wards: ['Phường Đông Triều', 'Phường Mạo Khê'] },
      { name: 'Thị xã Quảng Yên', wards: ['Phường Quảng Yên', 'Phường Yên Giang'] }
    ]
  },
  {
    name: 'Quảng Trị',
    districts: [
      { name: 'TP. Đông Hà', wards: ['Phường 1', 'Phường 2', 'Phường 5'] },
      { name: 'Thị xã Quảng Trị', wards: ['Phường 1', 'Phường 2', 'Phường 3'] },
      { name: 'Huyện Gio Linh', wards: ['Thị trấn Gio Linh', 'Thị trấn Cửa Việt'] }
    ]
  },
  {
    name: 'Sóc Trăng',
    districts: [
      { name: 'TP. Sóc Trăng', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 6'] },
      { name: 'Thị xã Vĩnh Châu', wards: ['Phường 1', 'Phường 2'] },
      { name: 'Thị xã Ngã Năm', wards: ['Phường 1', 'Phường 2'] }
    ]
  },
  {
    name: 'Sơn La',
    districts: [
      { name: 'TP. Sơn La', wards: ['Phường Chiềng Lề', 'Phường Quyết Thắng', 'Phường Tô Hiệu'] },
      { name: 'Huyện Mộc Châu', wards: ['Thị trấn Mộc Châu', 'Thị trấn Nông trường Mộc Châu'] },
      { name: 'Huyện Mai Sơn', wards: ['Thị trấn Hát Lót'] }
    ]
  },
  {
    name: 'Tây Ninh',
    districts: [
      { name: 'TP. Tây Ninh', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Hiệp Ninh'] },
      { name: 'Thị xã Trảng Bàng', wards: ['Phường Trảng Bàng', 'Phường An Tịnh'] },
      { name: 'Thị xã Hòa Thành', wards: ['Phường Long Hoa', 'Phường Hiệp Tân'] }
    ]
  },
  {
    name: 'Thái Bình',
    districts: [
      { name: 'TP. Thái Bình', wards: ['Phường Lê Hồng Phong', 'Phường Bồ Xuyên', 'Phường Đề Thám'] },
      { name: 'Huyện Hưng Hà', wards: ['Thị trấn Hưng Hà', 'Thị trấn Hưng Nhân'] },
      { name: 'Huyện Đông Hưng', wards: ['Thị trấn Đông Hưng'] },
      { name: 'Huyện Tiền Hải', wards: ['Thị trấn Tiền Hải'] }
    ]
  },
  {
    name: 'Thái Nguyên',
    districts: [
      { name: 'TP. Thái Nguyên', wards: ['Phường Phan Đình Phùng', 'Phường Hoàng Văn Thụ', 'Phường Đồng Quang'] },
      { name: 'TP. Sông Công', wards: ['Phường Thắng Lợi', 'Phường Mỏ Chè'] },
      { name: 'TP. Phổ Yên', wards: ['Phường Ba Hàng', 'Phường Đắc Sơn'] }
    ]
  },
  {
    name: 'Thanh Hóa',
    districts: [
      { name: 'TP. Thanh Hóa', wards: ['Phường Điện Biên', 'Phường Ba Đình', 'Phường Lam Sơn', 'Phường Đông Thọ'] },
      { name: 'TP. Sầm Sơn', wards: ['Phường Bắc Sơn', 'Phường Trường Sơn', 'Phường Trung Sơn'] },
      { name: 'Thị xã Bỉm Sơn', wards: ['Phường Ba Đình', 'Phường Ngọc Trạo'] },
      { name: 'Thị xã Nghi Sơn', wards: ['Phường Hải Hòa', 'Phường Tĩnh Gia'] },
      { name: 'Huyện Hoằng Hóa', wards: ['Thị trấn Bút Sơn'] }
    ]
  },
  {
    name: 'Thừa Thiên Huế',
    districts: [
      { name: 'TP. Huế', wards: ['Phường Vĩnh Ninh', 'Phường Phú Nhuận', 'Phường Thuận Thành', 'Phường Hương Sơ'] },
      { name: 'Thị xã Hương Thủy', wards: ['Phường Phú Bài', 'Phường Thủy Dương'] },
      { name: 'Thị xã Hương Trà', wards: ['Phường Tứ Hạ', 'Phường Hương Văn'] },
      { name: 'Huyện Phú Vang', wards: ['Thị trấn Thuận An'] }
    ]
  },
  {
    name: 'Tiền Giang',
    districts: [
      { name: 'TP. Mỹ Tho', wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 7'] },
      { name: 'Thị xã Gò Công', wards: ['Phường 1', 'Phường 2'] },
      { name: 'Thị xã Cai Lậy', wards: ['Phường 1', 'Phường 4'] }
    ]
  },
  {
    name: 'Trà Vinh',
    districts: [
      { name: 'TP. Trà Vinh', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 7'] },
      { name: 'Thị xã Duyên Hải', wards: ['Phường 1', 'Phường 2'] },
      { name: 'Huyện Châu Thành', wards: ['Thị trấn Châu Thành'] }
    ]
  },
  {
    name: 'Tuyên Quang',
    districts: [
      { name: 'TP. Tuyên Quang', wards: ['Phường Tân Quang', 'Phường Phan Thiết', 'Phường Minh Xuân'] },
      { name: 'Huyện Sơn Dương', wards: ['Thị trấn Sơn Dương'] },
      { name: 'Huyện Yên Sơn', wards: ['Thị trấn Yên Sơn'] }
    ]
  },
  {
    name: 'Vĩnh Long',
    districts: [
      { name: 'TP. Vĩnh Long', wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 9'] },
      { name: 'Thị xã Bình Minh', wards: ['Phường Cái Vồn', 'Phường Thành Phước'] },
      { name: 'Huyện Long Hồ', wards: ['Thị trấn Long Hồ'] }
    ]
  },
  {
    name: 'Vĩnh Phúc',
    districts: [
      { name: 'TP. Vĩnh Yên', wards: ['Phường Ngô Quyền', 'Phường Tích Sơn', 'Phường Liên Bảo'] },
      { name: 'TP. Phúc Yên', wards: ['Phường Trưng Trắc', 'Phường Hùng Vương', 'Phường Xuân Hòa'] },
      { name: 'Huyện Bình Xuyên', wards: ['Thị trấn Hương Canh'] }
    ]
  },
  {
    name: 'Yên Bái',
    districts: [
      { name: 'TP. Yên Bái', wards: ['Phường Đồng Tâm', 'Phường Nguyễn Thái Học', 'Phường Minh Tân'] },
      { name: 'Thị xã Nghĩa Lộ', wards: ['Phường Tân An', 'Phường Trung Tâm'] },
      { name: 'Huyện Mù Cang Chải', wards: ['Thị trấn Mù Cang Chải'] }
    ]
  }
];