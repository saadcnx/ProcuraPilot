FROM node:20-alpine AS build
RUN apk add --no-cache --virtual .build-deps cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev python3 make g++ pkgconfig
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache cairo jpeg pango giflib librsvg pixman
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN apk add --no-cache --virtual .build-deps cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev python3 make g++ pkgconfig \
    && npm install --omit=dev \
    && apk del .build-deps \
    && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY migrations ./migrations
EXPOSE 3001
CMD ["node", "dist/index.js"]