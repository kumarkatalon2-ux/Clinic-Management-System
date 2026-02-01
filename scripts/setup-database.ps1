# ============================================================================
# PostgreSQL Database Setup Script for Clinical System
# Version: 1.0
# Date: January 31, 2026
# ============================================================================

# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║   PostgreSQL Clinical System Database Setup              ║"
Write-Host "║   Version 18.1                                           ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""

# Check PostgreSQL connection
Write-Host "🔍 Verifying PostgreSQL installation..."
try {
    $psqlVersion = psql --version
    Write-Host "✅ Found: $psqlVersion"
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL 18"
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════"
Write-Host ""

# Get postgres password
Write-Host "📝 PostgreSQL Setup Instructions:"
Write-Host ""
Write-Host "1️⃣  You need the 'postgres' superuser password"
Write-Host "    (This was set during PostgreSQL installation)"
Write-Host ""
Write-Host "2️⃣  We will create:"
Write-Host "    • User: clinical_app"
Write-Host "    • Password: clinical_app_password"
Write-Host "    • Database: clinical_system"
Write-Host ""

$postgresPassword = Read-Host "🔐 Enter postgres password"

Write-Host ""
Write-Host "⏳ Creating database and user..."
Write-Host ""

# Create database and user using psql with password
$env:PGPASSWORD = $postgresPassword

# Create user
Write-Host "  • Creating user 'clinical_app'..."
psql -U postgres -h localhost -c "CREATE USER clinical_app WITH PASSWORD 'clinical_app_password';" 2>&1 | ForEach-Object {
    if ($_ -like "*already exists*") {
        Write-Host "    ℹ️  User 'clinical_app' already exists (OK)"
    } elseif ($_ -like "*CREATE ROLE*") {
        Write-Host "    ✅ User created"
    }
}

# Create database
Write-Host "  • Creating database 'clinical_system'..."
psql -U postgres -h localhost -c "CREATE DATABASE clinical_system WITH OWNER clinical_app ENCODING 'UTF8';" 2>&1 | ForEach-Object {
    if ($_ -like "*already exists*") {
        Write-Host "    ℹ️  Database 'clinical_system' already exists (OK)"
    } elseif ($_ -like "*CREATE DATABASE*") {
        Write-Host "    ✅ Database created"
    }
}

# Grant privileges
Write-Host "  • Granting privileges..."
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE clinical_system TO clinical_app;" 2>&1

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "✅ Database Setup Complete!"
Write-Host ""
Write-Host "📋 Connection Details:"
Write-Host "   Host: localhost"
Write-Host "   Port: 5432"
Write-Host "   Database: clinical_system"
Write-Host "   User: clinical_app"
Write-Host "   Password: clinical_app_password"
Write-Host ""
Write-Host "📝 Next Steps:"
Write-Host "   1. Run: .\scripts\initialize-schema.ps1"
Write-Host "   2. This will create all tables in the database"
Write-Host "   3. Then start the backend server"
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════"
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = ""
