@echo off
title Dasturni Yangilash
color 0B

echo.
echo  ==========================================
echo   QURILISH DO'KONI - Yangilash
echo  ==========================================
echo.

:: Git bor yoki yo'qligini tekshirish
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [XATO] Git topilmadi!
    echo.
    echo  Git o'rnatish uchun: https://git-scm.com/download/win
    echo.
    pause
    exit
)

echo  [..] Yangi versiyani yuklab olinmoqda...
echo.

git pull

if %errorlevel% equ 0 (
    echo.
    echo  ==========================================
    echo   [OK] Dastur muvaffaqiyatli yangilandi!
    echo.
    echo   Endi ISHGA_TUSHIR.bat ni bosing
    echo  ==========================================
) else (
    echo.
    echo  [XATO] Yangilashda muammo yuz berdi
    echo  Internet aloqasini tekshiring
)

echo.
pause
