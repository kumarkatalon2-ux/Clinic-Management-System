#!/usr/bin/env pwsh

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Clinical Management System - Installation & Setup       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to display status
function Show-Status {
    param([string]$message, [string]$color = "Green")
    Write-Host "✓ $message" -ForegroundColor $color
}

function Show-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Show-Step {
    param([string]$message)
    Write-Host "→ $message" -ForegroundColor Yellow
}


# Check Node.js
Show-Step "Checking Node.js installation..."
$nodeVersion = & node --version
if ($LASTEXITCODE -eq 0) {
    Show-Status "Node.js $nodeVersion installed"
} else {
    Show-Error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Check npm
Show-Step "Checking npm installation..."
$npmVersion = & npm --version
if ($LASTEXITCODE -eq 0) {
    Show-Status "npm $npmVersion installed"
} else {
    Show-Error "npm not found"
    exit 1
}

# Install backend
Show-Step "Installing backend dependencies..."
Push-Location "src\backend"
Show-Status "Running: npm install"
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Show-Status "Backend dependencies installed successfully"
} else {
    Show-Error "Backend installation failed"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# Install frontend
Show-Step "Installing frontend dependencies..."
Push-Location "src\frontend"
Show-Status "Running: npm install"
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Show-Status "Frontend dependencies installed successfully"
} else {
    Show-Error "Frontend installation failed"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# Check for .env file
Show-Step "Checking environment configuration..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Show-Status "Creating .env from .env.example"
        Copy-Item ".env.example" ".env"
        Show-Status ".env file created"
    } else {
        Show-Error ".env file missing and .env.example not found"
    }
} else {
    Show-Status ".env file exists"
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         Installation Complete! Starting services...       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check Docker
Show-Step "Checking Docker..."
$dockerVersion = & docker --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Show-Status "Docker $dockerVersion available"
    Show-Step "Starting Docker services with: docker-compose up -d"
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Show-Status "Docker services started"
        Write-Host ""
        Write-Host "Services starting:" -ForegroundColor Cyan
        Write-Host "  • PostgreSQL: localhost:5432"
        Write-Host "  • Redis: localhost:6379"
        Write-Host "  • MinIO: localhost:9000"
        Write-Host "  • Nginx: localhost:80"
        Write-Host ""
        Write-Host "⏳ Waiting 15 seconds for services to initialize..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
} else {
    Write-Host "⚠️  Docker not found. Skipping Docker services startup." -ForegroundColor Yellow
    Write-Host "   Install Docker Desktop to run full stack:" -ForegroundColor Yellow
    Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║         Starting Development Servers...                   ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Start backend in background
Show-Step "Starting backend server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src\backend; npm run dev" -NoNewWindow
Start-Sleep -Seconds 3

# Start frontend in background
Show-Step "Starting frontend dev server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src\frontend; npm run dev" -NoNewWindow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🚀 Application Running! 🚀                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Open your browser and navigate to:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173  (Frontend)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Available endpoints:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000  (Backend API)" -ForegroundColor Cyan
Write-Host "   http://localhost:5173  (Frontend UI)" -ForegroundColor Cyan
Write-Host "   http://localhost:9000  (MinIO S3)" -ForegroundColor Cyan
Write-Host "   http://localhost:5601  (Kibana Logs)" -ForegroundColor Cyan
Write-Host "   http://localhost:3001  (Grafana Monitoring)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Logs:" -ForegroundColor Yellow
Write-Host "   • Backend logs: PowerShell window #1" -ForegroundColor Gray
Write-Host "   • Frontend logs: PowerShell window #2" -ForegroundColor Gray
Write-Host ""
Write-Host "❌ To stop:" -ForegroundColor Yellow
Write-Host "   • Close either PowerShell window" -ForegroundColor Gray
Write-Host "   • Run: docker-compose down" -ForegroundColor Gray
Write-Host ""
