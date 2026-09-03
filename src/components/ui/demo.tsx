"use client";

import React from "react";
import { ImageCarouselHero, ImageCard } from "@/components/ui/ai-image-generator-hero";

export const heroAdminImages: ImageCard[] = [
  {
    id: "admin-dashboard",
    src: "/images/preview-admin-dashboard-v2.png",
    alt: "Tổng Quan Báo Cáo Kinh Doanh & Doanh Thu Realtime",
    rotation: -10,
  },
  {
    id: "admin-chat",
    src: "/images/preview-admin-chat-v2.png",
    alt: "Tin Nhắn CSKH & AI Trợ Lý Tự Động Chốt Đơn 24/7",
    rotation: -4,
  },
  {
    id: "admin-products",
    src: "/images/preview-admin-products-v2.png",
    alt: "Quản Lý Kho Hàng & Danh Sách 19+ Sản Phẩm",
    rotation: 3,
  },
  {
    id: "admin-orders",
    src: "/images/preview-admin-orders-v2.png",
    alt: "Quản Lý Đơn Hàng, Khách Hàng & Trạng Thái VietQR",
    rotation: 7,
  },
  {
    id: "admin-shipping",
    src: "/images/preview-admin-shipping-v2.png",
    alt: "Quản Lý Vận Chuyển & Đẩy Đơn GHN / GHTK / Viettel Post",
    rotation: -6,
  },
  {
    id: "admin-vietqr",
    src: "/images/preview-admin-vietqr-v2.png",
    alt: "Cổng Thanh Toán VietQR & SePay Webhook Tự Động",
    rotation: 4,
  },
  {
    id: "admin-theme",
    src: "/images/preview-admin-theme-v2.png",
    alt: "Cấu Hình Giao Diện & Bộ 7 Multi-Themes Live Preview",
    rotation: -8,
  },
  {
    id: "admin-marketing",
    src: "/images/preview-admin-marketing-v2.png",
    alt: "Báo Cáo Phễu Chuyển Đổi & Đo Lường Meta CAPI / TikTok Ads",
    rotation: 6,
  },
];

export const heroAdminFeatures = [
  {
    title: "⚡ Không Cần Mua Landing Page",
    description: "Tích hợp sẵn 100% Storefront chuẩn sàn TMĐT, Flash Sale FOMO chốt sale, Quick Checkout 1-chạm và bộ 7 Multi-Themes đổi màu realtime (Tiết kiệm ~2.500.000₫/năm tiền mua Ladipage).",
  },
  {
    title: "🏢 Không Cần Mua Phần Mềm CRM / POS",
    description: "Tự động quản lý kho hàng 19+ sản phẩm, quản lý đơn hàng, sở hữu 100% Database SĐT khách và trợ lý AI CSKH chốt đơn 24/7 (Tiết kiệm ~4.800.000₫/năm tiền mua Sapo, KiotViet, Pancake).",
  },
  {
    title: "💳 Cổng VietQR 1s & Đẩy Đơn Bưu Tá Tự Động",
    description: "Tích hợp sẵn thanh toán VietQR SePay khớp lệnh 1s tiền về thẳng tài khoản ngân hàng, bưu tá GHN/GHTK/VTP tự đến lấy hàng và đo lường chuẩn xác Meta CAPI & TikTok Events.",
  },
];

interface ImageCarouselHeroDemoProps {
  onCardClick?: (index: number) => void;
  onCtaClick?: () => void;
}

export function ImageCarouselHeroDemo({
  onCardClick,
  onCtaClick,
}: ImageCarouselHeroDemoProps) {
  return (
    <ImageCarouselHero
      title="Khám Phá Toàn Diện Hệ Thống Quản Trị ShopBig All-In-One"
      subtitle=""
      description=""
      ctaText="Trải Nghiệm Toàn Bộ Hệ Thống Demo Ngay"
      onCtaClick={onCtaClick || (() => {
        if (typeof window !== "undefined") {
          window.open("/admin/dashboard", "_blank");
        }
      })}
      images={heroAdminImages}
      features={heroAdminFeatures}
      onCardClick={onCardClick}
    />
  );
}

export default ImageCarouselHeroDemo;
