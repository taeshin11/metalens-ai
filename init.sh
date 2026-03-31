#!/bin/bash
# MetaLens AI — Project Startup Script
# Usage: bash init.sh

echo "🔬 MetaLens AI — Starting up..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start dev server
echo "🚀 Starting development server..."
npm run dev
