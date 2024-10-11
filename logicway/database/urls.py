from django.urls import path
from . import views

urlpatterns = [
    path('api/stops/', views.get_stops, name='get_stops'),
    path('api/stop/<str:stop_name>/', views.get_stop, name='get_stop'),
    path('api/route/<str:route_id>/', views.get_route, name='get_route'),
]
