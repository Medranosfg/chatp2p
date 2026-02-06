# 🧪 ChatP2P v8.0 - Testing Instructions

## Quick Start

The app is now ready to test. Follow these steps:

### 1. Open the App
- Open your browser and go to: **http://localhost:8000/index.html**
- You should see a modal with "👤 Nueva Identidad" (New Identity)
- The wallet address should appear in the green box below "💰 Tu Dirección Única:"

### 2. Create Your First User
- You should see a generated wallet address (starts with `0x`)
- Enter your name in the input field
- Click "Continuar" (Continue)
- You should be taken to the home screen

### 3. Test Features
- **View Wallet**: Click the ⚙️ settings button to see your wallet address
- **Copy Wallet**: Click the 📋 button to copy your wallet
- **New Chat**: Click the ➕ button to start a new chat with another wallet
- **Change Name**: Go to settings and click "👤 Cambiar Nombre"

### 4. Debug Console (if needed)
- Open: **http://localhost:8000/debug.html**
- This page has tools to test:
  - Wallet generation
  - LocalStorage
  - Firebase connection
  - DOM elements
  - Full app flow

## What Should Happen

✅ **On First Load:**
- Modal appears with "Generando dirección..." text
- After 1-2 seconds, a wallet address appears (0x...)
- You can enter your name and click Continue

✅ **After Creating User:**
- Home screen shows your wallet (shortened to 0x...)
- Settings show full wallet address
- User data is saved in Firebase under `users/{wallet}`

✅ **LocalStorage:**
- Your wallet is saved in browser localStorage
- Next time you open the app, it loads your existing wallet
- You can change your name but wallet stays the same

## Troubleshooting

If the wallet doesn't appear:
1. Open browser console (F12)
2. Check for any red error messages
3. Go to http://localhost:8000/debug.html and run tests
4. Check Firebase connection status

If user creation fails:
1. Check browser console for errors
2. Verify Firebase is connected (check debug page)
3. Try clearing localStorage and refreshing

## Files Modified

- `ChatP2P/app.js` - Main app logic (cleaned up, removed debug logs)
- `ChatP2P/app/src/main/assets/app.js` - Android version (same as web)
- `ChatP2P/index.html` - HTML structure (unchanged)
- `ChatP2P/styles.css` - Styling (unchanged)

## Next Steps

Once wallet generation and user creation work:
1. Test multi-user chat between two browser windows
2. Test message synchronization via Firebase
3. Test user management (change name, delete user)
