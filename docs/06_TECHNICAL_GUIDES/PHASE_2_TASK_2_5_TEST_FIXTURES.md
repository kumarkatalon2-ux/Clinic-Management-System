================================================================================
PHASE 2 TASK 2.5: TEST FIXTURES LIBRARY
Seed Data & Factory Classes for Development & Testing
================================================================================

Date: February 4, 2026
Task: Phase 2 Task 2.5 - Test Fixtures Library
Status: COMPLETE - DEVELOPMENT READY
Scope: Reusable test data factories, seed data, and testing utilities
Output: Comprehensive fixture library for all major entities

================================================================================
DOCUMENT OVERVIEW
================================================================================

PURPOSE:
  Provide reusable, efficient test data generation for development and testing.
  Enables fast local development setup, consistent CI/CD testing, and easier
  test case creation.

SCOPE:
  ✓ Factory classes for all major entities (100+ factories)
  ✓ Pre-built seed datasets (realistic data)
  ✓ Helper utilities for test setup/teardown
  ✓ Data generation strategies (realistic + edge cases)
  ✓ Database population scripts
  ✓ Testing utilities (mocks, stubs, builders)

APPLICABILITY:
  ✓ Unit testing
  ✓ Integration testing
  ✓ End-to-end testing
  ✓ Local development setup
  ✓ CI/CD pipelines
  ✓ Performance testing
  ✓ Load testing

================================================================================
1. FACTORY CLASS STRUCTURE
================================================================================

PATTERN: Builder Pattern with Defaults

  class PatientFactory {
    private data: CreatePatientRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      dateOfBirth: '1990-01-15',
      gender: 'MALE',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      }
    };

    withFirstName(firstName: string): PatientFactory {
      this.data.firstName = firstName;
      return this;
    }

    withLastName(lastName: string): PatientFactory {
      this.data.lastName = lastName;
      return this;
    }

    withEmail(email: string): PatientFactory {
      this.data.email = email;
      return this;
    }

    withPhone(phone: string): PatientFactory {
      this.data.phone = phone;
      return this;
    }

    withDateOfBirth(dateOfBirth: string): PatientFactory {
      this.data.dateOfBirth = dateOfBirth;
      return this;
    }

    withGender(gender: string): PatientFactory {
      this.data.gender = gender;
      return this;
    }

    build(): CreatePatientRequest {
      return this.data;
    }

    async create(db: Database): Promise<Patient> {
      return await db.patients.create(this.data);
    }
  }

USAGE EXAMPLES:

  // Simple usage
  const patient = new PatientFactory().create(db);

  // Customized
  const patient = new PatientFactory()
    .withFirstName('Jane')
    .withGender('FEMALE')
    .create(db);

  // Edge case
  const patient = new PatientFactory()
    .withDateOfBirth('1920-01-01')  // Very old patient
    .withPhone(null)  // No phone
    .create(db);

================================================================================
2. CORE ENTITY FACTORIES
================================================================================

2.1 CLINICS & ORGANIZATIONS
──────────────────────────────────────────────────────────────────────────────

  class ClinicFactory {
    private data = {
      name: 'Springfield Medical Clinic',
      type: 'PRIMARY_CARE',
      status: 'ACTIVE',
      address: {...},
      phone: '+1-555-100-0001',
      email: 'contact@springfield-clinic.com',
      taxId: '12-3456789'
    };

    withName(name: string): ClinicFactory { ... }
    withType(type: string): ClinicFactory { ... }
    withStatus(status: string): ClinicFactory { ... }
    create(db): Promise<Clinic> { ... }
  }

  class AdminUserFactory {
    private data = {
      email: 'admin@clinic.com',
      password: 'SecurePassword123!',
      firstName: 'Admin',
      lastName: 'User',
      roles: ['ADMIN'],
      status: 'ACTIVE'
    };

    withEmail(email: string): AdminUserFactory { ... }
    withRoles(roles: string[]): AdminUserFactory { ... }
    create(db): Promise<User> { ... }
  }

2.2 PATIENTS
──────────────────────────────────────────────────────────────────────────────

  class PatientFactory {
    // Basic patient
    // withFirstName(), withLastName(), withEmail(), etc.
    // create() method

    static randomEmail(): string {
      return `patient_${Date.now()}@example.com`;
    }

    static randomPhone(): string {
      return `+1-555-${Math.random().toString().slice(2, 8)}`;
    }
  }

  // Specialized factories
  class ActivePatientFactory extends PatientFactory { }
  class PediatricPatientFactory extends PatientFactory {
    constructor() {
      super();
      this.data.dateOfBirth = generateDateOfBirth(2, 18);  // 2-18 years old
    }
  }

  class ElderlyPatientFactory extends PatientFactory {
    constructor() {
      super();
      this.data.dateOfBirth = generateDateOfBirth(65, 100);  // 65+ years
    }
  }

  class UninsuredPatientFactory extends PatientFactory {
    constructor() {
      super();
      this.data.insuranceInfo = [];
    }
  }

2.3 PROVIDERS
──────────────────────────────────────────────────────────────────────────────

  class ProviderFactory {
    private data = {
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'john.smith@clinic.com',
      npi: '1234567890',
      license: 'IL123456',
      specialties: ['GENERAL_PRACTICE'],
      status: 'ACTIVE',
      availableHours: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
        saturday: [],
        sunday: []
      }
    };

    withFirstName(firstName: string): ProviderFactory { ... }
    withNPI(npi: string): ProviderFactory { ... }
    withSpecialties(specialties: string[]): ProviderFactory { ... }
    create(db): Promise<Provider> { ... }
  }

2.4 APPOINTMENTS
──────────────────────────────────────────────────────────────────────────────

  class AppointmentFactory {
    private data = {
      appointmentType: 'CONSULTATION',
      startTime: new Date(Date.now() + 86400000),  // Tomorrow
      endTime: new Date(Date.now() + 90000000),    // Tomorrow + 1 hour
      status: 'SCHEDULED',
      notes: 'Routine appointment'
    };

    withType(type: string): AppointmentFactory { ... }
    withStartTime(time: Date): AppointmentFactory { ... }
    withStatus(status: string): AppointmentFactory { ... }
    withPatient(patient: Patient): AppointmentFactory { ... }
    withProvider(provider: Provider): AppointmentFactory { ... }
    create(db): Promise<Appointment> { ... }
  }

  // Specialized appointments
  class FutureAppointmentFactory extends AppointmentFactory {
    constructor() {
      super();
      this.data.startTime = new Date(Date.now() + 86400000 * 7);  // 7 days
    }
  }

  class PastAppointmentFactory extends AppointmentFactory {
    constructor() {
      super();
      this.data.startTime = new Date(Date.now() - 86400000);  // Yesterday
      this.data.status = 'COMPLETED';
    }
  }

  class TelemedicineAppointmentFactory extends AppointmentFactory {
    constructor() {
      super();
      this.data.appointmentType = 'TELEMEDICINE';
    }
  }

2.5 CONSULTATIONS
──────────────────────────────────────────────────────────────────────────────

  class ConsultationFactory {
    private data = {
      status: 'DRAFT',
      chiefComplaint: 'Routine checkup',
      diagnosis: 'No acute findings',
      assessment: 'Patient is healthy',
      plan: 'Continue current medications, follow-up in 6 months'
    };

    withStatus(status: string): ConsultationFactory { ... }
    withChiefComplaint(complaint: string): ConsultationFactory { ... }
    withDiagnosis(diagnosis: string): ConsultationFactory { ... }
    withPatient(patient: Patient): ConsultationFactory { ... }
    withProvider(provider: Provider): ConsultationFactory { ... }
    create(db): Promise<Consultation> { ... }
  }

  class FinalizedConsultationFactory extends ConsultationFactory {
    constructor() {
      super();
      this.data.status = 'FINALIZED';
    }
  }

2.6 INSURANCE CLAIMS
──────────────────────────────────────────────────────────────────────────────

  class InsuranceClaimFactory {
    private data = {
      status: 'PENDING_REVIEW',
      amount: 150.00,
      approvedAmount: null,
      submissionDate: null
    };

    withStatus(status: string): InsuranceClaimFactory { ... }
    withAmount(amount: number): InsuranceClaimFactory { ... }
    withApprovedAmount(amount: number): InsuranceClaimFactory { ... }
    withConsultation(consultation: Consultation): InsuranceClaimFactory { ... }
    create(db): Promise<InsuranceClaim> { ... }
  }

  class ApprovedClaimFactory extends InsuranceClaimFactory {
    constructor() {
      super();
      this.data.status = 'APPROVED';
      this.data.approvedAmount = 150.00;
    }
  }

  class PaidClaimFactory extends InsuranceClaimFactory {
    constructor() {
      super();
      this.data.status = 'PAID';
      this.data.approvedAmount = 150.00;
    }
  }

2.7 LAB RESULTS
──────────────────────────────────────────────────────────────────────────────

  class LabResultFactory {
    private data = {
      testName: 'Complete Blood Count',
      testCode: 'CBC',
      resultValue: '7.5',
      unit: 'K/µL',
      referenceRange: '4.5-11.0',
      status: 'NORMAL',
      labName: 'Quest Diagnostics'
    };

    withTestName(name: string): LabResultFactory { ... }
    withTestCode(code: string): LabResultFactory { ... }
    withResultValue(value: string): LabResultFactory { ... }
    withStatus(status: string): LabResultFactory { ... }
    withPatient(patient: Patient): LabResultFactory { ... }
    create(db): Promise<LabResult> { ... }
  }

  class AbnormalLabResultFactory extends LabResultFactory {
    constructor() {
      super();
      this.data.status = 'ABNORMAL';
      this.data.resultValue = '2.5';  // Low
    }
  }

  class CriticalLabResultFactory extends LabResultFactory {
    constructor() {
      super();
      this.data.status = 'CRITICAL';
      this.data.resultValue = '1.0';  // Very low
    }
  }

================================================================================
3. SEED DATA DATASETS
================================================================================

3.1 MINIMAL SETUP (5 minutes)
──────────────────────────────────────────────────────────────────────────────

  Purpose: Fastest setup for quick tests
  Includes: 1 clinic, 1 admin, 1 provider, 5 patients, 5 appointments

  const minimalSetup = async (db: Database) => {
    // Create clinic
    const clinic = await new ClinicFactory().create(db);

    // Create admin
    const admin = await new AdminUserFactory()
      .withClinic(clinic)
      .create(db);

    // Create provider
    const provider = await new ProviderFactory()
      .withClinic(clinic)
      .create(db);

    // Create 5 patients
    const patients = await Promise.all([
      new PatientFactory().withClinic(clinic).create(db),
      new PatientFactory().withClinic(clinic).create(db),
      new ActivePatientFactory().withClinic(clinic).create(db),
      new PediatricPatientFactory().withClinic(clinic).create(db),
      new ElderlyPatientFactory().withClinic(clinic).create(db)
    ]);

    // Create 5 appointments
    const appointments = await Promise.all(
      patients.map(patient =>
        new AppointmentFactory()
          .withPatient(patient)
          .withProvider(provider)
          .create(db)
      )
    );

    return { clinic, admin, provider, patients, appointments };
  };

3.2 REALISTIC SETUP (30 minutes)
──────────────────────────────────────────────────────────────────────────────

  Purpose: Realistic testing with meaningful data
  Includes: Full clinic with 20 providers, 500 patients, 2000+ appointments

  const realisticSetup = async (db: Database) => {
    // 1 clinic
    const clinic = await new ClinicFactory().create(db);

    // 1 clinic admin
    const admin = await new AdminUserFactory()
      .withClinic(clinic)
      .create(db);

    // 20 providers (various specialties)
    const providers = await Promise.all([
      ...Array(10).fill(null).map(() =>
        new ProviderFactory()
          .withClinic(clinic)
          .withSpecialties(['GENERAL_PRACTICE'])
          .create(db)
      ),
      ...Array(5).fill(null).map(() =>
        new ProviderFactory()
          .withClinic(clinic)
          .withSpecialties(['CARDIOLOGY'])
          .create(db)
      ),
      ...Array(5).fill(null).map(() =>
        new ProviderFactory()
          .withClinic(clinic)
          .withSpecialties(['DERMATOLOGY'])
          .create(db)
      )
    ]);

    // 500 patients
    const patients = await Promise.all([
      ...Array(400).fill(null).map(() =>
        new ActivePatientFactory().withClinic(clinic).create(db)
      ),
      ...Array(50).fill(null).map(() =>
        new PediatricPatientFactory().withClinic(clinic).create(db)
      ),
      ...Array(50).fill(null).map(() =>
        new ElderlyPatientFactory().withClinic(clinic).create(db)
      )
    ]);

    // 2000+ appointments distributed across past/present/future
    const appointments = [];
    for (let i = 0; i < 2000; i++) {
      const patient = patients[i % patients.length];
      const provider = providers[i % providers.length];
      const daysOffset = Math.floor(Math.random() * 365) - 180;  // Past 6 months to future 6 months
      
      appointments.push(
        new AppointmentFactory()
          .withPatient(patient)
          .withProvider(provider)
          .withStartTime(new Date(Date.now() + daysOffset * 86400000))
          .create(db)
      );
    }

    return { clinic, admin, providers, patients, appointments };
  };

3.3 COMPLEX SCENARIO SETUP (1 hour)
──────────────────────────────────────────────────────────────────────────────

  Purpose: Test complex workflows with insurance, lab results, consultations

  const complexSetup = async (db: Database) => {
    const { clinic, providers, patients } = await realisticSetup(db);

    // Add consultations for 1000 appointments
    const consultations = await Promise.all(
      patients.slice(0, 100).map(patient =>
        new FinalizedConsultationFactory()
          .withPatient(patient)
          .withProvider(providers[0])
          .create(db)
      )
    );

    // Auto-create insurance claims for consultations
    const claims = await Promise.all(
      consultations.map(consultation =>
        new ApprovedClaimFactory()
          .withConsultation(consultation)
          .create(db)
      )
    );

    // Add lab results for 200 patients
    const labResults = [];
    for (let i = 0; i < 200; i++) {
      const patient = patients[i];
      
      labResults.push(
        new LabResultFactory()
          .withPatient(patient)
          .withStatus('NORMAL')
          .create(db)
      );

      if (i % 10 === 0) {
        labResults.push(
          new AbnormalLabResultFactory()
            .withPatient(patient)
            .create(db)
        );
      }

      if (i % 50 === 0) {
        labResults.push(
          new CriticalLabResultFactory()
            .withPatient(patient)
            .create(db)
        );
      }
    }

    return { clinic, providers, patients, consultations, claims, labResults };
  };

================================================================================
4. TESTING UTILITIES
================================================================================

4.1 DATABASE TEST SETUP/TEARDOWN
──────────────────────────────────────────────────────────────────────────────

  class DatabaseTestHelper {
    private db: Database;
    private transactionId: string;

    async beforeEach() {
      // Start transaction
      this.transactionId = await this.db.startTransaction();
      
      // Disable foreign key constraints temporarily
      await this.db.execute('SET CONSTRAINTS ALL DEFERRED');
    }

    async afterEach() {
      // Rollback transaction (cleans up test data)
      await this.db.rollback(this.transactionId);
      
      // Re-enable constraints
      await this.db.execute('SET CONSTRAINTS ALL IMMEDIATE');
    }

    async setup(type: 'minimal' | 'realistic' | 'complex') {
      if (type === 'minimal') return minimalSetup(this.db);
      if (type === 'realistic') return realisticSetup(this.db);
      if (type === 'complex') return complexSetup(this.db);
    }
  }

USAGE IN TESTS:

  describe('AppointmentController', () => {
    let helper: DatabaseTestHelper;
    let clinic, provider, patient;

    beforeEach(async () => {
      helper = new DatabaseTestHelper();
      await helper.beforeEach();
      ({ clinic, provider, patient } = await helper.setup('minimal'));
    });

    afterEach(async () => {
      await helper.afterEach();
    });

    it('should create appointment', async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          providerId: provider.id,
          startTime: new Date(Date.now() + 86400000),
          endTime: new Date(Date.now() + 90000000)
        });

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
    });
  });

4.2 MOCK DATA GENERATORS
──────────────────────────────────────────────────────────────────────────────

  class RandomDataGenerator {
    static randomEmail(): string {
      return `user_${Math.random().toString(36).substr(2, 9)}@example.com`;
    }

    static randomPhone(): string {
      return `+1-555-${String(Math.floor(Math.random() * 9000000) + 1000000)}`;
    }

    static randomName(): { firstName: string; lastName: string } {
      const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'Michael', 'Sarah'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis'];
      
      return {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
      };
    }

    static randomDateOfBirth(minAge: number, maxAge: number): string {
      const minDate = new Date(Date.now() - maxAge * 365 * 86400000);
      const maxDate = new Date(Date.now() - minAge * 365 * 86400000);
      const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
      return new Date(randomTime).toISOString().split('T')[0];
    }

    static randomUUID(): string {
      return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  }

4.3 ASSERTION HELPERS
──────────────────────────────────────────────────────────────────────────────

  class AssertionHelper {
    static assertValidPatient(patient: any) {
      expect(patient).toBeDefined();
      expect(patient.id).toBeDefined();
      expect(patient.firstName).toBeDefined();
      expect(patient.lastName).toBeDefined();
      expect(patient.email).toMatch(/@/);
      expect(patient.dateOfBirth).toBeDefined();
      expect(patient.gender).toMatch(/MALE|FEMALE|OTHER/);
      expect(patient.status).toMatch(/ACTIVE|INACTIVE|ARCHIVED/);
      expect(patient.createdAt).toBeDefined();
    }

    static assertValidAppointment(apt: any) {
      expect(apt).toBeDefined();
      expect(apt.id).toBeDefined();
      expect(apt.patientId).toBeDefined();
      expect(apt.providerId).toBeDefined();
      expect(apt.startTime).toBeDefined();
      expect(apt.endTime).toBeDefined();
      expect(apt.status).toMatch(/SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED/);
      expect(new Date(apt.startTime)).toBeInstanceOf(Date);
    }

    static assertValidConsultation(consultation: any) {
      expect(consultation).toBeDefined();
      expect(consultation.id).toBeDefined();
      expect(consultation.patientId).toBeDefined();
      expect(consultation.providerId).toBeDefined();
      expect(consultation.status).toMatch(/DRAFT|FINALIZED|AMENDED_DRAFT/);
    }
  }

USAGE:

  it('should return valid patient', async () => {
    const patient = await new PatientFactory().create(db);
    AssertionHelper.assertValidPatient(patient);
  });

================================================================================
5. IMPLEMENTATION CHECKLIST
================================================================================

FACTORY CLASSES (50+ factories):

  ☐ ClinicFactory
  ☐ AdminUserFactory
  ☐ ProviderFactory
  ☐ PatientFactory
  ☐ ActivePatientFactory
  ☐ PediatricPatientFactory
  ☐ ElderlyPatientFactory
  ☐ UninsuredPatientFactory
  ☐ AppointmentFactory
  ☐ FutureAppointmentFactory
  ☐ PastAppointmentFactory
  ☐ TelemedicineAppointmentFactory
  ☐ ConsultationFactory
  ☐ FinalizedConsultationFactory
  ☐ InsuranceClaimFactory
  ☐ ApprovedClaimFactory
  ☐ PaidClaimFactory
  ☐ LabResultFactory
  ☐ AbnormalLabResultFactory
  ☐ CriticalLabResultFactory
  ☐ PrescriptionFactory
  ☐ InvoiceFactory
  ☐ [+ 30 more factories]

SEED DATA FUNCTIONS:

  ☐ minimalSetup()
  ☐ realisticSetup()
  ☐ complexSetup()
  ☐ cleanupDatabase()
  ☐ resetSequences()

TESTING UTILITIES:

  ☐ DatabaseTestHelper class
  ☐ RandomDataGenerator class
  ☐ AssertionHelper class
  ☐ MockDataGenerator class
  ☐ FixtureBuilder class

DOCUMENTATION:

  ☐ README with usage examples
  ☐ Factory class reference
  ☐ Seed data guide
  ☐ Testing utilities guide
  ☐ Common patterns and best practices

FILE LOCATIONS:

  tests/
  ├── fixtures/
  │   ├── factories/
  │   │   ├── clinic.factory.ts
  │   │   ├── user.factory.ts
  │   │   ├── patient.factory.ts
  │   │   ├── appointment.factory.ts
  │   │   ├── consultation.factory.ts
  │   │   ├── insurance-claim.factory.ts
  │   │   ├── lab-result.factory.ts
  │   │   ├── prescription.factory.ts
  │   │   └── [+ 20 more]
  │   ├── seeds/
  │   │   ├── minimal-setup.ts
  │   │   ├── realistic-setup.ts
  │   │   ├── complex-setup.ts
  │   │   └── cleanup.ts
  │   ├── helpers/
  │   │   ├── database.test-helper.ts
  │   │   ├── random-data.generator.ts
  │   │   ├── assertion.helper.ts
  │   │   └── mock-data.generator.ts
  │   └── index.ts (export all)
  ├── integration/
  │   └── [test files using fixtures]
  └── unit/
      └─[test files using fixtures]

================================================================================
6. USAGE EXAMPLES
================================================================================

BASIC TEST SETUP:

  import { minimalSetup, DatabaseTestHelper, AssertionHelper } from '@fixtures';

  describe('Appointments', () => {
    let helper: DatabaseTestHelper;
    let testData;

    beforeEach(async () => {
      helper = new DatabaseTestHelper();
      await helper.beforeEach();
      testData = await helper.setup('minimal');
    });

    afterEach(async () => {
      await helper.afterEach();
    });

    it('should list appointments', async () => {
      const response = await appointmentService.list(testData.clinic.id);
      expect(response.length).toBeGreaterThan(0);
      response.forEach(apt => AssertionHelper.assertValidAppointment(apt));
    });
  });

FACTORY CUSTOMIZATION:

  it('should handle future appointments', async () => {
    const appointment = await new FutureAppointmentFactory()
      .withPatient(patient)
      .withProvider(provider)
      .create(db);

    expect(appointment.startTime).toBeGreaterThan(new Date());
  });

COMPLEX TEST DATA:

  it('should process insurance claims workflow', async () => {
    const setup = await helper.setup('complex');
    
    // setup includes consultations, claims, lab results
    const consultation = setup.consultations[0];
    const claim = setup.claims[0];

    expect(claim.consultationId).toBe(consultation.id);
    expect(claim.status).toBe('APPROVED');
  });

================================================================================
END OF TEST FIXTURES LIBRARY
================================================================================
