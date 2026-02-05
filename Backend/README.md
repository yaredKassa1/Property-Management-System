# WDUPMS Backend API

Backend API for Woldia University Property Management System built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- ✅ JWT-based authentication with role-based access control
- ✅ Asset Management module (CRUD operations)
- ✅ PostgreSQL database with Sequelize ORM
- ✅ RESTful API design
- ✅ Input validation and sanitization
- ✅ Security best practices (Helmet, CORS, Rate Limiting)
- ✅ Error handling middleware
- ✅ Request logging with Morgan
- ✅ Database migrations and seeders
- ✅ Environment-based configuration

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 9.0.0

## 🔧 Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `DB_USER` - Your PostgreSQL username
   - `DB_PASSWORD` - Your PostgreSQL password
   - `DB_NAME` - Database name (will be created)
   - `JWT_SECRET` - Strong secret key for JWT
   - `JWT_REFRESH_SECRET` - Strong secret for refresh tokens

4. **Create PostgreSQL database:**
   ```bash
   psql -U postgres
   CREATE DATABASE wdupms_db;
   \q
   ```

5. **Run database migrations:**
   ```bash
   npm run migrate
   ```

6. **Seed initial data (optional):**
   ```bash
   npm run seed
   ```

## 🏃 Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "role": "administrator"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@woldia.edu.et",
    "fullName": "System Administrator",
    "role": "administrator",
    "department": "IT Department",
    "isActive": true
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Asset Management Endpoints

#### Get All Assets
```http
GET /api/assets
Authorization: Bearer <token>

Query Parameters:
- status: available|assigned|in_transfer|under_maintenance|disposed
- category: fixed|fixed_consumable
- department: string
- search: string (searches name, assetId, serialNumber)
- page: number (default: 1)
- limit: number (default: 10)

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Get Single Asset
```http
GET /api/assets/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "assetId": "WU-LAP-001",
    "name": "Dell Latitude 5420",
    ...
  }
}
```

#### Create Asset
```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "WU-LAP-001",
  "name": "Dell Latitude 5420",
  "category": "fixed",
  "serialNumber": "DL5420-2024-001",
  "value": 45000,
  "purchaseDate": "2024-01-15",
  "location": "Computer Science Department",
  "department": "Computer Science",
  "status": "available",
  "condition": "excellent",
  "description": "Laptop for faculty use",
  "warrantyExpiry": "2027-01-15"
}

Response:
{
  "success": true,
  "message": "Asset created successfully",
  "data": { ... }
}
```

#### Update Asset
```http
PUT /api/assets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "assigned",
  "assignedTo": "user-uuid",
  "location": "Engineering Department"
}

Response:
{
  "success": true,
  "message": "Asset updated successfully",
  "data": { ... }
}
```

#### Delete Asset
```http
DELETE /api/assets/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

## 🔐 User Roles

- `administrator` - Full system access
- `vice_president` - Approval authority
- `property_officer` - Asset management
- `approval_authority` - Request approvals
- `purchase_department` - Purchase processing
- `quality_assurance` - QA checks
- `staff` - Basic user access

## 🗄️ Database Schema

### Users Table
- id (UUID, PK)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- fullName (VARCHAR)
- role (ENUM)
- department (VARCHAR)
- isActive (BOOLEAN)
- createdAt, updatedAt (TIMESTAMP)

### Assets Table
- id (UUID, PK)
- assetId (VARCHAR, UNIQUE)
- name (VARCHAR)
- category (ENUM)
- serialNumber (VARCHAR)
- value (DECIMAL)
- purchaseDate (DATE)
- location (VARCHAR)
- department (VARCHAR)
- status (ENUM)
- condition (ENUM)
- assignedTo (UUID, FK → Users)
- description (TEXT)
- warrantyExpiry (DATE)
- createdBy (UUID, FK → Users)
- createdAt, updatedAt (TIMESTAMP)

## 🛡️ Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Role-based access control (RBAC)
- Helmet.js security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection protection (Sequelize ORM)

## 📝 Default Users (After Seeding)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | administrator |
| vp | vp123 | vice_president |
| property | property123 | property_officer |

**⚠️ Important:** Change these passwords in production!

## 🧪 Testing

```bash
npm test
```

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Database configuration
│   │   └── auth.js           # JWT configuration
│   ├── controllers/
│   │   ├── authController.js # Authentication logic
│   │   └── assetController.js # Asset management logic
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── roleCheck.js      # Role-based access
│   │   ├── validate.js       # Input validation
│   │   └── errorHandler.js   # Error handling
│   ├── models/
│   │   ├── index.js          # Sequelize setup
│   │   ├── User.js           # User model
│   │   └── Asset.js          # Asset model
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   └── assets.js         # Asset routes
│   ├── database/
│   │   ├── migrate.js        # Migration runner
│   │   └── seed.js           # Data seeder
│   ├── utils/
│   │   ├── logger.js         # Logging utility
│   │   └── response.js       # Response formatter
│   └── server.js             # Express app entry
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚧 Roadmap

- [ ] Assignment Management module
- [ ] Transfer Management module
- [ ] Return Management module
- [ ] Request Management module
- [ ] Notification system
- [ ] Report generation
- [ ] File upload for asset images
- [ ] Audit logging
- [ ] Email notifications
- [ ] API documentation with Swagger

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

MIT License - See LICENSE file for details
