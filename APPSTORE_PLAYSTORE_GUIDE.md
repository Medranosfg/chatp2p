# Guía: Subir ChatP2P a App Store y Play Store

## 📱 App Store (iOS)

### Requisitos del Logo/Icono

1. **Tamaño**: 1024 x 1024 píxeles
2. **Formato**: PNG, JPG, GIF o TIFF
3. **Fondo**: Sin transparencia (fondo sólido requerido)
4. **Esquinas**: Redondeadas automáticamente por App Store
5. **Contenido**: Sin texto, sin bordes, sin efectos de sombra

### Pasos para Subir

1. Ir a [App Store Connect](https://appstoreconnect.apple.com/)
2. Seleccionar tu aplicación
3. Ir a **Información de la app** → **Icono de la app**
4. Subir el archivo PNG de 1024x1024px
5. El sistema generará automáticamente los tamaños necesarios:
   - 1024x1024 (para tienda)
   - 512x512 (para búsqueda)
   - 180x180 (para iPhone)
   - 120x120 (para iPhone)
   - 87x87 (para iPhone)
   - 80x80 (para iPad)
   - 76x76 (para iPad)
   - 40x40 (para Apple Watch)

### Exportar PNG para App Store

```bash
# Usando ImageMagick
convert -background none -size 1024x1024 logo-appstore.svg -background white -flatten logo-appstore-1024.png

# Usando Inkscape
inkscape logo-appstore.svg -w 1024 -h 1024 -o logo-appstore-1024.png
```

### Verificación

- ✅ Icono visible en fondo blanco
- ✅ Icono visible en fondo oscuro
- ✅ Sin transparencia
- ✅ Colores vibrantes
- ✅ Legible en tamaños pequeños

---

## 🤖 Play Store (Android)

### Requisitos del Logo/Icono

1. **Tamaño**: 512 x 512 píxeles (mínimo)
2. **Formato**: PNG con transparencia
3. **Fondo**: Transparente (PNG con canal alfa)
4. **Esquinas**: Redondeadas (Google las recorta automáticamente)
5. **Contenido**: Sin texto, sin bordes

### Pasos para Subir

1. Ir a [Google Play Console](https://play.google.com/console)
2. Seleccionar tu aplicación
3. Ir a **Configuración de la app** → **Icono de la app**
4. Subir el archivo PNG de 512x512px con transparencia
5. Google generará automáticamente los tamaños necesarios:
   - 512x512 (para tienda)
   - 192x192 (para dispositivos)
   - 108x108 (para dispositivos)
   - 81x81 (para dispositivos)
   - 54x54 (para dispositivos)
   - 27x27 (para dispositivos)

### Exportar PNG para Play Store

```bash
# Usando ImageMagick (con transparencia)
convert -background none -size 512x512 logo-appstore.svg logo-playstore-512.png

# Usando Inkscape
inkscape logo-appstore.svg -w 512 -h 512 -o logo-playstore-512.png
```

### Verificación

- ✅ Fondo transparente
- ✅ Icono visible en fondo blanco
- ✅ Icono visible en fondo oscuro
- ✅ Icono visible en fondo de color
- ✅ Legible en tamaños pequeños
- ✅ Sin bordes o sombras

---

## 🌐 Favicon para Web

### Requisitos

1. **Tamaño**: 32x32 píxeles (mínimo)
2. **Formato**: ICO, PNG, SVG
3. **Fondo**: Transparente
4. **Contenido**: Versión simplificada del logo

### Pasos para Agregar a HTML

```html
<!-- En la sección <head> -->
<link rel="icon" type="image/svg+xml" href="/logo-simple.svg">
<link rel="icon" type="image/png" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/favicon-180x180.png">
```

### Exportar PNG para Favicon

```bash
# Favicon 32x32
convert -background none -size 32x32 logo-simple.svg favicon-32x32.png

# Apple Touch Icon 180x180
convert -background none -size 180x180 logo-simple.svg favicon-180x180.png
```

---

## 📸 Capturas de Pantalla

### App Store

- **Tamaño**: 1242 x 2208 píxeles (iPhone 6 Plus)
- **Cantidad**: 2-5 capturas
- **Contenido**: Mostrar características principales

### Play Store

- **Tamaño**: 1080 x 1920 píxeles (teléfono)
- **Cantidad**: 2-8 capturas
- **Contenido**: Mostrar características principales

---

## 📝 Descripción de la App

### App Store

```
ChatP2P - Mensajería Privada P2P

Comunicación segura, privada y efímera entre dos dispositivos.

Características:
• Mensajes que se auto-destruyen después de 22 minutos
• Sin servidores intermediarios - conexión directa P2P
• Envía fotos y videos de forma segura
• Chats que desaparecen cuando los eliminas
• Privacidad total - tus mensajes son solo tuyos
• Interfaz simple y rápida

ChatP2P es la forma más segura de comunicarte sin dejar rastro.
```

### Play Store

```
ChatP2P - Mensajería Privada P2P

Comunicación segura, privada y efímera entre dos dispositivos.

✓ Mensajes que se auto-destruyen después de 22 minutos
✓ Sin servidores intermediarios - conexión directa P2P
✓ Envía fotos y videos de forma segura
✓ Chats que desaparecen cuando los eliminas
✓ Privacidad total - tus mensajes son solo tuyos
✓ Interfaz simple y rápida

ChatP2P es la forma más segura de comunicarte sin dejar rastro.

Privacidad:
- No recopilamos datos personales
- No hay registro de mensajes
- No hay publicidad
- No hay rastreadores

Seguridad:
- Conexión directa entre dispositivos
- Mensajes efímeros
- Sin intermediarios
```

---

## 🎯 Palabras Clave (Keywords)

### App Store
- Mensajería privada
- Chat seguro
- P2P
- Privacidad
- Mensajes efímeros
- Comunicación segura
- Chat anónimo

### Play Store
- Mensajería privada
- Chat seguro
- P2P
- Privacidad
- Mensajes efímeros
- Comunicación segura
- Chat anónimo
- Mensajes que desaparecen

---

## 📋 Checklist Antes de Publicar

### Logo/Icono
- [ ] Logo en 1024x1024px para App Store
- [ ] Logo en 512x512px para Play Store
- [ ] Colores vibrantes y claros
- [ ] Visible en tamaños pequeños
- [ ] Sin texto o bordes

### Información de la App
- [ ] Nombre: ChatP2P
- [ ] Descripción completa
- [ ] Palabras clave relevantes
- [ ] Categoría: Comunicación
- [ ] Clasificación de edad: 4+

### Capturas de Pantalla
- [ ] 2-5 capturas de alta calidad
- [ ] Muestran características principales
- [ ] Texto legible
- [ ] Idioma correcto

### Política de Privacidad
- [ ] Documento completo
- [ ] Explica recopilación de datos (ninguna)
- [ ] Explica uso de datos
- [ ] Enlace accesible

### Términos de Servicio
- [ ] Documento completo
- [ ] Reglas de uso
- [ ] Limitaciones de responsabilidad
- [ ] Enlace accesible

---

## 🚀 Proceso de Publicación

### App Store

1. Preparar icono (1024x1024px PNG)
2. Preparar capturas de pantalla
3. Escribir descripción
4. Agregar palabras clave
5. Seleccionar categoría
6. Establecer precio (gratuito)
7. Enviar para revisión
8. Esperar aprobación (24-48 horas)

### Play Store

1. Preparar icono (512x512px PNG transparente)
2. Preparar capturas de pantalla
3. Escribir descripción
4. Agregar palabras clave
5. Seleccionar categoría
6. Establecer precio (gratuito)
7. Completar formulario de contenido
8. Enviar para revisión
9. Esperar aprobación (2-4 horas)

---

## 💡 Consejos

1. **Icono Memorable**: El logo debe ser reconocible incluso en 32x32px
2. **Colores Consistentes**: Usa la paleta de colores definida
3. **Contraste**: Asegura que sea visible en fondos claros y oscuros
4. **Simplicidad**: Evita detalles que se pierdan en tamaños pequeños
5. **Pruebas**: Visualiza el icono en diferentes tamaños antes de publicar

---

## 📞 Soporte

Si tienes problemas:

1. **App Store**: Contacta a Apple Developer Support
2. **Play Store**: Contacta a Google Play Support
3. **Icono**: Usa herramientas como Figma, Inkscape o Adobe XD

---

## 📚 Referencias

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Apple Design Guidelines](https://developer.apple.com/design/)
- [Material Design Guidelines](https://material.io/design/)
