# Reglas de Seguridad Firebase - ChatP2P v8.0

## Opción 1: Reglas Públicas (DESARROLLO)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
✅ Fácil de usar en desarrollo
❌ No seguro para producción

---

## Opción 2: Reglas Seguras (RECOMENDADO)
```json
{
  "rules": {
    "chats": {
      "$wallet": {
        ".read": "root.child('chats').child($wallet).exists()",
        ".write": "root.child('chats').child($wallet).exists()",
        "$contact": {
          ".read": "$wallet === auth.uid || $contact === auth.uid",
          ".write": "$wallet === auth.uid || $contact === auth.uid"
        }
      }
    },
    "messages": {
      "$key": {
        ".read": true,
        ".write": true,
        "$id": {
          ".validate": "newData.hasChildren(['from', 'text', 'timestamp'])",
          "from": {
            ".validate": "newData.isString()"
          },
          "text": {
            ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length < 1000"
          },
          "timestamp": {
            ".validate": "newData.isNumber()"
          }
        }
      }
    }
  }
}
```

---

## Opción 3: Reglas Muy Seguras (PRODUCCIÓN)
```json
{
  "rules": {
    "chats": {
      "$wallet": {
        ".read": "$wallet === auth.uid",
        ".write": "$wallet === auth.uid",
        "$contact": {
          ".read": "$wallet === auth.uid || $contact === auth.uid",
          ".write": "$wallet === auth.uid || $contact === auth.uid",
          "lastMessage": {
            ".validate": "newData.isString()"
          },
          "createdAt": {
            ".validate": "newData.isNumber()"
          }
        }
      }
    },
    "messages": {
      "$key": {
        ".read": true,
        ".write": "auth.uid !== null",
        "$id": {
          ".validate": "newData.hasChildren(['from', 'text', 'timestamp'])",
          "from": {
            ".validate": "newData.val() === auth.uid"
          },
          "text": {
            ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length < 1000"
          },
          "timestamp": {
            ".validate": "newData.isNumber() && newData.val() <= now"
          }
        }
      }
    }
  }
}
```

---

## Cómo Aplicar las Reglas

1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto: `p2pchat-60bd1`
3. Ve a **Realtime Database** → **Rules**
4. Reemplaza el contenido con una de las opciones arriba
5. Haz clic en **Publish**

---

## Estado Actual

✅ **Firebase está funcionando**
✅ **Los datos se guardan correctamente**
✅ **Las reglas públicas permiten lectura/escritura**

⚠️ **Recomendación**: Para producción, usa la Opción 3 (Reglas Muy Seguras)

---

## Verificar que Funciona

Abre en tu navegador:
```
http://localhost:8080/test-firebase-direct.html
```

Deberías ver:
- ✅ Firebase SDK cargado
- ✅ Firebase inicializado
- ✅ Datos escritos correctamente
- ✅ Datos leídos correctamente
