# Debug Firebase Message Delivery

## Quick Start

1. **Open the app**: http://localhost:8000
2. **Open Developer Tools**: Press F12
3. **Go to Console tab**
4. **Send a message** and watch the console for errors

## What to Look For

### Success Scenario
```
✅ Firebase connected
✅ Mensaje guardado en Firebase
✅ Chat actualizado en Firebase
✅ Chat remoto actualizado en Firebase
✅ Mensaje enviado: [your message]
```

### Error Scenario
```
❌ Error guardando mensaje en Firebase: PERMISSION_DENIED
📍 Ruta: messages/0x...
📍 Datos: {from: "0x...", text: "...", timestamp: ...}
```

## Common Errors and Solutions

### Error: PERMISSION_DENIED
**Cause**: Firebase security rules don't allow writes
**Solution**: 
1. Go to https://console.firebase.google.com
2. Select "p2pchat-60bd1" project
3. Go to Realtime Database → Rules
4. Change rules to:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. Click "Publish"
6. Refresh the app and try again

### Error: NETWORK_ERROR
**Cause**: Can't reach Firebase servers
**Solution**:
1. Check internet connection
2. Check if Firebase SDK loaded (look for Firebase scripts in Network tab)
3. Try the firebase-test.html page

### Error: Firebase not initialized
**Cause**: Firebase SDK didn't load
**Solution**:
1. Check browser console for script loading errors
2. Check Network tab for failed requests to gstatic.com
3. Try refreshing the page

## Step-by-Step Debug Process

### Step 1: Verify Firebase Connection
In browser console, run:
```javascript
firebase.database().ref('.info/connected').on('value', snap => {
  console.log('Connected:', snap.val());
});
```

Should show: `Connected: true`

### Step 2: Test Write Permission
In browser console, run:
```javascript
firebase.database().ref('test/hello').set({msg: 'test'})
  .then(() => console.log('✅ Write OK'))
  .catch(err => console.error('❌ Write failed:', err.code));
```

Should show: `✅ Write OK`

### Step 3: Test Read Permission
In browser console, run:
```javascript
firebase.database().ref('test/hello').on('value', snap => {
  console.log('Data:', snap.val());
});
```

Should show: `Data: {msg: "test"}`

### Step 4: Check Message Path
When sending a message, check console for:
```
📍 Ruta: messages/0x...wallet1_0x...wallet2/1234567890
```

This is the path where the message is being written.

### Step 5: Check Firebase Console
1. Go to https://console.firebase.google.com
2. Select "p2pchat-60bd1"
3. Go to Realtime Database → Data
4. Look for `/messages/` and `/chats/` entries
5. Verify data structure matches what app is writing

## Message Structure

The app writes messages like this:

```
/messages/{key}/{timestamp}
  from: "0x742d35Cc6634C0532925a3b844Bc9e7595f42e1"
  text: "Hello"
  timestamp: 1234567890

/chats/{wallet}/{contact}
  lastMessage: "Hello"
  lastMessageTime: 1234567890
```

Where `{key}` is the sorted wallet addresses: `0x...wallet1_0x...wallet2`

## Real-Time Sync Test

1. Open app in **two browser windows** (or tabs)
2. Create user in each window
3. Create chat between them
4. In Window 1, send message "Hello"
5. In Window 2, watch console for:
   ```
   📨 Mensajes de Firebase: 1
   ```
6. Message should appear in Window 2 chat

## If Messages Still Don't Arrive

1. **Check Firebase Rules** - Most likely cause
2. **Check Console Errors** - Look for PERMISSION_DENIED
3. **Check Network Tab** - Verify Firebase requests succeed
4. **Check Firebase Console** - Verify data is being written
5. **Try firebase-test.html** - Isolate the issue

## Files to Check

- `ChatP2P/index.html` - Firebase initialization
- `ChatP2P/app.js` - Message sending logic
- `ChatP2P/firebase-test.html` - Diagnostic tool
- Firebase Console - Rules and data

## Contact Firebase Support

If you've verified:
- ✅ Firebase rules allow read/write
- ✅ firebase-test.html works
- ✅ Console shows no errors
- ✅ Data appears in Firebase Console

Then the issue might be with the Firebase project itself. Check:
1. Project is active (not deleted)
2. Billing is enabled (if required)
3. Database is in the correct region
