from .base import * # noqa: F401

DEBUG = False

if ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('.taile241c6.ts.net')
else:
    ALLOWED_HOSTS = ['.taile241c6.ts.net']
