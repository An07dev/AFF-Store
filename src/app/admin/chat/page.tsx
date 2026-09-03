'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiImage,
  FiUser,
  FiPhone,
  FiCheckCircle,
  FiCopy,
  FiTag,
  FiX,
  FiExternalLink,
  FiEdit2,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { initSocket, getSocket } from '@/lib/socket';
import styles from './page.module.css';

interface Conversation {
  _id: string; // or conversationId
  conversationId: string;
  customerName: string;
  customerPhone?: string;
  status: 'unread' | 'active' | 'has_phone' | 'resolved';
  tags?: string[];
  adminNotes?: string;
  unreadCountAdmin?: number;
  unreadCountUser?: number;
  lastMessage?: {
    text: string;
    image?: string;
    sender: string;
    createdAt: string;
  };
  productContext?: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  lastActive?: string;
}

interface Message {
  _id?: string;
  conversationId: string;
  sender: 'user' | 'admin' | 'bot';
  senderName: string;
  customerName?: string;
  customerPhone?: string;
  text: string;
  image?: string;
  product?: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  isRead: boolean;
  createdAt: string;
}

const CANNED_RESPONSES = [
  'Dạ chào bạn! Shop có thể hỗ trợ tư vấn size hoặc mẫu nào cho bạn ạ?',
  'Sản phẩm này hiện đang có sẵn hàng tại shop bạn nhé!',
  'Shop gửi bạn bảng size chuẩn để bạn tham khảo nha!',
  'Bạn có thể kiểm tra hàng thoải mái trước khi thanh toán (Ship COD toàn quốc).',
  'Dạ shop đã ghi nhận đơn hàng và sẽ liên hệ giao sớm nhất cho bạn ạ!',
];

const PRESET_TAGS = ['Khách VIP', 'Cần gọi lại', 'Hỏi size L', 'Khách sỉ', 'Chốt COD'];

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'has_phone' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  // CRM State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // AI Bot Settings State
  const [showBotModal, setShowBotModal] = useState(false);
  const [botConfig, setBotConfig] = useState({
    enabled: true,
    botName: 'AI Trợ Lý ShopBig',
    welcomeMessage: 'Dạ chào bạn! Em là Trợ lý AI của shop. Em có thể giúp bạn tư vấn chọn size chuẩn xác, tra cứu đơn hàng hoặc giải đáp chính sách cửa hàng 24/7 ạ!',
    geminiApiKey: '',
  });
  const [isSavingBot, setIsSavingBot] = useState(false);

  useEffect(() => {
    // Load bot config
    apiFetch('/api/settings/chatbot')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBotConfig(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveBotConfig = async () => {
    setIsSavingBot(true);
    try {
      const res = await apiFetch('/api/settings/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã lưu cấu hình AI Chatbot thành công!');
        setShowBotModal(false);
      } else {
        toast.error(data.message || 'Lỗi lưu cấu hình');
      }
    } catch (e) {
      toast.error('Lỗi kết nối khi lưu cấu hình');
    } finally {
      setIsSavingBot(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeConvIdRef = useRef<string | null>(activeConvId);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // Notification chime
  const playDing = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // 1. Fetch Conversations
  const fetchConversations = async () => {
    try {
      let url = `/api/chat/conversations?status=${activeFilter}`;
      if (activeFilter === 'has_phone') {
        url = `/api/chat/conversations?hasPhone=true`;
      }
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const convs = data.data.map((c: any) => ({
          ...c,
          conversationId: c.conversationId || c._id,
        }));
        setConversations(convs);

        if (!activeConvIdRef.current && convs.length > 0) {
          setActiveConvId(convs[0].conversationId);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // 2. Fetch Messages for active conversation
  const fetchActiveMessages = async (cid: string) => {
    if (!cid) return;
    try {
      const res = await apiFetch(`/api/chat/messages?conversationId=${cid}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }

      // Mark read via API & Socket
      apiFetch('/api/chat/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: cid, readBy: 'admin' }),
      }).catch(console.error);

      const socket = getSocket();
      socket?.emit('mark_read', { conversationId: cid, readBy: 'admin' });

      // Reset badge locally
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === cid ? { ...c, unreadCountAdmin: 0 } : c))
      );
    } catch (err) {
      console.error('Error loading active messages:', err);
    }
  };

  // 3. Socket Setup
  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;

    socket.emit('join_room', {
      conversationId: activeConvId,
      role: 'admin',
    });

    const handleNewMessageAlert = (data: any) => {
      // Nếu tin nhắn không thuộc cuộc trò chuyện đang mở, phát chuông và báo toast
      if (data.conversationId !== activeConvIdRef.current) {
        playDing();
        toast(`💬 Tin nhắn mới từ ${data.customerName || 'Khách hàng'}: "${data.text || '[Ảnh]'}"`, {
          icon: '🔔',
        });
      }
      fetchConversations();
    };

    const handleReceiveMessage = (msg: any) => {
      // Nếu tin nhắn thuộc hội thoại hiện tại đang mở trên màn hình Admin
      if (msg.conversationId === activeConvIdRef.current) {
        setMessages((prev) => {
          // 1. If already exists by _id, skip
          if (msg._id && prev.some((m) => m._id === msg._id)) {
            return prev;
          }

          // 2. If matching by clientMsgId, replace optimistic placeholder
          if (msg.clientMsgId) {
            const idx = prev.findIndex(
              (m) =>
                m._id === msg.clientMsgId ||
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
              (!m._id || m._id.startsWith('temp_')) &&
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

        if (msg.sender === 'user') {
          playDing();
          socket.emit('mark_read', { conversationId: activeConvIdRef.current, readBy: 'admin' });
        }
      } else {
        if (msg.sender === 'user') {
          playDing();
        }
      }
      fetchConversations();
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === activeConvIdRef.current && data.sender === 'user') {
        setIsUserTyping(data.isTyping);
      }
    };

    const handleConvUpdated = () => {
      fetchConversations();
    };

    socket.on('new_message_notification', handleNewMessageAlert);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('conversation_updated', handleConvUpdated);

    // Đồng bộ định kỳ 4s giữ tin nhắn luôn tươi mới
    const pollInterval = setInterval(() => {
      if (activeConvIdRef.current) {
        fetchActiveMessages(activeConvIdRef.current);
      }
      fetchConversations();
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      socket.off('new_message_notification', handleNewMessageAlert);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('conversation_updated', handleConvUpdated);
    };
  }, [activeConvId]);

  // Sync conversation list when filter / search changes
  useEffect(() => {
    fetchConversations();
  }, [activeFilter, searchTerm]);

  // Load messages when activeConvId changes
  useEffect(() => {
    if (activeConvId) {
      fetchActiveMessages(activeConvId);
      const active = conversations.find((c) => c.conversationId === activeConvId);
      if (active) {
        setEditName(active.customerName || 'Khách hàng');
        setEditPhone(active.customerPhone || '');
        setAdminNotesInput(active.adminNotes || '');
      }

      const socket = getSocket();
      socket?.emit('join_room', { conversationId: activeConvId, role: 'admin' });
    }
  }, [activeConvId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isUserTyping]);

  // Active conversation object
  const currentConv = conversations.find((c) => c.conversationId === activeConvId);

  // Send Admin Message
  const handleSendMessage = async (textToSend?: string, attachedImg?: string) => {
    const text = textToSend !== undefined ? textToSend : inputMsg;
    if ((!text.trim() && !attachedImg) || !activeConvId) return;

    const clientMsgId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      clientMsgId,
      conversationId: activeConvId,
      sender: 'admin',
      senderName: 'Admin CSKH',
      text: text.trim(),
      image: attachedImg || '',
    };

    const tempMsg: Message & { clientMsgId?: string } = {
      _id: clientMsgId,
      clientMsgId,
      conversationId: activeConvId,
      sender: 'admin',
      senderName: 'Admin CSKH',
      text: payload.text,
      image: payload.image,
      isRead: true,
      createdAt: new Date().toISOString(),
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
      } catch (err) {
        toast.error('Lỗi khi gửi tin nhắn');
      } finally {
        setIsSending(false);
      }
    }
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;

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
        handleSendMessage('', data.data.url);
        toast.success('Đã gửi ảnh!');
      } else {
        toast.error(data.message || 'Lỗi tải ảnh');
      }
    } catch (err) {
      toast.error('Lỗi tải ảnh lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update Status
  const handleStatusChange = async (newStatus: any) => {
    if (!activeConvId) return;

    try {
      await apiFetch('/api/chat/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          status: newStatus,
        }),
      });

      const socket = getSocket();
      socket?.emit('update_conversation', {
        conversationId: activeConvId,
        status: newStatus,
      });

      setConversations((prev) =>
        prev.map((c) => (c.conversationId === activeConvId ? { ...c, status: newStatus } : c))
      );
      toast.success('Đã cập nhật trạng thái');
    } catch (e) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  // Update CRM Customer Info
  const handleSaveCrmInfo = async () => {
    if (!activeConvId) return;

    try {
      const res = await apiFetch('/api/chat/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          customerName: editName.trim(),
          customerPhone: editPhone.trim(),
          adminNotes: adminNotesInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === activeConvId
              ? {
                  ...c,
                  customerName: editName.trim(),
                  customerPhone: editPhone.trim(),
                  adminNotes: adminNotesInput.trim(),
                  status: editPhone.trim() ? 'has_phone' : c.status,
                }
              : c
          )
        );

        const socket = getSocket();
        socket?.emit('update_conversation', {
          conversationId: activeConvId,
          customerName: editName.trim(),
          customerPhone: editPhone.trim(),
          adminNotes: adminNotesInput.trim(),
        });

        toast.success('Đã lưu thông tin khách hàng!');
      }
    } catch (e) {
      toast.error('Lỗi khi lưu thông tin');
    }
  };

  // Add Tag
  const handleAddTag = async (tag: string) => {
    if (!activeConvId || !tag.trim()) return;
    const currentTags = currentConv?.tags || [];
    if (currentTags.includes(tag.trim())) return;

    const newTags = [...currentTags, tag.trim()];

    try {
      await apiFetch('/api/chat/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          tags: newTags,
        }),
      });

      setConversations((prev) =>
        prev.map((c) => (c.conversationId === activeConvId ? { ...c, tags: newTags } : c))
      );
      setNewTagInput('');

      const socket = getSocket();
      socket?.emit('update_conversation', {
        conversationId: activeConvId,
        tags: newTags,
      });
    } catch (e) {}
  };

  // Remove Tag
  const handleRemoveTag = async (tagToRemove: string) => {
    if (!activeConvId) return;
    const currentTags = currentConv?.tags || [];
    const newTags = currentTags.filter((t) => t !== tagToRemove);

    try {
      await apiFetch('/api/chat/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          tags: newTags,
        }),
      });

      setConversations((prev) =>
        prev.map((c) => (c.conversationId === activeConvId ? { ...c, tags: newTags } : c))
      );

      const socket = getSocket();
      socket?.emit('update_conversation', {
        conversationId: activeConvId,
        tags: newTags,
      });
    } catch (e) {}
  };

  return (
    <div className={styles.adminChatContainer}>
      {/* ========================================================
          LEFT COLUMN: CONVERSATION LIST & INBOX
      ======================================================== */}
      <div className={styles.sidebarCol}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitleRow}>
            <div className={styles.sidebarTitle}>
              <FiMessageSquare /> Tin Nhắn CSKH
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setShowBotModal(true)}
                style={{
                  background: botConfig.enabled ? '#0284c7' : '#334155',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Cấu hình AI Bot tư vấn tự động"
              >
                🤖 {botConfig.enabled ? 'AI: Bật' : 'AI: Tắt'}
              </button>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} /> Realtime
              </div>
            </div>
          </div>

          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên, SĐT, mã khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === 'unread' ? styles.activeTab : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            Chưa đọc
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === 'has_phone' ? styles.activeTab : ''}`}
            onClick={() => setActiveFilter('has_phone')}
          >
            Có SĐT
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === 'resolved' ? styles.activeTab : ''}`}
            onClick={() => setActiveFilter('resolved')}
          >
            Đã xong
          </button>
        </div>

        {/* Conversation List */}
        <div className={styles.convList}>
          {conversations.length === 0 ? (
            <div className={styles.emptyInbox}>
              <p>Chưa có hội thoại nào</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.conversationId === activeConvId;
              const name = conv.customerName || 'Khách hàng';
              const initial = name.substring(0, 2).toUpperCase();
              const unread = conv.unreadCountAdmin || 0;
              const lastMsgText = conv.lastMessage?.text || (conv.lastMessage?.image ? '[Hình ảnh]' : 'Bắt đầu cuộc trò chuyện');
              const timeStr = conv.lastActive
                ? new Date(conv.lastActive).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={conv.conversationId}
                  className={`${styles.convItem} ${isActive ? styles.activeConv : ''}`}
                  onClick={() => setActiveConvId(conv.conversationId)}
                >
                  <div className={styles.convAvatar}>
                    {initial}
                    <span className={styles.convAvatarBadge} />
                  </div>

                  <div className={styles.convContent}>
                    <div className={styles.convNameRow}>
                      <span className={styles.convName}>
                        {name} {conv.customerPhone ? `(${conv.customerPhone})` : ''}
                      </span>
                      <span className={styles.convTime}>{timeStr}</span>
                    </div>

                    <div className={styles.convLastMsgRow}>
                      <span className={styles.convLastMsg}>{lastMsgText}</span>
                      {unread > 0 && <span className={styles.convUnreadBadge}>{unread}</span>}
                    </div>

                    {conv.tags && conv.tags.length > 0 && (
                      <div className={styles.convTagsRow}>
                        {conv.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className={styles.miniTag}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          MIDDLE COLUMN: 1V1 CHAT STREAM
      ======================================================== */}
      <div className={styles.chatStreamCol}>
        {activeConvId && currentConv ? (
          <>
            {/* Stream Header */}
            <div className={styles.chatStreamHeader}>
              <div className={styles.chatUserMeta}>
                <div>
                  <div className={styles.chatUserName}>
                    {currentConv.customerName || 'Khách hàng'}
                    {currentConv.customerPhone && (
                      <span className={styles.chatUserPhone}>📞 {currentConv.customerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  className={styles.chatUserStatusSelect}
                  value={currentConv.status || 'unread'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="unread">🔴 Chưa xử lý</option>
                  <option value="active">🟡 Đang tư vấn</option>
                  <option value="has_phone">🟢 Có số điện thoại</option>
                  <option value="resolved">⚪ Đã giải quyết</option>
                </select>

                <button
                  type="button"
                  className={styles.attachActionBtn}
                  title="Tải lại tin nhắn"
                  onClick={() => fetchActiveMessages(activeConvId)}
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>

            {/* Inquiring Product Strip */}
            {currentConv.productContext && (
              <div className={styles.pinnedProductStrip}>
                <img
                  src={currentConv.productContext.image || '/file.svg'}
                  alt={currentConv.productContext.name}
                  className={styles.pinnedProductThumb}
                />
                <span className={styles.pinnedProductTitle}>
                  Khách đang quan tâm: <strong>{currentConv.productContext.name}</strong>
                </span>
                <span className={styles.pinnedProductPrice}>
                  {formatPrice(currentConv.productContext.price)}
                </span>
                <a
                  href={`/product/${currentConv.productContext.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.crmActionBtn}
                  style={{ padding: '4px 8px', flex: 'none' }}
                >
                  Xem <FiExternalLink />
                </a>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className={styles.messagesScroll}>
              {messages.map((msg, idx) => {
                const isAdmin = msg.sender === 'admin';
                const timeStr = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Vừa xong';

                const isBot = msg.sender === 'bot';

                if (isBot) {
                  return (
                    <div key={msg._id || idx} className={styles.adminMsgRow}>
                      <div className={styles.adminBubble} style={{ background: '#082f49', borderColor: '#0284c7', borderWidth: 1, borderStyle: 'solid' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>🤖 AI Trợ Lý Tự Động ({msg.senderName || 'Bot'}):</span>
                        </div>
                        {msg.text && <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>}
                        <span className={styles.msgTime}>{timeStr} • Trả lời tự động</span>
                      </div>
                    </div>
                  );
                }

                if (isAdmin) {
                  return (
                    <div key={msg._id || idx} className={styles.adminMsgRow}>
                      <div className={styles.adminBubble}>
                        {msg.text && <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Ảnh đính kèm"
                            className={styles.attachedImg}
                            onClick={() => window.open(msg.image, '_blank')}
                          />
                        )}
                        <span className={styles.msgTime}>{timeStr} • Đã gửi (Admin)</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg._id || idx} className={styles.userMsgRow}>
                    <div className={styles.userBubble}>
                      {msg.product && (
                        <div className={styles.msgProductAttachment}>
                          <img
                            src={msg.product.image || '/file.svg'}
                            alt={msg.product.name}
                            className={styles.msgProductImg}
                          />
                          <div className={styles.msgProductDetails}>
                            <span className={styles.msgProductTitle}>{msg.product.name}</span>
                            <span className={styles.msgProductPrice}>
                              {formatPrice(msg.product.price)}
                            </span>
                          </div>
                        </div>
                      )}

                      {msg.text && <div>{msg.text}</div>}
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Ảnh đính kèm"
                          className={styles.attachedImg}
                          onClick={() => window.open(msg.image, '_blank')}
                        />
                      )}
                      <span className={styles.msgTime}>{timeStr}</span>
                    </div>
                  </div>
                );
              })}

              {isUserTyping && (
                <div className={styles.typingIndicator}>
                  <span>Khách hàng đang soạn tin nhắn...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Canned Responses Toolbar */}
            <div className={styles.cannedResponsesBar}>
              <span className={styles.cannedLabel}>⚡ Trả lời nhanh:</span>
              {CANNED_RESPONSES.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.cannedBtn}
                  onClick={() => handleSendMessage(res)}
                >
                  {res}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className={styles.chatInputFooter}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                className={styles.attachActionBtn}
                title="Đính kèm hình ảnh"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <FiImage />
              </button>

              <input
                type="text"
                className={styles.chatInputField}
                placeholder={isUploading ? 'Đang gửi ảnh...' : 'Nhập câu trả lời tư vấn... (Enter để gửi)'}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <button
                type="button"
                className={styles.sendActionBtn}
                disabled={!inputMsg.trim() || isSending || isUploading}
                onClick={() => handleSendMessage()}
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyInbox} style={{ margin: 'auto' }}>
            <FiMessageSquare size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3>Chọn một hội thoại để bắt đầu chat</h3>
            <p>Tin nhắn từ khách hàng sẽ hiển thị thời gian thực tại đây.</p>
          </div>
        )}
      </div>

      {/* ========================================================
          RIGHT COLUMN: CUSTOMER CRM & PROFILE DRAWER
      ======================================================== */}
      {activeConvId && currentConv && (
        <div className={styles.crmCol}>
          <div className={styles.crmHeader}>
            <FiUser /> Hồ Sơ & CRM Khách Hàng
          </div>

          {/* Quick Info Card */}
          <div className={styles.crmCard}>
            <div className={styles.crmFieldRow}>
              <span className={styles.crmFieldLabel}>Mã định danh (Guest ID):</span>
              <div className={styles.crmFieldValue} style={{ fontSize: 11, color: '#94a3b8' }}>
                <span>{currentConv.conversationId}</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(currentConv.conversationId);
                    toast.success('Đã copy mã hội thoại');
                  }}
                >
                  <FiCopy />
                </button>
              </div>
            </div>

            <div className={styles.crmFieldRow}>
              <span className={styles.crmFieldLabel}>Tên khách hàng:</span>
              <input
                type="text"
                className={styles.crmInput}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className={styles.crmFieldRow}>
              <span className={styles.crmFieldLabel}>Số điện thoại / Zalo:</span>
              <input
                type="tel"
                className={styles.crmInput}
                placeholder="Chưa có SĐT"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>

            {editPhone && (
              <div className={styles.crmBtnGroup}>
                <a href={`tel:${editPhone}`} className={styles.crmActionBtn}>
                  <FiPhone /> Gọi điện
                </a>
                <a
                  href={`https://zalo.me/${editPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.crmActionBtn}
                >
                  💬 Chat Zalo
                </a>
              </div>
            )}

            <button
              type="button"
              className={styles.saveNotesBtn}
              style={{ width: '100%', marginTop: 6 }}
              onClick={handleSaveCrmInfo}
            >
              Lưu thông tin khách
            </button>
          </div>

          {/* Tags Section */}
          <div className={styles.crmSection}>
            <span className={styles.crmSectionTitle}>
              <FiTag /> Nhãn Phân Loại (Tags)
            </span>

            <div className={styles.tagChipsWrap}>
              {currentConv.tags && currentConv.tags.length > 0 ? (
                currentConv.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tagChip}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemoveBtn}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 11, color: '#64748b' }}>Chưa gắn tag nào</span>
              )}
            </div>

            <div className={styles.quickAddTags}>
              {PRESET_TAGS.map((pt, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.quickTagBtn}
                  onClick={() => handleAddTag(pt)}
                >
                  + {pt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag(newTagInput);
              }}
              style={{ display: 'flex', gap: 6, marginTop: 4 }}
            >
              <input
                type="text"
                placeholder="Thêm tag khác..."
                className={styles.crmInput}
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
              />
              <button type="submit" className={styles.saveNotesBtn} style={{ padding: '6px 12px' }}>
                Thêm
              </button>
            </form>
          </div>

          {/* Admin Internal Notes */}
          <div className={styles.crmSection}>
            <span className={styles.crmSectionTitle}>📝 Ghi Chú Nội Bộ</span>
            <textarea
              className={styles.notesTextarea}
              placeholder="Ghi chú về sở thích, địa chỉ hoặc yêu cầu đặc biệt của khách..."
              value={adminNotesInput}
              onChange={(e) => setAdminNotesInput(e.target.value)}
            />
            <button
              type="button"
              className={styles.saveNotesBtn}
              onClick={handleSaveCrmInfo}
            >
              Lưu ghi chú
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          AI CHATBOT CONFIGURATION MODAL
      ======================================================== */}
      {showBotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowBotModal(false)}
        >
          <div
            style={{
              backgroundColor: '#131826',
              border: '1px solid #232838',
              borderRadius: 16,
              width: '100%',
              maxWidth: 520,
              padding: 24,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                  Cấu Hình AI Chatbot 24/7
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBotModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Enable / Disable Switch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#090a0f',
                  borderRadius: 10,
                  border: '1px solid #232838',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                    Tự động trả lời tin nhắn (AI Auto-Reply)
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Tự động tư vấn size, tra cứu đơn hàng #ST... và giải đáp chính sách 24/7
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={botConfig.enabled}
                  onChange={(e) => setBotConfig({ ...botConfig, enabled: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              {/* Bot Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                  Tên hiển thị của AI Bot:
                </label>
                <input
                  type="text"
                  value={botConfig.botName}
                  onChange={(e) => setBotConfig({ ...botConfig, botName: e.target.value })}
                  placeholder="Ví dụ: AI Trợ Lý ShopBig"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #232838',
                    backgroundColor: '#090a0f',
                    color: '#f8fafc',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                  Lời chào mặc định (Welcome Message):
                </label>
                <textarea
                  rows={3}
                  value={botConfig.welcomeMessage}
                  onChange={(e) => setBotConfig({ ...botConfig, welcomeMessage: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #232838',
                    backgroundColor: '#090a0f',
                    color: '#f8fafc',
                    fontSize: 12,
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Gemini API Key */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Google Gemini API Key (Tùy chọn nâng cao):
                </label>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                  Hệ thống mặc định dùng Động cơ Local NLP thông minh miễn phí. Nếu nhập API Key, Bot sẽ sử dụng Gemini 1.5 Flash.
                </div>
                <input
                  type="password"
                  value={botConfig.geminiApiKey}
                  onChange={(e) => setBotConfig({ ...botConfig, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #232838',
                    backgroundColor: '#090a0f',
                    color: '#f8fafc',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowBotModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  backgroundColor: '#1a1e2b',
                  color: '#94a3b8',
                  border: '1px solid #232838',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveBotConfig}
                disabled={isSavingBot}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isSavingBot ? 'not-allowed' : 'pointer',
                  opacity: isSavingBot ? 0.6 : 1,
                }}
              >
                {isSavingBot ? 'Đang lưu...' : 'Lưu Cấu Hình'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
