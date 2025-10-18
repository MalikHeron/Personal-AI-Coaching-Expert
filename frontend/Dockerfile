FROM node:alpine

# Install tzdata to set timezone
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Jamaica /etc/localtime && \
    echo "America/Jamaica" > /etc/timezone

WORKDIR /usr/src/app/frontend

COPY package*.json ./
RUN npm install --legacy-peer-deps

CMD ["npm", "run", "dev"]