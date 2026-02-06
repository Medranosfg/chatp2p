# 📱 Guía de Publicación en Google Play Store

## 1️⃣ CREAR KEYSTORE (Firma de la App)

Abre Terminal y ejecuta:

```bash
keytool -genkey -v -keystore chatp2p-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chatp2p
```

Te pedirá:
- **Password del keystore**: (guárdalo en lugar seguro)
- **Nombre y apellido**: Tu nombre
- **Unidad organizativa**: ChatP2P
- **Organización**: ChatP2P
- **Ciudad**: Tu ciudad
- **Estado/Provincia**: Tu estado
- **Código de país**: MX (o tu país)

⚠️ **IMPORTANTE**: Guarda el archivo `.jks` y las contraseñas en un lugar seguro. Si los pierdes, no podrás actualizar la app.

---

## 2️⃣ CONFIGURAR FIRMA EN build.gradle

Después de crear el keystore, edita `build.gradle`:

```groovy
signingConfigs {
    release {
        storeFile file('chatp2p-release-key.jks')
        storePassword 'TU_PASSWORD'
        keyAlias 'chatp2p'
        keyPassword 'TU_KEY_PASSWORD'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... resto de configuración
    }
}
```

---

## 3️⃣ GENERAR AAB (Android App Bundle)

En Android Studio:
1. **Build > Generate Signed Bundle / APK**
2. Selecciona **Android App Bundle**
3. Selecciona tu keystore
4. Ingresa passwords
5. Selecciona **release**
6. Click **Create**

El archivo `.aab` estará en: `app/release/app-release.aab`

---

## 4️⃣ INFORMACIÓN PARA GOOGLE PLAY CONSOLE

### Nombre de la App
```
ChatP2P - Chat Privado P2P
```

### Descripción Corta (80 caracteres)
```
Chat privado con encriptación E2E. Sin número de teléfono. Anónimo y seguro.
```

### Descripción Completa
```
ChatP2P es una aplicación de mensajería privada que prioriza tu seguridad y anonimato.

🔐 CARACTERÍSTICAS PRINCIPALES:

• Encriptación de extremo a extremo (E2E)
• Sin registro con número de teléfono
• Identificación por wallet única
• Mensajes de texto encriptados
• Envío de fotos y videos
• Notas de voz
• Indicador de escritura en tiempo real
• Estado en línea/desconectado
• Confirmación de lectura (doble check)

🛡️ PRIVACIDAD TOTAL:

• No recopilamos datos personales
• No se requiere email ni teléfono
• Tus mensajes son solo tuyos
• Protección contra capturas de pantalla

💬 CÓMO FUNCIONA:

1. Abre la app y crea tu nombre de usuario
2. Comparte tu wallet con quien quieras chatear
3. Comienza a enviar mensajes encriptados

ChatP2P es perfecto para quienes valoran su privacidad y quieren comunicarse de forma segura sin exponer su identidad.
```

### Categoría
```
Comunicación
```

### Clasificación de Contenido
```
PEGI 3 / Everyone
```

### Política de Privacidad URL
```
https://tu-dominio.com/privacy (o usa GitHub Pages)
```

---

## 5️⃣ ASSETS NECESARIOS

### Icono de la App
- 512x512 px PNG (ya tienes el logo)

### Screenshots (mínimo 2)
Tamaños recomendados:
- Teléfono: 1080x1920 px
- Tablet 7": 1200x1920 px
- Tablet 10": 1600x2560 px

### Feature Graphic (Imagen destacada)
- 1024x500 px

---

## 6️⃣ CHECKLIST ANTES DE PUBLICAR

- [ ] Keystore creado y guardado en lugar seguro
- [ ] build.gradle configurado con firma
- [ ] AAB generado correctamente
- [ ] Icono 512x512 preparado
- [ ] Screenshots tomados
- [ ] Feature graphic creado
- [ ] Política de privacidad publicada
- [ ] Descripción lista
- [ ] Cuenta de Google Play verificada

---

## 7️⃣ SUBIR A GOOGLE PLAY CONSOLE

1. Ve a https://play.google.com/console
2. **Crear aplicación**
3. Completa la información básica
4. Sube el AAB en **Producción > Crear nueva versión**
5. Completa la ficha de Play Store
6. Configura precios (Gratis)
7. Completa el cuestionario de clasificación
8. Envía para revisión

---

## ⏱️ TIEMPO DE REVISIÓN

- Primera revisión: 1-7 días
- Actualizaciones: 1-3 días

---

## 📞 SOPORTE

Si tienes problemas, revisa:
- https://support.google.com/googleplay/android-developer
