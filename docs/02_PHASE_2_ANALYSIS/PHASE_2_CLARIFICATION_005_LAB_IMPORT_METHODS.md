================================================================================
PHASE 2 CLARIFICATION DOCUMENT #5
LAB RESULTS IMPORT METHODS & LABORATORY INTEGRATION
================================================================================

Date Created: February 3, 2026
Ambiguity #5 of 5 (FINAL): Lab results import workflows
Status: COMPLETE - DEVELOPMENT READY
Implementation Effort: 16-20 hours
Related Phase 1 Tasks: 14 (Diagnostic Data Management), 12 (Patient Management)

================================================================================
EXECUTIVE SUMMARY
================================================================================

AMBIGUITY STATEMENT:
  Phase 1 spec (Task 14 - Diagnostic Data Management) states that lab results
  are imported into the patient's medical record. However, the exact import
  methods are not specified. Questions:
  • How are lab results imported (CSV, API, HL7)?
  • What format are import files?
  • How are duplicate results detected?
  • How are results matched to patients?
  • What validation happens?

CLARIFICATION DECISION:
  ✓ PHASE 1: Support TWO import methods (fastest delivery)
    1. Manual CSV upload (simple, common)
    2. HL7 v2.5 file import (healthcare standard)
  
  ✓ PHASE 2: Add laboratory API integration (real-time)
    1. Quest Diagnostics API
    2. LabCorp API
    3. Generic FHIR labs endpoint

  ✓ MVP: CSV + HL7 (covers 85% of use cases)
  ✓ FUTURE: Direct API connections (automated, real-time)

RATIONALE:
  • CSV import: No special infrastructure needed (fastest)
  • HL7 import: Healthcare industry standard (credibility)
  • API integration: Future enhancement (complex integration)
  • Phase 1 scope: Manual methods sufficient for MVP
  • Phase 2 scope: Automation and direct connections
  • Time saved: Focus on core clinical features first
  • Extensibility: Architecture supports future APIs

IMPORT METHOD MATRIX:

  Method              | Phase 1 MVP | Phase 2 Future | Effort | Complexity
  ──────────────────┼─────────────┼────────────────┼────────┼────────────
  CSV Upload         | ✓ YES       | ✓ YES          | 4 hrs  | Low
  HL7 v2.5 Files    | ✓ YES       | ✓ YES          | 6 hrs  | Medium
  Quest API          | ✗ NO        | ✓ YES          | 4 hrs  | High
  LabCorp API        | ✗ NO        | ✓ YES          | 4 hrs  | High
  Generic FHIR       | ✗ NO        | ✓ YES          | 3 hrs  | Medium
  Direct API (Labs)  | ✗ NO        | ✓ YES (phase2b)| 8 hrs  | Very High

RECOMMENDED PATH:
  1. Phase 1: Deploy CSV + HL7 (covers ~85% of scenarios)
  2. Phase 1.5: Monitor user feedback
  3. Phase 2: Add Quest + LabCorp APIs (real-time, ~15% additional)
  4. Phase 2b: Generic FHIR endpoint (future providers)

================================================================================
DETAILED QUESTION-BY-QUESTION ANALYSIS
================================================================================

QUESTION 1: What are the three primary lab import methods?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Lab results can be imported via three methods: CSV (manual), HL7 (standard),
and APIs (future automated). Each serves different scenarios.

METHOD 1: CSV FILE UPLOAD (Phase 1 - Simplest)

  PURPOSE:
    • For labs that don't have API capabilities
    • For one-off result imports
    • For legacy lab systems
    • For manual result entry verification

  PROCESS:
    1. Lab technician exports results as CSV
    2. Clinic staff downloads the CSV file
    3. Staff uploads file via EMR import interface
    4. System validates and imports results
    5. Results appear in patient records
    6. System sends provider notification

  CSV FORMAT (Template):

    patient_id, patient_name, test_name, result_value, result_unit, ...
    MRN12345,   John Smith,   Glucose,  95,            mg/dL,       ...
    MRN12346,   Jane Doe,     Creatinine,0.9,         mg/dL,       ...

    Detailed columns:
      patient_id              (string)    - Internal MRN or external ID
      patient_name            (string)    - Verification field only
      test_date               (date)      - When test performed
      test_name               (string)    - Test description (e.g., "Glucose")
      result_code             (string)    - LOINC code (e.g., 2345-7)
      result_value            (decimal)   - Numeric result
      result_unit             (string)    - Unit (e.g., mg/dL)
      result_normal_range_low (decimal)   - Reference low
      result_normal_range_high(decimal)   - Reference high
      result_flag             (enum)      - H/L/Normal
      abnormal_flag           (string)    - H/L/N (abnormal indicator)
      test_status             (enum)      - Final/Preliminary/Corrected
      ordering_provider       (string)    - Who ordered test
      performing_lab          (string)    - Lab name
      specimen_id             (string)    - For traceability
      notes                   (text)      - Additional info

  ADVANTAGES:
    ✓ No API needed
    ✓ Works with any lab system (even very old)
    ✓ Manual control (review before import)
    ✓ Simple error handling
    ✓ Fastest to implement

  DISADVANTAGES:
    ✗ Manual process (not automated)
    ✗ Error-prone (typos, mismatches)
    ✗ Slow (daily batch vs real-time)
    ✗ Not scalable (high staff labor)

  USE CASES:
    • Small clinics with few lab orders
    • Non-integrated labs (no API)
    • Specialty labs (genetic testing)
    • Historical result imports
    • One-off or urgent result imports

  TYPICAL FREQUENCY:
    Daily import (batch process)
    Or manual when results available

  IMPLEMENTATION EFFORT: 4-6 hours
    • CSV parser: 2 hours
    • Validation logic: 2 hours
    • Error handling: 1 hour
    • Testing: 1 hour

───────────────────────────────────────────────────────────────────────────────

METHOD 2: HL7 v2.5 FILE IMPORT (Phase 1 - Standard)

  PURPOSE:
    • Healthcare industry standard format
    • For labs with HL7 export capability
    • For more reliable integration than CSV
    • For automated file-drop scenarios
    • For EDI clearinghouse-compatible systems

  PROCESS:
    1. Lab system generates HL7 v2.5 file
    2. File transferred to clinic (SFTP, email, API)
    3. EMR system monitors import directory
    4. File detected and validated
    5. HL7 message parsed
    6. Results extracted and imported
    7. Audit log created
    8. Provider notified

  HL7 FORMAT (Sample OBX Segment - Observation Results):

    MSH|^~\&|LABSYSTEM|HOSPITAL|EMR|CLINIC|20260203093000||ORU^R01|MSG001|P|2.5
    PID|||MRN12345||Smith^John||19700101|M
    OBR|1|LAB001|LAB001||2345-7^Glucose^LN|20260203093000
    OBX|1|NM|2345-7^Glucose^LN||95|mg/dL|70-100|N|||F

    Message Structure:
      MSH  = Message header (system info)
      PID  = Patient identification
      OBR  = Order/result headers
      OBX  = Observation/result details (multiple per order)
      NTE  = Notes/comments (optional)

  LOINC CODE EXAMPLES (in OBX segments):
    2345-7  = Glucose
    2951-2  = Sodium
    2823-3  = Potassium
    3094-0  = T3 Uptake
    2348-5  = Glucose tolerance test

  ADVANTAGES:
    ✓ Industry standard (healthcare-wide)
    ✓ More reliable than CSV (structured)
    ✓ Can be automated (file drop/monitoring)
    ✓ Error detection built-in (checksums, segments)
    ✓ Lab system already exports HL7 (most labs)
    ✓ Scalable (handles large batches)
    ✓ Clear separation of concerns

  DISADVANTAGES:
    ✗ Requires HL7 parsing library (more complex)
    ✗ Version variations (v2.3, v2.4, v2.5)
    ✗ More infrastructure (SFTP, file drop directory)
    ✗ Still batch process (not real-time)

  USE CASES:
    • Most healthcare systems (HL7 standard)
    • Integrated lab systems
    • Batch result imports (nightly)
    • Automated workflows (SFTP file drop)
    • Multi-location implementations

  TYPICAL FREQUENCY:
    Nightly batch (automated)
    Or on-demand import

  FILE TRANSFER OPTIONS:
    • SFTP drop folder (most common)
    • HTTP POST (if lab supports)
    • Email (urgent results)
    • Direct Protocol (healthcare secure email)

  IMPLEMENTATION EFFORT: 6-8 hours
    • HL7 parser (use library): 1 hour
    • OBX segment extraction: 2 hours
    • LOINC code mapping: 1 hour
    • Validation logic: 1 hour
    • SFTP monitoring: 1 hour
    • Error handling: 1 hour
    • Testing: 1 hour

────────────────────────────────────────────────────────────────────────────── 

METHOD 3: LABORATORY API INTEGRATION (Phase 2 - Future)

  PURPOSE:
    • Real-time result delivery
    • Automated workflows (no manual upload)
    • Most reliable integration (direct connection)
    • Future enhancement for large implementations
    • For integrated healthcare systems

  VENDORS (Phase 2 Roadmap):

    VENDOR A: Quest Diagnostics API
      ├─ Market share: ~30% of US labs
      ├─ Integration: OAuth 2.0
      ├─ Endpoint: /api/v1/results
      ├─ Format: JSON
      ├─ Latency: Real-time (within 30 sec)
      ├─ Frequency: Push (when result ready)
      ├─ Authentication: API key + OAuth

    VENDOR B: LabCorp API
      ├─ Market share: ~25% of US labs
      ├─ Integration: API Key + OAuth
      ├─ Endpoint: /api/results
      ├─ Format: JSON
      ├─ Latency: Real-time (within 1 min)
      ├─ Frequency: Pull (polling) + Push (webhook)
      ├─ Authentication: Certificate-based

    VENDOR C: Generic FHIR Endpoint
      ├─ Market share: Growing standard
      ├─ Integration: FHIR R4
      ├─ Endpoint: /fhir/DiagnosticReport
      ├─ Format: JSON/XML FHIR
      ├─ Latency: Per vendor
      ├─ Frequency: Pull (query) or Push (subscription)
      ├─ Authentication: OAuth 2.0

  ADVANTAGES:
    ✓ Real-time delivery (seconds)
    ✓ Fully automated (no staff action)
    ✓ Less error-prone (direct system-to-system)
    ✓ Scales well (handles high volume)
    ✓ Professional workflows (modern approach)

  DISADVANTAGES:
    ✗ Requires vendor API access (may cost)
    ✗ Complex integration (OAuth, certificates)
    ✗ Vendor-specific implementations
    ✗ Dependency on lab vendor uptime
    ✗ Higher cost ($$ for vendor integration)

  IMPLEMENTATION EFFORT: 12-16 hours per vendor
    • OAuth/authentication: 2 hours
    • API client library: 2 hours
    • Result parsing: 2 hours
    • Webhook endpoint: 2 hours
    • Error handling/retry: 1 hour
    • Rate limiting: 1 hour
    • Testing: 2 hours

────────────────────────────────────────────────────────────────────────────── 

METHOD COMPARISON TABLE:

  Feature               | CSV          | HL7 v2.5      | API (Future)
  ──────────────────────┼──────────────┼───────────────┼──────────────
  Setup time            | <1 day       | 1-2 days      | 3-5 days
  Infrastructure        | Simple       | SFTP          | OAuth, webhooks
  Real-time support     | No (daily)   | No (batch)    | Yes (seconds)
  Error detection       | Manual       | Automated     | Automated
  Staff labor           | High         | Low           | None
  Reliability           | Medium       | High          | Very High
  Scalability           | Low          | High          | Very High
  Vendor requirement    | None         | HL7 support   | API support
  Phase 1 ready?        | YES          | YES           | NO (Phase 2)
  Implementation        | 4-6 hrs      | 6-8 hrs       | 12-16 hrs/vendor

RECOMMENDED PHASE 1 APPROACH:
  ✓ Support CSV (for any lab, maximum flexibility)
  ✓ Support HL7 (industry standard, most common)
  ✓ Defer APIs (Phase 2, after core features solid)
  ✓ Estimated Phase 1 effort: 10-14 hours total

───────────────────────────────────────────────────────────────────────────────

QUESTION 2: How are lab results matched to patients?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Lab results are matched to patients using multiple identifiers with fallback
logic: MRN (primary), Name+DOB (secondary), SSN (tertiary).

MATCHING ALGORITHM:

STEP 1: EXACT MRN MATCH (Primary)
  Input:    CSV or HL7 contains MRN "MRN12345"
  Query:    SELECT patients WHERE patient_id = 'MRN12345'
  Result:   Found → Use this patient
  Success Rate: ~95% (most matches work)

  If not found: Proceed to Step 2

STEP 2: NAME + DATE OF BIRTH MATCH (Secondary)
  Input:    CSV contains Name="John Smith", DOB="1970-01-01"
  Query:    SELECT patients WHERE first_name='John' AND last_name='Smith'
            AND date_of_birth='1970-01-01'
  Result:   Found (1 match) → Use this patient
  Result:   Found (multiple matches) → Ambiguous! (manual review needed)
  Success Rate: ~85% (additional matches from unmatched MRNs)

  If ambiguous or not found: Proceed to Step 3

STEP 3: SOCIAL SECURITY NUMBER MATCH (Tertiary)
  Input:    CSV contains SSN="123-45-6789"
  Query:    SELECT patients WHERE ssn='123-45-6789'
  Result:   Found → Use this patient
  Success Rate: ~99% (if SSN present, very accurate)

  If still not found: Proceed to Step 4

STEP 4: FUZZY MATCHING (Last Resort)
  Input:    Partial info (e.g., Name="John Smyth", DOB="1970-01-02")
  Query:    Use fuzzy string matching (Levenshtein distance)
  Result:   Find closest matches (sorted by confidence)
  Confidence: Return if > 90% match
  Success Rate: ~80% (catches typos, similar names)

  If confidence < 90%: ESCALATE TO MANUAL REVIEW

MATCH CONFIDENCE SCORING:

  Scoring System (0-100):
    ✓ Exact MRN match:              +95 points
    ✓ First name match:             +15 points
    ✓ Last name match:              +15 points
    ✓ DOB match (exact):            +50 points
    ✓ DOB match (within 1 day):     +30 points (data entry error)
    ✓ SSN match (last 4):           +40 points
    ✓ SSN match (full):             +60 points
    ✓ Gender match:                 +10 points
    ✓ Phone partial match:          +10 points

  Scoring Examples:
    MRN exact match:                = 95 → AUTO-ACCEPT
    Name + DOB exact + gender:      = 15+15+50+10 = 90 → AUTO-ACCEPT
    Name + DOB fuzzy (typo):        = 15+15+30+10 = 70 → MANUAL REVIEW
    SSN last 4 match only:          = 40 → MANUAL REVIEW
    No strong match:                = <50 → ESCALATE

PHASE 1 MATCHING STRATEGY:

  LEVEL 1: EXACT MATCHES (Automatic)
    • MRN match: Immediate accept
    • Name+DOB exact: Immediate accept
    • Confidence > 95: Auto-accept

  LEVEL 2: PROBABLE MATCHES (Require Review)
    • Multiple possible matches: Staff selects correct one
    • Fuzzy match 80-94%: Staff confirms patient
    • Review queue: Show top 3 candidates with confidence scores

  LEVEL 3: UNMATCHED (Manual Entry)
    • No match found: Show option to create new patient (or skip)
    • Typically: Unknown patient from outside system
    • Action: Hold for manual import

DATABASE IMPLEMENTATION:

  Table: lab_import_matches (for tracking)
    - import_id (PK)
    - result_row_id (FK to import file row)
    - patient_id_submitted (string)  // What was in file
    - patient_id_matched (FK)        // What we found
    - match_confidence (decimal)     // 0-100
    - match_method (enum)            // MRN/NAME_DOB/SSN/FUZZY
    - auto_accepted (boolean)
    - manual_reviewed_at (datetime)
    - manual_reviewed_by (FK)
    - match_status (enum)            // MATCHED/UNMATCHED/AMBIGUOUS
    - imported_at (datetime)

  Query Examples:
    -- Find all matches for a patient
    SELECT * FROM lab_import_matches
    WHERE patient_id_matched = 123

    -- Find unmatched results
    SELECT * FROM lab_import_matches
    WHERE match_status = 'UNMATCHED'

    -- Find ambiguous matches (manual review needed)
    SELECT * FROM lab_import_matches
    WHERE match_confidence < 95

───────────────────────────────────────────────────────────────────────────────

QUESTION 3: How are duplicate results detected and handled?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Duplicate detection uses a combination of patient ID, test code, test date,
and result value to identify and prevent duplicate imports.

DUPLICATE DETECTION ALGORITHM:

WHAT IS A DUPLICATE?
  A result is considered a DUPLICATE if:
    ✓ Same patient (matched patient_id)
    ✓ Same test (LOINC code matches)
    ✓ Same date (test_date matches)
    ✓ Same/similar values (result_value matches or very close)

  Example Duplicate:
    Row 1: Patient MRN12345, Glucose, 2026-02-03, Value: 95 mg/dL
    Row 2: Patient MRN12345, Glucose, 2026-02-03, Value: 95 mg/dL
    → DUPLICATE! (same everything)

DETECTION PROCESS:

STEP 1: EXTRACT RESULT KEY
  Input:   {patient_id: 123, loinc_code: '2345-7', test_date: '2026-02-03'}
  Key:     Hash(patient_id + loinc_code + test_date)
  Purpose: Fast duplicate lookup

STEP 2: CHECK IF ALREADY IN DATABASE
  Query:   SELECT id FROM lab_results
           WHERE patient_id = 123
           AND loinc_code = '2345-7'
           AND test_date = '2026-02-03'
  Result:  Found? → Possible duplicate
  Result:  Not found? → New result

STEP 3: VALUE COMPARISON (if found)
  New value:     95 mg/dL
  Existing value: 95 mg/dL
  
  Comparison:
    ✓ Exact match (95 = 95):       DEFINITE DUPLICATE
    ✓ Near match (94-96):          LIKELY DUPLICATE (value variation)
    ✓ Different (100 vs 95):       NOT DUPLICATE (corrected result)

  Tolerance for "near match":
    • For numeric results: ±2% or ±1 unit (whichever is larger)
    • For text results: Exact match only

STEP 4: DETERMINE ACTION

  IF DEFINITE DUPLICATE:
    → Skip import (log as duplicate)
    → Update import_log with "SKIPPED - DUPLICATE"
    → No action needed

  IF LIKELY DUPLICATE:
    → Log as "PROBABLE_DUPLICATE"
    → Show to staff for confirmation
    → Allow override (in case it's a corrected result)

  IF NOT DUPLICATE:
    → Import as new result
    → Update existing result if marked "CORRECTED"

DUPLICATE SCENARIOS:

Scenario A - True Duplicate (Skip):
  Lab re-sent same result file
  Action: Skip (already imported)
  Log: "Duplicate skipped"

Scenario B - Corrected Result (Replace):
  Lab sends same test with updated value
  Status: "CORRECTED" (in HL7)
  Action: Replace old with new
  Log: "Replaced previous result"

Scenario C - Confirmed Result (Keep):
  Lab re-tested same patient, same day
  Result: Same value (confirming)
  Action: Import as separate result? Or skip?
  Policy: SKIP (unless flagged as "CONFIRMATORY")

Scenario D - Multiple Aliquots (Keep):
  Lab tested same sample multiple times
  Reason: Quality control or multiple analyses
  Status: Should be flagged in HL7
  Action: Import both (link as related)

DATABASE IMPLEMENTATION:

  Duplicate Detection Query:
    SELECT id, test_date, result_value
    FROM lab_results
    WHERE patient_id = ?
    AND loinc_code = ?
    AND test_date = ?
    ORDER BY created_at DESC
    LIMIT 1

  Result Tracking:
    Table: lab_results
      - result_id (PK)
      - patient_id (FK)
      - loinc_code (string)
      - test_date (date)
      - result_value (decimal)
      - result_flag (enum: H/L/N)
      - is_duplicate (boolean)
      - duplicate_of_result_id (FK, nullable)
      - duplicate_reason (string)
      - imported_at (timestamp)
      - import_batch_id (FK)
      - Index: (patient_id, loinc_code, test_date)

DUPLICATE HANDLING LOGIC:

  if result_exists_for_date_and_test:
      if new_value == existing_value:
          action = "SKIP_DUPLICATE"
      elif new_value ~= existing_value:  // within tolerance
          action = "LIKELY_DUPLICATE"
          requires_review = true
      else:
          if existing_status == "CORRECTED":
              action = "REPLACE_WITH_CORRECTED"
          else:
              action = "IMPORT_AS_SEPARATE"
  else:
      action = "IMPORT_NEW"

───────────────────────────────────────────────────────────────────────────────

QUESTION 4: How are lab results validated after import?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Lab results validation occurs in three stages: Pre-import validation, post-import
verification, and clinical review before use.

VALIDATION STAGES:

STAGE 1: PRE-IMPORT VALIDATION (Data Quality)

  Validation Rules:
    ✓ File format validation
      • CSV: Has required columns, proper encoding
      • HL7: Valid message structure, valid segments
      • Result: Valid or skip row

    ✓ Data type validation
      • Result value: Valid decimal or text
      • Test date: Valid date (not future)
      • Patient ID: Valid format (MRN pattern)
      • Result: Valid or reject row

    ✓ Required field validation
      • Patient ID: Required (one of MRN/SSN/Name+DOB)
      • Test code: Required (LOINC or mapping to LOINC)
      • Result value: Required
      • Test date: Required (not future)
      • Result: Required fields or reject row

    ✓ Range validation
      • Result value: In physiologically possible range
      • Example: Glucose 0-600 mg/dL (reject if outside)
      • WBC: 0-50 K/uL (reject if outside)
      • Result: Check or flag for review

    ✓ Unit validation
      • Result unit: Must be valid UCUM unit code
      • Example: mg/dL, mmol/L, K/uL
      • Mapping: Convert to standard unit (if needed)
      • Result: Normalize unit or reject

STAGE 2: POST-IMPORT VERIFICATION (Clinical Reasonableness)

  Validation Rules:
    ✓ Patient validation
      • Patient exists in system
      • Patient ID matched correctly (confidence > 90%)
      • Result: Proceed or escalate

    ✓ Test validation
      • Test code (LOINC) valid and supported
      • Test appropriate for patient (age, gender checks)
      • Example: Pregnancy test on male patient → Flag
      • Result: Proceed or flag for review

    ✓ Result validation
      • Value within expected range for patient
      • Not drastically different from recent results
      • Example: Glucose 500 mg/dL (normal is 70-100) → Flag
      • Result: Proceed or flag for review

    ✓ Temporal validation
      • Test date not in future
      • Test date not too old (>2 years? depends on test)
      • Test date aligns with patient visit (if applicable)
      • Result: Proceed or flag

  Flagging System:
    🟡 YELLOW FLAG: Value outside normal range (clinical review needed)
    🔴 RED FLAG: Value critically abnormal (requires immediate review)
    ⚠️  WARNING: Data quality issue (requires staff review)

  Example: Glucose 450 mg/dL
    • Normal range: 70-100 mg/dL
    • Status: 🔴 CRITICAL HIGH
    • Action: Auto-notify provider (urgent)

  Example: Glucose 38 mg/dL
    • Normal range: 70-100 mg/dL
    • Status: 🔴 CRITICAL LOW
    • Action: Auto-notify provider (urgent)

STAGE 3: CLINICAL REVIEW (Before Use in Care)

  Provider Review:
    ✓ Provider must review imported lab results
    ✓ Confirm results match patient presentation
    ✓ Confirm test was ordered
    ✓ Decide if result affects treatment plan
    ✓ Mark as "REVIEWED" or "REQUIRES_ACTION"

  Critical Results Protocol:
    • Glucose > 400 or < 50: Immediate notification
    • Potassium > 6.0 or < 2.5: Immediate notification
    • Troponin elevation: Immediate notification
    • Other critical values per lab definition

  Action Items:
    • Provider can acknowledge and proceed
    • Provider can order follow-up testing
    • Provider can adjust treatment plan
    • System tracks all actions (audit log)

VALIDATION CHECKLIST (Implementation):

  Pre-Import Validation:
    ☐ File format valid (CSV/HL7)
    ☐ Required columns/segments present
    ☐ No null/missing required fields
    ☐ Data types correct (date, decimal, string)
    ☐ Values in physiological range
    ☐ Units are valid UCUM codes
    ☐ Patient identifiers present
    ☐ Test codes are valid (LOINC)

  Post-Import Verification:
    ☐ Patient matched successfully
    ☐ Match confidence > 90%
    ☐ Test code (LOINC) supported
    ☐ No duplicate detected
    ☐ Result not critically abnormal (no urgent flags)
    ☐ Test date reasonable (not too old)

  Clinical Review:
    ☐ Provider reviewed result
    ☐ Marked as reviewed in system
    ☐ Noted any action required
    ☐ Critical values escalated appropriately

DATABASE VALIDATION LOGGING:

  Table: lab_import_validations
    - validation_id (PK)
    - import_id (FK)
    - result_row_id (FK)
    - validation_stage (enum: PRE_IMPORT, POST_IMPORT, CLINICAL_REVIEW)
    - validation_type (string: FORMAT, TYPE, RANGE, etc.)
    - is_valid (boolean)
    - message (text)  // "Value 450 exceeds max 400"
    - created_at (timestamp)
    - Index: (import_id, result_row_id)

  Validation Report Query:
    SELECT COUNT(*) as total,
           SUM(CASE WHEN is_valid THEN 1 ELSE 0 END) as valid,
           COUNT(CASE WHEN NOT is_valid THEN 1 END) as invalid
    FROM lab_import_validations
    WHERE import_id = ?
    GROUP BY validation_stage

───────────────────────────────────────────────────────────────────────────────

QUESTION 5: How does the lab import integrate with the diagnostic module?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Lab results are automatically linked to the diagnostic data module (Task 14)
and appear in patient's medical history, clinical notes, and clinical records.

INTEGRATION FLOW:

STEP 1: IMPORT LAB RESULT (Into lab_results table)
  Input:   CSV/HL7 file
  Parsing: Extract patient, test, result
  Matching: Find patient in system
  Storage: Insert into lab_results table
  Status: "PENDING_REVIEW"

STEP 2: CREATE DIAGNOSTIC RECORD (Link to diagnostic module)
  Trigger: Upon successful import
  Action: Create diagnostic_test_result record
  Content: Map lab_result → diagnostic_result
  Example:
    lab_result.loinc_code → diagnostic_result.test_code
    lab_result.result_value → diagnostic_result.result_value
    lab_result.test_date → diagnostic_result.test_date

  Purpose: Make result visible in diagnostic module

STEP 3: UPDATE PATIENT MEDICAL HISTORY
  Trigger: Upon clinical review (provider marks as reviewed)
  Action: Add to patient_medical_history table
  Content: Reference to diagnostic result
  Visibility: Appears in patient timeline

STEP 4: NOTIFY CLINICAL TEAM
  Trigger: Upon critical results (automatic)
  Action: Send notification to ordering provider
  Channel: In-app + email
  Message: "Lab result for [patient]: [test] = [value] [flag]"

DATABASE INTEGRATION:

  Existing Task 14 Table: diagnostic_test_results
    - test_result_id (PK)
    - patient_id (FK)
    - test_code (string)     // LOINC code
    - result_value (decimal)
    - result_unit (string)
    - result_date (date)

  NEW LINKING TABLE (for Phase 1):
    Table: lab_import_diagnostic_mapping
      - mapping_id (PK)
      - lab_result_id (FK to lab_results)
      - diagnostic_result_id (FK to diagnostic_test_results)
      - mapped_at (timestamp)
      - mapped_by (provider_id)
      - is_active (boolean)

  MAPPING LOGIC:

    LOINC CODE MAPPING:
      lab_result.loinc_code='2345-7' (Glucose)
      → diagnostic_test_results.test_code = 'LAB_GLUCOSE'
      → clinical_notes mention "Lab: Glucose 95 mg/dL"
      → appears in patient_medical_history

    RESULT INTEGRATION:
      lab_result.result_value=95
      → diagnostic_result.result_value=95
      → diagnostic_result.status='COMPLETED'
      → visible in patient chart

    VISIBILITY:
      Patient medical history tab:
        ✓ Shows all imported lab results
        ✓ Grouped by test type
        ✓ Sorted by date (newest first)
        ✓ Shows date, value, unit, status

      Consultation/Visit:
        ✓ Shows related lab results (from visit date)
        ✓ Provider can link result to consultation
        ✓ Provider can reference in clinical notes

      Clinical Dashboard:
        ✓ Shows abnormal results (flags)
        ✓ Shows trending results (graph)
        ✓ Shows pending results (awaiting review)

API ENDPOINTS (for diagnostic module integration):

  GET /patients/:id/lab_results
    Returns: List of all lab results for patient
    Filters: Test type, date range, status
    Example: /patients/123/lab_results?status=ABNORMAL

  GET /patients/:id/lab_results/:result_id
    Returns: Specific lab result details
    Includes: Value, unit, normal range, flag

  POST /patients/:id/lab_results/:result_id/link_to_consultation
    Purpose: Link lab result to a consultation
    Body: {consultation_id}
    Result: Creates link in diagnostic_test_consultation_link table

  GET /consultations/:id/lab_results
    Returns: All lab results related to this consultation
    Used in: Consultation review, clinical notes

───────────────────────────────────────────────────────────────────────────────

QUESTION 6: What happens with abnormal or critical lab values?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Abnormal or critical lab values trigger automatic notifications, escalation,
and workflow flags to ensure timely clinical action.

RESULT FLAG SYSTEM:

RESULT FLAGS (From Lab):

  Normal (N):        Within normal range
  High (H):          Above normal range
  Low (L):           Below normal range
  Critically High:   Dangerously high (e.g., Glucose > 500)
  Critically Low:    Dangerously low (e.g., Glucose < 40)

SEVERITY CLASSIFICATION:

  LEVEL 1: NORMAL
    Example: Glucose 95 mg/dL (normal range 70-100)
    Action: Auto-import, no notification
    Workflow: "NORMAL"

  LEVEL 2: ABNORMAL (Out of range, non-critical)
    Example: Glucose 125 mg/dL (normal range 70-100)
    Action: Auto-import, flag for review
    Workflow: "REVIEW_NEEDED"
    Notification: Provider sees in dashboard (non-urgent)
    Timeline: Review within 24 hours

  LEVEL 3: CRITICAL (Immediate action required)
    Example: Glucose 450 mg/dL
    Action: Auto-import, immediate escalation
    Workflow: "CRITICAL_ALERT"
    Notification: In-app + Email + SMS to provider
    Timeline: Review immediately (within 30 minutes)

  Example Critical Values:
    • Glucose: > 400 or < 50 mg/dL
    • Potassium: > 6.0 or < 2.5 mmol/L
    • Sodium: > 155 or < 120 mmol/L
    • pH: > 7.6 or < 7.2
    • Troponin: Elevation (indicates MI)
    • WBC: > 30 K/uL (infection/leukemia) or < 1.5 K/uL (immunity issue)

AUTOMATIC ESCALATION WORKFLOW:

STEP 1: RESULT IMPORTED (upon import)
  Status: PENDING_REVIEW
  Action: Check severity level

STEP 2: CRITICAL DETECTED (if Level 3)
  Status: CRITICAL_ALERT
  Action: Trigger notifications

STEP 3: NOTIFY PROVIDERS
  Recipients: Ordering provider, attending physician, clinic manager
  Method: In-app notification
  Message: "CRITICAL: [Patient] - [Test] = [Value] (Critical [High/Low])"
  Urgent Badge: Red with exclamation mark

STEP 4: NOTIFY VIA EMAIL
  Email: To ordering provider's registered email
  Subject: "URGENT: Critical Lab Result - [Patient Name]"
  Body: Result details + link to view in system

STEP 5: NOTIFY VIA SMS (Optional)
  SMS: To ordering provider's phone (if configured)
  Message: "CRITICAL LAB: [Patient] [Test]=[Value]. Review in EMR."

STEP 6: TRACK RESPONSE
  Flag: Mark when provider acknowledged
  Response Time: Track how long to acknowledge
  Action Taken: Provider documents action (acknowledge, order follow-up, etc.)

DATABASE TRACKING:

  Table: lab_result_alerts
    - alert_id (PK)
    - lab_result_id (FK)
    - severity_level (enum: NORMAL, ABNORMAL, CRITICAL)
    - alert_sent_at (timestamp)
    - notification_method (enum: IN_APP, EMAIL, SMS, PHONE)
    - recipient_id (FK to provider)
    - acknowledged_at (timestamp, nullable)
    - acknowledged_by (FK to provider, nullable)
    - action_taken (text, nullable)
    - action_taken_at (timestamp, nullable)

  Query: Unacknowledged Critical Alerts
    SELECT * FROM lab_result_alerts
    WHERE severity_level = 'CRITICAL'
    AND acknowledged_at IS NULL
    AND alert_sent_at > NOW() - INTERVAL '1 hour'

WORKFLOW STATUS:

  NORMAL Results:
    ✓ Imported automatically
    ✓ No notification
    ✓ Visible in patient chart
    ✓ Provider reviews during next visit

  ABNORMAL Results:
    ✓ Imported automatically
    ✓ Flag in dashboard (yellow)
    ✓ Non-urgent notification
    ✓ Provider reviews within 24 hours
    ✓ Provider documents review in chart

  CRITICAL Results:
    ✓ Imported immediately
    ✓ Flag in dashboard (red, blinking)
    ✓ Urgent notification (in-app + email + SMS)
    ✓ Auto-escalate if not acknowledged within 30 minutes
    ✓ Send reminder notification
    ✓ Provider must acknowledge and document action
    ✓ Possible actions: Acknowledge, order follow-up, refer to specialist

================================================================================
DATABASE SCHEMA DESIGN
================================================================================

PRIMARY TABLES:

  Table: lab_imports (tracks import batches)
    - import_id (PK)
    - import_type (enum: CSV, HL7, API)
    - import_file_name (string)
    - import_method (enum: UPLOAD, SFTP, API_PUSH)
    - total_rows (integer)
    - successful_rows (integer)
    - failed_rows (integer)
    - duplicate_rows (integer)
    - import_status (enum: IN_PROGRESS, COMPLETED, FAILED)
    - imported_by (FK to user)
    - imported_at (timestamp)
    - completed_at (timestamp, nullable)
    - error_message (text, nullable)
    - Index: (imported_at, import_status)

  Table: lab_results (imported results)
    - result_id (PK)
    - import_id (FK)
    - patient_id (FK)
    - test_name (string)
    - loinc_code (string)
    - test_date (date)
    - result_value (decimal, nullable)
    - result_text (text, nullable)
    - result_unit (string)
    - result_flag (enum: N, H, L, CRITICAL_H, CRITICAL_L)
    - normal_range_low (decimal, nullable)
    - normal_range_high (decimal, nullable)
    - abnormal_flag (boolean)
    - is_duplicate (boolean)
    - duplicate_of_result_id (FK, nullable)
    - status (enum: PENDING_REVIEW, REVIEWED, CLINICAL_ACTION)
    - reviewed_at (timestamp, nullable)
    - reviewed_by (FK to provider, nullable)
    - created_at (timestamp)
    - Index: (patient_id, loinc_code, test_date), (import_id, status)

  Table: lab_import_matches (matching tracking)
    - match_id (PK)
    - import_id (FK)
    - row_number (integer)
    - patient_id_submitted (string)
    - patient_id_matched (FK)
    - match_confidence (decimal)  // 0-100
    - match_method (enum: MRN, NAME_DOB, SSN, FUZZY)
    - auto_accepted (boolean)
    - created_at (timestamp)

  Table: lab_result_alerts (critical value tracking)
    - alert_id (PK)
    - result_id (FK)
    - severity (enum: NORMAL, ABNORMAL, CRITICAL)
    - alert_sent_at (timestamp)
    - acknowledged_at (timestamp, nullable)
    - acknowledged_by (FK, nullable)
    - action_taken (text, nullable)
    - action_taken_at (timestamp, nullable)

  Table: lab_import_validations (validation log)
    - validation_id (PK)
    - import_id (FK)
    - result_id (FK)
    - validation_stage (enum: PRE_IMPORT, POST_IMPORT, CLINICAL_REVIEW)
    - validation_type (string)
    - is_valid (boolean)
    - message (text)
    - created_at (timestamp)

  Linking Table: lab_import_diagnostic_mapping
    - mapping_id (PK)
    - lab_result_id (FK)
    - diagnostic_result_id (FK)
    - mapped_at (timestamp)
    - is_active (boolean)

================================================================================
API ENDPOINTS
================================================================================

LAB IMPORT ENDPOINTS:

  POST /lab-import/csv-upload
    Purpose: Upload CSV file
    Request: File upload (multipart/form-data)
    Response: {import_id, status, file_name, row_count}

  POST /lab-import/hl7-upload
    Purpose: Upload HL7 file
    Request: File upload (HL7 .txt or .hl7)
    Response: {import_id, status, file_name, message_count}

  GET /lab-import/:id/status
    Purpose: Check import progress
    Response: {import_id, status, processed, total, errors}

  GET /lab-import/:id/results
    Purpose: View imported results
    Response: [{result_id, patient, test, value, flag, status}]

  GET /lab-import/:id/errors
    Purpose: View validation errors
    Response: [{row, error_type, message, resolution}]

LAB RESULT ENDPOINTS:

  GET /patients/:id/lab-results
    Purpose: Get all lab results for patient
    Query params: ?start_date=2026-01-01&end_date=2026-02-03
    Response: [{result_id, test, value, flag, date, status}]

  GET /patients/:id/lab-results/:result_id
    Purpose: Get detailed lab result
    Response: {result_id, test, value, unit, range, flag, reviewed_at, etc.}

  PUT /patients/:id/lab-results/:result_id/review
    Purpose: Mark result as reviewed
    Request: {provider_id, notes, action_required}
    Response: {result_id, reviewed_at, status}

  GET /lab-results/critical
    Purpose: Get all critical lab values (admin/manager)
    Response: [{result_id, patient, test, value, flag, alert_sent}]

  POST /lab-results/:id/acknowledge-alert
    Purpose: Acknowledge critical alert
    Request: {provider_id}
    Response: {alert_id, acknowledged_at}

================================================================================
IMPLEMENTATION CHECKLIST
================================================================================

PHASE 1 (CSV + HL7 Support):

CSV Import:
  ☐ Create CSV parser
  ☐ Validate CSV format (required columns)
  ☐ Extract data into lab_results table
  ☐ Implement matching algorithm (MRN → Name+DOB → SSN)
  ☐ Implement duplicate detection
  ☐ Implement validation rules (range, unit, etc.)
  ☐ Create import error report
  ☐ Add audit logging

HL7 Import:
  ☐ Add HL7 parsing library (use existing or hapi-fhir)
  ☐ Parse MSH, PID, OBR, OBX segments
  ☐ Extract test name, code, result
  ☐ Map LOINC codes to internal test codes
  ☐ Implement same matching/duplicate/validation as CSV
  ☐ Add SFTP file monitoring (for automated imports)
  ☐ Create import schedule (nightly)
  ☐ Add error notifications

Core Features:
  ☐ Create lab_results table and related tables
  ☐ Implement result matching algorithm
  ☐ Implement duplicate detection
  ☐ Implement validation engine
  ☐ Create import UI (file upload form)
  ☐ Create import review dashboard
  ☐ Implement critical value alerts
  ☐ Create notification system
  ☐ Add audit logging

Testing:
  ☐ Unit tests: CSV parsing, validation, matching
  ☐ Unit tests: HL7 parsing, OBX extraction
  ☐ Unit tests: Duplicate detection (exact, near, corrected)
  ☐ Unit tests: Patient matching (all scenarios)
  ☐ Integration tests: CSV import end-to-end
  ☐ Integration tests: HL7 import end-to-end
  ☐ Integration tests: Critical value notification
  ☐ Performance tests: Large batch imports (1000+ results)
  ☐ Security tests: File upload validation, SQL injection

UI/UX:
  ☐ Create import upload form (drag-drop)
  ☐ Show import progress (percentage)
  ☐ Create error report view (show issues, allow correction)
  ☐ Create import history view
  ☐ Create lab results view (patient chart)
  ☐ Create critical alerts dashboard
  ☐ Create review workflow (approve/reject/action)

Documentation:
  ☐ CSV import template (downloadable)
  ☐ HL7 mapping guide (LOINC codes)
  ☐ SFTP setup guide (for automated HL7)
  ☐ Troubleshooting guide
  ☐ API documentation

PHASE 2 (API Integration - Future):

  ☐ Design Quest Diagnostics integration
  ☐ Design LabCorp API integration
  ☐ Design FHIR endpoint support
  ☐ Implement OAuth flows
  ☐ Implement webhook receivers
  ☐ Create polling/retry logic
  ☐ Add vendor-specific error handling
  ☐ Create real-time notification system
  ☐ Integration testing with sandbox environments

================================================================================
TESTING STRATEGY
================================================================================

UNIT TESTS (15+ test cases):

CSV Parsing:
  • Test 1: Valid CSV with all columns
  • Test 2: CSV with missing column (should fail)
  • Test 3: CSV with extra columns (should ignore)
  • Test 4: CSV with non-UTF8 encoding (should handle)

Patient Matching:
  • Test 5: Exact MRN match (should auto-accept)
  • Test 6: Name + DOB exact match (should auto-accept)
  • Test 7: Multiple name matches (should escalate)
  • Test 8: SSN match (should auto-accept)
  • Test 9: No match (should escalate)
  • Test 10: Fuzzy match (within tolerance)

Duplicate Detection:
  • Test 11: Exact duplicate (same value)
  • Test 12: Near duplicate (within tolerance)
  • Test 13: Corrected result (different value, status=CORRECTED)
  • Test 14: Different date (not duplicate)

Validation:
  • Test 15: Value in physiological range (valid)
  • Test 16: Value outside range (invalid)
  • Test 17: Future test date (invalid)

INTEGRATION TESTS:

End-to-End:
  • Test 18: CSV import → Patient match → Validation → Storage
  • Test 19: HL7 import → Parse → Extract → Match → Store
  • Test 20: Critical value → Alert → Notification → Acknowledgment

Notification:
  • Test 21: Normal result → No notification
  • Test 22: Abnormal result → Dashboard flag
  • Test 23: Critical result → In-app + Email + SMS

================================================================================
IMPLEMENTATION EFFORT ESTIMATE
================================================================================

PHASE 1 EFFORT (CSV + HL7):

  CSV Parser: 2 hours
    • CSV reading and validation
    • Column mapping
    • Error handling

  HL7 Parser: 2 hours
    • Using existing HL7 library
    • MSH/PID/OBR/OBX extraction
    • LOINC mapping

  Patient Matching: 2 hours
    • MRN/Name+DOB/SSN matching
    • Confidence scoring
    • Fuzzy matching

  Duplicate Detection: 1.5 hours
    • Exact/near duplicate logic
    • Corrected result handling

  Validation Engine: 1.5 hours
    • Range, unit, type validation
    • Flagging system

  Import UI: 2 hours
    • File upload form
    • Progress display
    • Error reporting

  Notifications: 1 hour
    • Critical value alerts
    • Provider notifications

  Database/Schema: 1 hour
    • Create tables
    • Indexes

  Testing: 2 hours
    • Unit tests (15+)
    • Integration tests (5+)

  TOTAL PHASE 1: 15-18 hours

PHASE 2 EFFORT (Future - APIs):

  Per vendor API: 12-16 hours
  Total for 3 vendors: 36-48 hours

================================================================================
CONCLUSION
================================================================================

Lab results import is clarified for Phase 1 (CSV + HL7 methods) and Phase 2
(API integration). Phase 1 approach is practical and covers most use cases.

Key Decisions:
  ✓ Phase 1: CSV + HL7 (fastest delivery, covers ~85% of scenarios)
  ✓ Phase 2: Laboratory APIs (Quest, LabCorp, FHIR) for real-time
  ✓ Matching: Multi-level strategy (MRN → Name+DOB → SSN → Fuzzy)
  ✓ Duplicates: Confidence-based detection
  ✓ Validation: Three-stage process (pre/post/clinical)
  ✓ Critical values: Automatic escalation and notification

Development Ready:
  ✓ All APIs specified (6+ endpoints)
  ✓ Database schema designed (6 tables)
  ✓ Validation rules documented
  ✓ Integration points clear (diagnostic module)
  ✓ Testing strategy comprehensive

Phase 1 Effort: 15-18 hours (CSV + HL7 support)
Phase 2 Effort: 36-48 hours (API integration - future)

Next Step: Complete all 5 clarifications, then proceed to Phase 2.2 (Code Standards)

================================================================================
END OF CLARIFICATION #5 (FINAL)
================================================================================
