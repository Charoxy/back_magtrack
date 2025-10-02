@echo off
REM Script pour appliquer toutes les migrations sur Windows
REM Usage: scripts\apply-migrations.bat

set CONTAINER_NAME=back_magtrack-mariadb-1
set DB_USER=root
set DB_PASSWORD=root
set DB_NAME=magtrack
set MIGRATIONS_DIR=migrations

echo Application des migrations...

REM Verifier que le container est en cours d'execution
docker ps | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo Erreur: Le container %CONTAINER_NAME% n'est pas en cours d'execution
    exit /b 1
)

REM Appliquer chaque migration dans l'ordre
for %%f in (%MIGRATIONS_DIR%\0*.sql) do (
    echo Application de %%~nxf...
    docker exec -i %CONTAINER_NAME% mysql -u%DB_USER% -p%DB_PASSWORD% %DB_NAME% < "%%f"
    if errorlevel 1 (
        echo Erreur lors de l'application de %%~nxf
        exit /b 1
    )
    echo %%~nxf appliquee avec succes
)

echo Toutes les migrations ont ete appliquees avec succes!
