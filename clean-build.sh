#!/bin/bash

# Script to clean the project and prepare for production deployment

echo "🧹 Cleaning project..."
npm run clean

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building project..."
npm run build

echo "🔍 Checking for environment file..."
if [ ! -f .env ]; then
  echo "⚠️ No .env file found, creating from .env.example"
  cp .env.example .env
  echo "⚠️ Please update the .env file with your production values!"
fi

echo "🚀 Project is ready for deployment!"
echo "You can now run: npm run docker:rebuild"
