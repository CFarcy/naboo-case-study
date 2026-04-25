SHELL := /bin/sh

BACKEND_DIR := back-end
FRONTEND_DIR := front-end
COMPOSE_FILE := compose.yaml
BACKEND_ENV := $(BACKEND_DIR)/.env
BACKEND_ENV_DIST := $(BACKEND_DIR)/.env.dist

.PHONY: install setup db-up db-down db-reset start start-dev backend-dev frontend-dev check lint test build

install:
	npm install --prefix "$(BACKEND_DIR)"
	npm install --prefix "$(FRONTEND_DIR)"

setup:
	@if [ -f "$(BACKEND_ENV)" ]; then \
		printf '%s\n' "$(BACKEND_ENV) already exists"; \
	else \
		cp "$(BACKEND_ENV_DIST)" "$(BACKEND_ENV)"; \
		printf '%s\n' "Created $(BACKEND_ENV) from $(BACKEND_ENV_DIST)"; \
		printf '%s\n' "Update $(BACKEND_ENV) before starting the backend"; \
	fi

db-up:
	docker compose -f "$(COMPOSE_FILE)" up -d mongodb

db-down:
	docker compose -f "$(COMPOSE_FILE)" stop mongodb

db-reset:
	docker compose -f "$(COMPOSE_FILE)" down --volumes

start start-dev:
	@docker compose -f "$(COMPOSE_FILE)" up -d mongodb
	@printf '%s\n' "Waiting for naboo-mongodb to become healthy (docker inspect health check)..."
	@WAIT_SECONDS=60; \
	count=0; \
	until [ "$$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}' naboo-mongodb 2>/dev/null)" = "healthy" ]; do \
		count=$$((count + 1)); \
		if [ $$count -ge $$WAIT_SECONDS ]; then \
			printf '%s\n' "Timeout error: naboo-mongodb did not become healthy within $${WAIT_SECONDS}s. Check 'docker compose ps' and 'docker inspect --format='{{.State.Health}}' naboo-mongodb' for details." >&2; \
			exit 1; \
		fi; \
		sleep 1; \
	done; \
	printf '%s\n' "naboo-mongodb is healthy."
	@backend_pid=; frontend_pid=; \
	trap 'status=$$?; \
		if [ -n "$$backend_pid" ]; then kill $$backend_pid 2>/dev/null || true; fi; \
		if [ -n "$$frontend_pid" ]; then kill $$frontend_pid 2>/dev/null || true; fi; \
		wait $$backend_pid $$frontend_pid 2>/dev/null || true; \
		exit $$status' INT TERM EXIT; \
	npm run start:dev --prefix "$(BACKEND_DIR)" & \
	backend_pid=$$!; \
	npm run dev --prefix "$(FRONTEND_DIR)" & \
	frontend_pid=$$!; \
	wait $$backend_pid $$frontend_pid

backend-dev:
	npm run start:dev --prefix "$(BACKEND_DIR)"

frontend-dev:
	npm run dev --prefix "$(FRONTEND_DIR)"

check:
	npm run check --prefix "$(BACKEND_DIR)"
	npm run check --prefix "$(FRONTEND_DIR)"

lint:
	npm run lint --prefix "$(BACKEND_DIR)"
	npm run lint --prefix "$(FRONTEND_DIR)"

test:
	npm run test --prefix "$(BACKEND_DIR)"
	npm run test --prefix "$(FRONTEND_DIR)"

build:
	npm run build --prefix "$(BACKEND_DIR)"
	npm run build --prefix "$(FRONTEND_DIR)"
