# Guía de Configuración - Android Studio

## Paso 1: Descargar Android Studio

1. Ve a [developer.android.com](https://developer.android.com/studio)
2. Descarga Android Studio para tu sistema operativo
3. Instala siguiendo las instrucciones

## Paso 2: Abrir el Proyecto

1. Abre Android Studio
2. En la pantalla de bienvenida, haz clic en **"Open"**
3. Navega a la carpeta `ChatP2P` (donde está este archivo)
4. Selecciona la carpeta y haz clic en **"Open"**

## Paso 3: Esperar Sincronización

- Android Studio descargará automáticamente las dependencias
- Esto puede tomar 5-10 minutos la primera vez
- Verás un mensaje "Gradle sync finished" cuando esté listo

## Paso 4: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "ChatP2P"
3. Habilita "Realtime Database"
4. Descarga el archivo `google-services.json`
5. Colócalo en: `ChatP2P/app/google-services.json`
6. Sincroniza Gradle nuevamente (Ctrl+Shift+S o Cmd+Shift+S)

## Paso 5: Ejecutar la Aplicación

### Opción A: Emulador (Recomendado para principiantes)

1. Haz clic en **"AVD Manager"** (icono de teléfono)
2. Haz clic en **"Create Virtual Device"**
3. Selecciona un dispositivo (ej: Pixel 4)
4. Selecciona una versión de Android (API 30 o superior)
5. Haz clic en **"Finish"**
6. Inicia el emulador haciendo clic en el botón de play
7. Espera a que el emulador se cargue completamente

### Opción B: Dispositivo Físico

1. Conecta tu dispositivo Android con USB
2. Habilita "Depuración USB" en Configuración > Opciones de Desarrollador
3. Autoriza la conexión en tu dispositivo

## Paso 6: Compilar y Ejecutar

1. Haz clic en el botón **"Run"** (icono de play verde)
2. O presiona **Shift+F10** (Windows/Linux) o **Ctrl+R** (Mac)
3. Selecciona el dispositivo/emulador
4. Espera a que se compile y ejecute

## Solución de Problemas

### "Gradle sync failed"
- Haz clic en "Try Again"
- Si persiste, ve a File > Invalidate Caches > Invalidate and Restart

### "SDK not found"
- Ve a File > Settings > Appearance & Behavior > System Settings > Android SDK
- Descarga la API 30 o superior

### "google-services.json not found"
- Asegúrate de que el archivo esté en `app/google-services.json`
- Sincroniza Gradle nuevamente

### La aplicación no se ejecuta
- Verifica que el emulador o dispositivo esté conectado
- Haz clic en "Run" nuevamente

## Estructura de Carpetas

```
ChatP2P/
├── app/
│   ├── src/main/
│   │   ├── java/com/chatp2p/     ← Código Java
│   │   ├── res/                  ← Recursos (layouts, colores, etc)
│   │   └── AndroidManifest.xml   ← Configuración de la app
│   ├── build.gradle              ← Dependencias
│   └── google-services.json      ← Configuración Firebase
├── build.gradle                  ← Configuración del proyecto
└── settings.gradle               ← Configuración de módulos
```

## Próximos Pasos

Una vez que la aplicación esté ejecutándose:

1. Crea un usuario ingresando un nombre
2. Copia tu dirección de billetera
3. Abre Configuración (⚙️)
4. Prueba cambiar usuario o borrar usuario
5. Crea nuevas conversaciones

## Documentación

- Requisitos: `.kiro/specs/chatp2p-v8-improvements/requirements.md`
- Diseño: `.kiro/specs/chatp2p-v8-improvements/design.md`
- Tareas: `.kiro/specs/chatp2p-v8-improvements/tasks.md`

¡Listo! Tu proyecto ChatP2P está configurado en Android Studio.
