from django.urls import path
from . import views

urlpatterns = [
    path('stops/', views.get_stops, name='get_stops'),
    path('stop/<str:stop_name>/', views.get_stop, name='get_stop'),
    path('route/<str:route_id>/<int:direction>/', views.get_route, name='get_route'),
]