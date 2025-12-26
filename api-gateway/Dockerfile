FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
# Matches your index.js port
EXPOSE 8000 
CMD ["node", "index.js"]