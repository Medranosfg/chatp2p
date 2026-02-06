# 🚀 Ejecutar ChatP2P en Android

## ✅ APK Compilado

El APK debug está listo en:
```
ChatP2P/app/build/outputs/apk/debug/app-debug.apk
```

Tamaño: **3.3 MB**

## 📱 Opción 1: Ejecutar en Android Studio (Recomendado)

### Paso 1: Abre Android Studio
- Abre el proyecto `ChatP2P`

### Paso 2: Sincroniza Gradle
- `File > Sync Now` (o Cmd + Shift + I)
- Espera a que termine

### Paso 3: Invalida Caché
- `File > Invalidate Caches / Restart`
- Selecciona `Invalidate and Restart`

### Paso 4: Configura un Emulador o Dispositivo
**Opción A - Emulador:**
- `Tools > Device Manager`
- Crea un nuevo emulador (Pixel 6, Android 14)
- Inicia el emulador

**Opción B - Dispositivo Físico:**
- Conecta tu iPhone/Android via USB
- Habilita "USB Debugging" en el dispositivo
- Android Studio lo detectará automáticamente

### Paso 5: Ejecuta la App
- Presiona `Ctrl + R` o haz clic en ▶️ (Run)
- Selecciona el emulador o dispositivo
- ¡La app debería ejecutarse! 🎉

## 📱 Opción 2: Instalar APK Manualmente

### En Emulador:
```bash
adb install ChatP2P/app/build/outputs/apk/debug/app-debug.apk
```

### En Dispositivo Físico:
1. Conecta el dispositivo via USB
2. Ejecuta:
   ```bash
   adb install ChatP2P/app/build/outputs/apk/debug/app-debug.apk
   ```

## 🔍 Verificación

Después de ejecutar, verifica:

✅ La app se abre sin errores
✅ Ves la pantalla de "Crear Usuario"
✅ Se muestra tu wallet (0x...)
✅ Puedes ingresar un nombre
✅ Puedes hacer clic en "Continuar"
✅ Ves la pantalla principal con chats

## 🆘 Solución de Problemas

### Error: "Module not specified"
- Cierra Android Studio completamente
- Abre nuevamente
- Ve a `File > Invalidate Caches / Restart`

### Error: "No emulator found"
- Abre `Tools > Device Manager`
- Crea un nuevo emulador
- Inicia el emulador
- Intenta nuevamente

### Error: "APK installation failed"
```bash
# Desinstala la versión anterior
adb uninstall com.chatp2p

# Instala nuevamente
adb install ChatP2P/app/build/outputs/apk/debug/app-debug.apk
```

### Error: "Device not found"
```bash
# Verifica que el dispositivo esté conectado
adb devices

# Si no aparece, reinicia adb
adb kill-server
adb start-server
```

## 📊 Información de la App

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

✅ Generación automática de wallet (0x...)
✅ Creación de usuario con nombre
✅ Cambio de nombre de usuario
✅ Eliminación de cuenta
✅ Copia de wallet al portapapeles
✅ Interfaz dark mode con tema verde (#1a4d2e)
✅ Integración con Firebase Realtime Database
✅ Sincronización en tiempo real

## 📝 Próximos Pasos

1. Ejecuta la app en Android Studio
2. Crea un usuario con tu nombre
3. Copia tu wallet
4. Abre otra instancia de la app (en otro emulador o dispositivo)
5. Crea otro usuario
6. Intercambia wallets y crea chats
7. ¡Prueba la mensajería P2P! 🚀

¡Listo! La app está lista para ejecutarse en Android. 🎉
