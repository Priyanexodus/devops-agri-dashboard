#!/bin/bash

echo "Starting PostgreSQL Database via Docker..."
docker compose up -d
sleep 2 # Give postgres a moment to initialize before backend connects

echo "Starting Backend API in the background..."
cd backend
python3 -m uvicorn main:app --reload &
BACKEND_PID=$!

echo "Starting Frontend Development Server..."
cd ../frontend
npm run dev

# When you terminate the frontend (Ctrl+C), also kill the backend
trap "kill $BACKEND_PID" EXIT
