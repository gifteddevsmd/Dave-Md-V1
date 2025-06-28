# 🐳 Use official Node.js 20 image (matches your package.json engines)
FROM node:20

# 📁 Set working directory
WORKDIR /app

# 📦 Copy package files first to utilize Docker cache
COPY package*.json ./

# 📥 Install dependencies
RUN npm install

# 📁 Copy all project files
COPY . .

# 🌐 Expose the app port (Heroku/Railway auto-detect this)
EXPOSE 3000

# 🚀 Start the backend (your actual entry point is index.js)
CMD ["node", "index.js"]
