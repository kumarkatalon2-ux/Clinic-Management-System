# ⚡ IMMEDIATE SETUP - Phase 2.1 Database Configuration

## 🎯 What You Need To Do Now

PostgreSQL 18 is installed! Now we need to:
1. Create the database and user
2. Initialize the schema
3. Start the backend server

## 📝 Manual Setup (If Scripts Don't Work)

### Step 1: Open PostgreSQL Admin Tool
On Windows, PostgreSQL installed with a GUI admin tool. Use this method:

**Option A: Using pgAdmin (Recommended)**
1. Open pgAdmin from Start Menu (search "pgAdmin 4")
2. Right-click "Servers" → "Register" → "Server"
3. Connection tab:
   - Name: `Clinical System`
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (the password you set during PostgreSQL installation)
4. Click Save

**Option B: Using Command Line**
1. Open PowerShell
2. Run:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres
```
3. When prompted for password, enter the postgres password from installation

### Step 2: Create User & Database

In PostgreSQL (pgAdmin or psql), run these commands:

```sql
-- Create the clinical_app user
CREATE USER clinical_app WITH PASSWORD 'clinical_app_password';

-- Create the database
CREATE DATABASE clinical_system WITH OWNER clinical_app;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE clinical_system TO clinical_app;

-- Verify (should show clinical_system database)
\l clinical_system
```

### Step 3: Initialize Schema

Once database is created, run in PowerShell:

```powershell
cd "C:\Users\Kumar\Desktop\Clinical Project"
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U clinical_app -h localhost -d clinical_system -f src/backend/database/schema.sql
```

When prompted for password, enter: `clinical_app_password`

This will create all 8 tables automatically.

### Step 4: Verify Setup

Check that database has tables:

```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U clinical_app -h localhost -d clinical_system -c "\dt"
```

You should see:
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

### Step 5: Setup Environment File

Copy the environment template:
```powershell
Copy-Item config/.env.example config/.env
```

Verify `config/.env` contains:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=clinical_app
DB_PASSWORD=clinical_app_password
DB_NAME=clinical_system
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### Step 6: Install npm Packages

```powershell
cd src/backend
npm install
```

### Step 7: Start Backend Server

```powershell
npm start
```

Watch for this success message:
```
✅ Database connection test successful!
```

If you see it, Phase 2.1 is complete! 🎉

## 🔍 Troubleshooting

### "Password authentication failed"
- The postgres password might be different
- Try these common defaults: `postgres`, `password`, `admin`, or blank
- Or reinstall PostgreSQL and choose a simple password

### "Database already exists"
- Great! Just reinitialize the schema

### "Could not create client"
- PostgreSQL service might not be running
- Windows: Start → Services → Look for "postgresql" → Right-click → Start

### "psql not found"
- Add to PATH: `$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"`
- Then try again

## ✅ Success Indicators

After completing these steps, you should see:

1. ✅ 8 tables in clinical_system database
2. ✅ clinical_app user can connect
3. ✅ Backend starts without database errors
4. ✅ Login page works with real database
5. ✅ Demo user data inserted (4 users)

## 📞 Next Steps

Once database is verified:
1. **Test Login:** http://localhost:3000
   - Email: `admin@clinical.local`
   - Password: `password123`

2. **Phase 2.2:** Real authentication implementation with database

3. **Phase 2.3:** Patient management API

---

**Need Help?**
- Check: `docs/PHASE_2_1_COMPLETE_SETUP.md`
- Or: `POSTGRESQL_INSTALLATION.md`
