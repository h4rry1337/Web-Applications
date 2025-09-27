# FreshMart Mini Market Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Create app user
RUN useradd --create-home --shell /bin/bash market && \
    chown -R market:market /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs static/uploads && \
    chown -R market:market /app

# Switch to non-root user
USER market

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "app.py"]
