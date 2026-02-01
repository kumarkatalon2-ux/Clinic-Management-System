# Use official Node.js runtime as base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy backend package files
COPY src/backend/package.json src/backend/package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "src/backend/server.js"]
