# Base image
FROM node:lts

# Install system dependencies (ffmpeg, imagemagick, webp)
RUN apt-get update && apt-get install -y --no-install-recommends \
  ffmpeg \
  imagemagick \
  webp \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy rest of the application code
COPY . .

# Set environment variable
ENV NODE_ENV=production

# Expose port if needed (optional)
EXPOSE 3000

# Start the bot using PM2 (safe for containers)
CMD ["pm2-runtime", "start", "index.js"]
