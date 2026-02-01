# Quick Start Testing Guide - After Database Fix

## What Was Fixed

The dashboard was showing empty data because:
- ❌ Patient.js was querying `p.dob` instead of `p.date_of_birth`
- ❌ Patient.js was querying `p.insurance_member_id` instead of `p.insurance_policy_number`
- ❌ Billing.js was querying non-existent `billing`, `invoices`, and `payments` tables

**Now Fixed**: ✅ All models align with database schema

---

## How to Test

### Step 1: Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@clinic.com",
    "password": "doctor123"
  }'
```

**Expected Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 2,
    "email": "doctor@clinic.com",
    "role": "doctor",
    ...
  }
}
```

**Save the token** - You'll need it for the next requests.

---

### Step 2: Get All Patients (from Real Database)

```bash
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (Real data from database):
```json
{
  "message": "Patients retrieved successfully",
  "data": {
    "patients": [
      {
        "id": 1,
        "user_id": 4,
        "mrn": "MRN-001",
        "date_of_birth": "1985-03-15",
        "gender": "Male",
        "blood_type": "O+",
        ...
      },
      {
        "id": 2,
        "user_id": 1,
        "mrn": "MRN-002",
        "date_of_birth": "1990-07-20",
        "gender": "Female",
        "blood_type": "A-",
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  }
}
```

**✅ If you see 2 patients with real data**: Database fix is working!
**❌ If you see 0 patients or errors**: There's still an issue.

---

### Step 3: Create a New Patient

```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 4,
    "mrn": "MRN-003",
    "date_of_birth": "1992-05-10",
    "gender": "Female",
    "blood_type": "B+",
    "allergies": ["Shellfish"],
    "medical_conditions": ["Asthma"],
    "insurance_provider": "Blue Cross",
    "insurance_policy_number": "BC-12345-67890",
    "emergency_contact_name": "Jane Smith",
    "emergency_contact_phone": "555-0005"
  }'
```

**Expected Response** (Success):
```json
{
  "message": "Patient created successfully",
  "patient": {
    "id": 3,
    "user_id": 4,
    "mrn": "MRN-003",
    "date_of_birth": "1992-05-10",
    ...
  }
}
```

**✅ If patient is created**: CREATE operations working!
**❌ If you get errors**: Check the error message in response.

---

### Step 4: Get Appointments

```bash
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: Should return list of appointments (or empty array if none exist yet).

---

### Step 5: Get Billing/Invoices

```bash
curl -X GET http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: Should return list of invoices (or empty array if none exist yet).

---

## Using the Web Dashboard

1. **Open browser**: http://localhost:3000
2. **Login** with credentials:
   - Email: `doctor@clinic.com`
   - Password: `doctor123`

3. **Check each module**:
   - Patients: Should show 2 patients (MRN-001, MRN-002)
   - Appointments: Should show any scheduled appointments
   - Consultations: Should show any consultations
   - Billing: Should show any invoices

---

## Demo Credentials for Testing

```
Administrator:
  Email: admin@clinic.com
  Password: admin123

Doctor:
  Email: doctor@clinic.com
  Password: doctor123

Nurse:
  Email: nurse@clinic.com
  Password: nurse123

Patient:
  Email: patient@clinic.com
  Password: patient123
```

---

## Troubleshooting

### Problem: "No patients showing" or "0 patients"
**Solution**: Check if Patient.js column names are correct:
- Look for `p.date_of_birth` (NOT `p.dob`)
- Look for `p.insurance_policy_number` (NOT `p.insurance_member_id`)

### Problem: "Invoices not working"
**Solution**: Check if Billing.js is using correct table:
- Look for `FROM invoices` (NOT `FROM billing`)
- Look for `INSERT INTO invoices` (NOT `INSERT INTO billing`)

### Problem: "Database connection error"
**Solution**: 
1. Verify PostgreSQL is running on localhost:5432
2. Check if database `clinical_system` exists
3. Verify schema was created with: `node reinitialize-db.js`

### Problem: "Column does not exist" errors
**Solution**: This was the original issue that's now fixed. If you still see it:
1. Restart the server: `npm start` (in src/backend directory)
2. Reinitialize database: `node reinitialize-db.js`

---

## Files That Were Fixed

| File | Issue | Fix |
|------|-------|-----|
| `src/backend/models/Patient.js` | Wrong column names (dob, insurance_member_id) | Changed to date_of_birth, insurance_policy_number |
| `src/backend/database/schema.sql` | Missing invoices & payments tables | Added 2 new tables with proper schema |
| `src/backend/models/Billing.js` | Queries wrong table names | Rewritten to use correct table references |

---

## Success Criteria

✅ **Database fix is successful when**:
1. GET /api/patients returns 2 demo patients from database
2. POST /api/patients can create new patients
3. GET /api/invoices returns empty array (no errors)
4. Dashboard loads all modules without empty states
5. Server logs show database queries (no fallback data messages)

---

## Next Phase: Comprehensive Testing

After confirming database integration works:

1. **Unit Tests**: Test each API endpoint
2. **Integration Tests**: Test data flow from database to frontend
3. **Load Tests**: Test system under multiple concurrent requests
4. **Data Validation**: Test creating invalid data (should reject)
5. **Error Handling**: Test error scenarios

---

## Support

If you encounter issues:

1. Check the **DATABASE_INTEGRATION_FIX_REPORT.md** for detailed fix documentation
2. Review server logs for error messages
3. Verify database connection: `psql -h localhost -d clinical_system -U postgres`
4. Check that PostgreSQL is running: `pg_isready -h localhost`

---

*Date: 2026-02-01*
*Status: Ready for Testing*
