# Database Helper Script
# Usage: .\db.ps1 [command]
# Examples:
#   .\db.ps1 connect      - Connect to database interactively
#   .\db.ps1 tables       - List all tables
#   .\db.ps1 users        - View all users
#   .\db.ps1 loans        - View all loans
#   .\db.ps1 obligations  - View all obligations
#   .\db.ps1 transactions - View all transactions
#   .\db.ps1 reset        - Reset database (delete all data)
#   .\db.ps1 help         - Show this help

param(
    [string]$Command = "help"
)

$ContainerName = "postgres-dluznik"
$DbUser = "postgres"
$DbName = "debt_management_app"

function Check-Container {
    $running = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>&1
    if ($running -ne $ContainerName) {
        Write-Host "❌ PostgreSQL container is not running" -ForegroundColor Red
        Write-Host "Start it with: docker start $ContainerName" -ForegroundColor Yellow
        exit 1
    }
}

function Exec-Sql {
    param([string]$Sql)
    docker exec -it $ContainerName psql -U $DbUser -d $DbName -c $Sql
}

function Show-Help {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║           Database Helper Script                              ║
╚════════════════════════════════════════════════════════════════╝

Usage: .\db.ps1 [command]

Commands:
  connect       - Connect to database interactively
  tables        - List all tables
  users         - View all users
  loans         - View all loans
  obligations   - View all obligations
  transactions  - View all transactions
  count         - Count records in each table
  reset         - Reset database (DELETE ALL DATA!)
  help          - Show this help message

Examples:
  .\db.ps1 connect
  .\db.ps1 users
  .\db.ps1 loans
  .\db.ps1 reset

"@
}

switch ($Command.ToLower()) {
    "connect" {
        Write-Host "Connecting to database..." -ForegroundColor Cyan
        Check-Container
        docker exec -it $ContainerName psql -U $DbUser -d $DbName
    }
    
    "tables" {
        Write-Host "Listing tables..." -ForegroundColor Cyan
        Check-Container
        Exec-Sql "\dt"
    }
    
    "users" {
        Write-Host "Viewing users..." -ForegroundColor Cyan
        Check-Container
        Exec-Sql "SELECT id, email, createdAt, lastLoginAt, notificationsEnabled FROM `"user`" ORDER BY createdAt DESC;"
    }
    
    "loans" {
        Write-Host "Viewing loans..." -ForegroundColor Cyan
        Check-Container
        Exec-Sql "SELECT id, userId, borrowerName, originalAmount, currentBalance, status, createdAt FROM loan ORDER BY createdAt DESC;"
    }
    
    "obligations" {
        Write-Host "Viewing obligations..." -ForegroundColor Cyan
        Check-Container
        Exec-Sql "SELECT id, userId, creditorName, originalAmount, currentBalance, status, createdAt FROM obligation ORDER BY createdAt DESC;"
    }
    
    "transactions" {
        Write-Host "Viewing transactions..." -ForegroundColor Cyan
        Check-Container
        Exec-Sql "SELECT id, loanId, obligationId, type, amount, balanceBefore, balanceAfter, createdAt FROM transactions ORDER BY createdAt DESC;"
    }
    
    "count" {
        Write-Host "Counting records..." -ForegroundColor Cyan
        Check-Container
        Exec-Sql "SELECT 'users' as table_name, COUNT(*) FROM `"user`" UNION ALL SELECT 'loans', COUNT(*) FROM loan UNION ALL SELECT 'obligations', COUNT(*) FROM obligation UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;"
    }
    
    "reset" {
        Write-Host "WARNING: This will DELETE ALL DATA from the database!" -ForegroundColor Red
        Write-Host "Are you sure? (type 'yes' to confirm)" -ForegroundColor Yellow
        $confirm = Read-Host
        
        if ($confirm -eq "yes") {
            Write-Host "Resetting database..." -ForegroundColor Yellow
            Check-Container
            Exec-Sql "DROP TABLE IF EXISTS transactions CASCADE; DROP TABLE IF EXISTS loan CASCADE; DROP TABLE IF EXISTS obligation CASCADE; DROP TABLE IF EXISTS `"user`" CASCADE;"
            Write-Host "Database reset complete" -ForegroundColor Green
            Write-Host "Restart the app to recreate tables: npm run dev" -ForegroundColor Cyan
        } else {
            Write-Host "Reset cancelled" -ForegroundColor Yellow
        }
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
