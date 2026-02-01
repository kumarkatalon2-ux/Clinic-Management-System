================================================================================
PHASE 2 CLARIFICATION #2: INSURANCE CLAIMS AUTOMATION WORKFLOW
================================================================================
Date: February 3, 2026
Status: Clarification Complete
Priority: HIGH (affects billing revenue cycle)
Related Tasks: 16, 25

================================================================================
EXECUTIVE SUMMARY
================================================================================

This document clarifies when, how, and by whom insurance claims are created in
the clinical management system.

KEY DECISION:
→ Automatic Trigger: When consultation is FINALIZED
→ Automatic Creation: Claim created with initial status PENDING_REVIEW
→ Manual Review Required: Billing staff reviews before submission
→ Automatic Submission: After review approval (configurable)

Exception: Patient with no insurance → no claim created
Exception: Cash-pay patient → no claim created (unless requesting claim)

================================================================================
QUESTION 1: WHAT TRIGGERS INSURANCE CLAIM CREATION?
================================================================================

ANSWER: Consultation FINALIZED status (not appointment completion)

Sequence of Events:

Event 1: Appointment Completed
  └─ Automatically creates DRAFT consultation

Event 2: Consultation Finalized by Provider
  └─ Consultation status changes to FINALIZED
  └─ TRIGGERS AUTOMATIC INVOICE CREATION
  └─ Invoice created with initial status DRAFT_INVOICE

Event 3: Invoice Created
  └─ Invoice auto-populated with:
     ├─ Patient demographics
     ├─ Insurance information (from patient record)
     ├─ Procedure codes (from consultation type)
     ├─ Appointment date and provider
     ├─ Billable amount
  └─ IF Insurance present: TRIGGERS AUTOMATIC CLAIM CREATION
  └─ Claim status: PENDING_REVIEW

Timeline:

  T+0 min:    Consultation FINALIZED by provider
  T+1 min:    Invoice auto-created (DRAFT)
  T+2 min:    Insurance claim auto-created (PENDING_REVIEW)
  T+30 min:   Billing staff reviews claim
  T+60 min:   Billing staff approves or rejects claim
  T+75 min:   Approved claim queued for submission
  T+120 min:  Claim submitted to insurance clearinghouse
  T+1-3 days: Insurance processes and responds

Database Events:

Table: consultations (event source)
  When status changes from DRAFT → FINALIZED:
    1. Create entry in consultation_status_changes (audit)
    2. Trigger: Create invoice
    3. Trigger: Create insurance claims (if patient has insurance)

Table: invoices (created automatically)
  On INSERT:
    1. Create invoice_items (from consultation data)
    2. Calculate total amount
    3. Set status = DRAFT_INVOICE

Table: insurance_claims (created automatically)
  On INSERT (only if patient.insurance_id IS NOT NULL):
    1. Create claim record
    2. Set status = PENDING_REVIEW
    3. Populate claim_id
    4. Set created_at timestamp
    5. Queue for review (add to billing queue)

================================================================================
QUESTION 2: AUTOMATIC vs MANUAL CLAIM CREATION
================================================================================

ANSWER: Hybrid approach - Automatic creation, Manual review before submission

Workflow:

AUTOMATIC CREATION PHASE (T+0 to T+2 min):
  ✓ When consultation FINALIZED
  ✓ System checks: Patient has insurance? → YES
  ✓ System creates claim automatically
  ✓ Claim enters PENDING_REVIEW status
  ✓ No manual action required for creation

MANUAL REVIEW PHASE (T+30 to T+90 min):
  ✓ Billing staff receives notification (email, dashboard alert)
  ✓ Staff reviews claim for:
    - Correct patient information
    - Correct insurance information
    - Correct procedure codes
    - Correct amounts
    - No duplicate claims
  ✓ Staff actions:
    - APPROVE → Claim queued for submission
    - REJECT → Claim marked REJECTED (reason required)
    - EDIT → Modify claim details → APPROVE or REJECT

AUTOMATIC SUBMISSION PHASE (T+120 min):
  ✓ If claim status APPROVED (after manual review)
  ✓ System submits claim to clearinghouse
  ✓ Claim transitions to SUBMITTED status
  ✓ Tracking reference captured

Manual Override Available:
  ✓ Billing staff can force MANUAL SUBMISSION
  ✓ Or defer submission (hold for future batch)
  ✓ Or hold claim (for missing information)

Configuration Options:

Healthcare Provider can configure:
  ├─ AUTO_SUBMIT_AFTER_REVIEW: true/false
  │  └─ true:  Auto-submit after review approval
  │  └─ false: Require manual submission button click
  │
  ├─ REVIEW_REQUIRED: true/false
  │  └─ true:  Always require manual review
  │  └─ false: Auto-submit without review (not recommended)
  │
  ├─ AUTO_RESUBMIT_ON_DENIAL: true/false
  │  └─ true:  Automatically resubmit denied claims
  │  └─ false: Require manual intervention for denials

================================================================================
QUESTION 3: WHEN EXACTLY IS CLAIM CREATED?
================================================================================

ANSWER: Immediately when invoice is created (T+1-2 min after consultation finalized)

Precise Trigger:

Event: INSERT into invoices table
  WHERE:
    - patient.insurance_id IS NOT NULL
    - patient.insurance_status = ACTIVE
    - patient.insurance_coverage_effective <= TODAY
    - patient.insurance_coverage_end >= TODAY

If ALL conditions true → CREATE insurance_claim record

If ANY condition false:
  ├─ Patient has no insurance → No claim created
  ├─ Insurance inactive → No claim created
  ├─ Insurance not yet effective → No claim created
  ├─ Insurance expired → No claim created
  ├─ Billing staff manually creates claim later (optional)

Automatic Claim Data Populated:

  claim_id:               UUID (generated)
  patient_id:             From invoice
  invoice_id:             From invoice (foreign key)
  insurance_id:           From patient.insurance_id
  claim_number:           Auto-incremented per insurance
  status:                 PENDING_REVIEW
  submission_status:      NOT_SUBMITTED
  created_at:             NOW()
  created_by_system:      true (indicates auto-created)

  procedural_data:
    ├─ procedure_codes:   From consultation (CPT codes)
    ├─ procedure_dates:   From consultation/appointment
    ├─ provider_npi:      From provider record
    ├─ facility_id:       From clinic record
    ├─ diagnosis_codes:   From consultation diagnoses (ICD-10)

================================================================================
QUESTION 4: WHAT ABOUT CASH-PAY PATIENTS?
================================================================================

ANSWER: No claim created, but invoice still created

Cash-Pay Patient Workflow:

Patient Setup:
  Patient.insurance_id = NULL
  Patient.payment_method = CASH_PAY
  Patient.self_pay = true

Events:
  1. Consultation FINALIZED
  2. Invoice created (with amounts due from patient)
  3. NO insurance claim created (no insurance to claim)
  4. Patient receives bill for self-pay amounts
  5. Payment processed through regular billing cycle

Database:

Table: invoices
  ├─ patient_id: UUID
  ├─ invoice_type: ENUM ('INSURANCE', 'SELF_PAY')
  ├─ insurance_id: UUID (nullable)
  ├─ amount_billed_to_insurance: DECIMAL
  ├─ amount_due_from_patient: DECIMAL
  └─ total_amount: DECIMAL

Query: Get all claims (exclude cash-pay):
  SELECT * FROM insurance_claims
  WHERE status != 'CANCELLED'
  AND patient.insurance_id IS NOT NULL;

Query: Get all cash-pay invoices:
  SELECT * FROM invoices
  WHERE invoice_type = 'SELF_PAY'
  OR insurance_id IS NULL;

================================================================================
QUESTION 5: CLAIM LIFECYCLE - FULL STATE MACHINE
================================================================================

ANSWER: Detailed state transitions for claims from creation to payment

States Overview:

  PENDING_REVIEW
    ↓ (Billing staff approves)
  APPROVED
    ↓ (Auto or manual submission)
  SUBMITTED
    ├─→ ACCEPTED_BY_CLEARINGHOUSE
    │     ├─→ PROCESSING (by insurance)
    │     │     ├─→ APPROVED_FOR_PAYMENT
    │     │     ├─→ DENIED (needs appeal)
    │     │     └─→ PENDING_MORE_INFO
    │     └─→ PAID
    └─→ REJECTED_BY_CLEARINGHOUSE

State Definitions:

PENDING_REVIEW:
  • Claim created, awaiting billing staff review
  • Can be edited
  • Can be rejected from here
  • Must be approved before submission
  • Duration: 30 min - 2 hours

APPROVED:
  • Billing staff reviewed and approved claim
  • Can still be edited (before submission)
  • Can be submitted
  • Notification sent to billing team
  • Duration: 5 - 120 minutes

SUBMITTED:
  • Claim sent to insurance clearinghouse
  • Submission timestamp recorded
  • Awaiting clearinghouse acknowledgment
  • Cannot be edited (frozen)
  • Duration: 1 - 24 hours

ACCEPTED_BY_CLEARINGHOUSE:
  • Clearinghouse received and accepted claim
  • Forwarded to insurance
  • Awaiting insurance processing
  • Duration: 1 - 5 days

PROCESSING:
  • Insurance is reviewing claim
  • May request additional information
  • Waiting for insurance decision
  • Duration: 3 - 15 days

APPROVED_FOR_PAYMENT:
  • Insurance approved, will pay
  • Awaiting payment transmission
  • Check or EFT sent to provider
  • Duration: 1 - 7 days

PAID:
  • Payment received from insurance
  • Claim resolved successfully
  • Final state

DENIED:
  • Insurance denied claim
  • Reason code recorded (e.g., "Not covered by plan")
  • Can be appealed
  • May trigger patient billing (if allowed by plan)

PENDING_MORE_INFO:
  • Insurance requesting additional information
  • Claim on hold
  • Provider must send info and resubmit
  • Duration: Until info provided

REJECTED_BY_CLEARINGHOUSE:
  • Clearinghouse rejected claim (formatting error, invalid codes)
  • Cannot go directly to insurance
  • Must be corrected and resubmitted
  • Duration: Until corrected

Database Implementation:

Table: insurance_claims
  ├─ id: UUID
  ├─ patient_id: UUID
  ├─ invoice_id: UUID
  ├─ insurance_id: UUID
  ├─ claim_number: VARCHAR (e.g., "CLM-2026-001234")
  ├─ status: ENUM (all states above)
  ├─ submission_status: ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'RESUBMITTED')
  ├─ clearinghouse_response: JSON
  ├─ insurance_response: JSON
  ├─ denial_reason: TEXT (if DENIED)
  ├─ created_at: TIMESTAMP
  ├─ submitted_at: TIMESTAMP
  ├─ accepted_at: TIMESTAMP
  ├─ paid_at: TIMESTAMP
  └─ amount_approved: DECIMAL
  └─ amount_paid: DECIMAL

Table: claim_status_history (audit trail)
  ├─ id: UUID
  ├─ claim_id: UUID
  ├─ old_status: ENUM
  ├─ new_status: ENUM
  ├─ changed_at: TIMESTAMP
  ├─ changed_by: UUID (user)
  └─ reason: TEXT

================================================================================
QUESTION 6: CLAIM SUBMISSION PROCESS (DETAILED)
================================================================================

ANSWER: Multi-step process with timing and error handling

Step 1: Claim Approval (Manual Review)

  Trigger: Billing staff clicks "Approve Claim"
  
  Data Validated:
    ✓ Patient demographics current
    ✓ Insurance information valid
    ✓ Insurance active and covering service date
    ✓ Procedure codes valid (CPT codes)
    ✓ Diagnosis codes valid (ICD-10 codes)
    ✓ Provider NPI valid
    ✓ Facility ID valid
    ✓ No duplicate claim submission
  
  If Validation Fails:
    → Return error to billing staff
    → Highlight missing/invalid fields
    → Request correction
  
  If Validation Passes:
    → Status: PENDING_REVIEW → APPROVED
    → Create audit entry (staff member, timestamp, approved)
    → Send notification (optional Slack/email to team)

Step 2: Claim Formatting (EDI 837 Format)

  Insurance uses EDI (Electronic Data Interchange) standard:
    ├─ 837P: Professional claims (most common)
    ├─ 837I: Institutional claims
    └─ 837D: Dental claims
  
  Data formatted to EDI standard:
    ├─ ISA segment: Interchange header
    ├─ GS segment: Functional group
    ├─ ST segment: Transaction set
    ├─ CLM segment: Claim information
    ├─ NM1 segment: Names (patient, provider, payer)
    ├─ SVC segment: Service details
    └─ SE segment: Transaction end

Step 3: Clearinghouse Transmission

  Option A: Direct to Clearinghouse API
    • Provider uses clearinghouse (e.g., Change Healthcare)
    • System calls clearinghouse API
    • EDI 837 data sent
    • Immediate response (validation)
    • Tracking reference returned
  
  Option B: Batch File Upload
    • Multiple claims batched together
    • EDI file created and uploaded
    • Clearinghouse processes batch (hourly/daily)
    • Response file generated (with errors/warnings)
  
  Option C: SFTP Direct to Payer
    • Direct connection to insurance payer
    • EDI 837 file sent via SFTP
    • Payer processes directly
    • Response sent back via SFTP

Submission Process (Real-time API assumed):

  1. Build EDI 837 message from claim data
  2. Call clearinghouse API endpoint
  3. Include:
     - API credentials (provided by provider)
     - Claim ID
     - EDI 837 data
     - Recipient (insurance ID)
  4. Clearinghouse responds:
     - Status: SUCCESS or ERROR
     - Validation errors (if any)
     - Tracking reference (if successful)
     - Estimated processing time
  5. Update claim record:
     - submission_status: SUBMITTED
     - submitted_at: NOW()
     - clearinghouse_tracking_reference: [ref]
     - clearinghouse_response: [full response JSON]
  6. Status: APPROVED → SUBMITTED

Step 4: Clearinghouse Validation Response (Immediate)

  Clearinghouse returns within 1-2 seconds:
    
  Response A: VALIDATED
    ✓ All formatting correct
    ✓ All codes valid
    ✓ Claim forwarded to insurance
    ✓ Status: SUBMITTED → ACCEPTED_BY_CLEARINGHOUSE
    ✓ Tracking reference provided
    ✓ Claim will be processed by insurance
  
  Response B: VALIDATION ERROR
    ✗ Formatting errors found
    ✗ Invalid codes identified
    ✗ Claim NOT forwarded
    ✗ Status: SUBMITTED → REJECTED_BY_CLEARINGHOUSE
    ✗ Error details returned:
      - "Invalid CPT code: 99415"
      - "NPI not valid: 1234567890"
      - "Missing diagnosis code"
    ✗ Claim must be corrected and resubmitted
    ✗ Correction workflow:
      1. Billing staff reviews error details
      2. Corrects invalid data
      3. Re-submits claim
      4. Status: REJECTED_BY_CLEARINGHOUSE → APPROVED (for resubmit)

Step 5: Insurance Processing (Asynchronous)

  After clearinghouse acceptance, insurance processes:
    
  Timeline:
    • T+0:   Claim accepted by clearinghouse
    • T+2h:  Claim received by insurance
    • T+6h:  Claim entered into insurance system
    • T+1-5d: Insurance reviews and makes decision
  
  Possible Outcomes:
    
    A) APPROVED_FOR_PAYMENT
       ✓ Insurance approves claim
       ✓ Payment authorized
       ✓ Claim moves to APPROVED_FOR_PAYMENT
       ✓ Payment to follow (1-7 days)
    
    B) DENIED
       ✗ Insurance denies claim
       ✗ Denial reason provided
       ✗ Status: DENIED
       ✗ May be appealable
       ✗ Patient may owe (varies by plan)
    
    C) PENDING_MORE_INFO
       ⏳ Insurance needs additional information
       ⏳ Status: PENDING_MORE_INFO
       ⏳ Examples of missing info:
          - Medical records
          - Proof of prior authorization
          - Medication justification
          - Coordination of benefits
       ⏳ Provider must supply info and re-submit

Step 6: Payment Receipt

  When insurance pays:
    
    Payment Methods:
      ├─ Check (postal mail, 7-10 days)
      ├─ EFT (electronic fund transfer, 1-3 days)
      └─ Other (rare)
    
    Upon Receipt:
      1. Match payment to claim via claim_number
      2. Update claim record:
         - Status: APPROVED_FOR_PAYMENT → PAID
         - amount_paid: [actual amount]
         - paid_at: [payment date]
         - payment_reference: [check number or EFT reference]
      3. Update invoice:
         - amount_paid_by_insurance: [amount]
         - Invoice status may change (PARTIALLY_PAID or PAID)
      4. If amount paid < amount approved:
         - Patient may owe difference
         - Create patient statement
      5. If amount paid > amount billed:
         - Create credit on account
         - Apply to future invoices or refund

================================================================================
QUESTION 7: RESUBMISSION & DENIAL HANDLING
================================================================================

ANSWER: Automatic retry logic with manual override

Automatic Resubmission:

Configuration (per healthcare provider):
  ├─ AUTO_RESUBMIT_ON_DENIAL: true/false
  ├─ RESUBMIT_WAIT_DAYS: 5-30 (default 10)
  ├─ MAX_RESUBMIT_ATTEMPTS: 1-5 (default 2)

Process When Claim Denied:

  1. Insurance sends denial
  2. Status: DENIED
  3. Denial reason recorded
  4. System checks AUTO_RESUBMIT_ON_DENIAL setting
  
  If FALSE (manual resubmission):
    → Billing staff reviews denial reason
    → Takes corrective action (if possible)
    → Manually resubmits claim
    → Status: DENIED → APPROVED (for resubmit)
  
  If TRUE (automatic resubmission):
    → System checks denial reason
    → If correctable (e.g., formatting issue):
      → System corrects data automatically
      → Resubmits claim after RESUBMIT_WAIT_DAYS
      → Status: DENIED → SUBMITTED (resubmit)
      → Tracks resubmit_attempt: 1
    → If not correctable (e.g., service not covered):
      → Manual review required
      → Status remains DENIED
      → Billing staff decides next action

Manual Denial Appeal:

  Process:
    1. Billing staff clicks "Appeal Denial"
    2. Review denial reason
    3. Gather supporting documentation
    4. Create appeal request
    5. Appeal submitted to insurance
    6. Status: DENIED → APPEAL_SUBMITTED
    7. Insurance reviews appeal (10-30 days)
    8. Appeal approved or denied again

Database Tracking:

Table: claim_resubmissions
  ├─ id: UUID
  ├─ claim_id: UUID
  ├─ original_submission_date: DATE
  ├─ resubmission_date: DATE
  ├─ resubmit_attempt_number: INT
  ├─ reason_for_resubmission: TEXT
  ├─ changes_made: JSON
  ├─ submitted_by: UUID (user)
  └─ result: ENUM ('ACCEPTED', 'DENIED_AGAIN', 'PENDING')

Table: claim_appeals
  ├─ id: UUID
  ├─ claim_id: UUID
  ├─ original_denial_reason: TEXT
  ├─ appeal_reason: TEXT
  ├─ supporting_documentation: JSON
  ├─ appeal_date: DATE
  ├─ appeal_status: ENUM ('PENDING', 'APPROVED', 'DENIED')
  ├─ insurance_response: TEXT
  └─ response_date: DATE

================================================================================
IMPLEMENTATION CHECKLIST
================================================================================

Database Tables:

  [ ] Create table: insurance_claims
      ├─ All fields from state definitions
      ├─ Indexes on: patient_id, insurance_id, status, submitted_at
  
  [ ] Create table: claim_status_history
      ├─ Audit trail for all status changes
  
  [ ] Create table: claim_resubmissions
      ├─ Track resubmission attempts
  
  [ ] Create table: claim_appeals
      ├─ Track appeal requests
  
  [ ] Update table: invoices
      ├─ Add column: insurance_claim_id (foreign key)
      ├─ Add column: amount_paid_by_insurance (DECIMAL)
      ├─ Add column: claim_status (sync with claim)

API Endpoints:

  [ ] POST /api/v1/insurance-claims (create manually if needed)
  [ ] GET /api/v1/insurance-claims/{id}
  [ ] GET /api/v1/insurance-claims (list with filters)
  [ ] PUT /api/v1/insurance-claims/{id}/approve
  [ ] PUT /api/v1/insurance-claims/{id}/reject
  [ ] PUT /api/v1/insurance-claims/{id}/submit
  [ ] PUT /api/v1/insurance-claims/{id}/resubmit
  [ ] POST /api/v1/insurance-claims/{id}/appeal
  [ ] PUT /api/v1/insurance-claims/{id}/mark-paid

Auto-Generation Logic:

  [ ] When invoice created:
      → Check patient.insurance_id IS NOT NULL
      → Check insurance active (coverage dates)
      → Create insurance_claim automatically
      → Status: PENDING_REVIEW
  
  [ ] When claim status changes:
      → Create entry in claim_status_history
      → Send notifications (email/dashboard)
      → Update related invoice (if status affects billing)

Clearinghouse Integration:

  [ ] Connect to clearinghouse API (Change Healthcare, etc.)
  [ ] Build EDI 837 formatter
  [ ] Submit claims via API
  [ ] Parse clearinghouse responses
  [ ] Handle validation errors
  [ ] Track submission references
  [ ] Receive clearinghouse acknowledgments

Insurance Response Processing:

  [ ] Webhook/API to receive insurance updates
  [ ] Process payment notifications
  [ ] Update claim status based on insurance response
  [ ] Handle denial reasons
  [ ] Trigger automatic resubmission (if configured)
  [ ] Match payments to claims

Billing Dashboard:

  [ ] Claims pending review (count, list)
  [ ] Claims submitted (waiting for response)
  [ ] Claims approved for payment
  [ ] Claims denied (requiring action)
  [ ] Claims paid (with amount and date)
  [ ] Resubmission history (with results)

Frontend Changes:

  [ ] Claim review interface for billing staff
  [ ] Edit claim details interface
  [ ] Approve/reject/submit buttons
  [ ] Appeal interface
  [ ] Payment tracking view
  [ ] Analytics dashboard

Testing:

  [ ] Test: Auto-creation when invoice created
  [ ] Test: Manual claim creation (for corrections)
  [ ] Test: Claim approval workflow
  [ ] Test: EDI 837 formatting
  [ ] Test: Clearinghouse submission
  [ ] Test: Validation error handling
  [ ] Test: Resubmission logic
  [ ] Test: Payment matching to claims
  [ ] Test: Appeals workflow

================================================================================
CONCLUSION
================================================================================

KEY TAKEAWAYS:

✓ Automatic Creation: When invoice created (if patient has insurance)
✓ Automatic Initial State: PENDING_REVIEW
✓ Manual Review Required: Before submission (best practice)
✓ Automatic Submission: After approval (configurable)
✓ State Machine: Well-defined states from creation to payment
✓ Resubmission: Automatic or manual (configurable)
✓ Appeals: Manual process available for denials

Insurance claims workflow is well-defined with clear automation points and
manual review gates for quality assurance.

IMPLEMENTATION EFFORT: 20-24 hours
  ├─ Database schema: 2 hours
  ├─ API endpoints: 6 hours
  ├─ Auto-generation logic: 4 hours
  ├─ Clearinghouse integration: 4 hours
  ├─ Frontend UI: 4 hours
  ├─ Testing: 4 hours

================================================================================
END OF CLARIFICATION #2
================================================================================
