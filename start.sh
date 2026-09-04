#!/bin/bash

echo "==================================================================="
echo "              🛍️  SHOPBIG E-COMMERCE PLATFORM 🛍️"
echo "==================================================================="
echo " - Cơ sở dữ liệu: Nhúng tự động (Tự lưu tại ./data/db)"
echo " - Tài khoản Admin: admin@shopbig.vn"
echo " - Mật khẩu: admin123"
echo "==================================================================="
echo ""
echo "[1/2] Đang khởi động hệ thống và máy chủ tại http://localhost:3000..."

# Mở trình duyệt sau 3 giây
(sleep 3 && (which xdg-open > /dev/null && xdg-open http://localhost:3000 || which open > /dev/null && open http://localhost:3000)) &

npm run dev
