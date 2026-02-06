# 👀 What You Should See

## Step 1: Open the App
Go to: **http://localhost:8000/index.html**

You should see:
- Black background
- Modal dialog in center
- Title: "👤 Nueva Identidad"
- Text: "💰 Tu Dirección Única:"
- Green box with wallet address (0x...)
- Input field: "Ingresa tu nombre de usuario"
- Green button: "Continuar"

## Step 2: Wallet Address
The wallet should look like:
```
0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
```

It's a unique address generated just for you.

## Step 3: Enter Your Name
- Click the input field
- Type your name (e.g., "Juan")
- Click "Continuar"

## Step 4: Home Screen
After clicking Continue, you should see:
- Header with logo and "ChatP2P"
- Your wallet shortened (0x1a2b...)
- Empty chat list with "💬 Sin conversaciones"
- Two buttons: ➕ (new chat) and ⚙️ (settings)

## Step 5: Check Settings
- Click ⚙️ button
- You should see:
  - Your full wallet address
  - 📋 Copy button
  - 👤 Change Name button
  - 🗑️ Delete User button

## Step 6: Copy Wallet
- Click 📋 button
- You should see: "✅ Copiada" (Copied)
- Your wallet is now in clipboard

## Step 7: Refresh Page
- Press F5 or Cmd+R
- The app should load directly to home screen
- Your wallet and name should be remembered

## If Something's Wrong

**Wallet not showing?**
- Wait 2 seconds for it to generate
- Check browser console (F12) for errors
- Try http://localhost:8000/debug.html

**Can't click Continue?**
- Make sure you entered a name
- Check browser console for errors

**Home screen doesn't appear?**
- Check browser console (F12)
- Try clearing localStorage: F12 → Application → Clear Storage

**Firebase not working?**
- Go to http://localhost:8000/debug.html
- Click "Test Firebase"
- Check if data appears in Firebase console

## Success Indicators

✅ Wallet appears in modal
✅ Can enter name
✅ Home screen loads
✅ Settings show wallet
✅ Copy button works
✅ Page refresh remembers user
✅ No red errors in console

If all these work, the app is functioning correctly!
