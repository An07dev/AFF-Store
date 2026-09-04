@echo off
chcp 65001 >nul
title ShopBig - Hệ Thống Bán Hàng Trực Tuyến
color 0B

echo ===================================================================
echo               🛍️  SHOPBIG E-COMMERCE PLATFORM 🛍️
echo ===================================================================
echo  - Cơ sở dữ liệu: Nhúng tự động (Tự lưu tại ./data/db)
echo  - Tài khoản Admin: admin@shopbig.vn
echo  - Mật khẩu: admin123
echo ===================================================================
echo.
echo [1/2] Đang khởi động hệ thống và máy chủ...

:: Mở trình duyệt sau 3 giây khi server sẵn sàng
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo [2/2] Máy chủ đang chạy tại: http://localhost:3000
echo Nhấn Ctrl + C nếu muốn dừng máy chủ.
echo.

npm run dev
pause
