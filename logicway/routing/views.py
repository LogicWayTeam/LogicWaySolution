from django.http import JsonResponse
from .simple_greedy_search import SimpleGreedySearch

ALGORITHMS = {
    'SimpleGreedySearch': SimpleGreedySearch,
}

def get_transit_route(request, algorithm):
    try:
        # Получаем параметры из запроса
        start_lat = float(request.GET.get('start_lat'))
        start_lon = float(request.GET.get('start_lon'))
        end_lat = float(request.GET.get('end_lat'))
        end_lon = float(request.GET.get('end_lon'))

        AlgorithmClass = ALGORITHMS.get(algorithm)

        route_builder = AlgorithmClass()

        route_segments = route_builder.build_route(start_lat, start_lon, end_lat, end_lon)

        segments = []
        for segment in route_segments:
            if segment.type == 'walking':
                segments.append({
                    'type': 'walking',
                    'from': [segment.from_stop.lat, segment.from_stop.lon],
                    'to': [segment.to_stop.lat, segment.to_stop.lon]
                })
            else:
                segments.append({
                    'type': 'transport',
                    'transport_type': segment.transport_type,
                    'route_number': segment.route_number,
                    'from_stop': {
                        'name': segment.from_stop.name,
                        'location': [segment.from_stop.lat, segment.from_stop.lon]
                    },
                    'to_stop': {
                        'name': segment.to_stop.name,
                        'location': [segment.to_stop.lat, segment.to_stop.lon]
                    },
                    'departure_time': segment.departure_time.strftime('%H:%M') if segment.departure_time else None,
                    'arrival_time': segment.arrival_time.strftime('%H:%M') if segment.arrival_time else None
                })

        return JsonResponse({'segments': segments})

    except (ValueError, TypeError) as e:
        return JsonResponse({'error': f'Invalid parameters: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)