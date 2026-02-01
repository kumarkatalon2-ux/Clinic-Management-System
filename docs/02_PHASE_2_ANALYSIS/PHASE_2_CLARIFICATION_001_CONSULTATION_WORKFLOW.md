================================================================================
PHASE 2 CLARIFICATION #1: CONSULTATION VS APPOINTMENT WORKFLOW
================================================================================
Date: February 3, 2026
Status: Clarification Complete
Priority: HIGH (affects core patient flow)
Related Tasks: 16, 17, 20, 21

================================================================================
EXECUTIVE SUMMARY
================================================================================

This document clarifies the relationship between appointments and consultations
in the clinical management system.

KEY DECISION:
→ Standard Flow: Appointment (scheduled) → Consultation (after completion)
→ One appointment generates ONE consultation
→ Phone consultations CAN exist without appointments
→ Consultations cannot exist without either appointment OR direct provider creation

AMENDMENT PROCESS: New amended-draft state for corrections

================================================================================
QUESTION 1: IS CONSULTATION ALWAYS CREATED AFTER APPOINTMENT?
================================================================================

ANSWER: Yes, with exception for phone consultations

Standard Workflow:
  1. Appointment scheduled and confirmed
  2. Patient attends appointment (on time or late)
  3. Appointment marked COMPLETED by provider
  4. Consultation auto-created from appointment
  5. Consultation enters DRAFT status
  6. Provider writes consultation notes
  7. Consultation marked FINALIZED

EXCEPTION - PHONE/VIDEO CONSULTATIONS (no appointment):
  • Provider initiates direct consultation
  • Used for follow-up calls, quick questions, urgent advice
  • Consultation created with phone_mode = true
  • No appointment record associated
  • Otherwise identical workflow

NO-SHOW Handling:
  • If appointment marked NO_SHOW:
    - Consultation NOT auto-created
    - Provider can manually create phone consultation if verbal contact made
    - Or: Invoice generated (per no-show policy)

CANCELLED Appointment:
  • If appointment cancelled:
    - No consultation created
    - Can be rescheduled
    - If cancelled within 24 hours of scheduled time, may trigger cancellation fee

DATABASE DESIGN:

Table: consultations
┌─────────────────────────────────────┐
│ Column              │ Type          │
├─────────────────────────────────────┤
│ id                  │ UUID          │
│ tenant_id           │ UUID          │
│ patient_id          │ UUID          │
│ provider_id         │ UUID          │
│ appointment_id      │ UUID (NULL)   │ ← Can be NULL (phone consult)
│ consultation_date   │ TIMESTAMP     │
│ phone_mode          │ BOOLEAN       │ ← true if phone consult
│ status              │ ENUM          │ ← DRAFT, FINALIZED, AMENDED_DRAFT
│ created_at          │ TIMESTAMP     │
│ finalized_at        │ TIMESTAMP     │
│ chief_complaint     │ TEXT          │
│ history_of_pi       │ TEXT          │
│ physical_exam       │ TEXT          │
│ assessment          │ TEXT          │
│ plan                │ TEXT          │
└─────────────────────────────────────┘

API Endpoints:

Standard (Post-Appointment):
  POST /api/v1/consultations (auto-called when appointment completed)
  Payload: { "appointment_id": "uuid", "consultation_date": "2026-02-03T14:30:00Z" }

Direct (Phone Consultation):
  POST /api/v1/consultations (manual call)
  Payload: { 
    "patient_id": "uuid", 
    "provider_id": "uuid",
    "consultation_date": "2026-02-03T14:30:00Z",
    "phone_mode": true,
    "chief_complaint": "Follow-up for hypertension"
  }

================================================================================
QUESTION 2: CAN ONE APPOINTMENT GENERATE MULTIPLE CONSULTATIONS?
================================================================================

ANSWER: No, one appointment = one consultation (1:1 relationship)

Rationale:
  • Each appointment is a single encounter
  • Each encounter generates one consultation note
  • If provider needs to see patient again, schedule new appointment
  • Maintains clear audit trail and documentation

Exception - Multi-Provider Appointments (Phase 2/Future):
  • In Phase 1: Single provider per appointment
  • In Phase 2/future: Multiple providers could participate
  • Result: Still ONE consultation, but with multiple provider sections
  • Not in scope for Phase 1

Implementation:
  • Unique constraint: (appointment_id, patient_id, provider_id) is unique
  • If attempted to create 2nd consultation for same appointment:
    - API returns 409 Conflict
    - Message: "Consultation already exists for this appointment"

================================================================================
QUESTION 3: HOW ARE AMENDMENTS/CORRECTIONS HANDLED?
================================================================================

ANSWER: Three-state process for modifications

Scenario: After consultation FINALIZED, provider needs to make changes

Option A: MINOR CORRECTIONS (typos, clarifications)
  Process:
    1. Provider requests amendment via "Request Amendment" button
    2. Consultation transitions to AMENDED_DRAFT status
    3. Provider can edit notes
    4. Provider confirms amendment → back to FINALIZED
    5. Old version kept in audit log with amendment reason
    
  Database:
    consultation_amendments table:
    ├─ id: UUID
    ├─ consultation_id: UUID
    ├─ amendment_reason: TEXT (why amended?)
    ├─ previous_assessment: TEXT (old version)
    ├─ new_assessment: TEXT (new version)
    ├─ amended_by_provider_id: UUID
    ├─ amended_at: TIMESTAMP
    └─ amendment_timestamp: TIMESTAMP

Option B: MAJOR CHANGES (diagnosis change, significant plan modification)
  Process:
    1. Provider cannot directly modify FINALIZED consultation
    2. Provider adds formal "Addendum" as new consultation record
    3. Addendum linked to original consultation
    4. Original consultation remains unchanged
    5. Both visible in patient chart

  Implementation:
    ├─ Add column: amended_consultation_id (NULL by default)
    ├─ If amended_consultation_id is set, this is an amendment
    ├─ Display shows both original and amendment
    ├─ Change reasons must be documented

Option C: CLINICAL NOTE (no amendment needed)
  Process:
    1. If information is supplementary (not a correction)
    2. Provider can add clinical notes/addendum
    3. New clinical_note record created (separate from consultation)
    4. Linked to consultation but doesn't modify original

  Recommendation: Use Option C for new information
                Use Option A for minor fixes
                Use Option B for significant changes

API Implementation:

Request Amendment (Option A):
  POST /api/v1/consultations/{id}/request-amendment
  Payload: { "reason": "Typo in assessment" }
  Response: Consultation transitions to AMENDED_DRAFT
  
Complete Amendment:
  POST /api/v1/consultations/{id}/complete-amendment
  Payload: { "assessment": "corrected text here" }
  Response: Consultation back to FINALIZED

Add Addendum (Option B):
  POST /api/v1/consultations/{id}/addendum
  Payload: {
    "reason": "Diagnosis changed after test results",
    "assessment": "new assessment text"
  }
  Response: New consultation created (linked via amended_consultation_id)

Add Clinical Note (Option C):
  POST /api/v1/consultations/{id}/clinical-notes
  Payload: {
    "note_type": "addendum",
    "content": "Follow-up information"
  }
  Response: Clinical note created, consultation unchanged

================================================================================
QUESTION 4: HOW ARE PHONE CONSULTATIONS DIFFERENT?
================================================================================

ANSWER: Same workflow, different trigger and no appointment

Characteristics:

Regular Appointment-Based Consultation:
  ├─ Scheduled in advance
  ├─ Appointment_id populated
  ├─ phone_mode = false
  ├─ Typical duration: 15-60 minutes
  ├─ May involve physical exam
  ├─ Generates billing (if billable appointment)

Phone Consultation (No Appointment):
  ├─ Can be scheduled ad-hoc
  ├─ Appointment_id = NULL
  ├─ phone_mode = true
  ├─ Typical duration: 5-15 minutes
  ├─ No physical exam (virtual only)
  ├─ May or may not generate billing (configurable)

Phone Consultation Workflow:

Step 1: Initiation
  • Patient calls or emails provider
  • Provider (or staff) documents consultation request
  • Create consultation with phone_mode = true

Step 2: Documentation
  • Provider documents chief complaint
  • History of present illness
  • Assessment and plan
  • SAME fields as regular consultation

Step 3: Finalization
  • Status → FINALIZED
  • Can still be amended if needed

Step 4: Billing (Optional)
  • If clinic charges for phone consults:
    - Invoice created automatically
    - CPT code for phone consultation (e.g., 99441, 99442)
  • If not billable:
    - No invoice generated
    - Still documented in patient record

Database Considerations:

Query: Get all consultations for patient (excluding phone-only):
  SELECT * FROM consultations 
  WHERE patient_id = ? AND phone_mode = false
  ORDER BY consultation_date DESC;

Query: Get all phone consultations for follow-up:
  SELECT * FROM consultations 
  WHERE patient_id = ? AND phone_mode = true
  ORDER BY consultation_date DESC;

Query: Get all consultations (both types):
  SELECT * FROM consultations 
  WHERE patient_id = ?
  ORDER BY consultation_date DESC;

================================================================================
QUESTION 5: CONSULTATION STATUS STATE MACHINE
================================================================================

ANSWER: Clear state transitions documented below

Valid States:

  DRAFT
    ↓ (provider completes notes)
  FINALIZED
    ↓ (provider requests amendment)
  AMENDED_DRAFT
    ↓ (provider confirms amendment)
  FINALIZED (again)

State Definitions:

DRAFT:
  • Consultation created but not yet complete
  • Provider still writing notes
  • Not visible to patient (optional)
  • Can be deleted if needed
  • Transitions to: FINALIZED

FINALIZED:
  • Consultation complete and locked
  • Visible to patient (if enabled)
  • Can be amended (go to AMENDED_DRAFT)
  • Can have addendum (new consultation)
  • Can have clinical notes added
  • Transitions to: AMENDED_DRAFT (if amendment requested)

AMENDED_DRAFT:
  • Consultation in process of being amended
  • Original still accessible (in history)
  • Can edit notes
  • Transitions back to: FINALIZED (after amendment complete)

Invalid Transitions:

  ✗ FINALIZED → DRAFT (not allowed, use amendment instead)
  ✗ AMENDED_DRAFT → DRAFT (not allowed)
  ✗ AMENDED_DRAFT → FINALIZED (use complete-amendment endpoint)
  ✗ Direct deletion of FINALIZED (must use amendment process)

Database Implementation:

Table: consultations
  status ENUM ('DRAFT', 'FINALIZED', 'AMENDED_DRAFT')

Audit Trail:

Table: consultation_status_changes
  ├─ consultation_id: UUID
  ├─ old_status: ENUM
  ├─ new_status: ENUM
  ├─ changed_by_provider_id: UUID
  ├─ reason: TEXT (why changed?)
  ├─ changed_at: TIMESTAMP

API Validation:

PUT /api/v1/consultations/{id}/status
Payload: { "new_status": "FINALIZED" }
Validation:
  • Check current status
  • Check if transition is valid
  • If invalid: Return 400 Bad Request
    Message: "Cannot transition from FINALIZED to DRAFT"
  • If valid: Update status and create audit record

================================================================================
QUESTION 6: BILLING IMPACT
================================================================================

ANSWER: One appointment = one invoice (if billable)

Appointment-Based Consultation:
  1. Appointment scheduled with billable_appointment = true
  2. Patient attends appointment
  3. Appointment marked COMPLETED
  4. Consultation auto-created
  5. Invoice auto-created (from appointment, not consultation)
  6. Invoice references appointment_id and consultation_id

Phone Consultation Billing:
  Option A (No invoice):
    • phone_mode = true, bill_phone_consult = false
    • No invoice generated
    • Documented but not billable
    • Used for: Quick advice, follow-ups, patient calls

  Option B (With invoice):
    • phone_mode = true, bill_phone_consult = true
    • Invoice created when consultation FINALIZED
    • CPT codes: 99441 (brief), 99442 (extended)
    • Billed to insurance or patient

Database:

Table: consultations (additions)
  ├─ phone_mode: BOOLEAN
  ├─ bill_phone_consult: BOOLEAN (only if phone_mode = true)
  └─ invoice_id: UUID (after invoice generated)

Table: invoices
  ├─ appointment_id: UUID (nullable)
  ├─ consultation_id: UUID (nullable)
  ├─ patient_id: UUID
  └─ amount: DECIMAL

Query: Get consultations without invoices (for billing):
  SELECT * FROM consultations 
  WHERE status = 'FINALIZED' 
  AND invoice_id IS NULL
  AND (appointment_id IS NOT NULL OR bill_phone_consult = true);

================================================================================
IMPLEMENTATION CHECKLIST
================================================================================

Database Changes:

  [ ] Add column to consultations: appointment_id (UUID, nullable)
  [ ] Add column to consultations: phone_mode (BOOLEAN, default false)
  [ ] Add column to consultations: status (ENUM: DRAFT, FINALIZED, AMENDED_DRAFT)
  
  [ ] Create table: consultation_amendments
      ├─ id, consultation_id, amendment_reason
      ├─ previous_notes, new_notes
      ├─ amended_by, amended_at
  
  [ ] Create table: consultation_status_changes
      ├─ id, consultation_id, old_status, new_status
      ├─ changed_by, reason, changed_at
  
  [ ] Add index: consultations (appointment_id)
  [ ] Add index: consultations (patient_id, consultation_date)
  [ ] Add unique constraint: (appointment_id, patient_id) where appointment_id NOT NULL

API Endpoints:

  [ ] POST /api/v1/consultations (create - with or without appointment)
  [ ] GET /api/v1/consultations/{id}
  [ ] PUT /api/v1/consultations/{id} (update notes in DRAFT or AMENDED_DRAFT)
  [ ] POST /api/v1/consultations/{id}/finalize (DRAFT → FINALIZED)
  [ ] POST /api/v1/consultations/{id}/request-amendment (FINALIZED → AMENDED_DRAFT)
  [ ] POST /api/v1/consultations/{id}/complete-amendment (AMENDED_DRAFT → FINALIZED)
  [ ] POST /api/v1/consultations/{id}/addendum (add new consultation as amendment)
  [ ] GET /api/v1/consultations?patient_id=xxx&phone_mode=false

Auto-Generation:

  [ ] When appointment marked COMPLETED:
      → Auto-create consultation with status = DRAFT
      → Set appointment_id and consultation_date
  
  [ ] When consultation FINALIZED:
      → Auto-create invoice (if billable)
      → Update invoice with consultation_id
  
  [ ] When consultation amended:
      → Create entry in consultation_amendments table
      → Update consultation status

Frontend Changes:

  [ ] Consultation form: Show appointment details (if linked)
  [ ] Consultation form: Show phone mode toggle
  [ ] Consultation view: Show status with state machine
  [ ] Amendment UI: Show original and amended versions side-by-side
  [ ] Patient portal: Show consultations (option to hide until FINALIZED)
  [ ] Audit trail: Show all status changes and amendments

Testing:

  [ ] Test: Regular appointment → consultation creation
  [ ] Test: Phone consultation creation without appointment
  [ ] Test: Amendment workflow
  [ ] Test: Addendum workflow
  [ ] Test: Billing for appointment consultation
  [ ] Test: Billing for phone consultation
  [ ] Test: No-show appointment (no consultation)
  [ ] Test: Cancelled appointment (no consultation)
  [ ] Test: Invalid state transitions rejected

================================================================================
RELATED DOCUMENTATION UPDATES
================================================================================

Update These Phase 1 Task Files:

1. Task 16 (Clinic Lifecycle Management):
   - Add consultation creation after appointment completion

2. Task 17 (Appointment Engine Scheduling):
   - Add auto-consultation-creation trigger

3. Task 20 (Telemedicine Integration):
   - Clarify phone/video consultations as phone_mode = true

4. Task 21 (Consultation Module):
   - Update with this clarification as authoritative source
   - Add state machine diagram
   - Add amendment process details

5. Task 25 (Billing & Payments):
   - Update with phone consultation billing options

================================================================================
CONCLUSION
================================================================================

KEY TAKEAWAYS:

✓ Appointment → Consultation: 1:1 relationship (standard flow)
✓ Phone Consultations: Can exist without appointments
✓ Amendment Process: Three options (minor fix, addendum, clinical note)
✓ State Machine: DRAFT → FINALIZED → AMENDED_DRAFT → FINALIZED
✓ Billing: Appointment determines invoice, consultation can affect billing

This clarification provides clear guidance for database design, API development,
and testing. Implementation is straightforward with well-defined states and
transitions.

IMPLEMENTATION EFFORT: 16-20 hours (database, API, frontend, testing)

================================================================================
END OF CLARIFICATION #1
================================================================================
