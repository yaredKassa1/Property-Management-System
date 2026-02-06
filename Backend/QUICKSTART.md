# 🚀 Backend Quick Start (5 Minutes)

Get the backend running in just a few simple steps!

## Prerequisites

- Node.js installed ✓
- PostgreSQL installed ✓

## Quick Setup

### 1️⃣ Install Dependencies (30 seconds)

```bash
cd Backend
npm install
```

### 2️⃣ Create Database (30 seconds)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (in psql prompt)
CREATE DATABASE wdupms_db;
\q
```

### 3️⃣ Configure Environment (1 minute)

```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your PostgreSQL password
# Change this line:
DB_PASSWORD=your_password_here
```

**Windows (Notepad):**
```bash
notepad .env
```

**Mac/Linux (nano):**
```bash
nano .env
```

### 4️⃣ Setup Database (1 minute)

```bash
# Run migrations
npm run migrate

# Load sample data
npm run seed
```

### 5️⃣ Start Server (10 seconds)

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
🚀 WDUPMS Backend Server running in development mode
📡 Server: http://localhost:5000
```

## 🎉 Test It!

### Test 1: Health Check
Open browser: http://localhost:5000/health

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Success!** You should get a token back.

## 🔑 Default Login

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** administrator

## 📚 Next Steps

- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- Read [API_TESTING.md](./API_TESTING.md) for API examples
- Read [README.md](./README.md) for full documentation

## 🔗 Connect Frontend

In your `Frontend` directory:

1. Edit `Frontend/lib/api.ts`:
   ```typescript
   const MOCK_MODE = false; // Change from true to false
   ```

2. Restart frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Login at: http://localhost:3000/login

**Username:** admin  
**Password:** admin123

---

**That's it! You're ready to go! 🎉**
