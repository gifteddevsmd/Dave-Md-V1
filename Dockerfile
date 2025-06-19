# 🐳 Use official Node.js 18 image
FROM node:18

# 📁 Set working directory
WORKDIR /app

# 📦 Copy dependency files first (for better caching)
COPY package*.json ./

# 📥 Install dependencies
RUN npm install

# 📁 Copy all project files
COPY . .

# 🌐 Expose port (platforms like Railway/Heroku auto-assign this)
EXPOSE 3000

# 🚀 Start your pairing backend
CMD ["node", "pair.js"]
