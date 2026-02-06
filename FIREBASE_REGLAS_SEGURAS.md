# Firebase Reglas Seguras

## Reglas Actuales (Públicas)

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Esto funciona pero es inseguro.

## Reglas Mejoradas (Recomendadas)

Para que funcione pero sea más seguro, usa estas reglas:

```json
{
  "rules": {
    "messages": {
      "$key": {
        ".read": true,
        ".write": true,
        "$msgId": {
          ".validate": "newData.hasChildren(['from', 'text', 'timestamp'])"
        }
      }
    },
    "chats": {
      "$wallet": {
        ".read": true,
        ".write": true
      }
    },
    "users": {
      "$wallet": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Cómo Cambiar

1. Abre: https://console.firebase.google.com
2. Selecciona: p2pchat-60bd1
3. Realtime Database → Rules
4. Reemplaza con las reglas mejoradas arriba
5. Haz clic: Publish

## Qué Hacen Estas Reglas

- ✅ Permite leer/escribir mensajes
- ✅ Permite leer/escribir chats
- ✅ Permite leer/escribir usuarios
- ✅ Valida que los mensajes tengan los campos correctos
- ⚠️ Sigue siendo relativamente abierto (para desarrollo)

## Para Producción

Para una app real, necesitarías autenticación:

```json
{
  "rules": {
    "messages": {
      "$key": {
        ".read": true,
        ".write": "auth != null",
        "$msgId": {
          ".validate": "newData.hasChildren(['from', 'text', 'timestamp']) && newData.child('from').val() == auth.uid"
        }
      }
    },
    "chats": {
      "$wallet": {
        ".read": "auth != null",
        ".write": "auth.uid == $wallet"
      }
    }
  }
}
```

Pero esto requeriría implementar autenticación en la app.

## Por Ahora

Usa las **Reglas Mejoradas** arriba. Son suficientemente seguras para desarrollo y permiten que la app funcione correctamente.

## Verificación

Después de cambiar las reglas:

1. Abre http://localhost:8000 en dos ventanas
2. Crea usuarios
3. Envía mensajes
4. Verifica que llegan en tiempo real

Los mensajes deberían funcionar igual que antes, pero con más validación.
