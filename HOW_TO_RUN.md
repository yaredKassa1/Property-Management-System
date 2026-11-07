# HOW TO RUN WDUPMS PROJECT

## Prerequisites Checklist

✅ Node.js v22.15.0 - INSTALLED
✅ npm v11.3.0 - INSTALLED
⚠️ PostgreSQL - NEEDS INSTALLATION

---

## STEP 1: INSTALL POSTGRESQL

### Option A: Download PostgreSQL Installer (Recommended)

1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 (or latest version)
3. Run installer
4. During installation:
   - Set password for postgres user (remember this!)
   - Port: 5432 (default)
   - Install pgAdmin 4 (GUI tool)
5. Click "Finish"

### Option B: Check if Already Installed

Open Command Prompt and run:
```
psql --version
```

If you see version number, PostgreSQL is installed!

---

## STEP 2: CREATE DATABASE

### Using pgAdmin (GUI):

1. Open pgAdmin 4
2. Connect to PostgreSQL (enter your password)
3. Right-click "Databases" → "Create" → "Database"
4. Database name: `wdupms_db`
5. Click "Save"

### Using Command Line:

```cmd
psql -U postgres
CREATE DATABASE wdupms_db;
\q
```

---

## STEP 3: SETUP BACKEND

### 3.1 Navigate to Backend folder:

```cmd
cd C:\Users\HP\Documents\Property-Management-System\Backend
```

### 3.2 Install dependencies:

```cmd
npm install
```

This will install all required packages (Express, Sequelize, PostgreSQL, etc.)

### 3.3 Create .env file:

Copy `.env.example` to `.env`:

```cmd
copy .env.example .env
```

### 3.4 Edit .env file:

Open `.env` in Notepad and update:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wdupms_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

# JWT Configuration
JWT_SECRET=wdupms_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**IMPORTANT:** Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password!

### 3.5 Run database migrations:

```cmd
npm run migrate
```

This creates all 11 tables in the database.

### 3.6 Seed initial data (optional):

```cmd
npm run seed
```

This creates sample users and data for testing.

### 3.7 Start Backend Server:

```cmd
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

**Keep this terminal open!**

---

## STEP 4: SETUP FRONTEND

### 4.1 Open NEW terminal/command prompt

### 4.2 Navigate to Frontend folder:

```cmd
cd C:\Users\HP\Documents\Property-Management-System\Frontend
```

### 4.3 Install dependencies:

```cmd
npm install
```

This installs Next.js, React, and all frontend packages.

### 4.4 Start Frontend Server:

```cmd
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**Keep this terminal open too!**

---

## STEP 5: ACCESS THE APPLICATION

### Open your web browser and go to:

```
http://localhost:3000
```

You should see the login page!

### Default Login Credentials (if you ran seed):

**Administrator:**
- Username: `admin`
- Password: `admin123`

**Property Officer:**
- Username: `property_officer`
- Password: `officer123`

**Staff:**
- Username: `staff`
- Password: `staff123`

---

## TROUBLESHOOTING

### Problem: "Cannot connect to database"

**Solution:**
1. Check PostgreSQL is running:
   - Open Services (Windows + R → `services.msc`)
   - Find "postgresql-x64-16" (or similar)
   - Make sure Status is "Running"
2. Check your `.env` file has correct password
3. Check database exists: Open pgAdmin → Databases → wdupms_db

### Problem: "Port 5000 already in use"

**Solution:**
1. Change port in Backend `.env`:
   ```
   PORT=5001
   ```
2. Update Frontend API URL if needed

### Problem: "Port 3000 already in use"

**Solution:**
1. Kill the process using port 3000:
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID [PID_NUMBER] /F
   ```
2. Or run on different port:
   ```cmd
   npm run dev -- -p 3001
   ```

### Problem: "Module not found"

**Solution:**
```cmd
npm install
```

### Problem: "Migration failed"

**Solution:**
1. Drop database and recreate:
   ```sql
   DROP DATABASE wdupms_db;
   CREATE DATABASE wdupms_db;
   ```
2. Run migration again:
   ```cmd
   npm run migrate
   ```

---

## QUICK START COMMANDS

### Terminal 1 (Backend):
```cmd
cd C:\Users\HP\Documents\Property-Management-System\Backend
npm run dev
```

### Terminal 2 (Frontend):
```cmd
cd C:\Users\HP\Documents\Property-Management-System\Frontend
npm run dev
```

### Browser:
```
http://localhost:3000
```

---

## STOPPING THE APPLICATION

1. Press `Ctrl + C` in Backend terminal
2. Press `Ctrl + C` in Frontend terminal
3. Type `Y` when asked to terminate

---

## PROJECT STRUCTURE

```
Property-Management-System/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.js
│   ├── .env (create this!)
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
└── HOW_TO_RUN.md (this file)
```

---

## NEXT STEPS FOR SCREENSHOTS

Once the application is running:

1. Login with different user roles
2. Navigate through all screens
3. Take screenshots (Windows + Shift + S)
4. Save screenshots for user manual

---

## NEED HELP?

Check the README.md file or contact the development team.

Good luck! 🚀
