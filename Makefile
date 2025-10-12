# ============================================================
# Genially Makefile - hyphen targets, emojis, idempotent
# Default target: help
# ============================================================

SHELL := /bin/sh
.ONESHELL:
.DEFAULT_GOAL := help

REPO_ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null || pwd)
DC := $(shell command -v docker-compose >/dev/null 2>&1 && echo docker-compose || echo docker compose)

ENV_FILES := .env mongo-migrations/.env.local
-include $(wildcard $(ENV_FILES))
export

NODE_PORT ?= 3000
HEALTH_URL ?= http://localhost:$(NODE_PORT)/

# Mongo defaults for local usage; override via .env if you wish
MONGO_HOST ?= localhost
MONGO_PORT ?= 27017
MONGO_DATABASE ?= genially
MONGO_USERNAME ?= genially_user
MONGO_PASSWORD ?= supersecurepassword
MONGO_AUTH_SOURCE ?= admin

# Always force localhost for local tools
LOCAL_MONGO_URL := mongodb://$(MONGO_USERNAME):$(MONGO_PASSWORD)@$(MONGO_HOST):$(MONGO_PORT)/$(MONGO_DATABASE)?authSource=$(MONGO_AUTH_SOURCE)

MIG_DIR := $(REPO_ROOT)/mongo-migrations

# ------------------------------------------------------------
# Utility function macros
# ------------------------------------------------------------

# NVM_EXEC DIR, CMD
define NVM_EXEC
	@if [ -f "$(1)/.nvmrc" ]; then
		VER=$$(tr -d '[:space:]' < "$(1)/.nvmrc")
		echo "🟢 nvm: $(1) → $$VER"
		sh -lc "cd '$(1)' && nvm install '$$VER' >/dev/null 2>&1 || true && nvm use '$$VER' >/dev/null 2>&1 || true && $(2)"
	else
		echo "🟢 nvm: $(1) → using system Node"
		sh -lc "cd '$(1)' && $(2)"
	fi
endef

define CHECK_DOCKER
	@set -e
	if ! docker info >/dev/null 2>&1; then
		echo "🐳 Docker is not reachable. Start Docker first."
		exit 1
	fi
	@$(DC) version >/dev/null 2>&1 || { echo "🐳 Docker Compose is not reachable."; exit 1; }
	echo "🐳 Docker ok"
endef

define CHECK_MONGOSH
	@command -v mongosh >/dev/null 2>&1 || { \
		echo "🍃 mongosh not found in PATH. Install MongoDB Shell (mongosh)."; \
		exit 1; }
endef

define WAIT_API
	@set -e
	echo "🔍 Waiting for API health at $(HEALTH_URL)"
	i=0
	while ! curl -sf "$(HEALTH_URL)" | grep -q '"status":"ok"'; do
		i=$$((i+1))
		if [ $$i -gt 60 ]; then
			echo " ⛔ timeout"
			exit 1
		fi
		printf "⏳"
		sleep 2
	done
	echo " ✅ healthy"
endef

define HEALTH_API
	@set -e
	echo "❤️ Health check → $(HEALTH_URL)"
	curl -sf "$(HEALTH_URL)" || { echo "⛔ unhealthy"; exit 1; }
	echo
endef

define ENSURE_API
	@set -e
	echo "🔁 Ensuring API is healthy at $(HEALTH_URL)"
	if curl -sf "$(HEALTH_URL)" | grep -q '"status":"ok"'; then
		echo "✅ API already healthy"
	else
		echo "⚠️  API not healthy, booting stack"
		$(MAKE) docker-up
	fi
endef

# ------------------------------------------------------------
# Help and env
# ------------------------------------------------------------
.PHONY: help
help: ## Show available targets with short descriptions
	@echo "usage: make <target>"
	@echo
	@awk -F':|##' '/^[a-zA-Z0-9_%-]+:.*##/ { printf "  %-30s %s\n", $$1, $$3 }' $(MAKEFILE_LIST)

.PHONY: show-env
show-env: ## Print env info, Node versions, and both Mongo URIs (docker vs local)
	@set -e
	echo "🔧 REPO_ROOT=$(REPO_ROOT)"
	echo "🔧 DC=$(DC)"
	echo "🔧 NODE_PORT=$(NODE_PORT)"
	echo "🔧 HEALTH_URL=$(HEALTH_URL)"
	for f in $(ENV_FILES); do
	  if [ -f $$f ]; then echo "🧩 $$f present"; else echo "⚠️  $$f missing"; fi
	done
	if [ -f "$(REPO_ROOT)/.nvmrc" ]; then
	  VER=$$(tr -d "[:space:]" < "$(REPO_ROOT)/.nvmrc")
	  printf "🟩 root .nvmrc → %s\n" "$$VER"
	else
	  echo "🟩 root .nvmrc → not found"
	fi
	if [ -d "$(MIG_DIR)" ]; then
	  if [ -f "$(MIG_DIR)/.nvmrc" ]; then
	    VER=$$(tr -d "[:space:]" < "$(MIG_DIR)/.nvmrc")
	    printf "🟪 migrations .nvmrc → %s\n" "$$VER"
	  else
	    echo "🟪 migrations .nvmrc → not found"
	  fi
	else
	  echo "🟪 migrations dir → not present"
	fi
	echo "🗄️  Docker MONGO_URI (from .env if set): $(MONGO_URI)"
	echo "🗄️  Local  MONGO_URI (forced localhost): $(LOCAL_MONGO_URL)"

.PHONY: env-setup
env-setup: ## Print recommended local setup for NVM (root and migrations)
	@set -e
	echo "🧰 Environment setup instructions"
	echo
	if [ -f "$(REPO_ROOT)/.nvmrc" ]; then
	  ROOT_VER=$$(tr -d "[:space:]" < "$(REPO_ROOT)/.nvmrc")
	  echo "🟢 Node.js for root project:"
	  echo "   curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
	  echo "   . \"$$HOME/.nvm/nvm.sh\""
	  echo "   cd \"$(REPO_ROOT)\""
	  echo "   nvm install $$ROOT_VER"
	  echo "   nvm use $$ROOT_VER"
	  echo "   nvm alias default $$ROOT_VER"
	  echo
	fi
	if [ -d "$(MIG_DIR)" ] && [ -f "$(MIG_DIR)/.nvmrc" ]; then
	  MIG_VER=$$(tr -d "[:space:]" < "$(MIG_DIR)/.nvmrc")
	  echo "🟢 Node.js for mongo-migrations:"
	  echo "   . \"$$HOME/.nvm/nvm.sh\""
	  echo "   cd \"$(MIG_DIR)\""
	  echo "   nvm install $$MIG_VER"
	  echo "   nvm use $$MIG_VER"
	  echo
	fi

# ------------------------------------------------------------
# Docker controls
# ------------------------------------------------------------
.PHONY: docker-check
docker-check: ## Verify Docker and Compose are reachable
	$(CHECK_DOCKER)

.PHONY: docker-up
docker-up: docker-check ## Build and start stack (detached), wait for API to be healthy
	@set -e
	echo "🚀 Starting stack with $(DC)"
	$(DC) up -d --build
	$(WAIT_API)

.PHONY: docker-down
docker-down: docker-check ## Stop containers but keep volumes and networks
	@set -e
	echo "⏹️  Stopping containers"
	$(DC) down

.PHONY: docker-destroy
docker-destroy: docker-check ## Stop containers and remove volumes and orphan networks
	@set -e
	echo "🧨 Destroying stack (containers, volumes, orphan networks)"
	$(DC) down -v --remove-orphans

.PHONY: docker-restart
docker-restart: docker-check ## Restart services in place
	@set -e
	echo "🔁 Restarting services"
	$(DC) restart
	$(WAIT_API)

.PHONY: docker-logs
docker-logs: docker-check ## Tail all service logs (Ctrl-C to exit)
	@set -e
	echo "📜 Tailing all logs"
	$(DC) logs -f

logs-%: ## Tail a service’s logs – e.g. make logs-genially-db
	$(CHECK_DOCKER)
	@set -e
	echo "📜  Tailing logs for '$*' (Ctrl-C to exit)"
	$(DC) logs -f $* --tail=all

stop-%: ## Stop a single service – e.g. make stop-genially-db
	$(CHECK_DOCKER)
	@set -e
	SVC="$*"
	if [ -z "$$SVC" ]; then echo "❌ service name required"; exit 1; fi
	$(DC) stop $$SVC || true

.PHONY: docker-ps
docker-ps: docker-check ## List services and state
	@set -e
	$(DC) ps

bash-%: ## Connect to a container with /bin/bash – e.g. make bash-genially-db
	$(CHECK_DOCKER)
	@set -e
	SVC="$*"
	CID=$$($(DC) ps -q $$SVC | head -n 1)
	if [ -z "$$CID" ]; then
	  echo "❌ No running container for service '$$SVC'"
	  exit 1
	fi
	echo "🖥️  Connecting to '$$SVC' with /bin/bash"
	docker exec -it $$CID /bin/bash || echo "❌ Failed to exec /bin/bash on '$$SVC'"

sh-%: ## Connect to a container with /bin/sh – e.g. make sh-genially-db
	$(CHECK_DOCKER)
	@set -e
	SVC="$*"
	CID=$$($(DC) ps -q $$SVC | head -n 1)
	if [ -z "$$CID" ]; then
	  echo "❌ No running container for service '$$SVC'"
	  exit 1
	fi
	echo "🖥️  Connecting to '$$SVC' with /bin/sh"
	docker exec -it $$CID /bin/sh || echo "❌ Failed to exec /bin/sh on '$$SVC'"

# Back-compat aliases
.PHONY: dev-up dev-down dev-logs dev-ps
dev-up:    docker-up
dev-down:  docker-down
dev-logs:  docker-logs
dev-ps:    docker-ps

# ------------------------------------------------------------
# Health
# ------------------------------------------------------------
.PHONY: api-wait
api-wait: ## Wait until GET $(HEALTH_URL) yields {"status":"ok"} (timeout 120s)
	$(WAIT_API)

.PHONY: api-health
api-health: ## Fetch and print API health JSON
	$(HEALTH_API)

.PHONY: api-ensure
api-ensure: ## Ensure API is healthy; if not, bring up the Docker stack and wait
	$(ENSURE_API)

# ------------------------------------------------------------
# Environment bootstrap
# ------------------------------------------------------------
.PHONY: env-api
env-api: ## Ensure .env exists (create from .env.example if missing)
	@set -e
	if [ -f "$(REPO_ROOT)/.env" ]; then
	  echo "🧩 .env already exists (skipped)"
	elif [ -f "$(REPO_ROOT)/.env.example" ]; then
	  cp "$(REPO_ROOT)/.env.example" "$(REPO_ROOT)/.env"
	  echo "🧩 .env created from .env.example"
	else
	  echo "🧩 .env.example not found (skipped)"
	fi

.PHONY: env-mig
env-mig: ## Ensure mongo-migrations/.env.local exists (create if possible)
	@set -e
	if [ ! -d "$(MIG_DIR)" ]; then
	  echo "🧩 No mongo-migrations folder (skipped)"
	  exit 0
	fi
	if [ -f "$(MIG_DIR)/.env.local" ]; then
	  echo "🧩 mongo-migrations/.env.local already exists (skipped)"
	elif [ -f "$(MIG_DIR)/.env.example" ]; then
	  cp "$(MIG_DIR)/.env.example" "$(MIG_DIR)/.env.local"
	  echo "🧩 mongo-migrations/.env.local created"
	else
	  echo "🧩 mongo-migrations/.env.example not found (skipped)"
	fi

# ------------------------------------------------------------
# Local Node tasks
# ------------------------------------------------------------
.PHONY: local-install
local-install: ## Install Node dependencies (skips if node_modules exists)
	@set -e
	if [ -d "$(REPO_ROOT)/node_modules" ]; then
	  echo "📦 node_modules present (skipped npm ci)"
	else
	  echo "📦 Installing deps with npm ci"
	  $(call NVM_EXEC,$(REPO_ROOT),npm ci)
	fi

.PHONY: local-dev
local-dev: ## Run local dev server (npm run dev)
	@set -e
	echo "🟢 Starting dev server locally"
	$(call NVM_EXEC,$(REPO_ROOT),npm run dev)

.PHONY: local-build
local-build: ## Build TypeScript and run linter (npm run build)
	@set -e
	echo "🔨 Building project"
	$(call NVM_EXEC,$(REPO_ROOT),npm run build)

.PHONY: local-serve
local-serve: ## Run compiled server (npm run serve)
	@set -e
	echo "▶️  Starting compiled server"
	$(call NVM_EXEC,$(REPO_ROOT),npm run serve)

.PHONY: local-lint
local-lint: ## Typecheck and lint (npm run lint)
	@set -e
	echo "🧹 Lint and typecheck"
	$(call NVM_EXEC,$(REPO_ROOT),npm run lint)

.PHONY: local-test
local-test: ## Run tests (jest)
	@set -e
	echo "✅ Running tests"
	$(call NVM_EXEC,$(REPO_ROOT),npm test)

.PHONY: local-test-coverage
local-test-coverage: ## Run tests with coverage
	@set -e
	echo "🧪 Running tests with coverage"
	$(call NVM_EXEC,$(REPO_ROOT),npm run test:coverage)

.PHONY: local-test-watch
local-test-watch: ## Jest watch mode
	@set -e
	echo "👀 Jest watch"
	$(call NVM_EXEC,$(REPO_ROOT),npm run watch-test)

# Back-compat aliases
.PHONY: install dev build serve lint test test-coverage test-watch
install:        local-install
dev:            local-dev
build:          local-build
serve:          local-serve
lint:           local-lint
test:           local-test
test-coverage:  local-test-coverage
test-watch:     local-test-watch

# ------------------------------------------------------------
# Migrations (local) – always use LOCAL_MONGO_URL with localhost
# ------------------------------------------------------------
.PHONY: local-migrate-install
local-migrate-install: ## Install migration deps (skips if node_modules exists or folder missing)
	@set -e
	if [ -d "$(MIG_DIR)" ]; then
	  if [ -d "$(MIG_DIR)/node_modules" ]; then
	    echo "🗄️  mongo-migrations/node_modules present (skipped)"
	  else
	    echo "🗄️  Installing migration deps"
	    $(call NVM_EXEC,$(MIG_DIR),npm ci)
	  fi
	else
	  echo "🗄️  No mongo-migrations folder (skipped)"
	fi

.PHONY: local-migrate-status
local-migrate-status: ## Show migration status (uses LOCAL_MONGO_URL → localhost)
	@set -e
	if [ -d "$(MIG_DIR)" ]; then
	  echo "🗄️  Migration status against $(LOCAL_MONGO_URL)"
	  $(call NVM_EXEC,$(MIG_DIR),MONGO_URL='$(LOCAL_MONGO_URL)' MONGODB_URL='$(LOCAL_MONGO_URL)' MONGO_URI='$(LOCAL_MONGO_URL)' npx --yes migrate-mongo status)
	else
	  echo "🗄️  No mongo-migrations folder (skipped)"
	fi

.PHONY: local-migrate-up
local-migrate-up: ## Apply pending migrations (uses LOCAL_MONGO_URL → localhost)
	@set -e
	if [ -d "$(MIG_DIR)" ]; then
	  echo "🗄️  Applying migrations against $(LOCAL_MONGO_URL)"
	  $(call NVM_EXEC,$(MIG_DIR),MONGO_URL='$(LOCAL_MONGO_URL)' MONGODB_URL='$(LOCAL_MONGO_URL)' MONGO_URI='$(LOCAL_MONGO_URL)' npx --yes migrate-mongo up)
	else
	  echo "🗄️  No mongo-migrations folder (skipped)"
	fi

.PHONY: local-migrate-down
local-migrate-down: ## Roll back last migration (uses LOCAL_MONGO_URL → localhost)
	@set -e
	if [ -d "$(MIG_DIR)" ]; then
	  echo "🗄️  Rolling back last migration against $(LOCAL_MONGO_URL)"
	  $(call NVM_EXEC,$(MIG_DIR),MONGO_URL='$(LOCAL_MONGO_URL)' MONGODB_URL='$(LOCAL_MONGO_URL)' MONGO_URI='$(LOCAL_MONGO_URL)' npx --yes migrate-mongo down)
	else
	  echo "🗄️  No mongo-migrations folder (skipped)"
	fi

.PHONY: local-migrate-down-all
local-migrate-down-all: ## Roll back all migrations (uses LOCAL_MONGO_URL → localhost)
	@set -e
	if [ -d "$(MIG_DIR)" ]; then
	  echo "🗄️  Rolling back all migrations against $(LOCAL_MONGO_URL)"
	  $(call NVM_EXEC,$(MIG_DIR),MONGO_URL='$(LOCAL_MONGO_URL)' MONGODB_URL='$(LOCAL_MONGO_URL)' MONGO_URI='$(LOCAL_MONGO_URL)' npx --yes migrate-mongo down)
	else
	  echo "🗄️  No mongo-migrations folder (skipped)"
	fi

.PHONY: local-migrate-create
local-migrate-create: ## Create a migration file (NAME=slug)
	@set -e
	if [ ! -d "$(MIG_DIR)" ]; then
	  echo "🗄️  No mongo-migrations folder"
	  exit 1
	fi
	if [ -z "$(NAME)" ]; then
	  echo "🗄️  NAME is required. Example: make local-migrate-create NAME=add-user-collection"
	  exit 1
	fi
	$(call NVM_EXEC,$(MIG_DIR),npm run create -- "$(NAME)")

# ------------------------------------------------------------
# Mongo health checks
# ------------------------------------------------------------
.PHONY: local-mongo-health
local-mongo-health: ## Ping local Mongo with mongosh (exit code based)
	$(CHECK_MONGOSH)
	@set -e
	echo "🍃 Pinging Mongo at $(LOCAL_MONGO_URL)"
	if mongosh "$(LOCAL_MONGO_URL)" --quiet --eval 'const r=db.runCommand({ping:1}); if(r && r.ok===1){quit(0)} else {printjson(r); quit(2)}' >/dev/null; then
	  echo "✅ Mongo reachable"
	else
	  echo "⛔ Mongo unreachable"
	  exit 1
	fi

.PHONY: docker-mongo-health
docker-mongo-health: docker-check ## Ping Mongo from inside the Mongo container (exit code based)
	@set -e
	SVC=$${MONGO_CONTAINER_NAME:-genially-db}
	CID=$$($(DC) ps -q $$SVC | head -n 1)
	if [ -z "$$CID" ]; then
	  echo "⛔ Mongo container '$$SVC' is not running"
	  exit 1
	fi
	URI="mongodb://$(MONGO_USERNAME):$(MONGO_PASSWORD)@localhost:27017/$(MONGO_DATABASE)?authSource=$(MONGO_AUTH_SOURCE)"
	echo "🍃 Pinging Mongo inside '$$SVC' at $$URI"
	if docker exec -i "$$CID" mongosh "$$URI" --quiet --eval 'const r=db.runCommand({ping:1}); if(r && r.ok===1){quit(0)} else {printjson(r); quit(2)}' >/dev/null; then
	  echo "✅ Mongo reachable (in container)"
	else
	  echo "⛔ Mongo unreachable (in container)"
	  exit 1
	fi

# ------------------------------------------------------------
# Git hooks
# ------------------------------------------------------------
.PHONY: pre-commit-install
pre-commit-install: ## Install pre-commit hook if missing
	@set -e
	if [ ! -f "$(REPO_ROOT)/scripts/pre-commit.sh" ]; then
	  echo "🪝 scripts/pre-commit.sh not found"
	  exit 1
	fi
	mkdir -p "$(REPO_ROOT)/.git/hooks"
	cp "$(REPO_ROOT)/scripts/pre-commit.sh" "$(REPO_ROOT)/.git/hooks/pre-commit"
	chmod +x "$(REPO_ROOT)/.git/hooks/pre-commit"
	echo "🪝 pre-commit installed"

.PHONY: pre-commit-run
pre-commit-run: ## Run the project's pre-commit hook script exactly as Git would
	@set -e
	echo "🏎️  Running pre-commit hook"
	cd "$(REPO_ROOT)/scripts"
	./pre-commit.sh

.PHONY: pre-commit-dry-run
pre-commit-dry-run: ## Run hook-like checks without Git (lint-staged + tests)
	@set -e
	echo "🧪 Dry-run pre-commit checks"
	$(call NVM_EXEC,$(REPO_ROOT),npx lint-staged)
	$(call NVM_EXEC,$(REPO_ROOT),npm test)

# ------------------------------------------------------------
# Flows
# ------------------------------------------------------------
.PHONY: onboarding
onboarding: ## First-time setup: env, hooks, deps, start Docker, wait API, migrate if present
	@set -e
	$(MAKE) env-api
	$(MAKE) pre-commit-install
	$(MAKE) env-mig
	$(MAKE) local-install

	$(MAKE) docker-up

	if [ -d "$(MIG_DIR)" ]; then
	  $(MAKE) local-migrate-up
	else
	  echo "🗄️  migrations not present (skipped migrate)"
	fi

	echo "🎉 Onboarding completed"

.PHONY: clean
clean: ## Remove build outputs and artifacts (dist, coverage)
	@set -e
	echo "🧽 Cleaning dist, coverage"
	rm -rf dist coverage
