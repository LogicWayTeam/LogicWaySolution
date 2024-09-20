from django.db import models

class TramRoute(models.Model):
    city = models.CharField(max_length=100)
    tram_number = models.CharField(max_length=10)
    direction = models.CharField(max_length=100)
    schedule = models.TextField()

    def __str__(self):
        return f"{self.city} - {self.tram_number} - {self.direction}"
