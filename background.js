// Service worker - gestiona activar/desactivar el bloqueo
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true, blockedCount: 0 });
});

// Escuchar mensajes del popup para toggle
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "toggle") {
    chrome.storage.local.get("enabled", ({ enabled }) => {
      const newState = !enabled;
      chrome.storage.local.set({ enabled: newState });
      // Activar o desactivar el ruleset
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: newState ? ["ruleset_ads"] : [],
        disableRulesetIds: newState ? [] : ["ruleset_ads"]
      });
      sendResponse({ enabled: newState });
    });
    return true; // async response
  }
  if (msg.action === "getStatus") {
    chrome.storage.local.get(["enabled", "blockedCount"], sendResponse);
    return true;
  }
});

// Contar peticiones bloqueadas
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(() => {
  chrome.storage.local.get("blockedCount", ({ blockedCount }) => {
    chrome.storage.local.set({ blockedCount: (blockedCount || 0) + 1 });
  });
});
