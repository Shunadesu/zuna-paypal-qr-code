# PayPal QR Generator

A PayPal QR code generator application with 1-hour timer, built with React, Vite, and TailwindCSS.

## Features

- ✅ Fixed PayPal username: `NamSunny197`
- ✅ Enter amount to generate PayPal URL
- ✅ Real-time QR code generation
- ✅ 1-hour countdown timer
- ✅ Progress bar with color changes
- ✅ Copy URL to clipboard
- ✅ Download QR code as image
- ✅ Responsive design
- ✅ Amount validation

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Enter the amount you want to send (USD)
2. Click "Generate QR" to create QR code
3. QR code will display with 1-hour timer
4. Use "Copy URL" or "Download QR" to save

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

Example: `https://paypal.me/NamSunny197/100`
