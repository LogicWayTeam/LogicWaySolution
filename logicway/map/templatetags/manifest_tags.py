from django import template
from map.utils.manifest_loader import get_manifest

register = template.Library()

@register.simple_tag
def asset_path(filename):
    manifest = get_manifest()
    return manifest.get(filename, filename)
