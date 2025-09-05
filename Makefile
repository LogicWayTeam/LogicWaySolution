
LOGICWAY_DIR = logicway
ROUTE_ENGINE_DIR = route_engine
FRONTEND_DIR = frontend

ENVSH ?= env.sh

configure:
	. ./${ENVSH}

#====================================================================
# ==== DEVELOPMENT ====
#====================================================================

run-logicway:
	poetry run python $(LOGICWAY_DIR)/manage.py runserver 8000

run-route-engine:
	poetry run python $(ROUTE_ENGINE_DIR)/manage.py runserver 8001

run-frontend:
	cd $(FRONTEND_DIR) && npm start

tests:
	poetry run pytest $(LOGICWAY_DIR) $(ROUTE_ENGINE_DIR)

create-key:
	python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
	@echo "> Use the generated key in .sh as SECRET_KEY value"

#====================================================================
# ==== DOCKER COMPOSE ====
#====================================================================

start-docker-dev: configure
	docker compose -f docker-compose.dev.yaml up -d

stop-docker-dev: configure
	docker compose -f docker-compose.dev.yaml stop

rm-docker-dev: configure
	docker compose -f docker-compose.dev.yaml down --remove-orphans

rm-docker-all-dev: configure
	docker compose -f docker-compose.dev.yaml down \
		--rmi all --volumes --remove-orphans

run-docker-jobs-dev: configure
	docker compose -f docker-compose.dev.yaml run logicway \
	sh -c "INTERNAL=1 poetry run python database/upload_data.py \
		&& poetry run python database/load_data.py"


start-docker-prod: configure
	docker compose -f docker-compose.prod.yaml up -d

stop-docker-prod: configure
	docker compose -f docker-compose.prod.yaml stop

rm-docker-prod: configure
	docker compose -f docker-compose.prod.yaml down --remove-orphans

rm-docker-all-prod: configure
	docker compose -f docker-compose.prod.yaml down \
		--rmi all --volumes --remove-orphans

run-docker-jobs-prod: configure
	docker compose -f docker-compose.prod.yaml run logicway \
	sh -c "INTERNAL=1 poetry run python database/upload_data.py \
		&& poetry run python database/load_data.py"


start-docker-ghcr: configure
	docker compose -f docker-compose.ghcr.yaml up -d

stop-docker-ghcr: configure
	docker compose -f docker-compose.ghcr.yaml stop

rm-docker-ghcr: configure
	docker compose -f docker-compose.ghcr.yaml down --remove-orphans

rm-docker-all-ghcr: configure
	docker compose -f docker-compose.ghcr.yaml down \
		--rmi all --volumes --remove-orphans

run-docker-jobs-ghcr: configure
	docker compose -f docker-compose.ghcr.yaml run logicway \
	sh -c "INTERNAL=1 poetry run python database/upload_data.py \
		&& poetry run python database/load_data.py"

#====================================================================
# ==== INFO ====
#====================================================================

help:
	@echo "Makefile commands:"
	@echo "========== DEVELOPMENT =========="
	@echo "  run-logicway           - Run LogicWay backend server"
	@echo "  run-route-engine       - Run Route Engine backend server"
	@echo "  run-frontend           - Run Frontend server"
	@echo "  tests                  - Run tests for backend servers"
	@echo "  create-key             - Create a new Django SECRET_KEY"
	@echo "========== DOCKER =========="
	@echo "---- Development(with build) ----"
	@echo "  start-docker-dev       - Start Docker containers (development)"
	@echo "  stop-docker-dev        - Stop Docker containers (development)"
	@echo "  rm-docker-dev          - Remove Docker containers (development)"
	@echo "  rm-docker-all-dev      - Remove Docker containers, images, volumes (development)"
	@echo "  run-docker-jobs-dev    - Run data upload and load data jobs in Docker (development)"
	@echo "---- Production(with build) ----"
	@echo "  start-docker-prod      - Start Docker containers (production)"
	@echo "  stop-docker-prod       - Stop Docker containers (production)"
	@echo "  rm-docker-prod         - Remove Docker containers (production)"
	@echo "  rm-docker-all-prod     - Remove Docker containers, images, volumes (production)"
	@echo "  run-docker-jobs-prod   - Run data upload and load data jobs in Docker (production)"
	@echo "---- GitHub Container Registry ----"
	@echo "  start-docker-ghcr      - Start Docker containers (GitHub Container Registry)"
	@echo "  stop-docker-ghcr       - Stop Docker containers (GitHub Container Registry)"
	@echo "  rm-docker-ghcr         - Remove Docker containers (GitHub Container Registry)"
	@echo "  rm-docker-all-ghcr     - Remove Docker containers, images, volumes (GitHub Container Registry)"
	@echo "  run-docker-jobs-ghcr   - Run data upload and load data jobs in Docker (GitHub Container Registry)"
	@echo "========== INTERNAL =========="
	@echo "  configure              - Configure environment variables from env.sh"
	@echo "========== VARIABLES =========="
	@echo "  ENVSH=my_env.sh		- Specify the environment file to source (default: env.sh)"

.PHONY: run-logicway run-route-engine run-frontend \
	run-tests configure create-key \
	start-docker-dev stop-docker-dev rm-docker-dev rm-docker-all-dev \
	start-docker-prod stop-docker-prod rm-docker-prod rm-docker-all-prod \
	start-docker-ghcr stop-docker-ghcr rm-docker-ghcr rm-docker-all-ghcr
