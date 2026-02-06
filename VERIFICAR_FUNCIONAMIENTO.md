# Verificar que ChatP2P Funciona

## 🚀 Inicio Rápido

### 1. Verificar Setup Completo
Abre en tu navegador:
```
http://localhost:8000/verify-setup.html
```

**Qué debe pasar:**
- ✅ Firebase SDK
- ✅ Firebase Inicializado
- ✅ Conexión Firebase
- ✅ Escribir en Firebase
- ✅ Leer de Firebase
- ✅ Escribir Mensajes
- ✅ Escribir Chats
- ✅ Listener Tiempo Real

Si ves ❌ en alguno, especialmente "PERMISSION_DENIED", necesitas:
1. Ir a https://console.firebase.google.com
2. Seleccionar proyecto "p2pchat-60bd1"
3. Ir a Realtime Database → Rules
4. Cambiar a:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. Publicar

### 2. Probar Mensajes en Tiempo Real
Abre en tu navegador:
```
http://localhost:8000/test-messages.html
```

**Qué debe pasar:**
- Dos usuarios se crean automáticamente
- Cada usuario tiene su wallet
- Usuario 1 escribe un mensaje
- Usuario 2 lo recibe en tiempo real
- Ambos muestran "✅ Conectado a Firebase"

### 3. Probar App Principal
Abre en tu navegador:
```
http://localhost:8000
```

**Qué debe pasar:**
1. Aparece modal "Crear Usuario"
2. Se muestra tu wallet (0x...)
3. Escribes tu nombre
4. Haces clic en "Continuar"
5. Ves la pantalla de chats (vacía)
6. Haces clic en ➕ para nuevo chat
7. Escribes wallet de otro usuario
8. Haces clic en "Iniciar"
9. Se abre el chat
10. Escribes un mensaje
11. El mensaje aparece en tu lado

### 4. Probar con Dos Usuarios
1. Abre la app en **dos ventanas diferentes**
2. En Ventana 1:
   - Crea usuario "Alice"
   - Copia tu wallet
3. En Ventana 2:
   - Crea usuario "Bob"
   - Copia tu wallet
4. En Ventana 1:
   - Haz clic en ➕
   - Pega wallet de Bob
   - Haz clic en "Iniciar"
5. En Ventana 2:
   - Haz clic en ➕
   - Pega wallet de Alice
   - Haz clic en "Iniciar"
6. En Ventana 1:
   - Escribe "Hola Bob"
   - Presiona Enter
7. En Ventana 2:
   - **Deberías ver "Hola Bob" aparecer en tiempo real**

## 🔍 Debugging

### Si los mensajes no llegan:

**Paso 1: Abre la consola (F12)**
```
Presiona F12 → Console
```

**Paso 2: Envía un mensaje y busca:**
```
✅ Mensaje guardado en Firebase
```

Si ves:
```
❌ Error guardando mensaje en Firebase: PERMISSION_DENIED
```

Entonces necesitas arreglar las reglas de Firebase (ver arriba).

**Paso 3: Verifica Firebase Console**
1. Abre https://console.firebase.google.com
2. Selecciona "p2pchat-60bd1"
3. Realtime Database → Data
4. Busca `/messages/` y `/chats/`
5. Deberías ver tus datos guardados

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| PERMISSION_DENIED | Reglas de Firebase | Cambiar reglas a public read/write |
| NETWORK_ERROR | Sin conexión | Verificar internet |
| Firebase not initialized | SDK no cargó | Refrescar página |
| No hay datos | Reglas bloquean lectura | Cambiar reglas |

## 📋 Checklist de Verificación

- [ ] verify-setup.html muestra todos ✅
- [ ] test-messages.html funciona
- [ ] App principal carga
- [ ] Puedo crear usuario
- [ ] Puedo crear chat
- [ ] Puedo enviar mensaje
- [ ] Mensaje aparece en mi lado
- [ ] Mensaje aparece en otro usuario (en tiempo real)
- [ ] Console no muestra errores

## 🎯 Resultado Esperado

**Cuando todo funciona:**
1. Dos usuarios pueden chatear en tiempo real
2. Los mensajes llegan instantáneamente
3. La consola muestra "✅ Mensaje guardado en Firebase"
4. Firebase Console muestra los datos en `/messages/` y `/chats/`
5. No hay errores en la consola

## 📞 Si Algo No Funciona

1. Ejecuta `verify-setup.html` - te dirá exactamente qué está mal
2. Revisa la consola (F12) para ver errores específicos
3. Verifica Firebase Console para ver si los datos se guardan
4. Comprueba que las reglas de Firebase permiten read/write

## 🚀 Próximos Pasos

Una vez que todo funcione:
1. Prueba con múltiples usuarios
2. Prueba en Android APK
3. Verifica que los mensajes persistan
4. Implementa autenticación para producción
