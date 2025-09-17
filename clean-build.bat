@echo off
REM Script to clean the project and prepare for production deployment

echo 🧹 Cleaning project...
call npm run clean

echo 📦 Installing dependencies...
call npm ci

echo 🔨 Building project...
call npm run build

echo 🔍 Checking for environment file...
if not exist .env (
  echo ⚠️ No .env file found, creating from .env.example
  copy .env.example .env
  echo ⚠️ Please update the .env file with your production values!
)

echo 🚀 Project is ready for deployment!
echo You can now run: npm run docker:rebuild
