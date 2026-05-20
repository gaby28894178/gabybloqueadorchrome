// Content script para saltar/neutralizar anuncios de YouTube
(function() {
  'use strict';

  const ICON_URL = chrome.runtime.getURL('icono.png');
  let overlay = null;
  let overlayTimer = null;

  // =============================================
  // MÉTODO 1: Interceptar las respuestas de YouTube
  // Modificamos el fetch y XMLHttpRequest para limpiar
  // los datos de anuncios antes de que el player los use
  // =============================================

  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = (args[0] instanceof Request) ? args[0].url : args[0];

    // Interceptar las respuestas del player que contienen info de ads
    if (typeof url === 'string' && url.includes('/youtubei/v1/player')) {
      const clone = response.clone();
      try {
        const json = await clone.json();
        // Eliminar datos de anuncios del JSON
        if (json.adPlacements) delete json.adPlacements;
        if (json.adSlots) delete json.adSlots;
        if (json.playerAds) delete json.playerAds;
        if (json.adBreakParams) delete json.adBreakParams;

        // Crear nueva respuesta sin los ads
        return new Response(JSON.stringify(json), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch(e) {
        return response;
      }
    }
    return response;
  };

  // Interceptar XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    if (this._url && this._url.includes('/youtubei/v1/player')) {
      this.addEventListener('readystatechange', function() {
        if (this.readyState === 4) {
          try {
            const json = JSON.parse(this.responseText);
            if (json.adPlacements) delete json.adPlacements;
            if (json.adSlots) delete json.adSlots;
            if (json.playerAds) delete json.playerAds;
            if (json.adBreakParams) delete json.adBreakParams;

            Object.defineProperty(this, 'responseText', {
              value: JSON.stringify(json),
              writable: false
            });
            Object.defineProperty(this, 'response', {
              value: JSON.stringify(json),
              writable: false
            });
          } catch(e) {}
        }
      });
    }
    return originalXHRSend.apply(this, args);
  };

  // =============================================
  // MÉTODO 2: Backup - Skip visual para ads que pasen
  // =============================================

  function showOverlay(msg) {
    if (overlay) {
      var s = overlay.querySelector('span');
      if (s) s.textContent = msg;
      return;
    }
    var player = document.querySelector('#movie_player');
    if (!player) return;
    overlay = document.createElement('div');
    overlay.id = 'blocker-overlay';
    overlay.innerHTML = '<img src="' + ICON_URL + '"><span>' + (msg || 'Saltando anuncio...') + '</span>';
    player.appendChild(overlay);
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(hideOverlay, 5000);
  }

  function hideOverlay() {
    clearTimeout(overlayTimer);
    if (overlay) { overlay.remove(); overlay = null; }
    document.querySelectorAll('#blocker-overlay').forEach(function(el) { el.remove(); });
  }

  function isAd() {
    var p = document.querySelector('#movie_player');
    return p && p.classList.contains('ad-showing');
  }

  function clickSkip() {
    var btns = document.querySelectorAll(
      '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, ' +
      'button.ytp-ad-skip-button-modern, .ytp-ad-skip-button-container button'
    );
    for (var i = 0; i < btns.length; i++) {
      btns[i].click();
      return true;
    }
    return false;
  }

  function handleAd() {
    if (!isAd()) {
      if (overlay) { hideOverlay(); restoreVideo(); }
      return;
    }

    var video = document.querySelector('video');
    if (!video) return;

    // Silenciar
    video.muted = true;
    video.volume = 0;

    // Intentar skip
    if (clickSkip()) {
      showOverlay('Omitiendo...');
      return;
    }

    // Acelerar
    try { video.playbackRate = 16; } catch(e) {}

    // Saltar al final si es posible
    if (video.duration && isFinite(video.duration) && video.duration > 0.5) {
      try { video.currentTime = video.duration - 0.1; } catch(e) {}
      showOverlay('Saltando anuncio...');
    } else {
      showOverlay('Saltando anuncio...');
    }
  }

  function restoreVideo() {
    var video = document.querySelector('video');
    if (video) {
      video.playbackRate = 1;
      video.muted = false;
      video.volume = 1;
    }
  }

  function removeAds() {
    var sels = ['#player-ads', '#masthead-ad', 'ytd-ad-slot-renderer', 'ytd-banner-promo-renderer',
      'ytd-in-feed-ad-layout-renderer', 'ytd-promoted-sparkles-web-renderer',
      'ytd-display-ad-renderer', '.ytp-ad-overlay-container', 'ytd-promoted-video-renderer'];
    sels.forEach(function(s) {
      document.querySelectorAll(s).forEach(function(el) { el.remove(); });
    });
  }

  // Loop de backup
  setInterval(function() {
    handleAd();
    removeAds();
  }, 100);

  // Escuchar navegación SPA
  document.addEventListener('yt-navigate-finish', function() {
    hideOverlay();
    restoreVideo();
  });
})();
