const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Enviar notificación cuando llega un nuevo mensaje
exports.sendMessageNotification = functions.database
    .ref('/messages/{chatKey}/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message = snapshot.val();
        const chatKey = context.params.chatKey;
        
        if (!message || !message.from) {
            console.log('Mensaje inválido');
            return null;
        }
        
        // Obtener el destinatario (el otro usuario del chat)
        const participants = chatKey.split('_');
        const recipient = participants.find(p => p !== message.from);
        
        if (!recipient) {
            console.log('No se encontró destinatario');
            return null;
        }
        
        // Obtener token FCM del destinatario
        const tokenSnapshot = await admin.database()
            .ref('fcmTokens/' + recipient)
            .once('value');
        
        const tokenData = tokenSnapshot.val();
        
        if (!tokenData || !tokenData.token) {
            console.log('Usuario no tiene notificaciones activadas');
            return null;
        }
        
        // Crear notificación privada (sin contenido del mensaje)
        const notification = {
            token: tokenData.token,
            notification: {
                title: 'ChatP2P',
                body: 'Nuevo mensaje'
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'chatp2p_messages',
                    priority: 'high',
                    defaultSound: true
                }
            },
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: 'ChatP2P',
                            body: 'Nuevo mensaje'
                        },
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };
        
        try {
            await admin.messaging().send(notification);
            console.log('Notificación enviada a:', recipient);
            return null;
        } catch (error) {
            console.error('Error enviando notificación:', error);
            // Si el token es inválido, eliminarlo
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                await admin.database().ref('fcmTokens/' + recipient).remove();
                console.log('Token inválido eliminado');
            }
            return null;
        }
    });
