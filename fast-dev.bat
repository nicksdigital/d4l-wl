@echo off
setlocal enabledelayedexpansion

REM Script for faster development server startup
REM Usage: fast-dev.bat [custom-env-file]

REM Default .env file path
set ENV_FILE=.env

REM Check if a specific .env file was provided as argument
if not "%~1"=="" (
  set ENV_FILE=%~1
  echo Using custom .env file: %ENV_FILE%
)

REM Check if .env file exists
if not exist "%ENV_FILE%" (
  echo Error: %ENV_FILE% file not found!
  echo Create the %ENV_FILE% file or specify a different one: fast-dev.bat path\to\env\file
  exit /b 1
)

echo Loading environment variables from %ENV_FILE%...

REM Read .env file line by line
for /f "tokens=*" %%a in (%ENV_FILE%) do (
  set line=%%a
  
  REM Skip empty lines and comments
  echo !line! | findstr /r "^#" > nul
  if errorlevel 1 (
    if not "!line!"=="" (
      REM Set the variable
      set !line!
      
      REM Print the variable name (without the value for security)
      for /f "tokens=1 delims==" %%b in ("!line!") do (
        echo Exported: %%b
      )
    )
  )
)

REM Set performance-focused environment variables
set NEXT_TELEMETRY_DISABLED=1
set NODE_ENV=development
set NEXT_WEBPACK_USEPOLLING=1
set WATCHPACK_POLLING=true
set CHOKIDAR_USEPOLLING=true
set NEXT_SKIP_TYPESCRIPT_CHECK=1

echo Setting performance optimizations for development...
echo Starting faster development server...

REM Run next dev with optimized settings - turbo is now configured in next.config.mjs
set NODE_OPTIONS=--max-old-space-size=8192
npx next dev

REM Exit with the same code as next dev
exit /b %errorlevel%
