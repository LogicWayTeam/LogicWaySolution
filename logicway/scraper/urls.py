from django.urls import path
from . import views

app_name = 'scraper'

urlpatterns = [
    path('tram_schedule_v1/', views.get_transport_data, name='tram_schedule_v1'),
    path('tram_schedule_v2/', views.show_schedule_result, name='tram_schedule_v2'),
]
