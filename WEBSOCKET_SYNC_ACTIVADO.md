# WebSocket Sync - ACTIVADO ✅

## Cambio Importante

Se ha implementado un **servidor WebSocket** para sincronización de mensajes en tiempo real, **sin depender de Firebase**.

## ¿Qué Cambió?

### Antes
- Los mensajes se guardaban en Firebase
- Dependía de las reglas de seguridad de Firebase
- Si las reglas eran restrictivas, los mensajes no llegaban

### Ahora
- Los mensajes se sincronizan a través de WebSocket
- Servidor local en `ws://localhost:8001`
- Los mensajes llegan instantáneamente entre usuarios
- No depende de Firebase

## Cómo Funciona

1. **Usuario 1** envía un mensaje
2. El mensaje se guarda localmente en localStorage
3. Se envía por WebSocket al servidor
4. El servidor lo reenvía a **Usuario 2**
5. Usuario 2 lo recibe instantáneamente
6. Se guarda en localStorage de Usuario 2

## Servidores Activos

### HTTP Server (App Web)
```
http://localhost:8000
```
- Sirve la app web
- Python HTTP Server

### WebSocket Server (Sincronización)
```
ws://localhost:8001
```
- Sincroniza mensajes en tiempo real
- Python WebSocket Server

## Cómo Probar

### Opción 1: Dos Navegadores
1. Abre http://localhost:8000 en Ventana 1
2. Abre http://localhost:8000 en Ventana 2
3. Crea usuario en cada ventana
4. Crea chat entre ellos
5. Envía mensaje desde Ventana 1
6. **Deberías verlo aparecer en Ventana 2 instantáneamente**

### Opción 2: Dos Pestañas
1. Abre http://localhost:8000 en Pestaña 1
2. Abre http://localhost:8000 en Pestaña 2
3. Repite los pasos de arriba

## Verificación

Abre la consola (F12) y busca:

**Cuando envías un mensaje:**
```
✅ Mensaje enviado por WebSocket
✅ Mensaje enviado: [tu mensaje]
```

**Cuando recibes un mensaje:**
```
📨 Mensaje recibido: [mensaje del otro usuario]
```

**Conexión WebSocket:**
```
✅ WebSocket conectado
```

## Archivos Modificados

- `ChatP2P/app.js` - Agregada sincronización WebSocket
- `ChatP2P/app/src/main/assets/app.js` - Mismo cambio para Android

## Archivos Nuevos

- `ChatP2P/sync-server.py` - Servidor WebSocket

## Servidor Corriendo

El servidor WebSocket está corriendo en:
```
ws://localhost:8001
```

Si se detiene, reinicia con:
```bash
python3 ChatP2P/sync-server.py
```

## Ventajas

✅ No depende de Firebase
✅ Mensajes llegan instantáneamente
✅ Funciona localmente
✅ Sin problemas de permisos
✅ Sincronización en tiempo real

## Limitaciones

- Solo funciona en la red local (localhost)
- Los mensajes se pierden si el servidor se reinicia
- No hay persistencia en base de datos

## Próximos Pasos

1. Prueba la app con dos usuarios
2. Verifica que los mensajes llegan
3. Abre la consola (F12) para ver los logs
4. Comprueba que todo funciona

## Troubleshooting

### Los mensajes no llegan
1. Verifica que el servidor WebSocket está corriendo
2. Abre la consola (F12)
3. Busca "✅ WebSocket conectado"
4. Si no ves eso, el servidor no está corriendo

### El servidor no inicia
```bash
python3 ChatP2P/sync-server.py
```

### Necesito ver los logs del servidor
El servidor muestra logs en la terminal donde se ejecuta:
```
✅ Cliente registrado: 0x...
📨 Mensaje enviado: 0x... → 0x...
```

## Resumen

**Los mensajes ahora llegan en tiempo real sin depender de Firebase.**

Abre http://localhost:8000 en dos ventanas y prueba.
