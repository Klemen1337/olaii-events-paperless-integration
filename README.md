# Olaii events paperless integration

paperlesspaper OpenIntegration for (Olaii)[https://olaii.com/events/] events.

## Develop

```sh
npm run start
npm run check

paperlesspaper-openintegration check ./config.json
paperlesspaper-openintegration dev ./config.json
paperlesspaper-openintegration render ./config.json --viewport 800x480 --output render.png
paperlesspaper-openintegration render ./config.json --viewport 1200x1600 --output render.png
```

## Files

- `config.json`: integration manifest, defaults, and generated settings form.
- `render.html`: static render page. It must call `markReady()` when the frame is complete.
- `languages/*.json`: localized copy loaded from the host-selected payload language.
- `api/data.js`: optional local API handler used by the dev server.


## Fix puppeteer 

If you get this error when you try to render `An 'executablePath' or 'channel' must be specified for 'puppeteer-core'`. Set PUPPETEER_EXECUTABLE_PATH globally in your terminal before running commands:

- Linux / Raspberry Pi:
  
  ```export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"```

- macOS: 

    ```export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"```

- Windows (PowerShell): 

    ```$env:PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"```

    