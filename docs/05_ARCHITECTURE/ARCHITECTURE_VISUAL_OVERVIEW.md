================================================================================
CLINICAL SYSTEM - VISUAL ARCHITECTURE OVERVIEW
Open Source, Local-First Development
================================================================================

Date: January 31, 2026
Purpose: Visual representation of system architecture and components
Status: Ready for development

================================================================================
SYSTEM ARCHITECTURE (LOCAL DEVELOPMENT)
================================================================================

┌──────────────────────────────────────────────────────────────────────────┐
│                        CLINICAL MANAGEMENT SYSTEM                        │
│                      Open Source, Docker-Based, Local                    │
└──────────────────────────────────────────────────────────────────────────┘

                              DEVELOPMENT MACHINE
                         (Your Laptop/Desktop - 16GB RAM)
                         ┌────────────────────────┐
                         │   Docker Compose       │
                         │   10 Services          │
                         └────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │                   USER TIER (You)                       │
    │                                                         │
    │  Browser: http://localhost:5173 (React Frontend)       │
    │  API Client: http://localhost:3000 (REST API)          │
    │  MinIO Console: http://localhost:9001 (File Storage)   │
    │  Kibana: http://localhost:5601 (Logs)                  │
    │  Grafana: http://localhost:3001 (Dashboards)           │
    └─────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │              REVERSE PROXY & LOAD BALANCER              │
    │                                                         │
    │  SERVICE: Nginx (Port 80/443)                           │
    │  PURPOSE: Route requests to services                    │
    │  CONFIG:  nginx/nginx.conf + ssl/                      │
    └─────────────────────────────────────────────────────────┘
                              ↓
    ┌────────────────────────────────────────────────────────┐
    │                  APPLICATION TIER                      │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ FRONTEND (React + TypeScript)                    │ │
    │  │ Port: 5173                                       │ │
    │  │ Tech: Vite, Tailwind, Shadcn/ui, Zustand       │ │
    │  │ Reload: Hot reload on save                       │ │
    │  │ Serving: Static files                            │ │
    │  └──────────────────────────────────────────────────┘ │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ BACKEND API (Node.js + Express)                 │ │
    │  │ Port: 3000                                       │ │
    │  │ Tech: TypeScript, TypeORM, Pino logging         │ │
    │  │ Reload: Nodemon auto-restart on save             │ │
    │  │ 450+ Endpoints: CRUD, business logic            │ │
    │  │ Auth: JWT tokens                                │ │
    │  │ Multi-tenancy: RLS at database level             │ │
    │  └──────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────┘
                      ↓              ↓
    ┌────────────────────────────────────────────────────────┐
    │                   DATA PERSISTENCE TIER                │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ DATABASE (PostgreSQL 16)                         │ │
    │  │ Port: 5432                                       │ │
    │  │ Volumes: postgres_data/ (persistence)           │ │
    │  │ Features: RLS, JSONB, Full-text search          │ │
    │  │ Data: Patients, appointments, consultations     │ │
    │  │ Multi-tenancy: Row-level security               │ │
    │  │ Compliance: HIPAA data retention                │ │
    │  └──────────────────────────────────────────────────┘ │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ CACHE (Redis 7)                                 │ │
    │  │ Port: 6379                                       │ │
    │  │ Volumes: redis_data/ (persistence)              │ │
    │  │ Purpose: Sessions, caching, queues             │ │
    │  │ Use: Speed up queries, store sessions           │ │
    │  └──────────────────────────────────────────────────┘ │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ OBJECT STORAGE (MinIO - S3 Compatible)          │ │
    │  │ Port: 9000 (API), 9001 (Console)                │ │
    │  │ Volumes: minio_data/ (persistence)              │ │
    │  │ Purpose: Store files, documents, images         │ │
    │  │ Use: Patient records, lab reports, images       │ │
    │  │ Access: S3-compatible API                       │ │
    │  └──────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────────────────┐
    │               MONITORING & LOGGING TIER                │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ METRICS COLLECTION (Prometheus)                 │ │
    │  │ Port: 9090                                       │ │
    │  │ Collects: API latency, errors, throughput       │ │
    │  └──────────────────────────────────────────────────┘ │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ METRICS VISUALIZATION (Grafana)                 │ │
    │  │ Port: 3001                                       │ │
    │  │ Shows: Dashboards, alerts, trends               │ │
    │  └──────────────────────────────────────────────────┘ │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ LOG STORAGE (Elasticsearch)                     │ │
    │  │ Port: 9200                                       │ │
    │  │ Volumes: es_data/ (persistence)                 │ │
    │  │ Stores: All application logs                    │ │
    │  │ Retention: 30 days (configurable)               │ │
    │  └──────────────────────────────────────────────────┘ │
    │                                                        │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │ LOG VISUALIZATION (Kibana)                      │ │
    │  │ Port: 5601                                       │ │
    │  │ Queries: Full-text search in logs                │ │
    │  │ Debugging: Trace requests across services       │ │
    │  └──────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────┘

================================================================================
DATA FLOW DIAGRAM
================================================================================

USER ACTION → REQUEST FLOW:

1. User logs in (Frontend)
   ↓
2. Request: POST /api/v1/auth/login
   ↓
3. Nginx (Port 80) receives request
   ↓
4. Nginx forwards to Backend API (Port 3000)
   ↓
5. Backend verifies credentials
   ↓
6. PostgreSQL queries user data
   ↓
7. JWT token generated
   ↓
8. Response sent to Frontend
   ↓
9. Frontend stores token (in session)
   ↓
10. User redirected to dashboard
   ↓
11. All subsequent requests include: Authorization: Bearer <token>
   ↓
12. Backend verifies token
   ↓
13. Backend checks multi-tenancy (RLS)
   ↓
14. PostgreSQL returns only authorized data
   ↓
15. Response sent to Frontend
   ↓
16. Frontend renders results

LOGGING PARALLEL FLOW:

1. Every request logged with pino (structured JSON)
   ↓
2. Logs sent to Elasticsearch (Port 9200)
   ↓
3. Logs searchable in Kibana (Port 5601)
   ↓
4. Developers debug issues by searching logs

MONITORING PARALLEL FLOW:

1. Prometheus scrapes metrics from services
   ↓
2. Grafana queries Prometheus
   ↓
3. Dashboards show real-time metrics
   ↓
4. Alerts triggered if thresholds exceeded

================================================================================
COMPONENT INTERACTION MATRIX
================================================================================

FROM       TO            PURPOSE                    PROTOCOL/PORT
─────────────────────────────────────────────────────────────────────────
Browser    Nginx         HTTP requests              HTTP/80, HTTPS/443
Nginx      Frontend      Serve React app            HTTP/5173
Nginx      Backend API   Forward API requests       HTTP/3000
Frontend   Backend API   Fetch data                 REST/3000, WebSocket
Backend    PostgreSQL    Store/retrieve data        TCP/5432
Backend    Redis         Cache/sessions             TCP/6379
Backend    MinIO         Store files                S3-compat/9000
Backend    Elasticsearch Send logs                  HTTP/9200
Prometheus Backend API   Scrape metrics             HTTP/3000
Prometheus PostgreSQL    Scrape metrics             HTTP/5432
Prometheus Redis         Scrape metrics             HTTP/6379
Grafana    Prometheus    Query metrics              HTTP/9090
Kibana     Elasticsearch Query logs                 HTTP/9200

================================================================================
DEPLOYMENT ARCHITECTURE (PRODUCTION)
================================================================================

Same services, different hosting:

┌────────────────────────────────────────────────┐
│           VPS or On-Premise Server             │
│         (Ubuntu 22.04, 8GB+ RAM, 100GB SSD)   │
├────────────────────────────────────────────────┤
│  Docker + Docker Compose (installed)           │
├────────────────────────────────────────────────┤
│                                                │
│  [Same 10 services as local development]       │
│                                                │
│  With modifications:                           │
│  • Replicas: 3+ for API service                │
│  • SSL: Let's Encrypt (not self-signed)        │
│  • Backups: Automated daily (to external)      │
│  • Monitoring: Enabled and alerting            │
│  • Logging: Longer retention                   │
│                                                │
└────────────────────────────────────────────────┘

HOSTING OPTIONS:

Option A - Managed VPS (~$25-50/month):
  Providers: DigitalOcean, Linode, Vultr, Hetzner
  Setup: 1 hour (install Docker, deploy)
  Scaling: Easy (add more servers)

Option B - On-Premise (~$0/month ongoing):
  Hardware: Your clinic's server
  Setup: 2 hours (install Docker, deploy)
  Scaling: Limited (by hardware)

Option C - Hybrid:
  Local: Development machine
  Production: Remote VPS
  Same code, same docker-compose.yml

================================================================================
TECHNOLOGY STACK VISUAL
================================================================================

┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React 18 ───► TypeScript ──┐                              │
│      ↓                       ├──► Vite (Build Tool)         │
│  Components               JSX ┘                              │
│      ├─ Patient List          ──► Tailwind CSS (Styling)    │
│      ├─ Appointment Scheduler ──► Shadcn/ui (Components)    │
│      ├─ Consultation Form     ──► Zustand (State)           │
│      ├─ Insurance Claims      ──► React Query (Fetching)    │
│      ├─ Lab Results           ──► Vitest (Testing)          │
│      ├─ Analytics             ──► Socket.io Client          │
│      └─ Dashboards                                          │
│                                                             │
│  Testing: Vitest + Testing Library                          │
│  Linting: ESLint + Prettier                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Node.js 20 ──► Express.js ──────┐                          │
│      ↓              ↓             ├──► 450+ API Endpoints   │
│  TypeScript   Routes/Handlers      │                        │
│      │             ↓               ├──► Business Logic      │
│      └─► TypeORM ─ Services ───────┤                        │
│             (ORM)    (Logic)       ├──► Validation          │
│                      ↓             ├──► Authentication      │
│                 Controllers        ├──► Authorization       │
│                      ↓             ├──► Error Handling      │
│                 Middleware         └──► Security            │
│                                                             │
│  Logging: Pino (Structured JSON) → Elasticsearch           │
│  Testing: Jest + Supertest                                  │
│  Security: JWT, RLS, Input Validation                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL 16 ────────────┐                               │
│      ├─ Patients Table      │  ┌─► Row Level Security       │
│      ├─ Appointments        ├──┤   (Multi-tenancy)          │
│      ├─ Consultations       │  ├─► Triggers                 │
│      ├─ Insurance Claims    │  │   (Audit logging)          │
│      ├─ Lab Results         ├──┤   Indexes                  │
│      ├─ Audit Logs          │  └─► Encryption (at-rest)     │
│      └─ More...             │                               │
│                             │                               │
│  Redis 7 ──────────────────┤                               │
│      ├─ Session Storage     │  ┌─► Cache Layer              │
│      ├─ Caching             ├──┤   Session Management       │
│      └─ Queues              │  └─► Rate Limiting            │
│                             │                               │
│  MinIO ──────────────────────                              │
│      ├─ Patient Documents   │  ┌─► S3-Compatible API        │
│      ├─ Lab Reports         ├──┤   File Uploads             │
│      ├─ Images              │  └─► Access Control           │
│      └─ Backups             │                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Docker ─────────────────────┐                              │
│      ├─ Container Runtime    │  ┌─► Consistent Environment   │
│      ├─ Volume Management    ├──┤   (Dev = Production)       │
│      └─ Networking           │  └─► Portability             │
│                              │                              │
│  Docker Compose ─────────────┤                              │
│      ├─ Service Orchestration│  ┌─► Infrastructure as Code   │
│      ├─ Network Definition   ├──┤   Version Controlled       │
│      ├─ Volume Management    │  └─► Reproducible Setup      │
│      └─ Environment Config   │                              │
│                              │                              │
│  Nginx ──────────────────────┤                              │
│      ├─ Reverse Proxy        │  ┌─► Load Balancing           │
│      ├─ SSL/TLS Termination  ├──┤   Security                 │
│      ├─ Static File Serving  │  └─► Performance              │
│      └─ Request Routing      │                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   MONITORING & LOGGING LAYER               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Prometheus ──────────────┐                                │
│      ├─ Metrics Collection │  ┌─► Time-series Database      │
│      ├─ Service Discovery  ├──┤   Alerting                  │
│      └─ Scrape Config      │  └─► PromQL Queries            │
│                            │                                │
│  Grafana ─────────────────┤                                │
│      ├─ Dashboards        │  ┌─► Visualization              │
│      ├─ Alerts            ├──┤   Real-time Monitoring       │
│      └─ Data Source (Prom) │  └─► Team Collaboration        │
│                            │                                │
│  Elasticsearch ───────────┤                                │
│      ├─ Log Storage       │  ┌─► Full-text Search           │
│      ├─ Indexing          ├──┤   Distributed Search         │
│      └─ Aggregations      │  └─► Scalable                   │
│                            │                                │
│  Kibana ──────────────────┤                                │
│      ├─ Log Visualization │  ┌─► Debugging                  │
│      ├─ Discovery         ├──┤   Log Analysis               │
│      └─ Dashboards        │  └─► Alerting                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

================================================================================
FILE STORAGE ARCHITECTURE
================================================================================

MinIO (Object Storage - S3 Compatible):

┌─────────────────────────────────┐
│    MinIO Bucket: clinical-data  │
├─────────────────────────────────┤
│                                 │
│  /patients/                     │
│  ├─ {patientId}/                │
│  │  ├─ profile.jpg              │
│  │  ├─ insurance-card.pdf       │
│  │  ├─ medical-records.pdf      │
│  │  └─ consent-forms.pdf        │
│  │                              │
│  /lab-results/                  │
│  ├─ {labId}/                    │
│  │  ├─ report.pdf               │
│  │  ├─ results.csv              │
│  │  └─ images/                  │
│  │                              │
│  /consultations/                │
│  ├─ {consultationId}/           │
│  │  ├─ notes.pdf                │
│  │  ├─ prescriptions.pdf        │
│  │  └─ follow-up-plan.pdf       │
│  │                              │
│  /backups/                      │
│  ├─ database/                   │
│  │  ├─ backup-2026-01-31.sql.gz │
│  │  ├─ backup-2026-01-30.sql.gz │
│  │  └─ ...                      │
│                                 │
└─────────────────────────────────┘

ACCESS METHOD:
  Direct via S3-compatible API (same as AWS S3)
  Example: GET /api/v1/patients/{id}/documents/{docId}
  Returns: Signed URL to MinIO
  Expiry: Configurable (default 1 hour)

================================================================================
DATA FLOW: COMPLETE REQUEST CYCLE
================================================================================

USER CREATES NEW PATIENT:

Frontend (React)                Backend (Express)              Database (PostgreSQL)
│                              │                             │
├─ Render Patient Form         │                             │
│  (React Component)            │                             │
│                              │                             │
├─ User enters data             │                             │
│  (name, email, phone)         │                             │
│                              │                             │
├─ User clicks "Create"         │                             │
│                              │                             │
├─ Validate form                │                             │
│  (client-side)                │                             │
│                              │                             │
├─ POST /api/v1/patients        │                             │
│  + body (JSON data)    ────────────► Receive request        │
│  + Authorization header       │                             │
│                              │                             │
│  {"firstName": "John",        │     ├─ Verify JWT token     │
│   "lastName": "Doe",          │     │                       │
│   "email": "john@..."}        │     ├─ Check permissions    │
│                              │     │  (RBAC)               │
│                              │     │                       │
│                              │     ├─ Validate input       │
│                              │     │  (type, length)       │
│                              │     │                       │
│                              │     ├─ Create patient       │
│                              │     │  object               │
│                              │     │                       │
│                              │     ├─ Hash sensitive data  │
│                              │     │                       │
│                              │     ├─ INSERT INTO patients
│  ◄──────────────────────────────────────────────► INSERT INTO patients
│  (200 OK Response)            │                  (patient_id, first_name, ...)
│  {"success": true,            │                             │
│   "data": {                   │                             │
│     "id": "pat-123",          │                             │
│     ...                       │                             │
│   }}                          │     ├─ Log to audit_logs    │
│                              │     │  (INSERT)             │
├─ Parse response               │     │                       │
│                              │     ├─ Cache result (Redis)  │
├─ Store patient data           │     │                       │
│  (Zustand state)              │     └─ Return JSON response │
│                              │                             │
├─ Update UI                    │                             │
│  (redirect to list)            │                             │
│                              │                             │
├─ Fetch patient list           │                             │
│  GET /api/v1/patients  ────────────► Query patients        │
│                              │     ├─ WHERE tenant_id = X  │
│  ◄──────────────────────────────────┤  (RLS - multi-tenant) │
│  (200 OK + patient list)      │     │                       │
│                              │     ├─ Check cache (Redis)  │
├─ Display in table             │     │  (miss - query DB)    │
│                              │     │                       │
│                              │     └─ Return results       │
│                              │                             │
└─ User sees new patient        │                             │
   in list                      │                             │

PARALLEL: LOGGING & MONITORING:

Every request simultaneously:

Backend Logging:
  ├─ Request: POST /api/v1/patients
  │  - timestamp, method, path
  │  - auth (user_id, tenant_id)
  │  - request_id (UUID for tracing)
  │
  ├─ Processing:
  │  - validation time: 5ms
  │  - database time: 25ms
  │  - cache time: 2ms
  │
  ├─ Response: 200 OK
  │  - response_time: 32ms
  │  - status_code: 200
  │
  └─ Sent to Elasticsearch
     → Searchable in Kibana

Metrics Collection:
  ├─ POST latency: 32ms
  ├─ Error rate: 0%
  ├─ Throughput: 5 req/sec
  ├─ Database query time: 25ms
  └─ Stored in Prometheus
     → Visible in Grafana

================================================================================
YOU'RE READY TO BUILD!

All architecture documented.
All infrastructure ready.
All systems running locally with: make dev

Start with: FINAL_SUMMARY_READY_TO_BUILD.md

Good luck! 🚀
================================================================================
