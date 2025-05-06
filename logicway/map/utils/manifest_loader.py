import json
import os
from django.conf import settings

_manifest_cache = None

def get_manifest():
    global _manifest_cache
    if _manifest_cache:
        return _manifest_cache

    manifest_path = os.path.join(
        settings.BASE_DIR, 'map', 'static', 'map', 'frontend', 'asset-manifest.json'
    )

    try:
        with open(manifest_path, 'r') as f:
            _manifest_cache = json.load(f)['files']
            return _manifest_cache
    except FileNotFoundError:
        return {}
