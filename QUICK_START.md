# 🚀 Quick Start Guide - WDUPMS

## ✅ System is Ready!

Both the backend and frontend servers are now running successfully!

---

## 🌐 Access the Application

**Frontend (Web Interface):**
- **URL:** http://localhost:3000
- **Network URL:** http://172.17.48.1:3000

**Backend API:**
- **URL:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs (if available)

---

## 👤 Login Credentials

### Administrator
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Full system access

### Vice President
- **Username:** `vp`
- **Password:** `vp123`
- **Role:** Approval authority for high-level decisions

### Property Officer
- **Username:** `property`
- **Password:** `property123`
- **Role:** Manage assets, transfers, and returns

### Approval Authority
- **Username:** `approval`
- **Password:** `approval123`
- **Role:** Approve requests and transfers

### Purchase Department
- **Username:** `purchase`
- **Password:** `purchase123`
- **Role:** Handle procurement processes

### Quality Assurance
- **Username:** `qa`
- **Password:** `qa123`
- **Role:** Inspect and verify assets

### Staff Members
- **Username:** `staff1` or `staff2`
- **Password:** `staff123`
- **Role:** Request and use assets

---

## 📦 Sample Data

The system has been seeded with:
- **8 Users** (various roles)
- **8 Assets** including:
  - Dell Latitude 5420 Laptop (assigned to staff1)
  - Epson EB-X41 Projector (available)
  - Ergonomic Office Chair (assigned to staff2)
  - HP Desktop Computer (under maintenance)
  - Conference Table (available)
  - Canon ImageCLASS Printer (available)
  - Samsung Galaxy Tab S8 (available)
  - Interactive Whiteboard (available)

---

## 🔄 Managing the Servers

### Check Server Status
Both servers are currently running in background processes.

### Stop Servers
If you need to stop the servers:
1. Press `Ctrl+C` in the terminal windows where they're running
2. Or close the terminal windows

### Restart Servers

**Backend:**
```cmd
cd C:\Users\HP\Documents\Property-Management-System\Backend
npm run dev
```

**Frontend:**
```cmd
cd C:\Users\HP\Documents\Property-Management-System\Frontend
npm run dev
```

---

## 🗄️ Database Information

- **Database Name:** `wdupms_db`
- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`

### Database Tables Created:
1. users
2. assets
3. transfers
4. returns
5. requests
6. audit_logs
7. notifications
8. procurement_inspections
9. procurement_workflows
10. transfer_history

---

## 🛠️ Common Tasks

### Reset Database (Fresh Start)
```cmd
cd C:\Users\HP\Documents\Property-Management-System\Backend
npm run seed
```

### Check Database Tables
```cmd
cd C:\Users\HP\Documents\Property-Management-System\Backend
node check-tables.js
```

### View Backend Logs
The backend logs are displayed in the terminal where it's running.

### View Frontend Logs
The frontend logs are displayed in the terminal where it's running.

---

## 🎯 Next Steps

1. **Open your browser** and go to http://localhost:3000
2. **Login** with any of the credentials above
3. **Explore the system:**
   - View the dashboard
   - Browse assets
   - Create requests
   - Manage transfers
   - View reports

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "port already in use" errors:

**Backend (Port 5000):**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Frontend (Port 3000):**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Database Connection Issues
1. Make sure PostgreSQL is running
2. Check credentials in `Backend/.env`
3. Verify database exists: `wdupms_db`

### Frontend Can't Connect to Backend
1. Ensure backend is running on port 5000
2. Check `Frontend/.env.local` has correct API URL
3. Check for CORS errors in browser console

---

## 📚 Additional Documentation

- **Architecture:** See `4.5_Software_Architecture.md`
- **Database Design:** See `4.5.4_Database_Design.txt`
- **Deployment:** See `4.5.3_Hardware_Software_Mapping.txt`
- **Security:** See `4.5.5_and_4.5.6_Security_and_Boundaries.txt`

---

## ⚠️ Important Notes

1. **Change default passwords** before deploying to production
2. **Backup your database** regularly
3. **Keep your `.env` files secure** - never commit them to git
4. **Update dependencies** regularly for security patches

---

## 🎉 You're All Set!

The Woldia University Property Management System is now running and ready to use!

**Happy Managing! 🚀**
