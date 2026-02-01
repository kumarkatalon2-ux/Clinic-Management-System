# ============================================================================
# Initialize PostgreSQL Database Schema
# Version: 1.0
# Date: January 31, 2026
# ============================================================================

# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║   Clinical System Database Schema Initialization          ║"
Write-Host "║   Creating 8 Tables with Indexes                         ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""

# Check if schema file exists
$schemaPath = "src\backend\database\schema.sql"
if (-not (Test-Path $schemaPath)) {
    Write-Host "❌ Schema file not found: $schemaPath"
    Write-Host ""
    Write-Host "Please run this script from the project root directory"
    exit 1
}

Write-Host "📋 Schema file found: $schemaPath"
Write-Host ""
Write-Host "⏳ Initializing database schema..."
Write-Host ""

# Set up environment variables for PostgreSQL connection
$env:PGPASSWORD = "clinical_app_password"
$env:PGUSER = "clinical_app"
$env:PGHOST = "localhost"
$env:PGDATABASE = "clinical_system"

# Run the schema file
try {
    psql -U clinical_app -h localhost -d clinical_system -f $schemaPath 2>&1 | Tee-Object -Variable output | ForEach-Object {
        Write-Host $_
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════"
    Write-Host ""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema initialized successfully!"
        Write-Host ""
        Write-Host "📊 Tables created:"
        Write-Host "   • users (Authentication & profiles)"
        Write-Host "   • patients (Patient records & demographics)"
        Write-Host "   • appointments (Appointment scheduling)"
        Write-Host "   • consultations (Consultation details)"
        Write-Host "   • prescriptions (Medication records)"
        Write-Host "   • lab_tests (Lab test records)"
        Write-Host "   • audit_log (System audit trail)"
        Write-Host "   • system_logs (Detailed logging)"
        Write-Host ""
        Write-Host "🔍 Demo Data:"
        Write-Host "   • 4 demo users (admin, doctor, nurse, patient)"
        Write-Host "   • 2 demo patients"
        Write-Host "   • 1 demo appointment"
        Write-Host ""
        Write-Host "📝 Next Steps:"
        Write-Host "   1. Copy config/.env.example to config/.env"
        Write-Host "   2. Install npm packages: npm install"
        Write-Host "   3. Start backend: npm start"
        Write-Host ""
    } else {
        Write-Host "❌ Schema initialization failed!"
        Write-Host ""
        Write-Host "Error output:"
        Write-Host $output
        Write-Host ""
        Write-Host "Troubleshooting:"
        Write-Host "   1. Check database connection: psql -U clinical_app -h localhost -d clinical_system"
        Write-Host "   2. Verify credentials in config/.env"
        Write-Host "   3. Check PostgreSQL server is running"
    }
    
} catch {
    Write-Host "❌ Error running schema file: $_"
    exit 1
}

Write-Host "════════════════════════════════════════════════════════════"
Write-Host ""

# Clear password
$env:PGPASSWORD = ""
