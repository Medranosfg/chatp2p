# Guía Completa: Compilar y Ejecutar APK en Android Studio

## Paso 1: Preparar Android Studio

1. **Abre Android Studio**
2. **File → Open** → `/Users/jhonathanmedrano/chatp2p/ChatP2P`
3. Espera a que Gradle se sincronice (2-5 minutos)
4. Verás "Gradle sync finished" cuando esté listo

## Paso 2: Configurar un Dispositivo

### Opción A: Usar Emulador (Recomendado)

1. **Tools → Device Manager**
2. Haz clic en **"Create Device"**
3. Selecciona un dispositivo (ej: Pixel 4)
4. Selecciona una versión de Android (ej: API 34)
5. Haz clic en **"Next"** y luego **"Finish"**
6. Espera a que se descargue (5-10 minutos)
7. Haz clic en el botón de play (▶️) para iniciar el emulador

### Opción B: Usar Dispositivo Físico

1. Conecta tu teléfono Android con USB
2. Habilita "Depuración USB" en Configuración → Opciones de Desarrollador
3. Android Studio debería detectar el dispositivo

## Paso 3: Compilar la APK

### Método 1: Ejecutar en Dispositivo (Más Fácil)

1. Asegúrate de que el emulador esté corriendo o el dispositivo conectado
2. Haz clic en el botón **Run** (▶️) en la barra de herramientas
3. O presiona **Shift + F10**
4. Selecciona el dispositivo/emulador
5. Haz clic en **OK**
6. Espera a que compile y se instale (2-5 minutos)

### Método 2: Generar APK para Distribuir

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Espera a que compile
3. Verás un mensaje: "Build successful"
4. Haz clic en **"Locate"** para abrir la carpeta
5. La APK estará en: `app/build/outputs/apk/debug/app-debug.apk`

## Paso 4: Instalar en Dispositivo

### Si compilaste con Run:
- La app se instala automáticamente
- Se abrirá en el dispositivo

### Si generaste APK manualmente:
1. Conecta el dispositivo con USB
2. Abre Terminal y ejecuta:
   ```bash
   adb install ChatP2P/app/build/outputs/apk/debug/app-debug.apk
   ```
3. O arrastra el APK al emulador

## Paso 5: Probar la App

1. Abre la app en el dispositivo
2. Crea un usuario con un nombre
3. Copia tu wallet address
4. Abre la app en otro dispositivo/emulador
5. Crea otro usuario
6. Inicia una conversación usando el wallet del primer usuario
7. Envía un mensaje
8. Verifica que llegue en tiempo real

## Solución de Problemas

### Error: "Gradle sync failed"
- File → Invalidate Caches
- Selecciona "Invalidate and Restart"
- Espera a que reinicie

### Error: "Unable to find modules to build"
- Build → Clean Project
- Build → Rebuild Project

### La app no carga en el emulador
- Verifica que el emulador esté corriendo
- Abre Logcat (View → Tool Windows → Logcat)
- Busca errores en rojo

### Los mensajes no llegan
- Abre la consola del navegador (F12 en el emulador)
- Busca "✅ Conectado a Firebase"
- Si no aparece, verifica la conexión a internet

### Error de permisos
- El AndroidManifest.xml ya tiene los permisos necesarios
- Si falta algo, Android Studio lo indicará

## Comandos Útiles

```bash
# Limpiar proyecto
./gradlew clean

# Compilar solo
./gradlew build

# Compilar y ejecutar
./gradlew installDebug

# Ver logs en tiempo real
adb logcat

# Listar dispositivos conectados
adb devices
```

## Estructura de Archivos Importante

```
ChatP2P/
├── app/
│   ├── src/main/
│   │   ├── java/com/chatp2p/MainActivity.java
│   │   ├── res/
│   │   │   ├── layout/activity_main.xml
│   │   │   └── values/
│   │   ├── assets/
│   │   │   ├── index.html
│   │   │   ├── app.js
│   │   │   └── styles.css
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## Notas Importantes

✅ La app carga `index.html` desde los assets
✅ Los datos se guardan en localStorage
✅ Firebase se conecta automáticamente
✅ Los mensajes se sincronizan en tiempo real
✅ El wallet se genera automáticamente

## Próximos Pasos

1. Compila la app
2. Prueba en el emulador
3. Verifica que los mensajes lleguen
4. Genera APK para distribuir

¡Listo! La app debería funcionar sin problemas.
