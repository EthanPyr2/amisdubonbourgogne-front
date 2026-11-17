FROM docker.io/library/node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx ng build --configuration production

FROM docker.io/library/caddy:2-alpine
COPY --from=build /app/dist/mon-projet/browser /srv
