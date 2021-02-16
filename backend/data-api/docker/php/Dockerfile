FROM php:7.4-fpm-alpine

COPY --from=composer:2.0 /usr/bin/composer /usr/bin/composer
COPY docker/php/conf.d/ $PHP_INI_DIR/conf.d/
COPY docker/php/php-fpm.d/ /usr/local/etc/php-fpm.d/

VOLUME /var/run/php

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV PATH="${PATH}:/root/.composer/vendor/bin"

# Add php-fpm health check helper
RUN apk add --no-cache fcgi

RUN curl -o /usr/local/bin/php-fpm-healthcheck \
   -k https://raw.githubusercontent.com/renatomefi/php-fpm-healthcheck/v0.5.0/php-fpm-healthcheck \
    && chmod +x /usr/local/bin/php-fpm-healthcheck

WORKDIR /srv/app

# build for production
ARG APP_ENV=prod

# prevent the reinstallation of vendors at every changes in the source code
COPY composer.json composer.lock ./
RUN set -eux; \
	composer install --prefer-dist --no-dev --no-scripts --no-progress; \
	composer clear-cache

# copy only specifically what we need
COPY public public/

RUN set -eux; \
	composer dump-autoload --classmap-authoritative --no-dev

CMD ["php-fpm"]