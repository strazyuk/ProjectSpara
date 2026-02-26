# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Declare build-time args — Vite reads these at build time and bakes them into the bundle
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_TELLER_APP_ID
ARG VITE_API_URL

RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Pass VITE_API_URL to the runtime container so envsubst can use it
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the template to a different location
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
