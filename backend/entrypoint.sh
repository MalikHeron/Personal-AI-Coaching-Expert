#!/usr/bin/env bash
set -e

APP_ENV_VALUE=${APP_ENV:-local}
echo "Running entrypoint for APP_ENV=$APP_ENV_VALUE"

echo "Collecting static files..."
python manage.py collectstatic --noinput
if [ "$APP_ENV_VALUE" != "production" ]; then
  echo "Making database migrations (dev/local only)..."
  python manage.py makemigrations --noinput
else
  echo "Skipping makemigrations in production (APP_ENV=$APP_ENV_VALUE)"
fi

echo "Applying database migrations..."
python manage.py migrate --noinput

# Start development server
exec python manage.py runserver 0.0.0.0:8000