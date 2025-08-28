#!/bin/sh

source /app/env.sh
envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js
exec "$@"