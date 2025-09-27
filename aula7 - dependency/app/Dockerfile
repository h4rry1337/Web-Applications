FROM php:7.4-apache

RUN apt-get update && apt-get install -y \
    unzip \
    git \
    zip \
    libzip-dev \
    && docker-php-ext-install zip

RUN docker-php-ext-install pdo pdo_mysql

RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install

RUN mkdir -p templates_c cache && \
    chown -R www-data:www-data templates_c cache && \
    chmod -R 777 templates_c cache

EXPOSE 80
