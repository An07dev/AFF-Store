import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if exists
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://bigmansale2_db_user:mjX8Z79pPTpiQLeq@cluster0.o9kuvob.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0';
const PORT = process.env.PORT_SOCKET || process.env.SOCKET_PORT || 3001;

// Define Mongoose Models inside Socket Server
const ChatMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: String, enum: ['user', 'admin', 'bot'], required: true },
    senderName: { type: String, default: 'Khách hàng' },
    customerName: { type: String, default: 'Khách hàng' },
    customerPhone: { type: String, default: '' },
    text: { type: String, default: '' },
    image: { type: String, default: '' },
    product: {
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      slug: { type: String },
    },
    suggestedProducts: [
      {
        name: { type: String },
        price: { type: Number },
        salePrice: { type: Number },
        image: { type: String },
        slug: { type: String },
      },
    ],
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, default: 'Khách hàng' },
    customerPhone: { type: String, default: '' },
    deviceInfo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['unread', 'active', 'has_phone', 'resolved'],
      default: 'unread',
    },
    tags: { type: [String], default: [] },
    adminNotes: { type: String, default: '' },
    unreadCountAdmin: { type: Number, default: 0 },
    unreadCountUser: { type: Number, default: 0 },
    lastMessage: {
      text: { type: String, default: '' },
      image: { type: String, default: '' },
      sender: { type: String, default: 'user' },
      createdAt: { type: Date, default: Date.now },
    },
    productContext: {
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      slug: { type: String },
    },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }],
    stock: { type: Number, default: 100 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    customer: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    paymentMethod: { type: String },
    paymentStatus: { type: String, default: 'unpaid' },
    shippingCarrier: { type: String },
    shippingProvider: { type: String },
    trackingCode: { type: String },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// =========================================================================
// AI CHATBOT ENGINE
// =========================================================================

async function getChatBotConfig() {
  try {
    const setting = await Setting.findOne({ key: 'chatbot_config' }).lean();
    if (setting && setting.value) {
      return {
        enabled: setting.value.enabled !== false,
        botName: setting.value.botName || 'AI Trợ Lý ShopTik',
        welcomeMessage:
          setting.value.welcomeMessage ||
          'Dạ chào bạn! Em là Trợ lý AI của shop. Em có thể giúp bạn tư vấn chọn size chuẩn xác, tìm kiếm sản phẩm, tra cứu đơn hàng hoặc giải đáp chính sách cửa hàng 24/7 ạ!',
        geminiApiKey: setting.value.geminiApiKey || process.env.GEMINI_API_KEY || '',
      };
    }
  } catch (err) {
    console.error('Error fetching chatbot config:', err);
  }

  return {
    enabled: true,
    botName: 'AI Trợ Lý ShopTik',
    welcomeMessage:
      'Dạ chào bạn! Em là Trợ lý AI của shop. Em có thể giúp bạn tư vấn chọn size chuẩn xác, tìm kiếm sản phẩm, tra cứu đơn hàng hoặc giải đáp chính sách cửa hàng 24/7 ạ!',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  };
}

function parseBodyMeasurements(text) {
  const t = text.toLowerCase();
  let height;
  let weight;
  let footLength;

  const heightPatterns = [
    /(?:cao\s*)?1[m,.](\d{1,2})\b/i,
    /(?:cao\s*)?m(\d{2})\b/i,
    /(?:cao\s*)?(\d{3})\s*(?:cm)?\b/i,
  ];

  for (const p of heightPatterns) {
    const match = t.match(p);
    if (match) {
      let num = match[1];
      if (num.length === 1) num = num + '0';
      if (num.length === 2) {
        height = 100 + parseInt(num, 10);
      } else if (num.length === 3) {
        const val = parseInt(num, 10);
        if (val >= 140 && val <= 210) height = val;
      }
      if (height) break;
    }
  }

  const weightPatterns = [
    /(\d{2,3})\s*(?:kg|kí|ký|cân)\b/i,
    /(?:nặng\s*)(\d{2,3})\b/i,
  ];

  for (const p of weightPatterns) {
    const match = t.match(p);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val >= 35 && val <= 150) {
        weight = val;
        break;
      }
    }
  }

  const footPatterns = [
    /(?:chân|bàn chân)\s*(?:dài\s*)?(\d{2}(?:[.,]\d)?)\s*(?:cm)?/i,
    /(\d{2}(?:[.,]\d)?)\s*cm/i,
  ];
  for (const p of footPatterns) {
    const match = t.match(p);
    if (match) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (val >= 22 && val <= 30) {
        footLength = val;
        break;
      }
    }
  }

  return { height, weight, footLength };
}

function calculateRecommendedSize(height, weight, footLength, productType = 'shirt') {
  if (footLength || productType === 'shoes') {
    const fl = footLength || 25;
    let shoeSize = '40';
    if (fl <= 24.5) shoeSize = '39';
    else if (fl <= 25.2) shoeSize = '40';
    else if (fl <= 26.0) shoeSize = '41';
    else if (fl <= 26.7) shoeSize = '42';
    else shoeSize = '43';

    return {
      size: `Size ${shoeSize}`,
      explanation: `Dựa vào chiều dài bàn chân ~${fl}cm, bạn mang vừa đẹp nhất là **Size ${shoeSize}** nhé. Nếu chân bạn bè ngang nhiều, có thể tăng thêm 1 size để êm chân hơn khi vận động ạ!`,
    };
  }

  if (productType === 'dress') {
    const w = weight || 50;
    let dressSize = 'M (48-55kg)';
    if (w < 48) dressSize = 'S (40-48kg)';
    else if (w <= 55) dressSize = 'M (48-55kg)';
    else dressSize = 'L (55-62kg)';

    return {
      size: dressSize,
      explanation: `Với cân nặng ${w}kg, bạn mặc xinh và tôn dáng nhất là **${dressSize}** nhé!`,
    };
  }

  if (productType === 'pants') {
    const w = weight || 62;
    let pantSize = '30 (58-64kg)';
    if (w <= 57) pantSize = '29 (50-57kg)';
    else if (w <= 64) pantSize = '30 (58-64kg)';
    else if (w <= 70) pantSize = '31 (65-70kg)';
    else if (w <= 77) pantSize = '32 (71-77kg)';
    else pantSize = '33 (78-85kg)';

    return {
      size: pantSize,
      explanation: `Với cân nặng ${w}kg, bạn mặc vừa vặn nhất là **${pantSize}** nhé!`,
    };
  }

  const w = weight || 65;
  const h = height || 170;

  let shirtSize = 'L (65-75kg)';
  let note = '';

  if (w < 55) {
    shirtSize = 'S (45-55kg)';
    note = 'vừa vặn, tôn dáng';
  } else if (w < 65) {
    shirtSize = h > 173 ? 'L (65-75kg)' : 'M (55-65kg)';
    note = h > 173 ? 'chiều dài áo thoải mái theo chiều cao' : 'vừa vặn đẹp chuẩn';
  } else if (w <= 75) {
    shirtSize = 'L (65-75kg)';
    note = 'ôm vừa người rất thoải mái';
  } else if (w <= 85) {
    shirtSize = 'XL (75-85kg)';
    note = 'rộng rãi dễ chịu khi vận động';
  } else {
    shirtSize = 'XXL (85-95kg)';
    note = 'form to thoải mái';
  }

  return {
    size: shirtSize,
    explanation: `Dựa trên số đo chiều cao ${h}cm và cân nặng ${w}kg, bạn mặc đẹp và phù hợp nhất là **${shirtSize}** (${note}) ạ. Nếu bạn thích mặc rộng thoải mái khi thi đấu/vận động có thể nhích lên 1 size nhé!`,
  };
}

async function searchStoreProducts(query) {
  try {
    const clean = query
      .toLowerCase()
      .replace(/(?:shop\s+)?(?:có\s+)?(?:tìm\s+)?(?:mẫu\s+)?(?:sản\s+phẩm\s+)?(?:không\s+ạ\??|không\??|ko\??|ạ\??)/gi, '')
      .trim();

    if (!clean || clean.length < 2) return [];

    const stopWords = ['này', 'cho', 'mình', 'với', 'giúp', 'của', 'ở', 'được', 'gì', 'các', 'những'];
    const keywords = clean.split(/\s+/).filter((k) => k.length > 1 && !stopWords.includes(k));

    const allProducts = await Product.find({ status: 'active' })
      .select('name slug price salePrice images isFeatured stock')
      .lean();

    const scored = allProducts.map((p) => {
      const pName = (p.name || '').toLowerCase();
      let score = 0;

      keywords.forEach((kw) => {
        if (pName.includes(kw)) {
          score += 5;
        }
      });

      if (clean.includes('giày') && pName.includes('giày')) score += 10;
      if (clean.includes('áo') && (pName.includes('áo') || pName.includes('set'))) score += 8;
      if (clean.includes('balo') && pName.includes('balo')) score += 10;
      if (clean.includes('đầm') && pName.includes('đầm')) score += 10;
      if (clean.includes('salonpas') && pName.includes('salonpas')) score += 10;
      if (clean.includes('quần') && pName.includes('quần')) score += 10;
      if (clean.includes('bóng') && !clean.includes('giày') && !clean.includes('áo') && pName.includes('bóng')) score += 10;

      return { product: p, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.product);
  } catch (err) {
    console.error('Error searching store products:', err);
    return [];
  }
}

async function getCatalogDigestForAI(userQuery) {
  try {
    const matched = await searchStoreProducts(userQuery);
    const featured = await Product.find({ status: 'active' })
      .select('name slug price salePrice stock')
      .limit(6)
      .lean();

    const combined = [...matched];
    for (const f of featured) {
      if (!combined.some((c) => c.slug === f.slug)) {
        combined.push(f);
      }
    }

    if (combined.length === 0) return '';

    let digest = 'DANH SÁCH SẢN PHẨM THỰC TẾ TRONG KHO (DÙNG ĐỂ TƯ VẤN, BÁO GIÁ VÀ GỬI LINK):\n';
    combined.slice(0, 6).forEach((p, idx) => {
      const priceStr = (p.salePrice || p.price || 0).toLocaleString('vi-VN') + '₫';
      const origStr = p.salePrice && p.price > p.salePrice ? ` (Giá gốc: ${p.price.toLocaleString('vi-VN')}₫)` : '';
      digest += `${idx + 1}. **${p.name}** | Giá sale: ${priceStr}${origStr} | Link: /product/${p.slug} | Tồn kho: ${p.stock || 'Sẵn hàng'}\n`;
    });

    return digest;
  } catch (err) {
    console.error('Error creating catalog digest:', err);
    return '';
  }
}

async function generateBotResponse(params) {
  const config = await getChatBotConfig();
  if (!config.enabled) {
    return { shouldReply: false };
  }

  const userText = (params.text || '').trim();
  const lowerText = userText.toLowerCase();
  const botName = config.botName;

  // CASE 1: ORDER TRACKING LOOKUP (#ST...)
  const orderCodeMatch = userText.match(/(?:#?)(ST\d{6})/i);
  if (orderCodeMatch || lowerText.includes('tra cứu') || lowerText.includes('đơn hàng') || lowerText.includes('mã đơn')) {
    if (orderCodeMatch) {
      const code = orderCodeMatch[1].toUpperCase();
      try {
        const order = await Order.findOne({ orderCode: code }).lean();
        if (order) {
          const statusMap = {
            pending: '⏳ Đang chờ xác nhận',
            confirmed: '✅ Đã xác nhận đơn hàng',
            shipping: '🚚 Đang bàn giao vận chuyển',
            delivering: '🛵 Shipper đang giao hàng',
            delivered: '🎉 Đã giao hàng thành công',
            cancelled: '❌ Đã hủy đơn',
            returned: '↩️ Đã chuyển hoàn',
          };

          const statusText = statusMap[order.status] || order.status;
          const carrier = order.shippingCarrier || order.shippingProvider?.toUpperCase() || 'ĐVVC đối tác';
          const trackingCode = order.trackingCode ? ` (Mã vận đơn: \`${order.trackingCode}\`)` : '';
          const totalFormatted = (order.totalAmount || 0).toLocaleString('vi-VN') + ' ₫';

          const reply = `Dạ em đã kiểm tra thông tin đơn hàng **#${code}** của bạn:\n\n` +
            `• **Khách nhận:** ${order.customer?.name || 'Quý khách'} (${order.customer?.phone || ''})\n` +
            `• **Trạng thái:** **${statusText}**\n` +
            `• **Tổng tiền:** ${totalFormatted} (${order.paymentMethod === 'bank_transfer' ? (order.paymentStatus === 'paid' ? 'Đã thanh toán qua VietQR ✓' : 'Chờ thanh toán') : 'Thanh toán COD khi nhận'})\n` +
            `• **Vận chuyển:** ${carrier}${trackingCode}\n\n` +
            `👉 Bạn có thể xem lộ trình giao hàng trực tiếp tại: [/tracking?code=${code}](/tracking?code=${code})\n\n` +
            `Nếu bạn cần hỗ trợ thêm gì về đơn hàng, cứ nhắn em nhé! 😊`;

          return {
            shouldReply: true,
            replyText: reply,
            senderName: botName,
          };
        } else {
          return {
            shouldReply: true,
            replyText: `Dạ em tra cứu nhưng chưa tìm thấy đơn hàng **#${code}** trên hệ thống. Bạn vui lòng kiểm tra lại mã đơn hàng (dạng #STxxxxxx) giúp em nhé ạ!`,
            senderName: botName,
          };
        }
      } catch (err) {
        console.error('Bot order lookup error:', err);
      }
    }
  }

  // CASE 2: GOOGLE GEMINI GENERATIVE AI (Khi có API Key)
  if (config.geminiApiKey) {
    try {
      const catalogDigest = await getCatalogDigestForAI(userText);
      const matchedProducts = await searchStoreProducts(userText);

      let historyContents = [];
      try {
        const recentPast = await ChatMessage.find({ conversationId: params.conversationId })
          .sort({ createdAt: -1 })
          .limit(6)
          .lean();

        recentPast.reverse().forEach((pm) => {
          if (pm.text && pm.text.trim() && pm.text !== userText) {
            historyContents.push({
              role: pm.sender === 'user' ? 'user' : 'model',
              parts: [{ text: pm.text.trim() }],
            });
          }
        });
      } catch (hErr) {
        console.warn('Could not load chat history:', hErr);
      }

      const prompt = `Bạn là Chuyên Viên Tư Vấn Bán Hàng & Chuyên Gia Thể Thao Xuất Sắc của cửa hàng "ShopTik Store".

${catalogDigest}

Thông tin ngữ cảnh:
- Tên khách hàng: ${params.customerName || 'Khách hàng'}
- Sản phẩm khách đang xem: ${params.productContext?.name || 'Không có'} (Giá: ${params.productContext?.price ? params.productContext.price.toLocaleString('vi-VN') + 'đ' : 'N/A'})
- Câu hỏi mới nhất của khách: "${userText}"

Quy tắc tư vấn bán hàng đỉnh cao (Elite Sales Consultant):
1. Xưng hô "em" và gọi khách là "bạn" hoặc "anh/chị", giọng điệu nhiệt tình, am hiểu chuyên môn sâu, truyền cảm hứng và thân thiện với emoji sống động.
2. TUYỆT ĐỐI KHÔNG LIỆT KÊ TRÀN LAN danh sách dài. Hãy chọn lọc đúng 1 ĐẾN 2 SẢN PHẨM PHÙ HỢP NHẤT từ danh mục trên, nêu rõ lý do tại sao mẫu này đáng mua.
3. Báo giá sale ưu đãi chính xác và CHÈN ĐƯỜNG LINK CLICKABLE dạng [Xem chi tiết & đặt mua](/product/slug) để khách bấm vào xem ngay!
4. Nhấn mạnh chính sách: Freeship toàn quốc từ 500k, Đổi size miễn phí trong 7 ngày, và Kiểm tra hàng trước khi thanh toán COD.
5. Luôn kết thúc bằng 1 câu hỏi gợi mở khéo léo để tiếp tục tương tác và giúp khách chốt đơn.
6. Trả lời súc tích, tự nhiên trong khoảng 2 - 3 đoạn ngắn gọn.`;

      historyContents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const supportedModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
      let generatedText = '';

      for (const model of supportedModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: historyContents,
                generationConfig: { maxOutputTokens: 650, temperature: 0.7 },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const text = geminiData.candidates?.[0]?.content?.parts
              ?.filter((p) => p.text && !p.thought)
              ?.map((p) => p.text)
              ?.join('\n');

            if (text?.trim()) {
              generatedText = text.trim();
              break;
            }
          }
        } catch (mErr) {
          // continue to next model
        }
      }

      if (generatedText) {
        const suggestedCards = matchedProducts.slice(0, 3).map((p) => ({
          name: p.name,
          price: p.price,
          salePrice: p.salePrice,
          image: p.images?.[0] || '',
          slug: p.slug,
        }));

        return {
          shouldReply: true,
          replyText: generatedText,
          senderName: botName,
          suggestedProducts: suggestedCards.length > 0 ? suggestedCards : undefined,
        };
      }
    } catch (geminiErr) {
      console.warn('Gemini API call failed, falling back to smart local NLP:', geminiErr?.message || geminiErr);
    }
  }

  // CASE 3: LOCAL SIZE ADVISOR (FALLBACK THÔNG MINH)
  const measurements = parseBodyMeasurements(userText);
  const isAskingSize =
    lowerText.includes('size') ||
    lowerText.includes('kích cỡ') ||
    lowerText.includes('mặc vừa') ||
    lowerText.includes('vừa không') ||
    (lowerText.includes('tư vấn') && (lowerText.includes('áo') || lowerText.includes('quần') || lowerText.includes('giày') || lowerText.includes('đầm'))) ||
    (measurements.height !== undefined && measurements.weight !== undefined);

  if (isAskingSize) {
    let prodType = 'shirt';
    const prodName = (params.productContext?.name || userText).toLowerCase();

    if (prodName.includes('giày') || prodName.includes('giay') || prodName.includes('boot') || measurements.footLength) {
      prodType = 'shoes';
    } else if (prodName.includes('quần') || prodName.includes('jean')) {
      prodType = 'pants';
    } else if (prodName.includes('đầm') || prodName.includes('dam') || prodName.includes('váy')) {
      prodType = 'dress';
    }

    if (measurements.height || measurements.weight || measurements.footLength) {
      const rec = calculateRecommendedSize(measurements.height, measurements.weight, measurements.footLength, prodType);
      const prodMention = params.productContext?.name ? ` đối với sản phẩm **"${params.productContext.name}"**` : '';

      const reply = `Dạ${prodMention}, ${rec.explanation}\n\n` +
        `💡 **Shop cam kết:** Hỗ trợ đổi size miễn phí trong vòng 7 ngày nếu bạn mặc chưa vừa ý nha! Bạn có muốn đặt mẫu này luôn không ạ?`;

      return {
        shouldReply: true,
        replyText: reply,
        senderName: botName,
      };
    }
  }

  // CASE 4: LOCAL PRODUCT SEARCH
  const isExplicitSearch =
    lowerText.startsWith('tìm') ||
    lowerText.startsWith('có mẫu') ||
    lowerText.includes('có bán') ||
    lowerText.includes('có áo') ||
    lowerText.includes('có giày') ||
    lowerText.includes('có bóng') ||
    lowerText.includes('có balo') ||
    lowerText.includes('mẫu áo') ||
    lowerText.includes('mẫu giày') ||
    lowerText.includes('mẫu bóng');

  if (isExplicitSearch) {
    const matchedProducts = await searchStoreProducts(userText);
    if (matchedProducts.length > 0) {
      let reply = `Dạ bên shop có mẫu này đang có sẵn hàng và cực kỳ hot, đúng nhu cầu của bạn ạ:\n\n`;
      matchedProducts.forEach((p) => {
        const pPrice = (p.salePrice || p.price || 0).toLocaleString('vi-VN') + ' ₫';
        const oldPrice = p.salePrice && p.price > p.salePrice ? ` ~${p.price.toLocaleString('vi-VN')} ₫~` : '';
        reply += `🌟 **${p.name}**\n💰 Giá ưu đãi: **${pPrice}**${oldPrice}\n👉 [Bấm vào đây để xem chi tiết & chọn size](/product/${p.slug})\n\n`;
      });
      reply += `Bạn cần em tư vấn thêm màu sắc, bảng size hay quà tặng kèm của mẫu nào cứ nhắn em nhé! 😊`;

      const suggestedCards = matchedProducts.slice(0, 3).map((p) => ({
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        image: p.images?.[0] || '',
        slug: p.slug,
      }));

      return {
        shouldReply: true,
        replyText: reply,
        senderName: botName,
        suggestedProducts: suggestedCards.length > 0 ? suggestedCards : undefined,
      };
    }
  }

  // CASE 5: BUYING & ORDERING INTENT
  if (lowerText.includes('mua ngay') || lowerText.includes('đặt hàng') || lowerText.includes('chốt đơn') || lowerText.includes('cách mua')) {
    return {
      shouldReply: true,
      replyText: `🚀 **Cách Đặt Hàng Nhanh Chóng Tại Shop:**\n\n` +
        `1. Bạn có thể bấm nút **"Mua Ngay"** trên trang sản phẩm để chọn size, điền địa chỉ nhận hàng và đặt đơn trong 30 giây.\n` +
        `2. Hoặc bạn có thể **nhắn tin SĐT + Địa chỉ** ngay tại đây, nhân viên CSKH của shop sẽ gọi điện xác nhận và gửi hàng nhanh cho bạn nhé!\n\n` +
        `🎁 Đơn hàng từ 500k được **Freeship toàn quốc** và kiểm tra hàng trước khi thanh toán ạ!`,
      senderName: botName,
    };
  }

  // CASE 6: DISCOUNTS & PROMOTIONS
  if (lowerText.includes('khuyến mãi') || lowerText.includes('voucher') || lowerText.includes('giảm giá') || lowerText.includes('ưu đãi') || lowerText.includes('mã giảm')) {
    return {
      shouldReply: true,
      replyText: `🎁 **Chương Trình Khuyến Mãi & Ưu Đãi Hôm Nay:**\n\n` +
        `• 🔥 **Giảm trực tiếp 15% - 35%** trên toàn bộ sản phẩm (đã áp dụng giá sale trên web).\n` +
        `• 🚚 **Freeship toàn quốc** cho đơn hàng từ 500.000₫.\n` +
        `• ⚽ **Quà tặng kèm:** Tặng quà khi mua trọn bộ thể thao.\n` +
        `• 🛡️ **Bảo hành 1 đổi 1** và đổi size miễn phí trong 7 ngày!\n\n` +
        `Bạn đang quan tâm mẫu nào để em báo giá tốt nhất cho bạn nhé ạ?`,
      senderName: botName,
    };
  }

  // CASE 7: STORE POLICIES
  if (lowerText.includes('freeship') || lowerText.includes('phí ship') || lowerText.includes('vận chuyển') || lowerText.includes('giao hàng')) {
    return {
      shouldReply: true,
      replyText: `🚚 **Chính Sách Vận Chuyển & Giao Hàng của Shop:**\n\n` +
        `• **Miễn phí giao hàng (Freeship):** Áp dụng toàn quốc cho đơn hàng từ 500.000₫.\n` +
        `• **Thời gian giao hàng:**\n` +
        `  - Nội thành: 1 - 2 ngày làm việc.\n` +
        `  - Các tỉnh thành khác: 2 - 4 ngày qua đối tác GHN / GHTK / Viettel Post.\n` +
        `• **Kiểm tra hàng:** Bạn được mở kiểm tra hàng trước khi thanh toán COD nha!`,
      senderName: botName,
    };
  }

  if (lowerText.includes('đổi trả') || lowerText.includes('bảo hành') || lowerText.includes('đổi size')) {
    return {
      shouldReply: true,
      replyText: `🛡️ **Chính Sách Đổi Trả & Bảo Hành:**\n\n` +
        `• Hỗ trợ **đổi size / đổi mẫu trong 7 ngày** kể từ ngày nhận hàng nếu không vừa hoặc chưa ưng ý.\n` +
        `• Đổi mới 1:1 miễn phí 100% nếu sản phẩm có lỗi từ xưởng sản xuất.\n` +
        `• Sản phẩm đổi trả cần giữ nguyên tem mác và chưa qua giặt tẩy bạn nhé!`,
      senderName: botName,
    };
  }

  if (lowerText.includes('thanh toán') || lowerText.includes('chuyển khoản') || lowerText.includes('vietqr') || lowerText.includes('cod')) {
    return {
      shouldReply: true,
      replyText: `💳 **Hình Thức Thanh Toán Tại Shop:**\n\n` +
        `1. **Thanh toán khi nhận hàng (COD):** Nhận hàng kiểm tra xong mới gửi tiền cho Shipper.\n` +
        `2. **Quét mã VietQR SePay:** Chuyển khoản tự động qua mã QR động, hệ thống xác nhận thanh toán thành công trong 1 giây mà không cần gửi bill!`,
      senderName: botName,
    };
  }

  if (lowerText.includes('xin chào') || lowerText.includes('chào shop') || lowerText.includes('hello') || lowerText.includes('hi shop') || lowerText === 'hi' || lowerText === 'alo') {
    const prodGreeting = params.productContext?.name
      ? ` Bạn đang quan tâm mẫu **"${params.productContext.name}"** đúng không ạ?`
      : '';
    return {
      shouldReply: true,
      replyText: `Dạ chào bạn! Rất vui được hỗ trợ bạn hôm nay ạ.${prodGreeting} Bạn cần em tư vấn chọn size, tìm sản phẩm hay kiểm tra đơn hàng cứ nhắn cho em nhé! 🌟`,
      senderName: botName,
    };
  }

  // DEFAULT SMART BOT FALLBACK
  return {
    shouldReply: true,
    replyText: `Dạ em đã ghi nhận tin nhắn của bạn! Em là AI Trợ Lý của shop. Bạn có thể cho em biết thêm thông tin (chiều cao, cân nặng để tư vấn size, tên mẫu bạn cần tìm hoặc mã đơn #ST... để kiểm tra đơn) để em hỗ trợ bạn nhanh nhất nhé ạ! 😊`,
    senderName: botName,
  };
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ [Socket Server] MongoDB connected successfully');
  } catch (err) {
    console.error('❌ [Socket Server] MongoDB connection error:', err);
  }
}

connectDB();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date() }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ShopTik Real-time Live Chat Socket.IO Server is running.');
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // 1. Join Room
  socket.on('join_room', async (data) => {
    try {
      const { conversationId, role, customerInfo } = data || {};
      socket.data = { conversationId, role, customerInfo };

      if (role === 'admin') {
        socket.join('admin_hub');
        console.log(`👨‍💼 Admin joined admin_hub (${socket.id})`);
        if (conversationId) {
          socket.join(`conv_${conversationId}`);
          console.log(`👨‍💼 Admin focused on conv_${conversationId}`);
        }
      } else {
        if (conversationId) {
          socket.join(`conv_${conversationId}`);
          console.log(`👤 Customer joined conv_${conversationId} (${socket.id})`);

          // Ensure conversation document exists
          if (customerInfo) {
            await Conversation.findOneAndUpdate(
              { conversationId },
              {
                $setOnInsert: {
                  conversationId,
                  customerName: customerInfo.name || 'Khách hàng',
                  customerPhone: customerInfo.phone || '',
                  status: customerInfo.phone ? 'has_phone' : 'unread',
                },
                $set: {
                  lastActive: new Date(),
                  ...(customerInfo.product ? { productContext: customerInfo.product } : {}),
                },
              },
              { upsert: true, new: true }
            );
          }
        }
      }
    } catch (err) {
      console.error('Error in join_room:', err);
    }
  });

  // 2. Send Message
  socket.on('send_message', async (data, callback) => {
    try {
      const {
        clientMsgId,
        conversationId,
        sender,
        senderName,
        customerName,
        customerPhone,
        text,
        image,
        product,
      } = data || {};

      if (!conversationId || !sender || (!text?.trim() && !image)) {
        if (typeof callback === 'function') callback({ success: false, error: 'Dữ liệu không hợp lệ' });
        return;
      }

      // Save Message to DB
      const newMsg = await ChatMessage.create({
        conversationId,
        sender,
        senderName: senderName || (sender === 'admin' ? 'Admin CSKH' : customerName || 'Khách hàng'),
        customerName: customerName || 'Khách hàng',
        customerPhone: customerPhone || '',
        text: text?.trim() || '',
        image: image || '',
        product: product || undefined,
        isRead: sender === 'admin',
      });

      const msgObj = newMsg.toObject();
      if (clientMsgId) {
        msgObj.clientMsgId = clientMsgId;
      }

      // Update / Upsert Conversation metadata
      const isUser = sender === 'user';
      const convUpdate = {
        lastMessage: {
          text: newMsg.text || (newMsg.image ? '[Hình ảnh]' : ''),
          image: newMsg.image || '',
          sender: newMsg.sender,
          createdAt: newMsg.createdAt,
        },
        lastActive: new Date(),
      };

      if (customerName) convUpdate.customerName = customerName;
      if (customerPhone) {
        convUpdate.customerPhone = customerPhone;
        convUpdate.status = 'has_phone';
      }
      if (product) convUpdate.productContext = product;

      const incField = isUser ? { unreadCountAdmin: 1 } : { unreadCountUser: 1 };

      const updatedConv = await Conversation.findOneAndUpdate(
        { conversationId },
        {
          $set: convUpdate,
          $inc: incField,
        },
        { upsert: true, new: true }
      );

      // Broadcast message to room conv_{conversationId}
      io.to(`conv_${conversationId}`).emit('receive_message', msgObj);

      // Đồng thời phát tin nhắn tới admin_hub để tất cả Admin trực tuyến nhận ngay lập tức
      io.to('admin_hub').emit('receive_message', msgObj);

      // If sent by user, send alert to Admin Hub and trigger AI Bot Auto-reply
      if (isUser) {
        io.to('admin_hub').emit('new_message_notification', {
          conversationId,
          customerName: newMsg.customerName,
          customerPhone: newMsg.customerPhone,
          text: newMsg.text,
          image: newMsg.image,
          createdAt: newMsg.createdAt,
          conversation: updatedConv,
        });

        // Trigger AI Bot Auto-reply if text is present
        if (newMsg.text && newMsg.text.trim()) {
          (async () => {
            try {
              const botConfig = await getChatBotConfig();
              if (botConfig.enabled) {
                // Emit typing indicator to customer and admin
                io.to(`conv_${conversationId}`).emit('user_typing', {
                  conversationId,
                  sender: 'bot',
                  isTyping: true,
                });
                io.to('admin_hub').emit('user_typing', {
                  conversationId,
                  sender: 'bot',
                  isTyping: true,
                });

                // Human-like response micro-delay (500ms)
                await new Promise((resolve) => setTimeout(resolve, 500));

                const botResult = await generateBotResponse({
                  text: newMsg.text,
                  conversationId,
                  customerName: newMsg.customerName,
                  productContext: product || updatedConv?.productContext,
                });

                // Stop typing indicator
                io.to(`conv_${conversationId}`).emit('user_typing', {
                  conversationId,
                  sender: 'bot',
                  isTyping: false,
                });
                io.to('admin_hub').emit('user_typing', {
                  conversationId,
                  sender: 'bot',
                  isTyping: false,
                });

                if (botResult && botResult.shouldReply && botResult.replyText) {
                  const botMsg = await ChatMessage.create({
                    conversationId,
                    sender: 'bot',
                    senderName: botResult.senderName || 'AI Trợ Lý ShopTik',
                    customerName: newMsg.customerName || 'Khách hàng',
                    customerPhone: newMsg.customerPhone || '',
                    text: botResult.replyText,
                    suggestedProducts: botResult.suggestedProducts || [],
                    isRead: false,
                  });

                  const botMsgObj = botMsg.toObject();

                  // Update conversation lastMessage
                  await Conversation.findOneAndUpdate(
                    { conversationId },
                    {
                      $set: {
                        lastMessage: {
                          text: botMsg.text,
                          sender: 'bot',
                          createdAt: botMsg.createdAt,
                        },
                        lastActive: new Date(),
                      },
                    }
                  );

                  // Broadcast bot message to customer and admin
                  io.to(`conv_${conversationId}`).emit('receive_message', botMsgObj);
                  io.to('admin_hub').emit('receive_message', botMsgObj);
                  console.log(`🤖 [AI Bot] Replied to ${conversationId}: "${botResult.replyText.substring(0, 40)}..."`);
                }
              }
            } catch (botErr) {
              console.error('❌ Error executing AI Bot auto-reply:', botErr);
              io.to(`conv_${conversationId}`).emit('user_typing', {
                conversationId,
                sender: 'bot',
                isTyping: false,
              });
              io.to('admin_hub').emit('user_typing', {
                conversationId,
                sender: 'bot',
                isTyping: false,
              });
            }
          })();
        }
      }

      if (typeof callback === 'function') {
        callback({ success: true, data: msgObj });
      }
    } catch (err) {
      console.error('Error in send_message:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // 3. Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, sender, isTyping } = data || {};
    if (conversationId) {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        sender,
        isTyping: !!isTyping,
      });

      // Nếu là khách đang gõ, thông báo cho admin_hub
      if (sender === 'user') {
        socket.to('admin_hub').emit('user_typing', {
          conversationId,
          sender,
          isTyping: !!isTyping,
        });
      }
    }
  });

  // 4. Mark Read
  socket.on('mark_read', async (data) => {
    try {
      const { conversationId, readBy } = data || {};
      if (!conversationId) return;

      if (readBy === 'admin') {
        await ChatMessage.updateMany(
          { conversationId, sender: 'user', isRead: false },
          { $set: { isRead: true } }
        );
        await Conversation.findOneAndUpdate(
          { conversationId },
          { $set: { unreadCountAdmin: 0 } }
        );
      } else {
        await ChatMessage.updateMany(
          { conversationId, sender: 'admin', isRead: false },
          { $set: { isRead: true } }
        );
        await Conversation.findOneAndUpdate(
          { conversationId },
          { $set: { unreadCountUser: 0 } }
        );
      }

      io.to(`conv_${conversationId}`).emit('messages_read', { conversationId, readBy });
      io.to('admin_hub').emit('conversation_updated', { conversationId, readBy });
    } catch (err) {
      console.error('Error in mark_read:', err);
    }
  });

  // 5. Update Customer Info / Tags / Status
  socket.on('update_conversation', async (data, callback) => {
    try {
      const { conversationId, customerName, customerPhone, tags, status, adminNotes } = data || {};
      if (!conversationId) return;

      const updateData = {};
      if (customerName !== undefined) updateData.customerName = customerName;
      if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
      if (tags !== undefined) updateData.tags = tags;
      if (status !== undefined) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

      const updated = await Conversation.findOneAndUpdate(
        { conversationId },
        { $set: updateData },
        { new: true }
      );

      io.to('admin_hub').emit('conversation_updated', { conversationId, conversation: updated });
      io.to(`conv_${conversationId}`).emit('conversation_meta', updated);

      if (typeof callback === 'function') callback({ success: true, data: updated });
    } catch (err) {
      console.error('Error in update_conversation:', err);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // 6. Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 [Socket.IO Server] Listening on http://localhost:${PORT}`);
});
