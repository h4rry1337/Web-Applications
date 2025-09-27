# Multi-stage Docker build for Ice Cream Order Management Service
# Stage 1: Build the application
FROM openjdk:17-jdk-slim AS builder

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Maven configuration files
COPY pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime environment
FROM openjdk:17-jdk-slim

# Create application user
RUN useradd -m -s /bin/bash icecream

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    netcat-traditional \
    procps \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy the JAR file from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create configuration files
RUN echo "admin:\$6\$salt\$hashedpassword" > /etc/shadow.backup && \
    echo "DATABASE_PASSWORD=SuperSecretDBPassword123!" > /app/database.conf && \
    echo "ENCRYPTION_KEY=MyVerySecretEncryptionKey2024" > /app/encryption.key && \
    echo "API_MASTER_KEY=master_api_key_xyz123abc456" > /app/api_keys.txt

# Setup SSH directory
RUN mkdir -p /home/icecream/.ssh && \
    echo "-----BEGIN PRIVATE KEY-----" > /home/icecream/.ssh/id_rsa && \
    echo "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..." >> /home/icecream/.ssh/id_rsa && \
    echo "-----END PRIVATE KEY-----" >> /home/icecream/.ssh/id_rsa && \
    chmod 600 /home/icecream/.ssh/id_rsa && \
    chown -R icecream:icecream /home/icecream/.ssh

# Create application logs directory
RUN mkdir -p /app/logs && \
    chown -R icecream:icecream /app

# Environment variables
ENV SPRING_PROFILES_ACTIVE=production
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SERVER_PORT=8080
ENV FLAG="hackingclub{2e48055f481daa48718c11658ae11b06}"

# Expose application port
EXPOSE 8080

# Add labels for documentation
LABEL maintainer="Ice Cream Shop Development Team"
LABEL application="Ice Cream Order Management Service"
LABEL version="1.0.0"
LABEL description="Spring Boot microservice for ice cream order management"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Create startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'echo "=========================================="' >> /app/start.sh && \
    echo 'echo "🍦 Ice Cream Order Management Service"' >> /app/start.sh && \
    echo 'echo "=========================================="' >> /app/start.sh && \
    echo 'echo "Starting Spring Boot application..."' >> /app/start.sh && \
    echo 'echo "📋 Application Info:"' >> /app/start.sh && \
    echo 'echo "   - Main App: http://localhost:8080/api/v1"' >> /app/start.sh && \
    echo 'echo "   - Documentation: http://localhost:8080"' >> /app/start.sh && \
    echo 'echo "   - H2 Console: http://localhost:8080/api/v1/h2-console"' >> /app/start.sh && \
    echo 'echo "   - Actuator: http://localhost:8080/actuator"' >> /app/start.sh && \
    echo 'echo "=========================================="' >> /app/start.sh && \
    echo 'echo "Starting Java application..."' >> /app/start.sh && \
    echo 'exec java ${JAVA_OPTS} -jar app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh

# Switch to application user
USER icecream

# Run the application
CMD ["java", "-jar", "app.jar"]
