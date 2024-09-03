from django import forms

class TramForm(forms.Form):
    city_polish = forms.CharField(label="City (polish)", max_length=100)
    tram_number = forms.CharField(label="Please enter tram number", max_length=2)
    tram_direction = forms.CharField(label="Choose your direction", max_length=100)
