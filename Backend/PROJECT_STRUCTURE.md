# Backend Project Structure

Complete overview of the backend architecture and file organization.

## 📁 Directory Structure

```
Backend/
├── src/                          # Source code
│   ├── config/                   # Configuration files
│   │   ├── database.js          # Database connection & config
│   │   └── auth.js              # JWT & role configuration
│   │
│   ├── models/                   # Database models (Sequelize)
│   │   ├── index.js             # Models setup & associations
│   │   ├── User.js              # User model
│   │   └── Asset.js             # Asset model
│   │
│   ├── controllers/              # Business logic
│   │   ├── authController.js    # Authentication logic
│   │   └── assetController.js   # Asset management logic
│   │
│   ├── routes/                   # API routes
│   │   ├── auth.js              # Auth endpoints
│   │   └── assets.js            # Asset endpoints
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # JWT verification
│   │   ├── roleCheck.js         # Role-based access control
│   │   ├── validate.js          # Input validation
│   │   └── errorHandler.js      # Error handling
│   │
│   ├── database/                 # Database utilities
│   │   ├── migrate.js           # Migration runner
│   │   └── seed.js              # Data seeder
│   │
│   ├── utils/                    # Helper utilities
│   │   ├── logger.js            # Logging utility
│   │   └── response.js          # Response formatters
│   │
│   └── server.js                 # Express app entry point
│
├── node_modules/                 # Dependencies (generated)
├── .env                          # Environment variables (create from .env.example)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM dependencies & scripts
├── package-lock.json             # Locked dependency versions
├── README.md                     # Main documentation
├── SETUP_GUIDE.md               # Detailed setup instructions
├── API_TESTING.md               # API testing guide
├── QUICKSTART.md                # Quick start guide
└── PROJECT_STRUCTURE.md         # This file
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Frontend)                    │
│                     http://localhost:3000                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS Requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server                         │
│                  http://localhost:5000                       │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer:                                           │
│  • CORS                                                      │
│  • Helmet (Security)                                         │
│  • Rate Limiting                                             │
│  • Morgan (Logging)                                          │
│  • Body Parser                                               │
├─────────────────────────────────────────────────────────────┤
│  Routes Layer:                                               │
│  • /api/auth/*        → authRoutes                          │
│  • /api/assets/*      → assetRoutes                         │
├─────────────────────────────────────────────────────────────┤
│  Auth Middleware:                                            │
│  • JWT Verification                                          │
│  • Role-Based Access Control                                │
├─────────────────────────────────────────────────────────────┤
│  Controllers Layer:                                          │
│  • authController     → Login, logout, etc.                 │
│  • assetController    → CRUD operations                     │
├─────────────────────────────────────────────────────────────┤
│  Models Layer (Sequelize ORM):                              │
│  • User Model                                                │
│  • Asset Model                                               │
├─────────────────────────────────────────────────────────────┤
│  Error Handler:                                              │
│  • Global error catching                                     │
│  • Standard error responses                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                      localhost:5432                          │
│                      Database: wdupms_db                     │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  • users          → User accounts                           │
│  • assets         → Asset inventory                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Components

### 1. Entry Point (`src/server.js`)

The main application file that:
- Initializes Express
- Configures middleware
- Sets up routes
- Handles errors
- Starts the server

### 2. Configuration (`src/config/`)

**database.js:**
- PostgreSQL connection setup
- Connection pooling
- Database test utility

**auth.js:**
- JWT configuration
- Role definitions
- Permission mappings

### 3. Models (`src/models/`)

Sequelize models defining database schema:

**User Model:**
```javascript
{
  id: UUID (PK),
  username: STRING (unique),
  email: STRING (unique),
  password: STRING (hashed),
  fullName: STRING,
  role: ENUM,
  department: STRING,
  isActive: BOOLEAN,
  lastLogin: DATE
}
```

**Asset Model:**
```javascript
{
  id: UUID (PK),
  assetId: STRING (unique),
  name: STRING,
  category: ENUM,
  serialNumber: STRING,
  value: DECIMAL,
  purchaseDate: DATE,
  location: STRING,
  department: STRING,
  status: ENUM,
  condition: ENUM,
  assignedTo: UUID (FK → users),
  description: TEXT,
  warrantyExpiry: DATE,
  createdBy: UUID (FK → users)
}
```

### 4. Controllers (`src/controllers/`)

Business logic for each module:

**authController.js:**
- `login()` - User authentication
- `getCurrentUser()` - Get logged-in user
- `logout()` - User logout
- `changePassword()` - Password change

**assetController.js:**
- `getAssets()` - List assets with filtering
- `getAssetById()` - Get single asset
- `createAsset()` - Create new asset
- `updateAsset()` - Update asset
- `deleteAsset()` - Delete asset
- `getAssetStats()` - Get statistics

### 5. Routes (`src/routes/`)

API endpoint definitions:

```
Auth Routes (/api/auth):
├── POST   /login              → login
├── GET    /me                 → getCurrentUser
├── POST   /logout             → logout
└── PUT    /change-password    → changePassword

Asset Routes (/api/assets):
├── GET    /                   → getAssets
├── GET    /stats/summary      → getAssetStats
├── GET    /:id                → getAssetById
├── POST   /                   → createAsset
├── PUT    /:id                → updateAsset
└── DELETE /:id                → deleteAsset
```

### 6. Middleware (`src/middleware/`)

**auth.js:**
- `verifyToken()` - JWT validation
- `optionalAuth()` - Optional authentication

**roleCheck.js:**
- `requireRole()` - Check user role
- `requirePermission()` - Check permission
- `requireRoleLevel()` - Check role level
- `requireOwnerOrAdmin()` - Owner/admin check

**validate.js:**
- Request validation error handler

**errorHandler.js:**
- `errorHandler()` - Global error handler
- `notFound()` - 404 handler

### 7. Database Scripts (`src/database/`)

**migrate.js:**
- Creates/updates database tables
- Syncs models with database

**seed.js:**
- Populates database with sample data
- Creates default users and assets

## 🔐 Security Features

1. **JWT Authentication**
   - Token-based authentication
   - Secure password hashing (bcrypt)
   - Token expiration

2. **Role-Based Access Control (RBAC)**
   - 7 different user roles
   - Permission-based access
   - Role hierarchy

3. **Input Validation**
   - express-validator middleware
   - Type checking
   - Sanitization

4. **Security Headers**
   - Helmet.js middleware
   - CORS configuration
   - Rate limiting

5. **SQL Injection Protection**
   - Sequelize ORM
   - Parameterized queries
   - Input sanitization

## 🔄 Request Flow Example

### Example: Creating an Asset

```
1. Client Request:
   POST /api/assets
   Authorization: Bearer <token>
   Body: { assetId, name, ... }
   
2. Express Middleware:
   ├─ CORS check
   ├─ Body parsing
   ├─ Rate limiting
   └─ Request logging
   
3. Route Handler:
   └─ /api/assets → POST handler
   
4. Authentication Middleware:
   ├─ verifyToken() → Verify JWT
   └─ Attach user to req.user
   
5. Authorization Middleware:
   └─ requirePermission('manage_assets')
   
6. Validation Middleware:
   ├─ Validate assetId
   ├─ Validate name
   ├─ Validate value
   └─ Check for errors
   
7. Controller:
   ├─ assetController.createAsset()
   ├─ Check for duplicates
   ├─ Create asset in database
   └─ Return response
   
8. Response:
   └─ { success: true, data: {...} }
   
9. Error Handler (if error):
   └─ Catch and format error
```

## 📊 Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets Table
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  asset_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  value DECIMAL(15,2) NOT NULL,
  purchase_date DATE NOT NULL,
  location VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  status VARCHAR(30) NOT NULL,
  condition VARCHAR(20) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  description TEXT,
  warranty_expiry DATE,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🧩 Future Modules (Roadmap)

The following modules will follow the same pattern:

```
Backend/src/
├── models/
│   ├── Assignment.js
│   ├── Transfer.js
│   ├── Return.js
│   ├── Request.js
│   └── Notification.js
│
├── controllers/
│   ├── assignmentController.js
│   ├── transferController.js
│   ├── returnController.js
│   ├── requestController.js
│   └── notificationController.js
│
└── routes/
    ├── assignments.js
    ├── transfers.js
    ├── returns.js
    ├── requests.js
    └── notifications.js
```

## 📝 Coding Conventions

### File Naming
- Models: `PascalCase.js` (e.g., `User.js`)
- Controllers: `camelCaseController.js`
- Routes: `lowercase.js`
- Middleware: `camelCase.js`

### Function Naming
- Controllers: `camelCase` (e.g., `createAsset`)
- Middleware: `camelCase` (e.g., `verifyToken`)
- Utilities: `camelCase`

### Variable Naming
- Constants: `UPPER_SNAKE_CASE`
- Variables: `camelCase`
- Private: `_camelCase` (prefix with underscore)

## 🧪 Testing Structure (Future)

```
Backend/
└── tests/
    ├── unit/
    │   ├── models/
    │   ├── controllers/
    │   └── middleware/
    ├── integration/
    │   ├── auth.test.js
    │   └── assets.test.js
    └── setup.js
```

---

**This structure provides a solid foundation for building a scalable, maintainable backend system! 🚀**
