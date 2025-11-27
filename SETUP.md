# CloudForge Quick Setup Guide

## For New Team Members

### Prerequisites
- Docker Desktop with WSL 2 backend
- Node.js v18 or v20 LTS
- WSL 2 Ubuntu (for running docker compose)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CloudForge
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Generate secure keys (Linux/Mac/WSL)
   openssl rand -hex 32   # Use this for SECRET_KEY
   openssl rand -hex 32   # Use this for JWT_SECRET_KEY
   
   # Edit .env and update:
   # - POSTGRES_PASSWORD
   # - REDIS_PASSWORD  
   # - SECRET_KEY
   # - JWT_SECRET_KEY
   ```

3. **Start the application**
   
   **Option A: Full Docker Stack**
   ```bash
   wsl -d Ubuntu sh -lc "cd /mnt/c/Users/YOUR_USERNAME/path/to/CloudForge && docker compose up -d"
   ```
   
   **Option B: Backend in Docker + Frontend locally (for development)**
   ```bash
   # Start backend services
   wsl -d Ubuntu sh -lc "cd /mnt/c/Users/YOUR_USERNAME/path/to/CloudForge && docker compose up -d"
   
   # Start frontend (in Windows terminal)
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

5. **Verify everything is running**
   ```bash
   wsl -d Ubuntu docker ps
   ```
   You should see: cloudforge-frontend, cloudforge-backend, cloudforge-postgres, cloudforge-redis

### Important Files

- `.env.example` - Template for environment variables (NEVER commit actual .env)
- `docker-compose.yaml` - Service orchestration
- `README.md` - Full developer documentation
- `frontend/package.json` - Frontend dependencies
- `backend/requirements.txt` - Backend dependencies

### Troubleshooting

**Port already in use?**
```powershell
# Check what's using the port
Get-NetTCPConnection -LocalPort 3000
# Kill the process
Stop-Process -Id <PID>
```

**Docker not working?**
```bash
# Restart Docker Desktop
# Verify WSL integration is enabled in Docker Desktop settings
```

**Need to reset everything?**
```bash
wsl -d Ubuntu sh -lc "cd /mnt/c/Users/YOUR_USERNAME/path/to/CloudForge && docker compose down -v"
# This removes containers AND volumes (database will be wiped!)
```

### What's Excluded from Git?

The following are NOT tracked (you need to create them):
- `.env` files (copy from `.env.example`)
- `node_modules/` (run `npm install`)
- `venv/` or `.venv/` (run `python -m venv venv`)
- Generated/temporary files
- IDE settings
- Database files
- Log files

### Need Help?

- Check the full documentation: `README.md`
- Review docker compose logs: `wsl -d Ubuntu docker compose logs -f`
- Check specific service: `wsl -d Ubuntu docker logs cloudforge-backend`

