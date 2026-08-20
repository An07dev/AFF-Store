'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { RoutePoint } from '@/lib/shipping/unifiedTracker';
import { FiRefreshCw } from 'react-icons/fi';
import styles from './OrderTrackingMap.module.css';

interface OrderTrackingMapProps {
  routePoints: RoutePoint[];
  carrierName?: string;
  trackingCode?: string;
}

export default function OrderTrackingMap({
  routePoints,
  carrierName = 'Giao Hàng Tiết Kiệm',
  trackingCode,
}: OrderTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Dynamically inject Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Destroy previous map instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const defaultCenter: [number, number] = routePoints.length > 0
        ? [routePoints[0].lat, routePoints[0].lng]
        : [21.0285, 105.8542];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // CartoDB Voyager / OpenStreetMap Clean Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom DivIcons
      const createCustomIcon = (point: RoutePoint) => {
        let emoji = '📦';
        let color = '#3b82f6';

        if (point.type === 'origin') {
          emoji = '🏪';
          color = '#3b82f6';
        } else if (point.type === 'hub') {
          emoji = '🏢';
          color = '#f59e0b';
        } else if (point.type === 'station') {
          emoji = '🛵';
          color = '#a855f7';
        } else if (point.type === 'destination') {
          emoji = '🏠';
          color = '#10b981';
        }

        const isCurrent = point.status === 'current';

        const html = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: ${color};
            color: #fff;
            border-radius: 50%;
            font-size: 16px;
            border: 2px solid #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            ${emoji}
            ${isCurrent ? `
              <span style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid ${color};
                animation: mapPulse 1.5s infinite;
              "></span>
            ` : ''}
          </div>
        `;

        return L.divIcon({
          html,
          className: 'custom-leaflet-marker',
          iconSize: [36, 36],
          iconAnchor: [0, 0],
        });
      };

      const latLngs: [number, number][] = [];

      routePoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createCustomIcon(point),
        }).addTo(map);

        latLngs.push([point.lat, point.lng]);

        // Tooltip & Popup
        marker.bindPopup(`
          <div class="${styles.customPopup}">
            <div class="${styles.popupTitle}">${point.title}</div>
            <div class="${styles.popupDesc}">${point.desc}</div>
            <div class="${styles.popupTime}">⏰ ${point.time}</div>
          </div>
        `);
      });

      // Draw route Polyline
      if (latLngs.length > 1) {
        // Background Polyline
        L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 8',
        }).addTo(map);

        // Fit map bounds to show all markers
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routePoints]);

  return (
    <div className={styles.mapWrapper}>
      <style>{`
        @keyframes mapPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      <div ref={mapContainerRef} className={styles.mapContainer}>
        {!mapLoaded && (
          <div className={styles.mapLoading}>
            <FiRefreshCw className="animate-spin" size={20} />
            <span>Đang dựng bản đồ tuyến đường...</span>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className={styles.mapLegend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotOrigin}`}></span>
          <span>Kho Shop (Xuất phát)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotHub}`}></span>
          <span>Kho Tổng Trung Chuyển</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotStation}`}></span>
          <span>Bưu Cục Phát Hàng</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotDest}`}></span>
          <span>Địa Chỉ Người Nhận</span>
        </div>
      </div>
    </div>
  );
}
