# Firebase Rules - Solución para Mensajes

## Problema
Los mensajes no llegan entre usuarios porque Firebase tiene reglas de seguridad restrictivas.

## Solución

### 1. Abre Firebase Console
- Ve a: https://console.firebase.google.com
- Selecciona el proyecto "p2pchat-60bd1"

### 2. Ve a Realtime Database
- En el menú izquierdo, haz clic en "Realtime Database"
- Selecciona la base de datos

### 3. Abre la pestaña "Rules"
- Haz clic en la pestaña "Rules" (al lado de "Data")

### 4. Reemplaza las reglas con esto:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "users": {
      ".read": true,
      ".write": true
    },
    "chats": {
      ".read": true,
      ".write": true
    },
    "messages": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 5. Haz clic en "Publish"
- Verás un diálogo de confirmación
- Haz clic en "Publish" para confirmar

### 6. Espera a que se actualice
- Las reglas se aplicarán en 1-2 minutos
- Verás un mensaje de confirmación

## Prueba

Después de actualizar las reglas:

1. Abre la app en dos navegadores diferentes (o dos pestañas en modo incógnito)
2. Crea dos usuarios diferentes
3. Inicia una conversación entre ellos
4. Envía un mensaje desde un usuario
5. Verifica que aparezca en el otro usuario

## Notas de Seguridad

⚠️ **IMPORTANTE**: Estas reglas permiten lectura y escritura pública. 
- Solo úsalas para desarrollo/testing
- Para producción, implementa autenticación y reglas más restrictivas
- Considera usar Firebase Authentication

## Reglas más seguras (para producción)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    "chats": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "messages": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Si sigue sin funcionar

1. Abre la consola del navegador (F12)
2. Busca mensajes de error en la pestaña "Console"
3. Verifica que Firebase esté conectado (debería decir "✅ Conectado a Firebase")
4. Comprueba que la URL de la base de datos sea correcta

## Verificar conexión

En la consola del navegador, ejecuta:
```javascript
console.log(firebase.database().ref().toString());
```

Debería mostrar:
```
https://p2pchat-60bd1-default-rtdb.firebaseio.com/
```
