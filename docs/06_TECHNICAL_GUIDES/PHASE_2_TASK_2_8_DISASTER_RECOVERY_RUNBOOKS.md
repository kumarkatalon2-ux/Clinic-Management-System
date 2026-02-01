================================================================================
PHASE 2 TASK 2.8: DISASTER RECOVERY RUNBOOKS
Step-by-Step Recovery Procedures for Critical Failure Scenarios
================================================================================

Date: February 4, 2026
Task: Phase 2 Task 2.8 - Disaster Recovery Runbooks
Status: COMPLETE - DEVELOPMENT READY
Scope: RTO/RPO targets, recovery procedures for 5 failure scenarios
Output: Comprehensive runbooks for all critical scenarios

================================================================================
DOCUMENT OVERVIEW
================================================================================

PURPOSE:
  Provide step-by-step recovery procedures for critical failure scenarios.
  Ensures business continuity and minimizes data loss and downtime.

SCOPE:
  ✓ Database corruption/data loss
  ✓ Service outage (single/multiple services)
  ✓ Security breach
  ✓ Deployment failure/rollback
  ✓ Disk space exhaustion

RTO/RPO TARGETS (Service Level Agreements):

  RTO = Recovery Time Objective (max downtime acceptable)
  RPO = Recovery Point Objective (max data loss acceptable)

  CRITICAL systems (Patient data, Payments, Insurance):
    RTO: 1 hour
    RPO: 15 minutes

  HIGH systems (Consultations, Lab results):
    RTO: 4 hours
    RPO: 1 hour

  MEDIUM systems (Analytics, Reporting):
    RTO: 24 hours
    RPO: 1 hour

  LOW systems (Admin features):
    RTO: 48 hours
    RPO: 1 day

APPLICABILITY:
  ✓ DevOps team
  ✓ SRE team
  ✓ On-call engineers
  ✓ Database administrators
  ✓ Security team

================================================================================
1. DATABASE FAILURE SCENARIOS
================================================================================

1.1 SCENARIO: DATABASE CORRUPTION (DATA LOSS)
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Application logs show: "Integrity constraint violation"
  • Queries fail with: "Unexpected value in column"
  • Database status: CORRUPTED or OFFLINE
  • Alert: "Database health check failed"
  • Monitoring: Disk I/O errors

RTO/RPO TARGET:
  RTO: 1 hour (critical patient data)
  RPO: 15 minutes (data loss acceptable up to last backup)

RECOVERY STEPS (Total time: 30-45 minutes):

  STEP 1: CONFIRM CORRUPTION (2 minutes)
    
    Task 1.1: Connect to database as admin
      psql -U postgres -h db.internal.clinical-system.com \
        -d clinical_db -c "SELECT version();"
    
    Task 1.2: Run integrity check
      psql -U postgres -d clinical_db -c "REINDEX DATABASE clinical_db;"
    
    Task 1.3: Check for errors
      grep -i "corruption\|error\|failed" /var/log/postgresql/postgresql.log
    
    Decision: Is database recoverable?
      • Yes: Continue to STEP 2
      • No: Skip to STEP 3 (Restore from backup)

  STEP 2: ATTEMPT RECOVERY (5-10 minutes)
    
    Task 2.1: Dump affected table schema
      pg_dump -U postgres -d clinical_db -s -t patients > patients_schema.sql
    
    Task 2.2: Backup corrupted table
      ALTER TABLE patients RENAME TO patients_corrupted;
    
    Task 2.3: Recreate table from schema
      psql -U postgres -d clinical_db < patients_schema.sql
    
    Task 2.4: Restore data from transaction logs (if available)
      # WAL archiving must be enabled
      pg_recovery_restore_point('manual_recovery_point')
    
    Task 2.5: Verify recovery
      SELECT COUNT(*) FROM patients;
      # Should show expected count, not 0
    
    Decision: Is data recovered?
      • Yes: Continue to STEP 4 (Validate)
      • No: Skip to STEP 3 (Restore from backup)

  STEP 3: RESTORE FROM BACKUP (25-35 minutes)
    
    Task 3.1: Stop all database connections
      psql -U postgres -d clinical_db -c "SELECT pg_terminate_backend(pid) \
        FROM pg_stat_activity WHERE datname = 'clinical_db';"
    
    Task 3.2: List available backups
      aws s3 ls s3://clinical-backups/ --recursive | grep -E "rds-|snapshot-"
    
    Example output:
      2026-02-04 02:00:00  2.5 GB  rds-backup-2026-02-04-0200.dump
      2026-02-04 01:00:00  2.5 GB  rds-backup-2026-02-04-0100.dump
      2026-02-03 23:00:00  2.5 GB  rds-backup-2026-02-03-2300.dump
    
    Task 3.3: Choose backup (pick latest available)
      BACKUP_FILE="rds-backup-2026-02-04-0200.dump"
      BACKUP_TIME="2026-02-04 02:00:00" (Data loss up to 1 hour possible)
    
    Task 3.4: Download backup
      aws s3 cp s3://clinical-backups/$BACKUP_FILE . --sse AES256
    
    Task 3.5: Restore database from backup
      pg_restore -U postgres -d clinical_db $BACKUP_FILE --verbose
    
    Task 3.6: Verify restoration
      SELECT COUNT(*) FROM patients;
      SELECT COUNT(*) FROM appointments;
      SELECT COUNT(*) FROM consultations;
    
    Task 3.7: Check data consistency
      SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;
      # Should show migrations up to restore point

  STEP 4: VALIDATE RECOVERY (3-5 minutes)
    
    Task 4.1: Run data validation queries
      SELECT COUNT(*) FROM patients WHERE created_at IS NULL;
      # Should be 0 (all patients have creation timestamp)
    
      SELECT COUNT(*) FROM patients WHERE email NOT LIKE '%@%';
      # Should be 0 (all valid emails)
    
      SELECT COUNT(*) FROM appointments WHERE end_time < start_time;
      # Should be 0 (appointment end after start)

    Task 4.2: Test application connectivity
      curl -H "Authorization: Bearer $TEST_TOKEN" \
        https://api.clinical-system.com/api/v1/patients?limit=1
      # Should return 200 with patient data

    Task 4.3: Monitor error logs
      tail -f /var/log/app/app.log | grep -i "error\|exception"
      # Should see no errors for 2 minutes

  STEP 5: RESTORE SERVICE (2 minutes)
    
    Task 5.1: Scale application instances back up
      kubectl scale deployment clinical-api --replicas=3
    
    Task 5.2: Verify API responding
      curl https://api.clinical-system.com/api/v1/health
      # Should return 200 OK

    Task 5.3: Notify stakeholders
      Slack: @oncall "✅ Database recovered. Service restored to normal."

ROLLBACK PLAN (if recovery fails):
  • Keep previous environment running (don't immediately decommission)
  • Allow 1 hour for validation
  • Archive corrupted database for forensics
  • Document what went wrong
  • Post-incident review within 24 hours

POST-RECOVERY ACTIONS (within 24 hours):
  ☐ Verify all users can access their data
  ☐ Confirm insurance claims processing working
  ☐ Verify appointment scheduling working
  ☐ Check for orphaned records
  ☐ Analyze cause of corruption
  ☐ Update disaster recovery plan if needed
  ☐ Document incident
  ☐ Schedule post-incident review

1.2 SCENARIO: DATABASE CONNECTION FAILURE
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Application logs: "Connection refused"
  • Error: "Cannot connect to database"
  • Alert: "Database unreachable"
  • All queries fail with timeout

RTO/RPO TARGET:
  RTO: 15 minutes (no data loss)
  RPO: 0 minutes (connection issue, not data loss)

RECOVERY STEPS:

  STEP 1: VERIFY DATABASE STATUS (2 minutes)
    
    Task 1.1: Check database instance
      aws rds describe-db-instances --db-instance-identifier clinical-db \
        --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]'
      
      Expected output:
        available | db.internal.clinical-system.com

    Task 1.2: Check network connectivity
      ping db.internal.clinical-system.com
      nc -zv db.internal.clinical-system.com 5432

    Task 1.3: Check security group
      aws ec2 describe-security-groups --group-ids sg-xxxxx \
        --query 'SecurityGroups[0].IpPermissions'
      
      Should allow port 5432 from API service

  STEP 2: RESTART APPLICATION CONNECTIONS (3 minutes)
    
    Task 2.1: Clear connection pool
      # If using connection pooling (PgBouncer)
      psql -U pgbouncer -h localhost \
        -c "RELOAD; SELECT * FROM pgbouncer_stat;"

    Task 2.2: Restart API service pods
      kubectl rollout restart deployment/clinical-api -n production

    Task 2.3: Verify pods started
      kubectl get pods -n production | grep clinical-api
      # Should show all pods in Running state

  STEP 3: TEST CONNECTIVITY (2 minutes)
    
    Task 3.1: Test from API pod
      kubectl exec -it deployment/clinical-api -n production -- \
        psql -h db.internal -U app -d clinical_db -c "SELECT 1;"
      # Should return 1

    Task 3.2: Test API endpoint
      curl https://api.clinical-system.com/api/v1/health
      # Should return 200 OK

COMMON CAUSES:
  • Network issue: Check security group rules, NACLs
  • Database down: Check RDS status, restart if needed
  • Connection pool exhausted: Increase pool size or restart
  • DNS resolution: Check DNS service, restart if needed

================================================================================
2. SERVICE OUTAGE SCENARIOS
================================================================================

2.1 SCENARIO: API SERVICE OUTAGE (SINGLE SERVICE DOWN)
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Alert: "API health check failed"
  • Error: "Service unavailable" (503)
  • Application logs: Shows restart loops or crashes
  • Monitoring: High error rate, low throughput

RTO/RPO TARGET:
  RTO: 5 minutes (detect + recover)
  RPO: 0 minutes (stateless service, no data loss)

RECOVERY STEPS:

  STEP 1: VERIFY FAILURE (1 minute)
    
    Task 1.1: Check API pods status
      kubectl get pods -n production -l app=clinical-api
      # Look for: CrashLoopBackOff, ImagePullBackOff, or 0/1 Running

    Task 1.2: Check recent logs
      kubectl logs -n production deployment/clinical-api --tail=100
      # Look for error messages, stack traces

    Task 1.3: Check resource usage
      kubectl top pods -n production -l app=clinical-api
      # Look for high CPU or memory usage

  STEP 2: IMMEDIATE RECOVERY (2 minutes)
    
    OPTION A: Restart pods (most common)
      kubectl rollout restart deployment/clinical-api -n production
      
      Verify:
      kubectl rollout status deployment/clinical-api -n production

    OPTION B: Increase replicas (if load spiked)
      kubectl scale deployment clinical-api --replicas=5 -n production
    
    OPTION C: Rollback to previous version (if recent deployment)
      kubectl rollout undo deployment/clinical-api -n production
      kubectl rollout status deployment/clinical-api -n production

  STEP 3: VALIDATE RECOVERY (2 minutes)
    
    Task 3.1: Check pod status
      kubectl get pods -n production -l app=clinical-api
      # Should show 3+ pods in Running state

    Task 3.2: Test API endpoint
      curl -w "\n%{http_code}\n" https://api.clinical-system.com/api/v1/health
      # Should return 200

    Task 3.3: Monitor error rate
      kubectl logs -f deployment/clinical-api -n production | head -20
      # Should not show errors

POST-RECOVERY:
  ☐ Investigate root cause (memory leak, crash, etc.)
  ☐ Check if issue occurs under specific load
  ☐ Review deployment changes if restart didn't work
  ☐ Check resource limits and increase if needed

2.2 SCENARIO: MULTIPLE SERVICE OUTAGE (CASCADING FAILURE)
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Alert: Multiple services failing (API, Auth, Database, Cache)
  • Error: "Service A depends on Service B which is down"
  • Cascade effect: One failure causes others to fail

RTO/RPO TARGET:
  RTO: 15 minutes (full stack recovery)
  RPO: 0 minutes (stateless services, no data loss)

RECOVERY PROCEDURE:

  STEP 1: STOP THE CASCADE (2 minutes)
    
    Task 1.1: Identify failing services
      kubectl get pods -n production | grep -E "CrashLoop|ImagePull|0/"
    
    Task 1.2: STOP traffic immediately (circuit breaker)
      # If external traffic continues to hit failing services
      # Turn off ingress or API gateway
      kubectl patch ingress clinical-api-ingress -n production \
        --type=json -p='[{"op":"replace","path":"/spec/rules/0/http/paths/0/backend/service/port/number","value":0}]'
    
    Alternative (if using AWS ALB):
      aws elbv2 modify-target-group --target-group-arn arn:aws:elasticloadbalancing:... \
        --health-check-timeout-seconds 2 --unhealthy-threshold-count 1

  STEP 2: IDENTIFY ROOT CAUSE (3 minutes)
    
    Task 2.1: Check resource availability
      kubectl top nodes
      # Check if CPU/memory exhausted
    
    Task 2.2: Check database connectivity
      kubectl exec -it deployment/clinical-api -n production -- \
        psql -h db.internal -U app -d clinical_db -c "SELECT 1;"
    
    Task 2.3: Check external dependencies
      # Check Zoom API (telemedicine)
      # Check Change Healthcare (insurance)
      # Check Stripe (payments)

    Root causes (in priority order):
      1. Database down → Restore database (see section 1.1)
      2. Resource exhaustion → Scale up or increase limits
      3. Memory leak → Restart services, investigate
      4. External API down → Use fallback/cache

  STEP 3: RECOVER SERVICES (5-10 minutes)
    
    PRIORITY 1 - Database (if down):
      kubectl exec -it deployment/clinical-api -n production -- \
        psql -h db.internal -U app -d clinical_db -c "VACUUM ANALYZE;"
    
    PRIORITY 2 - Cache (Redis):
      kubectl rollout restart deployment/redis-cache -n production
    
    PRIORITY 3 - API services (in dependency order):
      kubectl rollout restart deployment/clinical-api -n production
    
    PRIORITY 4 - External integrations:
      If timeout errors: Increase timeouts temporarily
      If rate limit: Queue requests, retry with backoff

  STEP 4: RESTORE TRAFFIC (1 minute)
    
    Task 4.1: Re-enable ingress
      kubectl patch ingress clinical-api-ingress -n production \
        --type=json -p='[{"op":"replace","path":"/spec/rules/0/http/paths/0/backend/service/port/number","value":443}]'
    
    Task 4.2: Monitor error rate during recovery
      kubectl logs -f deployment/clinical-api -n production | \
        grep -i "error\|exception" | head

  STEP 5: GRADUAL SCALE-UP (3 minutes)
    
    Avoid overloading recovering services:
    
    kubectl scale deployment clinical-api --replicas=1 -n production
    Sleep 30 seconds, monitor errors
    
    kubectl scale deployment clinical-api --replicas=2 -n production
    Sleep 30 seconds, monitor errors
    
    kubectl scale deployment clinical-api --replicas=3 -n production
    Verify: kubectl get pods -n production

================================================================================
3. SECURITY BREACH SCENARIO
================================================================================

3.1 SCENARIO: SUSPECTED SECURITY BREACH
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Alert: Unusual login attempts from unexpected IP
  • Alert: Rate limiting triggered for user account
  • Alert: Suspicious database queries detected
  • Alert: API keys or secrets exposed in public repo

RTO/RPO TARGET:
  RTO: 30 minutes (contain breach + notify)
  RPO: 0 minutes (detect immediately)

RECOVERY STEPS:

  STEP 1: IMMEDIATE CONTAINMENT (5 minutes)
    
    Task 1.1: Identify breach scope
      Question: What is suspected compromised?
        A) User account
        B) API key / service account
        C) Database credentials
        D) Multiple / unclear
    
    Task 1.2: If user account compromised
      
      Step A: Force password reset
        UPDATE users SET password_reset_required = true
        WHERE id = 'compromised_user_id';
      
      Step B: Invalidate all sessions
        DELETE FROM sessions WHERE user_id = 'compromised_user_id';
      
      Step C: Block user temporarily
        UPDATE users SET status = 'SUSPENDED'
        WHERE id = 'compromised_user_id';
      
      Step D: Review user activity
        SELECT * FROM audit_logs
        WHERE user_id = 'compromised_user_id'
        ORDER BY created_at DESC LIMIT 100;

    Task 1.3: If API key compromised
      
      Step A: Revoke compromised key immediately
        UPDATE api_keys SET status = 'REVOKED'
        WHERE key = 'compromised_key';
      
      Step B: Rotate key (generate new)
        INSERT INTO api_keys (key, user_id, created_at)
        VALUES (uuid_generate_v4(), 'service_account_id', NOW());
      
      Step C: Audit key usage
        SELECT * FROM api_audit_logs
        WHERE api_key = 'compromised_key'
        ORDER BY created_at DESC LIMIT 100;

    Task 1.4: If database credentials compromised
      
      Step A: Revoke compromised user
        DROP ROLE compromised_user;
      
      Step B: Create new database user
        CREATE ROLE app_user WITH PASSWORD 'strong_random_password';
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
      
      Step C: Update application config
        Update secrets manager with new credentials
        Restart application pods to pick up new credentials
      
      Step D: Monitor database for suspicious queries
        GRANT pg_monitor TO security_role;
        SELECT * FROM pg_log WHERE query LIKE '%DROP%' OR query LIKE '%DELETE%';

  STEP 2: INVESTIGATION (10 minutes)
    
    Task 2.1: Gather evidence
      
      Collect from audit logs:
      SELECT * FROM audit_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      AND (
        action = 'UNAUTHORIZED_ACCESS'
        OR user_id = 'compromised_user_id'
        OR ip_address = 'suspicious_ip'
      );
      
      Export for forensics:
      SELECT * FROM audit_logs WHERE ... \
        INTO OUTFILE '/forensics/audit_logs_export.csv';

    Task 2.2: Determine what data accessed/modified
      
      Query affected tables:
      SELECT table_name, action_type, COUNT(*)
      FROM audit_logs
      WHERE user_id = 'compromised_user_id'
      GROUP BY table_name, action_type;

    Task 2.3: Identify timeline of breach
      
      When did compromise occur?
      SELECT MIN(created_at) as breach_start
      FROM audit_logs
      WHERE unusual_activity = true;

  STEP 3: BREACH NOTIFICATION (5 minutes)
    
    REGULATORY REQUIREMENTS:
      HIPAA: Notify affected individuals + HHS (if >500 affected)
      GDPR: Notify DPA within 72 hours + affected individuals
      CCPA: Notify affected individuals

    Task 3.1: Notify internal team
      Slack: @security "🚨 SECURITY INCIDENT: Suspected breach. Details in #incident-response"
      
      Create incident in Jira/ticketing system
      Assign severity: CRITICAL

    Task 3.2: Prepare breach notification
      
      Template:
      "On [DATE], we became aware of a security incident affecting [DESCRIPTION].
       We have taken the following steps:
       1. [CONTAINMENT ACTION]
       2. [INVESTIGATION ACTION]
       3. [REMEDIATION ACTION]
       
       If you have questions, contact: security@clinical-system.com"

    Task 3.3: Notify compliance officer
      Email: Chief Compliance Officer
      Subject: URGENT: Potential data breach notification
      Attach: Incident timeline, affected individuals, containment steps

  STEP 4: ERADICATION & RECOVERY (10 minutes)
    
    Task 4.1: Remove attacker access
      ☐ Revoke all compromised credentials
      ☐ Disable compromised user accounts
      ☐ Close any back doors
      ☐ Remove any malicious code

    Task 4.2: Patch vulnerability
      ☐ If due to known CVE: Apply patch
      ☐ If due to configuration: Fix configuration
      ☐ If due to code: Deploy code fix
      ☐ Test fix in staging first

    Task 4.3: Monitor for re-compromise
      ☐ Increase logging/monitoring
      ☐ Watch for same IP, same patterns
      ☐ Set alerts for suspicious activity

  STEP 5: POST-INCIDENT (within 24 hours)
    
    Task 5.1: Document incident
      ☐ Timeline of events
      ☐ Root cause
      ☐ Impact assessment
      ☐ Containment steps taken
      ☐ Prevention measures

    Task 5.2: Post-incident review
      ☐ Schedule for 24-48 hours after incident
      ☐ Attendees: Tech lead, security, ops, product
      ☐ Output: Process improvements + action items

    Task 5.3: Regulatory filings
      ☐ Prepare breach notification letter
      ☐ File with authorities if required
      ☐ Update privacy policy if needed

================================================================================
4. DEPLOYMENT FAILURE SCENARIO
================================================================================

4.1 SCENARIO: BAD DEPLOYMENT BREAKS PRODUCTION
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Alert: New deployment causes 500 errors
  • Error: "undefined function" or similar in app logs
  • Monitoring: Error rate increases to >5%
  • Users report: Cannot access certain features

RTO/RPO TARGET:
  RTO: 5 minutes (rollback + verify)
  RPO: 0 minutes (no data loss)

RECOVERY STEPS:

  STEP 1: DETECT PROBLEM (1 minute)
    
    Post-deployment monitoring:
    ✓ Wait 2 minutes after deployment before declaring success
    ✓ Watch error rate: Alert if > 1% increase
    ✓ Watch latency: Alert if p99 > 500ms increase
    ✓ Watch pod restarts: Alert if > 2 restarts

    If detected:
      kubectl get pods -n production -l app=clinical-api \
        -w --sort-by=.metadata.creationTimestamp

  STEP 2: IMMEDIATE ROLLBACK (2 minutes)
    
    Task 2.1: Identify previous working version
      kubectl rollout history deployment/clinical-api -n production
      
      Example output:
      REVISION  CHANGE-CAUSE
      3         deployment-cli set image
      2         deployment-cli set image
      1         initial-deployment

    Task 2.2: Rollback to previous version
      kubectl rollout undo deployment/clinical-api -n production
      
      Verify rollback:
      kubectl rollout status deployment/clinical-api -n production

    Task 2.3: Monitor error rate
      kubectl logs -f deployment/clinical-api -n production | \
        grep -c "ERROR\|EXCEPTION"
      
      Error rate should drop immediately

  STEP 3: VALIDATE RECOVERY (2 minutes)
    
    Task 3.1: Test critical endpoints
      curl https://api.clinical-system.com/api/v1/patients?limit=1
      curl https://api.clinical-system.com/api/v1/appointments?limit=1
      curl https://api.clinical-system.com/api/v1/consultations?limit=1
      
      All should return 200 OK

    Task 3.2: Check error rate in monitoring
      Error rate should return to < 0.1%
      Latency should return to baseline

  STEP 4: INVESTIGATE (5 minutes, after service recovered)
    
    Task 4.1: Compare deployments
      git diff [previous-commit]..HEAD
      
      Look for:
      ☐ Database schema changes (need migration)
      ☐ Environment variable changes (not set)
      ☐ Dependency updates (breaking change)
      ☐ Missing feature flags

    Task 4.2: Run in staging first
      git checkout HEAD
      Make fix if needed
      Test in staging environment thoroughly
      Then redeploy to production

  POST-RECOVERY:
    ☐ Review deployment process
    ☐ Add automated tests to catch issue
    ☐ Improve pre-deployment verification
    ☐ Document lesson learned

================================================================================
5. DISK SPACE EXHAUSTION
================================================================================

5.1 SCENARIO: DISK SPACE NEARLY FULL
──────────────────────────────────────────────────────────────────────────────

SYMPTOMS:
  • Alert: "Disk usage > 90%"
  • Error: "No space left on device"
  • Log writing fails
  • Database queries slow

RTO/RPO TARGET:
  RTO: 1 hour (clear space + resume operations)
  RPO: 0 minutes (no data loss)

RECOVERY STEPS:

  STEP 1: IDENTIFY SPACE USAGE (2 minutes)
    
    Task 1.1: Check disk usage
      df -h /
      
      Example output:
      Filesystem      Size  Used Avail Use% Mounted on
      /dev/sda1        20G   19G  1.0G  95% /

    Task 1.2: Find large files/directories
      du -sh /* | sort -rh | head -10
      
      Identify culprit directories

  STEP 2: FREE UP SPACE (5 minutes)
    
    Priority 1 - Clear logs (safest):
      # Logs auto-rotate but old ones may linger
      
      Kubernetes logs:
      kubectl delete pods -n production -l app=clinical-api --grace-period=0
      # New pods will restart, old logs deleted
      
      Application logs:
      rm -f /var/log/app/*.log.[0-9]*
      find /var/log -name "*.gz" -mtime +30 -delete  # Logs > 30 days old
      
      Database logs:
      SELECT pg_database_size('clinical_db');  # Check DB size
      VACUUM ANALYZE;  # Reclaim unused space

    Priority 2 - Clear temporary files:
      rm -rf /tmp/*
      rm -rf /var/tmp/*

    Priority 3 - Clear cache:
      # If using Redis
      redis-cli FLUSHALL  # WARNING: Clears all cache
      # Better: redis-cli --scan --pattern '*' | xargs redis-cli DEL
      
      # If using memcached
      echo "flush_all" | nc localhost 11211

    Priority 4 - Scale down temporarily:
      kubectl scale deployment clinical-api --replicas=1 -n production
      # Reduces memory usage, logs
      # Scale back up once space freed

  STEP 3: VERIFY RECOVERY (1 minute)
    
    Task 3.1: Check disk usage
      df -h /
      # Should show > 30% free space now

    Task 3.2: Verify services running
      kubectl get pods -n production
      # Should all be Running

  STEP 4: PREVENT RECURRENCE (within 24 hours)
    
    Task 4.1: Increase disk size
      # AWS: Increase EBS volume size
      aws ec2 create-volume --availability-zone us-east-1a --size 50
      # Azure: Increase managed disk size
      # GCP: Increase persistent disk size

    Task 4.2: Configure log rotation
      /etc/logrotate.d/clinical-app:
      /var/log/app/*.log {
        daily
        missingok
        rotate 7
        compress
        delaycompress
      }

    Task 4.3: Set up monitoring alerts
      Alert if disk > 80% (MEDIUM)
      Alert if disk > 90% (HIGH)
      Alert if disk > 95% (CRITICAL)

================================================================================
6. TESTING & MAINTENANCE
================================================================================

6.1 DISASTER RECOVERY TESTING
──────────────────────────────────────────────────────────────────────────────

SCHEDULE:
  Quarterly (every 3 months): Full disaster recovery drill
  Monthly (every month): Database backup restoration test
  Weekly (every Monday): Automated backup verification

TESTING PROCEDURE:

  Test 1: Database Recovery
    ☐ Take database backup
    ☐ Restore to test environment
    ☐ Verify data integrity
    ☐ Document time taken

  Test 2: Service Recovery
    ☐ Simulate service failure (kill pods)
    ☐ Verify auto-restart works
    ☐ Verify health checks pass
    ☐ Document time taken

  Test 3: Full Failover
    ☐ Fail over to standby region/datacenter (if applicable)
    ☐ Verify all services come online
    ☐ Verify data integrity
    ☐ Verify no data loss
    ☐ Document time taken

DOCUMENT RESULTS:
  ☐ Actual RTO achieved (vs target)
  ☐ Actual RPO achieved (vs target)
  ☐ Any issues encountered
  ☐ Improvements needed
  ☐ Runbook updates needed

6.2 RUNBOOK MAINTENANCE
──────────────────────────────────────────────────────────────────────────────

REVIEW SCHEDULE:
  • After any incident (immediately)
  • Quarterly (every 3 months)
  • After major infrastructure changes
  • After successful DR tests

UPDATES NEEDED FOR:
  ☐ New services added to system
  ☐ Infrastructure changes (new servers, regions)
  ☐ Tool changes (new monitoring, backup tools)
  ☐ Lessons learned from incidents
  ☐ Improvements discovered in testing

================================================================================
7. CONTACT INFORMATION & ESCALATION
================================================================================

ON-CALL TEAM:
  On-Call Engineer: [NAME] - [PHONE] - [EMAIL]
  Tech Lead: [NAME] - [PHONE] - [EMAIL]
  Security Lead: [NAME] - [PHONE] - [EMAIL]
  Database Admin: [NAME] - [PHONE] - [EMAIL]

ESCALATION PATH:
  1. On-Call Engineer handles initial response
  2. If uncertain, escalate to Tech Lead
  3. If security-related, involve Security Lead
  4. If database-related, involve Database Admin
  5. If business-critical, loop in VP Engineering
  6. If HIPAA-related, loop in Compliance Officer

EXTERNAL CONTACTS:
  AWS Support: [PHONE] - [EMAIL]
  Database Vendor: [PHONE] - [EMAIL]
  Insurance Provider (notifications): [PHONE]
  Legal Team (breach notification): [PHONE]

COMMUNICATION CHANNELS:
  Incident: #incident-response (Slack)
  Updates: @oncall (Slack mention)
  Status: status.clinical-system.com (public status page)

================================================================================
END OF DISASTER RECOVERY RUNBOOKS
================================================================================
