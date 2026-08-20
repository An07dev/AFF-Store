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
import styles from './ChatFloatingWidget.module.css';

interface MiniMessage {
  _id?: string;
  id?: string;
  sender: 'user' | 'admin' | 'shop' | 'bot';
  senderName?: string;
  text: string;
  image?: string;
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

      if (msg.sender === 'admin') {
        playNotificationSound();
        if (!isOpenRef.current) {
          setUnreadCount((c) => c + 1);
        } else {
          socket.emit('mark_read', { conversationId: conversationIdRef.current, readBy: 'user' });
        }
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversationIdRef.current && data.sender === 'admin') {
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || !conversationId) return;

    setPhoneSubmitted(true);
    const socket = getSocket();
    socket?.emit('update_conversation', {
      conversationId,
      customerPhone: customerPhone.trim(),
      status: 'has_phone',
    });

    handleSend(`Số điện thoại liên hệ của mình là: ${customerPhone.trim()}`);
  };

  // Hide widget on dedicated full-screen pages
  if (
    pathname === '/chat' ||
    pathname.startsWith('/admin') ||
    pathname === '/checkout' ||
    pathname === '/payment' ||
    pathname === '/order-success'
  ) {
    return null;
  }

  // Calculate smart orientation for mini popup based on bubble position
  const isPopupAbove = position ? position.y > 320 : true;
  const isPopupAlignRight = position ? position.x > 120 : true;

  const wrapperStyle: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : {
        bottom: '68px',
        right: '14px',
      };

  return (
    <div
      ref={wrapperRef}
      className={`${styles.floatingWrapper} ${isDragging ? styles.dragging : ''}`}
      style={wrapperStyle}
    >
      {/* Mini Chat Popup Window */}
      {isOpen && (
        <div
          className={`${styles.miniPopup} ${
            isPopupAbove ? styles.popupAbove : styles.popupBelow
          } ${isPopupAlignRight ? styles.popupAlignRight : styles.popupAlignLeft}`}
        >
          <div className={styles.popupHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.shopAvatar}>
                {theme?.pageTitles?.logoUrl ? (
                  <img
                    src={theme.pageTitles.logoUrl}
                    alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  avatarInitials
                )}
              </div>
              <div className={styles.shopDetails}>
                <span className={styles.shopTitle}>{shopName}</span>
                <span className={styles.shopStatus}>
                  <span className={styles.onlineDot} /> Đang trực tuyến
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
                    {m.text}
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
                <span>Admin đang gõ tin nhắn...</span>
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
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Gửi
                  </button>
                </form>
              </div>
            )}

            {/* Quick action chips */}
            {messages.length <= 2 && (
              <div className={styles.quickChips}>
                <button
                  type="button"
                  className={styles.chipBtn}
                  onClick={() => handleSend('Shop tư vấn size giúp mình với!')}
                >
                  👕 Tư vấn chọn size
                </button>
                <button
                  type="button"
                  className={styles.chipBtn}
                  onClick={() => handleSend('Phí ship và thời gian giao hàng thế nào?')}
                >
                  🚚 Phí giao hàng
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className={styles.popupFooter}
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <button
              type="button"
              className={styles.actionBtn}
              style={{ color: 'var(--text-muted, #94a3b8)', background: 'transparent' }}
              title="Gửi ảnh"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage size={17} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageUpload}
            />

            <input
              type="text"
              className={styles.popupInput}
              placeholder={isUploading ? 'Đang tải ảnh...' : 'Nhập tin nhắn...'}
              value={inputText}
              disabled={isUploading}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              className={styles.popupSendBtn}
              disabled={!inputText.trim() && !isUploading}
              title="Gửi"
            >
              <FiSend size={14} />
            </button>
          </form>
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
