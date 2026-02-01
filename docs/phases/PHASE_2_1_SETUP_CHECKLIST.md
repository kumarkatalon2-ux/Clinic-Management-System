# ✅ Phase 2.1 Setup Checklist

**Status:** Phase 2.1a ✅ COMPLETE | Phase 2.1b 🔄 IN PROGRESS (awaiting you)

---

## 📋 PRE-SETUP VERIFICATION

- [x] PostgreSQL 18 installed (`psql --version` = 18.1)
- [x] PostgreSQL 18 bin in PATH
- [ ] Know the `postgres` superuser password (set during installation)
- [x] Backend files prepared (12 files ready)
- [x] Documentation provided (4+ files)
- [x] Setup scripts created (2 PowerShell scripts)

---

## 🎯 SETUP STEPS (Your Turn - ~15 minutes)

### Step 1: Create Database & User (2-3 minutes)

Choose ONE of these methods:

**Option A: Using pgAdmin (GUI - Recommended)**
- [ ] Open pgAdmin 4 from Start Menu
- [ ] Create new server connection
- [ ] Run SQL commands:
```sql
CREATE USER clinical_app WITH PASSWORD 'clinical_app_password';
CREATE DATABASE clinical_system WITH OWNER clinical_app;
GRANT ALL PRIVILEGES ON DATABASE clinical_system TO clinical_app;
```

**Option B: Using Command Line**
- [ ] Open PowerShell as Administrator
- [ ] Run:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres
```
- [ ] Enter postgres password when prompted
- [ ] Run SQL commands above
- [ ] Type `\q` to exit

**Or Option C: Using PowerShell Script**
- [ ] Run: `.\scripts\setup-database.ps1`
- [ ] Follow prompts

**Verification:**
- [ ] Can connect to `clinical_system`: `psql -U clinical_app -h localhost -d clinical_system`

---

### Step 2: Initialize Database Schema (3-5 minutes)

Run schema initialization:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U clinical_app -h localhost -d clinical_system -f src/backend/database/schema.sql
```

Or use script:
```powershell
.\scripts\initialize-schema.ps1
```

**Verification:**
- [ ] Command runs without errors
- [ ] See output: "✅ Database schema initialized successfully!"
- [ ] Or manually verify tables: `psql -U clinical_app -h localhost -d clinical_system -c "\dt"`

**Expected Output:**
```
        List of relations
 Schema |       Name       | Type  |    Owner
--------+------------------+-------+-----------
 public | appointments     | table | clinical_app
 public | audit_log        | table | clinical_app
 public | consultations    | table | clinical_app
 public | lab_tests        | table | clinical_app
 public | patients         | table | clinical_app
 public | prescriptions    | table | clinical_app
 public | system_logs      | table | clinical_app
 public | users            | table | clinical_app
(8 rows)
```

---

### Step 3: Configure Environment (1-2 minutes)

- [ ] Copy `config/.env.example` to `config/.env`:
```powershell
Copy-Item config/.env.example config/.env
```

- [ ] Verify `config/.env` contains:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=clinical_app
DB_PASSWORD=clinical_app_password
DB_NAME=clinical_system
DB_POOL_MIN=2
DB_POOL_MAX=10
```

---

### Step 4: Install npm Dependencies (3-5 minutes)

```powershell
cd src/backend
npm install
```

**Verification:**
- [ ] No errors in output
- [ ] `node_modules` directory created
- [ ] `package-lock.json` updated

---

### Step 5: Test Database Connection (5 minutes)

Start the backend server:
```powershell
npm start
```

**Expected Output:**
```
Server running on http://localhost:3000
✅ Database connection test successful!
  • Connection pool: 2-10 connections
  • Database: clinical_system
  • User: clinical_app
  • Host: localhost
  • Port: 5432
```

**Verification:**
- [ ] See "✅ Database connection test successful!"
- [ ] No error messages about database connection
- [ ] Server continues running
- [ ] Can access http://localhost:3000 in browser

---

### Step 6: Test Login (5 minutes)

- [ ] Open http://localhost:3000 in browser
- [ ] Try demo credentials:
  - **Email:** `admin@clinical.local`
  - **Password:** `password123`
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard
- [ ] Dashboard shows user profile

**Verification:**
- [ ] Login page appears (http://localhost:3000)
- [ ] Demo credentials accepted
- [ ] Redirect to dashboard works
- [ ] User profile displays correctly

---

## 🎉 Phase 2.1 Complete Checklist

When all above steps are done:

- [ ] Database `clinical_system` created
- [ ] User `clinical_app` created with password
- [ ] Schema initialized (8 tables exist)
- [ ] `config/.env` configured
- [ ] npm packages installed
- [ ] Backend server starts without errors
- [ ] Database connection test passes
- [ ] Login with demo credentials works
- [ ] Dashboard displays after login

---

## 📞 TROUBLESHOOTING

### Problem: "psql: The term 'psql' is not recognized"
**Solution:** Add PostgreSQL to PATH:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql --version
```

### Problem: "FATAL: password authentication failed"
**Solution:** 
- Wrong postgres password entered
- Try default: `postgres`, `password`, `admin`, or blank
- Or reinstall PostgreSQL with known password

### Problem: "Database 'clinical_system' already exists"
**Solution:** This is OK! Script handles existing databases.
- If you want fresh setup, drop old database:
```sql
DROP DATABASE IF EXISTS clinical_system;
DROP USER IF EXISTS clinical_app;
```
- Then repeat steps 1-2

### Problem: "ERROR: role 'clinical_app' already exists"
**Solution:** User already created, this is OK!
- Continue to Step 2 (initialize schema)

### Problem: "Connection refused" when starting backend
**Solution:** PostgreSQL server not running
- Windows: Start PostgreSQL from Services
- Verify: `psql -U postgres -c "SELECT version();"`

### Problem: "Database connection test failed" in backend
**Solution:**
1. Verify database exists: `psql -U clinical_app -h localhost -d clinical_system`
2. Check `.env` file credentials
3. Verify PostgreSQL service is running
4. Check firewall isn't blocking port 5432

### Problem: Database schema initialization fails
**Solution:**
1. Verify you're connected to `clinical_system`:
```powershell
psql -U clinical_app -h localhost -d clinical_system -c "\db"
```
2. Check schema file exists: `ls src/backend/database/schema.sql`
3. Try running schema manually in pgAdmin

---

## 📊 Demo Data Included

After schema initialization, you'll have:

**Users (4 demo accounts):**
1. admin@clinical.local (Admin role)
2. doctor@clinical.local (Doctor role)
3. nurse@clinical.local (Nurse role)
4. patient@clinical.local (Patient role)

All passwords are hashed versions of: `password123`

**Patients (2 demo records):**
- John Doe (associated with patient@clinical.local)
- Jane Smith (demo patient)

**Appointments (1 demo record):**
- Appointment between patient and doctor

---

## 📝 Next Steps After Phase 2.1

Once you report "database setup complete", I will:

1. **Phase 2.2: Real Authentication** (2-3 hours)
   - Update auth.js to use database queries
   - Implement bcryptjs password hashing
   - Add session management
   - Replace mock credentials

2. **Phase 2.3: Patient API** (2-3 hours)
   - Build CRUD endpoints
   - Add validation
   - Create patient management endpoints

3. **Phase 2.4: Appointment System** (3-4 hours)
   - Implement scheduling
   - Add conflict detection
   - Build appointment API

And continue with Phases 2.5 and 2.6...

---

## 📚 Reference Files

- **PHASE_2_1_QUICK_START.md** - Quick setup reference
- **PHASE_2_1_COMPLETE_SETUP.md** - Detailed step-by-step guide
- **PHASE_2_1_STATUS_REPORT.md** - Current progress report
- **PHASE_2_1_RESOURCE_INDEX.md** - Complete file index

---

## ✨ Success Indicator

**Phase 2.1 is complete when:**
1. ✅ 8 tables exist in clinical_system database
2. ✅ clinical_app user can connect
3. ✅ Backend starts with "Database connection test successful!"
4. ✅ Login works with real database
5. ✅ Dashboard displays after login

---

**Status:** Ready for your database setup!  
**Expected Time:** ~15 minutes  
**Next Milestone:** Phase 2.1 COMPLETE ✅  
**Then:** Phase 2.2 Real Authentication Implementation

---

**Instructions for User:**
1. Complete all steps in this checklist
2. Verify all boxes are checked
3. Report: "database setup complete"
4. Agent will proceed to Phase 2.2
