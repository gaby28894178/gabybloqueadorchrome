// Content script para saltar anuncios de video en YouTube
(function() {
  'use strict';

  const ICON_URL = chrome.runtime.getURL('icono.png');
  let overlay = null;
  let isProcessing = false;

  function showOverlay() {
    if (overlay) return;
    const playerContainer = document.querySelector('#movie_player');
    if (!playerContainer) return;

    overlay = document.createElement('div');
    overlay.id = 'blocker-overlay';
    overlay.innerHTML = `
      <img src="${ICON_URL}" alt="Bloqueando anuncio">
      <span>Saltando anuncio...</span>
    `;
    playerContainer.style.position = 'relative';
    playerContainer.appendChild(overlay);
  }

  function hideOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function muteAll() {
    document.querySelectorAll('video, audio').forEach(el => {
      el.muted = true;
      el.volume = 0;
    });
  }

  function clickSkip() {
    const selectors = [
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-skip-button-slot button',
      '.ytp-ad-skip-button-container button',
      'button.ytp-ad-skip-button-modern',
      '.videoAdUiSkipButton',
      'button[class*="skip-button"]'
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        btn.click();
        return true;
      }
    }
    return false;
  }

  function handleAd() {
    const player = document.querySelector('#movie_player');
    if (!player || !player.classList.contains('ad-showing')) return;
    if (isProcessing) return;

    // Silenciar inmediatamente
    muteAll();
    showOverlay();

    // Método 1: Intentar clic en skip
    if (clickSkip()) {
      setTimeout(() => {
        if (!player.classList.contains('ad-showing')) {
          hideOverlay();
          restorePlayer();
        }
      }, 500);
      return;
    }

    // Método 2: Saltar el video del anuncio al final
    const video = document.querySelector('video');
    if (video) {
      video.muted = true;
      video.volume = 0;
      // Intentar saltar al final
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        video.currentTime = video.duration;
      }
    }

    // Método 3: Si después de 1.5s sigue el anuncio, recargar el video
    isProcessing = true;
    setTimeout(() => {
      if (player.classList.contains('ad-showing')) {
        // Recargar el video - esto salta el anuncio
        const videoUrl = window.location.href;
        // Usar la navegación interna de YouTube para recargar sin perder la página
        const videoId = new URLSearchParams(window.location.search).get('v');
        if (videoId) {
          // Navegar al mismo video - YouTube lo carga sin el anuncio anterior
          window.location.replace(videoUrl);
        }
      }
      isProcessing = false;
    }, 1500);
  }

  function restorePlayer() {
    const video = document.querySelector('video');
    if (video) {
      video.playbackRate = 1;
      video.muted = false;
      video.volume = 1;
    }
  }

  function removeOverlayAds() {
    const selectors = [
      '.ytp-ad-overlay-container',
      '.ytp-ad-overlay-slot',
      '#player-ads',
      '#masthead-ad',
      'ytd-ad-slot-renderer',
      'ytd-banner-promo-renderer',
      'ytd-statement-banner-renderer',
      'ytd-in-feed-ad-layout-renderer',
      'ytd-promoted-sparkles-web-renderer',
      'ytd-display-ad-renderer',
      'ytd-promoted-video-renderer',
      '.ytd-merch-shelf-renderer',
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  }

  // Loop principal cada 50ms
  let wasShowingAd = false;

  setInterval(() => {
    const player = document.querySelector('#movie_player');
    const isAd = player && player.classList.contains('ad-showing');

    if (isAd) {
      wasShowingAd = true;
      muteAll();
      handleAd();
    } else if (wasShowingAd) {
      wasShowingAd = false;
      isProcessing = false;
      hideOverlay();
      restorePlayer();
    }

    removeOverlayAds();
  }, 50);

  // Observer para reaccionar al instante
  function observePlayer() {
    const player = document.querySelector('#movie_player');
    if (!player) {
      setTimeout(observePlayer, 300);
      return;
    }

    new MutationObserver(() => {
      if (player.classList.contains('ad-showing')) {
        muteAll();
        handleAd();
      } else if (wasShowingAd) {
        wasShowingAd = false;
        isProcessing = false;
        hideOverlay();
        restorePlayer();
      }
    }).observe(player, { attributes: true, attributeFilter: ['class'] });

    new MutationObserver(() => {
      if (player.classList.contains('ad-showing')) {
        clickSkip();
      }
    }).observe(player, { childList: true, subtree: true });
  }

  observePlayer();

  // Al cargar la página, si ya hay un anuncio, manejarlo
  setTimeout(() => {
    const player = document.querySelector('#movie_player');
    if (player && player.classList.contains('ad-showing')) {
      muteAll();
      handleAd();
    }
  }, 500);
})();
