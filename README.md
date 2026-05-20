# 🛡️ Mi Bloqueador de Anuncios Local

Extensión de Chrome (Manifest V3) que bloquea anuncios, banners, rastreadores y **video ads de YouTube** de forma nativa.

## Qué bloquea

### Bloqueo de red (declarativeNetRequest)
- Google Ads (`googleads.g.doubleclick.net`)
- Google Syndication (`pagead2.googlesyndication.com`)
- DoubleClick (`doubleclick.net`)
- Google Ad Service (`adservice.google.com`)
- Amazon Ads (`amazon-adsystem.com`)
- Taboola (`cdn.taboola.com`)
- PopAds / PopCash (`popads.net`, `popcash.net`)
- PropellerAds (`propellerads.com`)
- RevContent (`revcontent.com`)
- MGID (`mgid.com`)
- Teads (`teads.tv`)
- SpringServe (`springserve.com`)
- SpotX (`spotxchange.com`)
- AdColony (`adcolony.com`)
- Google Analytics (`google-analytics.com`)
- Facebook Pixel (`facebook.com/tr`)
- Prebid (`prebid.org`)

### Bloqueo de video ads en YouTube (content script)

#### Capa 1 — Interceptación de datos
- Intercepta las respuestas de `/youtubei/v1/player` (API interna de YouTube)
- Elimina `adPlacements`, `adSlots`, `playerAds` y `adBreakParams` del JSON
- El reproductor recibe los datos **sin instrucción de mostrar anuncio**
- Los anuncios directamente no se reproducen

#### Capa 2 — Detección y salto (backup)
Si algún anuncio pasa la Capa 1, se activa el sistema de detección por tipo:

| Tipo de anuncio | Cómo lo detecta | Acción |
|-----------------|-----------------|--------|
| **Skippable** | Tiene botón "Omitir" | Clic automático en el botón |
| **Overlay/Banner** | Imagen superpuesta sobre el video | Lo elimina del DOM |
| **Corto no-skippable** | Duración ≤ 6 segundos | Silencia + acelera x16 |
| **Largo no-skippable** | Duración > 6 segundos | Silencia + acelera + salta al final |

#### Pantalla de bloqueo
Mientras se salta un anuncio, se muestra el ícono de la extensión con el mensaje "Saltando anuncio..." sobre el reproductor. Se quita automáticamente en máximo 5 segundos.

### Eliminación de ads del DOM
- Banners en el feed (`ytd-ad-slot-renderer`)
- Anuncios promocionados (`ytd-promoted-sparkles-web-renderer`)
- Overlay sobre el video (`.ytp-ad-overlay-container`)
- Masthead ads (`#masthead-ad`)
- Ads en panel lateral (`ytd-display-ad-renderer`)

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
La extensión aparece en la lista y el ícono se muestra en la barra de extensiones de Chrome.

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
├── rules.json      → Reglas de bloqueo de red (dominios específicos)
├── content.js      → Script que neutraliza ads en YouTube
├── content.css     → Estilos del overlay de bloqueo
├── popup.html      → Interfaz visual del popup
├── popup.js        → Lógica del popup
├── background.js   → Service worker (toggle/contador)
└── icono.png       → Ícono de la extensión (se muestra al saltar ads)
```

## Portabilidad

Copiá la carpeta a cualquier PC, cargala como extensión desempaquetada y funciona igual. No requiere instalación ni dependencias externas.
