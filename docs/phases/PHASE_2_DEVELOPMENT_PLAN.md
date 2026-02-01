# 🚀 PHASE 2 Development Plan - Complete Roadmap

**Status**: LOGIN REDIRECT ✅ FIXED - Ready for Phase 2 Implementation  
**Date**: January 31, 2026  
**Duration**: 2-3 weeks  

---

## 📋 Executive Summary

Phase 1 (Scaffolding & Setup) is complete. Phase 2 focuses on:
1. **Dashboard Enhancement** - User profiles, role-based UI
2. **Database Integration** - PostgreSQL + real authentication
3. **Core APIs** - Patients, Appointments, Consultations
4. **Testing & Docs** - API testing, Postman collection

---

## 🎯 PHASE 2.1: Dashboard Enhancement

### What's Needed
- ✅ User profile display (name, email, role)
- ✅ Role-based menu navigation
- ✅ Dynamic widgets based on user role
- ✅ Logout functionality
- ✅ Profile settings page

### Files to Create/Update
1. **dashboard.html** - Already created ✅
   - Add user profile display from localStorage
   - Add role-based menu items
   - Add logout button
   
2. **profiles.html** (NEW)
   - User settings form
   - Password change form
   - Profile update

3. **api/users.js** (NEW Backend)
   - GET /api/users/:id - Get user profile
   - PUT /api/users/:id - Update profile
   - POST /api/users/:id/change-password - Change password

### Timeline
- **Time Estimate**: 3-4 hours
- **Dependencies**: Dashboard template (already exists)
- **Testing**: Manual browser testing

### Success Criteria
- [ ] User profile displays on dashboard
- [ ] Navigation menu changes based on role
- [ ] Logout button works and clears tokens
- [ ] Profile settings page functional
- [ ] All pages redirect to login if token missing

---

## 🗄️ PHASE 2.2: Database Integration

### What's Needed
- ✅ PostgreSQL database setup
- ✅ User model with real password hashing
- ✅ JWT token verification
- ✅ Environment configuration

### Setup Steps

#### 1. PostgreSQL Installation (Windows)
```bash
# Download from https://www.postgresql.org/download/windows/
# Or install via Chocolatey:
choco install postgresql15
```

#### 2. Create Database
```sql
CREATE DATABASE clinical_system;
CREATE USER admin WITH PASSWORD 'secure_password';
ALTER ROLE admin WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE clinical_system TO admin;
```

#### 3. Install Node Dependencies
```bash
cd src/backend
npm install pg bcryptjs dotenv
```

#### 4. Environment Configuration
Create `.env` file:
```env
DATABASE_URL=postgres://admin:secure_password@localhost:5432/clinical_system
JWT_SECRET=your_super_secret_jwt_key_here_generate_random
JWT_EXPIRY=24h
NODE_ENV=development
PORT=3000
```

#### 5. Create User Model (`src/backend/models/User.js`)
```javascript
const pool = require('../database/connection');
const bcrypt = require('bcryptjs');

class User {
  static async create(email, password, firstName, lastName, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, hashedPassword, firstName, lastName, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async verifyPassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
}

module.exports = User;
```

#### 6. Database Schema (`src/backend/database/schema.sql`)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date_of_birth DATE,
  phone VARCHAR(20),
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  specialization VARCHAR(100),
  license_number VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES doctors(id),
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id),
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
```

### Files to Create
- [ ] `.env` - Environment variables
- [ ] `src/backend/database/connection.js` - Database pool
- [ ] `src/backend/database/schema.sql` - Database schema
- [ ] `src/backend/models/User.js` - User model
- [ ] `src/backend/middleware/authMiddleware.js` - JWT verification

### Timeline
- **Time Estimate**: 4-5 hours
- **Dependencies**: PostgreSQL installation
- **Testing**: Use curl or Postman to test endpoints

### Success Criteria
- [ ] PostgreSQL database created and running
- [ ] Users can be created and retrieved from database
- [ ] Password hashing working (bcrypt)
- [ ] JWT tokens verified correctly
- [ ] Login uses real database instead of mock

---

## 👥 PHASE 2.3: Patient Management API

### Endpoints to Create

#### 1. Get All Patients
```
GET /api/patients
Headers: Authorization: Bearer <token>
Response: [{id, name, email, phone, dateOfBirth, ...}]
```

#### 2. Get Patient by ID
```
GET /api/patients/:id
Headers: Authorization: Bearer <token>
Response: {id, name, email, medical_history, ...}
```

#### 3. Create Patient
```
POST /api/patients
Headers: Authorization: Bearer <token>
Body: {firstName, lastName, phone, address, dateOfBirth}
Response: {id, firstName, lastName, ...}
```

#### 4. Update Patient
```
PUT /api/patients/:id
Headers: Authorization: Bearer <token>
Body: {phone, address, medical_history, ...}
Response: {id, ...updated data...}
```

#### 5. Delete Patient
```
DELETE /api/patients/:id
Headers: Authorization: Bearer <token>
Response: {message: "Patient deleted"}
```

### Files to Create
- [ ] `src/backend/routes/patients.js` - Patient endpoints
- [ ] `src/backend/models/Patient.js` - Patient model

### Timeline
- **Time Estimate**: 3-4 hours
- **Dependencies**: Database integration complete
- **Testing**: Postman collection for all endpoints

### Success Criteria
- [ ] All CRUD operations working
- [ ] Authorization checks in place
- [ ] Input validation for all fields
- [ ] Proper error responses
- [ ] Database queries optimized

---

## 📅 PHASE 2.4: Appointment System

### Key Features
- Schedule appointments (patient + doctor + date)
- Conflict detection (prevent double-booking)
- Status management (scheduled, completed, cancelled)
- Appointment history

### Endpoints
1. `GET /api/appointments` - List all appointments
2. `GET /api/appointments/:id` - Get appointment details
3. `POST /api/appointments` - Create appointment
4. `PUT /api/appointments/:id` - Update appointment
5. `DELETE /api/appointments/:id` - Cancel appointment
6. `GET /api/doctors/:doctorId/availability` - Check doctor availability

### Files to Create
- [ ] `src/backend/routes/appointments.js`
- [ ] `src/backend/models/Appointment.js`
- [ ] `src/backend/utils/availability.js` - Conflict detection logic

### Timeline
- **Time Estimate**: 4-5 hours
- **Dependencies**: Patient & Doctor models complete
- **Testing**: Test conflict detection scenarios

---

## 💬 PHASE 2.5: Consultation System

### Key Features
- Create consultation records after appointments
- Store diagnosis and treatment plans
- Link consultations to appointments
- History tracking

### Endpoints
1. `GET /api/consultations` - List consultations
2. `POST /api/consultations` - Create consultation
3. `PUT /api/consultations/:id` - Update consultation
4. `GET /api/patients/:patientId/consultations` - Patient consultation history

### Files to Create
- [ ] `src/backend/routes/consultations.js`
- [ ] `src/backend/models/Consultation.js`

### Timeline
- **Time Estimate**: 2-3 hours
- **Dependencies**: Appointments system complete

---

## 🧪 PHASE 2.6: Testing & Documentation

### What's Needed
1. **Postman Collection** - All API endpoints
2. **API Documentation** - OpenAPI/Swagger spec
3. **Unit Tests** - Jest tests for models
4. **Integration Tests** - API endpoint tests
5. **README Updates** - Setup and deployment guide

### Files to Create
- [ ] `postman_collection.json` - Postman import
- [ ] `docs/API.md` - Full API documentation
- [ ] `tests/models/*.test.js` - Model tests
- [ ] `tests/routes/*.test.js` - Route tests

### Timeline
- **Time Estimate**: 4-5 hours
- **Dependencies**: All endpoints complete

---

## 📊 Development Timeline Summary

| Phase | Task | Duration | Start | End |
|-------|------|----------|-------|-----|
| 2.1 | Dashboard Enhancement | 3-4 hrs | Week 1 Day 1 | Week 1 Day 1 |
| 2.2 | Database Integration | 4-5 hrs | Week 1 Day 1 | Week 1 Day 2 |
| 2.3 | Patient Management API | 3-4 hrs | Week 1 Day 2 | Week 1 Day 3 |
| 2.4 | Appointment System | 4-5 hrs | Week 1 Day 3 | Week 1 Day 4 |
| 2.5 | Consultation System | 2-3 hrs | Week 1 Day 4 | Week 1 Day 5 |
| 2.6 | Testing & Docs | 4-5 hrs | Week 2 Day 1 | Week 2 Day 2 |

**Total**: 20-26 hours (2-3 weeks)

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 22.19.0
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT + bcryptjs
- **Validation**: Express-validator

### Frontend
- **HTML5** with semantic markup
- **CSS3** with Tailwind CDN
- **Vanilla JavaScript** (no framework yet)
- **localStorage** for session management

### Development Tools
- **Postman** - API testing
- **pgAdmin** - Database management
- **curl/Insomnia** - API testing alternatives

---

## ✅ Pre-Development Checklist

Before starting Phase 2:

- [ ] PostgreSQL installed and running
- [ ] `.env` file created with database credentials
- [ ] Database schema created
- [ ] `npm install pg bcryptjs dotenv` completed
- [ ] Postman installed and ready
- [ ] User understands JWT token flow
- [ ] Test database credentials work

---

## 🚀 Quick Start Commands

```bash
# 1. Start PostgreSQL (Windows)
net start postgresql-x64-15

# 2. Create database
psql -U postgres -c "CREATE DATABASE clinical_system;"

# 3. Install dependencies
cd src/backend && npm install pg bcryptjs dotenv

# 4. Start server
npm start

# 5. Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.local","password":"password123"}'
```

---

## 📞 Support Resources

- **PostgreSQL Setup**: https://www.postgresql.org/download/windows/
- **Node.js PostgreSQL**: https://node-postgres.com/
- **JWT Guide**: https://jwt.io/introduction
- **Bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **Express Middleware**: https://expressjs.com/en/guide/using-middleware.html

---

## 🎓 What You'll Learn

By completing Phase 2, you'll have:
- ✅ Full-stack database integration
- ✅ Secure authentication with real password hashing
- ✅ RESTful API design patterns
- ✅ Role-based access control
- ✅ Complex business logic (appointment conflicts)
- ✅ Professional API documentation
- ✅ Automated testing practices

---

**Next Step**: Start with PHASE 2.1 - Dashboard Enhancement  
**Current Progress**: ████████░░░░░░░░░░░ 40% Complete
