# Library Management System Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S library && \
    adduser -S library -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs public/uploads

# Set file permissions
RUN chown -R library:library /app

# Create additional configuration file
RUN echo "SESSION_SECRET=library-secret-key-2024" > .env

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Switch to app user
USER library

# Start application
CMD ["npm", "start"]
