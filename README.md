# Microservices E-commerce Project

A job-ready Microservices implementation for a DevOps portfolio.

## Architecture
- **API Gateway** (Port 8000): Express + `http-proxy-middleware`
- **Auth Service** (Port 5001): Express + JWT
- **Product Service** (Port 5002): Express + JSON storage
- **Order Service** (Port 5003): Express + In-memory storage
- **Frontend** (Port 3000): Next.js 14 (App Router)

## 🚀 How to Run

### Option 1: Quick Start (Windows)
Run the provided PowerShell script from the root directory:
```powershell
.\start-all.ps1
```
This will open 5 terminal windows, one for each service and the frontend.

### Option 2: Manual Start
If you prefer to run them manually, open 5 separate terminals:

1. **API Gateway**
   ```bash
   cd api-gateway
   npm start
   ```
2. **Auth Service**
   ```bash
   cd auth-service
   npm start
   ```
3. **Product Service**
   ```bash
   cd product-service
   npm start
   ```
4. **Order Service**
   ```bash
   cd order-service
   npm start
   ```
5. **Frontend**
   ```bash
   cd frontend-client
   npm run dev
   ```

## 🌐 Accessing the Application
Open your browser and navigate to:
**http://localhost:3000**

## Project Structure for DevOps
This project is structured to easily demonstrate DevOps skills:
- **Containerization**: Add a `Dockerfile` to each service folder.
- **Orchestration**: Create a `docker-compose.yml` in the root.
- **CI/CD**: Each folder can be treated as a separate build context.

## ⚠️ Troubleshooting

### "Port already in use" or "Unable to acquire lock"
If you see errors about ports being in use, it means the services are already running in the background.
1. Run the stop script to kill all Node.js processes:
   ```powershell
   .\stop-all.ps1
   ```
2. Try running `.\start-all.ps1` again.

