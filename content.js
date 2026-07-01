// YouTube Ad Blocker — content script.
// Runs at document_start on youtube.com. Two jobs:
//   1. Video ads: click the Skip button the moment it appears; for unskippable
//      ads, jump the player to the end and mute so they clear in a fraction of
//      a second instead of playing out.
//   2. Static ads: hide feed / masthead / overlay / banner ad containers via an
//      injected stylesheet (so they never flash in) plus a per-tick sweep.

const AD_SELECTORS = [
  "ytd-ad-slot-renderer",
  "ytd-in-feed-ad-layout-renderer",
  "ytd-promoted-video-renderer",
  "ytd-companion-slot-renderer",
  "ytd-display-ad-renderer",
  "ytd-banner-promo-renderer",
  "ytd-statement-banner-renderer",
  "#masthead-ad",
  ".ytp-ad-overlay-slot",
  ".ytp-ad-image-overlay",
  ".ytd-player-legacy-desktop-watch-ads-renderer"
];

let enabled = true;
let skipped = 0;

function bumpSkipped() {
  skipped += 1;
  try {
    chrome.storage.sync.set({ adsSkipped: skipped });
  } catch (_) {
    // storage can be unavailable during teardown; a missed count is harmless
  }
}

// Handle the ad that plays over the actual video.
function handleVideoAds() {
  const player = document.querySelector(".html5-video-player");
  if (!player) return;

  const showingAd =
    player.classList.contains("ad-showing") ||
    document.querySelector(".ytp-ad-player-overlay");
  if (!showingAd) return;

  // Prefer the real Skip button across its various class names / versions.
  const skipBtn = document.querySelector(
    ".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-container button"
  );
  if (skipBtn) {
    skipBtn.click();
    bumpSkipped();
    return;
  }

  // Unskippable ad: fast-forward to the end and mute it.
  const video = document.querySelector("video");
  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = video.duration;
    video.muted = true;
    bumpSkipped();
  }

  // Dismiss any overlay ad on top of the player.
  const overlayClose = document.querySelector(".ytp-ad-overlay-close-button");
  if (overlayClose) overlayClose.click();
}

function sweepStaticAds() {
  for (const sel of AD_SELECTORS) {
    document.querySelectorAll(sel).forEach((el) => {
      el.style.setProperty("display", "none", "important");
    });
  }
}

function tick() {
  if (!enabled) return;
  handleVideoAds();
  sweepStaticAds();
}

// Inject a stylesheet so feed ads are hidden before the per-tick sweep even
// runs. Toggling `disabled` lets the popup turn blocking on/off instantly.
const hideStyle = document.createElement("style");
hideStyle.id = "yt-adblock-hide";
hideStyle.textContent =
  AD_SELECTORS.join(",") + "{display:none !important;}";
(document.head || document.documentElement).appendChild(hideStyle);

const observer = new MutationObserver(tick);

chrome.storage.sync.get({ enabled: true, adsSkipped: 0 }, (cfg) => {
  enabled = cfg.enabled;
  skipped = cfg.adsSkipped || 0;
  hideStyle.disabled = !enabled;
  observer.observe(document.documentElement, { childList: true, subtree: true });
  // Backstop the observer with a light poll — some ad state changes without a
  // DOM mutation the observer would catch (e.g. the skip timer expiring).
  setInterval(tick, 500);
  tick();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    hideStyle.disabled = !enabled;
    if (enabled) tick();
  }
});
