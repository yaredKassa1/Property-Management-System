# WDUPMS Backend - Complete Setup Guide

This guide will walk you through setting up the backend from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v13.0 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** (for version control)

### Check Your Installations

```bash
node --version    # Should be v18.0.0+
npm --version     # Should be v9.0.0+
psql --version    # Should be 13.0+
```

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Backend Directory

```bash
cd Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- Sequelize (ORM)
- PostgreSQL driver
- JWT for authentication
- And more...

### Step 3: Set Up PostgreSQL Database

#### Option A: Using Command Line

1. **Start PostgreSQL service:**
   ```bash
   # Windows
   net start postgresql-x64-13

   # macOS (with Homebrew)
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql
   ```

2. **Create database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # In psql prompt, create database
   CREATE DATABASE wdupms_db;

   # Verify database was created
   \l

   # Exit psql
   \q
   ```

#### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name: `wdupms_db`
5. Click "Save"

### Step 4: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your settings:**
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=wdupms_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRES_IN=7d

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

   **Important:** Replace `your_actual_password_here` with your PostgreSQL password!

### Step 5: Run Database Migrations

This creates the database tables:

```bash
npm run migrate
```

Expected output:
```
🔄 Starting database migration...
✅ Database connection established successfully
✅ Database migration completed successfully
📋 Tables created/updated:
   - users
   - assets
```

### Step 6: Seed Initial Data (Optional but Recommended)

This adds sample users and assets:

```bash
npm run seed
```

Expected output:
```
🌱 Starting database seeding...
👥 Creating users...
✅ Created 8 users
📦 Creating assets...
✅ Created 8 assets

👤 Default User Credentials:
═══════════════════════════════════════
Administrator:
  Username: admin
  Password: admin123
  Role: administrator
...
```

### Step 7: Start the Development Server

```bash
npm run dev
```

Expected output:
```
═════════════════════════════════════════════════════
🚀 WDUPMS Backend Server running in development mode
📡 Server: http://localhost:5000
🔗 API Base: http://localhost:5000/api
🏥 Health Check: http://localhost:5000/health
═════════════════════════════════════════════════════
```

### Step 8: Test the API

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Test Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

   You should receive a response with a JWT token!

## 🧪 Testing with Postman or Thunder Client

### 1. Login Request

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@woldia.edu.et",
    "fullName": "System Administrator",
    "role": "administrator",
    ...
  }
}
```

### 2. Get Assets (Protected Route)

Copy the token from login response, then:

```http
GET http://localhost:5000/api/assets
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

## 🔧 Troubleshooting

### Problem: "Connection refused" when starting server

**Solution:** Make sure PostgreSQL is running:
```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-13

# macOS/Linux
sudo systemctl status postgresql
```

### Problem: "password authentication failed"

**Solution:** Check your `.env` file:
- Verify `DB_USER` matches your PostgreSQL username
- Verify `DB_PASSWORD` is correct
- Try connecting manually: `psql -U postgres -d wdupms_db`

### Problem: "database does not exist"

**Solution:** Create the database:
```bash
psql -U postgres
CREATE DATABASE wdupms_db;
\q
```

### Problem: "Module not found"

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port 5000 already in use

**Solution:** Either:
1. Stop the process using port 5000
2. Or change PORT in `.env` file:
   ```env
   PORT=5001
   ```

## 🗂️ Database Management Commands

### Reset Database (Nuclear Option)

**⚠️ WARNING: This deletes ALL data!**

```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE wdupms_db;
CREATE DATABASE wdupms_db;
\q

# Run migrations and seed again
npm run migrate
npm run seed
```

### View Database Tables

```bash
psql -U postgres -d wdupms_db
\dt                    # List all tables
\d users              # Describe users table
\d assets             # Describe assets table
SELECT * FROM users;  # View all users
\q                    # Quit
```

### Backup Database

```bash
# Create backup
pg_dump -U postgres wdupms_db > backup.sql

# Restore backup
psql -U postgres wdupms_db < backup.sql
```

## 📱 Connecting Frontend to Backend

### Step 1: Update Frontend Environment

In your Frontend directory, create/edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 2: Disable Mock Mode

Edit `Frontend/lib/api.ts`:

```typescript
// Change this line:
const MOCK_MODE = true;

// To:
const MOCK_MODE = false;
```

### Step 3: Restart Frontend

```bash
cd Frontend
npm run dev
```

Now your frontend will connect to the real backend!

## 🔐 Default User Accounts

After seeding, you have these accounts:

| Username | Password | Role | Use Case |
|----------|----------|------|----------|
| admin | admin123 | administrator | Full system access |
| vp | vp123 | vice_president | Approvals & oversight |
| property | property123 | property_officer | Asset management |
| approval | approval123 | approval_authority | Request approvals |
| purchase | purchase123 | purchase_department | Purchase management |
| qa | qa123 | quality_assurance | Quality checks |
| staff1 | staff123 | staff | Regular staff member |
| staff2 | staff123 | staff | Regular staff member |

**⚠️ IMPORTANT:** Change these passwords before deploying to production!

## 🚀 Production Deployment

### Before deploying:

1. **Change all default passwords**
2. **Generate strong JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Set NODE_ENV to production:**
   ```env
   NODE_ENV=production
   ```
4. **Use environment variables (don't commit .env)**
5. **Set up SSL/TLS for HTTPS**
6. **Configure proper CORS origins**
7. **Set up database backups**
8. **Enable proper logging**

## 📞 Need Help?

- Check the main `README.md` for API documentation
- Review error messages in the terminal
- Check database connection with `psql`
- Verify all environment variables are set correctly

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] PostgreSQL installed and running
- [ ] Database `wdupms_db` created
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Migrations run successfully
- [ ] Seed data loaded (optional)
- [ ] Server starts without errors
- [ ] Health check responds at `/health`
- [ ] Can login with default credentials
- [ ] Can fetch assets with valid token

---

**Congratulations! 🎉 Your backend is ready to use!**
