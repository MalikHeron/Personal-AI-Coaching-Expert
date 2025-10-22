#!/bin/sh

set -e

APP_ENV_VALUE=${APP_ENV:-local}
echo "Running entrypoint for APP_ENV=$APP_ENV_VALUE"

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

echo "Making database migrations (dev/local only)..."
python manage.py makemigrations --noinput

echo "Applying database migrations..."
# Try normal migrate, fallback to faking if duplicate table errors occur
if ! python manage.py migrate; then
    echo "Migration failed, retrying with --fake-initial..."
    python manage.py migrate --fake-initial
fi

echo "Starting Uvicorn ASGI server..."
uvicorn backend.asgi:application \
--host 0.0.0.0 \
--port 8000 \
--timeout-keep-alive 900 \
--workers 4 \
--proxy-headers &

# Start NGINX in the foreground (main process)
echo "Starting NGINX..."
nginx -g "daemon off;"