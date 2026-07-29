FROM php:8.2-apache
RUN docker-php-ext-install pdo pdo_mysql

RUN rm -f /etc/apache2/mods-enabled/mpm_event.load \
          /etc/apache2/mods-enabled/mpm_event.conf \
          /etc/apache2/mods-enabled/mpm_worker.load \
          /etc/apache2/mods-enabled/mpm_worker.conf && \
    ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load && \
    ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

# DEBUG: show exactly what's enabled after our fix
RUN ls -la /etc/apache2/mods-enabled/ | grep mpm
RUN apache2ctl -M 2>&1 | grep -i mpm || true

RUN a2enmod rewrite
EXPOSE 80
COPY . /var/www/html/