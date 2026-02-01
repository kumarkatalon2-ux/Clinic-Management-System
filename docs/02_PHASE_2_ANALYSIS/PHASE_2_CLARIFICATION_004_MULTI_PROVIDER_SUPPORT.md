================================================================================
PHASE 2 CLARIFICATION DOCUMENT #4
MULTI-PROVIDER CONSULTATION SUPPORT & CARE TEAM COLLABORATION
================================================================================

Date Created: February 3, 2026
Ambiguity #4 of 5: Multi-provider consultation workflows
Status: COMPLETE - DEVELOPMENT READY
Implementation Effort: 18-22 hours
Related Phase 1 Tasks: 16, 17, 21, 32 (RBAC)

================================================================================
EXECUTIVE SUMMARY
================================================================================

AMBIGUITY STATEMENT:
  Phase 1 spec (Task 21) defines single-provider consultations: one doctor
  conducts the consultation, one doctor's notes appear in the consultation
  record. This raises the question: Can multiple providers collaborate on
  a single consultation? Is there a "care team" model for complex cases?

CLARIFICATION DECISION:
  ✓ PHASE 1 (Current): Single provider per consultation (ONE doctor documents)
  ✓ PHASE 2 (Future): Care team model optional (ARCHITECTURE SUPPORT)
  ✓ MVP: Keep Phase 1 as-is (single provider, faster delivery)
  ✓ DESIGN: Build database support for multi-provider NOW (Phase 1)
  ✓ ACTIVATION: Enable care team in Phase 2 or later (feature flag)

RATIONALE:
  • Phase 1 MVP scope: Single provider drives faster implementation
  • Patient experience: One doctor responsible = clear accountability
  • Billing simplicity: One provider = simpler claim generation
  • Regulatory: Clear audit trail (one provider per consultation)
  • Future flexibility: Database design supports care team when needed
  • HIPAA compliance: Easier to audit single-provider consultations

RECOMMENDATION:
  Design database to SUPPORT multi-provider, but DISABLE in Phase 1 via
  feature flag. Enable in Phase 2 for complex cases requiring care teams.

KEY DECISION MATRIX:

  Feature                          | Phase 1 MVP      | Phase 2 Future
  ─────────────────────────────────┼──────────────────┼────────────────
  Primary Provider Required        | YES (mandatory)  | YES (lead doc)
  Additional Providers Allowed     | NO (disabled)    | YES (optional)
  Shared Notes                     | NO (not needed)  | YES (if care team)
  Permission Model                 | Simple (single)  | Complex (team)
  Database Support                 | YES (prepared)   | YES (enabled)
  Feature Flag                     | DISABLED         | ENABLED
  Rollout Risk                     | MINIMAL          | LOW-MEDIUM
  Clinical Workflow Change         | NONE             | SIGNIFICANT
  Billing Impact                   | NONE             | DEPENDS ON CONFIG

================================================================================
DETAILED QUESTION-BY-QUESTION ANALYSIS
================================================================================

QUESTION 1: What defines a "care team" consultation?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
A "care team consultation" is a single consultation record where multiple
healthcare providers collaborate on patient care and documentation.

EXAMPLE SCENARIOS (Future Phase 2):

Scenario A - Primary + Specialist:
  Patient visits: Primary care doctor
  Specialist called in: Cardiologist reviews patient
  Result: One consultation record with:
    • Primary provider (lead, creates initial notes)
    • Specialist (adds additional findings, recommendations)
    • Both providers' names/credentials visible
    • Both can modify (with audit trail)
    • One invoice (to primary, or split)

Scenario B - Multi-Specialist (Emergency):
  Patient arrives at ER: Chief complaint is chest pain
  Assessment: Cardiology + Internal Medicine + Radiology
  Result: One consultation record with:
    • ER doctor (lead/triage)
    • Cardiologist (evaluates heart)
    • Internal medicine (evaluates overall)
    • Radiologist (reviews imaging)
    • All collaborate on single note
    • One complex invoice (or split 4-ways)

Scenario C - Remote Collaboration:
  Patient: In-person with Dr. Smith
  Dr. Smith: Teleconference with Dr. Jones (specialist)
  Result: One consultation with:
    • Dr. Smith (lead, in-person)
    • Dr. Jones (remote specialist, observing)
    • Both sign off on consultation
    • One invoice to patient (attributed to lead)

PHASE 1 BEHAVIOR:
  ✓ Supported: Scenario A (single provider only)
  ✗ Not supported: Scenarios B & C (care team features disabled)

PHASE 2 BEHAVIOR:
  ✓ Supported: All scenarios A, B, C
  ✓ Enabled: Via ENABLE_CARE_TEAM feature flag

───────────────────────────────────────────────────────────────────────────────

QUESTION 2: How does a care team consultation differ from a single-provider?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Single-provider and care team consultations have same structure but different
permissions and audit trails. Multi-provider enables shared edit access.

COMPARISON TABLE:

  ASPECT                   | Single Provider (Phase 1) | Care Team (Phase 2 Future)
  ─────────────────────────┼──────────────────────────┼──────────────────────────
  Providers Allowed        | 1 (required)             | 2-10 (configurable max)
  Lead Provider            | YES (only provider)      | YES (always required)
  Shared Notes             | N/A (not applicable)     | YES (all docs contribute)
  Edit After Finalize      | Limited (amendments)     | YES (with audit trail)
  Signature                | Single                   | Multi-signature required
  Authorization Level      | Provider (read/edit)     | Team lead + all members
  Audit Trail              | One provider's actions   | All providers' actions logged
  HIPAA Compliance         | Standard                 | Enhanced (more transparent)
  Use Cases                | Standard care            | Complex/interdisciplinary
  Billing Model            | One invoice              | Split or lead-only

WORKFLOW DIFFERENCES:

PHASE 1 (SINGLE PROVIDER):
  Step 1: Dr. Smith starts consultation
  Step 2: Dr. Smith examines patient, takes notes
  Step 3: Dr. Smith finalizes (locked)
  Step 4: Can only amend (minor corrections)
  Step 5: Consultation locked for billing/claims

PHASE 2 (CARE TEAM):
  Step 1: Dr. Smith (lead) starts consultation
  Step 2: Dr. Smith sees patient, adds notes
  Step 3: Dr. Smith calls Dr. Jones (specialist)
  Step 4: Dr. Jones joins consultation (gets access)
  Step 5: Both can add notes in real-time (or sequentially)
  Step 6: Both must sign off (approval)
  Step 7: Consultation finalized with team notes
  Step 8: Either can add amendments (all changes logged)

───────────────────────────────────────────────────────────────────────────────

QUESTION 3: How are permissions managed for care team members?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Care team permissions follow a hierarchical role model: Lead provider has
full control, team members have scoped edit access.

PERMISSION MODEL:

PHASE 1 PERMISSION LEVEL (Single Provider):
  Provider (lead):
    ✓ Create consultation
    ✓ Add/edit notes (before finalize)
    ✓ Add patient findings
    ✓ Add diagnosis
    ✓ Finalize consultation
    ✓ Request amendments
    ✓ Complete amendments
    ✗ Change lead provider (not applicable)

PHASE 2 PERMISSION LEVELS (Care Team - Future):

  Provider Role 1 - LEAD PROVIDER:
    ✓ Create consultation
    ✓ Add/edit notes
    ✓ Invite team members
    ✓ Remove team members
    ✓ Finalize consultation
    ✓ Approve team notes
    ✓ Mark consultation complete
    ✓ Change team composition
    ✓ Create amendments
    ✓ Reassign lead (optional)

  Provider Role 2 - CARE TEAM MEMBER (Specialist):
    ✓ Add/edit notes (own section only)
    ✓ View all team notes
    ✓ Add findings/recommendations
    ✓ Request amendments (only to own notes)
    ✓ Sign off on consultation
    ✗ Finalize (lead only)
    ✗ Invite/remove team members
    ✗ Change team composition

  Provider Role 3 - CARE TEAM OBSERVER (Real-time attendee):
    ✓ View consultation (real-time)
    ✓ View all notes
    ✗ Edit notes
    ✗ Sign off
    ✗ Approve finalization

DATABASE PERMISSIONS TABLE (NEW - for Phase 2):

  consultation_permissions:
    - consultation_id (FK)
    - provider_id (FK)
    - role ('LEAD', 'MEMBER', 'OBSERVER')
    - access_level ('READ_ONLY', 'READ_WRITE_OWN', 'READ_WRITE_ALL')
    - can_finalize (boolean)
    - can_amend (boolean)
    - can_manage_team (boolean)
    - assigned_at (timestamp)
    - assigned_by (provider_id)

RBAC INTEGRATION:
  • Provider role (system role): "Doctor", "Specialist", "Nurse", etc.
  • Consultation role (consultation-specific): "LEAD", "MEMBER", "OBSERVER"
  • Intersection determines actual permissions
  • RBAC (Task 32) already handles user role checks
  • Consultation role adds additional layer

───────────────────────────────────────────────────────────────────────────────

QUESTION 4: How do multiple providers collaborate on shared notes?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Shared notes use a provider-labeled section system where each team member
contributes to their section, visible to all team members.

NOTE STRUCTURE (Multi-Provider Model):

CONSULTATION SECTIONS (Phase 2 Future):

  Section 1: CHIEF_COMPLAINT (primary provider section)
    Content: Patient's primary complaint
    Author: Lead provider only
    Lead doctor adds: "Patient presents with chest pain x 2 days"

  Section 2: PATIENT_HISTORY (lead provider section)
    Content: Vital signs, history, initial assessment
    Author: Lead provider
    Locked for other team members

  Section 3: SPECIALIST_FINDINGS (provider-labeled sections)
    Content: Multiple sub-sections (one per specialist)

    Sub-section 3A: CARDIOLOGY (Dr. Jones - Cardiologist)
      Author: Dr. Jones only
      Dr. Jones adds: "Auscultation: normal S1/S2, no murmurs"

    Sub-section 3B: RADIOLOGY (Dr. Smith - Radiologist)
      Author: Dr. Smith only
      Dr. Smith adds: "Chest X-ray: No abnormalities noted"

    Sub-section 3C: INTERNAL_MED (Dr. Kumar - Internist)
      Author: Dr. Kumar only
      Dr. Kumar adds: "Assessment: Likely musculoskeletal vs GERD"

  Section 4: SHARED_ASSESSMENT (all team members can edit)
    Content: Collaborative summary
    Authors: All team members
    All can add to a unified assessment (with audit trail per change)

  Section 5: SHARED_PLAN (all team members contribute)
    Content: Treatment plan agreed by team
    Authors: All team members
    Example: "Start atorvastatin 20mg daily (cardiology), PPI 40mg daily (IM)"

DATABASE STRUCTURE (for multi-provider support - Phase 2):

  Table: consultation_sections (NEW)
    - section_id (PK)
    - consultation_id (FK)
    - provider_id (FK)        // Owner of this section
    - section_type (enum: CHIEF_COMPLAINT, HISTORY, FINDINGS, ASSESSMENT, PLAN)
    - section_title (string)  // "Cardiology Findings"
    - content (text)          // Actual medical notes
    - created_at (timestamp)
    - updated_at (timestamp)
    - updated_by (provider_id) // Track who made latest change
    - is_locked (boolean)     // Lead provider can lock after finalize
    - audit_trail (JSONB)     // All edits with timestamps

  Table: consultation_section_edits (NEW - for audit)
    - edit_id (PK)
    - section_id (FK)
    - provider_id (FK)
    - old_content (text)      // Previous version
    - new_content (text)      // Updated version
    - changed_at (timestamp)
    - reason (string)         // Why changed (amendment, correction, etc.)

COLLABORATION WORKFLOW (Phase 2 - Team Consultation):

  T+0 min:    Lead creates consultation
  T+5 min:    Lead adds chief complaint and initial history
  T+10 min:   Lead invites Dr. Jones (specialist) to consult
  T+12 min:   Dr. Jones gets notification, joins consultation
  T+15 min:   Dr. Jones adds findings to his specialist section
  T+20 min:   Lead invites Dr. Kumar (second opinion)
  T+22 min:   Dr. Kumar joins, reviews all notes so far
  T+25 min:   Dr. Kumar adds his findings to his section
  T+30 min:   Team collaborates on shared assessment section
  T+35 min:   All team members add to shared treatment plan
  T+40 min:   Lead marks for finalization
  T+42 min:   System prompts all team members to sign off
  T+45 min:   All team members sign off (approval required)
  T+47 min:   Lead finalizes consultation (locked)
  T+48 min:   System creates ONE invoice
  T+50 min:   System creates ONE insurance claim

───────────────────────────────────────────────────────────────────────────────

QUESTION 5: How does billing work with multi-provider consultations?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Billing for care team consultations has multiple options: Single invoice
(lead provider), Split invoice (all providers), or Role-based billing.

BILLING OPTIONS:

OPTION A: SINGLE INVOICE (Lead Provider Only) - RECOMMENDED
  When:    Most common scenario
  Scenario: Specialist consult on patient's behalf
  Invoice: One line item to patient
  Amount:  Standard consultation fee (based on appointment type)
  Provider: Attributed to lead provider only
  Claim:   Insurance claim under lead provider's NPI
  Example: Patient sees Dr. Smith (lead), cardiology consult with Dr. Jones
           → One invoice to patient (attributed to Dr. Smith)
           → One insurance claim to insurance company (under Dr. Smith's NPI)

OPTION B: SPLIT INVOICE (Multiple Line Items)
  When:    Complex case with specialty charges
  Scenario: Multi-specialist consultation (ER team)
  Invoice: Multiple line items (one per team member)
  Amount:  Proportional (e.g., Lead: $100, Specialist: $50)
  Provider: Each provider gets their portion
  Claim:   Multiple insurance claims (one per provider NPI)
  Example: ER chest pain consult with Cardio + IM + Radiology
           → Three line items: ER doc $75, Cardio $50, Radiology $25
           → Three insurance claims (submitted separately or bundled)

OPTION C: ROLE-BASED BILLING
  When:    Defined procedures with billing rules per role
  Scenario: Protocol-driven case (pre-defined procedure)
  Invoice: One invoice with split details
  Amount:  Based on role (lead gets full, others get % or flat)
  Provider: Distribution configured per care team type
  Claim:   Single claim or multiple (configurable)
  Example: Diabetes management protocol
           → Primary care lead (handles main claim)
           → Diabetes specialist (gets $15 co-management fee)

PHASE 1 BEHAVIOR (Single Provider):
  ✓ Invoice: One per appointment (clear)
  ✓ Amount: Standard fee (simple)
  ✓ Provider: Only one (no confusion)
  ✓ Claim: One per consultation (easy)
  ✓ Complexity: MINIMAL

PHASE 2 BEHAVIOR (Care Team - Configurable):
  ✓ Billing Mode: Configurable (single, split, role-based)
  ✓ Invoice: Can be split or single (per policy)
  ✓ Amount: Can be distributed (lead gets primary)
  ✓ Provider: Multiple options
  ✓ Claims: Can be bundled or separate
  ✓ Complexity: MODERATE (requires configuration)

RECOMMENDATION:
  Phase 2 should default to OPTION A (single invoice to lead provider) to
  minimize billing complexity and keep workflows similar to Phase 1.

DATABASE CHANGES:

  Table: consultations (MODIFY - add care team support)
    - billing_mode (enum: 'SINGLE', 'SPLIT', 'ROLE_BASED')    // NEW
    - primary_billable_provider_id (FK)                        // NEW
    - split_percentages (JSONB: {provider_id: percentage})     // NEW

  Table: invoices (MODIFY)
    - care_team_details (JSONB) // NEW
      {
        "is_care_team": true,
        "lead_provider_id": 123,
        "team_members": [123, 456, 789],
        "billing_mode": "SINGLE",
        "split_breakdown": {
          "123": {"amount": 100.00, "percentage": 100},
          "456": {"amount": 0, "percentage": 0},
          "789": {"amount": 0, "percentage": 0}
        }
      }

───────────────────────────────────────────────────────────────────────────────

QUESTION 6: How is care team enabled/disabled? (Feature flag strategy)
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Care team features are controlled via feature flag, allowing Phase 1 MVP to
launch with single-provider only, and Phase 2 to enable team consultations.

FEATURE FLAG IMPLEMENTATION:

FEATURE FLAG NAME: ENABLE_CONSULTATION_CARE_TEAM

Location: Config settings or environment variable
Default: false (disabled in Phase 1)
Scope: Organization-level (can be enabled per clinic if multi-tenant)
Override: Admin can override per clinic/provider

PHASE 1 BEHAVIOR (Flag = false):

  UI CHANGES:
    ✗ Hide "Add team member" button
    ✗ Hide "Team members" section
    ✓ Show only "Provider" field (single, required)
    ✓ Show standard consultation form

  DATABASE:
    ✗ Do NOT create consultation_permissions records
    ✗ Do NOT populate provider_section_id in notes
    ✓ Create standard consultation record (existing schema)

  API:
    ✗ Do NOT accept multiple_providers in request
    ✗ Do NOT allow POST /consultations/{id}/team_members
    ✓ Accept provider_id as required field

  BACKUP:
    ✓ Default to single-provider if care_team_enabled = false
    ✓ Reject requests with multiple providers
    ✓ Log attempts to use disabled features (audit trail)

PHASE 2 BEHAVIOR (Flag = true):

  UI CHANGES:
    ✓ Show "Add team member" button
    ✓ Show "Team members" section
    ✓ Show care team notes/sections
    ✓ Show signature requirements (all must sign off)

  DATABASE:
    ✓ Create consultation_permissions records
    ✓ Populate provider_section_id in notes
    ✓ Create multi-provider sections

  API:
    ✓ Accept multiple_providers in request (optional)
    ✓ Allow POST /consultations/{id}/team_members
    ✓ Enforce team permissions

  VALIDATION:
    ✓ Allow up to max_team_members (configurable, default 5)
    ✓ Require all members to sign off
    ✓ Validate permissions before allowing edits

CONFIGURATION TABLE:

  Table: feature_flags (existing)
    - flag_name: 'ENABLE_CONSULTATION_CARE_TEAM'
    - is_enabled: false                     // Phase 1
    - enabled_for_org_id: null              // Null = all orgs
    - enabled_for_provider_id: null         // Null = all providers
    - description: 'Allow care team on consultations'
    - rollout_percentage: 0                 // Phase 1: 0% (off)
    - created_at: 2026-02-03
    - updated_at: 2026-02-03

ROLLOUT STRATEGY (Phase 2 - Future):

  Week 1:   Enable for test clinic (10% rollout)
  Week 2:   Enable for beta clinics (25% rollout)
  Week 3:   Enable for all (100% rollout)
  Week 4:   Monitor metrics, fix issues
  Week 5:   Full production release

MONITORING:

  Metrics to track:
    - % of consultations using care team
    - Average team size (providers per consultation)
    - Time to finalize (single vs team)
    - Billing accuracy (split vs single)
    - Error rates (permission denied, etc.)
    - User satisfaction (survey)

───────────────────────────────────────────────────────────────────────────────

QUESTION 7: How does HIPAA/audit trail work with multiple team members?
───────────────────────────────────────────────────────────────────────────────

ANSWER:
Multi-provider consultations maintain detailed audit trails for each provider's
actions, ensuring HIPAA compliance and clear accountability.

AUDIT REQUIREMENTS:

Per HIPAA Security Rule (§164.312(b) - Audit Controls):
  ✓ Record and examine access to medical records
  ✓ Identify who accessed, when, and what action
  ✓ Detect unauthorized access or modifications
  ✓ Maintain audit logs for minimum 6 years (we keep 7)

AUDIT LOGGING FOR CARE TEAMS:

  What's Logged:
    1. Consultation creation (who, when)
    2. Team member added (by whom, when, which member)
    3. Team member permissions assigned
    4. Note creation (which provider, which section, when)
    5. Note modification (by whom, from what to what)
    6. Consultation finalization (by whom, all signatures captured)
    7. Amendments (by whom, old content, new content, reason)
    8. Access to consultation by team members (viewer logs)
    9. Team member removed (by whom, when)

  Structure: audit_log table (existing, add new event types)

    CREATE TABLE audit_log (
      event_id BIGSERIAL PRIMARY KEY,
      event_type VARCHAR(50),
      entity_type VARCHAR(50),
      entity_id BIGINT,
      actor_id BIGINT,          // Which provider did this
      action VARCHAR(50),       // CREATE, UPDATE, DELETE
      old_value TEXT,           // Previous value (for amendments)
      new_value TEXT,           // New value
      ip_address INET,
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT NOW(),
      session_id VARCHAR(500),
      CONSTRAINT audit_log_actor_fk FOREIGN KEY (actor_id) REFERENCES providers(id)
    );

SAMPLE AUDIT TRAIL (Multi-Provider Consultation):

  Time      | Event Type     | Actor        | Action    | Details
  ──────────┼────────────────┼──────────────┼───────────┼─────────────────────────────
  09:00:00  | CONSULTATION   | Dr. Smith    | CREATE    | Created consultation ID 456
  09:01:00  | TEAM_MEMBER    | Dr. Smith    | ADD       | Added Dr. Jones (cardiology)
  09:02:00  | NOTE           | Dr. Smith    | CREATE    | Added chief complaint
  09:05:00  | NOTE           | Dr. Smith    | UPDATE    | Updated history section
  09:10:00  | NOTE           | Dr. Jones    | CREATE    | Added cardiology findings
  09:15:00  | NOTE           | Dr. Jones    | UPDATE    | Revised findings
  09:20:00  | CONSULTATION   | Dr. Smith    | FINALIZE  | Marked as finalized
  09:21:00  | SIGN_OFF       | Dr. Smith    | APPROVE   | Lead provider signed off
  09:22:00  | SIGN_OFF       | Dr. Jones    | APPROVE   | Team member signed off
  09:23:00  | CONSULTATION   | Dr. Smith    | LOCKED    | Consultation locked

PROVIDER VISIBILITY:

  PATIENT:
    ✓ Can see: All team members' names and credentials
    ✓ Can see: What each provider documented
    ✓ Can see: Timeline of collaboration
    ✓ Cannot see: Internal notes/amendments (unless requested)

  LEAD PROVIDER (Dr. Smith):
    ✓ Can see: All team member actions
    ✓ Can see: Full audit trail
    ✓ Can see: All edits and amendments
    ✓ Can see: When each provider accessed consultation

  TEAM MEMBER (Dr. Jones):
    ✓ Can see: Own actions only (by default)
    ✓ Can see: Other team members' sections (read-only)
    ✓ Cannot see: Other team members' detailed audit (privacy)
    ✓ Can see: Own amendments/edits (own audit trail)

  NON-TEAM PROVIDER (Dr. Kumar):
    ✗ Cannot see: Consultation record
    ✗ Cannot see: Any details
    ✓ Exception: If patient grants access (future)

COMPLIANCE REPORTS (For audits):

  Report 1: Who accessed this patient's records?
    → List all consultations
    → Show all team members + lead provider
    → Date/time ranges
    → All modifications

  Report 2: What did provider X do?
    → All consultations provider was team member on
    → All actions taken
    → All notes created/modified
    → Timeline

  Report 3: Unauthorized access attempts?
    → List of failed access attempts
    → Date/time
    → Why denied (permission, etc.)

PHASE 1 (Simple audit trail):
  ✓ One provider per consultation
  ✓ Audit trail: Simple (one person's actions)
  ✓ Compliance: Easy to validate

PHASE 2 (Complex audit trail):
  ✓ Multiple providers
  ✓ Audit trail: Detailed (each provider's actions)
  ✓ Compliance: More detailed but same standard

================================================================================
DATABASE SCHEMA DESIGN
================================================================================

PHASE 1 SCHEMA (No Care Team Support Yet):

  consultations:
    - consultation_id (PK)
    - appointment_id (FK, unique)       // 1:1 relationship
    - primary_provider_id (FK)          // Single provider (required)
    - patient_id (FK)
    - status (enum)
    - chief_complaint (text)
    - history (text)
    - findings (text)
    - assessment (text)
    - plan (text)
    - created_at
    - finalized_at
    - Index: (appointment_id, patient_id, primary_provider_id)

PHASE 2 SCHEMA (With Care Team Support):

NEW TABLES:

  consultation_permissions (NEW):
    - permission_id (PK)
    - consultation_id (FK)
    - provider_id (FK)
    - role (enum: LEAD, MEMBER, OBSERVER)
    - access_level (enum: READ_ONLY, READ_WRITE_OWN, READ_WRITE_ALL)
    - can_finalize (boolean)
    - can_amend (boolean)
    - can_manage_team (boolean)
    - assigned_at (timestamp)
    - assigned_by_provider_id (FK)
    - removed_at (timestamp, nullable)
    - reason_removed (text, nullable)
    - Index: (consultation_id, provider_id)

  consultation_sections (NEW):
    - section_id (PK)
    - consultation_id (FK)
    - owner_provider_id (FK, nullable)  // NULL = shared section
    - section_type (enum)
    - section_title (varchar)
    - content (text)
    - is_locked (boolean)
    - created_at
    - updated_at
    - updated_by_provider_id (FK)
    - Index: (consultation_id, section_type)

  consultation_section_edits (NEW - for detailed audit):
    - edit_id (PK)
    - section_id (FK)
    - provider_id (FK)
    - old_content (text, nullable)
    - new_content (text)
    - edited_at (timestamp)
    - reason (varchar)
    - Index: (section_id, provider_id)

MODIFIED TABLES:

  consultations (ADD COLUMNS):
    - care_team_enabled (boolean, default false)
    - billing_mode (enum: SINGLE, SPLIT, ROLE_BASED)
    - primary_billable_provider_id (FK, nullable)

  invoices (ADD COLUMN):
    - care_team_details (JSONB, nullable)
      {
        "is_care_team": boolean,
        "lead_provider_id": integer,
        "team_members": [list of provider IDs],
        "billing_mode": "SINGLE" | "SPLIT" | "ROLE_BASED",
        "split_breakdown": {provider_id: {amount, percentage}}
      }

================================================================================
API ENDPOINTS
================================================================================

PHASE 1 ENDPOINTS (No care team):

  POST /consultations
    Request: {provider_id, appointment_id, chief_complaint}
    Response: {consultation_id, status: "DRAFT"}

  GET /consultations/:id
    Response: {consultation_id, provider_id, status, notes}

  PUT /consultations/:id
    Request: {chief_complaint, history, findings, etc.}
    Response: {consultation_id, status, updated_at}

  POST /consultations/:id/finalize
    Response: {consultation_id, status: "FINALIZED"}

PHASE 2 ENDPOINTS (Care team - NEW):

  POST /consultations/:id/team_members
    Request: {provider_id, role: "LEAD" | "MEMBER" | "OBSERVER"}
    Response: {permission_id, provider_id, role}
    Requires: care_team_enabled feature flag

  DELETE /consultations/:id/team_members/:provider_id
    Response: {success: true}
    Requires: LEAD role on consultation

  GET /consultations/:id/team_members
    Response: [{provider_id, name, role, added_at}]

  GET /consultations/:id/sections
    Response: [{section_id, type, owner_provider_id, content}]

  POST /consultations/:id/sections
    Request: {type, title, content, owner_provider_id}
    Response: {section_id, created_at}
    Requires: Team member permission

  PUT /consultations/:id/sections/:section_id
    Request: {content}
    Response: {section_id, updated_at}
    Requires: Owner or shared section permission

  GET /consultations/:id/audit_trail
    Response: [{event_type, actor, action, timestamp}]
    Requires: Team member or patient

  POST /consultations/:id/team_sign_off
    Request: {provider_id, signature}
    Response: {provider_id, signed_at}
    Requires: All team members before finalize

  PUT /consultations/:id/billing_mode
    Request: {mode: "SINGLE" | "SPLIT" | "ROLE_BASED"}
    Response: {billing_mode, split_breakdown}
    Requires: LEAD role

================================================================================
IMPLEMENTATION CHECKLIST
================================================================================

PHASE 1 (MVP - Single Provider Only):

Database Changes:
  ☐ Add care_team_enabled column to consultations (default false)
  ☐ Add billing_mode column to consultations (default 'SINGLE')
  ☐ Create feature_flags table entry for ENABLE_CONSULTATION_CARE_TEAM
  ☐ Set feature flag to false for Phase 1

API Changes:
  ☐ Add validation: If care_team_enabled = false, reject multiple providers
  ☐ Add validation: If feature flag disabled, ignore care team requests
  ☐ Log attempts to use disabled features

Documentation:
  ☐ Document feature flag setup
  ☐ Document future Phase 2 care team model
  ☐ Add comments in code: "Care team feature, disabled in Phase 1"

PHASE 2 (Future - Care Team Enabled):

Database Migration:
  ☐ Create consultation_permissions table
  ☐ Create consultation_sections table
  ☐ Create consultation_section_edits table
  ☐ Migrate existing consultations (create permission records)
  ☐ Add audit trail for new tables

API Endpoints:
  ☐ POST /consultations/:id/team_members
  ☐ DELETE /consultations/:id/team_members/:provider_id
  ☐ GET /consultations/:id/team_members
  ☐ GET /consultations/:id/sections
  ☐ POST /consultations/:id/sections
  ☐ PUT /consultations/:id/sections/:section_id
  ☐ GET /consultations/:id/audit_trail
  ☐ POST /consultations/:id/team_sign_off
  ☐ PUT /consultations/:id/billing_mode

Permissions:
  ☐ Implement consultation_permissions model
  ☐ Add permission checks in consultations service
  ☐ Add role-based access control (LEAD vs MEMBER)
  ☐ Implement team member addition workflow

Multi-Provider Notes:
  ☐ Implement consultation_sections table
  ☐ Create provider-labeled sections
  ☐ Implement shared section editing
  ☐ Add audit trail for each edit

UI Changes:
  ☐ Add "Add team member" button (feature flag gated)
  ☐ Add team members section
  ☐ Show provider-labeled notes
  ☐ Add signature requirements display
  ☐ Add audit trail view

Testing:
  ☐ Unit tests: Single provider behavior (backward compat)
  ☐ Unit tests: Team member permissions
  ☐ Unit tests: Multi-provider sections
  ☐ Integration tests: Team workflow end-to-end
  ☐ Integration tests: Billing with care team
  ☐ Integration tests: Audit trail accuracy
  ☐ Performance tests: Large team consultations

================================================================================
TESTING STRATEGY
================================================================================

PHASE 1 TESTING (Single Provider - Current):

Unit Tests:
  • Test 1: Consultation creation with single provider
  • Test 2: Consultation finalization
  • Test 3: Amendment workflow
  • Test 4: Billing calculation (single provider)
  • Test 5: Care team flag disabled (reject multiple providers)

Integration Tests:
  • Test 6: Appointment completion → Consultation creation
  • Test 7: Insurance claim generation from consultation
  • Test 8: Full workflow (appointment → consultation → invoice → claim)

PHASE 2 TESTING (Care Team - Future):

Unit Tests:
  • Test 9: Add team member to consultation
  • Test 10: Remove team member from consultation
  • Test 11: Permission checks (LEAD vs MEMBER)
  • Test 12: Section creation and editing
  • Test 13: Edit to wrong section (permission denied)
  • Test 14: Shared section editing (by multiple providers)
  • Test 15: Audit trail recording

Integration Tests:
  • Test 16: Full care team workflow (lead → add member → collaborate → finalize)
  • Test 17: Multiple providers signing off
  • Test 18: Billing split across team
  • Test 19: Insurance claim with care team
  • Test 20: Audit trail accuracy for team actions
  • Test 21: HIPAA compliance (access logs)
  • Test 22: Feature flag enabling/disabling

Performance Tests:
  • Test 23: Large consultation (10+ team members)
  • Test 24: Rapid concurrent edits (race condition check)
  • Test 25: Audit trail query performance (1M+ events)

================================================================================
ROLLOUT & MIGRATION STRATEGY
================================================================================

PHASE 1 → PHASE 2 MIGRATION (Future):

Backward Compatibility:
  ✓ All Phase 1 consultations remain single-provider
  ✓ No automatic conversion needed
  ✓ Care team is OPTIONAL (flag-gated)
  ✓ Existing billing logic unchanged

Data Migration:
  1. Create consultation_permissions table
  2. Migrate all existing consultations:
     INSERT INTO consultation_permissions (consultation_id, provider_id, role, ...)
     SELECT consultation_id, primary_provider_id, 'LEAD', ... FROM consultations
  3. Create permission records (marking existing as LEAD)
  4. No data loss (all original data preserved)

Rollout Strategy:
  Week 1:   Deploy with feature flag OFF (0% rollout)
            - Database migration deployed
            - API endpoints deployed (but gated)
            - No UI changes visible

  Week 2:   Enable for test clinic (10% rollout)
            - Monitor performance
            - Test team workflows
            - Collect feedback

  Week 3:   Enable for beta clinics (25% rollout)
            - Expand scope
            - Monitor billing accuracy
            - Test insurance claims with teams

  Week 4:   Enable for all (100% rollout)
            - Full production
            - Continue monitoring
            - Fix any issues discovered

Risk Mitigation:
  • Feature flag allows quick rollback
  • No data is deleted (only added)
  • Single-provider workflow unchanged
  • Billing defaults to SINGLE mode (backward compatible)

================================================================================
DECISION SUMMARY
================================================================================

PRIMARY DECISION:
  ✓ Phase 1: Keep single-provider consultations (MVP)
  ✓ Phase 2: Enable optional care team model (feature flag)
  ✓ Design: Database prepared for both in Phase 1

RATIONALE:
  1. Speed: Phase 1 MVP faster with single provider
  2. Complexity: Care team adds significant complexity
  3. Billing: Single provider = simpler invoice/claim
  4. Compliance: Clearer audit trail with one provider
  5. Future-proof: Database designed to support teams

RECOMMENDED APPROACH:
  1. Phase 1: Deploy with care_team_enabled = false
  2. Phase 1: Database schema includes all Phase 2 tables (just unused)
  3. Phase 2: Enable via feature flag after Phase 1 launch
  4. Phase 2: No data migration needed (schema already present)
  5. Phase 2: Gradual rollout (10% → 25% → 100%)

RISK LEVEL:
  Phase 1 Risk: MINIMAL (feature is disabled)
  Phase 2 Risk: LOW-MEDIUM (well-designed architecture)
  Rollback: EASY (just disable feature flag)

================================================================================
CONCLUSION
================================================================================

Multi-provider/care team support is clarified and designed for Phase 2
implementation. Phase 1 will maintain single-provider consultations for
faster delivery and simpler billing.

Key Points:
  ✓ Phase 1: Single provider only (MVP focus)
  ✓ Phase 2: Optional care team model
  ✓ Database: Ready for both (schema includes Phase 2 tables)
  ✓ Feature flag: Controls availability
  ✓ Backward compatible: No breaking changes
  ✓ Risk: Low (clear design, feature-gated)

This clarification allows Phase 1 development to proceed without care team
complexity, while preparing the foundation for future expansion.

Effort Estimate:
  Phase 1: 0 additional hours (no care team features)
  Phase 2: 18-22 hours (full care team implementation)

Next Clarification: Lab Results Import Methods

================================================================================
END OF CLARIFICATION #4
================================================================================
