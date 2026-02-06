# 🚀 Ejecutar ChatP2P en Android Studio - AHORA

## ✅ Problema Resuelto

He agregado el archivo faltante:
- ✅ `ChatP2P/src/main/res/layout/activity_main.xml` - Layout del WebView

## 📱 Pasos para Ejecutar

### 1. Abre Android Studio
```
Abre el proyecto ChatP2P
```

### 2. Sincroniza Gradle
```
File > Sync Now
(o presiona Cmd + Shift + I)
```

### 3. Espera a que termine
- Debería decir "Gradle sync finished"

### 4. Configura un Emulador
```
Tools > Device Manager
Crea un nuevo emulador (Pixel 6, Android 14)
Inicia el emulador
```

### 5. Ejecuta la App
```
Presiona Ctrl + R
o haz clic en ▶️ (Run)
```

### 6. Selecciona el Emulador
```
Elige el emulador que creaste
Haz clic en OK
```

### 7. ¡Espera a que se ejecute!
```
La app debería abrirse en el emulador
Verás la pantalla de "Crear Usuario"
```

## ✅ Verificación

Después de ejecutar, deberías ver:
- ✅ La app se abre sin errores
- ✅ Pantalla negra con interfaz ChatP2P
- ✅ Modal "Crear Usuario"
- ✅ Tu wallet (0x...)
- ✅ Campo para ingresar nombre

## 🆘 Si No Funciona

### Error: "Gradle sync failed"
```
File > Invalidate Caches / Restart
Selecciona "Invalidate and Restart"
Espera a que se recargue
```

### Error: "No emulator found"
```
Tools > Device Manager
Crea un nuevo emulador
Inicia el emulador
Intenta nuevamente
```

### Error: "App crashes"
```
Abre Logcat (View > Tool Windows > Logcat)
Busca el error rojo
Reporta el error específico
```

## 📊 Especificaciones

| Propiedad | Valor |
|-----------|-------|
| Package | `com.chatp2p` |
| Versión | 8.0 |
| Min SDK | 26 (Android 8.0) |
| Target SDK | 34 (Android 14) |
| Java | 17 |
| Gradle | 9.0.0 |
| AGP | 8.5.0 |

## 🎯 Características

✅ WebView con app web integrada
✅ Wallet automático (0x...)
✅ Creación de usuario
✅ Firebase Realtime Database
✅ Dark mode + tema verde
✅ Sincronización en tiempo real

## 📝 Archivos Creados/Modificados

- ✅ `ChatP2P/src/main/res/layout/activity_main.xml` (NUEVO)
- ✅ `ChatP2P/build.gradle` (actualizado)
- ✅ `ChatP2P/settings.gradle` (actualizado)
- ✅ `ChatP2P/.idea/` (reconstruido)

## 🚀 ¡Listo!

Sigue los pasos anteriores y la app debería ejecutarse correctamente en Android Studio.

Si aún tienes problemas, reporta el error específico que ves en Logcat.
