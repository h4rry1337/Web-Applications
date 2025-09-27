# Network Diagnostics Tool - PHP Application
FROM php:8.2-apache

# Install system utilities needed for network diagnostics
RUN apt-get update && apt-get install -y \
    iputils-ping \
    net-tools \
    dnsutils \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy application files
COPY index.php /var/www/html/

# Copy flag file
COPY flag.txt /var/www/html/flag.txt

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod 644 /var/www/html/index.php \
    && chmod 644 /var/www/html/flag.txt

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
