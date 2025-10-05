# PayPal QR Generator

Ứng dụng tạo QR code PayPal với timer 1 giờ, được xây dựng bằng React, Vite và TailwindCSS.

## Tính năng

- ✅ PayPal username cố định: `NamSunny197`
- ✅ Nhập số tiền để tạo URL PayPal
- ✅ Tạo QR code real-time
- ✅ Timer đếm ngược 1 giờ
- ✅ Progress bar với màu sắc thay đổi
- ✅ Copy URL vào clipboard
- ✅ Download QR code dưới dạng hình ảnh
- ✅ Responsive design
- ✅ Validation số tiền

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Cách sử dụng

1. Nhập số tiền muốn gửi (USD)
2. Click "Tạo QR" để tạo QR code
3. QR code sẽ hiển thị với timer 1 giờ
4. Sử dụng "Copy URL" hoặc "Download QR" để lưu

## Tech Stack

- React 18
- Vite
- TailwindCSS
- QRCode.js
- html2canvas

## URL Format

```
https://paypal.me/NamSunny197/{amount}
```

Ví dụ: `https://paypal.me/NamSunny197/100`
