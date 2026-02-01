================================================================================
PHASE 2 TASK 2.4: DATABASE MIGRATION STRATEGY
Zero-Downtime Schema Changes & Data Migration Guide
================================================================================

Date: February 4, 2026
Task: Phase 2 Task 2.4 - Database Migration Strategy
Status: COMPLETE - DEVELOPMENT READY
Scope: All Phase 2 schema changes with zero-downtime deployment
Output: Migration guide with versioning, rollback, testing strategies

================================================================================
DOCUMENT OVERVIEW
================================================================================

PURPOSE:
  Establish strategy for deploying Phase 2 database schema changes without
  system downtime. Covers 23+ new tables, data migrations, rollback procedures,
  and testing methodology.

MIGRATION SCOPE:
  ✓ Care Team Support (3 new tables)
  ✓ Insurance Claims (8 new tables)
  ✓ Data Retention & Archival (4 new tables)
  ✓ Lab Results Import (6 new tables)
  ✓ Consultation Amendments (2 new tables)
  ✓ Total: 23+ new tables, 0 table drops, 0 breaking changes

APPLICABILITY:
  ✓ Database administrators
  ✓ DevOps engineers
  ✓ Backend developers
  ✓ QA/testing teams
  ✓ Production deployment teams

================================================================================
1. MIGRATION PRINCIPLES
================================================================================

ZERO-DOWNTIME REQUIREMENTS:

  ✓ No table locks during migration (use ADD COLUMN with defaults)
  ✓ No long-running transactions (<100ms max per operation)
  ✓ Backward compatible (old code works with new schema)
  ✓ Forward compatible (new code works with old schema)
  ✓ Reversible (rollback without data loss)
  ✓ Tested in staging environment first

VERSIONING STRATEGY:

  Migrations tracked by version number:
    Migration_001_initial_setup.sql          ← Phase 0
    Migration_010_add_consultations.sql      ← Phase 1
    Migration_020_add_care_team.sql          ← Phase 2
    Migration_021_add_insurance_claims.sql   ← Phase 2
    Migration_022_add_data_retention.sql     ← Phase 2
    Migration_023_add_lab_results.sql        ← Phase 2

  Tracked in database:
    CREATE TABLE schema_migrations (
      version INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW(),
      duration_ms INT,
      status VARCHAR(20)
    );

DEPLOYMENT STRATEGY:

  Traditional (for small changes):
    Dev → Staging → Production (single deployment)

  Blue-Green (for large changes):
    1. Deploy new code to "green" environment (parallel)
    2. Run migrations on "green" database
    3. Test thoroughly on "green"
    4. Switch traffic from "blue" to "green"
    5. Keep "blue" as rollback target for 1 hour

  Shadow Tables (for complex migrations):
    1. Create new shadow table alongside existing table
    2. Backfill shadow table from existing data
    3. Application uses both tables temporarily
    4. Once synced, drop old table and rename shadow table

================================================================================
2. PHASE 2 MIGRATION DETAILS
================================================================================

2.1 MIGRATION 020: CARE TEAM SUPPORT
──────────────────────────────────────────────────────────────────────────────

NEW TABLES (3):

  consultation_permissions
  ├─ id UUID PRIMARY KEY
  ├─ consultation_id UUID NOT NULL REFERENCES consultations(id)
  ├─ provider_id UUID NOT NULL REFERENCES providers(id)
  ├─ role VARCHAR(20) [LEAD, MEMBER, OBSERVER]
  ├─ can_edit BOOLEAN DEFAULT false
  ├─ created_at TIMESTAMP DEFAULT NOW()
  └─ UNIQUE(consultation_id, provider_id)

  consultation_sections
  ├─ id UUID PRIMARY KEY
  ├─ consultation_id UUID NOT NULL REFERENCES consultations(id)
  ├─ provider_id UUID NOT NULL REFERENCES providers(id)
  ├─ section_type VARCHAR(50) [CHIEF_COMPLAINT, ASSESSMENT, DIAGNOSIS, PLAN]
  ├─ content TEXT
  ├─ created_at TIMESTAMP DEFAULT NOW()
  └─ updated_at TIMESTAMP DEFAULT NOW()

  consultation_section_edits
  ├─ id UUID PRIMARY KEY
  ├─ section_id UUID NOT NULL REFERENCES consultation_sections(id)
  ├─ edited_by_provider_id UUID NOT NULL
  ├─ change_type VARCHAR(20) [CREATED, UPDATED, DELETED]
  ├─ previous_content TEXT
  ├─ new_content TEXT
  ├─ edited_at TIMESTAMP DEFAULT NOW()
  └─ reason VARCHAR(255)

MIGRATION STEPS:

  Step 1: Create new tables (safe, no locks)
    CREATE TABLE consultation_permissions (...);
    CREATE TABLE consultation_sections (...);
    CREATE TABLE consultation_section_edits (...);
    
    Duration: <10ms each
    Downtime: None

  Step 2: Add feature flag column to consultations
    ALTER TABLE consultations ADD COLUMN
      use_care_team BOOLEAN DEFAULT false;
    
    Duration: <10ms
    Downtime: None
    Note: Feature flag prevents accidental use

  Step 3: Create indexes
    CREATE INDEX idx_consultation_perms_consultation 
      ON consultation_permissions(consultation_id);
    CREATE INDEX idx_consultation_sections_consultation 
      ON consultation_sections(consultation_id);
    
    Duration: <100ms (depends on data volume, does not lock)
    Downtime: None

ROLLBACK PROCEDURE:

  If rollback needed:
    
    Step 1: Set feature flag to false globally
      UPDATE system_config SET value = 'false' 
      WHERE key = 'ENABLE_CARE_TEAM';
    
    Step 2: Drop new tables (safe, feature flag prevents use)
      DROP TABLE consultation_section_edits;
      DROP TABLE consultation_sections;
      DROP TABLE consultation_permissions;
    
    Step 3: Remove feature flag column (optional, doesn't affect anything)
      ALTER TABLE consultations DROP COLUMN use_care_team;
    
    Duration: <1 minute
    Risk: Very low (feature flag prevents data access before rollback)

DEPLOYMENT CHECKLIST:

  ☐ Test migration on staging database
  ☐ Verify all tables created successfully
  ☐ Verify indexes created and performant
  ☐ Verify application startup (migrations succeed)
  ☐ Verify feature flag set to false (disabled by default)
  ☐ Verify old code still works (backward compatible)
  ☐ Run smoke tests
  ☐ Deploy to production

2.2 MIGRATION 021: INSURANCE CLAIMS
──────────────────────────────────────────────────────────────────────────────

NEW TABLES (8):

  insurance_claims
  ├─ id UUID PRIMARY KEY
  ├─ consultation_id UUID NOT NULL REFERENCES consultations(id)
  ├─ patient_id UUID NOT NULL REFERENCES patients(id)
  ├─ clinic_id UUID NOT NULL REFERENCES clinics(id)
  ├─ status VARCHAR(50) [PENDING_REVIEW, APPROVED, ...]
  ├─ amount DECIMAL(10, 2)
  ├─ approved_amount DECIMAL(10, 2)
  └─ ... [fields from Phase 2.1 spec]

  claim_status_history
  ├─ id UUID PRIMARY KEY
  ├─ claim_id UUID NOT NULL REFERENCES insurance_claims(id)
  ├─ old_status VARCHAR(50)
  ├─ new_status VARCHAR(50)
  ├─ reason TEXT
  └─ changed_at TIMESTAMP DEFAULT NOW()

  claim_resubmissions
  ├─ id UUID PRIMARY KEY
  ├─ claim_id UUID NOT NULL
  ├─ resubmit_date TIMESTAMP
  └─ ...

  [5 more tables: claim_appeals, claim_edi_837, claim_clearinghouse_response, claim_line_items, claim_error_log]

MIGRATION STEPS:

  Step 1: Create all 8 tables
    CREATE TABLE insurance_claims (...);
    CREATE TABLE claim_status_history (...);
    ... [other tables]
    
    Duration: <100ms total
    Downtime: None

  Step 2: Add feature flag to consultations
    ALTER TABLE consultations ADD COLUMN
      auto_create_claim BOOLEAN DEFAULT false;
    
    Duration: <10ms
    Downtime: None

  Step 3: Create indexes (non-blocking)
    CREATE INDEX idx_claims_patient ON insurance_claims(patient_id);
    CREATE INDEX idx_claims_status ON insurance_claims(status);
    CREATE INDEX idx_history_claim ON claim_status_history(claim_id);
    ... [more indexes]

  Step 4: Backfill claim data (optional, depends on business logic)
    For historical appointments/consultations:
    SELECT consultation_id, patient_id, clinic_id
    FROM consultations
    WHERE status = 'FINALIZED'
    AND created_at < NOW() - INTERVAL '30 days'
    AND id NOT IN (SELECT consultation_id FROM insurance_claims);
    
    Backfill in batches to avoid large transaction:
    
    INSERT INTO insurance_claims (...)
    SELECT ... FROM consultations
    WHERE created_at > NOW() - INTERVAL '31 days'
    AND created_at < NOW() - INTERVAL '30 days'
    LIMIT 1000;
    
    Sleep 100ms between batches
    
    Duration: 30-60 minutes (background job)
    Downtime: None (runs asynchronously)

ROLLBACK PROCEDURE:

  Step 1: Disable feature flag
    UPDATE system_config SET value = 'false'
    WHERE key = 'ENABLE_AUTO_CLAIMS';
  
  Step 2: Drop tables (in dependency order)
    DROP TABLE claim_error_log;
    DROP TABLE claim_line_items;
    DROP TABLE claim_clearinghouse_response;
    DROP TABLE claim_edi_837;
    DROP TABLE claim_appeals;
    DROP TABLE claim_resubmissions;
    DROP TABLE claim_status_history;
    DROP TABLE insurance_claims;
  
  Step 3: Remove feature flag columns
    ALTER TABLE consultations DROP COLUMN auto_create_claim;
  
  Duration: <1 minute
  Risk: Low (feature flag prevents automatic claim creation)

2.3 MIGRATION 022: DATA RETENTION & ARCHIVAL
──────────────────────────────────────────────────────────────────────────────

NEW TABLES (4):

  patient_retention
  ├─ id UUID PRIMARY KEY
  ├─ patient_id UUID NOT NULL REFERENCES patients(id)
  ├─ retention_tier INT [1=Active, 2=Archive, 3=Delete]
  ├─ created_at TIMESTAMP
  ├─ archived_at TIMESTAMP
  ├─ deleted_at TIMESTAMP
  └─ retention_reason VARCHAR(255)

  deletion_requests
  ├─ id UUID PRIMARY KEY
  ├─ patient_id UUID NOT NULL REFERENCES patients(id)
  ├─ requested_by_user_id UUID
  ├─ request_type VARCHAR(50) [GDPR_RIGHT_TO_DELETE, CCPA_DELETION, ...]
  ├─ status VARCHAR(20) [PENDING, APPROVED, COMPLETED]
  ├─ requested_at TIMESTAMP
  └─ completed_at TIMESTAMP

  deletion_logs
  ├─ id UUID PRIMARY KEY
  ├─ deletion_request_id UUID
  ├─ table_name VARCHAR(255)
  ├─ records_deleted INT
  ├─ deleted_at TIMESTAMP
  └─ reason VARCHAR(255)

  archival_logs
  ├─ id UUID PRIMARY KEY
  ├─ patient_id UUID
  ├─ records_archived INT
  ├─ file_s3_path VARCHAR(500)
  ├─ archived_at TIMESTAMP
  └─ anonymization_checksum VARCHAR(64)

MIGRATION STEPS:

  Step 1: Create retention tracking tables
    CREATE TABLE patient_retention (...);
    CREATE TABLE deletion_requests (...);
    CREATE TABLE deletion_logs (...);
    CREATE TABLE archival_logs (...);
    
    Duration: <50ms
    Downtime: None

  Step 2: Backfill retention tier for existing patients
    INSERT INTO patient_retention (patient_id, retention_tier, created_at)
    SELECT id, 1, created_at FROM patients
    WHERE NOT EXISTS (
      SELECT 1 FROM patient_retention 
      WHERE patient_id = patients.id
    );
    
    Batch backfill to avoid long transaction:
    
    Duration: 5-10 minutes (background, in batches)
    Downtime: None

  Step 3: Create retention policy indexes
    CREATE INDEX idx_retention_tier ON patient_retention(retention_tier);
    CREATE INDEX idx_retention_archived ON patient_retention(archived_at);
    CREATE INDEX idx_deletions_status ON deletion_requests(status);

  Step 4: Schedule nightly archival job
    -- Run at 2am UTC nightly
    -- Identifies patients >7 years old
    -- Archives to Glacier, removes from production
    -- Backups automatically taken before archival

ROLLBACK PROCEDURE:

  Step 1: Stop archival job
    UPDATE cron_jobs SET enabled = false
    WHERE job_name = 'daily_archival_job';
  
  Step 2: Stop deletion job
    UPDATE cron_jobs SET enabled = false
    WHERE job_name = 'process_deletion_requests';
  
  Step 3: Drop tables
    DROP TABLE archival_logs;
    DROP TABLE deletion_logs;
    DROP TABLE deletion_requests;
    DROP TABLE patient_retention;
  
  Step 4: Restore archived data if needed (from S3 Glacier)
    -- This is a manual process, takes 1-3 hours per patient
    -- Restore from backup if data loss occurred
  
  Duration: <1 minute
  Risk: Low (archival job disabled before rollback)

2.4 MIGRATION 023: LAB RESULTS IMPORT
──────────────────────────────────────────────────────────────────────────────

NEW TABLES (6):

  lab_imports
  ├─ id UUID PRIMARY KEY
  ├─ clinic_id UUID NOT NULL REFERENCES clinics(id)
  ├─ file_name VARCHAR(255)
  ├─ file_type VARCHAR(20) [CSV, HL7]
  ├─ status VARCHAR(20) [PROCESSING, COMPLETED, FAILED]
  ├─ uploaded_at TIMESTAMP
  ├─ processed_at TIMESTAMP
  └─ error_message TEXT

  lab_results
  ├─ id UUID PRIMARY KEY
  ├─ patient_id UUID NOT NULL REFERENCES patients(id)
  ├─ test_name VARCHAR(255)
  ├─ test_code VARCHAR(50)
  ├─ result_value VARCHAR(100)
  ├─ status VARCHAR(20) [NORMAL, ABNORMAL, CRITICAL]
  ├─ test_date TIMESTAMP
  ├─ result_date TIMESTAMP
  └─ imported_from_lab_import_id UUID

  lab_import_matches
  ├─ import_id UUID
  ├─ record_number INT
  ├─ matched_patient_id UUID
  ├─ match_confidence INT [0-100]
  ├─ match_method VARCHAR(50) [EXACT_MRN, FUZZY_NAME_DOB, ...]
  └─ status VARCHAR(20) [ACCEPTED, NEEDS_REVIEW]

  lab_result_alerts
  ├─ id UUID PRIMARY KEY
  ├─ lab_result_id UUID
  ├─ alert_type VARCHAR(20) [CRITICAL_VALUE]
  ├─ severity INT [1=Normal, 2=Abnormal, 3=Critical]
  ├─ created_at TIMESTAMP
  └─ acknowledged_at TIMESTAMP

  [2 more tables: lab_import_validations, lab_import_diagnostic_mapping]

MIGRATION STEPS:

  Step 1: Create lab result tables
    CREATE TABLE lab_imports (...);
    CREATE TABLE lab_results (...);
    CREATE TABLE lab_import_matches (...);
    CREATE TABLE lab_result_alerts (...);
    CREATE TABLE lab_import_validations (...);
    CREATE TABLE lab_import_diagnostic_mapping (...);
    
    Duration: <100ms
    Downtime: None

  Step 2: Create processing status table
    ALTER TABLE lab_imports ADD COLUMN
      validation_status VARCHAR(20) DEFAULT 'PENDING';

  Step 3: Create indexes for common queries
    CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
    CREATE INDEX idx_lab_results_status ON lab_results(status);
    CREATE INDEX idx_lab_alerts_result ON lab_result_alerts(lab_result_id);

ROLLBACK PROCEDURE:

  Step 1: Stop lab import processing
    UPDATE system_config SET value = 'false'
    WHERE key = 'ENABLE_LAB_IMPORT';
  
  Step 2: Drop tables (in dependency order)
    DROP TABLE lab_import_diagnostic_mapping;
    DROP TABLE lab_import_validations;
    DROP TABLE lab_result_alerts;
    DROP TABLE lab_import_matches;
    DROP TABLE lab_results;
    DROP TABLE lab_imports;
  
  Duration: <1 minute
  Risk: Low (feature flag prevents new imports)

================================================================================
3. MIGRATION EXECUTION PLAN
================================================================================

DEPLOYMENT SEQUENCE:

  Phase 2A (Week 1):
    ✓ Migration 020 (Care Team) → Feb 5, 2026, 2am UTC
    ✓ Test: Feb 5, morning
    ✓ Feature flag disabled by default

  Phase 2B (Week 2):
    ✓ Migration 021 (Insurance Claims) → Feb 8, 2026, 2am UTC
    ✓ Test: Feb 8, morning
    ✓ Feature flag disabled by default

  Phase 2C (Week 3):
    ✓ Migration 022 (Data Retention) → Feb 12, 2026, 2am UTC
    ✓ Test: Feb 12, morning
    ✓ Start nightly archival job

  Phase 2D (Week 4):
    ✓ Migration 023 (Lab Results) → Feb 15, 2026, 2am UTC
    ✓ Test: Feb 15, morning
    ✓ Feature flag disabled by default

PRE-MIGRATION CHECKLIST:

  ☐ Backup production database (full backup, retained 30 days)
  ☐ Backup Elasticsearch indices
  ☐ Create snapshot for rollback (30 min before migration)
  ☐ Notify on-call team
  ☐ Prepare rollback script
  ☐ Test migration on staging (identical schema)
  ☐ Measure duration on staging
  ☐ Review all code changes that depend on migration
  ☐ Deploy code changes 1-2 hours before migration
  ☐ Scale database connection pool (if needed)
  ☐ Disable background jobs that might conflict
  ☐ Notify monitoring/alerting team

EXECUTION PROCEDURE (2am UTC):

  T-10min:  Final backup, notify team
  T-0min:   Start migration script
  T+5min:   All tables created (verify in logs)
  T+10min:  All indexes created (verify performance)
  T+15min:  Feature flags set to false (verify in config table)
  T+20min:  Smoke tests passed (verify in test logs)
  T+30min:  Release to traffic (gradual, 10% → 50% → 100%)

POST-MIGRATION CHECKLIST:

  ☐ Monitor error rates (< 0.1%)
  ☐ Monitor latency (p99 < 500ms)
  ☐ Monitor database CPU (< 70%)
  ☐ Verify new tables have correct row counts
  ☐ Verify indexes created successfully
  ☐ Verify application logs show no errors
  ☐ Run integration tests
  ☐ Run end-to-end tests
  ☐ Verify data consistency
  ☐ Archive migration logs
  ☐ Document any issues
  ☐ Schedule post-migration review

================================================================================
4. TESTING STRATEGY
================================================================================

4.1 STAGING ENVIRONMENT TESTING
──────────────────────────────────────────────────────────────────────────────

BEFORE MIGRATION:

  1. Clone production database to staging
     └─ Identical schema, realistic data volume (100GB)
     └─ Run at T-24 hours

  2. Run migration script on staging
     └─ Time each step
     └─ Verify all tables created
     └─ Verify all indexes performant
     └─ Verify rollback script works

  3. Test all dependent code on staging
     └─ Feature flags disabled
     └─ Old code paths still work
     └─ New code paths work when enabled
     └─ No new errors or warnings

  4. Performance testing
     └─ Run load tests (100 concurrent users)
     └─ Measure query performance on new tables
     └─ Verify no regression on existing queries
     └─ p99 latency target: < 500ms

CONTINUOUS TESTING:

  1. Unit tests for migration scripts
     └─ Test idempotency (can run twice safely)
     └─ Test rollback procedures
     └─ Test backward compatibility
     └─ Test forward compatibility

  2. Integration tests
     └─ Test data migrations
     └─ Test constraint enforcement
     └─ Test foreign key relationships
     └─ Test index creation

  3. Regression tests
     └─ Run all existing tests after migration
     └─ Verify no breaking changes
     └─ Verify data consistency

4.2 PRODUCTION VALIDATION
──────────────────────────────────────────────────────────────────────────────

IMMEDIATE POST-MIGRATION:

  1. Sanity checks (5 minutes)
     ✓ SELECT COUNT(*) from all new tables (should all be 0 or correct count)
     ✓ DESCRIBE all new tables (verify schema)
     ✓ Query indexes (verify created)

  2. Performance checks (10 minutes)
     ✓ Run sample queries, measure latency
     ✓ Check query plans (verify indexes used)
     ✓ Monitor database CPU (should be < 70%)

  3. Application checks (15 minutes)
     ✓ Check error logs (should be zero errors)
     ✓ Check warning logs (should be minimal)
     ✓ Run smoke tests (critical user journeys)
     ✓ Verify feature flags disabled

4.3 MONITORING & ALERTING
──────────────────────────────────────────────────────────────────────────────

CRITICAL METRICS:

  Error Rate:       Alert if > 1% (migration issue)
  API Latency:      Alert if p99 > 1000ms (slow query)
  Database CPU:     Alert if > 80% (resource constraint)
  Memory Usage:     Alert if > 85% (OOM risk)
  Connections:      Alert if > max_connections * 0.9

DASHBOARD:

  Real-time monitoring during deployment:
  ├─ Error rate (target: 0%)
  ├─ API latency p99 (target: < 500ms)
  ├─ Database CPU (target: < 70%)
  ├─ Active connections (target: < 500)
  ├─ Database transactions/sec (target: baseline ±10%)
  └─ New table row counts (target: expected values)

================================================================================
5. ROLLBACK STRATEGY
================================================================================

5.1 ROLLBACK TRIGGERS
──────────────────────────────────────────────────────────────────────────────

AUTOMATIC ROLLBACK (if any of these occur):

  ❌ Error rate > 5% for > 5 minutes
  ❌ API latency p99 > 2000ms for > 5 minutes
  ❌ Database CPU > 95% for > 5 minutes
  ❌ Out of memory or disk space
  ❌ Critical error in logs (e.g., "failed to create table")

MANUAL ROLLBACK (recommended if):

  • Unexpected behavior in production
  • Business logic failure
  • Data corruption detected
  • Customer-impacting issues

5.2 ROLLBACK PROCEDURE
──────────────────────────────────────────────────────────────────────────────

STEP 1: Disable Feature Flags (< 1 minute)
  UPDATE system_config SET value = 'false'
  WHERE key IN ('ENABLE_CARE_TEAM', 'ENABLE_AUTO_CLAIMS', 'ENABLE_LAB_IMPORT');

  Effect: Stops using new features, no errors

STEP 2: Revert Code (< 5 minutes)
  git revert HEAD  # Revert to previous version
  Deploy to production (uses code from previous release)

  Effect: Old code paths only, uses old database schema

STEP 3: Drop New Tables (< 5 minutes)
  -- Run rollback migration script
  psql -U postgres -d clinical_db -f rollback_migration_023.sql
  psql -U postgres -d clinical_db -f rollback_migration_022.sql
  psql -U postgres -d clinical_db -f rollback_migration_021.sql
  psql -U postgres -d clinical_db -f rollback_migration_020.sql

  Effect: Database returns to previous state

STEP 4: Restore from Snapshot (if needed, < 15 minutes)
  -- If data corruption detected
  pg_restore -U postgres -d clinical_db < snapshot_20260204_0200.sql
  OR
  AWS RDS Restore from snapshot

  Effect: Database restored to pre-migration state

Total rollback time: < 30 minutes

5.3 ROLLBACK TESTING
──────────────────────────────────────────────────────────────────────────────

BEFORE PRODUCTION DEPLOYMENT:

  1. Test rollback on staging database
     └─ Run migration forward
     └─ Verify tables created
     └─ Run rollback
     └─ Verify tables dropped
     └─ Verify no data loss

  2. Test rollback procedure timing
     └─ Disable features (measure time)
     └─ Revert code (measure time)
     └─ Drop tables (measure time)
     └─ Total should be < 30 minutes

  3. Verify no data loss during rollback
     └─ Insert test data
     └─ Run migration
     └─ Verify data still accessible
     └─ Run rollback
     └─ Verify data still intact

================================================================================
6. COMMUNICATION PLAN
================================================================================

STAKEHOLDERS:

  ✓ Engineering team
  ✓ QA team
  ✓ DevOps team
  ✓ On-call support
  ✓ Product management
  ✓ Customer success team

TIMING:

  T-7 days:  Announce migration plan (email to all teams)
  T-3 days:  Final review meeting (eng + devops)
  T-1 day:   Last-minute checks (dev lead + devops lead)
  T-2 hours: Send deployment window notification to on-call
  T-30min:   Final database backup
  T-0min:    Start migration, send Slack notification
  T+30min:   Rollback cutoff (if needed, execute now)
  T+1hour:   Send all-clear notification (or incident report if needed)

COMMUNICATION TEMPLATE:

  Pre-deployment:
    "Database migration scheduled for Feb 5, 2:00-2:30am UTC.
     Expected downtime: 0 minutes (zero-downtime deployment).
     Rollback plan in place. On-call team notified."

  Start:
    "🚀 Deploying Migration 020 (Care Team Support) - Started at 2:00am UTC"

  Success:
    "✅ Migration 020 completed successfully in 15 minutes.
     All tests passed. New tables created and verified.
     Feature flag disabled by default. No customer impact."

  Rollback (if needed):
    "⚠️  Rolling back Migration 020 due to [reason].
     Rolling back now. Will restore service in < 30 minutes."

================================================================================
7. IMPLEMENTATION CHECKLIST
================================================================================

MIGRATION SCRIPTS:

  ☐ migration_020_care_team_support.sql
  ☐ rollback_migration_020.sql
  ☐ migration_021_insurance_claims.sql
  ☐ rollback_migration_021.sql
  ☐ migration_022_data_retention.sql
  ☐ rollback_migration_022.sql
  ☐ migration_023_lab_results.sql
  ☐ rollback_migration_023.sql

INFRASTRUCTURE:

  ☐ Database backup procedures (automated)
  ☐ Snapshot creation before each migration
  ☐ Monitoring/alerting configured
  ☐ Rollback runbooks prepared
  ☐ On-call team trained

TESTING:

  ☐ Staging migration test (pass)
  ☐ Staging performance test (pass)
  ☐ Staging rollback test (pass)
  ☐ Unit tests for migrations (pass)
  ☐ Integration tests (pass)
  ☐ Regression tests (pass)

CODE CHANGES:

  ☐ Code handles new tables gracefully
  ☐ Feature flags in place and disabled
  ☐ Error handling added for edge cases
  ☐ Backward compatibility verified
  ☐ Code review completed

DEPLOYMENT:

  ☐ Deployment runbook prepared
  ☐ Rollback runbook prepared
  ☐ Communication plan finalized
  ☐ Team trained on procedures
  ☐ On-call team on standby
  ☐ Customer impact assessed (none expected)

================================================================================
END OF DATABASE MIGRATION STRATEGY
================================================================================
