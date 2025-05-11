from django.urls import path
from . import views

app_name = 'routing'

urlpatterns = [
    path('<str:algorithm>/', views.get_transit_route, name='get_transit_route'),
    path('proxy_route_engine/<path:path>', views.proxy_route_engine, name='proxy_route_engine'),
]