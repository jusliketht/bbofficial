@echo off
REM Monitoring Toggle Script for Windows
REM Easily enable/disable monitoring without affecting the main application

setlocal enabledelayedexpansion

set MONITORING_ENV_FILE=.env
set MONITORING_SERVICE_FILE=src\services\monitoringConfigService.js

REM Function to print colored output
:print_status
echo [MONITORING] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Function to check if monitoring is enabled
:is_monitoring_enabled
findstr /C:"MONITORING_ENABLED=true" "%MONITORING_ENV_FILE%" >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)
goto :eof

REM Function to enable monitoring
:enable_monitoring
call :print_status "Enabling monitoring..."

REM Check if already enabled
call :is_monitoring_enabled
if %errorlevel% equ 0 (
    call :print_warning "Monitoring is already enabled"
    goto :eof
)

REM Backup current .env
copy "%MONITORING_ENV_FILE%" "%MONITORING_ENV_FILE%.backup" >nul 2>&1

REM Enable monitoring in .env
powershell -Command "(Get-Content '%MONITORING_ENV_FILE%') -replace 'MONITORING_ENABLED=false', 'MONITORING_ENABLED=true' | Set-Content '%MONITORING_ENV_FILE%'"

call :print_success "Monitoring enabled in configuration"
call :print_warning "Restart the application to apply changes"

REM Check if monitoring stack is running
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    if exist "monitoring\docker-compose.yml" (
        call :print_status "Checking monitoring stack..."
        cd monitoring
        docker-compose ps | findstr "Up" >nul 2>&1
        if %errorlevel% equ 0 (
            call :print_success "Monitoring stack is already running"
        ) else (
            call :print_status "Starting monitoring stack..."
            docker-compose up -d
            call :print_success "Monitoring stack started"
        )
        cd ..
    ) else (
        call :print_warning "Monitoring stack configuration not found"
        call :print_status "Run 'npm run monitoring:setup' to set up monitoring stack"
    )
) else (
    call :print_warning "Docker Compose not found - monitoring stack cannot be started"
)
goto :eof

REM Function to disable monitoring
:disable_monitoring
call :print_status "Disabling monitoring..."

REM Check if already disabled
call :is_monitoring_enabled
if %errorlevel% neq 0 (
    call :print_warning "Monitoring is already disabled"
    goto :eof
)

REM Backup current .env
copy "%MONITORING_ENV_FILE%" "%MONITORING_ENV_FILE%.backup" >nul 2>&1

REM Disable monitoring in .env
powershell -Command "(Get-Content '%MONITORING_ENV_FILE%') -replace 'MONITORING_ENABLED=true', 'MONITORING_ENABLED=false' | Set-Content '%MONITORING_ENV_FILE%'"

call :print_success "Monitoring disabled in configuration"
call :print_warning "Restart the application to apply changes"

REM Optionally stop monitoring stack
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    if exist "monitoring\docker-compose.yml" (
        set /p "choice=Do you want to stop the monitoring stack? (y/N): "
        if /i "!choice!"=="y" (
            call :print_status "Stopping monitoring stack..."
            cd monitoring
            docker-compose down
            call :print_success "Monitoring stack stopped"
            cd ..
        ) else (
            call :print_status "Monitoring stack left running"
        )
    )
)
goto :eof

REM Function to show monitoring status
:show_status
call :print_status "Monitoring Status:"
echo.

REM Check configuration
call :is_monitoring_enabled
if %errorlevel% equ 0 (
    call :print_success "Configuration: ENABLED"
) else (
    call :print_warning "Configuration: DISABLED"
)

REM Check if monitoring stack is running
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    if exist "monitoring\docker-compose.yml" (
        cd monitoring
        docker-compose ps | findstr "Up" >nul 2>&1
        if %errorlevel% equ 0 (
            call :print_success "Monitoring Stack: RUNNING"
            echo.
            call :print_status "Services:"
            docker-compose ps
        ) else (
            call :print_warning "Monitoring Stack: STOPPED"
        )
        cd ..
    ) else (
        call :print_warning "Monitoring Stack: NOT CONFIGURED"
    )
) else (
    call :print_warning "Docker Compose: NOT INSTALLED"
)

REM Check if application is running
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Application: RUNNING"
    
    REM Check metrics endpoint
    curl -s http://localhost:3002/metrics >nul 2>&1
    if %errorlevel% equ 0 (
        call :is_monitoring_enabled
        if %errorlevel% equ 0 (
            call :print_success "Metrics Endpoint: ACTIVE"
        ) else (
            call :print_warning "Metrics Endpoint: DISABLED"
        )
    ) else (
        call :print_error "Metrics Endpoint: NOT ACCESSIBLE"
    )
) else (
    call :print_warning "Application: NOT RUNNING"
)
goto :eof

REM Function to show help
:show_help
echo Burnblack Monitoring Toggle Script
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   enable    Enable monitoring (requires restart)
echo   disable   Disable monitoring (requires restart)
echo   status    Show monitoring status
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0 enable     # Enable monitoring
echo   %~nx0 disable    # Disable monitoring
echo   %~nx0 status     # Check status
echo.
echo Note: Configuration changes require application restart
goto :eof

REM Main script logic
if "%1"=="enable" (
    call :enable_monitoring
) else if "%1"=="disable" (
    call :disable_monitoring
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else if "%1"=="" (
    call :show_help
) else (
    call :print_error "Unknown command: %1"
    echo.
    call :show_help
    exit /b 1
)

endlocal
