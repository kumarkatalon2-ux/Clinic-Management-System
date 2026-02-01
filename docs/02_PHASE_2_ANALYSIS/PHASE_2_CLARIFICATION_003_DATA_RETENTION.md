================================================================================
PHASE 2 CLARIFICATION #3: PATIENT DATA RETENTION & DELETION POLICY
================================================================================
Date: February 3, 2026
Status: Clarification Complete
Priority: HIGH (affects compliance and data governance)
Related Tasks: 34_audit_logging.txt, 35_privacy_gdpr.txt, 04_database_schema_design.txt

================================================================================
EXECUTIVE SUMMARY
================================================================================

This document clarifies data retention tiers, retention periods, deletion
procedures, and handling of data after the HIPAA 7-year retention period.

KEY DECISION:
→ Tier 1 (Active): Years 0-7 - Full patient data in production
→ Tier 2 (Archive): Years 7-10 - Anonymized/depersonalized data in cold storage
→ Tier 3 (Post-Compliance): Year 10+ - Complete deletion or indefinite retention
→ Audit Trail: Kept separately for 7 years minimum

COMPLIANCE BASIS:
  • HIPAA: 6 years minimum (we use 7 for safety margin)
  • GDPR: Right to erasure after consent withdrawal
  • CCPA: Right to deletion on request
  • State-specific: Some states require longer retention
  • Tax/Legal: Billing records may need 7+ years

================================================================================
QUESTION 1: WHAT DATA MUST BE RETAINED?
================================================================================

ANSWER: All patient health information and billing records (7 years minimum)

Retention Periods by Data Type:

MEDICAL RECORDS:
  ├─ Patient demographics (name, DOB, address, phone)
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1)
  │  └─ After: ANONYMIZE
  │
  ├─ Consultation notes
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1)
  │  └─ After: ANONYMIZE or DELETE
  │
  ├─ Prescription records
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1)
  │  └─ After: ANONYMIZE or DELETE
  │
  ├─ Diagnostic test results
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1)
  │  └─ After: ANONYMIZE or DELETE
  │
  ├─ Lab test results
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1)
  │  └─ After: ANONYMIZE or DELETE
  │
  └─ Clinical attachments (medical images, PDFs)
     └─ Retention: 7 years
     └─ Status: ACTIVE (Tier 1)
     └─ After: ANONYMIZE or DELETE

BILLING RECORDS:
  ├─ Invoices
  │  └─ Retention: 7-10 years (tax requirements)
  │  └─ Status: ACTIVE (Tier 1) for 7 years
  │  └─ Status: ARCHIVE (Tier 2) for years 7-10
  │  └─ After: DELETE or KEEP indefinitely
  │
  ├─ Payments
  │  └─ Retention: 7-10 years
  │  └─ Status: ACTIVE (Tier 1) for 7 years
  │  └─ Status: ARCHIVE (Tier 2) for years 7-10
  │
  ├─ Insurance claims
  │  └─ Retention: 7-10 years
  │  └─ Status: ACTIVE (Tier 1) for 7 years
  │  └─ Status: ARCHIVE (Tier 2) for years 7-10
  │
  └─ Refunds
     └─ Retention: 7-10 years

AUDIT & COMPLIANCE:
  ├─ Access logs (who viewed what data)
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1) for 7 years
  │  └─ Status: ARCHIVE (Tier 2) for indefinite (compliance)
  │
  ├─ Change logs (data modifications)
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1) for 7 years
  │  └─ Status: ARCHIVE (Tier 2) for indefinite
  │
  ├─ Deletion logs
  │  └─ Retention: 7 years
  │  └─ Status: ACTIVE (Tier 1) for 7 years
  │  └─ Status: ARCHIVE (Tier 2) for indefinite (proof of compliance)
  │
  └─ Consent records
     └─ Retention: Indefinite (proof of consent)

NOT RETAINED:
  • Temporary session tokens (expire after 15 min)
  • Cached data (refreshed as needed)
  • User search queries (not stored)
  • System logs > 1 year old (except audit trail)

================================================================================
QUESTION 2: DATA RETENTION TIERS (DETAILED)
================================================================================

ANSWER: Three-tier retention strategy

TIER 1 - ACTIVE DATA (Years 0-7)
═════════════════════════════════════════════════════════════════════════════

Definition:
  • Currently retained patient and clinical data
  • Immediately available for clinical use
  • Required for ongoing care and operations
  • Fully accessible to authorized users
  • Subject to regular backups and disaster recovery

Storage:
  • Location: Production PostgreSQL database (AWS RDS)
  • Replication: Multi-AZ (automatic failover)
  • Backup: Daily snapshots, 30-day retention
  • Access: Real-time (sub-200ms queries)
  • Performance: Optimized for frequent access

Data Included in Tier 1:
  ├─ Patients (all active patients, plus 7 years of historical)
  ├─ Consultations (all records)
  ├─ Prescriptions (all records)
  ├─ Diagnoses (all records)
  ├─ Test results (all records)
  ├─ Clinical notes (all records)
  ├─ Appointments (all records)
  ├─ Invoices (all records)
  ├─ Payments (all records)
  ├─ Insurance claims (all records)
  ├─ Audit logs (access and change logs)
  ├─ User accounts (admin and provider)
  └─ Configuration (clinic settings)

Access Controls:
  • Full RBAC enforcement
  • Row-level security (by tenant)
  • Column-level encryption for PII (AES-256)
  • All access logged and audited
  • Real-time alerting for sensitive access

Lifecycle:
  • Day 0: Data created in production
  • Day 0-30: Full backup copies kept
  • Day 30-365: Backup rotation
  • Day 365-2555 (7 years): Continued retention
  • Day 2555: Ready for archival to Tier 2

Cost Implications:
  • High operational cost
  • Hot storage (SSD-backed)
  • Real-time access
  • Highest availability tier
  • Estimated: $$$$ per TB per month

─────────────────────────────────────────────────────────────────────────────

TIER 2 - ARCHIVE DATA (Years 7-10)
═════════════════════════════════════════════════════════════════════════════

Definition:
  • Data older than 7 years
  • No longer needed for routine clinical use
  • Required for compliance, audit, legal holds
  • Anonymized or depersonalized
  • Infrequently accessed (on-demand retrieval)

Storage:
  • Location: AWS S3 Glacier (cold storage)
  • Format: Compressed archive (GZIP, 70% space reduction)
  • Encryption: S3 server-side encryption (AES-256)
  • Access: Delayed retrieval (1-3 hours wait time)
  • Performance: NOT optimized for frequent access

Data Included in Tier 2:
  ├─ Anonymized patient records
  │  └─ Name, DOB, SSN removed
  │  └─ Patient ID: YES (for linking)
  │  └─ Age, gender: YES (demographic analysis)
  │  └─ Address: NO (location privacy)
  ├─ De-identified consultations
  │  └─ Diagnosis codes: YES (ICD-10)
  │  └─ Procedure codes: YES (CPT)
  │  └─ Clinical narrative: NO (free text removed)
  ├─ Billing summaries (not detailed line items)
  │  └─ Invoice totals: YES
  │  └─ Payment amounts: YES
  │  └─ Patient name: NO
  ├─ Audit logs (all access records)
  │  └─ User: YES
  │  └─ Action: YES
  │  └─ Timestamp: YES
  │  └─ Data accessed: NO
  └─ Consent records (proof of consent)

Anonymization Process:
  Steps:
    1. Identify records older than 7 years
    2. Export to temporary storage
    3. Remove PII fields:
       - First name, last name, middle name → REMOVE
       - Social Security number → REMOVE
       - Phone number → REMOVE
       - Email address → REMOVE
       - Street address → REMOVE
       - City, state, zip → REMOVE (keep region at state level)
       - Insurance member ID → REMOVE
       - Account numbers → REMOVE
    4. Keep:
       - Patient ID (for linking)
       - Demographics (age, gender, race - anonymous)
       - Diagnoses (ICD-10 codes)
       - Procedures (CPT codes)
       - Dates (for timing analysis)
       - Outcome data
    5. Compress and encrypt
    6. Upload to Glacier
    7. Delete from production database
    8. Create archive index (for recovery)
    9. Audit log: "Patient data archived on [DATE]"

Retention in Tier 2:
  • Duration: Years 7-10 (approximately)
  • After: Decision point (see Tier 3)

Access Controls:
  • Limited to compliance/audit team
  • Requires specific justification
  • Multi-level approval workflow
  • 24-48 hour retrieval wait
  • All retrieval logged and audited
  • Cannot be modified or edited

Compliance Usage:
  • HIPAA audit response
  • GDPR data deletion verification
  • Legal holds
  • Research (after anonymization)
  • Statistical analysis (aggregated only)

Cost Implications:
  • Low operational cost
  • Cold storage (Glacier, ~$1/TB/month)
  • Retrieval costs (~$50/TB)
  • 90% space savings vs Tier 1
  • Estimated: $$ per TB per month

─────────────────────────────────────────────────────────────────────────────

TIER 3 - POST-COMPLIANCE DATA (Year 10+)
═════════════════════════════════════════════════════════════════════════════

Definition:
  • Data older than 10 years
  • No longer required for compliance
  • Decision point for further retention
  • Two options: DELETE or KEEP INDEFINITELY

Option A: DELETE (Recommended)
  
  After 10 years, data is deleted permanently:
    • Records removed from Tier 2 archive
    • All backups purged
    • S3 objects deleted
    • No recovery possible
    • Audit log: "Patient data permanently deleted on [DATE]"
  
  When to use:
    • Normal retention policy
    • No legal holds or ongoing litigation
    • No research or statistical needs
    • Patient hasn't requested indefinite retention
  
  Process:
    1. Identify records older than 10 years
    2. Generate deletion report
    3. Legal review (check for holds)
    4. Final audit entry: "Deletion approved by [NAME] on [DATE]"
    5. Delete from Tier 2 archive
    6. Verify deletion (spot checks)
    7. Confirm in deletion log

Option B: KEEP INDEFINITELY (Archive)
  
  After 10 years, data is kept for:
    • Research and statistical analysis
    • Long-term outcome tracking
    • Population health studies
    • Regulatory requirements (state-specific)
  
  When to use:
    • Research database maintained
    • Population health analytics required
    • State law requires indefinite retention
    • Aggregate data only (anonymized)
  
  Storage:
    • Location: AWS S3 Glacier Deep Archive (cheapest tier)
    • Cost: ~$0.20/TB/month
    • Retrieval: 12-48 hours (acceptable for analytics)
    • Retention: Indefinite

  Access:
    • Analytics team only
    • Aggregated queries only (no patient-level access)
    • HIPAA business associate agreement required
    • Annual compliance audit

Legal Holds:
  
  Special cases where deletion is NOT allowed:
    • Active litigation involving patient
    • Regulatory investigation
    • Dispute resolution pending
    • Patient appeal in progress
  
  Process:
    1. System identifies legal hold
    2. Records NOT deleted (moved to hold status)
    3. Legal hold reason documented
    4. Data retained until hold cleared
    5. Audit trail: "Legal hold in place, deletion deferred"
    6. Annual review of active holds
    7. Delete when hold cleared (after 10 years from hold lift)

Database Implementation:

Table: patient_retention (tracks lifecycle)
  ├─ patient_id: UUID
  ├─ created_date: DATE
  ├─ last_activity_date: DATE
  ├─ retention_tier: ENUM ('ACTIVE', 'ARCHIVE', 'DELETED', 'HOLD')
  ├─ archived_date: DATE (when moved to Tier 2)
  ├─ deleted_date: DATE (when purged)
  ├─ archive_location: TEXT (S3 path)
  ├─ legal_hold: BOOLEAN
  ├─ legal_hold_reason: TEXT
  ├─ legal_hold_expiration: DATE
  └─ last_reviewed: DATE

Queries:
  // Find data ready for archival
  SELECT * FROM patient_retention
  WHERE retention_tier = 'ACTIVE'
  AND last_activity_date < NOW() - INTERVAL '7 years';
  
  // Find data ready for deletion
  SELECT * FROM patient_retention
  WHERE retention_tier = 'ARCHIVE'
  AND archived_date < NOW() - INTERVAL '10 years'
  AND legal_hold = false;

================================================================================
QUESTION 3: AUTOMATIC vs MANUAL RETENTION PROCESSES
================================================================================

ANSWER: Hybrid approach - Automatic detection, manual approval for deletion

Automatic Archival (Tier 1 → Tier 2):

  Trigger: Every night at 2 AM UTC
    1. Query: Records with last_activity > 7 years ago
    2. Count: How many records ready for archival
    3. Batch: Group into 1GB chunks (for processing)
    4. For each batch:
       → Anonymize (remove PII)
       → Compress (GZIP)
       → Encrypt (AES-256)
       → Upload to S3 Glacier
       → Create archive manifest
       → Audit log entry
    5. After successful upload:
       → Delete from production database
       → Update retention_tier = 'ARCHIVE'
       → Delete backup copies (except 1 copy for recovery)
    6. Report generated (email to compliance team)

Configuration:
  ├─ ENABLE_AUTO_ARCHIVAL: true/false
  ├─ ARCHIVAL_THRESHOLD_DAYS: 2555 (7 years)
  ├─ BATCH_SIZE: 1GB
  ├─ ARCHIVAL_TIME: 02:00 UTC
  └─ RETRY_ON_FAILURE: true (retry next night)

Manual Archival (if auto-archival fails):

  Process:
    1. Compliance team identifies records to archive
    2. Reviews retention policy
    3. Initiates manual archival via admin console
    4. System prepares archival package
    5. Approval required before upload
    6. Manual upload to S3 Glacier
    7. Verification checks
    8. Audit log entry

Manual Deletion (Tier 2 → Tier 3):

  Process:
    1. Query identifies records ready for deletion (10+ years old)
    2. System generates deletion report:
       ├─ How many records?
       ├─ Which patients?
       ├─ Any legal holds?
       ├─ Audit trail
       └─ Estimated data recovery cost
    3. Report sent to compliance officer
    4. Compliance officer reviews:
       ├─ Check for legal holds
       ├─ Verify no active disputes
       ├─ Confirm retention policy allows deletion
       ├─ Check for research needs
    5. Compliance officer approves or denies deletion
    6. If approved:
       → Final backup taken (for recovery if needed)
       → Final audit log entry
       → Deletion initiated
       → S3 objects deleted
       → Tier 2 archive records marked DELETED
       → Deletion timestamp recorded
    7. If denied:
       → Retention reason documented
       → Data kept (moved to indefinite retention)
       → Annual review scheduled

Configuration:
  ├─ ENABLE_AUTO_DELETION: true/false
  ├─ DELETION_THRESHOLD_DAYS: 3650+ (10 years)
  ├─ REQUIRE_APPROVAL: true (always require approval)
  ├─ RETENTION_POLICY: ENUM ('DELETE', 'KEEP')
  └─ DELETION_TIME: 03:00 UTC

================================================================================
QUESTION 4: GDPR RIGHT TO DELETION
================================================================================

ANSWER: Immediate deletion on request, with compliance documentation

GDPR Right to Erasure ("Right to be Forgotten"):

When Patient Requests Deletion:
  
  Patient initiates deletion request:
    1. Via patient portal or email
    2. Request includes:
       ├─ Patient name
       ├─ Date of birth
       ├─ Confirmation of identity
       └─ Reason (optional)
  
  System processes request:
    1. Verify patient identity (security check)
    2. Check for active legal holds or pending disputes
    3. Check for ongoing care (if patient still active)
    4. If ongoing care:
       → Error: Cannot delete (patient still receiving care)
       → Allow deletion only after final appointment/discharge
    5. If no blocks:
       → Initiate deletion workflow
       → Create deletion request record
       → Notify compliance team
  
  Compliance review:
    1. Compliance officer reviews request
    2. Checks for:
       ├─ Legal holds
       ├─ Tax requirements (billing records)
       ├─ Regulatory requirements
       ├─ Active lawsuits
    3. Approves or denies request
    4. If approved:
       → Patient receives confirmation
       → Deletion timeline provided (14-30 days)
       → Data marked for deletion
    5. If denied:
       → Patient receives explanation
       → Right to appeal

Deletion Timeline:

  T+0: Deletion request received
  T+1d: Identity verification complete
  T+2d: Legal/compliance review complete
  T+7d: Final review and approval
  T+14d: Deletion executed
  T+15d: Confirmation sent to patient

Data Deleted (when GDPR request approved):

  • All patient personal data removed
  • All medical records deleted
  • All billing records deleted
  • All contact information deleted
  • All demographic data deleted
  • BUT: Audit logs kept (7 years, for compliance)
  • BUT: Anonymized records kept (if research opted in)

Data NOT Deleted (legal requirement):

  • Audit trail (who accessed what, when)
  • Deletion logs (proof of deletion)
  • Billing records (tax requirement, 7 years)
  • Consent records (proof of consent/deletion request)

CCPA Right to Deletion:

Similar to GDPR but with exceptions:
  • Businesses can retain data for:
    ├─ Tax records (7 years)
    ├─ Account security
    ├─ Product improvement
    ├─ Internal analytics
  • Consumer must be notified within 45 days
  • Similar compliance workflow

Database Implementation:

Table: deletion_requests
  ├─ id: UUID
  ├─ patient_id: UUID
  ├─ request_date: TIMESTAMP
  ├─ request_type: ENUM ('GDPR', 'CCPA', 'HIPAA', 'MANUAL')
  ├─ status: ENUM ('PENDING', 'APPROVED', 'DENIED', 'COMPLETED')
  ├─ reason: TEXT
  ├─ approved_by: UUID (compliance officer)
  ├─ approval_date: TIMESTAMP
  ├─ deletion_date: TIMESTAMP
  └─ notes: TEXT

Table: deletion_logs
  ├─ id: UUID
  ├─ patient_id: UUID
  ├─ deletion_type: TEXT (e.g., "GDPR deletion")
  ├─ records_deleted: INT (count)
  ├─ deleted_date: TIMESTAMP
  ├─ deleted_by: UUID (system)
  ├─ approval_reference: UUID (deletion_requests.id)
  └─ verification_hash: VARCHAR (data integrity check)

================================================================================
QUESTION 5: CCPA RIGHT TO KNOW
================================================================================

ANSWER: Patient can request all data held about them

CCPA Right to Know:

When Patient Requests Data:
  
  Patient initiates data request:
    1. Via patient portal: "Download my data"
    2. System verifies identity
    3. Data compiled and prepared
    4. Patient notified (email)
    5. Patient downloads (encrypted link)
  
  What's included:
    ├─ Personal information (name, contact, demographics)
    ├─ Health records (consultations, prescriptions, tests)
    ├─ Billing records (invoices, payments)
    ├─ Usage data (if tracked)
    ├─ Communication history (emails, messages)
    └─ Access logs (who viewed patient data when)
  
  Format:
    • PDF export (human-readable)
    • CSV export (data files)
    • FHIR export (standards-based)
    • Encrypted download link (24-hour expiration)

Implementation:

API Endpoint:
  POST /api/v1/patients/{id}/export-data
  Response: Download link with encrypted data

Privacy:
  • Links expire after 24 hours
  • Download tracked and logged
  • Email sent to patient (verification)
  • Audit log entry created

================================================================================
QUESTION 6: AUDIT TRAIL FOR RETENTION COMPLIANCE
================================================================================

ANSWER: Complete audit trail of all retention actions

What Gets Logged:

  1. Data Creation
     ├─ Patient created on [DATE]
     ├─ Created by [PROVIDER]
     └─ Timestamp: [ISO-8601]
  
  2. Data Access
     ├─ User: [ID]
     ├─ Action: VIEW, EDIT, DELETE
     ├─ Timestamp: [ISO-8601]
     ├─ Records accessed: [IDs]
     └─ Reason: [Clinical care, compliance, etc.]
  
  3. Data Modification
     ├─ Modified by: [PROVIDER]
     ├─ Change: "Diagnosis changed from X to Y"
     ├─ Before value: [X]
     ├─ After value: [Y]
     ├─ Timestamp: [ISO-8601]
     └─ Reason: [Test results show X is incorrect]
  
  4. Data Archival
     ├─ Archived on: [DATE]
     ├─ Records: [COUNT]
     ├─ Archived to: [S3 path]
     ├─ Anonymization: [YES/NO]
     ├─ Encrypted: [AES-256]
     └─ Verification: [HASH]
  
  5. Data Deletion
     ├─ Deleted on: [DATE]
     ├─ Records: [COUNT]
     ├─ Deleted by: [SYSTEM/USER]
     ├─ Deletion reason: [GDPR, CCPA, Retention policy]
     ├─ Approval reference: [DELETION_REQUEST_ID]
     └─ Verification: [HASH before/after]
  
  6. Export/Download
     ├─ Patient: [ID]
     ├─ Exported by: [USER]
     ├─ Export type: [PDF, CSV, FHIR]
     ├─ Records: [COUNT]
     ├─ Download link sent: [DATE]
     ├─ Downloaded: [DATE/TIME]
     ├─ IP address: [XXX.XXX.XXX.XXX]
     └─ Encrypted: [YES]

Retention of Audit Logs:

  • Duration: 7 years minimum (HIPAA requirement)
  • Storage: Separate from clinical data
  • Status: ACTIVE (Tier 1) for 7 years
  • After 7 years: Can be archived (Tier 2) indefinitely
  • Cannot be deleted for first 7 years
  • After 7 years: Can be deleted per retention policy

================================================================================
IMPLEMENTATION CHECKLIST
================================================================================

Database Schema:

  [ ] Create table: patient_retention (lifecycle tracking)
  [ ] Create table: deletion_requests (GDPR/CCPA requests)
  [ ] Create table: deletion_logs (audit trail of deletions)
  [ ] Create table: archival_logs (audit trail of archival)
  [ ] Add column to patients: retention_tier (ACTIVE, ARCHIVE, DELETED, HOLD)
  [ ] Add column to patients: archived_date (when archived)
  [ ] Add column to patients: legal_hold (boolean)
  [ ] Add column to patients: legal_hold_reason (text)
  [ ] Add index: patient_retention (last_activity_date)
  [ ] Add index: deletion_requests (status, request_date)

Archival Process:

  [ ] Build anonymization logic (remove PII fields)
  [ ] Build compression logic (GZIP)
  [ ] Build encryption logic (AES-256)
  [ ] Integration with S3 Glacier
  [ ] Automated nightly job (archival)
  [ ] Error handling and retry logic
  [ ] Archive manifest/index
  [ ] Backup verification

Deletion Process:

  [ ] Build deletion verification
  [ ] Manual approval workflow
  [ ] Final backup before deletion
  [ ] S3 object deletion
  [ ] Audit trail entries
  [ ] Deletion confirmation emails
  [ ] Compliance reporting

GDPR/CCPA Support:

  [ ] Deletion request form
  [ ] Identity verification
  [ ] Compliance review workflow
  [ ] Automated timeline tracking
  [ ] Patient notification system
  [ ] Data export functionality
  [ ] Encrypted download links
  [ ] Deletion confirmation

Reporting:

  [ ] Archival report (monthly)
  [ ] Deletion report (monthly)
  [ ] Retention compliance report (annual)
  [ ] Data export report (requests and completions)
  [ ] Legal hold report (active holds)
  [ ] GDPR/CCPA compliance report

Testing:

  [ ] Test archival process (functionality)
  [ ] Test anonymization (PII removed)
  [ ] Test deletion (irreversible)
  [ ] Test GDPR deletion requests
  [ ] Test CCPA data export
  [ ] Test legal holds (data not deleted)
  [ ] Test audit trails (complete logging)
  [ ] Test retrieval from Tier 2 archive

================================================================================
CONCLUSION
================================================================================

KEY TAKEAWAYS:

✓ Tier 1 (Active): Years 0-7, hot storage, full access
✓ Tier 2 (Archive): Years 7-10, cold storage, anonymized
✓ Tier 3 (Post-Compliance): Year 10+, delete or keep indefinitely
✓ Automatic archival (Tier 1 → Tier 2) nightly
✓ Manual deletion approval (Tier 2 → Tier 3)
✓ GDPR/CCPA requests handled with compliance workflow
✓ Complete audit trail (7+ years)
✓ Legal holds block deletion when necessary

Data retention policy is well-defined with clear tiers, automatic processes,
manual approval gates, and compliance tracking.

IMPLEMENTATION EFFORT: 18-22 hours
  ├─ Database schema: 3 hours
  ├─ Archival logic: 5 hours
  ├─ Deletion workflow: 5 hours
  ├─ GDPR/CCPA support: 4 hours
  ├─ Testing: 4 hours

================================================================================
END OF CLARIFICATION #3
================================================================================
