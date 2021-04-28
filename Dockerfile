FROM node:16.0.0-buster-slim as build
ENV NODE_ENV=development

WORKDIR /tmp

COPY ./ ./

RUN npm ci && npm run build

FROM node:16.0.0-buster-slim

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /tmp/dist ./dist/
COPY package*.json index.html ./

RUN npm ci

USER root
RUN apt update && apt install -y python3 ca-certificates libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2
RUN ln -s /usr/bin/python3 /usr/bin/python

# Add rootless user with access to audio and video
RUN groupadd -r jim && useradd -r -g jim -G audio,video jim \
    && mkdir -p /home/jim/Downloads \
    && chown -R jim:jim /home/jim \
    && chown -R jim:jim /app

USER jim

CMD ["node", "./dist/index.js"]
