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

# === Create superuser non-interactively ===
# echo "Creating Django superuser if it doesn't exist..."
# python manage.py shell << END
# from django.contrib.auth import get_user_model
# User = get_user_model()
# username = "${DJANGO_SUPERUSER_USERNAME}"
# email = "${DJANGO_SUPERUSER_EMAIL}"
# password = "${DJANGO_SUPERUSER_PASSWORD}"
# if not User.objects.filter(username=username).exists():
#     print(f"Creating user {username}")
#     User.objects.create_superuser(username=username, email=email, password=password)
# else:
#     print(f"Superuser {username} already exists")
# END

# Start development server
exec python manage.py runserver 0.0.0.0:8000

# echo "Launching Uvicorn..."
# exec uvicorn backend.asgi:application \
#   --host 0.0.0.0 \
#   --port 8000 \
#   --workers ${UVICORN_WORKERS:-4} \
#   --timeout-keep-alive 900 \
#   --proxy-headers
