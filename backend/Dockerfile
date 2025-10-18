FROM python:3.9.22-slim-bullseye

WORKDIR /usr/src/app/backend/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TZ=America/Jamaica

# Install system dependencies and cron
RUN apt-get update && apt-get install -y apt-utils \
    gcc g++ cron tree ca-certificates netcat nano tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    update-ca-certificates procps && \
    apt-get clean

# Upgrade pip and install dependencies
COPY ./requirements.txt /usr/src/app/backend/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy all application code
COPY . .

# Ensure the entrypoint script is executable
RUN chmod +x entrypoint.sh

# Start script includes cron + Django runserver
CMD ["./entrypoint.sh"]