@echo off
title SkillSync Platform Launcher
color 0A

echo ===================================================
echo        SkillSync Curriculum Intelligence
echo         Starting Backend and Frontend...
echo ===================================================
echo.

REM 1. Set Project Root Directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

REM 2. Check Virtual Environment
if not exist "%ROOT_DIR%venv\Scripts\uvicorn.exe" (
    echo [ERROR] Virtual environment not found at: %ROOT_DIR%venv
    echo Please make sure the venv folder exists.
    pause
    exit /b 1
)

REM 3. Launch FastAPI Backend in a separate window
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "SkillSync Backend (FastAPI)" cmd /k "cd /d "%ROOT_DIR%backend" && "%ROOT_DIR%venv\Scripts\uvicorn.exe" main:app --port 8000 --host 127.0.0.1 --reload"

REM 4. Wait briefly for backend initialization
timeout /t 3 /nobreak >nul

REM 5. Launch Vite Frontend in a separate window
echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "SkillSync Frontend (Vite)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

REM 6. Wait for frontend to start and open in default web browser
timeout /t 4 /nobreak >nul
echo.
echo ===================================================
echo  Both servers started successfully!
echo  Opening SkillSync in your browser...
echo ===================================================
start http://localhost:5173

echo.
echo [INFO] You can keep this window open or close it.
echo The backend and frontend servers are running in their respective windows.
timeout /t 5 >nul
exit
