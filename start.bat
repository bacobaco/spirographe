@echo off
title Spirographe Studio - Serveur Dev
cd /d "%~dp0"

echo ======================================================
echo       Lancement de Spirographe Deluxe Studio
echo ======================================================
echo.

:: Verification de Node.js / npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js et npm ne sont pas detectes dans votre PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Installation automatique des dependances si node_modules est absent
if not exist "node_modules\" (
    echo [INFO] Dossier node_modules absent. Installation en cours...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Echec de l'installation des dependances.
        pause
        exit /b 1
    )
)

echo [INFO] Demarrage du serveur de developpement...
echo [INFO] Le navigateur va s'ouvrir automatiquement sur http://localhost:5173
echo.

call npm run dev -- --open

if errorlevel 1 (
    echo.
    echo [INFO] Le serveur a ete arrete ou a rencontre une erreur.
    pause
)
