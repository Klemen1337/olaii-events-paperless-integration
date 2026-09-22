import {
  waitForPayload,
  getSettings,
  getQuerySettings,
  mergeSettings,
  loadLanguageJson,
  applyColorThemeFromQuery,
  markReady,
  markError,
  fitAllText,
  fitToScreen,
  escapeHtml
} from "./../paperless.js";

function getLocaleCodeFromLanguage (language) {
  if (language == "en") return "en-EN";
  if (language == "sl") return "sl-SI";
  if (language == "de") return "de-DE";
  return "en-EN";
}

function formatDate(date, locale = "en-EN") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) throw date;

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

async function render () {
  try {
    const payload = await waitForPayload({ timeoutMs: 500 });
    const { messages } = await loadLanguageJson(payload);
    applyColorThemeFromQuery({ defaultTheme: "light" });


    console.log(settings)
    console.log(messages)

    // Fetch events;
    const url = new URL("./api/data", window.location.href);
    url.searchParams.set("limit", settings.limit);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // Prepare data
    const data = await response.json();
    const items = Array.isArray(data.events) ? data.events.slice(0, settings.limit) : [];

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
            <span class="render-date">${formatDate(new Date(), settings.locale)}</div>
          </div>
        `: ''
      }

      <section class="events">
      ${
        items.map((item) => `
          <div class="event" style="${item.custom_color ? '--base-color:' + item.custom_color : ''}">
            <img class="event-image" src="${item.thumbnail_photo || item.cover_photo}" />
            ${
              settings.showInfo ? `
                <div class="event-info">
                  <div class="event-title no-overflow">${item.name}</div>
                  <div class="event-start-time line-with-icon">
                      <svg class="icon icon-calendar"><use xlink:href="#icon-calendar"></use></svg>
                      <span class="no-overflow">${formatDate(item.start_time, settings.locale)}</span>
                  </div>
                  <div class="event-venue line-with-icon">
                      <svg class="icon icon-map-pin"><use xlink:href="#icon-map-pin"></use></svg>
                      <span class="no-overflow">${item.venue_name}</span>
                      </div>
                  </div>
                </div>
              `: ''
            }
          </div>
        `).join("")
      }
      </section>
    `;

    // Finish
    await document.fonts?.ready;
    fitToScreen(app);
    markReady();
  } catch (error) {
    markError(error);
  }
}

const defaultSettings = {
  language: "en",
  rows: 4,
  columns: 2,
  padding: "2rem",
  borderRadius: "1rem",
  showInfo: true,
  showHeader: true
};
let settings = { ...defaultSettings };

function readSettings(payload) {
  const incoming = payload?.meta?.pluginSettings ?? payload?.pluginSettings;
  const difference = Number(incoming?.difference ?? 0);
  console.log("readSettings", incoming, difference)

  // Get and prepare settings
  settings = {
    ...defaultSettings,
    // getSettings(payload),
    ...getQuerySettings()
  }
  settings.limit = parseInt(settings.rows) * parseInt(settings.columns)
  settings.locale = getLocaleCodeFromLanguage(settings.language);

  return settings;
}

window.addEventListener("message", (event) => {
  const data = event.data;
  console.log(data);
  if (!data || typeof data !== "object") return;
  if (data.type === "INIT" || data.cmd === "message") {
    settings = readSettings(data.data);
    render();
  }
});


const payload = await waitForPayload({ timeoutMs: 500 });
readSettings(payload)
render();