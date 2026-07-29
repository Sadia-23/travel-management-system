FROM php:8.2-apache
RUN docker-php-ext-install pdo pdo_mysql
RUN a2dismod mpm_event && a2enmod mpm_prefork
RUN a2enmod rewrite
EXPOSE 80
COPY . /var/www/html/