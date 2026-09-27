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

## Docker

Bundles Chromium into the image so you don't need to install or path-find a
browser on the host (see "Fix puppeteer" below for the non-Docker version of
that problem).

```sh
# live preview server at http://localhost:4300/__paperless/preview
docker compose up dev

# one-shot render, written to ./render-output on the host
docker compose --profile render up render
```

Without compose:

```sh
docker build -t olaii-events-paperless-integration .
docker run --rm -p 4300:4300 olaii-events-paperless-integration
docker run --rm -v "$PWD/render-output:/app/render-output" olaii-events-paperless-integration \
  npx paperlesspaper-openintegration render ./config.json --viewport 800x480 --output ./render-output/olaii-events-800x480.png


docker build -t olaii-events-paperless-integration .
docker login -u USERNAME
docker build -t klemen1337/olaii-events-paperless-integration:latest .
docker tag olaii-events-paperless-integration:latest klemen1337/olaii-events-paperless-integration:latest
docker push klemen1337/olaii-events-paperless-integration:latest
docker pull klemen1337/olaii-events-paperless-integration:latest
```

## Fix puppeteer 

If you get this error when you try to render `An 'executablePath' or 'channel' must be specified for 'puppeteer-core'`. Set PUPPETEER_EXECUTABLE_PATH globally in your terminal before running commands:

- Linux / Raspberry Pi:
  
  ```export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"```

- macOS: 

    ```export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"```

- Windows (PowerShell): 

    ```$env:PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"```

    