'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiChevronLeft,
  FiSend,
  FiImage,
  FiPhoneCall,
  FiPhone,
  FiUser,
  FiCheckCircle,
  FiEdit3,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { initSocket, getSocket } from '@/lib/socket';
import StoreLoading from '@/components/store/StoreLoading';
import styles from './page.module.css';

interface Message {
  _id?: string;
  id?: string;
  sender: 'shop' | 'user' | 'admin' | 'bot';
  senderName?: string;
  text: string;
  image?: string;
  product?: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  createdAt?: string;
  time?: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const { theme } = useTheme();

  const shopName = theme?.pageTitles?.logoText || 'Football Store';
  const avatarInitials = shopName ? shopName.substring(0, 2).toUpperCase() : 'FS';

  const [conversationId, setConversationId] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string }>({
    name: 'Khách hàng',
    phone: '',
  });

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Inquiring product
  const [pinnedProduct, setPinnedProduct] = useState<any | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound chime helper
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // 1. Initialize Conversation ID & Customer Profile
  useEffect(() => {
    let convId = localStorage.getItem('shoptik_chat_conv_id');
    if (!convId) {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('shoptik_chat_conv_id', convId);
    }
    setConversationId(convId);

    let gName = localStorage.getItem('shoptik_guest_name') || 'Khách hàng';
    let gPhone = '';

    try {
      const savedProfile = localStorage.getItem('shoptik_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.name) gName = p.name;
        if (p.phone) gPhone = p.phone;
      }
    } catch (e) {
      console.error(e);
    }

    setCustomerInfo({ name: gName, phone: gPhone });
    setNameInput(gName);
    setPhoneInput(gPhone);
  }, []);

  // 2. Fetch product if arriving from detail page
  useEffect(() => {
    if (productSlug) {
      apiFetch(`/api/products/${productSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setPinnedProduct(data.data);
          }
        })
        .catch(console.error);
    }
  }, [productSlug]);

  // 3. Load initial Messages via REST
  const fetchMessages = async (cid: string) => {
    if (!cid) return;
    try {
      const res = await apiFetch(`/api/chat/messages?conversationId=${cid}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        if (data.data.length === 0) {
          setMessages([
            {
              id: 'greeting',
              sender: 'shop',
              senderName: 'Admin CSKH',
              text: `👋 Chào bạn! Cảm ơn bạn đã nhắn tin cho ${shopName}. Shop có thể hỗ trợ tư vấn size, mẫu mã hay đơn hàng nào cho bạn hôm nay ạ?`,
              time: 'Vừa xong',
            },
          ]);
        } else {
          setMessages(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  // 4. WebSocket Setup & Listeners
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages(conversationId);

    const socket = initSocket();
    if (!socket) return;

    const joinUserChat = () => {
      socket.emit('join_room', {
        conversationId,
        role: 'user',
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          product: pinnedProduct
            ? {
                name: pinnedProduct.name,
                price: pinnedProduct.salePrice || pinnedProduct.price,
                image: pinnedProduct.images?.[0] || pinnedProduct.image,
                slug: pinnedProduct.slug,
              }
            : undefined,
        },
      });
    };

    joinUserChat();
    socket.on('connect', joinUserChat);

    const handleReceiveMessage = (msg: any) => {
      setMessages((prev) => {
        // 1. If message already exists by _id, ignore
        if (msg._id && prev.some((m) => m._id === msg._id)) {
          return prev;
        }

        // 2. If matching by clientMsgId, replace optimistic placeholder
        if (msg.clientMsgId) {
          const idx = prev.findIndex(
            (m) =>
              m._id === msg.clientMsgId ||
              m.id === msg.clientMsgId ||
              (m as any).clientMsgId === msg.clientMsgId
          );
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = msg;
            return updated;
          }
        }

        // 3. Fallback: match temporary message without official _id having same sender, text, and image
        const tempIdx = prev.findIndex(
          (m) =>
            (!m._id || m._id.startsWith('temp_') || m.id?.startsWith('temp_')) &&
            m.sender === msg.sender &&
            m.text === msg.text &&
            ((!m.image && !msg.image) || m.image === msg.image)
        );

        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = msg;
          return updated;
        }

        return [...prev, msg];
      });

      if (msg.sender === 'admin') {
        playNotificationSound();
        socket.emit('mark_read', { conversationId, readBy: 'user' });
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversationId && data.sender === 'admin') {
        setIsAdminTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    // Fallback polling every 5s if socket is disconnected
    const interval = setInterval(() => {
      if (!socket.connected) {
        fetchMessages(conversationId);
      }
    }, 5000);

    return () => {
      socket.off('connect', joinUserChat);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      clearInterval(interval);
    };
  }, [conversationId, customerInfo.name, customerInfo.phone, pinnedProduct]);

  // Scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAdminTyping]);

  // Typing emitter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);

    const socket = getSocket();
    if (socket && conversationId) {
      socket.emit('typing', { conversationId, sender: 'user', isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId, sender: 'user', isTyping: false });
      }, 1500);
    }
  };

  // Send Message
  const handleSend = async (textToSend?: string, attachedImage?: string, attachedProduct?: any) => {
    const text = textToSend !== undefined ? textToSend : inputMsg;
    if (!text.trim() && !attachedImage) return;

    const clientMsgId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      clientMsgId,
      conversationId,
      sender: 'user',
      senderName: customerInfo.name || 'Khách hàng',
      customerName: customerInfo.name || 'Khách hàng',
      customerPhone: customerInfo.phone || '',
      text: text.trim(),
      image: attachedImage || '',
      product: attachedProduct
        ? {
            name: attachedProduct.name,
            price: attachedProduct.salePrice || attachedProduct.price,
            image: attachedProduct.images?.[0] || attachedProduct.image || '',
            slug: attachedProduct.slug,
          }
        : undefined,
    };

    // Optimistic UI update
    const tempMsg: Message & { clientMsgId?: string } = {
      _id: clientMsgId,
      id: clientMsgId,
      clientMsgId,
      sender: 'user',
      senderName: payload.senderName,
      text: payload.text,
      image: payload.image,
      product: payload.product,
      time: 'Vừa xong',
    };
    setMessages((prev) => [...prev, tempMsg]);
    if (textToSend === undefined) setInputMsg('');

    setIsSending(true);

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', payload, (res: any) => {
        setIsSending(false);
        if (res?.data?._id) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === clientMsgId || m.id === clientMsgId || (m as any).clientMsgId === clientMsgId
                ? res.data
                : m
            )
          );
        }
      });
      // Stop typing
      socket.emit('typing', { conversationId, sender: 'user', isTyping: false });
    } else {
      try {
        const res = await apiFetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.data?._id) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === clientMsgId || m.id === clientMsgId || (m as any).clientMsgId === clientMsgId
                ? data.data
                : m
            )
          );
        }
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi gửi tin nhắn');
      } finally {
        setIsSending(false);
      }
    }
  };

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        handleSend('', data.data.url);
        toast.success('Đã gửi ảnh!');
      } else {
        toast.error(data.message || 'Lỗi tải ảnh lên');
      }
    } catch (err) {
      toast.error('Lỗi khi gửi ảnh');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInquireAboutProduct = () => {
    if (!pinnedProduct) return;
    handleSend(`Shop ơi, tư vấn giúp mình sản phẩm "${pinnedProduct.name}" này với ạ!`, undefined, pinnedProduct);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  // Save phone number & name
  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.trim();
    const cleanName = nameInput.trim() || 'Khách hàng';

    if (!cleanPhone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setCustomerInfo({ name: cleanName, phone: cleanPhone });
    localStorage.setItem('shoptik_guest_name', cleanName);
    setShowPhoneModal(false);

    // Save to profile
    try {
      const p = { name: cleanName, phone: cleanPhone };
      localStorage.setItem('shoptik_profile', JSON.stringify(p));
    } catch (e) {}

    // Emit socket update
    const socket = getSocket();
    socket?.emit('update_conversation', {
      conversationId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      status: 'has_phone',
    });

    // Also REST update
    try {
      await apiFetch('/api/chat/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          customerName: cleanName,
          customerPhone: cleanPhone,
          status: 'has_phone',
        }),
      });
    } catch (e) {}

    toast.success('Đã lưu thông tin liên hệ!');
    handleSend(`Thông tin liên hệ của mình: ${cleanName} - SĐT: ${cleanPhone}`);
  };

  return (
    <div className={styles.page}>
      {/* ===== FIXED TOP NAVIGATION ===== */}
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          <button
            className={styles.backBtn}
            onClick={() => router.back()}
            aria-label="Quay lại"
          >
            <FiChevronLeft size={22} />
          </button>

          <div className={styles.shopInfo}>
            <div className={styles.shopNameRow}>
              <span className={styles.shopName}>{shopName}</span>
              <span className={styles.onlineBadge} title="Đang trực tuyến" />
            </div>
            <span className={styles.statusText}>CSKH trực tuyến 24/7 (Realtime)</span>
          </div>
        </div>

        <div className={styles.navRight}>
          <button
            type="button"
            className={styles.phoneBtn}
            onClick={() => setShowPhoneModal(true)}
            title="Cung cấp số điện thoại tư vấn"
          >
            <FiPhone size={13} />
            <span>{customerInfo.phone ? 'Đã có SĐT' : 'Để lại SĐT'}</span>
          </button>
        </div>
      </nav>

      {/* ===== PRODUCT PINNED BANNER (IF NAVIGATED FROM PRODUCT DETAIL) ===== */}
      {pinnedProduct && (
        <div className={styles.productPinnedCard}>
          <img
            src={pinnedProduct.images?.[0] || pinnedProduct.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100'}
            alt={pinnedProduct.name}
            className={styles.productPinnedImg}
          />
          <div className={styles.productPinnedInfo}>
            <span className={styles.productPinnedTitle}>{pinnedProduct.name}</span>
            <span className={styles.productPinnedPrice}>
              {formatPrice(pinnedProduct.salePrice || pinnedProduct.price)}
            </span>
          </div>
          <button
            type="button"
            className={styles.sendProductInquiryBtn}
            onClick={handleInquireAboutProduct}
          >
            Hỏi về sản phẩm
          </button>
        </div>
      )}

      {/* ===== CHAT MESSAGES SCROLL AREA ===== */}
      <div className={styles.chatArea}>
        <div className={styles.timeDivider}>Hôm nay</div>

        {/* Guest info reminder badge */}
        {!customerInfo.phone && (
          <div className={styles.leadPromptCard}>
            <div className={styles.leadPromptHeader}>
              <FiPhone size={16} />
              <span>Nhận hỗ trợ qua Zalo & cuộc gọi:</span>
            </div>
            <p className={styles.leadPromptDesc}>
              Để lại số điện thoại để chuyên viên của {shopName} gọi lại tư vấn và gửi ảnh thực tế nhanh nhất.
            </p>
            <button
              type="button"
              className={styles.leadPromptBtn}
              onClick={() => setShowPhoneModal(true)}
            >
              + Thêm Số Điện Thoại
            </button>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const timeStr = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : msg.time || 'Vừa xong';

          if (!isUser) {
            return (
              <div key={msg._id || msg.id || idx} className={styles.shopMsgRow}>
                <div className={styles.shopAvatar}>
                  {theme?.pageTitles?.logoUrl ? (
                    <img
                      src={theme.pageTitles.logoUrl}
                      alt="Logo"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }}
                    />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <div className={styles.shopBubble}>
                  {msg.product && (
                    <div className={styles.msgProductCard}>
                      <img
                        src={msg.product.image || '/file.svg'}
                        alt={msg.product.name}
                        className={styles.msgProductImg}
                      />
                      <div className={styles.msgProductInfo}>
                        <span className={styles.msgProductName}>{msg.product.name}</span>
                        <span className={styles.msgProductPrice}>{formatPrice(msg.product.price)}</span>
                      </div>
                    </div>
                  )}

                  {msg.text && (
                    <div>
                      {msg.text.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}

                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Ảnh đính kèm"
                      className={styles.msgImage}
                      onClick={() => window.open(msg.image, '_blank')}
                    />
                  )}

                  <span className={styles.msgTime}>{timeStr}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg._id || msg.id || idx} className={styles.userMsgRow}>
              <div className={styles.userBubble}>
                {msg.product && (
                  <div className={styles.msgProductCard}>
                    <img
                      src={msg.product.image || '/file.svg'}
                      alt={msg.product.name}
                      className={styles.msgProductImg}
                    />
                    <div className={styles.msgProductInfo}>
                      <span className={styles.msgProductName} style={{ color: '#fff' }}>
                        {msg.product.name}
                      </span>
                      <span className={styles.msgProductPrice}>{formatPrice(msg.product.price)}</span>
                    </div>
                  </div>
                )}

                {msg.text && (
                  <div>
                    {msg.text.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Ảnh đính kèm"
                    className={styles.msgImage}
                    onClick={() => window.open(msg.image, '_blank')}
                  />
                )}

                <span className={styles.msgTime}>{timeStr}</span>
              </div>
            </div>
          );
        })}

        {isAdminTyping && (
          <div className={styles.typingBox}>
            <div className={styles.typingDots}>
              <span />
              <span />
              <span />
            </div>
            <span>Admin CSKH đang soạn tin nhắn...</span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        {messages.length <= 4 && (
          <div className={styles.quickChipsWrap}>
            <button
              type="button"
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Shop ơi, tư vấn giúp mình cách chọn size chuẩn với ạ!')}
            >
              👕 Tư vấn chọn size chuẩn
            </button>
            <button
              type="button"
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Thời gian và phí giao hàng như thế nào vậy Shop?')}
            >
              🚚 Thời gian & Phí giao hàng
            </button>
            <button
              type="button"
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Chính sách đổi trả và bảo hành như thế nào ạ?')}
            >
              🔄 Chính sách đổi trả hàng
            </button>
            <button
              type="button"
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Shop ơi, có mã giảm giá hay voucher nào không?')}
            >
              🎁 Ưu đãi & Voucher hôm nay
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ===== FIXED BOTTOM INPUT BAR ===== */}
      <div className={styles.inputBar}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          title="Gửi hình ảnh"
          disabled={isUploading}
        >
          <FiImage />
        </button>

        <form
          className={styles.chatForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className={styles.chatInput}
            placeholder={isUploading ? 'Đang tải ảnh...' : 'Nhập tin nhắn với Shop...'}
            value={inputMsg}
            onChange={handleInputChange}
            disabled={isUploading}
          />

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!inputMsg.trim() || isSending || isUploading}
            aria-label="Gửi"
          >
            <FiSend />
          </button>
        </form>
      </div>

      {/* ===== PHONE & NAME MODAL ===== */}
      {showPhoneModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowPhoneModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Thông tin liên hệ tư vấn</h3>
            <p className={styles.modalDesc}>
              Nhập tên và số điện thoại để Shop có thể gọi lại hoặc nhắn tin qua Zalo hỗ trợ bạn tốt nhất.
            </p>

            <form onSubmit={handleSaveContactInfo}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên của bạn:</label>
                <div className={styles.inputWrapper}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="VD: Anh Tuấn / Chị Mai"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số điện thoại / Zalo *:</label>
                <div className={styles.inputWrapper}>
                  <FiPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    required
                    className={styles.formInput}
                    placeholder="VD: 0987654321"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowPhoneModal(false)}
                >
                  Bỏ qua
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<StoreLoading />}>
      <ChatContent />
    </Suspense>
  );
}
