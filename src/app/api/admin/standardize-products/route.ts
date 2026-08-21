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

      // 1. QUẢ BÓNG ĐÁ (Xử lý trước để không bị dính từ khóa cờ/đội tuyển)
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
      }

      // Save
      prod.price = originalPrice;
      prod.salePrice = salePrice;
      prod.options = options;
      prod.variants = variants;
      await prod.save();
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Đã chuẩn hóa thành công toàn bộ ${updatedCount} sản phẩm (100% có biến thể chuẩn & giá sale ưu đãi)!`,
      data: { updatedCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi chuẩn hóa sản phẩm' },
      { status: 500 }
    );
  }
}
