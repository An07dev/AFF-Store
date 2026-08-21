import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST() {
  try {
    await connectToDatabase();
    const products = await Product.find({});
    let updatedCount = 0;

    for (const prod of products) {
      const name = prod.name || '';
      const nameLower = name.toLowerCase().trim();
      let originalPrice = prod.price || 300000;
      let salePrice = prod.salePrice || 0;

      // Ensure proper pricing logic: originalPrice must be higher than salePrice
      if (salePrice >= originalPrice && originalPrice > 0) {
        originalPrice = Math.round((salePrice * 1.25) / 10000) * 10000;
      } else if (!salePrice || salePrice <= 0) {
        salePrice = Math.round((originalPrice * 0.82) / 5000) * 5000;
      }

      // If price was abnormal (e.g. 128000 for 1190000 salePrice on VBE)
      if (originalPrice < 100000 && salePrice > 500000) {
        originalPrice = Math.round((salePrice * 1.25) / 10000) * 10000;
      }

      let options: { name: string; values: string[] }[] = [];
      let variants: any[] = [];
      let description = '';

      // 1. QUẢ BÓNG ĐÁ
      if (
        nameLower.includes('quả bóng') ||
        nameLower.includes('qua bong') ||
        nameLower.startsWith('bóng') ||
        nameLower.includes('striker') ||
        nameLower.includes('vleague') ||
        nameLower.includes('champions league') ||
        nameLower.includes('world cup 2025') ||
        nameLower.includes('vbe') ||
        nameLower.includes('ucv') ||
        nameLower.includes('uhv')
      ) {
        options = [{ name: 'Kích cỡ', values: ['Size 4 (Sân mini / Trẻ em)', 'Size 5 (Tiêu chuẩn FIFA)'] }];
        variants = [
          {
            sku: `${prod.slug.toUpperCase().slice(0, 15)}-SZ4`,
            title: 'Size 4 (Sân mini / Trẻ em)',
            name: 'Size 4 (Sân mini / Trẻ em)',
            size: 'Size 4',
            attributes: { 'Kích cỡ': 'Size 4 (Sân mini / Trẻ em)' },
            price: Math.max(50000, originalPrice - 30000),
            salePrice: Math.max(40000, salePrice - 30000),
            stock: 35,
          },
          {
            sku: `${prod.slug.toUpperCase().slice(0, 15)}-SZ5`,
            title: 'Size 5 (Tiêu chuẩn FIFA)',
            name: 'Size 5 (Tiêu chuẩn FIFA)',
            size: 'Size 5',
            attributes: { 'Kích cỡ': 'Size 5 (Tiêu chuẩn FIFA)' },
            price: originalPrice,
            salePrice: salePrice,
            stock: 50,
          },
        ];

        description = `⚽ ĐẶC ĐIỂM NỔI BẬT:
• Chất liệu da PU/PVC cao cấp phủ lớp bảo vệ chống thấm nước 100%, tăng độ bền bỉ khi thi đấu trong mọi điều kiện thời tiết (mưa, ẩm ướt).
• Cấu trúc đa lớp ép nhiệt chân không kết hợp chỉ may chuyên dụng, giữ độ tròn đều tuyệt đối và quỹ đạo bay ổn định chuẩn xác.
• Ruột bóng cao su non cao cấp giữ áp suất hơi tối ưu, không bị xì hơi hoặc biến dạng sau thời gian dài sử dụng liên tục.
• Bề mặt bóng dập vân nổi 3D tạo ma sát lý tưởng, hỗ trợ kiểm soát bóng dính chân và thực hiện các cú sút xoáy uy lực.

📐 PHÂN LOẠI KÍCH CỠ:
• Size 4: Chu vi 63.5 - 66 cm, trọng lượng 350 - 390g (Phù hợp sân 5 người, lứa tuổi học sinh / thiếu nhi).
• Size 5: Chu vi 68 - 70 cm, trọng lượng 410 - 450g (Kích thước tiêu chuẩn thi đấu FIFA sân 7 - 11 người).

🎁 QUÀ TẶNG KÈM KHI MUA:
• 01 Kim bơm bóng kim loại chống gỉ.
• 01 Túi lưới đựng bóng thể thao tiện lợi.

🛡️ CHÍNH SÁCH BẢO HÀNH & ĐỔI TRẢ:
• Bảo hành lỗi 1 đổi 1 trong 30 ngày nếu bóng có hiện tượng xì van, bung chỉ, méo bóng từ nhà sản xuất.
• Kiểm tra hàng thoải mái trước khi thanh toán.`;
      }
      // 2. GIÀY ĐÁ BÓNG / THỂ THAO
      else if (nameLower.includes('giày') || nameLower.includes('giay') || nameLower.includes('boot') || nameLower.includes('akka') || nameLower.includes('jgbl')) {
        options = [{ name: 'Kích cỡ', values: ['39', '40', '41', '42', '43'] }];
        variants = options[0].values.map((size, idx) => ({
          sku: `${prod.slug.toUpperCase().slice(0, 15)}-${size}`,
          title: `Size ${size}`,
          name: `Size ${size}`,
          size: size,
          attributes: { 'Kích cỡ': size },
          price: originalPrice,
          salePrice: salePrice,
          stock: 40 + idx * 5,
        }));

        description = `👟 THÔNG SỐ VÀ ĐẶC ĐIỂM KỸ THUẬT:
• Thân giày (Upper): Da Microfiber thế hệ mới siêu mềm êm, ôm sát bàn chân, phủ vân nổi 3D tăng cường độ cảm giác chạm bóng và hỗ trợ kiểm soát bóng tối đa.
• Đế giày (Outsole): Đinh cao su TF phân bố khoa học, chống trơn trượt hiệu quả, bám sân cực tốt ngay cả khi trời mưa trên mặt sân cỏ nhân tạo.
• Lót giày (Insole): Đệm EVA đúc định hình trợ lực êm ái, giảm chấn động lên gót chân và bảo vệ khớp cổ chân trong các pha bứt tốc, đổi hướng đột ngột.
• Cổ giày ôm khít cổ chân chống lật sơ mi, lưỡi gà co giãn thoáng khí không gây cấn mu bàn chân.

📐 BẢNG HƯỚNG DẪN CHỌN SIZE GIÀY (SIZE CHUẨN VIỆT NAM):
• Size 39: Chiều dài bàn chân 24.5 cm
• Size 40: Chiều dài bàn chân 25.0 cm
• Size 41: Chiều dài bàn chân 25.5 - 26.0 cm
• Size 42: Chiều dài bàn chân 26.5 cm
• Size 43: Chiều dài bàn chân 27.0 - 27.5 cm
(Lưu ý: Nếu bàn chân bè ngang nhiều, quý khách nên tăng thêm 1 size để có trải nghiệm êm ái nhất).

🛡️ CHÍNH SÁCH BẢO HÀNH:
• Hỗ trợ đổi size trong vòng 7 ngày nếu không vừa chân.
• Bảo hành keo dán đế 3 tháng miễn phí.`;
      }
      // 3. BALO / TÚI THỂ THAO
      else if (nameLower.includes('balo') || nameLower.includes('túi') || nameLower.includes('backpack')) {
        options = [{ name: 'Màu sắc', values: ['Đen Titan', 'Xanh Navy', 'Đỏ Sport'] }];
        variants = options[0].values.map((color, idx) => ({
          sku: `${prod.slug.toUpperCase().slice(0, 15)}-${idx === 0 ? 'BLK' : idx === 1 ? 'NVY' : 'RED'}`,
          title: `Màu ${color}`,
          name: `Màu ${color}`,
          color: color,
          attributes: { 'Màu sắc': color },
          price: originalPrice,
          salePrice: salePrice,
          stock: 45 + idx * 5,
        }));

        description = `🎒 THIẾT KẾ THỂ THAO ĐA NĂNG:
• Chất liệu vải Polyester Oxford 900D cao cấp phủ lớp PU chống thấm nước, chống xước, chống bám bụi bẩn vượt trội.
• Ngăn chứa thông minh chuyên dụng:
  - 01 Ngăn đáy riêng biệt đựng giày / bóng đá có lỗ thông hơi khử mùi ẩm mốc.
  - 01 Ngăn chính siêu rộng rãi đựng vừa 4-5 bộ quần áo tập và đồ dùng cá nhân.
  - 01 Ngăn đệm chống sốc vừa laptop 15.6 inch.
  - 02 Ngăn phụ bên hông co giãn đựng bình nước và phụ kiện.
• Quai đeo bản to đệm mút tổ ong 3D êm ái, giảm áp lực lên vai khi mang vác nặng, khóa kéo kim loại chống kẹt mượt mà.
• Kích thước: 48cm x 32cm x 20cm (Dung tích ~30 Lít, chịu tải trọng lên đến 15kg).

🎨 PHIÊN BẢN MÀU SẮC:
• Đen Titan: Phong cách mạnh mẽ, nam tính, chống bám bẩn.
• Xanh Navy: Trẻ trung, thanh lịch, nổi bật.
• Đỏ Sport: Cá tính, năng động thể thao.

🛡️ CAM KẾT:
• Hàng chuẩn đúng như hình ảnh và mô tả 100%.
• Đổi mới 1:1 trong 7 ngày nếu có lỗi đường may hay khóa kéo từ xưởng sản xuất.`;
      }
      // 4. SALONPAS / Y TẾ
      else if (nameLower.includes('salonpas') || nameLower.includes('dầu') || nameLower.includes('gel') || nameLower.includes('cao dán')) {
        options = [{ name: 'Quy cách', values: ['Hộp 1 sản phẩm (Chuẩn)', 'Combo 2 sản phẩm (Tiết kiệm)'] }];
        variants = [
          {
            sku: `${prod.slug.toUpperCase().slice(0, 15)}-SINGLE`,
            title: 'Hộp 1 sản phẩm (Chuẩn)',
            name: 'Hộp 1 sản phẩm (Chuẩn)',
            attributes: { 'Quy cách': 'Hộp 1 sản phẩm (Chuẩn)' },
            price: originalPrice,
            salePrice: salePrice,
            stock: 60,
          },
          {
            sku: `${prod.slug.toUpperCase().slice(0, 15)}-COMBO2`,
            title: 'Combo 2 sản phẩm (Tiết kiệm)',
            name: 'Combo 2 sản phẩm (Tiết kiệm)',
            attributes: { 'Quy cách': 'Combo 2 sản phẩm (Tiết kiệm)' },
            price: originalPrice * 2 - 10000,
            salePrice: salePrice * 2 - 15000,
            stock: 40,
          },
        ];

        description = `🏥 GIẢI PHÁP GIẢM ĐAU CHUYÊN BIỆT CHO VẬN ĐỘNG VIÊN:
• Tác dụng: Giảm đau nhanh chóng các cơn đau cơ bắp, đau khớp, đau mỏi vai gáy, bầm tím, bong gân sau khi tập luyện và thi đấu thể thao cường độ cao.
• Thành phần hoạt chất: Methyl Salicylate, l-Menthol, Vitamin E thẩm thấu sâu qua biểu bì da, mang lại cảm giác the mát sảng khoái và ấm nóng dễ chịu kéo dài.
• Không gây bết dính nhờn rít, hương thơm bạc hà tự nhiên sảng khoái, không để lại vết ố trên quần áo thể thao.

📋 HƯỚNG DẪN SỬ DỤNG:
• Vệ sinh sạch và lau khô vùng da bị đau nhức.
• Thoa đều một lượng vừa đủ lên vùng cơ bị đau và massage nhẹ nhàng 2-3 lần/ngày.
• Không dùng cho vết thương hở, vùng da trầy xước hoặc niêm mạc mắt.

🛡️ NGUỒN GỐC & BẢO QUẢN:
• Hàng chính hãng 100% Hisamitsu, date mới nhất, tem mác đầy đủ.
• Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và xa tầm tay trẻ em.`;
      }
      // 5. ÁO BULBAL RETRO / ÁO POLO (Màu & Size)
      else if (nameLower.includes('bulbal') || nameLower.includes('polo')) {
        options = [
          { name: 'Màu sắc', values: ['Đen Titan', 'Trắng Basic', 'Xanh Navy'] },
          { name: 'Kích cỡ', values: ['M (55-65kg)', 'L (65-75kg)', 'XL (75-85kg)'] },
        ];
        variants = [];
        options[0].values.forEach((c) => {
          options[1].values.forEach((s) => {
            const shortSize = s.split(' ')[0];
            variants.push({
              sku: `${prod.slug.toUpperCase().slice(0, 10)}-${c.slice(0, 2).toUpperCase()}-${shortSize}`,
              title: `${c} / ${s}`,
              name: `${c} / ${s}`,
              color: c,
              size: shortSize,
              attributes: { 'Màu sắc': c, 'Kích cỡ': s },
              price: originalPrice,
              salePrice: salePrice,
              stock: 30,
            });
          });
        });

        description = `💎 CHẤT LƯỢNG CAO CẤP:
• Chất liệu vải cá sấu Cotton 4 chiều dày dặn, mềm mịn, không bai nhão, không xù lông và thấm hút mồ hôi cực tốt.
• Form Regular Fit hiện đại, ôm nhẹ vừa vặn tôn dáng, tạo vẻ ngoài lịch lãm và năng động.
• Cổ áo dệt bo viền tinh tế, cúc áo dập logo cao cấp, đường may tỉ mỉ 4 kim sắc sảo không chỉ thừa.
• Dễ dàng phối cùng quần jean, quần âu, quần short phù hợp đi làm, đi chơi, dạo phố hoặc chơi thể thao nhẹ.

📐 BẢNG CHỌN SIZE CHUẨN:
• Size M: 55 - 65kg (Chiều cao 1m60 - 1m70)
• Size L: 65 - 75kg (Chiều cao 1m68 - 1m76)
• Size XL: 75 - 85kg (Chiều cao 1m75 - 1m83)

🧺 HƯỚNG DẪN GIẶT VÀ BẢO QUẢN:
• Giặt tay hoặc giặt máy ở chế độ nhẹ.
• Lộn trái áo khi giặt và phơi để giữ màu sắc luôn tươi mới.
• Ủi ở nhiệt độ trung bình.`;
      }
      // 6. ĐẦM NỮ / VÁY NỮ
      else if (nameLower.includes('đầm') || nameLower.includes('dam') || nameLower.includes('váy')) {
        options = [
          { name: 'Màu sắc', values: ['Trắng Kem', 'Đỏ Đô', 'Đen Quyến Rũ'] },
          { name: 'Kích cỡ', values: ['S (40-48kg)', 'M (48-55kg)', 'L (55-62kg)'] },
        ];
        variants = [];
        options[0].values.forEach((c) => {
          options[1].values.forEach((s) => {
            const shortSize = s.split(' ')[0];
            variants.push({
              sku: `${prod.slug.toUpperCase().slice(0, 10)}-${c.slice(0, 2).toUpperCase()}-${shortSize}`,
              title: `${c} / ${s}`,
              name: `${c} / ${s}`,
              color: c,
              size: shortSize,
              attributes: { 'Màu sắc': c, 'Kích cỡ': s },
              price: originalPrice,
              salePrice: salePrice,
              stock: 25,
            });
          });
        });

        description = `👗 PHONG CÁCH THỜI TRANG DỰ TIỆC THANH LỊCH:
• Chất liệu: Voan tơ cao cấp 2 lớp mềm mại, nhẹ nhàng bay bổng, có lớp lót lụa habutai kín đáo bên trong mát mịn thấm hút mồ hôi.
• Thiết kế: Phom dáng xòe nhẹ chiết eo khéo léo giúp thon gọn vòng 2, tôn vinh đường cong nữ tính và che khuyết điểm hông đùi hiệu quả.
• Đường may kỹ lưỡng tinh xảo, khóa kéo giọt lệ chìm sau lưng mượt mà dễ thao tác.
• Phù hợp diện trong các dịp dự tiệc cưới, sự kiện, sinh nhật, hẹn hò hoặc dạo phố sang trọng.

📐 BẢNG THÔNG SỐ CHỌN SIZE:
• Size S: 40 - 48kg (Vòng ngực 82-86cm, Vòng eo 64-68cm)
• Size M: 48 - 55kg (Vòng ngực 86-90cm, Vòng eo 68-72cm)
• Size L: 55 - 62kg (Vòng ngực 90-94cm, Vòng eo 72-76cm)

🛡️ CAM KẾT TỪ SHOP:
• Sản phẩm đúng như hình ảnh chụp thực tế 100%.
• Hỗ trợ đổi size linh hoạt trong 7 ngày nếu không vừa.`;
      }
      // 7. QUẦN JEAN / QUẦN THỂ THAO
      else if (nameLower.includes('quần') || nameLower.includes('quan')) {
        options = [{ name: 'Kích cỡ', values: ['29 (50-57kg)', '30 (58-64kg)', '31 (65-70kg)', '32 (71-77kg)', '33 (78-85kg)'] }];
        variants = options[0].values.map((sz) => {
          const shortSize = sz.split(' ')[0];
          return {
            sku: `${prod.slug.toUpperCase().slice(0, 15)}-${shortSize}`,
            title: `Size ${sz}`,
            name: `Size ${sz}`,
            size: shortSize,
            attributes: { 'Kích cỡ': sz },
            price: originalPrice,
            salePrice: salePrice,
            stock: 40,
          };
        });

        description = `👖 ĐẶC TÍNH NỔI BẬT:
• Chất liệu Denim cao cấp dệt sợi Spandex co giãn nhẹ, vải dày dặn nhưng mềm mại, cử động đứng ngồi thoải mái cả ngày không gò bó.
• Form dáng Slimfit ống đứng hiện đại giúp kéo dài đôi chân và tạo phong cách trẻ trung, năng động.
• Công nghệ wash màu hiện đại giữ màu bền đẹp, hạn chế phai màu tối đa sau nhiều lần giặt.
• Khóa kéo đồng chống gỉ chắc chắn, đường may chần chỉ đôi gia cố các vị trí chịu lực.

📐 BẢNG CHỌN SIZE QUẦN:
• Size 29: 50 - 57kg (Vòng bụng ~74cm)
• Size 30: 58 - 64kg (Vòng bụng ~77cm)
• Size 31: 65 - 70kg (Vòng bụng ~80cm)
• Size 32: 71 - 77kg (Vòng bụng ~83cm)
• Size 33: 78 - 85kg (Vòng bụng ~86cm)`;
      }
      // 8. TAI NGHE / ĐIỆN TỬ
      else if (nameLower.includes('tai nghe') || nameLower.includes('bluetooth') || nameLower.includes('loa')) {
        options = [{ name: 'Màu sắc', values: ['Đen Nhám (Matte Black)', 'Trắng Tinh Khôi (Pure White)'] }];
        variants = options[0].values.map((c, idx) => ({
          sku: `${prod.slug.toUpperCase().slice(0, 15)}-${idx === 0 ? 'BLK' : 'WHT'}`,
          title: c,
          name: c,
          color: c,
          attributes: { 'Màu sắc': c },
          price: originalPrice,
          salePrice: salePrice,
          stock: 50,
        }));

        description = `🎧 ÂM THANH TRẦM ẤM - CÔNG NGHỆ HIỆN ĐẠI:
• Chip Bluetooth 5.3 thế hệ mới: Kết nối siêu tốc, độ trễ cực thấp dưới 45ms tối ưu cho cả nghe nhạc, xem phim và chơi game.
• Màng loa Dynamic 13mm: Tái hiện âm bass sâu lắng uy lực, âm treble trong trẻo rõ ràng và chi tiết.
• Công nghệ khử tiếng ồn chủ động ANC & lọc tạp âm đàm thoại ENC: Cho chất lượng cuộc gọi trong trẻo ngay cả khi di chuyển ngoài đường phố.
• Thời lượng pin vượt trội: Lên đến 7-8 giờ nghe liên tục cho mỗi lần sạc, kết hợp hộp sạc cung cấp tổng thời gian sử dụng lên đến 28 giờ.
• Chuẩn chống nước IPX5: An tâm sử dụng khi tập gym, chạy bộ và vận động thể thao ra nhiều mồ hôi.

📦 BỘ SẢN PHẨM BAO GỒM:
• 02 Tai nghe (Trái + Phải).
• 01 Dock sạc kiêm hộp bảo vệ.
• 01 Dây cáp sạc Type-C sạc nhanh.
• 01 Sách hướng dẫn sử dụng.

🛡️ BẢO HÀNH CHÍNH HÃNG:
• Bảo hành 6 tháng lỗi 1 đổi 1 nhanh chóng.`;
      }
      // 9. CÒN LẠI: ÁO ĐÁ BÓNG / SET CLB / ĐỘI TUYỂN / ÁO RETRO (Size S, M, L, XL, XXL)
      else {
        options = [{ name: 'Kích cỡ', values: ['S (45-55kg)', 'M (55-65kg)', 'L (65-75kg)', 'XL (75-85kg)', 'XXL (85-95kg)'] }];
        variants = options[0].values.map((sz) => {
          const shortSize = sz.split(' ')[0];
          return {
            sku: `${prod.slug.toUpperCase().slice(0, 15)}-${shortSize}`,
            title: `Size ${sz}`,
            name: `Size ${sz}`,
            size: shortSize,
            attributes: { 'Kích cỡ': sz },
            price: originalPrice,
            salePrice: salePrice,
            stock: 45,
          };
        });

        description = `⚽ BỘ ÁO ĐÁ BÓNG THI ĐẤU CAO CẤP:
• Chất liệu vải thun lạnh Polyester mè kim thể thao chuyên dụng siêu nhẹ, thoáng mát, co giãn 4 chiều và thoát mồ hôi tức thì (công nghệ Dry-Fit).
• Logo câu lạc bộ / đội tuyển được thêu vi tính 3D sắc nét, tỉ mỉ, bền chặt theo thời gian không lo bung chỉ.
• Họa tiết áo in chuyển nhiệt công nghệ cao sắc sảo, màu sắc tươi sáng chuẩn nguyên bản, giặt máy thoải mái không phai màu, không bong tróc.
• Form áo thể thao tôn dáng, đường may 4 kim chắc chắn bền bỉ chịu lực va chạm tốt trong từng pha tranh chấp trên sân cỏ.

📐 BẢNG CHỌN SIZE ÁO ĐÁ BÓNG CHUẨN:
• Size S: 45 - 55kg (Chiều cao 1m50 - 1m62)
• Size M: 55 - 65kg (Chiều cao 1m60 - 1m70)
• Size L: 65 - 75kg (Chiều cao 1m68 - 1m78)
• Size XL: 75 - 85kg (Chiều cao 1m75 - 1m85)
• Size XXL: 85 - 95kg (Chiều cao 1m80 - 1m92)
(Lưu ý: Nếu muốn mặc rộng rãi thoải mái khi thi đấu, quý khách có thể chọn tăng thêm 1 size).

🧺 HƯỚNG DẪN BẢO QUẢN:
• Giặt với nước lạnh hoặc nhiệt độ thường để giữ độ co giãn tối ưu của sợi vải.
• Không ngâm trong nước tẩy rửa mạnh, không là/ủi trực tiếp lên các chi tiết in ấn nhiệt.
• Phơi ở nơi thoáng mát, tránh ánh nắng gắt trực tiếp.

🛡️ CHÍNH SÁCH BÁN HÀNG TẬN TÂM:
• Hỗ trợ đổi size linh hoạt trong 7 ngày nếu không vừa.
• Được kiểm tra hàng trước khi nhận và thanh toán.`;
      }

      // Save
      prod.price = originalPrice;
      prod.salePrice = salePrice;
      prod.options = options;
      prod.variants = variants;
      prod.description = description;
      await prod.save();
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Đã chuẩn hóa thành công toàn bộ ${updatedCount} sản phẩm (100% có mô tả chi tiết chuyên nghiệp, biến thể chuẩn & giá sale ưu đãi)!`,
      data: { updatedCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi chuẩn hóa sản phẩm' },
      { status: 500 }
    );
  }
}
