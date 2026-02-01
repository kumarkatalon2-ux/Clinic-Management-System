# Phase 2 Backend: Quick Reference Guide

## 🎯 What's Ready to Use After PostgreSQL Installation

### File Locations
```
src/backend/
├── models/
│   ├── User.js         ← User authentication & management
│   ├── Patient.js      ← Patient medical records
│   └── Appointment.js  ← Appointment scheduling
├── middleware/
│   └── auth.js         ← JWT & role verification
├── utils/
│   ├── validation.js   ← Input validation
│   ├── logger.js       ← Logging utility
│   └── errors.js       ← Error handling
├── tests/
│   ├── database.test.js      ← DB connectivity tests
│   ├── models.test.js        ← Model functionality tests
│   └── phase2-setup.js       ← Full setup runner
└── database/
    ├── connection.js   ← Connection pool
    └── schema.sql      ← Database schema
```

---

## 📝 Usage Examples

### User Model
```javascript
const User = require('./models/User');

// Create new user
const user = await User.create({
  email: 'john@example.com',
  password: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe',
  role: 'patient'
});

// Find by email
const user = await User.findByEmail('john@example.com');

// Verify password
const isValid = await User.verifyPassword('SecurePass123!', user.password_hash);

// Get user profile
const profile = await User.getProfile(userId);

// List users with pagination
const result = await User.listUsers(10, 0);
```

### Patient Model
```javascript
const Patient = require('./models/Patient');

// Create patient record
const patient = await Patient.create({
  user_id: 5,
  mrn: 'MR-001234',
  dob: '1990-05-15',
  gender: 'male',
  blood_type: 'O+',
  allergies: ['Penicillin', 'Sulfa'],
  medical_conditions: ['Hypertension', 'Diabetes']
});

// Find by medical record number
const patient = await Patient.findByMRN('MR-001234');

// Get patient statistics
const stats = await Patient.getStatistics();

// List patients with pagination
const result = await Patient.listPatients(10, 0);
```

### Appointment Model
```javascript
const Appointment = require('./models/Appointment');

// Create appointment
const appointment = await Appointment.create({
  patient_id: 1,
  provider_id: 2,
  type: 'consultation',
  status: 'scheduled',
  start_time: '2026-02-01T10:00:00',
  end_time: '2026-02-01T10:30:00',
  location: 'Room 101',
  notes: 'Initial consultation'
});

// Get patient appointments
const appointments = await Appointment.getPatientAppointments(patientId, {
  status: 'scheduled',
  limit: 10,
  offset: 0
});

// Check for conflicts
const hasConflict = await Appointment.checkConflict(
  providerId,
  '2026-02-01T10:00:00',
  '2026-02-01T10:30:00'
);

// Cancel appointment
const cancelled = await Appointment.cancel(appointmentId);
```

### Validation
```javascript
const { validateEmail, validatePassword, validateLoginCredentials } = require('./utils/validation');

// Validate email
const isValidEmail = validateEmail('john@example.com'); // true

// Validate password strength
const result = validatePassword('WeakPass');
// {
//   valid: false,
//   errors: [
//     'Password must be at least 8 characters long',
//     'Password must contain at least one special character (!@#$%^&*)'
//   ]
// }

// Validate login credentials
const validation = validateLoginCredentials({
  email: 'john@example.com',
  password: 'SecurePass123!'
});
// { valid: true, errors: [] }
```

### Logger
```javascript
const { logger } = require('./utils/logger');

// Different log levels
logger.error('An error occurred', { code: 500 });
logger.warn('This is a warning', { deprecated: true });
logger.info('Information message', { status: 'ok' });
logger.debug('Debug information', { data: 'value' });
logger.success('Operation successful', { id: 123 });

// Create child logger
const userLogger = logger.child('UserService');
```

### Error Handling
```javascript
const { BadRequestError, ValidationError, NotFoundError } = require('./utils/errors');

// Throw custom errors
throw new BadRequestError('Invalid input', { field: 'email' });
throw new ValidationError('Registration failed', ['Email invalid', 'Password weak']);
throw new NotFoundError('User not found', { userId: 123 });
```

---

## ✅ Testing Checklist

### After PostgreSQL Installation:

- [ ] PostgreSQL installed: `psql --version`
- [ ] Database created: `psql -U clinical_app -d clinical_system -c "SELECT 1"`
- [ ] Schema initialized: `psql -U clinical_app -d clinical_system -c "\dt"`
- [ ] Config file set up: `config/.env` exists
- [ ] Dependencies installed: `npm list pg bcryptjs dotenv`

### Run Tests:
```bash
# From src/backend directory
cd src/backend

# Full setup runner (runs all checks)
node tests/phase2-setup.js

# Database connectivity tests
node tests/database.test.js

# Model functionality tests
node tests/models.test.js

# Start server (should connect to DB successfully)
npm start
```

### Expected Success Output:
```
✅ Database connection test successful
✅ All database tables found (8 tables)
✅ All tests passed (4/4)
🎉 Phase 2.1 is ready!
Server listening on http://localhost:3000
```

---

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

### JWT Authentication
- 24-hour expiration by default
- Stored in Authorization header: `Bearer <token>`
- Verified on protected routes
- Role-based access control (RBAC) middleware

### Input Validation
- Email format validation
- XSS prevention (input sanitization)
- SQL injection prevention (parameterized queries)
- Type validation for all inputs

---

## 📊 Database Schema (8 Tables)

1. **users** - User accounts & authentication
2. **patients** - Patient medical records
3. **appointments** - Appointment scheduling
4. **consultations** - Consultation tracking
5. **prescriptions** - Medication prescriptions
6. **lab_tests** - Laboratory tests
7. **audit_log** - Activity tracking
8. **notifications** - System notifications

Each table has:
- Primary keys
- Foreign keys for relationships
- Indexes for performance
- Timestamps (created_at, updated_at)
- Status fields for soft deletes

---

## 🚀 Phase 2.2 Next Steps

Once Phase 2.1 is complete and tests pass:

1. Update `routes/auth.js` to use User model for login
2. Implement real password verification with bcryptjs
3. Create user registration endpoint
4. Test database-backed authentication
5. Update frontend login to use real API

---

## 💡 Tips

- All models handle JSON fields (allergies, medical_conditions)
- Soft deletes supported (deleted_at field, not actually removed)
- Pagination built into list methods
- Connection pooling handles concurrent requests
- Logging color-coded for easy reading
- Error responses are consistent JSON format

---

## 📞 Need Help?

Check these files:
- `PHASE_2_BACKEND_PREPARATION.md` - Complete setup guide
- `POSTGRESQL_INSTALLATION.md` - PostgreSQL setup
- `src/backend/database/schema.sql` - Database structure
- `src/backend/routes/auth.js` - Current authentication

---

**Status:** ✅ Ready to test!  
**Waiting for:** PostgreSQL 18 installation
