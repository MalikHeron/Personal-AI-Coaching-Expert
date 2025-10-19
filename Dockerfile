# === Step 1: Build React frontend ===
FROM node:18-alpine AS frontend
WORKDIR /usr/src/app/frontend

# Build-time variables provided from CI (GitHub Actions) or local build
# These are safe to expose since anything under VITE_* ends up baked into static assets
ARG VITE_API_SERVER
ARG VITE_ORS_API_KEY
ENV VITE_API_SERVER=${VITE_API_SERVER}
ENV VITE_ORS_API_KEY=${VITE_ORS_API_KEY}

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
# Ensure Vite reads the values by writing an .env file
# (Vite also reads environment at build time, this is an explicit override)
RUN printf "VITE_API_SERVER=%s\nVITE_ORS_API_KEY=%s\n" "$VITE_API_SERVER" "$VITE_ORS_API_KEY" > .env
RUN npm run build

# === Step 2: Build Django backend base (shared for web/celery) ===
FROM python:3.12-slim AS backend-base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    python3-dev \
    curl \
    bash \
    nano \
    rsync \
    tzdata \
    && apt-get clean

COPY backend/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/ ./

# === Step 3: Final container combining everything (web target) ===
FROM python:3.12-slim AS app

# Set timezone
ENV TZ=America/Jamaica
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    bash \
    nano \
    rsync \
    cron \
    libffi-dev \
    openssh-server \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && apt-get clean

WORKDIR /usr/src/app

# Copy backend code and installed packages
COPY --from=backend-base /usr/src/app/backend /usr/src/app/backend
COPY --from=backend-base /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-base /usr/local/bin /usr/local/bin

# Copy frontend code
COPY --from=frontend /usr/src/app/frontend /usr/src/app/frontend

# Copy NGINX config
# Remove any default NGINX site/configs to avoid default welcome page
RUN rm -f /etc/nginx/sites-enabled/default \
    && rm -f /etc/nginx/conf.d/*
COPY nginx/app-prod.conf /etc/nginx/conf.d/default.conf

# Copy the entrypoint script into the image root
COPY entrypoint.sh /entrypoint.sh

# Ensure Unix line endings and executable bit (handles Windows checkouts)
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

# Expose HTTP port
EXPOSE 80

# Start the app via the entrypoint (which also launches NGINX)
ENTRYPOINT ["/entrypoint.sh"]