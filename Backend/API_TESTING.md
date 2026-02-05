# API Testing Guide

This guide provides detailed examples for testing all API endpoints.

## 🔧 Setup for Testing

### Using cURL (Command Line)

All examples below use cURL. If you're on Windows, use Git Bash or PowerShell.

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the examples below as requests
3. Create an environment variable for the token

### Using VS Code Thunder Client

1. Install Thunder Client extension
2. Create a new collection
3. Add requests from examples below

---

## 🔐 Authentication Endpoints

### 1. Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluaXN0cmF0b3IiLCJpYXQiOjE3MDk1NjQwMDAsImV4cCI6MTcxMDE2ODgwMH0.example",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@woldia.edu.et",
    "fullName": "System Administrator",
    "role": "administrator",
    "department": "IT Department",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 2. Get Current User

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@woldia.edu.et",
    "fullName": "System Administrator",
    "role": "administrator",
    "department": "IT Department",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Logout

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Change Password

**Request:**
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newPassword456"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📦 Asset Management Endpoints

### 5. Get All Assets

**Basic Request:**
```bash
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Filters:**
```bash
curl -X GET "http://localhost:5000/api/assets?status=available&category=fixed&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Search:**
```bash
curl -X GET "http://localhost:5000/api/assets?search=laptop" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "assetId": "WU-LAP-001",
      "name": "Dell Latitude 5420 Laptop",
      "category": "fixed",
      "serialNumber": "DL5420-2024-001",
      "value": "45000.00",
      "purchaseDate": "2024-01-15",
      "location": "Computer Science Department",
      "department": "Computer Science",
      "status": "assigned",
      "condition": "excellent",
      "assignedTo": "550e8400-e29b-41d4-a716-446655440007",
      "description": "High-performance laptop for faculty use",
      "warrantyExpiry": "2027-01-15",
      "createdBy": "550e8400-e29b-41d4-a716-446655440003",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "assignedUser": {
        "id": "550e8400-e29b-41d4-a716-446655440007",
        "username": "staff1",
        "fullName": "Dr. Ahmed Ali",
        "email": "staff1@woldia.edu.et",
        "department": "Computer Science"
      },
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "username": "property",
        "fullName": "Property Officer"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

### 6. Get Single Asset

**Request:**
```bash
curl -X GET http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "assetId": "WU-LAP-001",
    "name": "Dell Latitude 5420 Laptop",
    ...
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Asset not found"
}
```

---

### 7. Create New Asset

**Required Role:** property_officer or administrator

**Request:**
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "WU-LAP-010",
    "name": "MacBook Pro 16",
    "category": "fixed",
    "serialNumber": "MBP16-2024-010",
    "value": 85000,
    "purchaseDate": "2024-01-20",
    "location": "IT Department",
    "department": "IT Department",
    "status": "available",
    "condition": "excellent",
    "description": "High-end laptop for development",
    "warrantyExpiry": "2027-01-20"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "assetId": "WU-LAP-010",
    "name": "MacBook Pro 16",
    ...
  }
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "value",
      "message": "Value must be a positive number"
    }
  ]
}
```

**Conflict Error (409 Conflict):**
```json
{
  "success": false,
  "message": "Asset ID already exists"
}
```

---

### 8. Update Asset

**Required Role:** property_officer or administrator

**Request:**
```bash
curl -X PUT http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Engineering Department",
    "condition": "good",
    "status": "available"
  }'
```

**Assign Asset to User:**
```bash
curl -X PUT http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "550e8400-e29b-41d4-a716-446655440007",
    "status": "assigned"
  }'
```

**Unassign Asset:**
```bash
curl -X PUT http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": null,
    "status": "available"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    ...
  }
}
```

---

### 9. Delete Asset

**Required Role:** administrator only

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

**Error (400 Bad Request) - Asset is Assigned:**
```json
{
  "success": false,
  "message": "Cannot delete an assigned asset. Please unassign first."
}
```

---

### 10. Get Asset Statistics

**Request:**
```bash
curl -X GET http://localhost:5000/api/assets/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAssets": 8,
    "assignedAssets": 2,
    "availableAssets": 5,
    "underMaintenance": 1,
    "inTransfer": 0,
    "categoryBreakdown": [
      {
        "category": "fixed",
        "count": "8"
      }
    ],
    "conditionBreakdown": [
      {
        "condition": "excellent",
        "count": "5"
      },
      {
        "condition": "good",
        "count": "2"
      },
      {
        "condition": "fair",
        "count": "1"
      }
    ]
  }
}
```

---

## 🔒 Common Error Responses

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### 401 Unauthorized (Expired Token)
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route /api/nonexistent not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Postman Collection

Create a Postman environment with:

```json
{
  "base_url": "http://localhost:5000",
  "token": "YOUR_TOKEN_HERE"
}
```

Then use `{{base_url}}` and `{{token}}` in your requests.

---

## 🧪 Testing Workflow

### 1. Complete Testing Flow:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# 2. Get all assets
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN"

# 3. Create new asset
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"TEST-001","name":"Test Asset","category":"fixed","value":1000,"purchaseDate":"2024-01-01","location":"Test Location"}'

# 4. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

**Happy Testing! 🚀**
