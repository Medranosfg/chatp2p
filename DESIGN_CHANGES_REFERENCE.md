# Design Changes Reference - Quick Lookup

## 🎨 Color Transformations

### Primary Colors
```css
/* BEFORE (Green Theme) */
--green-primary: #22c55e;
--green-dark: #16a34a;
--green-light: #4ade80;

/* AFTER (iOS Blue Theme) */
--ios-blue: #007AFF;
--ios-blue-dark: #0051D5;
--ios-blue-light: #5AC8FA;
--ios-blue-ultra-light: #E5F3FF;
```

### Background Colors
```css
/* BEFORE (Dark Theme) */
--bg-primary: #000000;
--bg-secondary: #1c1c1e;
--bg-tertiary: #2c2c2e;
--bg-elevated: #3a3a3c;

/* AFTER (Light Theme) */
--bg-primary: linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%);
--bg-secondary: #FFFFFF;
--bg-tertiary: #F8F9FA;
--bg-elevated: #FFFFFF;
```

### Text Colors
```css
/* BEFORE (Dark Theme) */
--text-primary: #ffffff;
--text-secondary: #8e8e93;
--text-muted: #636366;

/* AFTER (Light Theme) */
--text-primary: #000000;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--text-on-blue: #FFFFFF;
```

---

## 💬 Message Bubble Styles

### Sent Messages (Own)
```css
/* BEFORE */
.message.own .bubble {
    background: var(--green-primary); /* #22c55e */
    color: white;
    border-bottom-right-radius: 6px;
}

/* AFTER */
.message.own .bubble {
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 122, 255, 0.25);
}

/* NEW: Tail effect */
.message.own .bubble::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: -8px;
    width: 20px;
    height: 20px;
    background: var(--bubble-sent-end);
    border-bottom-left-radius: 16px;
}
```

### Received Messages (Other)
```css
/* BEFORE */
.message.other .bubble {
    background: var(--bg-tertiary); /* #2c2c2e */
    border-bottom-left-radius: 6px;
}

/* AFTER */
.message.other .bubble {
    background: #E9E9EB;
    color: #000000;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* NEW: Tail effect */
.message.other .bubble::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -8px;
    width: 20px;
    height: 20px;
    background: #E9E9EB;
    border-bottom-right-radius: 16px;
}
```

---

## 🔘 Button Styles

### Icon Buttons
```css
/* BEFORE */
.icon-btn {
    width: 44px;
    height: 44px;
    background: rgba(34, 197, 94, 0.12);
    color: var(--green-primary);
}
.icon-btn:active {
    transform: scale(0.92);
    background: var(--green-dark);
}

/* AFTER */
.icon-btn {
    width: 36px;
    height: 36px;
    background: #E5F3FF;
    color: #007AFF;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.icon-btn:active {
    transform: scale(0.88);
    background: #007AFF;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}
```

### Primary Buttons
```css
/* BEFORE */
.apple-btn-primary {
    background: var(--green-primary);
    color: white;
}

/* AFTER */
.apple-btn-primary {
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
    color: white;
    box-shadow: 0 2px 12px rgba(0, 122, 255, 0.3);
}
.apple-btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
}
```

### Send Button
```css
/* BEFORE */
.send-btn {
    width: 40px;
    height: 40px;
    background: var(--green-primary);
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

/* AFTER */
.send-btn {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
    box-shadow: 0 2px 12px rgba(0, 122, 255, 0.35);
}
.send-btn:active {
    transform: scale(0.88);
    box-shadow: 0 1px 6px rgba(0, 122, 255, 0.4);
}
```

---

## 📝 Input Field Styles

### Message Input
```css
/* BEFORE */
.message-input {
    background: var(--bg-tertiary); /* #2c2c2e */
    border: none;
    border-radius: 20px;
    color: var(--text-primary);
}
.message-input:focus {
    background: var(--bg-elevated);
}

/* AFTER */
.message-input {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    color: #000000;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.message-input:focus {
    background: #FFFFFF;
    border-color: #007AFF;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}
```

### Search Input (New Chat Modal)
```css
/* BEFORE */
.search-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
}
.search-input:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--green-primary);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
}

/* AFTER */
.search-input {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.06);
    color: #000000;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.search-input:focus {
    background: #FFFFFF;
    border-color: #007AFF;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}
```

---

## 🎴 Card Styles

### Chat List Items
```css
/* BEFORE */
.chat-item {
    background: var(--bg-secondary); /* #1c1c1e */
    border-radius: 16px;
}
.chat-name {
    color: var(--green-light); /* #4ade80 */
}

/* AFTER */
.chat-item {
    background: #FFFFFF;
    border-radius: 18px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
}
.chat-item:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.chat-name {
    color: #000000;
}
```

### Profile Card
```css
/* BEFORE */
.profile-card-premium {
    background: var(--bg-tertiary); /* #2c2c2e */
    border-radius: 24px;
}
.profile-bg-gradient {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
}

/* AFTER */
.profile-card-premium {
    background: #FFFFFF;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
}
.profile-bg-gradient {
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
}
```

---

## 🪟 Modal & Sheet Styles

### Modal Backdrop
```css
/* BEFORE */
.modal {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(20px);
}

/* AFTER */
.modal {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
}
```

### Bottom Sheets
```css
/* BEFORE */
.settings-sheet {
    background: var(--bg-secondary); /* #1c1c1e */
    border-radius: 20px 20px 0 0;
}

/* AFTER */
.settings-sheet {
    background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
    border-radius: 24px 24px 0 0;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.06);
}
```

### New Chat Sheet
```css
/* BEFORE */
.new-chat-sheet {
    background: linear-gradient(180deg, rgba(28, 28, 30, 0.95) 0%, rgba(28, 28, 30, 0.98) 100%);
    border-radius: 32px 32px 0 0;
}

/* AFTER */
.new-chat-sheet {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.98) 100%);
    backdrop-filter: blur(40px);
    border-radius: 32px 32px 0 0;
    box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.12);
}
```

---

## 🎭 Animation Changes

### Message Animation
```css
/* BEFORE */
.message {
    opacity: 0;
    transform: translateY(12px);
    animation: messageIn 0.3s ease forwards;
}
@keyframes messageIn {
    to { opacity: 1; transform: translateY(0); }
}

/* AFTER */
.message {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    animation: messageBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes messageBounceIn {
    to { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Button Press Animation
```css
/* BEFORE */
.icon-btn:active {
    transform: scale(0.92);
}

/* AFTER */
.icon-btn:active {
    transform: scale(0.88);
    transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}
```

### Modal Slide Animation
```css
/* BEFORE */
@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

/* AFTER */
@keyframes slideUp {
    from { transform: translateY(100%); opacity: 0.8; }
    to { transform: translateY(0); opacity: 1; }
}
```

---

## 🎨 Glassmorphism Implementation

### Header
```css
.header-chat {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
```

### Input Area
```css
.input-area {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.04);
}
```

### Sheet Header
```css
.sheet-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
```

---

## 📏 Spacing & Sizing Changes

### Icon Buttons
- **Before**: 44px × 44px
- **After**: 36px × 36px

### Send Button
- **Before**: 40px × 40px
- **After**: 34px × 34px

### Media Buttons
- **Before**: 36px × 36px
- **After**: 34px × 34px

### Chat Avatar
- **Before**: 48px × 48px
- **After**: 52px × 52px

### Border Radius
- **Before**: 16px (cards), 20px (modals)
- **After**: 18px (cards), 24px (modals), 32px (sheets)

### Message Gap
- **Before**: 10px
- **After**: 3px

---

## 🎯 Typography Changes

### Font Sizes
```css
/* Headers */
--before: 20-22px
--after: 22-28px

/* Body */
--before: 15-16px
--after: 17px

/* Secondary */
--before: 13-14px
--after: 13-15px
```

### Letter Spacing
```css
/* All text now has refined letter-spacing */
letter-spacing: -0.01em; /* Body text */
letter-spacing: -0.02em; /* Headers */
```

### Line Heights
```css
/* Messages */
--before: 1.4
--after: 1.35

/* Body text */
--before: 1.5-1.6
--after: 1.5
```

---

## 🌈 Shadow System

### Before (Minimal)
```css
/* Only basic shadows */
box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
```

### After (Layered System)
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.12);
--shadow-bubble: 0 2px 8px rgba(0, 0, 0, 0.06);

/* Blue shadows for blue elements */
box-shadow: 0 2px 12px rgba(0, 122, 255, 0.25);
```

---

## 🎪 Special Effects

### Avatar Ring Animation
```css
.avatar-ring {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(0, 122, 255, 0.4);
    animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
}
```

### Status Dot Pulse
```css
.status-dot-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #007AFF;
    animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
    }
    50% {
        opacity: 0.8;
        box-shadow: 0 0 0 6px rgba(0, 122, 255, 0);
    }
}
```

### Button Glossy Overlay
```css
.liquid-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
    pointer-events: none;
}
```

---

## 🔄 Quick Reference: Color Replacements

| Element | Before | After |
|---------|--------|-------|
| Primary Action | #22c55e | #007AFF |
| Sent Bubble | #22c55e | #007AFF → #0051D5 |
| Received Bubble | #2c2c2e | #E9E9EB |
| Background | #000000 | #FAFAFA → #FFFFFF |
| Text | #ffffff | #000000 |
| Secondary Text | #8e8e93 | #6B7280 |
| Avatar | #22c55e → #16a34a | #007AFF → #0051D5 |
| Status Dot | #22c55e | #34C759 |

---

This reference document provides a quick lookup for all major design changes in the iOS 26 transformation! 🎨
