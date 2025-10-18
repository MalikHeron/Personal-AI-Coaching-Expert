FROM nginx:latest

# Install tzdata and set timezone
RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -sf /usr/share/zoneinfo/America/Jamaica /etc/localtime && \
    echo "America/Jamaica" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean

# Replace default NGINX config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/app-dev.conf /etc/nginx/conf.d

# Copy collected static files into the path served by NGINX
# NOTE: Build with context at the repository root so 'backend/static_root/' is available.
RUN mkdir -p /usr/src/app/backend/static_root
COPY backend/static_root/ /usr/src/app/backend/static_root/

WORKDIR /usr/src/app