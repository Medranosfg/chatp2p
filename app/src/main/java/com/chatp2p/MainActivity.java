package com.chatp2p;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "ChatP2P";
    private static final int REQUEST_PERMISSIONS = 100;
    private static final int REQUEST_AUDIO_PERMISSION = 101;
    private static final int REQUEST_CAMERA_PHOTO = 102;
    private static final int REQUEST_CAMERA_VIDEO = 103;

    private WebView webView;
    private String currentPhotoPath;
    private String currentVideoPath;
    
    private MediaRecorder audioRecorder;
    private String currentAudioPath;
    private boolean isRecordingAudio = false;
    private int audioRecordingSeconds = 0;
    private Handler audioTimerHandler;
    private Runnable audioTimerRunnable;
    private boolean pendingVoiceRecording = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // BLOQUEAR CAPTURAS DE PANTALLA Y GRABACIÓN
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
        
        // Configurar colores de sistema
        getWindow().setStatusBarColor(android.graphics.Color.BLACK);
        getWindow().setNavigationBarColor(android.graphics.Color.BLACK);
        
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webview);
        audioTimerHandler = new Handler(Looper.getMainLooper());
        
        requestPermissions();
        setupWebView();
        webView.loadUrl("file:///android_asset/index.html");
    }
    
    @Override
    protected void onResume() {
        super.onResume();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
    }
    
    @Override
    protected void onStop() {
        super.onStop();
    }
    
    private void requestPermissions() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.CAMERA);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.RECORD_AUDIO);
        }
        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), REQUEST_PERMISSIONS);
        }
    }
    
    private void setupWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setDatabasePath(getApplicationContext().getDir("database", MODE_PRIVATE).getPath());
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        
        // Configuraciones adicionales para asegurar interactividad
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setBuiltInZoomControls(false);
        s.setSupportZoom(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        
        // CONFIGURACIÓN WEBVIEW
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        
        // Habilitar debugging del WebView para diagnóstico
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        
        // Asegurar que el WebView puede recibir eventos táctiles
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.setClickable(true);
        
        webView.addJavascriptInterface(new AndroidInterface(), "AndroidNative");
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectNativeFunctions();
            }
            
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WebView", consoleMessage.message());
                return true;
            }
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }

    
    private void injectNativeFunctions() {
        String js = 
            "console.log('🔧 Inyectando funciones nativas Android...');" +
            "console.log('🔧 AndroidNative disponible:', typeof AndroidNative !== 'undefined');" +
            "window.isAndroidApp = true;" +
            "window.capturePhoto = function() { console.log('📷 capturePhoto llamado'); if (!currentChat) { console.log('📷 Sin chat activo'); return; } try { AndroidNative.takePhoto(); } catch(e) { console.error('📷 Error:', e); } };" +
            "window.openVideoRecorder = function() { console.log('📹 openVideoRecorder llamado'); if (!currentChat) return; try { AndroidNative.recordVideo(); } catch(e) { console.error('📹 Error:', e); } };" +
            "window.startVoiceNote = function() {" +
            "  console.log('🎤 startVoiceNote llamado desde Android');" +
            "  console.log('🎤 currentChat:', currentChat);" +
            "  console.log('🎤 AndroidNative:', typeof AndroidNative);" +
            "  if (!currentChat) { console.log('🎤 Sin chat activo'); return; }" +
            "  try {" +
            "    if (window.isRecordingVoice) {" +
            "      console.log('🎤 Deteniendo grabación...');" +
            "      AndroidNative.stopVoiceNote();" +
            "    } else {" +
            "      console.log('🎤 Iniciando grabación nativa...');" +
            "      AndroidNative.startVoiceNote();" +
            "    }" +
            "  } catch(e) {" +
            "    console.error('🎤 Error en startVoiceNote:', e);" +
            "    alert('Error al grabar: ' + e.message);" +
            "  }" +
            "};" +
            "window.receiveMediaFromAndroid = function(base64Data, mediaType, duration) {" +
            "  console.log('📥 receiveMediaFromAndroid:', mediaType, 'duration:', duration);" +
            "  if (mediaType === 'voice') { sendVoiceNoteFromAndroid(base64Data, duration); }" +
            "  else if (typeof sendMedia === 'function') {" +
            "    var byteString = atob(base64Data); var ab = new ArrayBuffer(byteString.length); var ia = new Uint8Array(ab);" +
            "    for (var i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }" +
            "    var mimeType = mediaType === 'photo' ? 'image/jpeg' : 'video/mp4';" +
            "    var blob = new Blob([ab], {type: mimeType}); sendMedia(blob, mediaType);" +
            "  }" +
            "};" +
            "window.sendVoiceNoteFromAndroid = function(base64Data, duration) {" +
            "  console.log('📤 sendVoiceNoteFromAndroid, duration:', duration);" +
            "  if (!currentChat || !window.firebaseReady) { console.log('📤 Sin chat o Firebase'); return; }" +
            "  var key = [wallet, currentChat].sort().join('_'); var db = firebase.database();" +
            "  var newMsgRef = db.ref('messages/' + key).push();" +
            "  var msg = { from: wallet, type: 'voice', data: 'data:audio/mp4;base64,' + base64Data, duration: duration || 0, timestamp: firebase.database.ServerValue.TIMESTAMP };" +
            "  newMsgRef.set(msg).then(function() { console.log('📤 Nota de voz enviada!'); }).catch(function(e) { console.error('📤 Error:', e); });" +
            "  db.ref('chats/' + wallet + '/' + currentChat).update({ lastMessage: '🎤 Nota de voz', timestamp: Date.now() });" +
            "  db.ref('chats/' + currentChat + '/' + wallet).update({ lastMessage: '🎤 Nota de voz', timestamp: Date.now() });" +
            "};" +
            "window.onVoiceRecordingStarted = function() { console.log('🎤 onVoiceRecordingStarted'); window.isRecordingVoice = true; var btn = document.getElementById('micButton'); if (btn) { btn.style.background = '#ef4444'; btn.innerHTML = '<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"white\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/></svg>'; } };" +
            "window.onVoiceRecordingStopped = function() { console.log('🎤 onVoiceRecordingStopped'); window.isRecordingVoice = false; var btn = document.getElementById('micButton'); if (btn) { btn.style.background = ''; btn.innerHTML = '<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"9\" y=\"2\" width=\"6\" height=\"11\" rx=\"3\"/><path d=\"M5 10v1a7 7 0 0014 0v-1\"/><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"22\"/></svg>'; } };" +
            "window.updateVoiceTimer = function(seconds) { var timer = document.getElementById('voiceTimer'); if (!timer) { timer = document.createElement('div'); timer.id = 'voiceTimer'; timer.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: rgba(239,68,68,0.95); color: white; padding: 10px 20px; border-radius: 25px; font-size: 16px; font-weight: 600; z-index: 1000;'; document.body.appendChild(timer); } var mins = Math.floor(seconds / 60); var secs = seconds % 60; timer.innerHTML = '🎙 ' + mins + ':' + (secs < 10 ? '0' : '') + secs; timer.style.display = 'block'; };" +
            "window.hideVoiceTimer = function() { var timer = document.getElementById('voiceTimer'); if (timer) timer.style.display = 'none'; };" +
            "console.log('✅ Funciones nativas Android inyectadas correctamente');";
        webView.evaluateJavascript(js, null);
        Log.d(TAG, "✅ Funciones nativas inyectadas en WebView");
    }
    
    public class AndroidInterface {
        @JavascriptInterface
        public void takePhoto() { 
            Log.d(TAG, "📷 takePhoto() llamado desde JavaScript");
            runOnUiThread(() -> openNativeCamera()); 
        }
        @JavascriptInterface
        public void recordVideo() { 
            Log.d(TAG, "📹 recordVideo() llamado desde JavaScript");
            runOnUiThread(() -> openNativeVideoRecorder()); 
        }
        @JavascriptInterface
        public void startVoiceNote() { 
            Log.d(TAG, "🎤 startVoiceNote() llamado desde JavaScript");
            runOnUiThread(() -> startNativeVoiceRecording()); 
        }
        @JavascriptInterface
        public void stopVoiceNote() { 
            Log.d(TAG, "🎤 stopVoiceNote() llamado desde JavaScript");
            runOnUiThread(() -> stopNativeVoiceRecording()); 
        }
        @JavascriptInterface
        public void playAudio(String base64Data) {
            Log.d(TAG, "🔊 playAudio() llamado, data length: " + (base64Data != null ? base64Data.length() : 0));
            runOnUiThread(() -> playNativeAudio(base64Data));
        }
        @JavascriptInterface
        public void stopAudio() {
            Log.d(TAG, "🔊 stopAudio() llamado");
            runOnUiThread(() -> stopNativeAudio());
        }
        @JavascriptInterface
        public void openVideoUrl(String url) {
            Log.d(TAG, "🎥 openVideoUrl() llamado: " + url);
            runOnUiThread(() -> playVideoInApp(url));
        }
        @JavascriptInterface
        public void log(String message) {
            Log.d(TAG, "JS: " + message);
        }
        @JavascriptInterface
        public String requestNotificationPermission() {
            Log.d(TAG, "🔔 requestNotificationPermission() llamado");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS) 
                    != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(MainActivity.this, 
                        new String[]{Manifest.permission.POST_NOTIFICATIONS}, 200);
                    return "pending";
                }
            }
            return "granted";
        }
        @JavascriptInterface
        public void getFCMToken() {
            Log.d(TAG, "🔔 getFCMToken() llamado");
            FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && task.getResult() != null) {
                        String token = task.getResult();
                        Log.d(TAG, "🔔 Token FCM: " + token);
                        runOnUiThread(() -> {
                            webView.evaluateJavascript(
                                "if(typeof saveFCMToken === 'function') saveFCMToken('" + token + "');", 
                                null
                            );
                        });
                    }
                });
        }
    }
    
    private void startNativeVoiceRecording() {
        Log.d(TAG, "🎤 startNativeVoiceRecording llamado");
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "🎤 Solicitando permiso de audio");
            pendingVoiceRecording = true;
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_AUDIO_PERMISSION);
            return;
        }
        
        actuallyStartVoiceRecording();
    }
    
    private void actuallyStartVoiceRecording() {
        Log.d(TAG, "🎤 actuallyStartVoiceRecording() - Permiso de audio OK");
        
        if (isRecordingAudio) { 
            Log.d(TAG, "🎤 Ya estaba grabando, deteniendo...");
            stopNativeVoiceRecording(); 
            return; 
        }
        
        try {
            File audioFile = createAudioFile();
            Log.d(TAG, "🎤 Archivo de audio creado: " + currentAudioPath);
            
            // Liberar grabador anterior si existe
            if (audioRecorder != null) {
                try {
                    audioRecorder.release();
                } catch (Exception e) {}
                audioRecorder = null;
            }
            
            audioRecorder = new MediaRecorder();
            Log.d(TAG, "🎤 MediaRecorder creado");
            
            audioRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            Log.d(TAG, "🎤 AudioSource configurado: MIC");
            
            audioRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            Log.d(TAG, "🎤 OutputFormat configurado: MPEG_4");
            
            audioRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            Log.d(TAG, "🎤 AudioEncoder configurado: AAC");
            
            audioRecorder.setAudioEncodingBitRate(128000);
            audioRecorder.setAudioSamplingRate(44100);
            audioRecorder.setOutputFile(currentAudioPath);
            Log.d(TAG, "🎤 Parámetros de audio configurados");
            
            Log.d(TAG, "🎤 Llamando prepare()...");
            audioRecorder.prepare();
            Log.d(TAG, "🎤 prepare() completado");
            
            Log.d(TAG, "🎤 Llamando start()...");
            audioRecorder.start();
            Log.d(TAG, "🎤 start() completado - ¡GRABANDO!");
            
            isRecordingAudio = true;
            audioRecordingSeconds = 0;
            
            // Notificar a JavaScript que la grabación inició
            webView.evaluateJavascript("if(typeof onVoiceRecordingStarted === 'function') onVoiceRecordingStarted();", null);
            Log.d(TAG, "🎤 JavaScript notificado: onVoiceRecordingStarted");
            
            // Iniciar timer
            audioTimerRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isRecordingAudio) {
                        audioRecordingSeconds++;
                        webView.evaluateJavascript("if(typeof updateVoiceTimer === 'function') updateVoiceTimer(" + audioRecordingSeconds + ");", null);
                        if (audioRecordingSeconds >= 60) { 
                            Log.d(TAG, "🎤 Límite de 60 segundos alcanzado");
                            stopNativeVoiceRecording(); 
                        }
                        else { audioTimerHandler.postDelayed(this, 1000); }
                    }
                }
            };
            audioTimerHandler.postDelayed(audioTimerRunnable, 1000);
            Log.d(TAG, "🎤 Timer iniciado");
            
        } catch (IllegalStateException e) {
            Log.e(TAG, "🎤 ERROR IllegalStateException: " + e.getMessage(), e);
            isRecordingAudio = false;
            if (audioRecorder != null) {
                try { audioRecorder.release(); } catch (Exception ex) {}
                audioRecorder = null;
            }
            webView.evaluateJavascript("alert('Error de estado del grabador: " + e.getMessage().replace("'", "").replace("\"", "") + "');", null);
        } catch (IOException e) {
            Log.e(TAG, "🎤 ERROR IOException: " + e.getMessage(), e);
            isRecordingAudio = false;
            webView.evaluateJavascript("alert('Error de archivo: " + e.getMessage().replace("'", "").replace("\"", "") + "');", null);
        } catch (Exception e) {
            Log.e(TAG, "🎤 ERROR general: " + e.getMessage(), e);
            isRecordingAudio = false;
            if (audioRecorder != null) {
                try { audioRecorder.release(); } catch (Exception ex) {}
                audioRecorder = null;
            }
            webView.evaluateJavascript("alert('Error al grabar: " + e.getMessage().replace("'", "").replace("\"", "") + "');", null);
        }
    }
    
    private void stopNativeVoiceRecording() {
        Log.d(TAG, "🎤 stopNativeVoiceRecording() llamado");
        
        if (!isRecordingAudio) {
            Log.d(TAG, "🎤 No estaba grabando, ignorando");
            return;
        }
        
        if (audioRecorder == null) {
            Log.d(TAG, "🎤 audioRecorder es null, reseteando estado");
            isRecordingAudio = false;
            return;
        }
        
        try {
            isRecordingAudio = false;
            
            if (audioTimerHandler != null && audioTimerRunnable != null) {
                audioTimerHandler.removeCallbacks(audioTimerRunnable);
            }
            
            Log.d(TAG, "🎤 Deteniendo grabación...");
            audioRecorder.stop();
            Log.d(TAG, "🎤 Grabación detenida");
            
            audioRecorder.release();
            audioRecorder = null;
            Log.d(TAG, "🎤 MediaRecorder liberado");
            
            webView.evaluateJavascript("if(typeof onVoiceRecordingStopped === 'function') onVoiceRecordingStopped();", null);
            webView.evaluateJavascript("if(typeof hideVoiceTimer === 'function') hideVoiceTimer();", null);
            
            Log.d(TAG, "🎤 Procesando nota de voz...");
            processVoiceNote();
            
        } catch (RuntimeException e) {
            Log.e(TAG, "🎤 Error deteniendo grabación: " + e.getMessage(), e);
            if (audioRecorder != null) {
                try { audioRecorder.release(); } catch (Exception ex) {}
                audioRecorder = null;
            }
            isRecordingAudio = false;
            webView.evaluateJavascript("if(typeof onVoiceRecordingStopped === 'function') onVoiceRecordingStopped();", null);
            webView.evaluateJavascript("if(typeof hideVoiceTimer === 'function') hideVoiceTimer();", null);
        }
    }
    
    private File createAudioFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        File storageDir = getCacheDir(); // Usar cache interno en lugar de externo
        File audio = new File(storageDir, "VOICE_" + timeStamp + ".m4a");
        currentAudioPath = audio.getAbsolutePath();
        return audio;
    }
    
    private void processVoiceNote() {
        final int duration = audioRecordingSeconds;
        Log.d(TAG, "🎤 processVoiceNote() - duración: " + duration + " segundos");
        
        new Thread(() -> {
            try {
                File file = new File(currentAudioPath);
                if (!file.exists()) {
                    Log.e(TAG, "🎤 ERROR: Archivo de audio no existe: " + currentAudioPath);
                    return;
                }
                
                Log.d(TAG, "🎤 Leyendo archivo: " + file.length() + " bytes");
                
                FileInputStream fis = new FileInputStream(file);
                byte[] audioBytes = new byte[(int) file.length()];
                int bytesRead = fis.read(audioBytes);
                fis.close();
                
                Log.d(TAG, "🎤 Bytes leídos: " + bytesRead);
                
                String base64 = Base64.encodeToString(audioBytes, Base64.NO_WRAP);
                Log.d(TAG, "🎤 Base64 generado: " + base64.length() + " caracteres");
                
                runOnUiThread(() -> {
                    Log.d(TAG, "🎤 Enviando a JavaScript...");
                    webView.evaluateJavascript(
                        "if(typeof receiveMediaFromAndroid === 'function') { " +
                        "  console.log('🎤 receiveMediaFromAndroid llamado');" +
                        "  receiveMediaFromAndroid('" + base64 + "', 'voice', " + duration + ");" +
                        "} else { console.error('🎤 receiveMediaFromAndroid no definido'); }", 
                        null
                    );
                });
                
                // Eliminar archivo temporal
                if (file.delete()) {
                    Log.d(TAG, "🎤 Archivo temporal eliminado");
                } else {
                    Log.w(TAG, "🎤 No se pudo eliminar archivo temporal");
                }
                
            } catch (Exception e) { 
                Log.e(TAG, "🎤 Error procesando audio: " + e.getMessage(), e); 
            }
        }).start();
    }

    
    private void openNativeCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, REQUEST_PERMISSIONS);
            return;
        }
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (intent.resolveActivity(getPackageManager()) != null) {
            try {
                File photoFile = createImageFile();
                Uri photoURI = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", photoFile);
                intent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                startActivityForResult(intent, REQUEST_CAMERA_PHOTO);
            } catch (IOException ex) { Log.e(TAG, "Error creando archivo", ex); }
        }
    }
    
    private void openNativeVideoRecorder() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO}, REQUEST_PERMISSIONS);
            return;
        }
        Intent intent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        if (intent.resolveActivity(getPackageManager()) != null) {
            try {
                File videoFile = createVideoFile();
                Uri videoURI = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", videoFile);
                intent.putExtra(MediaStore.EXTRA_OUTPUT, videoURI);
                intent.putExtra(MediaStore.EXTRA_DURATION_LIMIT, 30);
                intent.putExtra(MediaStore.EXTRA_VIDEO_QUALITY, 1);
                startActivityForResult(intent, REQUEST_CAMERA_VIDEO);
            } catch (IOException ex) { Log.e(TAG, "Error creando archivo", ex); }
        }
    }
    
    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        File image = File.createTempFile("IMG_" + timeStamp, ".jpg", getExternalCacheDir());
        currentPhotoPath = image.getAbsolutePath();
        return image;
    }
    
    private File createVideoFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        File video = File.createTempFile("VID_" + timeStamp, ".mp4", getExternalCacheDir());
        currentVideoPath = video.getAbsolutePath();
        return video;
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CAMERA_PHOTO && resultCode == Activity.RESULT_OK) processPhoto();
        else if (requestCode == REQUEST_CAMERA_VIDEO && resultCode == Activity.RESULT_OK) processVideo();
    }
    
    private void processPhoto() {
        new Thread(() -> {
            try {
                File file = new File(currentPhotoPath);
                if (!file.exists()) return;
                Bitmap bitmap = BitmapFactory.decodeFile(currentPhotoPath);
                if (bitmap == null) return;
                int maxSize = 1200, width = bitmap.getWidth(), height = bitmap.getHeight();
                if (width > maxSize || height > maxSize) {
                    float scale = Math.min((float) maxSize / width, (float) maxSize / height);
                    bitmap = Bitmap.createScaledBitmap(bitmap, Math.round(width * scale), Math.round(height * scale), true);
                }
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 85, baos);
                String base64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);
                runOnUiThread(() -> webView.evaluateJavascript("receiveMediaFromAndroid('" + base64 + "', 'photo', 0);", null));
                file.delete();
            } catch (Exception e) { Log.e(TAG, "Error procesando foto", e); }
        }).start();
    }
    
    private void processVideo() {
        new Thread(() -> {
            try {
                File file = new File(currentVideoPath);
                if (!file.exists()) return;
                FileInputStream fis = new FileInputStream(file);
                byte[] videoBytes = new byte[(int) file.length()];
                fis.read(videoBytes);
                fis.close();
                String base64 = Base64.encodeToString(videoBytes, Base64.NO_WRAP);
                runOnUiThread(() -> webView.evaluateJavascript("receiveMediaFromAndroid('" + base64 + "', 'video', 0);", null));
                file.delete();
            } catch (Exception e) { Log.e(TAG, "Error procesando video", e); }
        }).start();
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("(function() { if (typeof goBack === 'function') { goBack(); return true; } return false; })()", result -> {
            if (!"true".equals(result)) { if (webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
        });
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == REQUEST_AUDIO_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "🎤 Permiso de audio concedido");
                if (pendingVoiceRecording) {
                    pendingVoiceRecording = false;
                    actuallyStartVoiceRecording();
                }
            } else {
                Log.d(TAG, "🎤 Permiso de audio denegado");
                pendingVoiceRecording = false;
                webView.evaluateJavascript("alert('Se necesita permiso de micrófono para grabar notas de voz');", null);
            }
        }
    }
    
    // ============================================
    // REPRODUCCIÓN NATIVA DE AUDIO
    // ============================================
    private MediaPlayer mediaPlayer;
    private String currentPlaybackFile;
    
    private void playNativeAudio(String base64Data) {
        Log.d(TAG, "🔊 playNativeAudio()");
        
        // Detener reproducción anterior
        stopNativeAudio();
        
        new Thread(() -> {
            try {
                // Extraer base64 puro (quitar prefijo data:audio/...)
                String pureBase64 = base64Data;
                if (base64Data.contains(",")) {
                    pureBase64 = base64Data.split(",")[1];
                }
                
                byte[] audioBytes = Base64.decode(pureBase64, Base64.DEFAULT);
                Log.d(TAG, "🔊 Audio decodificado: " + audioBytes.length + " bytes");
                
                // Guardar en archivo temporal
                File tempFile = new File(getCacheDir(), "playback_temp.m4a");
                java.io.FileOutputStream fos = new java.io.FileOutputStream(tempFile);
                fos.write(audioBytes);
                fos.close();
                currentPlaybackFile = tempFile.getAbsolutePath();
                
                Log.d(TAG, "🔊 Archivo temporal creado: " + currentPlaybackFile);
                
                runOnUiThread(() -> {
                    try {
                        mediaPlayer = new MediaPlayer();
                        mediaPlayer.setDataSource(currentPlaybackFile);
                        mediaPlayer.setOnPreparedListener(mp -> {
                            Log.d(TAG, "🔊 MediaPlayer preparado, reproduciendo...");
                            mp.start();
                            webView.evaluateJavascript("if(typeof onNativeAudioStarted === 'function') onNativeAudioStarted();", null);
                        });
                        mediaPlayer.setOnCompletionListener(mp -> {
                            Log.d(TAG, "🔊 Reproducción completada");
                            webView.evaluateJavascript("if(typeof onNativeAudioEnded === 'function') onNativeAudioEnded();", null);
                            stopNativeAudio();
                        });
                        mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                            Log.e(TAG, "🔊 Error MediaPlayer: " + what + " extra: " + extra);
                            webView.evaluateJavascript("if(typeof onNativeAudioEnded === 'function') onNativeAudioEnded();", null);
                            return false;
                        });
                        mediaPlayer.prepareAsync();
                    } catch (Exception e) {
                        Log.e(TAG, "🔊 Error preparando MediaPlayer: " + e.getMessage(), e);
                    }
                });
                
            } catch (Exception e) {
                Log.e(TAG, "🔊 Error decodificando audio: " + e.getMessage(), e);
            }
        }).start();
    }
    
    private void stopNativeAudio() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception e) {}
            mediaPlayer = null;
        }
        if (currentPlaybackFile != null) {
            try { new File(currentPlaybackFile).delete(); } catch (Exception e) {}
            currentPlaybackFile = null;
        }
    }
    
    // ============================================
    // REPRODUCTOR DE VIDEO IN-APP
    // ============================================
    private void playVideoInApp(String url) {
        Log.d(TAG, "🎥 playVideoInApp: " + url);
        
        // Crear overlay fullscreen con VideoView
        android.widget.FrameLayout overlay = new android.widget.FrameLayout(this);
        overlay.setBackgroundColor(android.graphics.Color.BLACK);
        overlay.setLayoutParams(new android.widget.FrameLayout.LayoutParams(
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT
        ));
        
        // VideoView centrado
        android.widget.VideoView videoView = new android.widget.VideoView(this);
        android.widget.FrameLayout.LayoutParams videoParams = new android.widget.FrameLayout.LayoutParams(
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
            android.view.Gravity.CENTER
        );
        videoView.setLayoutParams(videoParams);
        
        // Botón cerrar
        android.widget.ImageButton closeBtn = new android.widget.ImageButton(this);
        closeBtn.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        closeBtn.setImageResource(android.R.drawable.ic_menu_close_clear_cancel);
        closeBtn.setColorFilter(android.graphics.Color.WHITE);
        closeBtn.setPadding(32, 32, 32, 32);
        android.widget.FrameLayout.LayoutParams closeParams = new android.widget.FrameLayout.LayoutParams(
            160, 160, android.view.Gravity.TOP | android.view.Gravity.END
        );
        closeParams.topMargin = 80;
        closeParams.rightMargin = 32;
        closeBtn.setLayoutParams(closeParams);
        
        // Loading indicator
        android.widget.ProgressBar progress = new android.widget.ProgressBar(this);
        android.widget.FrameLayout.LayoutParams progressParams = new android.widget.FrameLayout.LayoutParams(
            android.widget.FrameLayout.LayoutParams.WRAP_CONTENT,
            android.widget.FrameLayout.LayoutParams.WRAP_CONTENT,
            android.view.Gravity.CENTER
        );
        progress.setLayoutParams(progressParams);
        
        overlay.addView(videoView);
        overlay.addView(progress);
        overlay.addView(closeBtn);
        
        // Agregar al contenido de la actividad
        android.widget.FrameLayout rootView = (android.widget.FrameLayout) getWindow().getDecorView().findViewById(android.R.id.content);
        rootView.addView(overlay);
        
        // Cerrar al tocar X
        closeBtn.setOnClickListener(v -> {
            videoView.stopPlayback();
            rootView.removeView(overlay);
        });
        
        // Tocar video para pausar/reanudar
        videoView.setOnClickListener(v -> {
            if (videoView.isPlaying()) {
                videoView.pause();
            } else {
                videoView.start();
            }
        });
        
        videoView.setOnPreparedListener(mp -> {
            Log.d(TAG, "🎥 Video preparado, reproduciendo");
            progress.setVisibility(android.view.View.GONE);
            mp.setLooping(false);
            videoView.start();
        });
        
        videoView.setOnErrorListener((mp, what, extra) -> {
            Log.e(TAG, "🎥 Error reproduciendo video: " + what);
            progress.setVisibility(android.view.View.GONE);
            rootView.removeView(overlay);
            return true;
        });
        
        videoView.setOnCompletionListener(mp -> {
            Log.d(TAG, "🎥 Video completado");
        });
        
        // Reproducir desde URL
        videoView.setVideoURI(Uri.parse(url));
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopNativeAudio();
        if (isRecordingAudio && audioRecorder != null) {
            try { audioRecorder.stop(); audioRecorder.release(); } catch (Exception e) {}
        }
    }
}
