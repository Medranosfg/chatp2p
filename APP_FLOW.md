# 📱 ChatP2P v8.0 - Complete App Flow

## 1️⃣ First Load (No User)

```
App Starts
    ↓
Check localStorage for wallet
    ↓
No wallet found
    ↓
Generate new wallet (0x...)
    ↓
Show "Nueva Identidad" modal
    ↓
Display wallet in green box
    ↓
User enters name
    ↓
Click "Continuar"
    ↓
Save wallet + name to localStorage
    ↓
Save user to Firebase: users/{wallet}
    ↓
Show Home Screen
```

## 2️⃣ Subsequent Loads (User Exists)

```
App Starts
    ↓
Check localStorage for wallet
    ↓
Wallet found
    ↓
Load userName from localStorage
    ↓
Show Home Screen directly
```

## 3️⃣ Home Screen

```
Header:
  - Logo + "ChatP2P" + wallet (0x...)
  - ➕ New Chat button
  - ⚙️ Settings button

Main Area:
  - List of chats (or "Sin conversaciones" if empty)
  - Each chat shows:
    - Contact wallet (shortened)
    - Last message preview
```

## 4️⃣ Settings Screen

```
Shows:
  - Your full wallet address
  - 📋 Copy button
  - 👤 Change Name button
  - 🗑️ Delete User button
  - Close button
```

## 5️⃣ New Chat

```
Modal appears:
  - Input field for contact wallet
  - Must start with "0x"
  - Cannot be your own wallet
  - Click "Iniciar" to start chat
```

## 6️⃣ Chat Screen

```
Header:
  - ← Back button
  - Contact wallet (shortened)
  - 🗑️ Delete chat button

Messages:
  - Your messages: green, right-aligned
  - Other messages: gray, left-aligned
  - Auto-scroll to latest

Input:
  - Text area for message
  - ➤ Send button
  - Enter to send (Shift+Enter for new line)
```

## 🔄 Data Flow

### LocalStorage
```
wallet: "0x..." (never changes)
userName: "User Name" (can change)
```

### Firebase Structure
```
users/
  {wallet}/
    name: "User Name"
    wallet: "0x..."
    createdAt: timestamp
    updatedAt: timestamp (optional)

chats/
  {wallet}/
    {contact_wallet}/
      lastMessage: "..."

messages/
  {wallet1}_{wallet2}/
    {timestamp}/
      from: "0x..."
      text: "..."
      timestamp: number
```

## ✅ Wallet Generation

Each wallet is:
- **Unique**: Generated using `crypto.getRandomValues()`
- **Permanent**: Saved in localStorage, never changes
- **Format**: `0x` + 40 hex characters (20 bytes)
- **Example**: `0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b`

## 🔐 User Management

### Create User
- Generate wallet
- Enter name
- Save both to localStorage and Firebase

### Change Name
- Keep same wallet
- Update name in localStorage and Firebase
- All chats stay the same

### Delete User
- Remove from Firebase
- Clear localStorage
- Generate new wallet on next load

## 💬 Messaging

### Send Message
- Create message object with: from, text, timestamp
- Save to Firebase: `messages/{key}/{id}`
- Update lastMessage in both users' chat lists
- Clear input field

### Receive Message
- Listen to Firebase for changes
- Display new messages in chat
- Auto-scroll to bottom

### Delete Chat
- Remove from both users' chat lists
- Remove all messages for that conversation
- Return to home screen

## 🎨 UI States

### Modal States
- `active` class = visible
- No `active` class = hidden

### Screen States
- `active` class = visible
- No `active` class = hidden

### Buttons
- Green (#2ecc71) for primary actions
- Gray for secondary actions
- Red for dangerous actions

## 🚀 Ready to Test!

Open: **http://localhost:8000/index.html**

Expected behavior:
1. Modal appears with wallet
2. Enter name and click Continue
3. Home screen shows
4. Settings show your wallet
5. Can create new chats
6. Can send/receive messages
