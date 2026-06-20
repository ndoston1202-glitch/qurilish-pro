@echo off
title O'rnatish
color 0B

echo.
echo  ==========================================
echo   QURILISH DO'KONI - O'rnatish
echo  ==========================================
echo.

:: Python tekshirish
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] Python allaqachon o'rnatilgan!
    goto :done
)

echo  [..] Python topilmadi. Yuklab olinmoqda...
echo.

:: Python yuklab olish
curl -o python_install.exe https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe

if exist python_install.exe (
    echo  [..] Python o'rnatilmoqda...
    python_install.exe /quiet InstallAllUsers=1 PrependPath=1
    del python_install.exe
    echo  [OK] Python o'rnatildi!
) else (
    echo  [XATO] Yuklab bo'lmadi. Qo'lda o'rnating:
    echo  https://python.org/downloads
    pause
    exit
)

:done
echo.
echo  ==========================================
echo   O'rnatish tugadi!
echo   Endi "ISHGA_TUSHIR.bat" ni bosing
echo  ==========================================
echo.
pause
