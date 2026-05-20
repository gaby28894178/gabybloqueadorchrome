# 🛡️ Mi Bloqueador de Anuncios Local

Extensión de Chrome (Manifest V3) que bloquea anuncios, banners y rastreadores de forma nativa usando `declarativeNetRequest`.

## Qué bloquea

- Google Ads (`*googleads*`)
- DoubleClick (`*doubleclick*`)
- Rutas de ads genéricas (`*/ads/*`)
- Scripts de analytics (`*analytics*`)

## Cómo instalar en Chrome

### Paso 1 — Abrir la página de extensiones
Abrí Chrome y escribí en la barra de direcciones:
```
chrome://extensions/
```

### Paso 2 — Activar Modo de desarrollador
En la esquina superior derecha de la página, activá el switch que dice **"Modo de desarrollador"** (Developer mode).

### Paso 3 — Cargar la extensión
Hacé click en el botón **"Cargar desempaquetada"** (Load unpacked) que aparece arriba a la izquierda.

### Paso 4 — Seleccionar la carpeta
Navegá hasta la carpeta donde tenés los archivos del proyecto y seleccionala.

### Paso 5 — ¡Listo!
La extensión aparece en la lista y el ícono se muestra en la barra de extensiones de Chrome. Entrá a cualquier página con publicidad y vas a ver que los anuncios no cargan.

## Compatibilidad

Funciona en cualquier navegador basado en Chromium:
- Google Chrome
- Microsoft Edge
- Brave
- Opera

En Edge usá `edge://extensions/`, en Brave `brave://extensions/`, en Opera `opera://extensions/`.

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
