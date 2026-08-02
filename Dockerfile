# syntax=docker/dockerfile:1

# ---- build ----------------------------------------------------------------
# Compiles the site to static files. Dev dependencies are needed here because
# `npm run build` runs `tsc -b` before `vite build`.
FROM node:22-alpine AS build

WORKDIR /app

# Copy the manifests first so `npm ci` is only re-run when deps actually
# change, not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime --------------------------------------------------------------
# Nothing from the build toolchain ships: the final image is just nginx plus
# the contents of dist/.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
