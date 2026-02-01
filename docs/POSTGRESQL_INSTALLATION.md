# 🗄️ PostgreSQL Installation Guide

**Date:** January 31, 2026  
**Status:** PostgreSQL NOT detected on system  
**Action Required:** Installation needed

---

## 📥 POSTGRESQL INSTALLATION (Windows)

### Method 1: Download from Official Website (RECOMMENDED)

#### Step 1: Download PostgreSQL
1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose PostgreSQL 15.x or latest stable version
4. Download the Windows installer

#### Step 2: Run Installer
1. Double-click the installer
2. Follow the installation wizard:
   - Accept default installation path (usually: C:\Program Files\PostgreSQL\15)
   - Set superuser password (REMEMBER THIS!)
   - Set port (default: 5432) ✅ Keep as is
   - Select components (PostgreSQL server + pgAdmin) ✅ Recommended

#### Step 3: Verify Installation
```bash
# Open PowerShell and test
psql --version
# Should return: psql (PostgreSQL) 15.x or later
```

#### Step 4: Create Database User
```bash
# Open pgAdmin (installed with PostgreSQL)
# Or use command line:
psql -U postgres
# Create a user for development:
CREATE USER clinical_dev WITH PASSWORD 'secure_password_here';
ALTER USER clinical_dev CREATEDB;
```

---

## 📥 POSTGRESQL INSTALLATION (Mac)

### Method 1: Homebrew (EASIEST)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Method 2: Download from Official Website
1. Visit: https://www.postgresql.org/download/macosx/
2. Download PostgreSQL 15 installer
3. Run installer
4. Follow prompts

### Method 3: Docker (EASIEST)
```bash
docker run --name postgresql -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:15
```

---

## 📥 POSTGRESQL INSTALLATION (Linux - Ubuntu/Debian)

```bash
# Update package manager
sudo apt update

# Install PostgreSQL 15
sudo apt install postgresql-15 postgresql-contrib-15

# Start service
sudo systemctl start postgresql

# Verify installation
psql --version
```

---

## ✅ QUICK START AFTER INSTALLATION

### 1. Test Connection (Windows)
```bash
# Open PowerShell
psql -U postgres -d postgres

# If prompted for password, enter the one you set during installation
```

### 2. Create Development Database
```bash
# While in psql, run:
CREATE DATABASE clinical_system;
CREATE USER clinical_app WITH PASSWORD 'clinical_app_password';
GRANT ALL PRIVILEGES ON DATABASE clinical_system TO clinical_app;
ALTER DATABASE clinical_system OWNER TO clinical_app;

# Exit psql
\q
```

### 3. Test New User Connection
```bash
psql -U clinical_app -d clinical_system -h localhost -p 5432
# Enter password: clinical_app_password
```

---

## 🔐 CREDENTIALS TO USE

### System User (Super Admin)
```
User: postgres
Password: [What you set during installation]
Database: postgres
```

### Application User (Development)
```
User: clinical_app
Password: clinical_app_password
Database: clinical_system
Host: localhost
Port: 5432
```

### Connection String
```
postgresql://clinical_app:clinical_app_password@localhost:5432/clinical_system
```

---

## 🎯 WHAT TO DO NEXT

Once PostgreSQL is installed and running:

1. ✅ Verify with `psql --version`
2. ✅ Create the database and user
3. ✅ Test the connection
4. ✅ Come back to this project
5. ✅ We'll continue with Phase 2 setup

---

## 🆘 TROUBLESHOOTING

### "psql command not found"
- PostgreSQL not installed
- Solution: Install from https://www.postgresql.org/download/

### "Connection refused"
- PostgreSQL not running
- Solution: Start PostgreSQL service

### "Password authentication failed"
- Wrong password or user
- Solution: Verify credentials

### "Database already exists"
- Database was created before
- Solution: Drop and recreate or use existing database

---

## 📝 ENVIRONMENT SETUP (After Installation)

### Create .env file in config/
```bash
# config/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=clinical_app
DB_PASSWORD=clinical_app_password
DB_NAME=clinical_system
DB_POOL_MIN=2
DB_POOL_MAX=10
NODE_ENV=development
```

---

## ✨ VERIFICATION CHECKLIST

After installation, verify:
- [ ] PostgreSQL installed (psql --version returns version)
- [ ] PostgreSQL running (can connect with psql)
- [ ] Database created (clinical_system exists)
- [ ] User created (clinical_app exists)
- [ ] Can connect with new user
- [ ] .env file created with credentials
- [ ] Ready for Phase 2 development

---

## 🚀 INSTALL POSTGRESQL NOW

**Please install PostgreSQL before we continue with Phase 2.**

**Recommended:**
1. **Windows:** Download from https://www.postgresql.org/download/windows/
2. **Mac:** Run `brew install postgresql@15`
3. **Linux:** Run `sudo apt install postgresql-15`

**Estimated installation time:** 5-10 minutes

**Once installed, report back and we'll continue!** ✅

---

**Next Step:** Install PostgreSQL and come back  
**Time Estimate:** 5-10 minutes for installation  
**Then:** We'll create database and connection pool

🚀 **PostgreSQL is the foundation for Phase 2!**

