# 🎯 Getting Started with WDUPMS Backend

Welcome! This is your complete Node.js + Express + PostgreSQL backend starter template with authentication and asset management.

## 📦 What's Included

✅ **Complete Backend Infrastructure**
- Express.js web server
- PostgreSQL database with Sequelize ORM
- JWT-based authentication
- Role-based access control (7 roles)
- Input validation & sanitization
- Security middleware (Helmet, CORS, Rate Limiting)
- Error handling
- Request logging

✅ **Authentication System**
- User login/logout
- JWT token generation & verification
- Password hashing with bcrypt
- Role-based permissions
- Change password functionality

✅ **Asset Management Module (FULL CRUD)**
- Create, Read, Update, Delete assets
- Asset assignment to users
- Asset filtering & search
- Pagination support
- Asset statistics

✅ **Database Setup**
- Migration scripts
- Seed data with 8 sample users
- Sample assets for testing
- Proper relationships & foreign keys

✅ **Comprehensive Documentation**
- Complete setup guide
- API testing examples
- Project structure explanation
- Quick start guide

## 🚀 Choose Your Path

### 👉 Option 1: Quick Start (For the Impatient)
**Time: ~5 minutes**

Read [QUICKSTART.md](./QUICKSTART.md) for the fastest way to get running.

```bash
cd Backend
npm install
# Configure .env with your PostgreSQL password
npm run migrate
npm run seed
npm run dev
```

### 👉 Option 2: Detailed Setup (Recommended)
**Time: ~15 minutes**

Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step instructions with explanations.

### 👉 Option 3: API Testing
**Time: Ongoing**

Read [API_TESTING.md](./API_TESTING.md) for detailed API examples with cURL, Postman, etc.

### 👉 Option 4: Understanding the Code
**Time: ~30 minutes**

Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) to understand the architecture.

## 📚 Documentation Quick Links

| Document | Purpose | Time |
|----------|---------|------|
| [QUICKSTART.md](./QUICKSTART.md) | Get running ASAP | 5 min |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Detailed setup instructions | 15 min |
| [API_TESTING.md](./API_TESTING.md) | Test all endpoints | Reference |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Code architecture | 30 min |
| [README.md](./README.md) | Complete API documentation | Reference |

## ⚡ Super Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create database
psql -U postgres -c "CREATE DATABASE wdupms_db;"

# 3. Configure (edit DB_PASSWORD in .env)
cp .env.example .env

# 4. Setup database
npm run migrate
npm run seed

# 5. Start server
npm run dev
```

## 🔑 Default Credentials (After Seeding)

| Role | Username | Password |
|------|----------|----------|
| Administrator | `admin` | `admin123` |
| Vice President | `vp` | `vp123` |
| Property Officer | `property` | `property123` |
| Staff | `staff1` | `staff123` |

## 🧪 Test Your Setup

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Get Assets (use token from login)
```bash
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔗 Connecting to Frontend

### Step 1: Disable Mock Mode

Edit `Frontend/lib/api.ts`:
```typescript
const MOCK_MODE = false; // Change from true
```

### Step 2: Ensure Frontend URL is Configured

Backend `.env` should have:
```env
FRONTEND_URL=http://localhost:3000
```

### Step 3: Restart Both Servers

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### Step 4: Login

Go to http://localhost:3000/login
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure Overview

```
Backend/
├── src/
│   ├── config/          # Configuration (database, auth)
│   ├── models/          # Database models (User, Asset)
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation, error handling
│   ├── database/        # Migration & seed scripts
│   ├── utils/           # Helper functions
│   └── server.js        # Main entry point
│
├── .env                 # Environment variables
├── package.json         # Dependencies & scripts
└── Documentation files  # Guides and references
```

## 🎓 Learning Path

### Beginner Path
1. ✅ Run QUICKSTART.md
2. ✅ Test login with cURL
3. ✅ Connect frontend
4. ✅ Read PROJECT_STRUCTURE.md
5. ✅ Try modifying an endpoint

### Intermediate Path
1. ✅ Complete SETUP_GUIDE.md
2. ✅ Test all endpoints in API_TESTING.md
3. ✅ Add a new field to Asset model
4. ✅ Create a new API endpoint
5. ✅ Implement assignment module (homework!)

### Advanced Path
1. ✅ Study the complete codebase
2. ✅ Implement remaining modules (transfers, returns, requests)
3. ✅ Add file upload for asset images
4. ✅ Implement WebSocket notifications
5. ✅ Add comprehensive test suite
6. ✅ Deploy to production

## 🛠️ Available NPM Scripts

```bash
npm start              # Production mode
npm run dev            # Development mode (with nodemon)
npm run migrate        # Run database migrations
npm run seed           # Load sample data
npm test               # Run tests (when implemented)
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Set NODE_ENV to 'production'
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure proper logging
- [ ] Review rate limiting settings
- [ ] Set up monitoring
- [ ] Review security headers

## 🐛 Common Issues & Solutions

### Issue: "Connection refused"
**Solution:** PostgreSQL is not running. Start it:
```bash
# Windows
net start postgresql-x64-13

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Issue: "Database does not exist"
**Solution:** Create the database:
```bash
psql -U postgres -c "CREATE DATABASE wdupms_db;"
```

### Issue: "Module not found"
**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5000 in use
**Solution:** Change PORT in .env:
```env
PORT=5001
```

## 📈 Next Steps (Roadmap)

Once you're comfortable with the current implementation:

1. **Assignment Module** - Track asset assignments
2. **Transfer Module** - Handle asset transfers between users/departments
3. **Return Module** - Process asset returns
4. **Request Module** - Manage withdrawal/purchase requests
5. **Notification System** - Real-time notifications
6. **Report Generation** - Generate PDF/Excel reports
7. **File Upload** - Handle asset images/documents
8. **Audit Logging** - Track all system changes
9. **Email Notifications** - Send email alerts
10. **API Documentation** - Swagger/OpenAPI docs

## 💡 Tips for Success

1. **Read the error messages** - They usually tell you exactly what's wrong
2. **Check the logs** - Server console shows helpful debug info
3. **Use Postman/Thunder Client** - Easier than cURL for testing
4. **Read the code** - Best way to understand how it works
5. **Git commit often** - Save your progress
6. **Ask questions** - Check documentation or reach out for help

## 🤝 Contributing

When adding new features:

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test thoroughly
6. Commit with clear messages

## 📞 Support & Resources

- **Full API Docs:** [README.md](./README.md)
- **Setup Help:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **API Examples:** [API_TESTING.md](./API_TESTING.md)
- **Architecture:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🎉 Ready to Start?

Choose your path above and let's get building! The fastest way to start is:

```bash
cd Backend
npm install
# Edit .env with your PostgreSQL password
npm run migrate
npm run seed
npm run dev
```

Then open http://localhost:5000/health to verify it's running!

---

**Happy Coding! 🚀**

Built with ❤️ for Woldia University Property Management System
