@echo off
rem Doppelklick-Starter fuer Timeline und Vision-Studio.
rem Die Arbeit macht start.js daneben, hier stehen nur die Argumente.
node "%~dp0start.js" %*
if errorlevel 1 pause
