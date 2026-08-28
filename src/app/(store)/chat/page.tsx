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
  FiX,
  FiShoppingBag,
  FiLock,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
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
  suggestedProducts?: Array<{
    name: string;
    price: number;
    salePrice?: number;
    image?: string;
    slug: string;
  }>;
  createdAt?: string;
  time?: string;
}

// Helper for rendering Markdown text, bold **text**, and clickable links
function FormattedMessageText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.55, minWidth: 0, maxWidth: '100%' }}>
      {lines.map((line, lIdx) => {
        const linkRegex = /\[(.*?)\]\((.*?)\)/g;
        let lastIndex = 0;
        const elements: any[] = [];
        let match;

        while ((match = linkRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            elements.push(...parseBoldText(line.substring(lastIndex, match.index), `txt-${lIdx}-${lastIndex}`));
          }
          const label = match[1];
          const rawUrl = match[2];
          const isInternal = rawUrl.startsWith('/') || rawUrl.includes('/product/') || rawUrl.includes('/tracking');

          elements.push(
            <a
              key={`link-${lIdx}-${match.index}`}
              href={rawUrl}
              target={isInternal ? '_self' : '_blank'}
              rel="noopener noreferrer"
              style={{
                color: '#38bdf8',
                textDecoration: 'underline',
                fontWeight: 700,
                padding: '0 2px',
                cursor: 'pointer',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {label}
            </a>
          );
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
          elements.push(...parseBoldText(line.substring(lastIndex), `txt-${lIdx}-${lastIndex}`));
        }

        return (
          <div key={lIdx} style={{ minHeight: line.trim() ? undefined : '0.6em', wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0, maxWidth: '100%' }}>
            {elements.length > 0 ? elements : <span>&nbsp;</span>}
          </div>
        );
      })}
    </div>
  );
}

function parseBoldText(str: string, keyPrefix: string) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={`${keyPrefix}-b-${pIdx}`} style={{ color: 'inherit', fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-s-${pIdx}`}>{part}</span>;
  });
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const { theme } = useTheme();
  const { user, loginWithSocial, openAuthModal, isLoading: isAuthLoading } = useCustomerAuth();

  const shopName = theme?.pageTitles?.logoText || 'Football Store';
  const avatarInitials = shopName ? shopName.substring(0, 2).toUpperCase() : 'FS';

  const [conversationId, setConversationId] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string; email?: string; avatar?: string; provider?: string }>({
    name: user?.name || 'Khách hàng',
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    provider: user?.provider || 'local',
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

  // Lock body scroll on mount so only internal messages area can scroll
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

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
      if (msg.conversationId && msg.conversationId !== conversationId) return;

      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev;

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

      if (msg.sender === 'admin' || msg.sender === 'bot') {
        playNotificationSound();
        socket.emit('mark_read', { conversationId, readBy: 'user' });
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversationId && (data.sender === 'admin' || data.sender === 'bot')) {
        setIsAdminTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    const pollInterval = setInterval(() => {
      fetchMessages(conversationId);
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      socket.off('connect', joinUserChat);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversationId, customerInfo, pinnedProduct]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAdminTyping]);

  const emitTyping = (typing: boolean) => {
    const socket = getSocket();
    socket?.emit('typing', {
      conversationId,
      sender: 'user',
      isTyping: typing,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);
    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1500);
  };

  const handleSend = async (customText?: string, customProduct?: any, customImage?: string) => {
    const textToSend = customText !== undefined ? customText : inputMsg;
    if (!textToSend.trim() && !customProduct && !customImage) return;

    const clientMsgId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tempMessage: Message = {
      id: clientMsgId,
      _id: clientMsgId,
      sender: 'user',
      text: textToSend,
      image: customImage,
      product: customProduct,
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tempMessage]);
    if (customText === undefined) setInputMsg('');
    emitTyping(false);
    setIsSending(true);

    const socket = getSocket();
    const activeName = user?.name || customerInfo.name || 'Khách hàng';
    const activeEmail = user?.email || customerInfo.email || '';
    const activeAvatar = user?.avatar || customerInfo.avatar || '';
    const activeProvider = user ? (user.provider || 'local') : (customerInfo.provider || 'guest');
    const activePhone = user?.phone || customerInfo.phone || '';

    const payload = {
      conversationId,
      sender: 'user',
      senderName: activeName,
      customerName: activeName,
      customerPhone: activePhone,
      customerEmail: activeEmail,
      customerAvatar: activeAvatar,
      customerProvider: activeProvider,
      customerId: user?.id || '',
      text: textToSend,
      image: customImage,
      product: customProduct,
      clientMsgId,
      customerInfo: {
        name: activeName,
        phone: activePhone,
        email: activeEmail,
      },
    };

    if (socket && socket.connected) {
      socket.emit('send_message', payload);
    }

    try {
      const res = await apiFetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === clientMsgId || m._id === clientMsgId ? data.data : m))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && (data.url || data.secure_url)) {
        const uploadedUrl = data.url || data.secure_url;
        handleSend('', undefined, uploadedUrl);
      } else {
        toast.error('Lỗi tải ảnh lên');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải ảnh');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInquireAboutProduct = () => {
    if (!pinnedProduct) return;
    const prodData = {
      name: pinnedProduct.name,
      price: pinnedProduct.salePrice || pinnedProduct.price,
      image: pinnedProduct.images?.[0] || pinnedProduct.image || '/file.svg',
      slug: pinnedProduct.slug,
    };
    handleSend(`Tôi muốn tư vấn về sản phẩm: ${pinnedProduct.name}`, prodData);
    setPinnedProduct(null);
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSend(promptText);
  };

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

    try {
      const p = { name: cleanName, phone: cleanPhone };
      localStorage.setItem('shoptik_profile', JSON.stringify(p));
    } catch (e) {}

    const socket = getSocket();
    socket?.emit('update_conversation', {
      conversationId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      status: 'has_phone',
    });

    try {
      await apiFetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          customerName: cleanName,
          customerPhone: cleanPhone,
          status: 'has_phone',
        }),
      });
      handleSend(`SĐT của tôi: ${cleanPhone}`);
      toast.success('Đã lưu thông tin liên hệ!');
    } catch (e) {
      console.error(e);
    }
  };

  const QUICK_PROMPTS = [
    { label: '⚡ Tư vấn chọn size', prompt: 'Shop ơi tư vấn size giúp mình với ạ' },
    { label: '📦 Kiểm tra đơn hàng', prompt: 'Mình muốn kiểm tra tình trạng đơn hàng' },
    { label: '🔄 Chính sách đổi trả', prompt: 'Shop cho mình hỏi về chính sách đổi trả hàng ạ' },
    { label: '🚚 Phí vận chuyển', prompt: 'Phí ship và thời gian giao hàng thế nào ạ?' },
  ];

  if (!isAuthLoading && !user) {
    return (
      <div className={styles.page}>
        <header className={styles.topNav}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Quay lại">
            <FiChevronLeft size={22} />
          </button>
          <div className={styles.navShopInfo}>
            <span className={styles.shopName}>CSKH & Tư Vấn Shop</span>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
            <FiLock />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main, #f8fafc)', margin: '0 0 8px' }}>
            Đăng Nhập Để Bắt Đầu Chat
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted, #94a3b8)', maxWidth: 360, lineHeight: 1.5, margin: '0 0 24px' }}>
            Vui lòng đăng nhập qua Google hoặc Facebook để bắt đầu trò chuyện trực tiếp với nhân viên tư vấn & AI trợ lý của Shop.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
            <button
              type="button"
              onClick={() => loginWithSocial('google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#ffffff',
                color: '#1f2937',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <FcGoogle size={20} />
              <span>Tiếp tục với Google</span>
            </button>

            <button
              type="button"
              onClick={() => loginWithSocial('facebook')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#1877f2',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(24,119,242,0.3)',
              }}
            >
              <FaFacebook size={20} />
              <span>Tiếp tục với Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => openAuthModal()}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                textDecoration: 'underline',
                fontSize: 12.5,
                cursor: 'pointer',
                marginTop: 6,
              }}
            >
              Đăng nhập bằng Email / SĐT khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ===== TOP NAVBAR ===== */}
      <header className={styles.topNav}>
        <button
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="Quay lại"
        >
          <FiChevronLeft size={22} />
        </button>

        <div className={styles.navShopInfo}>
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
            <span className={styles.onlineDot} />
          </div>

          <div className={styles.shopText}>
            <div className={styles.shopNameRow}>
              <span className={styles.shopName}>{shopName}</span>
              <span className={styles.mallBadge}>Mall</span>
            </div>
            <span className={styles.onlineStatus}>🤖 AI Trợ Lý 24/7 & CSKH</span>
          </div>
        </div>

        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.phonePillBtn}
            onClick={() => setShowPhoneModal(true)}
            title="Cập nhật số điện thoại"
          >
            <FiPhone size={13} />
            <span>{customerInfo.phone ? customerInfo.phone : 'Để lại SĐT'}</span>
            <FiEdit3 size={12} />
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowPhoneModal(true)}
            title="Cập nhật SĐT"
          >
            <FiPhoneCall size={17} />
          </button>
        </div>
      </header>

      {/* ===== PINNED INQUIRY PRODUCT CARD ===== */}
      {pinnedProduct && (
        <div className={styles.pinnedProductCard}>
          <img
            src={pinnedProduct.images?.[0] || pinnedProduct.image || '/file.svg'}
            alt={pinnedProduct.name}
            className={styles.pinnedProductImg}
          />
          <div className={styles.pinnedProductDetails}>
            <span className={styles.pinnedProductName}>{pinnedProduct.name}</span>
            <div className={styles.pinnedProductPriceRow}>
              <span className={styles.pinnedProductPrice}>
                {formatPrice(pinnedProduct.salePrice || pinnedProduct.price)}
              </span>
              {pinnedProduct.salePrice && pinnedProduct.price > pinnedProduct.salePrice && (
                <span className={styles.pinnedProductOldPrice}>
                  {formatPrice(pinnedProduct.price)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={styles.sendProductInquiryBtn}
            onClick={handleInquireAboutProduct}
          >
            Hỏi về sản phẩm
          </button>
          <button
            type="button"
            className={styles.closePinnedBtn}
            onClick={() => setPinnedProduct(null)}
            title="Đóng"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ===== CHAT MESSAGES SCROLL AREA ===== */}
      <div className={styles.chatArea}>
        <div className={styles.timeDivider}>Hôm nay</div>

        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isBot = msg.sender === 'bot';
          const timeStr = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : msg.time || 'Vừa xong';

          if (!isUser) {
            return (
              <div key={msg._id || msg.id || idx} className={styles.shopMsgRow}>
                <div className={styles.shopAvatar} style={{ width: 28, height: 28, fontSize: 10 }}>
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
                  {isBot && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: 'var(--primary, #ee4d2d)',
                        marginBottom: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>🤖 {msg.senderName || 'AI Trợ Lý'}</span>
                    </div>
                  )}

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

                  {msg.text && <FormattedMessageText text={msg.text} />}

                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                      {msg.suggestedProducts.map((sp, spIdx) => {
                        const spPrice = (sp.salePrice || sp.price || 0).toLocaleString('vi-VN') + '₫';
                        const spOrig = sp.salePrice && sp.price > sp.salePrice ? `${sp.price.toLocaleString('vi-VN')}₫` : '';
                        return (
                          <div
                            key={spIdx}
                            style={{
                              background: 'var(--bg-main, #f8fafc)',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              borderRadius: 10,
                              padding: '6px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              width: '100%',
                              maxWidth: '100%',
                              boxSizing: 'border-box',
                              minWidth: 0,
                            }}
                          >
                            {sp.image && (
                              <img
                                src={sp.image}
                                alt={sp.name}
                                style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main, #0f172a)' }}>
                                {sp.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary, #ee4d2d)' }}>{spPrice}</span>
                                {spOrig && (
                                  <span style={{ fontSize: 9.5, textDecoration: 'line-through', opacity: 0.6, color: '#94a3b8' }}>{spOrig}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                router.push(`/product/${sp.slug}`);
                              }}
                              style={{
                                background: 'var(--primary, #ee4d2d)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: 10,
                                fontWeight: 800,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              ⚡ Mua ngay
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Ảnh đính kèm"
                      className={styles.msgImg}
                    />
                  )}

                  <div className={styles.msgTime}>{timeStr}</div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg._id || msg.id || idx} className={styles.userMsgRow}>
              <div className={styles.userBubble}>
                {msg.product && (
                  <div
                    className={styles.msgProductCard}
                    style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    <img
                      src={msg.product.image || '/file.svg'}
                      alt={msg.product.name}
                      className={styles.msgProductImg}
                    />
                    <div className={styles.msgProductInfo}>
                      <span className={styles.msgProductName} style={{ color: '#fff' }}>
                        {msg.product.name}
                      </span>
                      <span className={styles.msgProductPrice} style={{ color: '#fff' }}>
                        {formatPrice(msg.product.price)}
                      </span>
                    </div>
                  </div>
                )}

                {msg.text && <FormattedMessageText text={msg.text} />}

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Ảnh đính kèm"
                    className={styles.msgImg}
                  />
                )}

                <div className={styles.msgTime} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {timeStr}
                </div>
              </div>
            </div>
          );
        })}

        {isAdminTyping && (
          <div className={styles.typingRow}>
            <div className={styles.shopAvatar} style={{ width: 26, height: 26, fontSize: 10 }}>
              {avatarInitials}
            </div>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ===== QUICK SUGGESTION PROMPTS ===== */}
      <div className={styles.quickPromptBar}>
        {QUICK_PROMPTS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.quickPromptBtn}
            onClick={() => handleQuickPrompt(chip.prompt)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ===== INPUT FOOTER ===== */}
      <div className={styles.inputFooter}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          title="Gửi hình ảnh"
          disabled={isUploading}
        >
          <FiImage size={18} />
        </button>

        <form
          className={styles.inputWrapper}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className={styles.textInput}
            placeholder={isUploading ? 'Đang tải ảnh lên...' : 'Nhập tin nhắn với Shop...'}
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
            <FiSend size={15} />
          </button>
        </form>
      </div>

      {/* ===== PHONE & NAME MODAL ===== */}
      {showPhoneModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPhoneModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Thông tin liên hệ tư vấn</h3>
            <p className={styles.modalDesc}>
              Nhập tên và số điện thoại để Shop có thể gọi lại hoặc nhắn tin qua Zalo hỗ trợ bạn nhanh nhất.
            </p>

            <form onSubmit={handleSaveContactInfo} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Tên của bạn:</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="VD: Anh Tuấn / Chị Mai"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Số điện thoại / Zalo *:</label>
                <input
                  type="tel"
                  required
                  className={styles.modalInput}
                  placeholder="VD: 0987654321"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setShowPhoneModal(false)}
                >
                  Bỏ qua
                </button>
                <button type="submit" className={styles.modalSubmitBtn}>
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
