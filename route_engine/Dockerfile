# syntax=docker/dockerfile:1

FROM python:3.10-slim

WORKDIR /app

COPY ./pyproject.toml ./poetry.lock ./
RUN pip install poetry
RUN poetry lock &&  poetry install --no-root --only main,route_engine --no-cache

COPY ./route_engine ./route_engine

ENV DJANGO_SETTINGS_MODULE=route_engine.settings.prod
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/route_engine
EXPOSE 8001
CMD ["poetry", "run", "gunicorn", "route_engine.wsgi:application", "--bind", "0.0.0.0:8001"]
