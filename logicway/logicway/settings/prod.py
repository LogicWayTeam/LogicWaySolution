from .base import * # noqa: F401

DEBUG = False

if ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('.taile241c6.ts.net')
else:
    ALLOWED_HOSTS = ['.taile241c6.ts.net']

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://logicway.taile241c6.ts.net:3000",
    "http://logicway-k8s.taile241c6.ts.net:3000",
    "http://192.168.49.2:30000",
]
