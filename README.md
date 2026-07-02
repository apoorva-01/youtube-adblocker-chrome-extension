# YouTube Ad Blocker

A lightweight Chrome extension (Manifest V3) that skips and hides ads on YouTube.
No account, no tracking, no external servers — everything runs locally in your
browser.

## Features

- **Auto-skips video ads.** Clicks the *Skip* button the instant it appears. For
  unskippable ads it jumps the player to the end and mutes them, so they clear in
  a fraction of a second instead of playing out.
- **Hides overlay & banner ads.** Removes the ad strip over the video and the
  promo banners on the page.
- **Cleans the feed.** Hides sponsored/promoted cards, the masthead ad, and
  in-feed ad slots on the home and search pages.
- **On/off toggle** with an **ads-skipped counter**, right in the popup.
- Settings sync across your Chrome profile via `chrome.storage.sync`.

## Install (load unpacked)

1. `git clone https://github.com/apoorva-01/youtube-adblocker-chrome-extension.git`
2. Open `chrome://extensions` in Chrome (or any Chromium browser: Edge, Brave, etc.).
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select the cloned folder.
5. Open YouTube. Click the extension icon to toggle blocking or check the counter.

## How it works

A single content script (`content.js`) runs at `document_start` on
`youtube.com`:

- It injects a stylesheet that hides known ad containers before they can flash in.
- A `MutationObserver` (backed by a light 500 ms poll) watches for the video
  player entering its ad state, then clicks *Skip* or fast-forwards past the ad.
- The popup (`popup.html` / `popup.js`) reads and writes an `enabled` flag and
  the running `adsSkipped` count in `chrome.storage.sync`; the content script
  reacts to changes live.

```
manifest.json   → MV3 config, permissions, content script + popup wiring
content.js      → ad-skipping / ad-hiding logic
popup.html/js   → toggle UI + skip counter
popup.css       → popup styling
images/         → icon + logo
```

## Limitations

YouTube stitches some ads into the video stream and changes its markup often, so
no DIY content-script blocker catches 100% of ads on every layout. This one
covers the common cases (skippable/unskippable video ads, overlay, banner, and
feed ads) and is easy to extend — the selectors it targets live at the top of
`content.js`. For network-level blocking, pair it with a DNS/host blocklist.

## License

MIT © Apoorva Verma