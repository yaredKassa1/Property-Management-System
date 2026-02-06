# 🚀 Quick Start Guide - Both Servers

## Option 1: Manual Start (Recommended for First Time)

### Terminal 1 - Backend
```bash
cd Backend
npm run dev
```

Wait for:
```
✅ Database connection established successfully
🚀 WDUPMS Backend Server running in development mode
📡 Server: http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd Frontend
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### Browser
Open: http://localhost:3000/login

**Login with:**
- Username: `admin`
- Password: `admin123`

---

## Option 2: Windows PowerShell (Both at Once)

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm run dev"

# Open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000/login"
```

---

## Option 3: Mac/Linux (Both at Once)

```bash
# Start backend in background
cd Backend && npm run dev &

# Wait 3 seconds
sleep 3

# Start frontend
cd ../Frontend && npm run dev
```

---

## Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/health
```

### Test Backend Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Backend Assets (with token)
```bash
# First login and save token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# Then get assets
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/assets
```

---

## Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
# Windows:
sc query postgresql-x64-13

# Mac:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# If not running, start it:
# Windows: net start postgresql-x64-13
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Database issues
```bash
cd Backend
npm run migrate
npm run seed
```

### Port already in use
```bash
# Backend (port 5000)
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000

# Frontend (port 3000)
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Kill the process or change ports in .env
```

### Clear everything and restart
```bash
# Stop all servers (Ctrl+C in each terminal)

# Clear frontend
cd Frontend
rm -rf .next
rm -rf node_modules
npm install

# Clear backend (optional - only if needed)
cd ../Backend
rm -rf node_modules
npm install

# Restart both servers
```

---

## 🎯 Expected Behavior

1. **Backend starts** → See database connection success message
2. **Frontend starts** → See "Ready" message
3. **Open browser** → See login page
4. **Login** → Redirect to dashboard
5. **Dashboard** → Shows real asset statistics
6. **Navigate** → Assets page shows real data from database

---

## 🎉 You're All Set!

Both servers are now running and integrated. Enjoy building! 🚀
