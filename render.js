import {
  getSettings,
  getQuerySettings,
  mergeSettings,
  loadLanguageJson,
  applyColorTheme,
  markReady,
  markError,
  fitToScreen,
  escapeHtml
} from "./assets/paperless.js";

function getLocaleCodeFromLanguage (language) {
  const base = String(language || "").toLowerCase().split("-")[0];
  if (base == "en") return "en-GB";
  if (base == "sl") return "sl-SI";
  if (base == "de") return "de-DE";
  return "en-GB";
}

function formatDate(date, locale = "en-GB") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const rawWeekday = weekdayFormatter.format(d);
  const weekday = rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${weekday}, ${day}.${month}.${year} • ${hours}:${minutes}`;
}

const app = document.querySelector("#app");

const defaultSettings = {
  color: "light",
  rows: 4,
  columns: 2,
  padding: "2rem",
  borderRadius: "1rem",
  showInfo: true,
  showHeader: true
};

const supportedLanguages = ["en", "sl", "de"];

// Priority: defaults < host settings < URL query.
// paperlesspaper sends { settings, nativeSettings: { color }, meta: { language } } and also
// appends the settings to the URL; the CLI preview sends { meta: { pluginSettings, color, language } }.
function readSettings(payload) {
  const settings = mergeSettings(
    defaultSettings,
    payload?.nativeSettings?.color ? { color: payload.nativeSettings.color } : null,
    payload?.settings,
    getSettings(payload),
    getQuerySettings()
  );
  settings.language = payload?.meta?.language ?? settings.language ?? "en";
  settings.locale = getLocaleCodeFromLanguage(settings.language);
  settings.limit = Math.max(1, parseInt(settings.rows) || 1) * Math.max(1, parseInt(settings.columns) || 1);
  return settings;
}

let renderId = 0;

async function render (payload) {
  const currentRender = ++renderId;
  try {
    const settings = readSettings(payload);
    applyColorTheme(settings.color, { defaultTheme: defaultSettings.color });
    await loadLanguageJson(payload, { supported: supportedLanguages, defaultLanguage: "en" });

    // Fetch events
    const url = new URL("./api/data", window.location.href);
    url.searchParams.set("limit", settings.limit);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // Prepare data
    const data = await response.json();
    // nginx proxies Olaii's response as-is ({ results }); api/data.js (dev server) returns { events }.
    const events = data.events ?? data.results;
    const items = Array.isArray(events) ? events.slice(0, settings.limit) : [];

    // A newer payload arrived while we were fetching; let that render win.
    if (currentRender !== renderId) return;

    // Override css variables
    const overrideStyle = `
      --grid-columns: ${settings.columns};
      --grid-rows: ${settings.rows};
      --padding: ${settings.padding};
      --border-radius: ${settings.borderRadius};
    `
    app.setAttribute("style", overrideStyle);

    // Generate events html
    app.innerHTML = `
      ${
        settings.showHeader ? `
          <div class="header">
            <svg class="icon icon-logo"><use xlink:href="#icon-logo"></use></svg>
            <span class="render-date">${escapeHtml(formatDate(new Date(), settings.locale))}</span>
          </div>
        `: ''
      }

      <section class="events">
      ${
        items.map((item) => `
          <div class="event" style="${item.custom_color ? '--base-color:' + escapeHtml(item.custom_color) : ''}">
            <img class="event-image" src="${escapeHtml(item.thumbnail_photo || item.cover_photo || '')}" />
            ${
              settings.showInfo ? `
                <div class="event-info">
                  <div class="event-title no-overflow">${escapeHtml(item.name ?? '')}</div>
                  <div class="event-start-time line-with-icon">
                      <svg class="icon icon-calendar"><use xlink:href="#icon-calendar"></use></svg>
                      <span class="no-overflow">${escapeHtml(formatDate(item.start_time, settings.locale))}</span>
                  </div>
                  <div class="event-venue line-with-icon">
                      <svg class="icon icon-map-pin"><use xlink:href="#icon-map-pin"></use></svg>
                      <span class="no-overflow">${escapeHtml(item.venue_name ?? '')}</span>
                  </div>
                </div>
              `: ''
            }
          </div>
        `).join("")
      }
      </section>
    `;

    // Wait for images so the screenshot isn't taken with empty frames
    await Promise.all([...app.querySelectorAll("img")].map((img) =>
      img.complete ? null : new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      })
    ));
    await document.fonts?.ready;
    if (currentRender !== renderId) return;

    // Finish
    fitToScreen(app);
    markReady();
  } catch (error) {
    if (currentRender === renderId) markError(error);
  }
}

// The host posts the payload as { type: "INIT", data } (or { cmd: "message", data }),
// and may post it again when settings change. waitForPayload() from paperless.js only
// accepts the dev-preview payload id, so listen for it directly.
let receivedPayload = false;
window.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;
  if ((message.type === "INIT" || message.cmd === "message") && message.data && typeof message.data === "object") {
    receivedPayload = true;
    render(message.data);
  }
});

// Opened directly (no host): render from query/defaults.
setTimeout(() => {
  if (!receivedPayload) render({});
}, 500);
