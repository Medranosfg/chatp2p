# Voice Recording Fix - iOS

## Problem
The user reported: "esta listo el tiempo, el detalle ahora es que no puedo detener ni enviar" (the timer is ready, but now the issue is I can't stop or send).

The issue was that when recording stopped in iOS, the voice note was automatically sent without giving the user control. The user wanted to:
1. Start recording (press mic button)
2. Stop recording (press mic button again) - but NOT send yet
3. Send the recording (press send button)

## Solution

### Changes Made

#### 1. iOS Swift Code (`ios/ChatP2P/ViewController.swift`)
- Modified `stopNativeRecording()` to call `saveRecordedVoice()` instead of `sendVoiceNoteFromIOS()`
- The audio is now saved in JavaScript variables instead of being sent immediately
- User has control over when to send the voice note

**Before:**
```swift
let js = "window.onVoiceRecordingStopped && window.onVoiceRecordingStopped(); window.hideVoiceTimer && window.hideVoiceTimer(); window.sendVoiceNoteFromIOS && window.sendVoiceNoteFromIOS('\(dataURL)', \(duration))"
```

**After:**
```swift
let js = "window.onVoiceRecordingStopped && window.onVoiceRecordingStopped(); window.hideVoiceTimer && window.hideVoiceTimer(); window.saveRecordedVoice && window.saveRecordedVoice('\(dataURL)', \(duration));"
```

#### 2. JavaScript Code (all app.js files)
Added three new features:

**a) Global variables to store recorded audio:**
```javascript
window.recordedVoiceData = null;
window.recordedVoiceDuration = 0;
```

**b) New `saveRecordedVoice()` function:**
```javascript
window.saveRecordedVoice = function(audioDataURL, duration) {
    console.log('🎤 Guardando audio grabado, duración:', duration);
    window.recordedVoiceData = audioDataURL;
    window.recordedVoiceDuration = duration;
    
    // Mostrar indicador de audio listo para enviar
    const inputField = document.getElementById('messageInput');
    if (inputField) {
        inputField.placeholder = `🎤 Audio listo (${safeFormatTime(duration)}) - Presiona enviar`;
        inputField.style.background = 'rgba(34, 197, 94, 0.1)';
    }
};
```

**c) Modified `sendMessage()` function:**
```javascript
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    // Verificar si hay un audio grabado pendiente de enviar
    if (window.recordedVoiceData && window.recordedVoiceDuration) {
        console.log('🎤 Enviando audio grabado');
        sendVoiceNoteFromData(window.recordedVoiceData, window.recordedVoiceDuration);
        
        // Limpiar datos de audio
        window.recordedVoiceData = null;
        window.recordedVoiceDuration = 0;
        
        // Restaurar placeholder
        input.placeholder = 'Mensaje';
        input.style.background = '';
        
        return;
    }
    
    // ... rest of the function
}
```

### Files Modified
1. ✅ `ios/ChatP2P/ViewController.swift`
2. ✅ `ios/ChatP2P/www/app.js`
3. ✅ `app/src/main/assets/app.js`
4. ✅ `src/main/assets/app.js`
5. ✅ `app.js` (root)

## How It Works Now

### Recording Flow:
1. **User presses mic button** → `startVoiceNote()` → sends `startVoiceRecording` to Swift
2. **Swift starts recording** → calls `onVoiceRecordingStarted()` → button turns red with square icon, timer starts
3. **User presses mic button again** → `startVoiceNote()` checks `isRecordingAudio` (true) → sends `stopVoiceRecording` to Swift
4. **Swift stops recording** → calls `onVoiceRecordingStopped()` → button returns to normal
5. **Swift calls `saveRecordedVoice()`** → audio data saved in JavaScript variables
6. **Input field shows**: "🎤 Audio listo (0:05) - Presiona enviar" with green background
7. **User presses send button** → `sendMessage()` detects saved audio → sends voice note → clears saved data

### Visual Feedback:
- **Recording**: Red mic button with square icon, timer showing seconds
- **Stopped**: Normal mic button, timer hidden
- **Ready to send**: Input field shows "🎤 Audio listo (duration) - Presiona enviar" with light green background
- **Sent**: Input field returns to normal "Mensaje" placeholder

## Benefits
✅ User has full control over voice recording
✅ Can stop recording without sending
✅ Can review duration before sending
✅ Clear visual feedback at each step
✅ Can cancel by recording again (overwrites previous)
✅ Consistent with iMessage UX patterns

## Testing
To test the fix:
1. Open a chat in iOS
2. Press mic button to start recording
3. Speak for a few seconds (timer should count)
4. Press mic button again to stop (timer should hide)
5. Input field should show "🎤 Audio listo (0:XX) - Presiona enviar"
6. Press send button to send the voice note
7. Voice note should appear in chat

## Notes
- The timer now works correctly (no more NaN)
- The user can stop recording without sending
- The send button sends the recorded audio
- All 4 app.js files have been updated for consistency
- The Swift code has been updated to support the new flow
