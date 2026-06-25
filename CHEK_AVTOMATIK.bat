@echo off
title Best Seller - Avtomatik chek rejimi
color 0A

echo.
echo  ==========================================
echo   BEST SELLER - Avtomatik chek rejimi
echo  ==========================================
echo.
echo  Bu rejimda chek DIALOG ochilmasdan
echo  to'g'ridan-to'g'ri printerdan chiqadi.
echo.

:: Avval serverni ishga tushirish kerak (ISHGA_TUSHIR.bat)
:: Bu fayl Chrome ni kiosk-printing rejimida ochadi

:: Chrome yo'lini topish
set CHROME=""
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if %CHROME%=="" (
    echo  [XATO] Google Chrome topilmadi!
    echo  Iltimos Chrome o'rnating: https://google.com/chrome
    pause
    exit
)

echo  [OK] Chrome topildi
echo  [..] Avtomatik chek rejimida ochilmoqda...
echo.

:: Kiosk-printing rejimi — chek dialogsiz chiqadi
start "" %CHROME% --kiosk-printing --new-window http://localhost:3000

echo  ==========================================
echo   TAYYOR! Endi cheklar avtomatik chiqadi.
echo  ==========================================
echo.
echo  Eslatma: Avval ISHGA_TUSHIR.bat ishlab turishi kerak!
echo.
timeout /t 3 >nul
