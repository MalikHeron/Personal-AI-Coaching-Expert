# === Step 1: Build React frontend ===
FROM node:18-alpine AS frontend
WORKDIR /usr/src/app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
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

# --- SSH setup ---
# Copy sshd configuration and set root password required for SSH
COPY sshd_config /etc/ssh/
RUN mkdir -p /var/run/sshd && echo "root:Docker!" | chpasswd

# Copy crontab and entrypoint
COPY backend/workday_tasks.crontab /etc/cron.d/django-cron
COPY entrypoint.sh /entrypoint.sh
COPY init_container.sh /opt/startup/init_container.sh
RUN chmod +x /entrypoint.sh /opt/startup/init_container.sh \
    && chmod 0644 /etc/cron.d/django-cron \
    && crontab /etc/cron.d/django-cron \
    && touch /var/log/cron.log

# Expose SSH and HTTP ports
EXPOSE 2222 80

# Use init script that starts SSH then runs the app entrypoint
ENTRYPOINT ["/opt/startup/init_container.sh"]

# === Step 4: Celery worker target ===
FROM backend-base AS celery-worker
WORKDIR /usr/src/app/backend
# Override at runtime via App Service if needed; default provided
CMD ["celery", "-A", "backend", "worker", "-l", "info", "--concurrency", "4"]

# === Step 5: Celery beat target ===
FROM backend-base AS celery-beat
WORKDIR /usr/src/app/backend
# Use DB-backed scheduler to avoid file persistence needs
CMD ["celery", "-A", "backend", "beat", "-l", "info", "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"]