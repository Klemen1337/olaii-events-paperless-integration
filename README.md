# Olaii events paperless integration

paperlesspaper OpenIntegration for (Olaii)[https://olaii.com/events/] events.


## Docker

```sh
docker build -t klemen1337/olaii-events-paperless-integration:latest .
docker push klemen1337/olaii-events-paperless-integration:latest
docker pull klemen1337/olaii-events-paperless-integration:latest
docker run -d --restart unless-stopped -p 4300:80 klemen1337/olaii-events-paperless-integration:latest
```

or with Docker Compose using the published image (no checkout needed), e.g. `docker-compose.yml`:

```yaml
version: "3.8"   # needed by legacy docker-compose v1; ignored by `docker compose` v2

services:
  olaii-events-paperless-integration:
    image: klemen1337/olaii-events-paperless-integration:latest
    container_name: olaii-events
    ports:
      - "4300:80"
    restart: unless-stopped
```

```sh
docker compose up -d                          # or `docker-compose up -d` (v1)
docker compose pull && docker compose up -d   # update to the latest image
```


## Develop

```sh
npm run start      # preview UI at http://localhost:4300/__paperless/preview
npm run check

paperlesspaper-openintegration render ./config.json --viewport 800x480 --output render.png
paperlesspaper-openintegration render ./config.json --viewport 1200x1600 --output render.png
```

## Fix puppeteer 

If you get this error when you try to render `An 'executablePath' or 'channel' must be specified for 'puppeteer-core'`. Set PUPPETEER_EXECUTABLE_PATH globally in your terminal before running commands:

- Linux / Raspberry Pi:
  
  ```export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"```

- macOS: 

    ```export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"```

- Windows (PowerShell): 

    ```$env:PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"```

    