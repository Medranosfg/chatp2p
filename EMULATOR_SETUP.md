# Configurar Emulador en Android Studio - Guía Paso a Paso

## Paso 1: Abre Android Studio

1. Inicia Android Studio
2. Abre el proyecto ChatP2P (File → Open → `/Users/jhonathanmedrano/chatp2p/ChatP2P`)

## Paso 2: Abre Device Manager

1. En la barra de herramientas superior, haz clic en **"Device Manager"**
   - O ve a: **Tools → Device Manager**

## Paso 3: Crea un Nuevo Dispositivo Virtual

1. Haz clic en el botón **"Create Device"** (o el icono de +)
2. Se abrirá la ventana "Select Hardware"

## Paso 4: Selecciona un Dispositivo

1. En la lista de la izquierda, selecciona **"Pixel 4"** (o cualquier Pixel)
2. Haz clic en **"Next"**

## Paso 5: Selecciona la Versión de Android

1. Se abrirá "Select a system image"
2. Busca **"API 34"** (o la más reciente disponible)
3. Si no está descargada, haz clic en el botón de descarga (↓)
4. Espera a que se descargue (5-10 minutos)
5. Una vez descargada, selecciónala
6. Haz clic en **"Next"**

## Paso 6: Configura el Emulador

1. Se abrirá "Android Virtual Device (AVD) Configuration"
2. Puedes dejar los valores por defecto
3. Nombre sugerido: "Pixel_4_API_34"
4. Haz clic en **"Finish"**

## Paso 7: Inicia el Emulador

1. Verás el dispositivo en la lista de Device Manager
2. Haz clic en el botón de play (▶️) para iniciar
3. Espera a que cargue (2-3 minutos)
4. Verás la pantalla de inicio de Android

## Paso 8: Verifica que Funciona

1. El emulador debería mostrar la pantalla de inicio
2. Puedes deslizar hacia arriba para ver las apps
3. Abre Chrome o cualquier app para verificar

## Paso 9: Compila la App

1. Una vez que el emulador esté corriendo:
2. Haz clic en el botón **Run** (▶️) en la barra de herramientas
3. O presiona **Shift + F10**
4. Se abrirá "Select Deployment Target"
5. Selecciona el emulador que acabas de crear
6. Haz clic en **"OK"**
7. Espera a que compile e instale (2-5 minutos)

## Paso 10: Prueba la App

1. La app se abrirá automáticamente en el emulador
2. Deberías ver la interfaz de ChatP2P
3. Crea un usuario
4. Copia tu wallet address
5. ¡Listo!

## Solución de Problemas

### El emulador no inicia
- Verifica que tengas suficiente espacio en disco (5GB mínimo)
- Cierra Android Studio y reinicia
- Intenta crear un dispositivo más pequeño (Pixel 3 en lugar de Pixel 4)

### El emulador es muy lento
- Aumenta la RAM asignada:
  - Device Manager → Editar dispositivo → Mostrar opciones avanzadas
  - Aumenta "RAM" a 4GB o más
- Habilita "Use Host GPU" si está disponible

### La app no se instala
- Limpia el proyecto: Build → Clean Project
- Reconstruye: Build → Rebuild Project
- Intenta de nuevo

### No hay conexión a internet en el emulador
- El emulador debería tener internet automáticamente
- Si no funciona, reinicia el emulador
- Verifica que tu Mac tenga conexión a internet

### Los mensajes no llegan
- Abre la consola del navegador (F12)
- Busca "✅ Conectado a Firebase"
- Si no aparece, verifica la conexión a internet del emulador

## Comandos Útiles

```bash
# Listar dispositivos virtuales disponibles
emulator -list-avds

# Iniciar emulador desde terminal
emulator -avd Pixel_4_API_34

# Listar dispositivos conectados/emuladores
adb devices

# Ver logs en tiempo real
adb logcat

# Instalar APK manualmente
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Requisitos Mínimos

- macOS 10.14 o superior
- 8GB RAM (16GB recomendado)
- 10GB espacio en disco
- Conexión a internet

## Notas

✅ El emulador es más lento que un dispositivo físico
✅ Pero es perfecto para desarrollo y pruebas
✅ Puedes tener múltiples emuladores
✅ El emulador se guarda en caché después de la primera ejecución

¡Listo! Ahora tienes un emulador configurado y listo para usar.
