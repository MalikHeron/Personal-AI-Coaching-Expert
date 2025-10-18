#!/bin/sh

set -e

APP_ENV_VALUE=${APP_ENV:-local}
echo "Running entrypoint for APP_ENV=$APP_ENV_VALUE"

# Start cron service in background (after env is prepared)
echo "Starting cron daemon..."
cron &

SRC_BUILD_DIR="/usr/src/app/frontend/dist"
DEST_STATIC_DIR="/etc/nginx/html"

echo "Ensuring fresh frontend dist is copied to NGINX volume..."
if [ -d "$DEST_STATIC_DIR" ]; then
  echo "Deleting existing files in $DEST_STATIC_DIR"
  rm -rf "${DEST_STATIC_DIR:?}/"*
else
  echo "$DEST_STATIC_DIR does not exist, creating it"
  mkdir -p "$DEST_STATIC_DIR"
fi

if [ -d "$SRC_BUILD_DIR" ]; then
  rsync -av "$SRC_BUILD_DIR/" "$DEST_STATIC_DIR/"
else
  echo "Warning: Frontend dist directory not found at $SRC_BUILD_DIR"
fi

cd /usr/src/app/backend

echo "Collecting static files..."
python manage.py collectstatic --noinput

if [ "$APP_ENV_VALUE" != "production" ]; then
  echo "Making database migrations (dev/local only)..."
  python manage.py makemigrations --noinput
else
  echo "Skipping makemigrations in production (APP_ENV=$APP_ENV_VALUE)"
fi

echo "Applying database migrations..."
# Try normal migrate, fallback to faking if duplicate table errors occur
if ! python manage.py migrate; then
  echo "Migration failed, retrying with --fake-initial..."
  python manage.py migrate --fake-initial
fi

# # Path to marker file indicating first-time setup is done
# FIRST_RUN_MARKER="/usr/src/app/.first_run_done"

# # Run one-time Django management commands only if marker file does not exist
# if [ ! -f "$FIRST_RUN_MARKER" ]; then
#   echo "Running first-time setup commands..."

#   # Run seed commands; only create marker if all succeed
#   if python manage.py seed_company && \
#   python manage.py seed_period && \
#   python manage.py seed_ifrs && \
#   python manage.py seed_kpi && \
#   python manage.py seed_adaptive_upload; then
#   touch "$FIRST_RUN_MARKER"
#   echo "First-time setup complete."
#   else
#   echo "One or more setup commands failed. Not creating marker file."
#   exit 1
#   fi
# fi

echo "Starting Uvicorn ASGI server..."
uvicorn backend.asgi:application \
  --host 0.0.0.0 \
  --port 8000 \
  --timeout-keep-alive 900 \
  --workers 4 \
  --proxy-headers &

# Run clean_projects after startup
# (
#   echo "Delaying project cleanup to allow app to start..."
#   sleep 15
#   echo "Running clean_projects..."
#   python manage.py clean_projects --confirm
# ) &

# Start NGINX in the foreground (main process)
echo "Starting NGINX..."
nginx -g "daemon off;"