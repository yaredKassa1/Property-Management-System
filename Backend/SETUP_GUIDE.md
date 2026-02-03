# Backend Setup Guide

Step-by-step guide to set up the WDUPMS Backend

## Step 1: Prerequisites Installation

### Install Node.js
1. Download Node.js (v18 or higher) from https://nodejs.org/
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install PostgreSQL
1. Download PostgreSQL (v14 or higher) from https://www.postgresql.org/download/
2. During installation, remember your postgres user password
3. Verify installation:
   ```bash
   psql --version
   ```

## Step 2: Database Setup

### Create Database
1. Open PostgreSQL command line (psql) or pgAdmin
2. Create database:
   ```sql
   CREATE DATABASE wdupms_db;
   ```

3. Create a dedicated user (optional but recommended):
   ```sql
   CREATE USER wdupms_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE wdupms_db TO wdupms_user;
   ```

## Step 3: Backend Configuration

### Navigate to Backend folder
```bash
cd Backend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your settings:
   ```env
   NODE_ENV=development
   PORT=5000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=wdupms_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   
   JWT_SECRET=your_very_long_random_secret_key_here
   JWT_REFRESH_SECRET=another_very_long_random_secret_key
   
   CORS_ORIGIN=http://localhost:3000
   ```

### Generate JWT Secrets
You can generate secure random strings for JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Database Migration (Next Steps)

The database schema will be created in the next phase. This includes:
- Users table
- Assets table
- Transfers table
- Returns table
- Assignments table
- Audit logs table

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api/v1
```

## Step 6: Test the API

### Test Health Endpoint
```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T..."
}
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill -9
  ```

### Module Not Found
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Next Steps

1. ✅ Configuration files created
2. ⏳ Create database schema (migrations)
3. ⏳ Implement authentication system
4. ⏳ Create API endpoints
5. ⏳ Add middleware and validation
6. ⏳ Implement business logic
7. ⏳ Add testing
8. ⏳ Deploy to production

## Useful Commands

```bash
# Development
npm run dev          # Start with hot reload

# Production
npm run build        # Compile TypeScript
npm start            # Start production server

# Code Quality
npm run lint         # Check code style
npm test             # Run tests

# Database
npm run migrate      # Run migrations (coming soon)
```

## Project Structure Created

```
Backend/
├── src/
│   └── config/
│       ├── database.ts    # PostgreSQL connection
│       └── env.ts         # Environment configuration
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .eslintrc.json        # ESLint config
└── README.md             # Documentation
```

## Support

For issues or questions:
- Check the main README.md
- Review error logs in console
- Verify all environment variables are set
- Ensure PostgreSQL is running

## Security Notes

- Never commit `.env` file
- Use strong JWT secrets in production
- Change default passwords
- Enable SSL for database in production
- Use environment-specific configurations
