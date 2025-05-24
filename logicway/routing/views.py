from django.http import JsonResponse, HttpRequest, HttpResponse, StreamingHttpResponse
from django.conf import settings
from .simple_greedy_search import SimpleGreedySearch
import requests
import logging
from dotenv import load_dotenv
import os

ALGORITHMS = {
    'SimpleGreedySearch': SimpleGreedySearch,
}

logger = logging.getLogger(__name__)

load_dotenv()

def proxy_route_engine(request: HttpRequest, path: str):
    PROXY_TARGET_URL = f"{os.getenv('ROUTE_ENGINE_URL')}/{path.lstrip('/')}"
    params = request.GET.copy()

    headers_to_target = {}
    if 'Content-Type' in request.headers:
        headers_to_target['Content-Type'] = request.headers['Content-Type']

    logger.debug(f"Proxying {request.method} request to: {PROXY_TARGET_URL} with params: {params}")
    logger.debug(f"Forwarding headers: {headers_to_target}")
    if request.method in ['POST', 'PUT', 'PATCH']:
        logger.debug(f"Forwarding body (first 100 bytes): {request.body[:100]}")

    try:
        response_from_target = requests.request(
            method=request.method,
            url=PROXY_TARGET_URL,
            headers=headers_to_target,
            data=request.body if request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] else None,
            params=params,
            stream=True,
            timeout=getattr(settings, "PROXY_TIMEOUT", 30)
        )

        logger.debug(f"Received response from target: {response_from_target.status_code}")

        django_response = StreamingHttpResponse(
            response_from_target.iter_content(chunk_size=8192),
            status=response_from_target.status_code,
            content_type=response_from_target.headers.get('Content-Type')
        )

        excluded_headers = [
            'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
            'te', 'trailers', 'transfer-encoding', 'upgrade',
            'content-encoding',
            'content-length',
            'set-cookie',
        ]

        for header_name, header_value in response_from_target.headers.items():
            if header_name.lower() not in excluded_headers:
                django_response[header_name] = header_value

        if 'Set-Cookie' in response_from_target.headers:
            pass

        return django_response

    except requests.exceptions.Timeout:
        logger.error(f"Proxy request to {PROXY_TARGET_URL} timed out.")
        return HttpResponse("Proxy server: target server did not respond in time (timeout).", status=504)
    except requests.exceptions.ConnectionError:
        logger.error(f"Proxy request to {PROXY_TARGET_URL} connection failed.")
        return HttpResponse("Proxy server: failed to connect to target server.", status=502)
    except requests.exceptions.RequestException as e:
        logger.error(f"Proxy request to {PROXY_TARGET_URL} failed: {e}")
        return HttpResponse(f"Proxy server: error while accessing target server: {str(e)}", status=502)

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