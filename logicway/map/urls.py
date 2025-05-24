from django.urls import path
from django.conf import settings
from . import views

app_name = 'map'

urlpatterns = [
    path('', views.map_prod, name='map_prod'),
]

if settings.DEBUG:
    path('map/', views.map_with_stops_view, name='map'),
    path('map4test/', views.map_render_test, name='map4test'),
