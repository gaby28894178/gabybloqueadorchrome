const status = document.getElementById("status");
const count = document.getElementById("count");
const btn = document.getElementById("toggle");

function updateUI(enabled, blockedCount) {
  status.textContent = enabled ? "✅ Activo" : "⛔ Desactivado";
  count.textContent = `Anuncios bloqueados: ${blockedCount || 0}`;
  btn.textContent = enabled ? "Desactivar" : "Activar";
  btn.className = enabled ? "on" : "off";
}

chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
  updateUI(res.enabled, res.blockedCount);
});

btn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "toggle" }, (res) => {
    updateUI(res.enabled, 0);
  });
});
