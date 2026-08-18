'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiSend,
  FiImage,
  FiPhoneCall,
  FiSmile,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './page.module.css';

interface Message {
  id: string;
  sender: 'shop' | 'user';
  text: string;
  time: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const shopName = theme?.pageTitles?.logoText || 'ShopTik Official';
  const avatarInitials = shopName ? shopName.substring(0, 2).toUpperCase() : 'ST';

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'shop',
      text: `👋 Chào bạn! Cảm ơn bạn đã ghé thăm ${shopName}. Shop có thể hỗ trợ gì cho bạn về sản phẩm hoặc đơn hàng hôm nay?`,
      time: 'Vừa xong',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');

    // Simulate smart automated response
    setTimeout(() => {
      let replyText = 'Cảm ơn bạn đã nhắn tin! Nhân viên tư vấn của Shop sẽ phản hồi bạn trong ít phút nhé.';
      const lower = text.toLowerCase();

      if (lower.includes('size') || lower.includes('chọn size')) {
        replyText = '👕 Bảng size chuẩn Shop:\n• Size M: 45 - 56kg (< 1m68)\n• Size L: 57 - 67kg (1m65 - 1m75)\n• Size XL: 68 - 78kg (1m70 - 1m80)\n• Size XXL: 79 - 88kg (> 1m75)\nBạn cần tư vấn cho chiều cao & cân nặng bao nhiêu ạ?';
      } else if (lower.includes('vận chuyển') || lower.includes('giao hàng') || lower.includes('đơn hàng')) {
        replyText = '🚚 Shop hỗ trợ giao hàng hỏa tốc qua GHN, GHTK, Viettel Post:\n• Nội thành: 1 - 2 ngày\n• Ngoại thành: 2 - 4 ngày\nĐơn hàng được kiểm tra hàng trước khi thanh toán bạn nhé!';
      } else if (lower.includes('đổi trả')) {
        replyText = '🔄 Chính sách đổi trả:\n• Đổi size/mẫu miễn phí trong vòng 7 ngày kể từ khi nhận hàng\n• Hàng nguyên tem mác, chưa qua sử dụng bạn nhé!';
      }

      const shopReply: Message = {
        id: `s_${Date.now()}`,
        sender: 'shop',
        text: replyText,
        time: 'Vừa xong',
      };
      setMessages((prev) => [...prev, shopReply]);
    }, 600);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
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
              <span className={styles.onlineBadge} />
            </div>
            <span className={styles.statusText}>Phản hồi trong vài phút</span>
          </div>
        </div>

        <a
          href="tel:19006868"
          className={styles.hotlineBtn}
          onClick={(e) => {
            e.preventDefault();
            toast('Tổng đài hỗ trợ 24/7: 1900 6868', { icon: '📞' });
          }}
        >
          <FiPhoneCall size={12} />
          <span>Hotline</span>
        </a>
      </nav>

      {/* ===== CHAT MESSAGES SCROLL AREA ===== */}
      <div className={styles.chatArea}>
        <div className={styles.timeDivider}>Hôm nay</div>

        {messages.map((msg) => {
          if (msg.sender === 'shop') {
            return (
              <div key={msg.id} className={styles.shopMsgRow}>
                <div className={styles.shopAvatar}>{avatarInitials}</div>
                <div className={styles.shopBubble}>
                  {msg.text.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className={styles.userMsgRow}>
              <div className={styles.userBubble}>
                {msg.text.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Quick Suggestion Chips (show if only initial message) */}
        {messages.length <= 2 && (
          <div className={styles.quickChipsWrap}>
            <button
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Tư vấn chọn size chuẩn')}
            >
              👕 Tư vấn chọn size áo / quần
            </button>
            <button
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Thời gian giao hàng bao lâu?')}
            >
              🚚 Thời gian và phí giao hàng
            </button>
            <button
              className={styles.quickChip}
              onClick={() => handleQuickPrompt('Chính sách đổi trả hàng như thế nào?')}
            >
              🔄 Chính sách đổi trả sản phẩm
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ===== FIXED BOTTOM INPUT BAR ===== */}
      <div className={styles.inputBar}>
        <button
          className={styles.attachBtn}
          onClick={() => toast('Tính năng gửi ảnh đang được hỗ trợ', { icon: '📷' })}
          aria-label="Gửi ảnh"
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
            placeholder="Nhập tin nhắn với shop..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />
          <button type="submit" className={styles.sendBtn} aria-label="Gửi tin nhắn">
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}
