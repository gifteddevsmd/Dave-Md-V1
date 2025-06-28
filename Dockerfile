# Use official Node.js LTS image
FROM node:lts

# Install required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory inside container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force
RUN npm install -g pm2

# Copy the rest of your project files
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose port (if you're using express or a dashboard)
# EXPOSE 3000

# Start the bot using pm2 to keep it alive
CMD ["pm2-runtime", "start.js"]
