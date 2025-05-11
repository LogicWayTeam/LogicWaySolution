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

### Production preparation and Deployment

Generate requirements.txt files for each service:
``` bash
poetry export --with logicway --without-hashes -f requirements.txt -o logicway/requirements.txt
poetry export --with route_engine --without-hashes -f requirements.txt -o route_engine/requirements.txt
```
