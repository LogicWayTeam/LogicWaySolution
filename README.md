### Poetry Setting

https://www.jetbrains.com/help/pycharm/poetry.html

### Install Dependencies

- To install all dependencies: `poetry install`

### Poetry Dependency Groups

This project uses Poetry dependency groups to organize different types of dependencies:

- **Main dependencies**: Core packages needed for all services (Django, envsh, etc.)
- **logicway**: Dependencies specific to LogicWay service (SQLAlchemy, Selenium, pandas, etc.)
- **route_engine**: Dependencies for Route Engine service (routingpy, geopy)
- **dev**: Development and testing dependencies (pytest, ruff linter, etc.)

Install specific groups:
```bash
# Install all dependencies (default)
poetry install

# Install main + specific groups
poetry install --with=logicway,route_engine

# Install only dev dependencies
poetry install --only=dev
```

### Make Commands

This project uses a Makefile for common development and deployment tasks:

#### Development Commands
- `make run-logicway` - Run LogicWay backend server on port 8000
- `make run-route-engine` - Run Route Engine backend server on port 8001  
- `make run-frontend` - Run React frontend development server
- `make tests` - Run pytest tests for backend services
- `make create-key` - Generate a new Django SECRET_KEY for env.sh

#### Docker Development
- `make start-docker-dev` - Start all services with docker-compose (development)
- `make stop-docker-dev` - Stop all Docker services (development)
- `make rm-docker-dev` - Remove Docker containers (development)
- `make rm-docker-all-dev` - Remove containers, images, volumes (development)
- `make run-docker-jobs-dev` - Run data upload/load jobs in Docker (development)

#### Docker Production
- `make start-docker-prod` - Start all services (production)
- `make stop-docker-prod` - Stop all services (production)
- `make rm-docker-prod` - Remove containers (production)
- `make rm-docker-all-prod` - Remove containers, images, volumes (production)
- `make run-docker-jobs-prod` - Run data jobs (production)

#### Docker GitHub Container Registry
- `make start-docker-ghcr` - Start services using GHCR images
- `make stop-docker-ghcr` - Stop GHCR services
- `make rm-docker-ghcr` - Remove GHCR containers
- `make rm-docker-all-ghcr` - Remove GHCR containers, images, volumes
- `make run-docker-jobs-ghcr` - Run data jobs with GHCR images

#### Other Commands
- `make help` - Show all available commands with descriptions
- `make configure` - Load environment variables from env.sh

**Note**: Most Docker commands automatically run `make configure` to load env.sh variables.

### Quick Start

1. **Setup environment**:
   ```bash
   # Create your env.sh file (see template below)
   cp env.sh.example env.sh
   # Edit env.sh with your settings
   
   # Install dependencies
   poetry install
   ```

2. **Development (local)**:
   ```bash
   # Start all services locally
   make run-logicway      # Terminal 1
   make run-route-engine  # Terminal 2  
   make run-frontend      # Terminal 3
   
   # Or run tests
   make tests
   ```

3. **Development (Docker)**:
   ```bash
   # Start all services in Docker
   make start-docker-dev
   
   # Run data import jobs
   make run-docker-jobs-dev
   
   # Stop services
   make stop-docker-dev
   ```
