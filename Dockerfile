FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -f index.html 50x.html
COPY config.json render.html render.js render.css ./
COPY languages ./languages
COPY assets ./assets
COPY screenshots ./screenshots
EXPOSE 80
