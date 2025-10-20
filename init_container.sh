#!/bin/bash
set -e

# Ensure host keys exist (in case image didn't have them generated)
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
  echo "Generating SSH host keys..."
  ssh-keygen -A
fi

# Start SSH service
service ssh start

# Chain to existing entrypoint logic
if [ -x /entrypoint.sh ]; then
  exec /entrypoint.sh
else
  echo "/entrypoint.sh not found or not executable; starting nginx as fallback"
  exec nginx -g "daemon off;"
fi
