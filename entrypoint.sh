#!/usr/bin/env sh
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  cp -r /root/.cache/node_modules/ .
fi
echo "Starting server..."
npm i && npm run dev
