### Poetry Setting

https://www.jetbrains.com/help/pycharm/poetry.html

### Install Dependencies

- To install all dependencies: `poetry install`
- Install only for logicway service: `poetry install --with logicway`
- Install only for route_engine service: `poetry install --with route_engine`

#### To create new SECRET_KEY for Django

``` bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```
### Create .env with own vars

```
# .env

# Django Secret Key
SECRET_KEY=django-insecure-genkey
ROUTE_ENGINE_SECRET_KEY=django-insecure-genkey

ROUTE_ENGINE_URL=http://localhost:8001

# PostgreSQL Database Settings
DB_NAME=logic_way_db
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=localhost
DB_PORT=5432
```

### Development and deployment with Docker Compose

#### Development compose commands

- Build and run the containers in detached mode: `docker compose -f docker-compose.dev.yaml up -d`
- Just stop the containers: `docker compose -f docker-compose.dev.yaml stop`
- Stop and remove the containers: `docker compose -f docker-compose.dev.yaml down --remove-orphans`
- If you are deleting all containers and images, you can use the following command:
  `
  docker compose -f docker-compose.dev.yaml down --rmi all --volumes --remove-orphans
  `

#### Production compose commands

- Build and run the containers in detached mode: `docker compose -f docker-compose.prod.yaml up -d`
- Just stop the containers: `docker compose -f docker-compose.prod.yaml stop`
- Stop and remove the containers: `docker compose -f docker-compose.prod.yaml down --remove-orphans`
- If you are deleting all containers and images, you can use the following command:
`
docker compose -f docker-compose.prod.yaml down --rmi all --volumes --remove-orphans
`

#### Production compose (images form GitHub Container Registry)

- Build and run the containers in detached mode: `docker compose -f docker-compose.ghcr.yaml up -d`
- Just stop the containers: `docker compose -f docker-compose.ghcr.yaml stop`
- Stop and remove the containers: `docker compose -f docker-compose.ghcr.yaml down --remove-orphans`
- If you are deleting all containers and images, you can use the following command:
  `
  docker compose -f docker-compose.ghcr.yaml down --rmi all --volumes --remove-orphans
  `

#### Jobs

Important: Ensure the database is properly initialized.
- Run loading data job: 
`
docker compose -f docker-compose.dev.yaml run logicway sh -c "INTERNAL=1 poetry run python database/upload_data.py && poetry run python database/load_data.py"
`
and if production:
`
docker compose -f docker-compose.prod.yaml run logicway sh -c "INTERNAL=1 poetry run python database/upload_data.py && poetry run python database/load_data.py"
`

### Production preparation and Deployment

Generate requirements.txt files for each service:
``` bash
poetry export --with logicway --without-hashes -f requirements.txt -o logicway/requirements.txt
poetry export --with route_engine --without-hashes -f requirements.txt -o route_engine/requirements.txt
```
