# syntax=docker/dockerfile:1

FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./pyproject.toml ./poetry.lock ./
RUN pip install poetry
RUN poetry lock && poetry install --no-root --only main,logicway --no-cache

COPY ./logicway ./logicway
# IMPORTANT: Build from project root
# docker build -f logicway/Dockerfile -t logicway:latest .


ENV DJANGO_SETTINGS_MODULE=logicway.settings.prod
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/logicway

ENV APP_BUILD_PHASE=1
RUN poetry run python manage.py collectstatic --noinput
ENV APP_BUILD_PHASE=0

EXPOSE 8000
CMD ["poetry", "run", "gunicorn", "logicway.wsgi:application", "--bind", "0.0.0.0:8000"]
