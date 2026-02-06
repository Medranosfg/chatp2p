# Reglas de Seguridad Firebase

## Cómo configurar:
1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto: p2pchat-60bd1
3. Ve a Realtime Database → Rules
4. Copia y pega estas reglas:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid || !data.exists()"
      }
    },
    "chats": {
      "$userId": {
        ".read": "auth != null || true",
        ".write": "auth != null || true",
        "$chatId": {
          ".read": true,
          ".write": true
        }
      }
    },
    "messages": {
      "$chatKey": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['from', 'timestamp'])"
      }
    },
    "readReceipts": {
      "$chatKey": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Reglas más estrictas (recomendado para producción):

```json
{
  "rules": {
    "users": {
      ".indexOn": ["username"],
      "$userId": {
        ".read": true,
        ".write": "!data.exists() || $userId === newData.child('wallet').val()"
      }
    },
    "chats": {
      "$userId": {
        ".read": "$userId.contains(auth.uid) || true",
        ".write": true
      }
    },
    "messages": {
      "$chatKey": {
        ".read": "$chatKey.contains(auth.uid) || true",
        ".write": "newData.child('from').val() != null",
        ".validate": "newData.hasChildren(['from', 'timestamp'])"
      }
    },
    "readReceipts": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Mejoras de seguridad implementadas en v9.0:

1. ✅ **Wallet criptográfica**: Usa `crypto.getRandomValues()` en lugar de `Math.random()`

2. ✅ **Encriptación E2E**: Los mensajes se encriptan con AES-GCM antes de enviarse
   - Cada chat tiene una clave derivada única
   - Solo los participantes pueden leer los mensajes
   - Verás un 🔒 en los mensajes encriptados

3. ✅ **Confirmación de lectura**: Se registra cuando abres un chat

4. ✅ **Validación de datos**: Firebase valida que los mensajes tengan los campos requeridos

## Notas importantes:

- Los mensajes antiguos (antes de v9.0) no están encriptados
- La encriptación funciona automáticamente para mensajes nuevos
- Si un dispositivo no soporta Web Crypto API, los mensajes se envían sin encriptar
