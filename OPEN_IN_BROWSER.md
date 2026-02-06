# 🌐 Abrir ChatP2P en el Navegador

## Opción 1: Abrir directamente (Más fácil)

1. Navega a la carpeta `ChatP2P`
2. Haz doble clic en `index.html`
3. Se abrirá en tu navegador predeterminado

## Opción 2: Usar un servidor local (Recomendado)

### En Windows:
```bash
# Abre PowerShell en la carpeta ChatP2P
python -m http.server 8000
# O si tienes Python 2:
python -m SimpleHTTPServer 8000
```

### En Mac/Linux:
```bash
cd ChatP2P
python3 -m http.server 8000
```

Luego abre en tu navegador:
```
http://localhost:8000
```

## Opción 3: Usar Live Server (VS Code)

1. Abre la carpeta `ChatP2P` en VS Code
2. Instala la extensión "Live Server"
3. Haz clic derecho en `index.html`
4. Selecciona "Open with Live Server"

---

## ✨ Características

✅ Color verde (#1a4d2e) visible en toda la interfaz
✅ Editar nombre de usuario
✅ Guardar cambios en Firebase
✅ Borrar usuario y todos sus datos
✅ Generar dirección de billetera automáticamente
✅ Copiar billetera al portapapeles
✅ Chat P2P en tiempo real

---

## 📁 Archivos Necesarios

```
ChatP2P/
├── index.html          ← Interfaz principal
├── styles.css          ← Estilos
├── app.js              ← Lógica de la aplicación
└── (otros archivos)
```

---

## 🔧 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (para Firebase)
- JavaScript habilitado

---

## 🐛 Solución de Problemas

### "No se carga la página"
- Verifica que `index.html`, `styles.css` y `app.js` estén en la misma carpeta
- Intenta abrir en otro navegador

### "Firebase no funciona"
- Verifica tu conexión a Internet
- Abre la consola (F12) para ver errores

### "Los estilos no se ven"
- Recarga la página (Ctrl+R o Cmd+R)
- Limpia el caché (Ctrl+Shift+Delete)

---

## 📱 Responsive

La aplicación está optimizada para:
- 📱 Dispositivos móviles
- 💻 Tablets
- 🖥️ Computadoras de escritorio

---

## 🎯 Próximos Pasos

1. Crea un usuario con un nombre
2. Copia tu dirección de billetera
3. Abre Configuración (⚙️)
4. Prueba cambiar usuario
5. Crea nuevas conversaciones

¡Listo! Tu app ChatP2P está lista para usar en el navegador. 🎉
