# Complete Phase 2.1 Setup Guide - PostgreSQL 18

## Overview
This guide walks you through setting up PostgreSQL 18 for the Clinical System application.

## Prerequisites Checklist
- ✅ PostgreSQL 18 installed
- ✅ Node.js installed
- ✅ npm installed
- ✅ Git (optional, for version control)

## Step-by-Step Setup

### Step 1: Create Database & User
Run the database setup script:
```powershell
.\scripts\setup-database.ps1
```

This script will:
- Prompt for the `postgres` superuser password (set during PostgreSQL installation)
- Create the `clinical_app` user with password `clinical_app_password`
- Create the `clinical_system` database
- Grant all necessary permissions

**Expected Output:**
```
✅ Database Setup Complete!

📋 Connection Details:
   Host: localhost
   Port: 5432
   Database: clinical_system
   User: clinical_app
   Password: clinical_app_password
```

### Step 2: Initialize Database Schema
Run the schema initialization script:
```powershell
.\scripts\initialize-schema.ps1
```

This script will:
- Create 8 tables with proper indexes
- Add foreign key relationships
- Insert 4 demo users (admin, doctor, nurse, patient)
- Insert 2 demo patients
- Set up the complete schema

**Expected Output:**
```
✅ Database schema initialized successfully!

📊 Tables created:
   • users
   • patients
   • appointments
   • consultations
   • prescriptions
   • lab_tests
   • audit_log
   • system_logs
```

### Step 3: Configure Environment
Copy the environment example file:
```powershell
Copy-Item config/.env.example config/.env
```

Verify the `.env` file contains:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=clinical_app
DB_PASSWORD=clinical_app_password
DB_NAME=clinical_system
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### Step 4: Install Dependencies
Navigate to backend directory and install npm packages:
```powershell
cd src/backend
npm install pg bcryptjs dotenv
npm install
```

This installs:
- `pg` - Node.js PostgreSQL client
- `bcryptjs` - Password hashing library
- `dotenv` - Environment variable management
- All other dependencies in package.json

### Step 5: Test Database Connection
Start the backend server:
```powershell
npm start
```

Look for console output:
```
✅ Database connection test successful!
  • Pool size: 2-10 connections
  • Database: clinical_system
  • User: clinical_app
```

### Step 6: Verify Login with Real Database
1. Open browser to `http://localhost:3000`
2. Try login with demo credentials:
   - **Email:** `admin@clinical.local`
   - **Password:** `password123` (hashed in database)
3. Should redirect to dashboard with real database session

## Database Structure

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Demo Users
1. **admin@clinical.local** - Admin role
2. **doctor@clinical.local** - Doctor role
3. **nurse@clinical.local** - Nurse role
4. **patient@clinical.local** - Patient role

All demo passwords are hashed versions of `password123`.

### Other Tables
- **patients** - Patient demographics & medical history
- **appointments** - Appointment scheduling
- **consultations** - Consultation records
- **prescriptions** - Medication prescriptions
- **lab_tests** - Lab test records
- **audit_log** - System audit trail
- **system_logs** - Detailed system logging

## Troubleshooting

### Issue: "psql: The term 'psql' is not recognized"
**Solution:** PostgreSQL bin directory not in PATH
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql --version
```

### Issue: "FATAL: password authentication failed for user 'postgres'"
**Solution:** Check postgres password
- During PostgreSQL installation, you set the postgres password
- Use that same password when running setup script

### Issue: "Database 'clinical_system' already exists"
**Solution:** This is OK! The script handles existing databases
- If you need a fresh database, drop the old one:
```sql
DROP DATABASE IF EXISTS clinical_system;
DROP USER IF EXISTS clinical_app;
```

### Issue: "ERROR: role 'clinical_app' already exists"
**Solution:** User already created, this is OK
- Continue with schema initialization

### Issue: "Connection refused" when starting backend
**Solution:** PostgreSQL server not running
- Windows: Start PostgreSQL from Services
- Mac: `brew services start postgresql@18`
- Linux: `sudo systemctl start postgresql`

## Verification Checklist

After completing all steps, verify:

- [ ] PostgreSQL 18 installed (`psql --version` returns 18.x)
- [ ] Database created (`clinical_system` exists)
- [ ] User created (`clinical_app` user exists)
- [ ] Schema initialized (8 tables exist)
- [ ] Demo data inserted (4 users visible)
- [ ] `.env` file configured
- [ ] npm packages installed (`node_modules` directory exists)
- [ ] Backend starts without errors
- [ ] Login page accessible at `http://localhost:3000`
- [ ] Demo credentials work with real database

## Performance Notes

### Connection Pool Configuration
- **Min connections:** 2 (default from pool)
- **Max connections:** 10 (production-ready)
- **Idle timeout:** 30 seconds
- **Connection timeout:** 2 seconds

This configuration is suitable for:
- Development environment: 2-3 concurrent connections
- Testing environment: 5-8 concurrent connections
- Small production: 8-10 concurrent connections

### Database Indexes
Optimized indexes for:
- User email lookups (unique)
- Patient by user_id
- Appointments by patient_id and time range
- Consultations by patient_id and status
- Audit log by user_id and action

## Next Steps (Phase 2.2)

Once Phase 2.1 is complete:

1. **Real Authentication Implementation**
   - Update `src/backend/routes/auth.js` to use database
   - Use User model for credential lookup
   - Implement password verification with bcryptjs

2. **Session Management**
   - Add session tracking in database
   - Implement logout with session invalidation

3. **Testing**
   - Run authentication tests
   - Verify database operations

## Reference Files

- **Setup Script:** `scripts/setup-database.ps1`
- **Schema Script:** `scripts/initialize-schema.ps1`
- **Database Schema:** `src/backend/database/schema.sql`
- **Connection Code:** `src/backend/database/connection.js`
- **Environment Config:** `config/.env` and `config/.env.example`
- **User Model:** `src/backend/models/User.js`

## Support

If you encounter issues:
1. Check `POSTGRESQL_INSTALLATION.md` for installation help
2. Review database logs in PostgreSQL
3. Test connection manually: `psql -U clinical_app -h localhost -d clinical_system`
4. Check `.env` file is correctly configured
5. Verify PostgreSQL server is running

---
**Last Updated:** January 31, 2026
**Version:** 1.0
**Status:** Phase 2.1 Complete Setup Guide
