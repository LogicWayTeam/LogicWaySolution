from django.urls import path
from . import views

urlpatterns = [
    path('api/stops/', views.get_stops, name='get_stops'),
]
