#!/bin/bash
set -e

# Ensure host keys exist
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
  echo "Generating SSH host keys..."
  ssh-keygen -A
fi

# Start SSH service
service ssh start

# Try running main entrypoint, fallback to Nginx if it fails
if [ -x /entrypoint.sh ]; then
  /entrypoint.sh || {
    echo "Entrypoint failed with code $? — starting nginx for debug"
    nginx -g "daemon off;"
  }
else
  echo "/entrypoint.sh not found or not executable; starting nginx as fallback"
  exec nginx -g "daemon off;"
fi
