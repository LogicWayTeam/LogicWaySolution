from django.shortcuts import render
import os
import envsh

envsh.load(search_paths=["../.."])
ROUTE_ENGINE_URL = envsh.read_env('ROUTE_ENGINE_URL', str)

def map_with_stops_view(request):
    return render(request, 'map/map.html',{
        'ROUTE_ENGINE_URL': ROUTE_ENGINE_URL
    })

def map_render_test(request):
    return render(request, 'map/map4test.html')

def map_prod(request):
    return render(request, 'map/map_prod.html')
