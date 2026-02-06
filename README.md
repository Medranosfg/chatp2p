# ChatP2P v8.0 - Android Studio Project

Aplicación de chat P2P seguro con Firebase Realtime Database.

## Requisitos

- Android Studio 2022.1 o superior
- JDK 11 o superior
- Android SDK 24 (API 24) o superior
- Gradle 8.0 o superior

## Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <repository-url>
   cd ChatP2P
   ```

2. **Abrir en Android Studio**
   - Abre Android Studio
   - Selecciona "Open an existing Android Studio project"
   - Navega a la carpeta `ChatP2P` y selecciona
   - Espera a que Gradle sincronice

3. **Configurar Firebase**
   - Descarga el archivo `google-services.json` desde Firebase Console
   - Colócalo en `app/google-services.json`
   - Sincroniza Gradle nuevamente

4. **Compilar y ejecutar**
   - Conecta un dispositivo Android o inicia un emulador
   - Haz clic en "Run" o presiona Shift+F10

## Características

✅ Color verde (#1a4d2e) más visible en toda la interfaz
✅ Editar nombre de usuario
✅ Guardar cambios en Firebase
✅ Borrar usuario y todos sus datos
✅ Generar y mostrar dirección de billetera
✅ Copiar billetera al portapapeles
✅ Chat P2P en tiempo real

## Estructura del Proyecto

```
ChatP2P/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/chatp2p/
│   │       │   ├── MainActivity.java
│   │       │   ├── SettingsActivity.java
│   │       │   ├── WalletService.java
│   │       │   ├── UserService.java
│   │       │   └── UserPreferences.java
│   │       ├── res/
│   │       │   ├── layout/
│   │       │   ├── values/
│   │       │   └── drawable/
│   │       └── AndroidManifest.xml
│   ├── build.gradle
│   └── google-services.json
├── build.gradle
├── settings.gradle
└── README.md
```

## Configuración de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Realtime Database
4. Descarga `google-services.json`
5. Colócalo en `app/google-services.json`

## Notas de Desarrollo

- La billetera se genera automáticamente en la primera ejecución
- Los datos se guardan en SharedPreferences localmente
- Firebase sincroniza los datos en tiempo real
- El color verde (#1a4d2e) es el color primario de la aplicación

## Licencia

MIT
