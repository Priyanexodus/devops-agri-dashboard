# Agri Dashboard

This is a full-stack web application featuring a Java Spring Boot backend, a PostgreSQL database, and a Vite/React frontend.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18 or higher) & npm
- [Java 21](https://jdk.java.net/21/) (or compatible version)
- [Maven](https://maven.apache.org/)

## Quick Start (Using Docker Compose)
The easiest way to initialize and run the whole backend and database is using Docker Compose.

1. Start the database and backend services:
   ```bash
   docker-compose up -d --build
   ```
2. The services will be accessible at:
   - Backend API: `http://localhost:8082` (or `8080` mapped internally)
   - PostgreSQL Database on port `5432`

## Running Manually for Development

If you prefer to run the components separately for development:

### 1. Database
You can start just the PostgreSQL database using Docker:
```bash
docker-compose up db -d
```

### 2. Backend (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd backend/agri-backend
   ```
2. Clean and package the application (optional but recommended to ensure all dependencies are fetched):
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
*(Note: It requires the PostgreSQL database to be running to successfully start.)*

### 3. Frontend (React/Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The dashboard will be available at the URL provided in your terminal (typically `http://localhost:5173`).

## Project Structure
- `/backend/agri-backend` - Contains the Spring Boot Java API.
- `/backend/Dockerfile` - Docker configuration to containerize the backend.
- `/frontend` - Contains the React/TypeScript/Vite web application.
- `docker-compose.yml` - Defines the multi-container configuration for the backend & DB.
