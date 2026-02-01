# Clinical System - Makefile
# Common development commands for local setup and deployment

.PHONY: help setup dev stop logs status test build deploy clean health-check migrate backup restore generate-ssl

# Color output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help:
	@echo "$(GREEN)Clinical System - Development Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup & Infrastructure:$(NC)"
	@echo "  make setup                  - One-time setup (install Docker, create volumes)"
	@echo "  make generate-ssl-cert      - Generate self-signed SSL certificate"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev                    - Start all services (development mode)"
	@echo "  make stop                   - Stop all services"
	@echo "  make status                 - Show status of all services"
	@echo "  make logs                   - Show logs from all services"
	@echo "  make logs SERVICE=api       - Show logs from specific service"
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@echo "  make test                   - Run all unit tests"
	@echo "  make test-integration       - Run integration tests"
	@echo "  make test-e2e               - Run end-to-end tests"
	@echo "  make test-coverage          - Run tests with coverage report"
	@echo "  make lint                   - Run linter (ESLint + Prettier)"
	@echo "  make lint-fix               - Fix linting issues automatically"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@echo "  make migrate                - Run database migrations"
	@echo "  make migrate-rollback       - Rollback last migration"
	@echo "  make seed                   - Seed database with test data"
	@echo "  make backup                 - Backup database"
	@echo "  make restore DATE=YYYY-MM-DD - Restore database from backup"
	@echo ""
	@echo "$(YELLOW)Production:$(NC)"
	@echo "  make build                  - Build Docker images for production"
	@echo "  make deploy-prod            - Deploy to production"
	@echo "  make health-check           - Run health checks on all services"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make clean                  - Clean up Docker containers and volumes"
	@echo "  make clean-all              - DANGEROUS: Remove everything including data"
	@echo "  make reset                  - Reset to fresh state"
	@echo ""

# ============================================================================
# SETUP COMMANDS
# ============================================================================

setup:
	@echo "$(YELLOW)Setting up clinical system...$(NC)"
	@echo "Checking Docker installation..."
	@docker --version || { echo "$(RED)Docker not installed. Please install Docker Desktop$(NC)"; exit 1; }
	@docker-compose --version || { echo "$(RED)Docker Compose not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Docker is installed$(NC)"
	@echo "Creating volumes..."
	@docker volume create postgres_data || true
	@docker volume create redis_data || true
	@docker volume create minio_data || true
	@docker volume create es_data || true
	@echo "$(GREEN)✓ Volumes created$(NC)"
	@echo "Creating .env file if not exists..."
	@[ -f .env ] || cp .env.example .env
	@echo "$(GREEN)✓ .env file ready$(NC)"
	@echo "$(GREEN)Setup complete!$(NC)"
	@echo "Next: run 'make dev' to start services"

generate-ssl-cert:
	@echo "$(YELLOW)Generating self-signed SSL certificate...$(NC)"
	@mkdir -p nginx/ssl
	@openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/private.key -out nginx/ssl/certificate.crt \
		-days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || \
	{ echo "$(RED)OpenSSL not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ SSL certificate generated$(NC)"
	@echo "$(YELLOW)Note: Browser will show security warning (expected for self-signed cert)$(NC)"

# ============================================================================
# DEVELOPMENT COMMANDS
# ============================================================================

dev:
	@echo "$(YELLOW)Starting clinical system services...$(NC)"
	@docker-compose up -d
	@echo "$(YELLOW)Waiting for services to be healthy...$(NC)"
	@sleep 10
	@make health-check
	@echo ""
	@echo "$(GREEN)✓ All services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)Access services at:$(NC)"
	@echo "  Frontend:        http://localhost:5173"
	@echo "  Backend API:     http://localhost:3000"
	@echo "  API Docs:        http://localhost:3000/api/docs"
	@echo "  Nginx Proxy:     http://localhost (or https://localhost)"
	@echo "  MinIO Console:   http://localhost:9001"
	@echo "  Kibana Logs:     http://localhost:5601"
	@echo "  Grafana:         http://localhost:3001 (if enabled)"
	@echo ""

stop:
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ All services stopped$(NC)"

status:
	@echo "$(YELLOW)Service Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(YELLOW)Container Health:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}"

logs:
	@docker-compose logs -f $(SERVICE)

health-check:
	@echo "$(YELLOW)Running health checks...$(NC)"
	@echo "Checking PostgreSQL..."
	@docker exec clinical-postgres pg_isready -U postgres > /dev/null 2>&1 && \
		echo "$(GREEN)✓ PostgreSQL running$(NC)" || echo "$(RED)✗ PostgreSQL down$(NC)"
	@echo "Checking Redis..."
	@docker exec clinical-redis redis-cli ping > /dev/null 2>&1 && \
		echo "$(GREEN)✓ Redis running$(NC)" || echo "$(RED)✗ Redis down$(NC)"
	@echo "Checking MinIO..."
	@curl -s http://localhost:9000/minio/health/live > /dev/null && \
		echo "$(GREEN)✓ MinIO running$(NC)" || echo "$(RED)✗ MinIO down$(NC)"
	@echo "Checking API..."
	@curl -s http://localhost:3000/health > /dev/null && \
		echo "$(GREEN)✓ API running$(NC)" || echo "$(RED)✗ API down$(NC)"
	@echo "Checking Frontend..."
	@curl -s http://localhost:5173 > /dev/null && \
		echo "$(GREEN)✓ Frontend running$(NC)" || echo "$(RED)✗ Frontend down$(NC)"

# ============================================================================
# TESTING COMMANDS
# ============================================================================

test:
	@echo "$(YELLOW)Running unit tests...$(NC)"
	@docker-compose exec -T api npm run test
	@echo "$(GREEN)✓ Unit tests complete$(NC)"

test-integration:
	@echo "$(YELLOW)Running integration tests...$(NC)"
	@docker-compose exec -T api npm run test:integration
	@echo "$(GREEN)✓ Integration tests complete$(NC)"

test-e2e:
	@echo "$(YELLOW)Running end-to-end tests...$(NC)"
	@docker-compose exec -T frontend npm run test:e2e
	@echo "$(GREEN)✓ E2E tests complete$(NC)"

test-coverage:
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	@docker-compose exec -T api npm run test:coverage
	@echo "$(GREEN)✓ Coverage report generated$(NC)"

lint:
	@echo "$(YELLOW)Linting code...$(NC)"
	@docker-compose exec -T api npm run lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

lint-fix:
	@echo "$(YELLOW)Fixing lint issues...$(NC)"
	@docker-compose exec -T api npm run lint:fix
	@echo "$(GREEN)✓ Lint fixes applied$(NC)"

# ============================================================================
# DATABASE COMMANDS
# ============================================================================

migrate:
	@echo "$(YELLOW)Running database migrations...$(NC)"
	@docker-compose exec -T api npm run migrate
	@echo "$(GREEN)✓ Migrations complete$(NC)"

migrate-rollback:
	@echo "$(YELLOW)Rolling back last migration...$(NC)"
	@docker-compose exec -T api npm run migrate:rollback
	@echo "$(GREEN)✓ Rollback complete$(NC)"

seed:
	@echo "$(YELLOW)Seeding database with test data...$(NC)"
	@docker-compose exec -T api npm run seed
	@echo "$(GREEN)✓ Seed complete$(NC)"

backup:
	@echo "$(YELLOW)Backing up database...$(NC)"
	@mkdir -p database/backups
	@DATE=$$(date +%Y-%m-%d_%H-%M-%S); \
	docker exec clinical-postgres pg_dump -U postgres clinical_db | gzip > database/backups/backup_$$DATE.sql.gz; \
	echo "$(GREEN)✓ Backup created: backup_$$DATE.sql.gz$(NC)"

restore:
	@if [ -z "$(DATE)" ]; then \
		echo "$(RED)Usage: make restore DATE=YYYY-MM-DD$(NC)"; \
		ls -1 database/backups/ | head -10; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(DATE)...$(NC)"
	@BACKUP_FILE=$$(ls database/backups/backup_$(DATE)*.sql.gz 2>/dev/null | head -1); \
	if [ -z "$$BACKUP_FILE" ]; then \
		echo "$(RED)Backup file not found for date $(DATE)$(NC)"; \
		exit 1; \
	fi; \
	gunzip -c $$BACKUP_FILE | docker exec -i clinical-postgres psql -U postgres clinical_db; \
	echo "$(GREEN)✓ Restore complete$(NC)"

# ============================================================================
# PRODUCTION COMMANDS
# ============================================================================

build:
	@echo "$(YELLOW)Building Docker images for production...$(NC)"
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "$(GREEN)✓ Images built$(NC)"

deploy-prod:
	@echo "$(RED)WARNING: This will deploy to production!$(NC)"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)Deploying to production...$(NC)"; \
		docker-compose -f docker-compose.prod.yml up -d; \
		echo "$(GREEN)✓ Production deployment complete$(NC)"; \
	else \
		echo "$(YELLOW)Deploy cancelled$(NC)"; \
	fi

# ============================================================================
# CLEANUP COMMANDS
# ============================================================================

clean:
	@echo "$(YELLOW)Cleaning up containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Containers removed (data preserved)$(NC)"

clean-all:
	@echo "$(RED)WARNING: This will delete all containers and data!$(NC)"
	@read -p "Type 'DELETE' to confirm: " CONFIRM; \
	if [ "$$CONFIRM" = "DELETE" ]; then \
		echo "$(YELLOW)Removing everything...$(NC)"; \
		docker-compose down -v; \
		docker volume rm postgres_data redis_data minio_data es_data 2>/dev/null || true; \
		echo "$(GREEN)✓ Everything removed$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

reset:
	@echo "$(YELLOW)Resetting to fresh state...$(NC)"
	@make clean
	@make setup
	@make dev
	@make migrate
	@make seed
	@echo "$(GREEN)✓ System reset and ready$(NC)"

# ============================================================================
# DEFAULT TARGET
# ============================================================================

.DEFAULT_GOAL := help
