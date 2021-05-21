FROM node:16.0.0-buster-slim as build
ENV NODE_ENV=development

WORKDIR /tmp
COPY ./ ./

RUN npm ci && npm run build

FROM node:16.0.0-buster-slim
ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /tmp/dist ./dist/
RUN mkdir -p ./dist/commands/local/
COPY package*.json index.html ./

RUN npm ci

USER root

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libasound2 \
	libgdk-pixbuf2.0-dev \
	libgtk-3-dev \
	libnss3-dev \
	libxss-dev \
	python3 \
	&& apt-get clean && rm -rf /var/lib/apt/lists/

RUN ln -s /usr/bin/python3 /usr/bin/python

# Add rootless user with access to audio and video
RUN groupadd -r jim && useradd -r -g jim -G audio,video jim \
    && mkdir -p /home/jim/Downloads \
    && chown -R jim:jim /home/jim \
    && chown -R jim:jim /app

USER jim

ENTRYPOINT node ./dist/index.js
