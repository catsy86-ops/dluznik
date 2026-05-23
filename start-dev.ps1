# Dluznik Development Server Startup Script
# This script starts PostgreSQL in Docker and runs the development server

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Dluznik Development Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
Write-Host ""

# Check if Docker daemon is running
Write-Host "Checking Docker daemon..." -ForegroundColor Yellow
$dockerPs = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker daemon is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start Docker Desktop:" -ForegroundColor Cyan
    Write-Host "  1. Press Windows Key" -ForegroundColor White
    Write-Host "  2. Type: Docker Desktop" -ForegroundColor White
    Write-Host "  3. Click to open" -ForegroundColor White
    Write-Host "  4. Wait 1-2 minutes for it to start" -ForegroundColor White
    exit 1
}
Write-Host "✓ Docker daemon is running" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL container already exists
Write-Host "Checking PostgreSQL container..." -ForegroundColor Yellow
$containerExists = docker ps -a --filter "name=postgres-dluznik" --format "{{.Names}}" 2>&1
if ($containerExists -eq "postgres-dluznik") {
    Write-Host "✓ PostgreSQL container exists" -ForegroundColor Green
    
    # Check if it's running
    $containerRunning = docker ps --filter "name=postgres-dluznik" --format "{{.Names}}" 2>&1
    if ($containerRunning -eq "postgres-dluznik") {
        Write-Host "✓ PostgreSQL container is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
        docker start postgres-dluznik
        Write-Host "✓ PostgreSQL container started" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "Creating PostgreSQL container..." -ForegroundColor Yellow
    docker run --name postgres-dluznik `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=debt_management_app `
        -p 5432:5432 `
        -d postgres:15 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL container created and started" -ForegroundColor Green
        Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    } else {
        Write-Host "❌ Failed to create PostgreSQL container" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Verify PostgreSQL is accessible
Write-Host "Verifying PostgreSQL connection..." -ForegroundColor Yellow
$maxAttempts = 5
$attempt = 0
$connected = $false

while ($attempt -lt $maxAttempts -and -not $connected) {
    try {
        $result = docker exec postgres-dluznik pg_isready -U postgres 2>&1
        if ($result -like "*accepting*") {
            $connected = $true
            Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
        }
    } catch {
        # Ignore errors, will retry
    }
    
    if (-not $connected) {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  Waiting... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
}

if (-not $connected) {
    Write-Host "⚠ PostgreSQL may not be ready yet, but continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Check if npm dependencies are installed
Write-Host "Checking npm dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Start the development server
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Development Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Health check: http://localhost:3000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
