# WDUPMS Backend API

Woldia University Property Management System - Backend Server

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration

4. **Setup database**
   - Create PostgreSQL database
   - Run migrations (coming in next steps)

5. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── server.ts        # Entry point
├── dist/                # Compiled JavaScript
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `POST /api/v1/users` - Create user (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Assets
- `GET /api/v1/assets` - Get all assets
- `POST /api/v1/assets` - Register new asset
- `GET /api/v1/assets/:id` - Get asset by ID
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

### Transfers
- `GET /api/v1/transfers` - Get all transfers
- `POST /api/v1/transfers` - Create transfer request
- `PUT /api/v1/transfers/:id/approve` - Approve transfer
- `PUT /api/v1/transfers/:id/reject` - Reject transfer

### Returns
- `GET /api/v1/returns` - Get all returns
- `POST /api/v1/returns` - Create return request
- `PUT /api/v1/returns/:id/approve` - Approve return

### Reports
- `GET /api/v1/reports/assets` - Asset report
- `GET /api/v1/reports/transfers` - Transfer report
- `GET /api/v1/reports/inventory` - Inventory report

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- Rate limiting (to be implemented)

## Database Schema

The database schema includes:
- Users
- Assets
- Transfers
- Returns
- Assignments
- Audit logs

## Development Guidelines

1. Follow TypeScript best practices
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Write meaningful commit messages
5. Add comments for complex logic
6. Keep functions small and focused

## Testing

```bash
npm test
```

## Deployment

1. Build the project: `npm run build`
2. Set environment variables for production
3. Start the server: `npm start`

## License

MIT

## Team

- Backend Developer: Yared Kassa
- System Designer: Mastewal Tilaye
- Requirement Analyst: Haftamu Teamr
