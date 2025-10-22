# Personal AI Coaching Expert

Personal AI Coaching Expert is a full-stack web application that provides AI-assisted coaching tools for fitness and wellness. It combines a Python/Django backend (REST API) with a modern React + Vite frontend, includes computer-vision features (MediaPipe) for movement tracking, and is containerized for easy development and deployment.

## Table of contents

- [Personal AI Coaching Expert](#personal-ai-coaching-expert)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Architecture \& Technologies](#architecture--technologies)
  - [Prerequisites](#prerequisites)
  - [Quickstart — Local (development)](#quickstart--local-development)
    - [1) Backend (Django)](#1-backend-django)
    - [2) Frontend (Vite + React)](#2-frontend-vite--react)
    - [3) Running with Docker Compose (recommended)](#3-running-with-docker-compose-recommended)
  - [Environment variables](#environment-variables)
  - [Testing](#testing)
  - [Deployment notes](#deployment-notes)
  - [Troubleshooting \& Tips](#troubleshooting--tips)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- REST API built with Django and Django REST Framework
- JWT authentication using djangorestframework-simplejwt
- Social login: Google and Microsoft integration (social-auth-app-django)
- MediaPipe-based movement tracking and client-side exercise analysis
- File/media handling and blob storage support (Azure Storage integration present)
- PostgreSQL as the primary data store (psycopg)
- Redis for caching/session backend
- Containerized via Docker and orchestrated with Docker Compose

## Architecture & Technologies

- Backend: Python, Django, Django REST Framework
  - Key libs: djangorestframework, djangorestframework-simplejwt, social-auth-app-django, django-redis, whitenoise
- Frontend: React (React 19), TypeScript, Vite, Tailwind CSS, Radix UI components
- Dev tooling: eslint, TypeScript, Vite
- Infrastructure: Docker (Dockerfile at project root and service-level), Docker Compose
- Optional services used in production: PostgreSQL, Redis, Azure Blob Storage

## Prerequisites

- Git
- Docker & Docker Compose (for containerized development and production)
- Node.js (v18+ recommended) and npm/yarn (for frontend local dev)
- Python 3.10+ and pip (for backend local dev) — virtualenv recommended
- PostgreSQL and Redis if running services locally without Docker

## Quickstart — Local (development)

This repository includes both backend (Django) and frontend (Vite) apps. Two common approaches:

A. Run each app locally (recommended for development).
B. Start the entire stack with Docker Compose (recommended for parity with production).

### 1) Backend (Django)

1. Create and activate a Python virtual environment (pwsh):

```pwsh
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```pwsh
pip install -r backend/requirements.txt
```

3. Create an `.env` file in `backend/` or set environment variables (see [Environment variables](#environment-variables)).

4. Apply migrations and create a superuser:

```pwsh
cd backend
python manage.py migrate
python manage.py createsuperuser
```

5. Run the development server:

```pwsh
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000/ by default.

Notes:
- If you use PostgreSQL/Redis locally, ensure `POSTGRES_*` and `REDIS` env vars are configured or point Django to your DB.

### 2) Frontend (Vite + React)

1. Install Node dependencies:

```pwsh
cd frontend
npm install
```

2. Run the dev server:

```pwsh
npm run dev
```

By default Vite will serve the front-end on http://localhost:5173/ (check the console output).

3. When running locally, set `FRONTEND_URL` in the backend environment variables to your frontend origin (for example `http://localhost:5173`) so OAuth redirect URIs and login redirects function correctly.

### 3) Running with Docker Compose (recommended)

A `docker-compose.yml` is present at the repo root. It can start the backend, frontend, Redis, Postgres, and other dependencies depending on configuration.

1. Build and start the stack (from repository root):

```pwsh
docker compose up --build
```

2. To start in detached mode:

```pwsh
docker compose up -d --build
```

3. Tail logs:

```pwsh
docker compose logs -f
```

When using Docker Compose, environment variables are usually injected via `.env` files or compose overrides. Check `docker-compose.yml` and service-level Dockerfiles to confirm which variables are required.

## Environment variables

Key environment variables used by the Django backend (non-exhaustive; check `backend/backend/settings.py` for full list):

- DJANGO_SECRET_KEY - Django secret key (required in production)
- APP_ENV - Environment name (local/development/production)
- DJANGO_ALLOWED_HOSTS - Comma separated hosts allowed
- DJANGO_CORS_ALLOWED_ORIGINS - Comma separated frontend origins allowed for CORS
- DJANGO_CSRF_TRUSTED_ORIGINS - Comma separated trusted origins for CSRF

Database (used when APP_ENV != production):
- POSTGRES_ENGINE - Django DB engine string (e.g., django.db.backends.postgresql)
- POSTGRES_DB - Database name
- POSTGRES_USER - Database user
- POSTGRES_PASSWORD - Database password
- POSTGRES_HOST - Database host
- POSTGRES_PORT - Database port

Production DB (alternative):
- POSTGRES_DB_URL - Full database URL for production (used when APP_ENV == production)

OAuth / Social auth / Microsoft / Google:
- O365_TENANT_ID
- O365_CLIENT_ID
- O365_CLIENT_SECRET
- O365_REDIRECT_URI
- O365_AUTHORITY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- FRONTEND_URL - Used for constructing redirect URIs and login redirects

Email (optional):
- EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, DEFAULT_FROM_EMAIL

Other services:
- REDIS URL/connection settings (for session/cache)
- AZURE storage credentials (if using Azure blob storage)

Tip: For local development create a `backend/.env` file and add the variables you need. The project uses python-dotenv which loads `.env` automatically.

## Testing

- Backend unit tests (Django):

```pwsh
cd backend
python manage.py test
```

- Frontend: there are no frontend tests provided in the repository by default. If you add tests (vitest, jest), include commands in `frontend/package.json`.

## Deployment notes

- The app is designed to run in containers. Use the provided Dockerfiles and `docker-compose.yml` as a starting point.
- Ensure production environment variables are set (secret key, DB URL, OAuth client secrets).
- Use a production-ready WSGI/ASGI server (e.g., Gunicorn or Uvicorn with proper process management, behind a reverse proxy like Nginx).
- Collect static files for Django and configure a CDN or static-file server. Example:

```pwsh
python manage.py collectstatic --noinput
```

- Use secure settings in production: DEBUG=False, proper ALLOWED_HOSTS, secure cookies, HTTPS.

## Troubleshooting & Tips

- Common errors:
  - "OperationalError: could not connect to server": check DB host/port and credentials.
  - CORS issues: ensure `FRONTEND_URL` is included in `DJANGO_CORS_ALLOWED_ORIGINS`.
  - OAuth redirect mismatch: verify provider redirect URIs match `O365_REDIRECT_URI` and `FRONTEND_URL`.

- Useful commands:

```pwsh
# Rebuild Docker images
docker compose build --no-cache

# Run backend migrations in running container
docker compose exec backend python manage.py migrate

# Create superuser in running container
docker compose exec backend python manage.py createsuperuser
```

## Contributing

Contributions are welcome. Please open issues and pull requests against the `develop` branch. Keep changes small and focused. Add tests for any new backend functionality.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---
