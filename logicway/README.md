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

### Run the logicway Service

#### Developing

``` bash
python manage.py runserver --settings=logicway.settings.dev
```

#### Production

``` bash
python manage.py collectstatic --settings=logicway.settings.prod
python manage.py runserver --settings=logicway.settings.prod
```