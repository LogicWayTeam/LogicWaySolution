from django.urls import path
from . import views

app_name = "app_routing"

urlpatterns = [
    path('get_route', views.get_route, name='get_route'),
]
