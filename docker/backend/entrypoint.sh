#!/bin/sh

if [ "$DATABASE" = "postgres" ] && [ -n "$POSTGRES_HOST" ] && [ -n "$POSTGRES_PORT" ]
then
    echo "Waiting for postgres..."
    if command -v nc >/dev/null 2>&1; then
        while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
            sleep 0.1
        done
    fi
    echo "PostgreSQL started"
fi

exec "$@"
