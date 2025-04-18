from django.shortcuts import render
import os
from dotenv import load_dotenv

load_dotenv()
ROUTE_ENGINE_URL = os.getenv('ROUTE_ENGINE_URL')

def map_with_stops_view(request):
    return render(request, 'map/map.html',{
        'ROUTE_ENGINE_URL': ROUTE_ENGINE_URL
    })
