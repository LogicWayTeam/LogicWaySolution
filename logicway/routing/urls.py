from django.urls import path
from . import views

app_name = 'routing'

urlpatterns = [
    path('<str:algorithm>/', views.get_transit_route, name='get_transit_route'),
]