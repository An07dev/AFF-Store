'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiMessageSquare,
  FiX,
  FiMaximize2,
  FiSend,
  FiPhone,
  FiImage,
} from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { getSocket, initSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './ChatFloatingWidget.module.css';

interface MiniMessage {
  _id?: string;
  id?: string;
  sender: 'user' | 'admin' | 'shop' | 'bot';
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

export default function ChatFloatingWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<MiniMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Position & Dragging State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
    containerRect: DOMRect | null;
    btnRect: DOMRect | null;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
    containerRect: null,
    btnRect: null,
  });

  const shopName = theme?.pageTitles?.logoText || 'Football Store';
  const avatarInitials = shopName ? shopName.substring(0, 2).toUpperCase() : 'FS';

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
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // 1. Initialize Conversation ID & Saved Profile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let convId = localStorage.getItem('shoptik_chat_conv_id');
    if (!convId) {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('shoptik_chat_conv_id', convId);
    }
    setConversationId(convId);

    const savedProfile = localStorage.getItem('shoptik_profile');
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        if (p.phone) {
          setCustomerPhone(p.phone);
          setPhoneSubmitted(true);
        }
      } catch (e) {}
    }
  }, []);

  // 2. Initialize Default Position inside Container
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeDefaultPosition = () => {
      if (!wrapperRef.current) return;
      const parent = wrapperRef.current.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const btnWidth = btnRef.current?.offsetWidth || 130;
      const btnHeight = btnRef.current?.offsetHeight || 42;

      const defaultX = parentRect.width - btnWidth - 14;
      const defaultY = parentRect.height - btnHeight - 68;

      setPosition((prev) => {
        if (prev === null) {
          return { x: Math.max(8, defaultX), y: Math.max(55, defaultY) };
        }
        return prev;
      });
    };

    computeDefaultPosition();
    window.addEventListener('resize', computeDefaultPosition);
    return () => window.removeEventListener('resize', computeDefaultPosition);
  }, []);

  // 3. Fetch Messages from API
  const fetchMessages = async () => {
    const cid = conversationIdRef.current;
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
              text: `👋 Chào bạn! Shop có thể hỗ trợ tư vấn size hoặc sản phẩm nào cho bạn hôm nay ạ?`,
              time: 'Vừa xong',
            },
          ]);
        } else {
          setMessages(data.data);
        }
      }
    } catch (e) {}
  };

  // 4. Setup Socket Connection
  useEffect(() => {
    if (!conversationId) return;

    const socket = initSocket();
    if (!socket) return;

    const joinUserRoom = () => {
      if (!conversationIdRef.current) return;
      socket.emit('join_room', {
        conversationId: conversationIdRef.current,
        role: 'user',
        customerInfo: {
          name: localStorage.getItem('shoptik_guest_name') || 'Khách hàng',
          phone: customerPhone,
        },
      });
    };

    joinUserRoom();
    socket.on('connect', joinUserRoom);

    const handleReceiveMessage = (msg: any) => {
      // Filter out messages not belonging to this customer conversation
      if (msg.conversationId && msg.conversationId !== conversationIdRef.current) {
        return;
      }

      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) {
          return prev;
        }

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
        if (!isOpenRef.current) {
          setUnreadCount((c) => c + 1);
        } else {
          socket.emit('mark_read', { conversationId: conversationIdRef.current, readBy: 'user' });
        }
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversationIdRef.current && (data.sender === 'admin' || data.sender === 'bot')) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('connect', joinUserRoom);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversationId, customerPhone]);

  // 5. Polling & Sync when popup is open
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    fetchMessages();
    setUnreadCount(0);
    const socket = getSocket();
    socket?.emit('mark_read', { conversationId, readBy: 'user' });

    // Polling fallback every 3.5s while popup is open to ensure 100% real-time reliability
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // 6. Drag & Drop Event Handlers (Mouse & Touch)
  const startDrag = (clientX: number, clientY: number) => {
    if (!wrapperRef.current || !btnRef.current) return;
    const parent = wrapperRef.current.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const btnRect = btnRef.current.getBoundingClientRect();

    const currentX = position ? position.x : parentRect.width - btnRect.width - 14;
    const currentY = position ? position.y : parentRect.height - btnRect.height - 68;

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: currentX,
      initialY: currentY,
      hasMoved: false,
      containerRect: parentRect,
      btnRect,
    };
    setIsDragging(true);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const { startX, startY, initialX, initialY, containerRect, btnRect } = dragStartRef.current;
    if (!containerRect || !btnRect) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      dragStartRef.current.hasMoved = true;
    }

    let newX = initialX + deltaX;
    let newY = initialY + deltaY;

    const minX = 8;
    const maxX = containerRect.width - btnRect.width - 8;
    const minY = 52; // Below topbar
    const maxY = containerRect.height - btnRect.height - 65; // Above bottom nav

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      moveDrag(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      endDrag();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      endDrag();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging]);

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
                onClick={(e) => {
                  if (isInternal) {
                    e.preventDefault();
                    const cleanPath = rawUrl.replace(/^https?:\/\/[^\/]+/, '');
                    setIsOpen(false);
                    router.push(cleanPath);
                  }
                }}
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

  // Click Trigger
  const handleButtonClick = (e: React.MouseEvent) => {
    if (dragStartRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(!isOpen);
  };

  // Send message
  const handleSend = async (textToSend?: string, attachedImg?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if ((!text.trim() && !attachedImg) || !conversationId) return;

    const clientMsgId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const socket = getSocket();
    const guestName = localStorage.getItem('shoptik_guest_name') || 'Khách hàng';

    const payload = {
      clientMsgId,
      conversationId,
      sender: 'user',
      senderName: guestName,
      customerName: guestName,
      customerPhone,
      text: text.trim(),
      image: attachedImg || '',
    };

    // Optimistic UI
    const tempMsg: MiniMessage & { clientMsgId?: string } = {
      _id: clientMsgId,
      id: clientMsgId,
      clientMsgId,
      sender: 'user',
      senderName: guestName,
      text: payload.text,
      image: payload.image,
      time: 'Vừa xong',
    };
    setMessages((prev) => [...prev, tempMsg]);
    if (textToSend === undefined) setInputText('');

    if (socket && socket.connected) {
      socket.emit('send_message', payload, (res: any) => {
        if (res?.data?._id) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === clientMsgId || (m as any).clientMsgId === clientMsgId
                ? res.data
                : m
            )
          );
        }
      });
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
              m._id === clientMsgId || (m as any).clientMsgId === clientMsgId
                ? data.data
                : m
            )
          );

          // Immediate AI Bot reply with human-like micro-delay
          if (data.botReply) {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setMessages((prev) => {
                if (prev.some((m) => m._id === data.botReply._id)) return prev;
                return [...prev, data.botReply];
              });
              playNotificationSound();
            }, 350);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Upload image in mini popup
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Submit phone
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || !conversationId) return;

    try {
      await apiFetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          customerPhone: customerPhone.trim(),
          status: 'has_phone',
        }),
      });

      handleSend(`SĐT của tôi: ${customerPhone.trim()}`);
      setPhoneSubmitted(true);
      toast.success('Đã lưu SĐT! Shop sẽ liên hệ tư vấn qua Zalo cho bạn.');
    } catch (e) {
      console.error(e);
    }
  };

  // Don't render on Admin pages or Checkout/Tracking if excluded
  if (
    pathname.startsWith('/admin') ||
    pathname === '/chat'
  ) {
    return null;
  }

  const isLeft = position && position.x < 150;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.floatingWrapper} ${isDragging ? styles.dragging : ''}`}
      style={{
        transform: position
          ? `translate3d(${position.x}px, ${position.y}px, 0)`
          : undefined,
        right: position ? 'auto' : '16px',
        bottom: position ? 'auto' : '72px',
      }}
    >
      {/* 1. Mini Popup Window */}
      {isOpen && (
        <div
          className={`${styles.miniPopup} ${
            position && position.y < 460 ? styles.popupBelow : styles.popupAbove
          } ${isLeft ? styles.popupLeft : styles.popupRight}`}
        >
          <div className={styles.popupHeader}>
            <div className={styles.shopInfoRow}>
              <div className={styles.avatarWrap}>
                {avatarInitials}
                <span className={styles.onlineBadge} />
              </div>
              <div className={styles.shopDetails}>
                <span className={styles.shopTitle}>{shopName}</span>
                <span className={styles.shopDivider}>•</span>
                <span className={styles.shopStatus}>
                  <span className={styles.onlineDot} /> AI Trợ Lý 24/7
                </span>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.actionBtn}
                title="Mở toàn màn hình"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/chat');
                }}
              >
                <FiMaximize2 size={13} />
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                title="Đóng"
                onClick={() => setIsOpen(false)}
              >
                <FiX size={15} />
              </button>
            </div>
          </div>

          <div className={styles.popupBody}>
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const isBot = m.sender === 'bot';
              const timeStr = m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : m.time || 'Vừa xong';

              return (
                <div
                  key={m._id || m.id || idx}
                  className={`${styles.msgRow} ${
                    isUser ? styles.msgRowUser : styles.msgRowShop
                  }`}
                >
                  <div
                    className={`${styles.msgBubble} ${
                      isUser ? styles.msgUserBubble : styles.msgShopBubble
                    }`}
                  >
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
                        <span>🤖 {m.senderName || 'AI Trợ Lý'}</span>
                      </div>
                    )}
                    <FormattedMessageText text={m.text} />
                    {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {m.suggestedProducts.map((sp, spIdx) => {
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
                                  style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                                />
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main, #fff)' }}>
                                  {sp.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444' }}>{spPrice}</span>
                                  {spOrig && (
                                    <span style={{ fontSize: 9, textDecoration: 'line-through', opacity: 0.6, color: '#94a3b8' }}>{spOrig}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push(`/product/${sp.slug}`);
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
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
                    {m.image && (
                      <img
                        src={m.image}
                        alt="Ảnh"
                        className={styles.msgImage}
                        onClick={() => window.open(m.image, '_blank')}
                      />
                    )}
                    <span className={styles.msgTime}>{timeStr}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className={styles.typingIndicator}>
                <span>🤖 AI Trợ Lý đang soạn phản hồi...</span>
              </div>
            )}

            {/* Phone quick input */}
            {!phoneSubmitted && (
              <div
                style={{
                  background: 'var(--bg-card, #13161f)',
                  border: '1px dashed var(--primary, #3b82f6)',
                  borderRadius: 12,
                  padding: 10,
                  fontSize: 12,
                  color: 'var(--text-main, #f8fafc)',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--primary, #3b82f6)',
                  }}
                >
                  <FiPhone size={13} /> Để lại SĐT để Shop tư vấn qua Zalo:
                </div>
                <form
                  onSubmit={handlePhoneSubmit}
                  style={{ display: 'flex', gap: 6, marginTop: 6 }}
                >
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color, #232838)',
                      background: 'var(--bg-main, #090a0f)',
                      color: 'var(--text-main, #f8fafc)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'var(--primary, #3b82f6)',
                      color: 'var(--primary-text, #fff)',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Gửi
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div
            style={{
              padding: '6px 8px',
              display: 'flex',
              gap: 5,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              background: 'var(--bg-card, #13161f)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
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
                className={styles.chipBtn}
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={() => handleSend(chip.prompt)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <div className={styles.popupFooter}>
            <button
              type="button"
              className={styles.uploadBtn}
              title="Gửi hình ảnh"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <FiImage size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <input
              type="text"
              className={styles.popupInput}
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              type="button"
              className={styles.popupSendBtn}
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              title="Gửi"
            >
              <FiSend size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Draggable Floating Action Button */}
      <button
        ref={btnRef}
        type="button"
        className={`${styles.floatingBtn} ${isOpen ? styles.floatingBtnOpen : ''}`}
        onClick={handleButtonClick}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        aria-label={isOpen ? 'Đóng hộp thoại chat' : 'Mở chat trực tuyến'}
        title={isOpen ? 'Đóng chat' : 'Chat với Shop (Kéo thả để di chuyển)'}
      >
        <span className={styles.floatingIcon}>
          {isOpen ? <FiX size={20} /> : <FiMessageSquare size={20} />}
        </span>
        {unreadCount > 0 && !isOpen && (
          <span className={styles.unreadBadge}>{unreadCount}</span>
        )}
      </button>
    </div>
  );
}
