const toggle = document.getElementById("toggle");
const countEl = document.getElementById("count");
const statusEl = document.getElementById("status");

function render(on) {
  statusEl.textContent = on ? "Blocking is ON" : "Blocking is OFF";
  statusEl.className = on ? "status on" : "status off";
}

chrome.storage.sync.get({ enabled: true, adsSkipped: 0 }, (cfg) => {
  toggle.checked = cfg.enabled;
  countEl.textContent = cfg.adsSkipped || 0;
  render(cfg.enabled);
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
  render(toggle.checked);
});

// Keep the counter live while the popup is open.
chrome.storage.onChanged.addListener((changes) => {
  if (changes.adsSkipped) {
    countEl.textContent = changes.adsSkipped.newValue;
  }
});
