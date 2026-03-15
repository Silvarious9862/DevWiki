#!/bin/sh
set -e

echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."

until nc -z "$DB_HOST" "$DB_PORT"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - starting app"
exec "$@"
