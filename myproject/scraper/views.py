from django.shortcuts import render, redirect
from .forms import TramForm
from .scraper import fetch_schedule_table


def get_transport_data(request):
    if request.method == 'POST':
        form = TramForm(request.POST)
        if form.is_valid():
            city_polish = form.cleaned_data['city_polish']
            tram_number = form.cleaned_data['tram_number']
            tram_direction = form.cleaned_data['tram_direction']
            url = f"https://jakdojade.pl/{city_polish}/rozklad-jazdy/linia/MPK_POZNAN-{tram_number}/kierunek/{tram_direction}"

            data = fetch_schedule_table(url)
            request.session['data'] = data
            return redirect('scraper:tram_schedule_v2')
    else:
        form = TramForm()

    return render(request, 'scraper/form.html', {'form': form})


def show_schedule_result(request):
    data = request.session.get('data')  # Получаем данные из сессии
    if not data:
        return redirect('scraper:tram_schedule_v1')

    return render(request, 'scraper/result.html', {'data': data})
