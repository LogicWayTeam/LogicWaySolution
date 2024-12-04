### Poetry Setting

https://www.jetbrains.com/help/pycharm/poetry.html

### Create the PostgreSQL Database

To set up your PostgreSQL database:

- Log into PostgreSQL:

``` bash
psql -U postgres
```

- Create a new user and password (replace username and password with your values):

``` sql
CREATE USER myuser WITH PASSWORD 'mypassword';
```
- Create the database:

``` sql
CREATE DATABASE logic_way_db;
```

- Grant privileges to the user:

``` sql
GRANT ALL PRIVILEGES ON DATABASE logic_way_db TO myuser;
```

- Exit the PostgreSQL prompt:

``` bash
\q
```

#### To create new SECRET_KEY for Django

``` bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```
### Create .env with own vars

```
# .env

# Django Secret Key
SECRET_KEY=django-insecure-genkey

# PostgreSQL Database Settings
DB_NAME=logic_way_db
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=localhost
DB_PORT=5432

# Host to test
TEST_HOST=http://127.0.0.1:8000
```