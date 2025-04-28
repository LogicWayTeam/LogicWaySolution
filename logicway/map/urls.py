from django.urls import path
from . import views

app_name = 'map'

urlpatterns = [
    path('map/', views.map_with_stops_view, name='map'),
    path('map4test/', views.map_render_test, name='map4test'),
]
