from django.urls import path
from . import views

app_name = 'map'

urlpatterns = [
    path('map/', views.map_with_stops_view, name='map'),
    path('graphhopper-proxy/route', views.graphhopper_proxy, name='graphhopper_proxy'),
]
