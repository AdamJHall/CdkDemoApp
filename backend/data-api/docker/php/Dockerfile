FROM php:8.0-fpm

COPY --from=composer:2.0 /usr/bin/composer /usr/bin/composer
COPY docker/php/conf.d/ $PHP_INI_DIR/conf.d/
COPY docker/php/php-fpm.d/ /usr/local/etc/php-fpm.d/

VOLUME /var/run/php

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV PATH="${PATH}:/root/.composer/vendor/bin"

WORKDIR /srv/api

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