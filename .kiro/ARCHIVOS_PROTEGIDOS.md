# 🔒 ARCHIVOS PROTEGIDOS - NO MODIFICAR

## ⚠️ ADVERTENCIA CRÍTICA

Los siguientes archivos contienen código de seguridad crítico que **FUNCIONA CORRECTAMENTE**.

**NO MODIFICAR BAJO NINGUNA CIRCUNSTANCIA** sin autorización explícita del usuario.

## 📱 Archivos Protegidos

### iOS - Protección Anti-Captura
**Archivo**: `ios/ChatP2P/ViewController.swift`

**Funciones Críticas**:
- `preventScreenCapture()` - Usa `disableUpdateMask` de CALayer (técnica de WhatsApp)
- `hideLayerFromCapture()` - Implementación de la API privada
- `userWillTakeScreenshot()` - Cierra app si se detecta captura
- `screenCaptureChanged()` - Bloquea grabación de pantalla
- `showRecordingBlocker()` / `hideRecordingBlocker()` - Overlay de bloqueo
- `showPrivacyScreen()` / `hidePrivacyScreen()` - Protección en segundo plano

**Estado**: ✅ FUNCIONA - Bloquea capturas como WhatsApp

### Android - FLAG_SECURE
**Archivos**: 
- `app/src/main/java/com/chatp2p/MainActivity.java`
- `src/main/java/com/chatp2p/MainActivity.java`

**Funciones Críticas**:
- `onCreate()` - Configuración de FLAG_SECURE
- `startContinuousSecurityCheck()` - Verificación cada 100ms
- `onResume()` / `onPause()` / `onStop()` - Re-aplicación de protección

**Estado**: ✅ FUNCIONA - Bloquea capturas al 100%

### Frontend - Zoom con Gestos
**Archivo**: `app.js` (y copias en assets)

**Funciones Críticas**:
- Pinch-to-zoom en cámara (líneas 1540-1700 aprox)
- Event listeners de touch para zoom
- Indicador de zoom temporal

**Estado**: ✅ FUNCIONA - Zoom con 2 dedos

### Estilos - Iconos Grises
**Archivos**: `index.html` (y copias en assets)

**Variables CSS Críticas**:
- `--text-secondary: #8e8e93` (gris, NO verde)
- `.media-btn` usa `currentColor`

**Estado**: ✅ FUNCIONA - Iconos en gris

## 🚫 Reglas de Protección

1. **NO modificar** ninguna función de seguridad sin autorización
2. **NO cambiar** la implementación de `disableUpdateMask`
3. **NO remover** FLAG_SECURE de Android
4. **NO tocar** el código de zoom con gestos
5. **NO cambiar** colores de iconos a verde

## ✅ Qué SÍ se puede modificar

- Agregar nuevas funcionalidades que NO afecten seguridad
- Modificar UI/UX que NO toque los archivos protegidos
- Agregar features en archivos NUEVOS
- Actualizar dependencias (con precaución)

## 📋 Checklist de Verificación

Antes de cualquier cambio, verificar:

- [ ] ¿El cambio afecta algún archivo protegido?
- [ ] ¿El cambio modifica funciones de seguridad?
- [ ] ¿El cambio puede romper la protección anti-captura?
- [ ] ¿El cambio afecta FLAG_SECURE en Android?
- [ ] ¿El cambio modifica el zoom con gestos?

Si la respuesta es SÍ a cualquiera, **NO PROCEDER** sin autorización.

## 🔐 Técnicas Implementadas

### iOS - disableUpdateMask
```swift
// Propiedad privada de CALayer
// Base64: "ZGlzYWJsZVVwZGF0ZU1hc2s="
// Flags: (1 << 1) | (1 << 4) = 18
layer.setValue(NSNumber(value: 18), forKey: "disableUpdateMask")
```

**Esta es la técnica que usa WhatsApp** - NO cambiar.

### Android - FLAG_SECURE
```java
getWindow().setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
);
```

**Protección oficial de Android** - NO cambiar.

## 📞 Contacto

Si necesitas modificar algo de los archivos protegidos:
1. Consultar con el usuario PRIMERO
2. Explicar exactamente qué y por qué
3. Esperar autorización explícita
4. Hacer backup antes de cualquier cambio

## ⚠️ Consecuencias de Modificar

Modificar estos archivos sin autorización puede:
- ❌ Romper la protección anti-captura
- ❌ Permitir capturas de pantalla
- ❌ Romper el zoom con gestos
- ❌ Cambiar colores de iconos
- ❌ Hacer que la app no funcione

## ✅ Estado Final

**Fecha**: 2025
**Versión iOS**: 18.3
**Estado**: FUNCIONA CORRECTAMENTE

**NO TOCAR** - La app está lista y funcional.
