@echo off
title Qurilish Do'koni - To'xtatish
color 0C

echo.
echo  Qurilish Do'koni to'xtatilmoqda...
echo.

:: Python server jarayonini topib o'chirish
taskkill /f /im python.exe >nul 2>&1

echo  [OK] Server to'xtatildi!
echo.
timeout /t 2 >nul
