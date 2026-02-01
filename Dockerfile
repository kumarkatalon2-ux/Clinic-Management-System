# Use official Node.js runtime as base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy entire project
COPY . .

# Install dependencies from backend
WORKDIR /app/src/backend
RUN npm install --production

# Set working directory back to app root
WORKDIR /app

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "src/backend/server.js"]
