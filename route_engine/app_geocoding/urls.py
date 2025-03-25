from django.urls import path
from . import views

app_name = "app_geocoding"

urlpatterns = [
    path('geocode', views.geocode_address, name='geocode_address'),
    path('reverse_geocode', views.reverse_geocode, name='reverse_geocode'),
]
