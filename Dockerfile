# Use Node.js v18 base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose port (Heroku, Railway, etc. will override this)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
