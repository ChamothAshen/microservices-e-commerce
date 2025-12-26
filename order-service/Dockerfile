FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
# Matches your index.js port
EXPOSE 5003
CMD ["node", "index.js"]