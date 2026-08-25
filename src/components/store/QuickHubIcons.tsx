'use client';

import React from 'react';

// 1. FREESHIP 0Đ: 3D Express Delivery Truck
export function QuickIconFreeship() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Motion Speed Lines */}
      <path d="M3 10H8M2 15H6M3 20H7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      {/* Truck Body */}
      <rect x="7" y="7" width="14" height="15" rx="3" fill="#ffffff" />
      <rect x="8.5" y="8.5" width="11" height="12" rx="2" fill="url(#freeship_box)" />
      {/* 0Đ text on box */}
      <text x="14" y="17.5" fill="#ee4d2d" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        0Đ
      </text>
      {/* Truck Cabin */}
      <path d="M21 11H26.2C26.7 11 27.2 11.3 27.5 11.7L29.5 14.8C29.8 15.3 30 15.8 30 16.4V20C30 21.1 29.1 22 28 22H21V11Z" fill="#ffffff" />
      <path d="M22 12.5H25.5L28 16H22V12.5Z" fill="#ffedd5" />
      {/* Wheels */}
      <circle cx="12" cy="23" r="3.5" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="12" cy="23" r="1.2" fill="#f97316" />
      <circle cx="25" cy="23" r="3.5" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="25" cy="23" r="1.2" fill="#f97316" />
      <defs>
        <linearGradient id="freeship_box" x1="8.5" y1="8.5" x2="19.5" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#fed7aa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 2. FLASH SALE: 3D Golden Thunder with Energy Burst
export function QuickIconFlashSale() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Energy Sunburst */}
      <circle cx="16" cy="16" r="13" fill="url(#flash_burst)" fillOpacity="0.4" />
      {/* 3D Thunder Bolt */}
      <path
        d="M18.5 2.5L7 16.5H16L13.5 29.5L25 15.5H16L18.5 2.5Z"
        fill="url(#flash_bolt)"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
      />
      {/* Highlight Edge */}
      <path
        d="M18.5 2.5L7 16.5H16L14.8 23L23 15.5H16L18.5 2.5Z"
        fill="#ffffff"
        fillOpacity="0.45"
      />
      <defs>
        <radialGradient id="flash_burst" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) scale(13)">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flash_bolt" x1="7" y1="2.5" x2="25" y2="29.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#fffbeb" />
          <stop offset="1" stopColor="#fef08a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 3. BÁN CHẠY: 3D Fire Rocket Flame
export function QuickIconBestSeller() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fire Outer Flame */}
      <path
        d="M16 2C16 2 25 9.5 25 19C25 24.5 21 29 16 29C11 29 7 24.5 7 19C7 13 11.5 8 16 2Z"
        fill="url(#flame_outer)"
      />
      {/* Fire Mid Flame */}
      <path
        d="M16 9C16 9 22 14.5 22 20.5C22 24.5 19.3 27.5 16 27.5C12.7 27.5 10 24.5 10 20.5C10 16 13 12.5 16 9Z"
        fill="url(#flame_mid)"
      />
      {/* Fire Inner Core */}
      <path
        d="M16 16C16 16 19 19 19 22C19 24 17.7 26 16 26C14.3 26 13 24 13 22C13 19.5 14.8 18 16 16Z"
        fill="#ffffff"
      />
      {/* Sparkles */}
      <circle cx="8" cy="11" r="1.2" fill="#ffffff" />
      <circle cx="24" cy="13" r="1.5" fill="#ffffff" />
      <defs>
        <linearGradient id="flame_outer" x1="7" y1="2" x2="25" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#ffedd5" />
          <stop offset="1" stopColor="#fecaca" />
        </linearGradient>
        <linearGradient id="flame_mid" x1="10" y1="9" x2="22" y2="27.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#fed7aa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 4. SHOPEE MALL: 3D Royal Diamond Crown
export function QuickIconMall() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crown Shape */}
      <path
        d="M4 11L8.5 24H23.5L28 11L21 16L16 6L11 16L4 11Z"
        fill="url(#crown_grad)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Crown Base Rim */}
      <rect x="7" y="24" width="18" height="3.5" rx="1.75" fill="#ffffff" />
      <rect x="9" y="25" width="14" height="1.5" rx="0.75" fill="#f43f5e" />
      {/* Jewels on Tips */}
      <circle cx="4" cy="11" r="2.2" fill="#ffffff" stroke="#f43f5e" strokeWidth="1" />
      <circle cx="16" cy="6" r="2.8" fill="#ffffff" stroke="#f43f5e" strokeWidth="1" />
      <circle cx="28" cy="11" r="2.2" fill="#ffffff" stroke="#f43f5e" strokeWidth="1" />
      {/* Center Diamond */}
      <path d="M16 14L18 18L16 22L14 18L16 14Z" fill="#ffffff" />
      <defs>
        <linearGradient id="crown_grad" x1="4" y1="6" x2="28" y2="27.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#ffe4e6" />
          <stop offset="1" stopColor="#fecdd3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 5. GÌ CŨNG RẺ: 3D Lucky Golden Coin & Price Tag
export function QuickIconCheap() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Big 3D Coin */}
      <circle cx="16" cy="16" r="11" fill="url(#coin_front)" stroke="#ffffff" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="8.5" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
      {/* Currency Symbol: ₫ or $ */}
      <path
        d="M13.5 12C13.5 10.9 14.6 10 16 10C17.4 10 18.5 10.9 18.5 12C18.5 13.5 16 14.2 16 15.5M16 18.5V19M16 8V10M16 20V22"
        stroke="#065f46"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Dollar text bold overlay */}
      <text x="16" y="19" fill="#047857" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        $
      </text>
      {/* Sparkle Glare */}
      <path d="M22 8L23 10L25 11L23 12L22 14L21 12L19 11L21 10L22 8Z" fill="#ffffff" />
      <defs>
        <linearGradient id="coin_front" x1="5" y1="5" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#d1fae5" />
          <stop offset="1" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 6. DEAL SỐC: 3D Surprise Gift Box with Ribbon
export function QuickIconShockDeal() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gift Box Base */}
      <rect x="6" y="13" width="20" height="14" rx="3" fill="url(#gift_body)" />
      {/* Gift Lid */}
      <rect x="4" y="9" width="24" height="5.5" rx="2.5" fill="#ffffff" />
      {/* Vertical Ribbon */}
      <rect x="14" y="9" width="4" height="18" fill="#facc15" />
      {/* Horizontal Ribbon */}
      <rect x="6" y="18" width="20" height="3.5" fill="#facc15" fillOpacity="0.85" />
      {/* Ribbon Bow */}
      <path
        d="M16 9C14 5 9 5 10.5 8C11.5 10 16 9.5 16 9ZM16 9C18 5 23 5 21.5 8C20.5 10 16 9.5 16 9Z"
        fill="#fef08a"
        stroke="#eab308"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="9" r="1.8" fill="#ca8a04" />
      <defs>
        <linearGradient id="gift_body" x1="6" y1="13" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f3e8ff" />
          <stop offset="1" stopColor="#e9d5ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 7. TRA CỨU ĐƠN: 3D Package Box with GPS Pin & Radar
export function QuickIconTracking() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3D Isometric Cardboard Box */}
      <path d="M16 3L27 9V19L16 25L5 19V9L16 3Z" fill="url(#box_front)" />
      <path d="M16 3L27 9L16 15L5 9L16 3Z" fill="#ffffff" />
      <path d="M16 15L27 9V19L16 25V15Z" fill="#cffafe" />
      <path d="M16 15L5 9V19L16 25V15Z" fill="#a5f3fc" />
      {/* Box Seam Tape */}
      <path d="M16 3L16 15" stroke="#0891b2" strokeWidth="1.5" />
      <path d="M16 15L22 12" stroke="#0891b2" strokeWidth="1.5" />
      <path d="M16 15L10 12" stroke="#0891b2" strokeWidth="1.5" />
      {/* Location Pin Marker */}
      <path
        d="M23 16C23 14 25 12 27 12C29 12 31 14 31 16C31 19 27 24 27 24C27 24 23 19 23 16Z"
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <circle cx="27" cy="15.5" r="1.5" fill="#ffffff" />
      <defs>
        <linearGradient id="box_front" x1="5" y1="3" x2="27" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 8. TƯ VẤN SHOP: 3D AI Live Chat Bubble with Heart
export function QuickIconConsult() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main 3D Chat Bubble */}
      <path
        d="M5 7C5 4.8 6.8 3 9 3H23C25.2 3 27 4.8 27 7V17C27 19.2 25.2 21 23 21H14L8 26V21H9C6.8 21 5 19.2 5 17V7Z"
        fill="url(#chat_bubble)"
        filter="drop-shadow(0 2px 5px rgba(0,0,0,0.18))"
      />
      {/* 3 Interactive Dots or Heart */}
      <circle cx="11" cy="12" r="2" fill="#2563eb" />
      <circle cx="16" cy="12" r="2" fill="#2563eb" />
      <circle cx="21" cy="12" r="2" fill="#2563eb" />
      {/* Active Online Green Dot */}
      <circle cx="26" cy="6" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
      <defs>
        <linearGradient id="chat_bubble" x1="5" y1="3" x2="27" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#eff6ff" />
          <stop offset="1" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
    </svg>
  );
}
