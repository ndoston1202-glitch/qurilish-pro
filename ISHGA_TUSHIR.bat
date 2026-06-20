@echo off
title Qurilish Do'koni
color 0A

echo.
echo  ==========================================
echo   QURILISH DO'KONI - Ishga tushirilmoqda...
echo  ==========================================
echo.

:: Python borligini tekshirish
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [XATO] Python topilmadi!
    echo.
    echo  Python o'rnatish uchun:
    echo  https://python.org/downloads
    echo.
    echo  O'rnatishda "Add Python to PATH" ni belgilang!
    echo.
    pause
    exit
)

:: .env fayldan API key yuklash
if exist .env (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        set "%%a=%%b"
    )
)

echo  [OK] Python topildi
echo  [..] Server ishga tushirilmoqda...
echo.

:: 2 soniya kutib brauzer ochish
start /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

:: Serverni ishga tushirish
python server.py

pause
