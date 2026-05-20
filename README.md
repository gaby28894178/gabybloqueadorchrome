# 🛡️ Mi Bloqueador de Anuncios Local

Extensión de Chrome (Manifest V3) que bloquea anuncios, banners y rastreadores de forma nativa usando `declarativeNetRequest`.

## Qué bloquea

- Google Ads (`*googleads*`)
- DoubleClick (`*doubleclick*`)
- Rutas de ads genéricas (`*/ads/*`)
- Scripts de analytics (`*analytics*`)

## Instalación

1. Descargá o copiá esta carpeta en tu PC
2. Abrí Chrome y andá a `chrome://extensions/`
3. Activá **Modo de desarrollador** (switch arriba a la derecha)
4. Hacé click en **"Cargar desempaquetada"**
5. Seleccioná la carpeta del proyecto
6. ¡Listo! El ícono aparece en la barra de extensiones

## Compatibilidad

Funciona en cualquier navegador basado en Chromium:
- Google Chrome
- Microsoft Edge
- Brave
- Opera

## Estructura

```
├── manifest.json   → Configuración de la extensión
├── rules.json      → Reglas de bloqueo de red
├── popup.html      → Interfaz visual del popup
├── background.js   → Service worker (toggle/contador)
└── popup.js        → Lógica del popup
```

## Portabilidad

Copiá la carpeta a cualquier PC, cargala como extensión desempaquetada y funciona igual. No requiere instalación ni dependencias externas.
"# gabybloqueadorchrome" 
