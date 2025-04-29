import pytest
import django
import os
from django.conf import settings


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logicway.logicway.settings')
django.setup()

def test_url_import():
    try:
        import logicway.logicway.urls
    except ModuleNotFoundError:
        pytest.fail("Module 'logicway.logicway.urls' not found.")

def test_settings():
    assert settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'
