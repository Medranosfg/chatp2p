# Android Studio Setup - ChatP2P v8.0

## Pasos para abrir en Android Studio

### 1. Abre Android Studio
- Inicia Android Studio en tu Mac

### 2. Abre el proyecto
- Selecciona **File → Open**
- Navega a `/Users/jhonathanmedrano/chatp2p/ChatP2P`
- Haz clic en **Open**

### 3. Espera a que Gradle se sincronice
- Android Studio descargará las dependencias automáticamente
- Esto puede tomar 2-5 minutos la primera vez
- Verás un mensaje "Gradle sync finished" cuando esté listo

### 4. Configura el JDK (si es necesario)
- Si ves un error sobre JDK, ve a **Android Studio → Preferences**
- Busca "JDK location"
- Selecciona **Embedded JDK** (recomendado)
- Haz clic en **Apply** y **OK**

### 5. Ejecuta la app
- Conecta un dispositivo Android o abre un emulador
- Haz clic en el botón **Run** (▶️) en la barra de herramientas
- O presiona **Shift + F10**

## Estructura del proyecto

```
ChatP2P/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/chatp2p/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   │   └── activity_main.xml
│   │   │   │   └── values/
│   │   │   │       ├── colors.xml
│   │   │   │       ├── strings.xml
│   │   │   │       └── themes.xml
│   │   │   ├── assets/
│   │   │   │   ├── index.html
│   │   │   │   ├── app.js
│   │   │   │   └── styles.css
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   ├── build.gradle
│   ├── google-services.json
│   └── proguard-rules.pro
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## Características

✅ WebView que carga la app web de ChatP2P
✅ Firebase Realtime Database integrado
✅ Sincronización de mensajes en tiempo real
✅ Generación de wallet automática
✅ Interfaz verde (#2ecc71) visible
✅ Soporte para Android 7.0+ (API 24+)

## Requisitos

- Android Studio 2022.1 o superior
- JDK 11 o superior
- Android SDK 34 (compileSdk)
- Mínimo Android 7.0 (API 24)

## Solución de problemas

### Error: "Could not find method dependencyResolution()"
✅ **SOLUCIONADO** - Se removió el método incompatible del settings.gradle

### Error: "Build was configured to prefer settings repositories"
✅ **SOLUCIONADO** - Se configuró correctamente el build.gradle

### Error: "Unable to find modules to build"
✅ **SOLUCIONADO** - Se creó la estructura correcta del módulo app

### La app no se conecta a Firebase
- Verifica que tengas conexión a internet
- Comprueba que google-services.json esté en `app/`
- Revisa la consola de Firebase en https://console.firebase.google.com

## Notas

- La app carga `index.html` desde los assets de Android
- Los datos se guardan en localStorage (persistencia local)
- Los mensajes se sincronizan a través de Firebase Realtime Database
- El wallet se genera automáticamente y se guarda localmente

¡Listo! Ahora puedes abrir el proyecto en Android Studio sin errores de Gradle.
