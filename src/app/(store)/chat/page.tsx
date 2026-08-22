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
    <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.55 }}>
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
          <div key={lIdx} style={{ minHeight: line.trim() ? undefined : '0.6em' }}>
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
        <strong key={`${keyPrefix}-b-${pIdx}`} style={{ color: 'var(--text-main, #fff)', fontWeight: 800 }}>
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

          if (data.botReply) {
            setIsAdminTyping(true);
            setTimeout(() => {
              setIsAdminTyping(false);
              setMessages((prev) => {
                if (prev.some((m) => m._id === data.botReply._id)) return prev;
                return [...prev, data.botReply];
              });
              playNotificationSound();
            }, 350);
          }
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
            <span className={styles.shopName}>{shopName}</span>
            <span className={styles.shopDivider}>•</span>
            <span className={styles.onlineStatus}>🤖 AI Trợ Lý 24/7 & CSKH</span>
          </div>
        </div>

        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowPhoneModal(true)}
            title="Cập nhật SĐT"
          >
            <FiPhoneCall size={18} />
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
                  {isBot && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#38bdf8',
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
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.suggestedProducts.map((sp, spIdx) => {
                        const spPrice = (sp.salePrice || sp.price || 0).toLocaleString('vi-VN') + '₫';
                        const spOrig = sp.salePrice && sp.price > sp.salePrice ? `${sp.price.toLocaleString('vi-VN')}₫` : '';
                        return (
                          <div
                            key={spIdx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: 10,
                              padding: '6px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {sp.image && (
                              <img
                                src={sp.image}
                                alt={sp.name}
                                style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main, #fff)' }}>
                                {sp.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444' }}>{spPrice}</span>
                                {spOrig && (
                                  <span style={{ fontSize: 10, textDecoration: 'line-through', opacity: 0.6, color: '#94a3b8' }}>{spOrig}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                router.push(`/product/${sp.slug}`);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11,
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
                      <span className={styles.msgProductName}>{msg.product.name}</span>
                      <span className={styles.msgProductPrice}>{formatPrice(msg.product.price)}</span>
                    </div>
                  </div>
                )}

                {msg.text && <div>{msg.text}</div>}

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Ảnh đính kèm"
                    className={styles.msgImage}
                    onClick={() => window.open(msg.image, '_blank')}
                  />
                )}

                <span className={styles.userMsgTime}>
                  {timeStr} <FiCheckCircle size={10} style={{ display: 'inline', marginLeft: 2 }} />
                </span>
              </div>
            </div>
          );
        })}

        {isAdminTyping && (
          <div className={styles.typingRow}>
            <div className={styles.typingBubble}>
              <span>🤖 AI Trợ Lý đang soạn tin nhắn...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ===== QUICK PROMPTS ROW ===== */}
      <div
        style={{
          padding: '6px 12px',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          background: 'var(--bg-main, #090a0f)',
          borderTop: '1px solid var(--border-color, #232838)',
        }}
      >
        {[
          { label: '📏 Tư vấn size', prompt: 'Shop tư vấn chọn size giúp mình với ạ' },
          { label: '🔍 Tra cứu đơn #ST...', prompt: 'Kiểm tra đơn hàng giúp mình' },
          { label: '🚚 Phí ship & Freeship', prompt: 'Chính sách freeship và thời gian giao hàng thế nào ạ?' },
          { label: '🛡️ Đổi trả 7 ngày', prompt: 'Chính sách đổi trả hàng như thế nào ạ?' },
        ].map((chip, cIdx) => (
          <button
            key={cIdx}
            type="button"
            className={styles.quickPromptChip}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => handleQuickPrompt(chip.prompt)}
          >
            {chip.label}
          </button>
        ))}
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
