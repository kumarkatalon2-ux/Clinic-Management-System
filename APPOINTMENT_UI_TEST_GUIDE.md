# 🧪 Appointment Feature - UI Testing Guide

**Status:** ✅ READY FOR TESTING

---

## Quick Test Steps

### 1. **Login**
- Open http://localhost:3000
- Email: `admin@clinic.com`
- Password: `admin123`
- Click "Login"

### 2. **Navigate to Appointments**
- Click the sidebar menu: "📅 Appointments"
- OR click the "Appointments" card on the dashboard

### 3. **View Existing Appointments**
- The appointments list will load automatically
- Shows all scheduled appointments
- Each appointment displays:
  - Type (consultation, checkup, etc.)
  - Location (room number)
  - Patient & Provider IDs
  - Status (scheduled/completed/cancelled)
  - Start and end times
  - Notes

### 4. **Schedule New Appointment**
- Click "+ Schedule New Appointment" button
- Fill in the form:
  - Patient ID: `1` (John Doe)
  - Provider ID: `2` (Dr. John Smith)
  - Type: Choose from dropdown (consultation, checkup, follow-up, etc.)
  - Start Date/Time: Select from date picker (set to future date)
  - End Date/Time: Automatically 30 minutes after start
  - Location: `Room 101` (example)
  - Notes: Add any clinical notes
- Click "Schedule Appointment"
- Success message will appear
- New appointment appears in the list

### 5. **Complete an Appointment**
- Click the "Complete" button on any appointment
- Appointment status changes to "completed"
- List refreshes automatically

### 6. **Cancel an Appointment**
- Click the "Cancel" button on any appointment
- Confirm the cancellation
- Appointment status changes to "cancelled"
- List refreshes automatically

---

## Expected Behavior

✅ **Login works** - Uses real database authentication  
✅ **Appointments load** - Fetches from API with JWT token  
✅ **Scheduling works** - Creates new appointment with conflict detection  
✅ **Status updates** - Complete/Cancel buttons modify appointment status  
✅ **Error handling** - Shows error messages for failed operations  
✅ **Time validation** - Won't allow past dates or invalid times  
✅ **Conflict prevention** - Same provider can't have overlapping times  

---

## Demo Credentials

**Login Options:**
- Admin: admin@clinic.com / admin123
- Doctor: doctor@clinic.com / doctor123
- Nurse: nurse@clinic.com / nurse123
- Patient: patient@clinic.com / patient123

**Demo Patients:**
- Patient ID 1: John Doe (MRN-001)
- Patient ID 2: Jane Doe (MRN-002)

**Demo Providers:**
- Provider ID 2: Dr. John Smith (doctor@clinic.com)

---

## API Endpoints Being Tested

```
POST   /api/appointments           ← Schedule new appointment
GET    /api/appointments           ← List all appointments
GET    /api/appointments/:id       ← Get appointment details
PUT    /api/appointments/:id       ← Update status (complete/cancel)
DELETE /api/appointments/:id       ← Cancel appointment
```

All endpoints require JWT token and proper authentication.

---

## Backend Status

✅ Running on http://localhost:3000  
✅ PostgreSQL connected (clinical_system database)  
✅ Demo users seeded with bcrypt passwords  
✅ Appointment table created with proper schema  
✅ Conflict detection enabled  
✅ Error handling implemented  

---

## Next Steps

After confirming UI testing works:
1. Move to Phase 2.5 - Consultation System
2. Build consultation routes (similar structure)
3. Add consultation UI to dashboard
4. Implement follow-up tracking

---

**Status:** Phase 2.4 Complete - Appointment System ✅  
**Time Spent:** ~1.5 hours on backend + routing  
**Overall Progress:** ~60% (14.5 of 23.5 hours)
