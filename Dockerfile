FROM node:20-bookworm-slim

# Chromium for puppeteer-core (the CLI never downloads a browser itself,
# it launches whatever PUPPETEER_EXECUTABLE_PATH points at).
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# paperlesspaper-openintegration dev server default
EXPOSE 4300

# Preview server by default; override the command to render instead, e.g.:
#   docker run --rm -v "$PWD/render-output:/app/render-output" olaii-events \
#     npx paperlesspaper-openintegration render ./config.json --viewport 800x480 --output ./render-output/olaii-events-800x480.png
CMD ["npx", "paperlesspaper-openintegration", "dev", "./config.json", "--host", "0.0.0.0"]
