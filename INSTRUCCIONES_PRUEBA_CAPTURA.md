# 📱 Instrucciones para Probar la Protección de Capturas

## ⚠️ IMPORTANTE: Debes probar en un DISPOSITIVO REAL

La protección de capturas **NO funciona en el simulador de Xcode**. Debes usar un iPhone físico.

## 🔧 Pasos para Compilar y Probar

### 1. Abrir el Proyecto en Xcode
```bash
cd ios/ChatP2P
open ChatP2P.xcodeproj
```

### 2. Conectar tu iPhone
- Conecta tu iPhone al Mac con un cable
- Desbloquea el iPhone
- Si aparece "Trust This Computer", acepta

### 3. Seleccionar tu Dispositivo
- En Xcode, arriba a la izquierda, haz clic en el selector de dispositivo
- Selecciona tu iPhone (no "Any iOS Device" ni simuladores)

### 4. Compilar y Ejecutar
- Presiona `Cmd + R` o haz clic en el botón ▶️ Play
- Si es la primera vez, puede pedir permisos de desarrollador en el iPhone:
  - Ve a: Ajustes > General > VPN y gestión de dispositivos
  - Confía en tu cuenta de desarrollador

### 5. Probar la Protección de Capturas

#### Prueba 1: Captura de Pantalla
1. Abre la app en tu iPhone
2. Navega a cualquier pantalla (login, chat, etc.)
3. Toma una captura de pantalla:
   - **iPhone con Face ID**: Presiona Volume Up + Power al mismo tiempo
   - **iPhone con Touch ID**: Presiona Home + Power al mismo tiempo
4. Ve a la app Fotos y abre la captura que acabas de tomar

**✅ RESULTADO ESPERADO**: La captura debe mostrar una **pantalla completamente negra** en lugar del contenido de la app

**❌ SI VES EL CONTENIDO**: La protección no está funcionando - avísame

#### Prueba 2: Grabación de Pantalla
1. Abre el Centro de Control en tu iPhone
2. Presiona el botón de grabación de pantalla (círculo con punto)
3. Vuelve a la app ChatP2P
4. Deberías ver un **overlay negro con mensaje de "Grabación detectada"**
5. Detén la grabación
6. Ve a Fotos y reproduce el video

**✅ RESULTADO ESPERADO**: 
- Mientras grabas, ves el overlay negro
- El video grabado muestra pantalla negra cuando estás en la app

**❌ SI VES EL CONTENIDO**: La protección no está funcionando - avísame

#### Prueba 3: App en Segundo Plano
1. Con la app abierta, presiona el botón Home o desliza hacia arriba
2. Abre el selector de apps (desliza hacia arriba y mantén)
3. Observa la miniatura de ChatP2P

**✅ RESULTADO ESPERADO**: La miniatura debe mostrar un **icono de candado 🔒** en lugar del contenido

## 🐛 Si la Protección NO Funciona

Envíame esta información:

1. **Modelo de iPhone**: (ej: iPhone 14 Pro, iPhone 12, etc.)
2. **Versión de iOS**: (ve a Ajustes > General > Información)
3. **Qué ves en la captura**: ¿Pantalla negra o el contenido real?
4. **Qué ves en la grabación**: ¿Pantalla negra o el contenido real?
5. **Consola de Xcode**: Copia cualquier mensaje que diga "🔒" o "Protección"

## 📝 Notas Técnicas

### Por qué puede no funcionar:
- **Simulador**: La protección NO funciona en simuladores, solo en dispositivos reales
- **iOS muy antiguo**: Funciona mejor en iOS 13+
- **Jailbreak**: Si el iPhone tiene jailbreak, la protección puede ser bypasseada
- **Modo desarrollador**: Algunas configuraciones de desarrollador pueden interferir

### Cómo funciona:
- Se crean 20 campos de texto invisibles con `isSecureTextEntry = true`
- iOS marca estas áreas como "contenido seguro" (como contraseñas)
- Cuando tomas una captura, iOS oculta automáticamente el contenido seguro
- Es la misma técnica que usan apps bancarias y de mensajería segura

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Estoy probando en un iPhone REAL (no simulador)
- [ ] La app se compiló sin errores
- [ ] La app se ejecuta correctamente (puedo navegar, etc.)
- [ ] Tomé la captura mientras la app estaba en primer plano
- [ ] Revisé la captura en la app Fotos
- [ ] Probé también la grabación de pantalla

## 🚀 Siguiente Paso

Una vez que confirmes que funciona (o no funciona), avísame con los detalles y continuaremos.
