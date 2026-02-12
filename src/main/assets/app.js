// ChatP2P v11.8 - Contact Profile & Presence
// ============================================

let firebaseReady = false;

// ============================================
// FUNCIÓN SEGURA PARA FORMATEAR TIEMPO
// ============================================
function safeFormatTime(seconds) {
    // Validación ultra-estricta para evitar NaN
    if (seconds === undefined || seconds === null) return '0:00';
    
    const num = parseInt(seconds, 10);
    
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num) || num < 0) {
        return '0:00';
    }
    
    const mins = Math.floor(num / 60);
    const secs = num % 60;
    
    // Verificar que mins y secs son válidos
    if (isNaN(mins) || isNaN(secs)) return '0:00';
    
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// ============================================
// ESTADO GLOBAL
// ============================================
let wallet = localStorage.getItem('wallet') || generateWallet();
let userName = localStorage.getItem('userName') || null;
let currentChat = null;
let chats = {};

// Referencias de Firebase
let chatListenerRef = null;
let messagesListenerRef = null;
let readReceiptsListenerRef = null;
let typingListenerRef = null;

// Estado de mensajes
let lastReadTimestamp = 0;

// Guardar wallet
localStorage.setItem('wallet', wallet);

console.log('🚀 ChatP2P v11.8 - Contact Profile & Presence');
console.log('📱 Wallet:', wallet);

// ============================================
// GENERACIÓN DE WALLET SEGURA
// ============================================
function generateWallet() {
    let w = '0x';
    const arr = new Uint8Array(20);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(arr);
        for (let i = 0; i < arr.length; i++) {
            w += arr[i].toString(16).padStart(2, '0');
        }
    } else {
        for (let i = 0; i < 40; i++) {
            w += Math.floor(Math.random() * 16).toString(16);
        }
    }
    return w;
}

// ============================================
// ENCRIPTACIÓN E2E
// ============================================
function deriveSharedKey(w1, w2) {
    const combined = [w1, w2].sort().join('');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

async function encryptMessage(text, sharedKey) {
    if (!window.crypto || !window.crypto.subtle) {
        return { encrypted: false, data: text };
    }
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const keyData = encoder.encode(sharedKey.padEnd(32, '0').slice(0, 32));
        const cryptoKey = await window.crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return { encrypted: true, data: btoa(String.fromCharCode(...combined)) };
    } catch (e) {
        return { encrypted: false, data: text };
    }
}

async function decryptMessage(encryptedData, sharedKey, isEncrypted) {
    if (!isEncrypted || !window.crypto || !window.crypto.subtle) return encryptedData;
    try {
        const encoder = new TextEncoder();
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const keyData = encoder.encode(sharedKey.padEnd(32, '0').slice(0, 32));
        const cryptoKey = await window.crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);
        const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        return '[Mensaje encriptado]';
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
function init() {
    console.log('🚀 Init');
    updateUI();
    
    // Iniciar sistema de presencia inmediatamente
    initPresenceOnLoad();
    
    if (!userName) {
        showCreateUserModal();
    } else {
        loadChats();
    }
}

function updateUI() {
    const walletDisplay = document.getElementById('walletDisplay');
    const walletSettings = document.getElementById('walletSettings');
    const userDisplay = document.getElementById('userDisplay');
    const profileName = document.getElementById('profileName');
    const avatarLetter = document.getElementById('avatarLetter');
    
    if (walletDisplay) walletDisplay.textContent = wallet;
    if (walletSettings) walletSettings.textContent = wallet;
    if (userDisplay) userDisplay.textContent = userName ? `@${userName}` : wallet.substring(0, 10) + '...';
    if (profileName) profileName.textContent = userName || 'Usuario';
    if (avatarLetter) avatarLetter.textContent = userName ? userName[0].toUpperCase() : '?';
}

function showCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) modal.style.display = 'flex';
}

// ============================================
// GESTIÓN DE USUARIOS
// ============================================
async function checkUsernameExists(username) {
    if (!window.firebaseReady || typeof firebase === 'undefined') return false;
    try {
        const db = firebase.database();
        const snap = await db.ref('users').orderByChild('username').equalTo(username.toLowerCase()).once('value');
        return snap.exists();
    } catch (e) {
        return false;
    }
}

async function findWalletByUsername(username) {
    if (!window.firebaseReady || typeof firebase === 'undefined') return null;
    const clean = username.replace('@', '').toLowerCase().trim();
    try {
        const db = firebase.database();
        const snap = await db.ref('users').once('value');
        if (snap.exists()) {
            const users = snap.val();
            for (const [key, data] of Object.entries(users)) {
                if (data.username && data.username.toLowerCase() === clean) {
                    return data.wallet || key;
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function findProtectedUser(username) {
    if (!window.firebaseReady || typeof firebase === 'undefined') return null;
    const clean = username.replace('@', '').toLowerCase().trim();
    try {
        const db = firebase.database();
        const snap = await db.ref('users').once('value');
        if (snap.exists()) {
            const users = snap.val();
            for (const [userWallet, data] of Object.entries(users)) {
                if (data.username && data.username.toLowerCase() === clean && data.protected === true) {
                    // Check 15-day expiration
                    const savedAt = data.savedAt || 0;
                    if (Date.now() - savedAt > 15 * 86400000) {
                        // Expired - remove protection
                        db.ref('users/' + userWallet).update({ protected: false });
                        return null;
                    }
                    return { wallet: userWallet, username: data.displayName || username, pinHash: data.pinHash };
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function registerUser(username, userWallet) {
    if (!window.firebaseReady || typeof firebase === 'undefined') return false;
    try {
        const db = firebase.database();
        await db.ref('users/' + userWallet).set({
            username: username.toLowerCase(),
            displayName: username,
            wallet: userWallet,
            createdAt: Date.now()
        });
        return true;
    } catch (e) {
        return false;
    }
}

async function createUser() {
    const input = document.getElementById('userInput');
    const name = input.value.trim();
    
    if (!name) { alert('Ingresa un nombre de usuario'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) { alert('El nombre debe tener 3-20 caracteres (letras, números o _)'); return; }
    
    // Buscar si el usuario existe y está protegido con PIN
    const existingData = await findProtectedUser(name);
    if (existingData) {
        // Usuario protegido encontrado - pedir PIN
        window._restoreAccount = existingData;
        document.getElementById('createUserModal').style.display = 'none';
        openModal('enterPinModal');
        return;
    }
    
    const exists = await checkUsernameExists(name);
    if (exists) { alert('Este nombre de usuario ya está en uso'); return; }
    
    await registerUser(name, wallet);
    userName = name;
    localStorage.setItem('userName', userName);
    
    document.getElementById('createUserModal').style.display = 'none';
    
    // Mostrar pantalla principal
    document.getElementById('homeScreen').style.display = 'flex';
    document.getElementById('homeScreen').classList.add('active');
    document.getElementById('chatScreen').style.display = 'none';
    
    updateUI();
    loadChats();
}

async function changeUser() {
    const input = document.getElementById('newUserInput');
    const newName = input.value.trim();
    
    if (!newName) { alert('Ingresa un nombre'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newName)) { alert('El nombre debe tener 3-20 caracteres'); return; }
    
    if (newName.toLowerCase() !== userName?.toLowerCase()) {
        const exists = await checkUsernameExists(newName);
        if (exists) { alert('Este nombre ya está en uso'); return; }
    }
    
    await registerUser(newName, wallet);
    userName = newName;
    localStorage.setItem('userName', userName);
    
    updateUI();
    closeModal('changeUserModal');
    closeModal('settingsModal');
}

async function deleteUser() {
    const walletToDelete = wallet;
    const chatsToDelete = { ...chats };
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            
            // Eliminar datos del usuario
            await db.ref('users/' + walletToDelete).remove();
            await db.ref('chats/' + walletToDelete).remove();
            await db.ref('presence/' + walletToDelete).remove(); // Eliminar presencia
            
            // Eliminar todos los chats y mensajes asociados
            for (const contact of Object.keys(chatsToDelete)) {
                const key = [walletToDelete, contact].sort().join('_');
                
                // Borrar archivos de Storage
                try {
                    const snap = await db.ref('messages/' + key).once('value');
                    const messages = snap.val() || {};
                    const storage = firebase.storage();
                    for (const [id, msg] of Object.entries(messages)) {
                        if (msg && msg.storagePath) {
                            await storage.ref(msg.storagePath).delete().catch(() => {});
                        }
                    }
                } catch (e) {}
                
                await db.ref('messages/' + key).remove();
                await db.ref('typing/' + key).remove();
                await db.ref('readReceipts/' + key).remove();
                await db.ref('chats/' + contact + '/' + walletToDelete).remove();
            }
            
            console.log('✅ Todos los datos eliminados de Firebase');
        } catch (e) {
            console.warn('Error eliminando:', e);
        }
    }
    
    localStorage.clear();
    wallet = generateWallet();
    localStorage.setItem('wallet', wallet);
    userName = null;
    currentChat = null;
    chats = {};
    
    updateUI();
    closeModal('deleteUserModal');
    closeModal('settingsModal');
    showCreateUserModal();
}

// ============================================
// LISTA DE CHATS
// ============================================
function loadChats() {
    const list = document.getElementById('chatsList');
    if (!list) return;
    
    // Cargar chats locales
    const saved = localStorage.getItem('chats_' + wallet);
    if (saved) {
        try { chats = JSON.parse(saved); } catch (e) { chats = {}; }
    }
    
    renderChats();
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            const ref = db.ref('chats/' + wallet);
            
            // Limpiar listener anterior
            if (chatListenerRef) {
                chatListenerRef.off();
            }
            
            // Sincronizar con Firebase
            ref.once('value').then((snap) => {
                const firebaseChats = snap.val() || {};
                let needsUpdate = false;
                
                for (const localChatId of Object.keys(chats)) {
                    if (!firebaseChats[localChatId]) {
                        delete chats[localChatId];
                        needsUpdate = true;
                    }
                }
                
                if (needsUpdate) {
                    localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
                    renderChats();
                }
            });
            
            // Escuchar cambios
            ref.on('child_added', (snap) => {
                const chatId = snap.key;
                const chatData = snap.val();
                if (!chats[chatId]) {
                    chats[chatId] = chatData;
                    localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
                    renderChats();
                }
            });
            
            ref.on('child_changed', (snap) => {
                chats[snap.key] = snap.val();
                localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
                renderChats();
            });
            
            ref.on('child_removed', (snap) => {
                delete chats[snap.key];
                localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
                renderChats();
                if (currentChat === snap.key) goBack();
            });
            
            chatListenerRef = ref;
        } catch (e) {
            console.warn('Firebase error:', e);
        }
    }
}

function renderChats() {
    const list = document.getElementById('chatsList');
    if (!list) return;
    
    // Pantalla vacía = negro limpio
    if (Object.keys(chats).length === 0) {
        list.innerHTML = '';
        return;
    }
    
    list.innerHTML = '';
    
    for (const [contact, data] of Object.entries(chats)) {
        const shortWallet = contact.substring(0, 10) + '...' + contact.substring(contact.length - 8);
        
        // Cifrar preview del último mensaje
        let preview = data.lastMessage || 'Sin mensajes';
        if (preview && preview !== 'Sin mensajes' && !preview.startsWith('📷') && !preview.startsWith('🎥') && !preview.startsWith('🎤')) {
            preview = generateFakeHash(preview);
        }
        
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.innerHTML = `
            <div class="chat-item-content" onclick="openChat('${contact}')">
                <div class="chat-text">
                    <div class="chat-name" style="font-family: 'SF Mono', monospace; font-size: 14px;">${shortWallet}</div>
                    <div class="chat-preview" style="font-family: 'SF Mono', monospace; font-size: 11px; color: #10b981; opacity: 0.7;">${preview}</div>
                </div>
            </div>
        `;
        list.appendChild(div);
    }
}

function deleteChatFromList(contact) {
    delete chats[contact];
    localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            const key = [wallet, contact].sort().join('_');
            
            db.ref('chats/' + wallet + '/' + contact).remove();
            db.ref('chats/' + contact + '/' + wallet).remove();
            db.ref('messages/' + key).remove();
            db.ref('typing/' + key).remove();
            db.ref('readReceipts/' + key).remove();
        } catch (e) {}
    }
    
    renderChats();
}

// ============================================
// ABRIR CHAT
// ============================================
function openChat(contact) {
    console.log('📱 Abriendo chat:', contact);
    currentChat = contact;
    lastReadTimestamp = 0;
    
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('chatScreen').style.display = 'flex';
    
    // Mostrar wallet en título
    const shortWallet = contact.substring(0, 10) + '...' + contact.substring(contact.length - 8);
    const chatTitle = document.getElementById('chatTitle');
    if (chatTitle) {
        chatTitle.textContent = shortWallet;
        chatTitle.style.fontFamily = "'SF Mono', monospace";
        chatTitle.style.fontSize = "15px";
    }
    
    // Actualizar avatar del contacto en header
    const contactAvatarLetter = document.getElementById('contactAvatarLetter');
    if (contactAvatarLetter) {
        contactAvatarLetter.textContent = contact.substring(2, 4).toUpperCase();
    }
    
    // Ocultar estados al inicio
    const typingStatus = document.getElementById('typingStatus');
    const onlineStatus = document.getElementById('onlineStatus');
    if (typingStatus) typingStatus.style.display = 'none';
    if (onlineStatus) onlineStatus.style.display = 'none';
    
    // Iniciar listeners
    loadMessages();
    setupTypingIndicator();
    markAsRead();
    
    // Escuchar presencia del contacto
    listenToContactPresence(contact);
    
    // Scroll automático al final después de cargar mensajes
    setTimeout(() => {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }, 100);
}

// ============================================
// SISTEMA DE PRESENCIA - ONLINE/OFFLINE
// ============================================
let presenceRef = null;
let contactPresenceRef = null;
let presenceInitialized = false;

function setupPresenceSystem() {
    if (!window.firebaseReady || typeof firebase === 'undefined') return;
    if (presenceInitialized) return; // Ya inicializado
    
    try {
        const db = firebase.database();
        
        // Referencia a mi presencia
        presenceRef = db.ref('presence/' + wallet);
        
        // Usar .info/connected para detectar conexión real
        const connectedRef = db.ref('.info/connected');
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                console.log('🟢 Conectado a Firebase');
                
                // Cuando me conecto, marcar online
                presenceRef.set({
                    online: true,
                    lastSeen: firebase.database.ServerValue.TIMESTAMP
                });
                
                // Cuando me desconecto, marcar offline
                presenceRef.onDisconnect().set({
                    online: false,
                    lastSeen: firebase.database.ServerValue.TIMESTAMP
                });
            }
        });
        
        presenceInitialized = true;
        console.log('✅ Sistema de presencia activado para:', wallet);
    } catch (e) {
        console.warn('Error en presencia:', e);
    }
}

// Inicializar presencia cuando Firebase esté listo
let presenceInitAttempts = 0;
const MAX_PRESENCE_ATTEMPTS = 20; // Máximo 10 segundos (20 * 500ms)

function initPresenceOnLoad() {
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        setupPresenceSystem();
        presenceInitAttempts = 0; // Reset counter
    } else if (presenceInitAttempts < MAX_PRESENCE_ATTEMPTS) {
        // Reintentar en 500ms
        presenceInitAttempts++;
        setTimeout(initPresenceOnLoad, 500);
    } else {
        console.warn('⚠️ Firebase no se pudo inicializar después de', MAX_PRESENCE_ATTEMPTS, 'intentos');
        // Continuar sin presencia
    }
}

function listenToContactPresence(contact) {
    if (!window.firebaseReady || typeof firebase === 'undefined' || !contact) {
        console.warn('⚠️ Firebase no está listo para escuchar presencia');
        return;
    }
    
    try {
        const db = firebase.database();
        
        // Limpiar listener anterior
        if (contactPresenceRef) {
            contactPresenceRef.off();
        }
        
        contactPresenceRef = db.ref('presence/' + contact);
        
        contactPresenceRef.on('value', (snap) => {
            const data = snap.val();
            console.log('👁 Presencia recibida:', contact, data);
            updateContactOnlineStatus(data);
        });
        
        console.log('✅ Escuchando presencia de:', contact);
    } catch (e) {
        console.error('❌ Error escuchando presencia:', e);
    }
}

function updateContactOnlineStatus(presenceData) {
    const onlineDot = document.getElementById('contactOnlineDot');
    const onlineStatus = document.getElementById('onlineStatus');
    
    console.log('🔄 Actualizando estado de presencia:', presenceData);
    
    const isOnline = presenceData && presenceData.online === true;
    
    if (onlineDot) {
        onlineDot.style.display = isOnline ? 'block' : 'none';
    }
    
    if (onlineStatus) {
        if (isOnline) {
            onlineStatus.textContent = 'en línea';
            onlineStatus.style.display = 'block';
            onlineStatus.style.color = '#22c55e';
        } else if (presenceData && presenceData.lastSeen) {
            const lastSeen = new Date(presenceData.lastSeen);
            const now = new Date();
            const diffMins = Math.floor((now - lastSeen) / 60000);
            
            if (diffMins < 1) {
                onlineStatus.textContent = 'hace un momento';
            } else if (diffMins < 60) {
                onlineStatus.textContent = `hace ${diffMins} min`;
            } else {
                onlineStatus.textContent = lastSeen.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
            }
            onlineStatus.style.display = 'block';
            onlineStatus.style.color = '#666';
        } else {
            onlineStatus.textContent = 'desconectado';
            onlineStatus.style.display = 'block';
            onlineStatus.style.color = '#666';
        }
    }
    
    // Guardar estado para el modal de perfil
    window.currentContactOnline = isOnline;
    window.currentContactLastSeen = presenceData?.lastSeen;
    
    console.log('✅ Estado actualizado - Online:', isOnline, 'LastSeen:', presenceData?.lastSeen);
}

// ============================================
// PERFIL DE CONTACTO
// ============================================
function showContactProfile() {
    if (!currentChat) return;
    
    // Actualizar datos del modal
    const letterEl = document.getElementById('contactProfileLetter');
    const nameEl = document.getElementById('contactProfileName');
    const walletEl = document.getElementById('contactProfileWallet');
    const statusEl = document.getElementById('contactProfileStatus');
    
    if (letterEl) {
        letterEl.textContent = currentChat.substring(2, 4).toUpperCase();
    }
    
    if (nameEl) {
        const shortWallet = currentChat.substring(0, 10) + '...' + currentChat.substring(currentChat.length - 8);
        nameEl.textContent = shortWallet;
        nameEl.style.fontFamily = "'SF Mono', monospace";
        nameEl.style.fontSize = "14px";
    }
    
    if (walletEl) {
        walletEl.textContent = currentChat;
    }
    
    if (statusEl) {
        // Actualizar estado basado en los datos más recientes
        const updateStatus = () => {
            if (window.currentContactOnline === true) {
                statusEl.innerHTML = `
                    <span class="contact-online-badge">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse-dot 1.5s infinite;"></span>
                        En línea
                    </span>
                `;
            } else {
                let lastSeenText = 'Desconectado';
                if (window.currentContactLastSeen) {
                    const lastSeen = new Date(window.currentContactLastSeen);
                    const now = new Date();
                    const diffMins = Math.floor((now - lastSeen) / 60000);
                    
                    if (diffMins < 1) {
                        lastSeenText = 'Hace un momento';
                    } else if (diffMins < 60) {
                        lastSeenText = `Hace ${diffMins} min`;
                    } else {
                        lastSeenText = 'Últ. vez: ' + lastSeen.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
                    }
                }
                statusEl.innerHTML = `
                    <span class="contact-offline-badge">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
                        ${lastSeenText}
                    </span>
                `;
            }
        };
        
        // Actualizar inmediatamente
        updateStatus();
        
        // Re-actualizar después de un pequeño delay para asegurar que los datos se hayan cargado
        setTimeout(updateStatus, 200);
    }
    
    openModal('contactProfileModal');
}

function goBack() {
    // Limpiar todos los listeners
    if (messagesListenerRef) {
        messagesListenerRef.off();
        messagesListenerRef = null;
    }
    if (readReceiptsListenerRef) {
        readReceiptsListenerRef.off();
        readReceiptsListenerRef = null;
    }
    if (typingListenerRef) {
        typingListenerRef.off();
        typingListenerRef = null;
    }
    if (contactPresenceRef) {
        contactPresenceRef.off();
        contactPresenceRef = null;
    }
    
    clearTyping();
    
    // Limpiar estado de contacto
    window.currentContactOnline = false;
    window.currentContactLastSeen = null;
    
    document.getElementById('chatScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'flex';
    currentChat = null;
    lastReadTimestamp = 0;
    
    return true;
}

function deleteChat() {
    const contactToDelete = currentChat;
    
    delete chats[contactToDelete];
    localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            const key = [wallet, contactToDelete].sort().join('_');
            
            // Borrar archivos de Storage antes de borrar mensajes
            db.ref('messages/' + key).once('value').then((snap) => {
                const messages = snap.val() || {};
                const storage = firebase.storage();
                for (const [id, msg] of Object.entries(messages)) {
                    if (msg && msg.storagePath) {
                        storage.ref(msg.storagePath).delete().catch(() => {});
                    }
                }
            }).catch(() => {});
            
            db.ref('chats/' + wallet + '/' + contactToDelete).remove();
            db.ref('chats/' + contactToDelete + '/' + wallet).remove();
            db.ref('messages/' + key).remove();
            db.ref('typing/' + key).remove();
            db.ref('readReceipts/' + key).remove();
        } catch (e) {}
    }
    
    goBack();
}

// ============================================
// SISTEMA DE MENSAJES - PROFESIONAL
// ============================================
function loadMessages() {
    const area = document.getElementById('messagesArea');
    if (!area || !currentChat) return;
    
    area.innerHTML = '';
    
    if (!window.firebaseReady || typeof firebase === 'undefined') return;
    
    try {
        const db = firebase.database();
        const key = [wallet, currentChat].sort().join('_');
        
        // Limpiar listeners anteriores
        if (messagesListenerRef) messagesListenerRef.off();
        if (readReceiptsListenerRef) readReceiptsListenerRef.off();
        
        // Referencia a mensajes ordenados por key (push keys son cronológicos)
        const messagesRef = db.ref('messages/' + key).orderByKey();
        const readRef = db.ref('readReceipts/' + key + '/' + currentChat);
        
        messagesListenerRef = db.ref('messages/' + key);
        readReceiptsListenerRef = readRef;
        
        // Listener de recibos de lectura - PRIMERO
        readRef.on('value', (snap) => {
            if (snap.exists()) {
                const newTimestamp = snap.val().lastRead || 0;
                if (newTimestamp !== lastReadTimestamp) {
                    lastReadTimestamp = newTimestamp;
                    // Actualizar checks sin re-renderizar todo
                    updateReadChecks();
                }
            }
        });
        
        // Listener de mensajes ordenados por key
        messagesRef.on('value', async (snap) => {
            const messages = snap.val() || {};
            await renderMessages(messages);
            // Marcar como leído cada vez que se cargan mensajes
            markAsRead();
        });
        
    } catch (e) {
        console.warn('Error cargando mensajes:', e);
    }
}

// Actualizar solo los checks sin re-renderizar
function updateReadChecks() {
    const checks = document.querySelectorAll('.read-check');
    checks.forEach(check => {
        const ts = parseInt(check.getAttribute('data-ts') || '0');
        if (ts > 0 && lastReadTimestamp >= ts) {
            check.textContent = '✓✓';
            check.style.color = '#15803d';
            check.style.fontWeight = '800';
            check.style.letterSpacing = '-2px';
            
            // Iniciar timer de cifrado visual para mensajes leídos
            if (!check._cipherScheduled) {
                check._cipherScheduled = true;
                setTimeout(() => {
                    // Buscar el textSpan en el mismo bubble
                    const bubble = check.closest('.bubble');
                    if (bubble) {
                        const textSpan = bubble.querySelector('.msg-text');
                        if (textSpan && !textSpan._ciphered) {
                            cipherTextElement(textSpan);
                        }
                    }
                }, 10000);
            }
        }
    });
    
    // También cifrar mensajes recibidos (no propios) después de 10s de ser leídos
    const receivedTexts = document.querySelectorAll('.message.other .msg-text');
    receivedTexts.forEach(textSpan => {
        if (textSpan._cipherScheduled || textSpan._ciphered) return;
        textSpan._cipherScheduled = true;
        setTimeout(() => {
            if (!textSpan._ciphered) {
                cipherTextElement(textSpan);
            }
        }, 10000);
    });
}

async function renderMessages(messages) {
    const area = document.getElementById('messagesArea');
    if (!area) return;
    
    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    // Ordenar por timestamp primero, luego por key como fallback
    const sorted = Object.entries(messages)
        .filter(([id, msg]) => msg)
        .sort((a, b) => {
            const tsA = a[1].timestamp || 0;
            const tsB = b[1].timestamp || 0;
            if (tsA && tsB) return tsA - tsB;
            return a[0].localeCompare(b[0]);
        });
    
    const sharedKey = deriveSharedKey(wallet, currentChat);
    
    // Procesar mensajes en paralelo para mayor velocidad
    const messagePromises = sorted.map(async ([id, msg]) => {
        if (!msg) return null;
        
        const isOwn = msg.from === wallet;
        const div = document.createElement('div');
        div.className = 'message ' + (isOwn ? 'own' : 'other');
        
        let content;
        if (msg.type === 'photo') {
            content = await createPhotoMessage(msg, isOwn);
        } else if (msg.type === 'video') {
            content = await createVideoMessage(msg, isOwn);
        } else if (msg.type === 'voice') {
            content = await createVoiceMessage(msg, isOwn);
        } else if (msg.text) {
            content = await createTextMessage(msg, isOwn, sharedKey);
        }
        
        if (content) div.appendChild(content);
        return div;
    });
    
    const renderedMessages = await Promise.all(messagePromises);
    
    // Limpiar y agregar todos los mensajes de una vez
    area.innerHTML = '';
    renderedMessages.forEach(div => {
        if (div) fragment.appendChild(div);
    });
    area.appendChild(fragment);
    
    // Scroll al final después de que el DOM se actualice
    setTimeout(() => {
        area.scrollTop = area.scrollHeight;
    }, 0);
}

// ============================================
// EFECTO CIFRADO VISUAL - HASH PROTECTION
// ============================================
// Registro global de mensajes cifrados (por timestamp) para persistir entre re-renders y reinicios
const _savedCiphered = localStorage.getItem('cipheredMessages');
const cipheredMessages = new Set(_savedCiphered ? JSON.parse(_savedCiphered) : []);

function saveCipheredMessages() {
    localStorage.setItem('cipheredMessages', JSON.stringify([...cipheredMessages]));
}

function generateFakeHash(text) {
    let hash = '0x';
    for (let i = 0; i < 8; i++) {
        hash += Math.floor(Math.random() * 16).toString(16);
    }
    return hash + '...';
}

function applyCipherStyle(textSpan, hashText) {
    textSpan.textContent = hashText;
    textSpan.style.fontFamily = "'SF Mono', 'Courier New', monospace";
    textSpan.style.fontSize = '12px';
    textSpan.style.color = '#10b981';
    textSpan.style.opacity = '0.7';
    textSpan.style.wordBreak = 'break-all';
}

function cipherTextElement(textSpan) {
    if (textSpan._ciphered) return;
    textSpan._ciphered = true;
    textSpan._realText = textSpan.textContent;
    const ts = textSpan.getAttribute('data-ts');
    if (ts) { cipheredMessages.add(ts); saveCipheredMessages(); }
    applyCipherStyle(textSpan, generateFakeHash(textSpan._realText));
}

function decipherTextElement(textSpan) {
    if (!textSpan._ciphered || !textSpan._realText) return;
    textSpan.textContent = textSpan._realText;
    textSpan.style.fontFamily = '';
    textSpan.style.fontSize = '';
    textSpan.style.color = '';
    textSpan.style.opacity = '';
    textSpan.style.wordBreak = 'break-word';
    textSpan.style.whiteSpace = 'pre-wrap';
    textSpan.style.display = 'inline';
    textSpan.style.lineHeight = '1.4';
}

function setupHoldToReveal(bubble, textSpan) {
    const reveal = () => {
        decipherTextElement(textSpan);
    };
    const hide = () => {
        if (textSpan._ciphered && textSpan._realText) {
            applyCipherStyle(textSpan, generateFakeHash(textSpan._realText));
        }
    };
    
    // Touch events (mobile)
    bubble.addEventListener('touchstart', (e) => {
        if (textSpan._ciphered) {
            e.preventDefault();
            reveal();
        }
    }, { passive: false });
    bubble.addEventListener('touchend', hide);
    bubble.addEventListener('touchcancel', hide);
    
    // Mouse events (desktop)
    bubble.addEventListener('mousedown', () => { if (textSpan._ciphered) reveal(); });
    bubble.addEventListener('mouseup', hide);
    bubble.addEventListener('mouseleave', hide);
}

// ============================================
// CREAR MENSAJES POR TIPO
// ============================================
async function createTextMessage(msg, isOwn, sharedKey) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    let text = msg.text;
    if (msg.encrypted) {
        text = await decryptMessage(msg.text, sharedKey, true);
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'msg-text';
    textSpan.setAttribute('data-ts', (msg.timestamp || 0).toString());
    textSpan.textContent = text;
    bubble.appendChild(textSpan);
    
    // Setup hold-to-reveal para cuando se cifre
    setupHoldToReveal(bubble, textSpan);
    
    // Cifrado visual
    const tsKey = (msg.timestamp || 0).toString();
    textSpan._realText = text;
    
    if (isOwn || cipheredMessages.has(tsKey)) {
        // Propios: cifrar inmediatamente. Ya cifrados: mantener cifrado.
        textSpan._ciphered = true;
        if (!cipheredMessages.has(tsKey)) {
            cipheredMessages.add(tsKey);
            saveCipheredMessages();
        }
        applyCipherStyle(textSpan, generateFakeHash(text));
    } else {
        // Recibidos: mostrar texto claro 7 segundos, luego cifrar
        setTimeout(() => {
            if (!textSpan._ciphered) {
                cipherTextElement(textSpan);
            }
        }, 7000);
    }
    
    // Meta: hora + check
    const meta = document.createElement('span');
    meta.className = 'message-meta';
    meta.style.cssText = 'display: inline-flex; align-items: center; gap: 3px; margin-left: 8px; font-size: 11px; vertical-align: bottom;';
    
    const time = new Date(msg.timestamp);
    const timeSpan = document.createElement('span');
    timeSpan.textContent = time.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    timeSpan.style.opacity = '0.7';
    meta.appendChild(timeSpan);
    
    if (isOwn) {
        const check = createReadCheck(msg.timestamp);
        meta.appendChild(check);
    }
    
    bubble.appendChild(meta);
    return bubble;
}

async function createPhotoMessage(msg, isOwn) {
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; display: inline-block; width: 280px; height: 280px; border-radius: 12px; overflow: hidden; cursor: pointer; background: #1a1a1a;';
    
    const img = document.createElement('img');
    img.src = msg.data;
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; filter: blur(40px); -webkit-touch-callout: none;';
    container.appendChild(img);
    
    container.onclick = () => openMediaViewer(msg.data, 'photo');
    
    if (isOwn) {
        const check = createReadCheck(msg.timestamp);
        check.style.cssText += 'position: absolute; bottom: 6px; right: 8px; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 10px;';
        container.appendChild(check);
    }
    
    return container;
}

async function createVideoMessage(msg, isOwn) {
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; max-width: 200px; cursor: pointer;';
    
    const videoSrc = msg.storageUrl || msg.data;
    const isAndroid = window.isAndroidApp && typeof AndroidNative !== 'undefined';
    
    // Thumbnail: intentar cargar preview del video
    const video = document.createElement('video');
    video.src = videoSrc;
    video.style.cssText = 'max-width: 200px; border-radius: 12px;';
    video.preload = 'metadata';
    video.setAttribute('playsinline', '');
    if (msg.storageUrl) video.setAttribute('crossorigin', 'anonymous');
    container.appendChild(video);
    
    const playIcon = document.createElement('div');
    playIcon.innerHTML = '▶';
    playIcon.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px; background: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;';
    container.appendChild(playIcon);
    
    if (isOwn) {
        const check = createReadCheck(msg.timestamp);
        check.style.cssText += 'position: absolute; bottom: 6px; right: 8px; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 10px;';
        container.appendChild(check);
    }
    
    container.onclick = () => {
        if (isAndroid && msg.storageUrl) {
            // Android: abrir video con reproductor nativo del sistema
            AndroidNative.openVideoUrl(msg.storageUrl);
        } else {
            openMediaViewer(videoSrc, 'video');
        }
    };
    return container;
}

// ============================================
// NOTAS DE VOZ - ESTILO IMESSAGE v11.2
// ============================================
// NOTAS DE VOZ - VERSIÓN SIMPLE Y FUNCIONAL
// ============================================
async function createVoiceMessage(msg, isOwn) {
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: ${isOwn ? '#3a3a3c' : '#3a3a3c'};
        border-radius: 16px;
        min-width: 180px;
        max-width: 260px;
    `;
    
    // Botón play
    const playBtn = document.createElement('button');
    playBtn.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.15)'};
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    playBtn.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="#999"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';
    
    // Duración - simple y segura
    const duration = document.createElement('span');
    duration.style.cssText = `color: ${isOwn ? '#aaa' : '#aaa'}; font-size: 14px; font-weight: 500;`;
    
    // Calcular duración de forma segura
    let dur = 0;
    if (msg.duration !== undefined && msg.duration !== null) {
        dur = parseInt(msg.duration) || 0;
    }
    const mins = Math.floor(dur / 60);
    const secs = dur % 60;
    duration.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    
    // Audio
    let audio = null;
    let playing = false;
    const useNativeAudio = window.isAndroidApp && typeof AndroidNative !== 'undefined';
    
    // Generar ID único para este mensaje de voz
    const voiceMsgId = 'voice_' + (msg.timestamp || Date.now()) + '_' + Math.random().toString(36).substr(2, 6);
    playBtn.setAttribute('data-voice-id', voiceMsgId);
    
    playBtn.onclick = async () => {
        if (useNativeAudio) {
            // === ANDROID: Reproducción nativa via Java MediaPlayer ===
            if (playing) {
                AndroidNative.stopAudio();
                playing = false;
                playBtn.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="white"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';
                window._currentNativeVoiceBtn = null;
            } else {
                // Detener cualquier otra nota de voz que esté sonando
                if (window._currentNativeVoiceBtn && window._currentNativeVoiceBtn !== playBtn) {
                    AndroidNative.stopAudio();
                    window._currentNativeVoiceBtn.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="white"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';
                }
                window._currentNativeVoiceBtn = playBtn;
                playing = true;
                playBtn.innerHTML = '<svg width="14" height="18" viewBox="0 0 14 18" fill="white"><rect x="0" y="0" width="5" height="18" rx="1"/><rect x="9" y="0" width="5" height="18" rx="1"/></svg>';
                AndroidNative.playAudio(msg.data);
            }
            
            // Callbacks del reproductor nativo
            window.onNativeAudioStarted = function() {
                console.log('🔊 Native audio started');
            };
            window.onNativeAudioEnded = function() {
                console.log('🔊 Native audio ended');
                playing = false;
                if (window._currentNativeVoiceBtn) {
                    window._currentNativeVoiceBtn.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="white"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';
                    window._currentNativeVoiceBtn = null;
                }
                // Restaurar duración original
                duration.textContent = Math.floor(dur / 60) + ':' + ((dur % 60) < 10 ? '0' : '') + (dur % 60);
            };
            return;
        }
        
        // === WEB/iOS: Reproducción con Audio API ===
        if (!audio) {
            audio = document.createElement('audio');
            audio.setAttribute('preload', 'auto');
            audio.setAttribute('playsinline', '');
            audio.style.display = 'none';
            document.body.appendChild(audio);
            
            try {
                if (msg.data && msg.data.startsWith('data:')) {
                    const parts = msg.data.split(',');
                    const mime = parts[0].match(/:(.*?);/)[1];
                    const b64 = parts[1];
                    const byteChars = atob(b64);
                    const byteArray = new Uint8Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteArray[i] = byteChars.charCodeAt(i);
                    }
                    const blob = new Blob([byteArray], { type: mime });
                    audio.src = URL.createObjectURL(blob);
                } else {
                    audio.src = msg.data;
                }
            } catch (e) {
                console.error('Error creating audio blob:', e);
                audio.src = msg.data;
            }
            
            audio.onended = () => {
                playing = false;
                playBtn.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="white"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';
            };
            audio.ontimeupdate = () => {
                if (audio && !isNaN(audio.currentTime)) {
                    const c = Math.floor(audio.currentTime);
                    const m = Math.floor(c / 60);
                    const s = c % 60;
                    duration.textContent = m + ':' + (s < 10 ? '0' : '') + s;
                }
            };
            audio.onerror = (e) => {
                console.error('Audio error:', e);
                if (audio.src !== msg.data) {
                    audio.src = msg.data;
                }
            };
        }
        
        if (playing) {
            audio.pause();
            playing = false;
            playBtn.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="white"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';
        } else {
            try {
                await audio.play();
                playing = true;
                playBtn.innerHTML = '<svg width="14" height="18" viewBox="0 0 14 18" fill="white"><rect x="0" y="0" width="5" height="18" rx="1"/><rect x="9" y="0" width="5" height="18" rx="1"/></svg>';
            } catch (e) {
                console.error('Error playing audio:', e);
            }
        }
    };
    
    container.appendChild(playBtn);
    container.appendChild(duration);
    
    if (isOwn) {
        const check = createReadCheck(msg.timestamp);
        check.style.marginLeft = 'auto';
        container.appendChild(check);
    }
    
    return container;
}

// ============================================
// CONFIRMACIÓN DE LECTURA - VERDE OSCURO
// ============================================
function createReadCheck(timestamp) {
    const check = document.createElement('span');
    check.className = 'read-check';
    check.setAttribute('data-ts', timestamp.toString());
    
    const isRead = lastReadTimestamp >= timestamp;
    
    if (isRead) {
        // Doble check verde oscuro = leído
        check.textContent = '✓✓';
        check.style.color = '#15803d';
        check.style.fontSize = '14px';
        check.style.fontWeight = '800';
        check.style.marginLeft = '5px';
        check.style.letterSpacing = '-2px';
    } else {
        // Check simple verde oscuro = enviado
        check.textContent = '✓';
        check.style.color = '#166534';
        check.style.fontSize = '14px';
        check.style.fontWeight = '700';
        check.style.marginLeft = '5px';
    }
    
    return check;
}

function markAsRead() {
    if (!window.firebaseReady || typeof firebase === 'undefined' || !currentChat) return;
    
    try {
        const db = firebase.database();
        const key = [wallet, currentChat].sort().join('_');
        
        db.ref('readReceipts/' + key + '/' + wallet).set({
            lastRead: Date.now(),
            by: wallet
        });
    } catch (e) {}
}

// ============================================
// INDICADOR DE ESCRIBIENDO - ESTILO IMESSAGE
// ============================================
let typingTimeout = null;

function setupTypingIndicator() {
    const input = document.getElementById('messageInput');
    if (!input || !currentChat) return;
    
    // Remover listener anterior
    input.removeEventListener('input', onTypingInput);
    input.addEventListener('input', onTypingInput);
    
    // Escuchar cuando el otro escribe
    listenToTyping();
}

function onTypingInput() {
    if (!currentChat) return;
    
    setTyping(true);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        setTyping(false);
    }, 2000);
}

function setTyping(isTyping) {
    if (!window.firebaseReady || typeof firebase === 'undefined' || !currentChat) {
        console.log('📝 setTyping: Firebase no listo o sin chat');
        return;
    }
    
    try {
        const db = firebase.database();
        const key = [wallet, currentChat].sort().join('_');
        console.log('📝 setTyping:', isTyping, 'key:', key);
        
        if (isTyping) {
            // Usar timestamp local para que la comparación funcione
            db.ref('typing/' + key + '/' + wallet).set({
                typing: true,
                timestamp: Date.now()
            }).then(() => {
                console.log('📝 Typing enviado a Firebase');
            }).catch(e => {
                console.warn('📝 Error enviando typing:', e);
            });
        } else {
            db.ref('typing/' + key + '/' + wallet).remove();
        }
    } catch (e) {
        console.warn('Error setTyping:', e);
    }
}

function listenToTyping() {
    if (!window.firebaseReady || typeof firebase === 'undefined' || !currentChat) {
        console.log('📝 listenToTyping: Firebase no listo o sin chat');
        return;
    }
    
    try {
        const db = firebase.database();
        const key = [wallet, currentChat].sort().join('_');
        const ref = db.ref('typing/' + key + '/' + currentChat);
        
        console.log('📝 Escuchando typing en:', 'typing/' + key + '/' + currentChat);
        
        if (typingListenerRef) typingListenerRef.off();
        typingListenerRef = ref;
        
        ref.on('value', (snap) => {
            const data = snap.val();
            console.log('📝 Typing recibido:', data);
            showTypingIndicator(data && data.typing);
        });
    } catch (e) {
        console.warn('Error typing listener:', e);
    }
}

function showTypingIndicator(isTyping) {
    console.log('📝 showTypingIndicator:', isTyping);
    
    // Mostrar en header
    const typingEl = document.getElementById('typingStatus');
    if (typingEl) {
        if (isTyping) {
            typingEl.textContent = 'escribiendo...';
            typingEl.style.cssText = 'display: block !important; color: #4ade80 !important; font-size: 13px; font-weight: 600; margin-top: 2px; animation: pulse 1s infinite;';
        } else {
            typingEl.style.display = 'none';
        }
    }
    
    // Agregar animación de pulse si no existe
    if (!document.getElementById('pulseAnimation')) {
        const style = document.createElement('style');
        style.id = 'pulseAnimation';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Mostrar burbuja de typing en el área de mensajes (estilo iMessage)
    const area = document.getElementById('messagesArea');
    if (!area) return;
    
    let typingBubble = document.getElementById('typingBubble');
    
    if (isTyping) {
        if (!typingBubble) {
            typingBubble = document.createElement('div');
            typingBubble.id = 'typingBubble';
            typingBubble.className = 'message other';
            typingBubble.innerHTML = `
                <div class="bubble" style="padding: 12px 16px; min-width: 60px;">
                    <div class="typing-dots" style="display: flex; gap: 4px; align-items: center;">
                        <span style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: typingDot 1.4s infinite ease-in-out;"></span>
                        <span style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: typingDot 1.4s infinite ease-in-out 0.2s;"></span>
                        <span style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: typingDot 1.4s infinite ease-in-out 0.4s;"></span>
                    </div>
                </div>
            `;
            area.appendChild(typingBubble);
            
            // Agregar animación CSS si no existe
            if (!document.getElementById('typingAnimation')) {
                const style = document.createElement('style');
                style.id = 'typingAnimation';
                style.textContent = `
                    @keyframes typingDot {
                        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                        30% { transform: translateY(-4px); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    } else {
        if (typingBubble) {
            typingBubble.remove();
        }
    }
}

function clearTyping() {
    setTyping(false);
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }
}

// ============================================
// ENVIAR MENSAJE
// ============================================
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
    
    if (!text || !currentChat) return;
    
    clearTyping();
    
    const key = [wallet, currentChat].sort().join('_');
    
    const sharedKey = deriveSharedKey(wallet, currentChat);
    const { encrypted, data } = await encryptMessage(text, sharedKey);
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            
            // Usar push() para generar ID único ordenado por Firebase
            const newMsgRef = db.ref('messages/' + key).push();
            
            const msg = {
                from: wallet,
                text: data,
                encrypted: encrypted,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            await newMsgRef.set(msg);
            
            const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
            db.ref('chats/' + wallet + '/' + currentChat + '/lastMessage').set(preview);
            db.ref('chats/' + currentChat + '/' + wallet + '/lastMessage').set(preview);
        } catch (e) {
            console.warn('Error enviando:', e);
        }
    }
    
    input.value = '';
    input.style.height = 'auto';
}

// ============================================
// INICIAR NUEVO CHAT
// ============================================
async function startChat() {
    const input = document.getElementById('contactInput');
    const inputValue = input.value.trim();
    
    if (!inputValue) {
        showContactStatus('Ingresa un usuario o wallet', 'error');
        return;
    }
    
    let contact = inputValue;
    
    if (!inputValue.startsWith('0x')) {
        showContactStatus('Buscando usuario...', 'loading');
        
        const searchTerm = inputValue.replace('@', '').trim();
        const foundWallet = await findWalletByUsername(searchTerm);
        
        if (!foundWallet) {
            showContactStatus('Usuario no encontrado', 'error');
            return;
        }
        
        contact = foundWallet;
        showContactStatus('¡Usuario encontrado!', 'success');
        await new Promise(r => setTimeout(r, 500));
    }
    
    if (!contact.startsWith('0x') || contact.length < 10) {
        showContactStatus('Wallet inválida', 'error');
        return;
    }
    
    if (contact === wallet) {
        showContactStatus('No puedes chatear contigo mismo', 'error');
        return;
    }
    
    if (chats[contact]) {
        showContactStatus('Ya existe este chat', 'error');
        return;
    }
    
    chats[contact] = { lastMessage: '' };
    localStorage.setItem('chats_' + wallet, JSON.stringify(chats));
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            db.ref('chats/' + wallet + '/' + contact).set({ lastMessage: '', createdAt: Date.now() });
            db.ref('chats/' + contact + '/' + wallet).set({ lastMessage: '', createdAt: Date.now() });
        } catch (e) {}
    }
    
    input.value = '';
    closeModal('newChatModal');
    openChat(contact);
}

function showContactStatus(message, type) {
    const err = document.getElementById('contactError');
    if (err) {
        err.textContent = message;
        err.className = 'status-section ' + type;
    }
}

function clearSearchInput() {
    const input = document.getElementById('contactInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    const err = document.getElementById('contactError');
    if (err) {
        err.textContent = '';
        err.className = 'status-section';
    }
}

// ============================================
// VISOR DE MEDIOS
// ============================================
function openMediaViewer(src, type) {
    const overlay = document.createElement('div');
    overlay.id = 'mediaViewer';
    overlay.style.cssText = 'position: fixed; inset: 0; background: #000; z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'position: absolute; top: 50px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; z-index: 3001;';
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);
    
    if (type === 'photo') {
        const container = document.createElement('div');
        container.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; touch-action: none; background: #000;';
        
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = 'max-width: 95%; max-height: 80%; object-fit: contain; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); -webkit-user-select: none; -webkit-touch-callout: none; user-select: none;';
        img.draggable = false;
        
        // Variables para zoom y pan
        let scale = 1;
        let posX = 0;
        let posY = 0;
        let lastDistance = 0;
        let lastTap = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        
        // Prevenir menú contextual y guardar imagen
        img.oncontextmenu = (e) => e.preventDefault();
        img.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Función para aplicar transformación
        function updateTransform() {
            img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
            img.style.transition = isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
        
        // Función para resetear zoom
        function resetZoom() {
            scale = 1;
            posX = 0;
            posY = 0;
            updateTransform();
        }
        
        // Double tap para zoom
        img.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                if (scale > 1) {
                    resetZoom();
                } else {
                    scale = 2.5;
                    updateTransform();
                }
            }
            lastTap = currentTime;
        });
        
        // Pinch to zoom
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                lastDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            } else if (e.touches.length === 1 && scale > 1) {
                isDragging = true;
                startX = e.touches[0].clientX - posX;
                startY = e.touches[0].clientY - posY;
            }
        }, { passive: false });
        
        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                if (lastDistance > 0) {
                    const delta = distance / lastDistance;
                    scale *= delta;
                    scale = Math.max(1, Math.min(scale, 5)); // Límite entre 1x y 5x
                    updateTransform();
                }
                lastDistance = distance;
            } else if (e.touches.length === 1 && isDragging && scale > 1) {
                e.preventDefault();
                posX = e.touches[0].clientX - startX;
                posY = e.touches[0].clientY - startY;
                updateTransform();
            }
        }, { passive: false });
        
        container.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                lastDistance = 0;
            }
            if (e.touches.length === 0) {
                isDragging = false;
                // Si el zoom es 1, resetear posición
                if (scale === 1) {
                    posX = 0;
                    posY = 0;
                    updateTransform();
                }
            }
        });
        
        // Soporte para mouse (desktop/Android)
        let isMouseDown = false;
        img.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                e.preventDefault();
                isMouseDown = true;
                startX = e.clientX - posX;
                startY = e.clientY - posY;
                img.style.cursor = 'grabbing';
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            if (isMouseDown && scale > 1) {
                e.preventDefault();
                posX = e.clientX - startX;
                posY = e.clientY - startY;
                img.style.transition = 'none';
                img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
            }
        });
        
        container.addEventListener('mouseup', () => {
            isMouseDown = false;
            img.style.cursor = scale > 1 ? 'grab' : 'default';
        });
        
        // Wheel zoom (desktop)
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= delta;
            scale = Math.max(1, Math.min(scale, 5));
            if (scale === 1) {
                posX = 0;
                posY = 0;
            }
            updateTransform();
        }, { passive: false });
        
        container.appendChild(img);
        overlay.appendChild(container);
    } else if (type === 'video') {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.cssText = 'max-width: 95%; max-height: 80%; border-radius: 8px; -webkit-touch-callout: none; transition: transform 0.1s ease-out;';
        video.oncontextmenu = (e) => e.preventDefault();
        
        // Variables para pinch-to-zoom en video
        let videoScale = 1;
        let videoInitialDistance = 0;
        let videoInitialScale = 1;
        
        // Touch start - detectar inicio de pinch
        video.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                videoInitialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                videoInitialScale = videoScale;
            }
        }, { passive: false });
        
        // Touch move - aplicar zoom
        video.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                const scale = (currentDistance / videoInitialDistance) * videoInitialScale;
                videoScale = Math.max(1, Math.min(3, scale)); // Límite 1x a 3x
                video.style.transform = `scale(${videoScale})`;
            }
        }, { passive: false });
        
        // Touch end - resetear
        video.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                videoInitialDistance = 0;
            }
        }, { passive: false });
        
        overlay.appendChild(video);
    }
    
    overlay.onclick = (e) => { if (e.target === overlay || e.target === closeBtn) overlay.remove(); };
    document.body.appendChild(overlay);
}

// ============================================
// CÁMARA Y FOTOS
// ============================================
let cameraStream = null;
let currentFacingMode = 'environment';

function capturePhoto() {
    if (!currentChat) return;
    
    // En Android, usar cámara nativa
    if (typeof AndroidNative !== 'undefined') {
        AndroidNative.takePhoto();
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'cameraOverlay';
    overlay.style.cssText = 'position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; flex-direction: column;';
    
    const video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('playsinline', true);
    video.setAttribute('muted', true);
    video.style.cssText = 'flex: 1; width: 100%; object-fit: cover; border-radius: 0; transition: transform 0.1s ease-out;';
    
    // Variables para pinch-to-zoom
    let currentZoom = 1;
    let initialDistance = 0;
    let initialZoom = 1;
    
    // Indicador de zoom
    const zoomIndicator = document.createElement('div');
    zoomIndicator.style.cssText = 'position: absolute; top: max(env(safe-area-inset-top, 20px), 60px); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; z-index: 2001; opacity: 0; transition: opacity 0.3s; pointer-events: none;';
    zoomIndicator.textContent = '1.0x';
    overlay.appendChild(zoomIndicator);
    
    // Función para actualizar el zoom
    function updateZoom(zoom) {
        currentZoom = Math.max(1, Math.min(5, zoom));
        if (currentFacingMode === 'user') {
            video.style.transform = `scaleX(-1) scale(${currentZoom})`;
        } else {
            video.style.transform = `scale(${currentZoom})`;
        }
        zoomIndicator.textContent = currentZoom.toFixed(1) + 'x';
        zoomIndicator.style.opacity = '1';
        
        clearTimeout(window.zoomIndicatorTimeout);
        window.zoomIndicatorTimeout = setTimeout(() => {
            zoomIndicator.style.opacity = '0';
        }, 1500);
    }
    
    // Calcular distancia entre dos toques
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Eventos táctiles para pinch-to-zoom (solo en el video)
    video.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            e.stopPropagation();
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoom = currentZoom;
        }
    }, { passive: false });
    
    video.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            e.stopPropagation();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            updateZoom(initialZoom * scale);
        }
    }, { passive: false });
    
    video.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
    }, { passive: true });
    
    // iOS 26 style controls con blur
    const controls = document.createElement('div');
    controls.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 20px 40px; display: flex; justify-content: space-around; align-items: center; background: linear-gradient(transparent, rgba(0,0,0,0.6)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);';
    
    // Botón cerrar - SF Symbol style
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    closeBtn.style.cssText = 'width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; pointer-events: auto; z-index: 10;';
    closeBtn.onclick = () => closeCameraOverlay(overlay);
    
    // Botón captura - iOS Camera style
    const captureBtn = document.createElement('button');
    captureBtn.style.cssText = 'width: 72px; height: 72px; border-radius: 36px; background: white; border: 4px solid rgba(255,255,255,0.4); cursor: pointer; transition: transform 0.15s; box-shadow: 0 2px 10px rgba(0,0,0,0.3); pointer-events: auto; z-index: 10;';
    captureBtn.onmousedown = () => captureBtn.style.transform = 'scale(0.92)';
    captureBtn.onmouseup = () => captureBtn.style.transform = 'scale(1)';
    captureBtn.onclick = () => takePhoto(video, overlay, currentZoom);
    
    // Botón cambiar cámara - SF Symbol style
    const switchBtn = document.createElement('button');
    switchBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
    switchBtn.style.cssText = 'width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; pointer-events: auto; z-index: 10;';
    switchBtn.onclick = () => { 
        currentZoom = 1;
        updateZoom(1);
        switchBtn.style.transform = 'rotate(180deg)'; 
        setTimeout(() => switchBtn.style.transform = '', 300); 
        switchCamera(video); 
    };
    
    controls.appendChild(closeBtn);
    controls.appendChild(captureBtn);
    controls.appendChild(switchBtn);
    
    overlay.appendChild(video);
    overlay.appendChild(controls);
    document.body.appendChild(overlay);
    
    // Animación de entrada
    overlay.style.opacity = '0';
    requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.25s ease-out';
        overlay.style.opacity = '1';
    });
    
    startCamera(video);
}

function startCamera(video) {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    
    const constraints = {
        video: { facingMode: { ideal: currentFacingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
            video.play().catch(() => {});
        })
        .catch(() => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(stream => {
                    cameraStream = stream;
                    video.srcObject = stream;
                    video.play().catch(() => {});
                })
                .catch(() => {
                    alert('No se pudo acceder a la cámara');
                    const overlay = document.getElementById('cameraOverlay');
                    if (overlay) overlay.remove();
                });
        });
}

function switchCamera(video) {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(video);
}

function takePhoto(video, overlay) {
    // Flash frontal estilo Snapchat: pantalla blanca pura al máximo brillo
    if (currentFacingMode === 'user') {
        const screenFlash = document.createElement('div');
        screenFlash.style.cssText = 'position: fixed; inset: 0; z-index: 9999; pointer-events: none; opacity: 0; background: #FFFFFF;';
        document.body.appendChild(screenFlash);
        
        screenFlash.style.transition = 'none';
        screenFlash.style.opacity = '1';
        
        setTimeout(() => {
            doCapture(video, overlay);
            screenFlash.style.transition = 'opacity 0.2s ease-out';
            screenFlash.style.opacity = '0';
            setTimeout(() => screenFlash.remove(), 250);
        }, 250);
    } else {
        const flash = document.createElement('div');
        flash.style.cssText = 'position: absolute; inset: 0; background: white; opacity: 0; pointer-events: none; transition: opacity 0.1s;';
        overlay.appendChild(flash);
        requestAnimationFrame(() => { flash.style.opacity = '0.8'; setTimeout(() => flash.style.opacity = '0', 100); });
        doCapture(video, overlay);
    }
}

function doCapture(video, overlay) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (currentFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    showPhotoPreview(dataUrl, canvas, overlay);
}

function showPhotoPreview(dataUrl, canvas, overlay) {
    if (!overlay._originalHTML) {
        overlay._originalHTML = overlay.innerHTML;
    }
    
    overlay.innerHTML = '';
    
    const previewImg = document.createElement('img');
    previewImg.src = dataUrl;
    previewImg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000;';
    overlay.appendChild(previewImg);
    
    const previewControls = document.createElement('div');
    previewControls.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 30px 50px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(transparent, rgba(0,0,0,0.7)); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);';
    
    const retakeBtn = document.createElement('button');
    retakeBtn.textContent = 'Repetir';
    retakeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 17px; font-weight: 500; padding: 12px 20px; cursor: pointer; font-family: -apple-system, sans-serif;';
    retakeBtn.onclick = () => {
        overlay.innerHTML = overlay._originalHTML;
        const video = overlay.querySelector('video');
        if (video) {
            video.setAttribute('autoplay', true);
            video.setAttribute('playsinline', true);
            video.setAttribute('muted', true);
            startCamera(video);
        }
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.querySelector('path[d="M18 6L6 18M6 6l12 12"]')) {
                btn.onclick = () => closeCameraOverlay(overlay);
            }
            if (btn.style.width === '72px') {
                btn.onclick = () => {
                    const v = overlay.querySelector('video');
                    if (v) takePhoto(v, overlay);
                };
            }
            if (btn.querySelector('polyline')) {
                btn.onclick = () => {
                    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
                    const v = overlay.querySelector('video');
                    if (v) startCamera(v);
                };
            }
        });
    };
    
    const sendBtn = document.createElement('button');
    sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>';
    sendBtn.style.cssText = 'width: 56px; height: 56px; border-radius: 28px; background: #22c55e; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 15px rgba(34,197,94,0.4); transition: transform 0.15s;';
    sendBtn.onmousedown = () => sendBtn.style.transform = 'scale(0.92)';
    sendBtn.onmouseup = () => sendBtn.style.transform = 'scale(1)';
    sendBtn.onclick = () => {
        canvas.toBlob(blob => {
            sendMedia(blob, 'photo');
            closeCameraOverlay(overlay);
        }, 'image/jpeg', 0.9);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = 'background: none; border: none; color: white; font-size: 17px; font-weight: 500; padding: 12px 20px; cursor: pointer; font-family: -apple-system, sans-serif;';
    cancelBtn.onclick = () => {
        closeCameraOverlay(overlay);
    };
    
    previewControls.appendChild(retakeBtn);
    previewControls.appendChild(sendBtn);
    previewControls.appendChild(cancelBtn);
    overlay.appendChild(previewControls);
}

function closeCameraOverlay(overlay) {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    }
}

// ============================================
// GRABACIÓN DE VIDEO
// ============================================
let videoStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordingSeconds = 0;

function openVideoRecorder() {
    if (!currentChat) return;
    
    // En Android, usar grabador de video nativo
    if (typeof AndroidNative !== 'undefined') {
        AndroidNative.recordVideo();
        return;
    }
    
    // En iOS Safari, usar input nativo de cámara (MediaRecorder no funciona bien con video)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.capture = 'environment';
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                sendMedia(file, 'video');
            }
            input.remove();
        };
        
        input.click();
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'videoRecorderOverlay';
    overlay.style.cssText = 'position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; flex-direction: column;';
    
    const video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('playsinline', true);
    video.setAttribute('muted', true);
    video.id = 'videoRecorderPreview';
    video.style.cssText = 'flex: 1; width: 100%; object-fit: cover;';
    
    // Timer iOS 26 style con blur
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'recordingTimer';
    timerDisplay.style.cssText = 'position: absolute; top: 60px; left: 50%; transform: translateX(-50%); background: rgba(239,68,68,0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: white; padding: 8px 18px; border-radius: 20px; font-size: 15px; font-weight: 600; display: none; font-variant-numeric: tabular-nums;';
    timerDisplay.innerHTML = '<span style="color:#ff6b6b;">●</span> 0:00';
    
    // Controls iOS 26 style
    const controls = document.createElement('div');
    controls.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 20px 40px; display: flex; justify-content: space-around; align-items: center; background: linear-gradient(transparent, rgba(0,0,0,0.6)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);';
    
    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    closeBtn.style.cssText = 'width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer;';
    closeBtn.onclick = () => closeVideoRecorder(overlay);
    
    // Botón grabar - iOS Camera style
    const recordBtn = document.createElement('button');
    recordBtn.id = 'recordButton';
    recordBtn.style.cssText = 'width: 72px; height: 72px; border-radius: 36px; background: #ef4444; border: 4px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 10px rgba(239,68,68,0.4);';
    recordBtn.onclick = () => toggleRecording(video, overlay);
    
    // Botón cambiar cámara
    const switchBtn = document.createElement('button');
    switchBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
    switchBtn.style.cssText = 'width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.3s;';
    switchBtn.onclick = () => { if (!isRecording) { switchBtn.style.transform = 'rotate(180deg)'; setTimeout(() => switchBtn.style.transform = '', 300); switchVideoCamera(video); } };
    
    controls.appendChild(closeBtn);
    controls.appendChild(recordBtn);
    controls.appendChild(switchBtn);
    
    overlay.appendChild(video);
    overlay.appendChild(timerDisplay);
    overlay.appendChild(controls);
    document.body.appendChild(overlay);
    
    // Animación de entrada
    overlay.style.opacity = '0';
    requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.25s ease-out';
        overlay.style.opacity = '1';
    });
    
    startVideoCamera(video);
}

function startVideoCamera(video) {
    if (videoStream) videoStream.getTracks().forEach(t => t.stop());
    
    const constraints = {
        video: { facingMode: { ideal: currentFacingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            video.play().catch(() => {});
        })
        .catch(() => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    videoStream = stream;
                    video.srcObject = stream;
                    video.play().catch(() => {});
                })
                .catch(() => {
                    alert('No se pudo acceder a la cámara');
                    const overlay = document.getElementById('videoRecorderOverlay');
                    if (overlay) overlay.remove();
                });
        });
}

function switchVideoCamera(video) {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    startVideoCamera(video);
}

function toggleRecording(video, overlay) {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording(overlay);
    }
}

function startRecording() {
    if (!videoStream) return;
    
    recordedChunks = [];
    isRecording = true;
    recordingSeconds = 0;
    
    const recordBtn = document.getElementById('recordButton');
    if (recordBtn) {
        recordBtn.style.borderRadius = '16px';
        recordBtn.style.width = '56px';
        recordBtn.style.height = '56px';
        recordBtn.style.background = '#ef4444';
    }
    
    const timerDisplay = document.getElementById('recordingTimer');
    if (timerDisplay) timerDisplay.style.display = 'block';
    
    let options;
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            options = { mimeType };
            break;
        }
    }
    
    try {
        mediaRecorder = options ? new MediaRecorder(videoStream, options) : new MediaRecorder(videoStream);
    } catch (e) {
        alert('No se puede grabar video');
        isRecording = false;
        return;
    }
    
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };
    
    try {
        mediaRecorder.start(100);
    } catch (e) {
        isRecording = false;
        return;
    }
    
    recordingTimer = setInterval(() => {
        recordingSeconds++;
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const timerDisplay = document.getElementById('recordingTimer');
        if (timerDisplay) timerDisplay.innerHTML = `● ${mins}:${secs.toString().padStart(2, '0')}`;
        
        if (recordingSeconds >= 30) stopRecording(document.getElementById('videoRecorderOverlay'));
    }, 1000);
}

function stopRecording(overlay) {
    if (!isRecording || !mediaRecorder) return;
    
    isRecording = false;
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        sendMedia(blob, 'video');
        closeVideoRecorder(overlay);
    };
}

function closeVideoRecorder(overlay) {
    if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        isRecording = false;
    }
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
    }
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    }
}

// ============================================
// NOTAS DE VOZ
// ============================================
let audioRecorder = null;
let audioChunks = [];
let isRecordingAudio = false;
let audioRecordingTimer = null;
let audioRecordingSeconds = 0;

// Detectar si estamos en iOS nativo
const isIOSNative = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosNative;

// Callbacks para grabación nativa de iOS
window.onIOSRecordingStarted = function() {
    console.log('🎤 iOS: Grabación iniciada');
    isRecordingAudio = true;
    audioRecordingSeconds = 0;
    
    const micBtn = document.getElementById('micButton');
    if (micBtn) {
        micBtn.style.background = '#ef4444';
        micBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>';
    }
    
    showVoiceTimer();
    
    audioRecordingTimer = setInterval(() => {
        audioRecordingSeconds++;
        updateVoiceTimer();
        if (audioRecordingSeconds >= 60) {
            stopVoiceNote();
        }
    }, 1000);
};

window.onIOSRecordingComplete = function(audioDataURL, duration) {
    console.log('🎤 iOS: Grabación completada, duración:', duration);
    
    isRecordingAudio = false;
    if (audioRecordingTimer) {
        clearInterval(audioRecordingTimer);
        audioRecordingTimer = null;
    }
    
    resetMicButton();
    hideVoiceTimer();
    
    // Enviar nota de voz
    if (currentChat && audioDataURL) {
        sendVoiceNoteFromData(audioDataURL, duration || audioRecordingSeconds);
    }
};

window.sendVoiceNoteFromIOS = function(audioDataURL, duration) {
    console.log('🎤 iOS: Enviando nota de voz, duración:', duration);
    if (currentChat && audioDataURL) {
        sendVoiceNoteFromData(audioDataURL, duration);
    }
};

function sendVoiceNoteFromData(dataURL, duration) {
    if (!currentChat) return;
    
    const key = [wallet, currentChat].sort().join('_');
    
    if (window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            const db = firebase.database();
            const newMsgRef = db.ref('messages/' + key).push();
            
            const msg = {
                from: wallet,
                type: 'voice',
                data: dataURL,
                duration: duration,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            console.log('🎤 Enviando nota de voz iOS, duración:', duration);
            
            newMsgRef.set(msg);
            db.ref('chats/' + wallet + '/' + currentChat + '/lastMessage').set('🎤 Nota de voz');
            db.ref('chats/' + currentChat + '/' + wallet + '/lastMessage').set('🎤 Nota de voz');
        } catch (e) {
            console.error('🎤 Error enviando:', e);
        }
    }
}

function startVoiceNote() {
    console.log('🎤 startVoiceNote() llamado');
    
    if (!currentChat) {
        alert('Abre un chat primero');
        return;
    }
    
    // En iOS nativo, usar puente Swift
    if (isIOSNative) {
        console.log('🎤 Usando grabación nativa iOS');
        if (isRecordingAudio) {
            window.webkit.messageHandlers.iosNative.postMessage({ action: 'stopVoiceRecording' });
        } else {
            window.webkit.messageHandlers.iosNative.postMessage({ action: 'startVoiceRecording' });
        }
        return;
    }
    
    // En Android, usar grabación nativa
    if (typeof AndroidNative !== 'undefined' || window.isAndroidApp) {
        console.log('🎤 Usando grabación nativa Android');
        try {
            if (window.isRecordingVoice) {
                AndroidNative.stopVoiceNote();
            } else {
                AndroidNative.startVoiceNote();
            }
        } catch (e) {
            console.error('🎤 Error AndroidNative:', e);
        }
        return;
    }
    
    // Fallback: grabación web (para navegador)
    if (isRecordingAudio) {
        stopVoiceNote();
        return;
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Tu navegador no soporta grabación de audio');
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioChunks = [];
            isRecordingAudio = true;
            audioRecordingSeconds = 0;
            
            const micBtn = document.getElementById('micButton');
            if (micBtn) {
                micBtn.style.background = '#ef4444';
                micBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>';
            }
            
            showVoiceTimer();
            
            let mimeType = 'audio/webm';
            try {
                audioRecorder = new MediaRecorder(stream, { mimeType });
            } catch (e) {
                audioRecorder = new MediaRecorder(stream);
            }
            
            audioRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunks.push(e.data);
            };
            
            audioRecorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                if (audioChunks.length > 0) {
                    const blob = new Blob(audioChunks, { type: mimeType });
                    sendVoiceNote(blob);
                }
                resetMicButton();
                hideVoiceTimer();
            };
            
            audioRecorder.start(250);
            
            audioRecordingTimer = setInterval(() => {
                audioRecordingSeconds++;
                updateVoiceTimer();
                if (audioRecordingSeconds >= 60) stopVoiceNote();
            }, 1000);
        })
        .catch((e) => {
            console.error('🎤 Error getUserMedia:', e);
            alert('Error al acceder al micrófono');
        });
}

function stopVoiceNote() {
    if (!isRecordingAudio || !audioRecorder) return;
    isRecordingAudio = false;
    if (audioRecordingTimer) {
        clearInterval(audioRecordingTimer);
        audioRecordingTimer = null;
    }
    audioRecorder.stop();
}

function showVoiceTimer() {
    let timer = document.getElementById('voiceTimer');
    if (!timer) {
        timer = document.createElement('div');
        timer.id = 'voiceTimer';
        timer.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: rgba(239,68,68,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: white; padding: 10px 20px; border-radius: 25px; font-size: 15px; font-weight: 600; z-index: 1000; display: flex; align-items: center; gap: 10px; font-variant-numeric: tabular-nums; box-shadow: 0 4px 20px rgba(239,68,68,0.3);';
        document.body.appendChild(timer);
    }
    timer.innerHTML = '<span style="width:8px;height:8px;background:#ff6b6b;border-radius:50%;animation:pulse 1s infinite;"></span> 0:00';
    timer.style.display = 'flex';
    timer.style.opacity = '0';
    timer.style.transform = 'translateX(-50%) scale(0.9)';
    requestAnimationFrame(() => {
        timer.style.transition = 'opacity 0.2s, transform 0.2s';
        timer.style.opacity = '1';
        timer.style.transform = 'translateX(-50%) scale(1)';
    });
}

function updateVoiceTimer() {
    const timer = document.getElementById('voiceTimer');
    if (timer) {
        const mins = Math.floor(audioRecordingSeconds / 60);
        const secs = audioRecordingSeconds % 60;
        timer.innerHTML = `<span style="width:8px;height:8px;background:#ff6b6b;border-radius:50%;animation:pulse 1s infinite;"></span> ${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

function hideVoiceTimer() {
    const timer = document.getElementById('voiceTimer');
    if (timer) {
        timer.style.opacity = '0';
        timer.style.transform = 'translateX(-50%) scale(0.9)';
        setTimeout(() => timer.style.display = 'none', 200);
    }
}

function resetMicButton() {
    const micBtn = document.getElementById('micButton');
    if (micBtn) {
        micBtn.style.background = 'var(--bg-tertiary)';
        micBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z" fill="currentColor"/><path d="M17 10V12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 17V21M12 21H9M12 21H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
}

function sendVoiceNote(blob) {
    if (!currentChat) return;
    
    // Guardar duración ANTES de que se resetee
    const savedDuration = audioRecordingSeconds || 0;
    
    const key = [wallet, currentChat].sort().join('_');
    
    const reader = new FileReader();
    reader.onload = () => {
        if (window.firebaseReady && typeof firebase !== 'undefined') {
            try {
                const db = firebase.database();
                const newMsgRef = db.ref('messages/' + key).push();
                
                const msg = {
                    from: wallet,
                    type: 'voice',
                    data: reader.result,
                    duration: savedDuration,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };
                
                console.log('🎤 Enviando nota de voz, duración:', savedDuration);
                
                newMsgRef.set(msg);
                db.ref('chats/' + wallet + '/' + currentChat + '/lastMessage').set('🎤 Nota de voz');
                db.ref('chats/' + currentChat + '/' + wallet + '/lastMessage').set('🎤 Nota de voz');
            } catch (e) {
                console.error('🎤 Error enviando:', e);
            }
        }
    };
    reader.readAsDataURL(blob);
}

// Icono SVG de play estilo iOS
const playIconSVG = '<svg width="16" height="18" viewBox="0 0 16 18" fill="white"><path d="M14.5 7.5C15.5 8.1 15.5 9.9 14.5 10.5L3 17.5C2 18.1 0.75 17.35 0.75 16.15V1.85C0.75 0.65 2 -0.1 3 0.5L14.5 7.5Z"/></svg>';

// Icono SVG de pausa estilo iOS
const pauseIconSVG = '<svg width="14" height="18" viewBox="0 0 14 18" fill="white"><rect x="0" y="0" width="5" height="18" rx="1.5"/><rect x="9" y="0" width="5" height="18" rx="1.5"/></svg>';

// Audio actualmente reproduciéndose
let currentPlayingAudio = null;
let currentPlayingButton = null;

function playVoiceNote(src, button, durationElement) {
    console.log('🔊 playVoiceNote llamado');
    
    // Si este mismo botón ya está reproduciendo, toggle pause/play
    if (currentPlayingButton === button && currentPlayingAudio) {
        if (currentPlayingAudio.paused) {
            currentPlayingAudio.play();
            button.innerHTML = pauseIconSVG;
        } else {
            currentPlayingAudio.pause();
            button.innerHTML = playIconSVG;
        }
        return;
    }
    
    // Detener audio anterior si existe
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
        if (currentPlayingButton) {
            currentPlayingButton.innerHTML = playIconSVG;
            currentPlayingButton.classList.remove('voice-btn-playing');
        }
    }
    
    // Crear nuevo audio
    const audio = new Audio();
    audio.src = src;
    audio.playbackRate = 1.0;
    
    currentPlayingAudio = audio;
    currentPlayingButton = button;
    
    button.innerHTML = pauseIconSVG;
    button.classList.add('voice-btn-playing');
    
    // Actualizar duración cuando se carga el metadata
    audio.onloadedmetadata = () => {
        if (durationElement && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            const totalSecs = Math.round(audio.duration);
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            durationElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    };
    
    audio.onended = () => {
        console.log('🔊 Audio terminado');
        button.innerHTML = playIconSVG;
        button.classList.remove('voice-btn-playing');
        currentPlayingAudio = null;
        currentPlayingButton = null;
    };
    
    audio.onerror = (e) => {
        console.error('🔊 Error reproduciendo audio:', e);
        button.innerHTML = playIconSVG;
        button.classList.remove('voice-btn-playing');
        currentPlayingAudio = null;
        currentPlayingButton = null;
    };
    
    audio.play().then(() => {
        console.log('🔊 Audio reproduciéndose');
    }).catch(e => {
        console.error('🔊 Error al iniciar audio:', e);
        button.innerHTML = playIconSVG;
        button.classList.remove('voice-btn-playing');
        currentPlayingAudio = null;
        currentPlayingButton = null;
    });
}

// ============================================
// ENVIAR MEDIOS
// ============================================
function sendMedia(blob, type) {
    if (!currentChat) return;
    
    const key = [wallet, currentChat].sort().join('_');
    const id = Date.now();
    
    if (type === 'photo') {
        compressImage(blob, 0.92, 2048).then(compressedBlob => {
            sendMediaToFirebase(compressedBlob || blob, type, key, id);
        });
    } else if (type === 'video') {
        // Videos van a Firebase Storage (sin límite de tamaño)
        uploadToStorage(blob, type, key, id);
    } else {
        sendMediaToFirebase(blob, type, key, id);
    }
}

function compressVideo(blob, maxSize) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.src = URL.createObjectURL(blob);
        
        video.onloadedmetadata = () => {
            const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
            const width = Math.round(video.videoWidth * scale);
            const height = Math.round(video.videoHeight * scale);
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            const stream = canvas.captureStream(30);
            const chunks = [];
            
            let mimeType = 'video/webm;codecs=vp8';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/mp4';
                }
            }
            
            const recorder = new MediaRecorder(stream, { 
                mimeType: mimeType,
                videoBitsPerSecond: 800000
            });
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            recorder.onstop = () => {
                const compressedBlob = new Blob(chunks, { type: mimeType });
                URL.revokeObjectURL(video.src);
                resolve(compressedBlob);
            };
            
            recorder.start();
            video.currentTime = 0;
            video.play();
            
            const drawFrame = () => {
                if (!video.paused && !video.ended) {
                    ctx.drawImage(video, 0, 0, width, height);
                    requestAnimationFrame(drawFrame);
                }
            };
            
            video.onplay = drawFrame;
            
            video.onended = () => {
                setTimeout(() => recorder.stop(), 100);
            };
            
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    video.pause();
                    recorder.stop();
                }
            }, 15000);
        };
        
        video.onerror = () => resolve(null);
    });
}

function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 12px 24px; border-radius: 25px; font-size: 14px; z-index: 10000;';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// NOTIFICACIONES PUSH
// ============================================
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';

function updateNotifToggleUI() {
    const toggle = document.getElementById('notifToggle');
    const knob = document.getElementById('notifToggleKnob');
    if (!toggle || !knob) return;
    if (notificationsEnabled) {
        toggle.style.background = '#22c55e';
        knob.style.transform = 'translateX(20px)';
    } else {
        toggle.style.background = '#333';
        knob.style.transform = 'translateX(0)';
    }
}

function toggleNotifications() {
    if (!notificationsEnabled) {
        // Activar
        if (window.AndroidNative && typeof AndroidNative.requestNotificationPermission === 'function') {
            const result = AndroidNative.requestNotificationPermission();
            notificationsEnabled = true;
            localStorage.setItem('notificationsEnabled', 'true');
            updateNotifToggleUI();
            showToast('Notificaciones activadas');
            if (typeof AndroidNative.getFCMToken === 'function') {
                setTimeout(() => AndroidNative.getFCMToken(), 1000);
            }
        } else {
            showToast('Solo disponible en la app Android');
        }
    } else {
        // Desactivar
        notificationsEnabled = false;
        localStorage.setItem('notificationsEnabled', 'false');
        updateNotifToggleUI();
        showToast('Notificaciones desactivadas');
        // Eliminar token de Firebase
        if (wallet && window.firebaseReady && typeof firebase !== 'undefined') {
            try {
                firebase.database().ref('users/' + wallet + '/fcmToken').remove();
            } catch (e) {}
        }
    }
}

function saveFCMToken(token) {
    console.log('🔔 Token FCM recibido:', token);
    if (!wallet || !window.firebaseReady || typeof firebase === 'undefined') return;
    if (!notificationsEnabled) return;
    try {
        firebase.database().ref('users/' + wallet + '/fcmToken').set(token);
        console.log('✅ Token FCM guardado en Firebase');
    } catch (e) {
        console.warn('Error guardando token:', e);
    }
}

// Restaurar estado del toggle al abrir settings
setTimeout(updateNotifToggleUI, 500);

// ============================================
// GUARDAR CUENTA CON PIN
// ============================================
function openSaveAccountModal() {
    const isProtected = localStorage.getItem('accountPin');
    if (isProtected) {
        // Ya está protegida, mostrar info
        const savedAt = parseInt(localStorage.getItem('accountSavedAt') || '0');
        const daysLeft = Math.max(0, 15 - Math.floor((Date.now() - savedAt) / 86400000));
        showToast('Cuenta protegida (' + daysLeft + ' días restantes)');
        return;
    }
    openModal('savePinModal');
}

async function saveAccountWithPin() {
    const p1 = document.getElementById('pinInput1').value;
    const p2 = document.getElementById('pinInput2').value;
    if (p1.length !== 4 || !/^\d{4}$/.test(p1)) {
        showToast('El PIN debe ser de 4 dígitos');
        return;
    }
    if (p1 !== p2) {
        showToast('Los PIN no coinciden');
        return;
    }
    // Hash del PIN con la wallet actual
    const pinHash = await hashPin(p1);
    
    // Guardar en Firebase para poder recuperar después
    if (wallet && window.firebaseReady && typeof firebase !== 'undefined') {
        try {
            await firebase.database().ref('users/' + wallet).update({
                protected: true,
                pinHash: pinHash,
                savedAt: firebase.database.ServerValue.TIMESTAMP
            });
        } catch (e) { console.warn('Error guardando protección:', e); }
    }
    
    closeModal('savePinModal');
    closeModal('settingsModal');
    showToast('Cuenta guardada. Ingresa tu usuario para volver.');
    document.getElementById('pinInput1').value = '';
    document.getElementById('pinInput2').value = '';
    
    // Limpiar sesión local (simular "cerrar sesión")
    localStorage.removeItem('userName');
    localStorage.removeItem('accountPin');
    localStorage.removeItem('accountSavedAt');
    userName = null;
    currentChat = null;
    chats = {};
    
    // Generar nueva wallet para la pantalla de bienvenido
    wallet = generateWallet();
    localStorage.setItem('wallet', wallet);
    
    // Limpiar listeners
    if (chatListenerRef) { chatListenerRef.off(); chatListenerRef = null; }
    if (messagesListenerRef) { messagesListenerRef.off(); messagesListenerRef = null; }
    
    updateUI();
    document.getElementById('homeScreen').classList.remove('active');
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('chatScreen').style.display = 'none';
    
    // Limpiar input del modal de crear usuario
    const userInput = document.getElementById('userInput');
    if (userInput) userInput.value = '';
    
    showCreateUserModal();
}

async function hashPin(pin, useWallet) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + (useWallet || wallet));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkPinOnLaunch() {
    // Ya no se usa PIN local, la protección está en Firebase
    return false;
}

async function verifyPin() {
    const input = document.getElementById('pinVerifyInput').value;
    if (input.length !== 4) {
        showToast('Ingresa tu PIN de 4 dígitos');
        return;
    }
    
    // Restaurar cuenta protegida
    const restoreData = window._restoreAccount;
    if (restoreData) {
        const pinHash = await hashPin(input, restoreData.wallet);
        if (pinHash === restoreData.pinHash) {
            // PIN correcto - restaurar cuenta
            wallet = restoreData.wallet;
            userName = restoreData.username;
            localStorage.setItem('wallet', wallet);
            localStorage.setItem('userName', userName);
            
            // Quitar protección en Firebase
            if (window.firebaseReady && typeof firebase !== 'undefined') {
                try {
                    firebase.database().ref('users/' + wallet).update({
                        protected: false,
                        pinHash: null,
                        savedAt: null
                    });
                } catch (e) {}
            }
            
            window._restoreAccount = null;
            closeModal('enterPinModal');
            document.getElementById('pinVerifyInput').value = '';
            
            // Mostrar pantalla principal
            document.getElementById('homeScreen').style.display = 'flex';
            document.getElementById('homeScreen').classList.add('active');
            document.getElementById('chatScreen').style.display = 'none';
            
            updateUI();
            initPresenceOnLoad();
            loadChats();
            showToast('Cuenta restaurada');
        } else {
            showToast('PIN incorrecto');
            document.getElementById('pinVerifyInput').value = '';
        }
        return;
    }
    
    // Fallback: verificación local (no debería llegar aquí)
    closeModal('enterPinModal');
    document.getElementById('pinVerifyInput').value = '';
    loadChats();
}

function compressImage(blob, quality, maxSize) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((compressedBlob) => {
                URL.revokeObjectURL(img.src);
                resolve(compressedBlob);
            }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(blob);
    });
}

function sendMediaToFirebase(blob, type, key, id) {
    const reader = new FileReader();
    reader.onload = () => {
        if (window.firebaseReady && typeof firebase !== 'undefined') {
            try {
                const db = firebase.database();
                const newMsgRef = db.ref('messages/' + key).push();
                
                const msg = {
                    from: wallet,
                    type: type,
                    data: reader.result,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };
                
                newMsgRef.set(msg);
                
                const typeLabel = type === 'photo' ? '📷 Foto' : '🎥 Video';
                db.ref('chats/' + wallet + '/' + currentChat + '/lastMessage').set(typeLabel);
                db.ref('chats/' + currentChat + '/' + wallet + '/lastMessage').set(typeLabel);
            } catch (e) {}
        }
    };
    reader.readAsDataURL(blob);
}

// Subir video a Firebase Storage y guardar URL en Database
function uploadToStorage(blob, type, key, id) {
    if (!window.firebaseReady || typeof firebase === 'undefined') return;
    
    try {
        const storage = firebase.storage();
        const ext = type === 'video' ? 'mp4' : 'jpg';
        const path = 'media/' + key + '/' + id + '.' + ext;
        const storageRef = storage.ref(path);
        
        showToast('Enviando video...');
        
        const uploadTask = storageRef.put(blob);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                console.log('📤 Upload: ' + progress + '%');
            },
            (error) => {
                console.error('❌ Error subiendo:', error);
                showToast('Error al enviar video');
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('✅ Video subido:', downloadURL);
                    
                    const db = firebase.database();
                    const newMsgRef = db.ref('messages/' + key).push();
                    
                    const msg = {
                        from: wallet,
                        type: type,
                        storageUrl: downloadURL,
                        storagePath: path,
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    };
                    
                    newMsgRef.set(msg);
                    
                    const typeLabel = '🎥 Video';
                    db.ref('chats/' + wallet + '/' + currentChat + '/lastMessage').set(typeLabel);
                    db.ref('chats/' + currentChat + '/' + wallet + '/lastMessage').set(typeLabel);
                });
            }
        );
    } catch (e) {
        console.error('Error upload:', e);
        showToast('Error al enviar video');
    }
}

// ============================================
// UTILIDADES
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        // Restaurar scroll del body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
}

function copyWallet() {
    navigator.clipboard.writeText(wallet);
    alert('Wallet copiada');
}

// ============================================
// INICIO
// ============================================
console.log('✅ ChatP2P v11.1 cargado');
window.addEventListener('load', () => {
    setTimeout(() => init(), 100);
});

// ============================================
// FUNCIONES PARA ANDROID NATIVO
// ============================================
// Estas funciones son llamadas desde MainActivity.java

window.isRecordingVoice = false;
window.recordedVoiceData = null;
window.recordedVoiceDuration = 0;

window.onVoiceRecordingStarted = function() {
    window.isRecordingVoice = true;
    isRecordingAudio = true;
    audioRecordingSeconds = 0;
    showVoiceTimer();
    const btn = document.getElementById('micButton');
    if (btn) {
        btn.style.background = '#ef4444';
        btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>';
    }
};

window.onVoiceRecordingStopped = function() {
    window.isRecordingVoice = false;
    isRecordingAudio = false;
    const btn = document.getElementById('micButton');
    if (btn) {
        btn.style.background = '';
        btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z" fill="currentColor"/><path d="M17 10V12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 17V21M12 21H9M12 21H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
};

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

window.updateVoiceTimer = function(seconds) {
    // Validar que seconds sea un número válido
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        seconds = 0;
    }
    
    let timer = document.getElementById('voiceTimer');
    if (!timer) {
        timer = document.createElement('div');
        timer.id = 'voiceTimer';
        timer.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: rgba(239,68,68,0.95); color: white; padding: 10px 20px; border-radius: 25px; font-size: 16px; font-weight: 600; z-index: 1000; font-variant-numeric: tabular-nums;';
        document.body.appendChild(timer);
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timer.innerHTML = '🎙 ' + mins + ':' + (secs < 10 ? '0' : '') + secs;
    timer.style.display = 'block';
};

window.hideVoiceTimer = function() {
    const timer = document.getElementById('voiceTimer');
    if (timer) timer.style.display = 'none';
};

window.sendVoiceNoteFromAndroid = function(base64Data, duration) {
    if (!currentChat || !window.firebaseReady) return;
    const key = [wallet, currentChat].sort().join('_');
    const db = firebase.database();
    const newMsgRef = db.ref('messages/' + key).push();
    const msg = {
        from: wallet,
        type: 'voice',
        data: 'data:audio/mp4;base64,' + base64Data,
        duration: duration || 0,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    newMsgRef.set(msg);
    db.ref('chats/' + wallet + '/' + currentChat).update({ lastMessage: '🎤 Nota de voz', timestamp: Date.now() });
    db.ref('chats/' + currentChat + '/' + wallet).update({ lastMessage: '🎤 Nota de voz', timestamp: Date.now() });
};

window.receiveMediaFromAndroid = function(base64Data, mediaType, duration) {
    if (mediaType === 'voice') {
        sendVoiceNoteFromAndroid(base64Data, duration);
    } else if (typeof sendMedia === 'function') {
        const byteString = atob(base64Data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const mimeType = mediaType === 'photo' ? 'image/jpeg' : 'video/mp4';
        const blob = new Blob([ab], { type: mimeType });
        sendMedia(blob, mediaType);
    }
};

console.log('✅ Funciones Android cargadas');
