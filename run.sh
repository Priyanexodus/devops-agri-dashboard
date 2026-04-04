#!/bin/bash
set -e

echo "==> Starting PostgreSQL + Java Backend via Docker Compose..."
docker compose up -d --build

echo "==> Waiting for Spring Boot backend to become ready..."
for i in $(seq 1 18); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        echo "==> Backend is UP at http://localhost:8080"
        break
    fi
    echo "  Attempt $i/18 — waiting 10s for Spring Boot to initialise..."
    sleep 10
done

echo ""
echo "==> Available API endpoints:"
echo "    http://localhost:8080/api/health"
echo "    http://localhost:8080/api/yields"
echo "    http://localhost:8080/api/consumption"
echo "    http://localhost:8080/api/ethanol-targets"
echo ""

echo "==> Starting React Frontend Dev Server..."
cd frontend && npm run dev
