================================================================================
CLINICAL SYSTEM - GETTING STARTED GUIDE
Open Source, Local-First Development
================================================================================

Date: January 31, 2026
Purpose: Quick start guide for local setup and development
Status: Ready to use

================================================================================
TABLE OF CONTENTS
================================================================================

1. Prerequisites
2. Installation (One-Time Setup)
3. Starting Development
4. Project Structure
5. Common Tasks
6. Testing Locally
7. Troubleshooting
8. Next Steps

================================================================================
1. PREREQUISITES
================================================================================

REQUIRED SOFTWARE:
  ✅ Docker Desktop (or Docker + Docker Compose)
  ✅ Git
  ✅ Node.js 20+ (for local development outside Docker)
  ✅ npm or yarn

SYSTEM REQUIREMENTS:
  ✅ 16 GB RAM (minimum 8 GB, tight)
  ✅ 100 GB free disk space
  ✅ Modern CPU (4+ cores recommended)

INSTALLATION LINKS:

1. Docker Desktop:
   Windows: https://www.docker.com/products/docker-desktop
   Mac: https://www.docker.com/products/docker-desktop
   Linux: Follow Docker docs (just install Docker + Docker Compose)

2. Git:
   https://git-scm.com/download/

3. Node.js:
   https://nodejs.org/ (select LTS version)

4. IDE (Recommended):
   Visual Studio Code: https://code.visualstudio.com/

================================================================================
2. INSTALLATION (ONE-TIME SETUP)
================================================================================

STEP 1: CLONE REPOSITORY

  git clone https://github.com/yourusername/clinical-system.git
  cd clinical-system

STEP 2: VERIFY PREREQUISITES

  docker --version
  docker-compose --version
  git --version
  node --version
  npm --version

  (All should show versions, not errors)

STEP 3: SETUP LOCAL ENVIRONMENT

  make setup

  This will:
  ✓ Verify Docker is installed
  ✓ Create Docker volumes for data persistence
  ✓ Copy .env.example to .env
  ✓ Initialize directory structure

STEP 4: UPDATE CONFIGURATION (Optional for Development)

  Edit .env file if needed:
  
  nano .env        # Linux/Mac
  notepad .env     # Windows
  
  Default values work for local development. Only change if needed.

STEP 5: GENERATE SSL CERTIFICATE (Optional)

  make generate-ssl-cert
  
  Creates self-signed certificate for HTTPS (local development only).
  Browser will show security warning - this is normal and expected.

================================================================================
3. STARTING DEVELOPMENT
================================================================================

OPTION A: START EVERYTHING (Recommended for first time)

  make dev

  This will:
  ✓ Build Docker images (first run takes 5-10 minutes)
  ✓ Start all 9 services
  ✓ Run health checks
  ✓ Show service URLs

OPTION B: START SPECIFIC SERVICES (Advanced)

  docker-compose up -d postgres redis minio
  docker-compose up -d api frontend nginx

OPTION C: START IN FOREGROUND (For debugging)

  docker-compose up
  (Shows all logs in real-time, Ctrl+C to stop)

WHAT'S RUNNING NOW:

  Service              Port    Purpose
  ────────────────────────────────────────────────
  PostgreSQL           5432    Database
  Redis                6379    Cache/Sessions
  MinIO                9000    File Storage (API)
  MinIO Console        9001    File Storage (UI)
  Backend API          3000    Node.js/Express API
  Frontend             5173    React Application
  Nginx                80/443  Reverse Proxy
  Elasticsearch        9200    Log Storage
  Kibana               5601    Log Viewer

================================================================================
4. ACCESSING SERVICES
================================================================================

FRONTEND (React Application):
  URL: http://localhost:5173
  Purpose: Patient management UI

BACKEND API:
  URL: http://localhost:3000
  Purpose: REST API server

API DOCUMENTATION:
  URL: http://localhost:3000/api/docs
  Purpose: Interactive API documentation (Swagger UI)
  Test endpoints here!

NGINX PROXY:
  URL: http://localhost (or https://localhost)
  Purpose: Production-like setup with reverse proxy

MINIO CONSOLE (File Storage):
  URL: http://localhost:9001
  Username: minioadmin
  Password: minioadmin
  Purpose: Upload/manage files

ELASTICSEARCH (Logs):
  URL: http://localhost:9200
  Purpose: Centralized log storage (for developers/DevOps)

KIBANA (Log Viewer):
  URL: http://localhost:5601
  Purpose: Query and visualize logs

POSTGRESQL (Database):
  Connection: localhost:5432
  Username: postgres
  Password: postgres (from .env)
  Database: clinical_db
  
  Connect with psql:
    psql -h localhost -U postgres -d clinical_db
  
  Or use any DB client (DBeaver, pgAdmin, etc.)

================================================================================
5. COMMON DEVELOPMENT TASKS
================================================================================

VIEW SERVICE STATUS:

  make status

  Shows which services are running.

VIEW LOGS:

  # All services
  make logs

  # Specific service
  make logs SERVICE=api
  make logs SERVICE=postgres
  make logs SERVICE=frontend

  # Follow logs in real-time
  make logs SERVICE=api -f

STOP ALL SERVICES:

  make stop

  Containers stop but data is preserved.

RESTART SERVICES:

  docker-compose restart

  Or restart specific service:
  docker-compose restart api

RUN DATABASE MIGRATIONS:

  make migrate

  Applies pending database migrations.

SEED DATABASE WITH TEST DATA:

  make seed

  Loads sample patients, appointments, etc.

BACKUP DATABASE:

  make backup

  Creates backup in database/backups/ with timestamp.

RESTORE DATABASE:

  make restore DATE=2026-01-31

  Lists available backups if DATE not found.

RUN TESTS:

  make test                   # Unit tests
  make test-integration       # Integration tests
  make test-coverage          # Coverage report

LINT CODE:

  make lint                   # Check for issues
  make lint-fix               # Auto-fix issues

CLEAN UP EVERYTHING:

  make clean                  # Stop and remove containers (data kept)
  make clean-all              # DANGER: Delete everything including data!

================================================================================
6. TESTING LOCALLY
================================================================================

6.1 TEST API ENDPOINTS
──────────────────────────────────────────────────────────────────────────────

Using curl (command line):

  # Health check
  curl http://localhost:3000/health

  # Get all patients (requires authentication)
  curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    http://localhost:3000/api/v1/patients

  # Create patient
  curl -X POST http://localhost:3000/api/v1/patients \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -d '{
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-0100"
    }'

Using REST Client Extension (VSCode):

  1. Install "REST Client" extension in VSCode
  2. Create file: api-test.http
  3. Write requests:

    ### Get Patients
    GET http://localhost:3000/api/v1/patients HTTP/1.1
    Authorization: Bearer YOUR_JWT_TOKEN

    ### Create Patient
    POST http://localhost:3000/api/v1/patients HTTP/1.1
    Content-Type: application/json
    Authorization: Bearer YOUR_JWT_TOKEN

    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }

  4. Click "Send Request" above each request

Using Postman (Desktop):

  1. Download Postman: https://www.postman.com/
  2. Import OpenAPI spec: http://localhost:3000/api/docs.json
  3. Test endpoints with UI

Using Thunder Client (VSCode):

  1. Install "Thunder Client" extension
  2. Click Thunder Client icon
  3. Create new request
  4. Set URL, method, headers, body
  5. Click Send

6.2 AUTHENTICATE TO API
──────────────────────────────────────────────────────────────────────────────

First-time login:

  POST http://localhost:3000/api/v1/auth/login
  Content-Type: application/json

  {
    "email": "admin@clinic.com",
    "password": "your-password"
  }

Response (example):

  {
    "success": true,
    "data": {
      "user": {
        "id": "user-123",
        "email": "admin@clinic.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "ADMIN"
      },
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }

Copy the token and use in Authorization header:

  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

6.3 TEST DATABASE CONNECTIVITY
──────────────────────────────────────────────────────────────────────────────

From terminal:

  psql -h localhost -U postgres -d clinical_db -c "SELECT 1;"

Expected output: 1

From Docker container:

  docker exec clinical-postgres psql -U postgres -d clinical_db \
    -c "SELECT COUNT(*) FROM patients;"

6.4 TEST FILE UPLOAD (MinIO)
──────────────────────────────────────────────────────────────────────────────

MinIO Console (Web UI):

  1. Go to http://localhost:9001
  2. Login with minioadmin / minioadmin
  3. Click "Create Bucket" and create "clinical-data"
  4. Upload a test file

From API (after authentication):

  curl -X POST http://localhost:3000/api/v1/patients/123/documents \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "file=@/path/to/file.pdf"

================================================================================
7. TROUBLESHOOTING
================================================================================

PROBLEM: "Docker command not found"
SOLUTION: 
  • Docker not installed. Download from https://www.docker.com/
  • On Linux: Install Docker and Docker Compose separately

PROBLEM: "Port 3000 already in use"
SOLUTION:
  Option A: Stop other services using port 3000
  Option B: Change port in docker-compose.yml (change 3000:3000 to 3001:3000)
  Option C: Kill process: lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill

PROBLEM: "PostgreSQL connection refused"
SOLUTION:
  • Wait for container to start (takes 10-15 seconds)
  • Check logs: make logs SERVICE=postgres
  • Verify container running: docker ps | grep postgres

PROBLEM: "Out of disk space"
SOLUTION:
  • Check space: df -h /
  • Clean unused Docker images: docker image prune
  • Clean unused volumes: docker volume prune
  • Remove test backups: rm database/backups/*.sql.gz

PROBLEM: "Frontend not loading (blank page)"
SOLUTION:
  • Check logs: make logs SERVICE=frontend
  • Clear browser cache (Ctrl+Shift+Delete)
  • Restart frontend: docker-compose restart frontend
  • Check network tab in browser DevTools

PROBLEM: "High CPU/Memory usage"
SOLUTION:
  • Stop unnecessary services: make stop
  • Reduce replicas in docker-compose.yml
  • Increase Docker resource limits in Docker Desktop settings
  • Check which service is using resources: docker stats

PROBLEM: "API returns 502 Bad Gateway through nginx"
SOLUTION:
  • API service down: make logs SERVICE=api
  • Restart API: docker-compose restart api
  • Check nginx config: cat nginx/nginx.conf
  • Rebuild API: docker-compose build api

PROBLEM: "Cannot connect to database from inside container"
SOLUTION:
  • Verify network: docker network ls | grep clinical
  • Check container network: docker inspect clinical-api | grep NetworkSettings
  • Use container name (not localhost): DB_HOST=postgres

PROBLEM: "Migrations failed"
SOLUTION:
  • Check logs: make logs SERVICE=api
  • Manual migration: docker-compose exec api npm run migrate:status
  • Rollback: make migrate-rollback
  • Clear and retry: make clean && make dev

PROBLEM: "Can't access MinIO console"
SOLUTION:
  • Check container running: docker ps | grep minio
  • Check port: curl http://localhost:9001
  • Restart: docker-compose restart minio

GENERAL DEBUGGING STEPS:

  1. Check service health: make health-check
  2. View service logs: make logs SERVICE=xxx
  3. Check docker stats: docker stats
  4. Verify network: docker network inspect clinical-network
  5. Restart specific service: docker-compose restart xxx
  6. Restart everything: make stop && make dev

================================================================================
8. NEXT STEPS
================================================================================

UNDERSTAND THE ARCHITECTURE:

  Read: PHASE_3_OPEN_SOURCE_REDEFINITION.md
  Sections 1-2 (Tech stack, Infrastructure setup)

EXPLORE THE API:

  Go to: http://localhost:3000/api/docs
  Try endpoints in Swagger UI
  Understand request/response format

STUDY THE CODE:

  Frontend: frontend/src/ (React components)
  Backend: backend/src/ (Express routes, services)
  Database: database/ (migrations, seeds)

RUN TESTS:

  make test              # Unit tests
  make test-coverage     # See coverage report

SETUP IDE:

  1. Install VSCode
  2. Install extensions (from requirements)
  3. Open project folder
  4. Explore code and test endpoints

START DEVELOPMENT:

  1. Create feature branch: git checkout -b feature/your-feature
  2. Make code changes
  3. Test locally: make test
  4. Commit: git commit -m "Your message"
  5. Push: git push origin feature/your-feature

DEPLOYMENT:

  When ready to deploy:
  1. Test on staging
  2. Create release tag: git tag v1.0.0
  3. Follow DEPLOYMENT.md
  4. Deploy to production server

================================================================================
QUICK REFERENCE
================================================================================

Start development:             make dev
Stop all services:             make stop
View service status:           make status
View logs:                     make logs SERVICE=api
Run tests:                     make test
Create backup:                 make backup
Run migrations:                make migrate

Frontend:                       http://localhost:5173
API:                           http://localhost:3000
API Docs:                      http://localhost:3000/api/docs
MinIO Console:                 http://localhost:9001
Kibana Logs:                   http://localhost:5601

Database connection:
  psql -h localhost -U postgres -d clinical_db

Get help:                      make help

================================================================================
YOU'RE READY TO BUILD!

Start with: make dev

Questions? See TROUBLESHOOTING section above or check logs with: make logs

Good luck! 🚀
================================================================================
