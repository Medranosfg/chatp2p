package com.chatp2p;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class ChatP2PMessagingService extends FirebaseMessagingService {
    
    private static final String TAG = "ChatP2P-FCM";
    private static final String CHANNEL_ID = "chatp2p_messages";
    
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "Nuevo token FCM: " + token);
        // El token se guardará desde JavaScript cuando el usuario active notificaciones
    }
    
    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "Mensaje recibido de: " + remoteMessage.getFrom());
        
        // Mostrar notificación privada (sin contenido del mensaje)
        showNotification();
    }
    
    private void showNotification() {
        createNotificationChannel();
        
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent, 
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("ChatP2P")
            .setContentText("Nuevo mensaje")  // Privado: no muestra contenido
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent);
        
        NotificationManager notificationManager = 
            (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        
        if (notificationManager != null) {
            notificationManager.notify(0, builder.build());
        }
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Mensajes",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notificaciones de nuevos mensajes");
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
