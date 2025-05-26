from .base import *

DEBUG = False

ALLOWED_HOSTS.append('.taile241c6.ts.net')

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://logicway.taile241c6.ts.net:3000",
    "http://logicway-k8s.taile241c6.ts.net:3000",
]
