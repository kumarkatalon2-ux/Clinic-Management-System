@echo off
REM Clinical Management System - Installation and Setup Script

echo.
echo ====================================================================
echo   Clinical Management System - Installation ^& Setup
echo ====================================================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% installed

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% installed

echo.
echo Installing backend dependencies...
cd src\backend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..\..

echo.
echo Installing frontend dependencies...
cd src\frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..\..

echo.
echo Checking environment configuration...
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo [OK] .env file created from .env.example
    ) else (
        echo WARNING: .env file missing
    )
) else (
    echo [OK] .env file exists
)

echo.
echo ====================================================================
echo   Installation Complete! Starting services...
echo ====================================================================
echo.

REM Try to start Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting Docker services...
    docker-compose up -d
    echo [OK] Docker services started
    echo.
    echo Services available at:
    echo   - PostgreSQL: localhost:5432
    echo   - Redis: localhost:6379
    echo   - MinIO: localhost:9000
    echo   - Nginx: localhost:80
    echo.
    echo Waiting 15 seconds for services to initialize...
    timeout /t 15 /nobreak
) else (
    echo WARNING: Docker not found. Skipping Docker services.
    echo Install Docker Desktop from https://www.docker.com/products/docker-desktop
)

echo.
echo ====================================================================
echo   Starting Development Servers...
echo ====================================================================
echo.

echo Starting backend server on http://localhost:3000
start cmd /k "cd src\backend && npm run dev"

timeout /t 3 /nobreak

echo Starting frontend server on http://localhost:5173
start cmd /k "cd src\frontend && npm run dev"

timeout /t 5 /nobreak

echo.
echo ====================================================================
echo                  Application Running!
echo ====================================================================
echo.
echo Open your browser and navigate to:
echo   http://localhost:5173  (Frontend)
echo.
echo Available endpoints:
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:3000
echo   - MinIO S3: http://localhost:9000
echo   - Kibana Logs: http://localhost:5601
echo   - Grafana Monitoring: http://localhost:3001
echo.
echo Check the browser console or new command windows for logs.
echo.
echo To stop: Close the command windows or run: docker-compose down
echo.
pause
