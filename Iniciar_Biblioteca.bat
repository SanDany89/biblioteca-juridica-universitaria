@echo off
title Biblioteca Juridica Universitaria
echo =========================================================
echo    Iniciando Biblioteca Juridica Universitaria...
echo =========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
