# 🔍 Approval Authority Dropdown - Analysis & Implementation Guide

## Problem Statement
The "Select Approval Authority" dropdown in the request creation form is showing **no options** (empty), even though the dropdown itself is visible.

---

## Root Cause Analysis

### 1. **Backend Implementation EXISTS ✅**

The backend has TWO endpoints for fetching approval authorities:

#### Endpoint 1: Filtered Approval Authorities (Recommended)
```
GET /api/users/approval-authorities/filtered
```

**Logic:**
- Filters approval authorities based on the **staff member's hierarchy**
- **Academic Wing**: Matches by `college`, `school`, `department`
- **Administrative Wing**: Matches by `administrativeUnit`
- Returns only approval authorities in the **same organizational unit**

**File**: `Backend/src/controllers/userController.js` (lines 647-707)

#### Endpoint 2: All Approval Authorities (Fallback)
```
GET /api/users/approval-authorities
```

**Logic:**
- Returns **ALL** active users with role `approval_authority` or `vice_president`
- No filtering by hierarchy
- Used as fallback if filtered endpoint fails

**File**: `Backend/src/controllers/userController.js` (lines 712-733)

### 2. **Frontend Implementation EXISTS ✅**

The frontend correctly calls both endpoints:

**File**: `Frontend/app/requests/page.tsx` (lines 738-780)

```typescript
const fetchApprovalAuthorities = async () => {
  try {
    // Try filtered endpoint first
    const data: any = await api.getFilteredApprovalAuthorities();
    const authorities = Array.isArray(data) ? data : data.data || [];
    setApprovalAuthorities(authorities);
  } catch (err) {
    // Fallback to all authorities
    const data: any = await api.getApprovalAuthorities();
    const authorities = Array.isArray(data) ? data : data.data || [];
    setApprovalAuthorities(authorities);
  }
};
```

### 3. **API Client Implementation EXISTS ✅**

**File**: `Frontend/lib/api.ts` (lines 119-120)

```typescript
async getApprovalAuthorities() { 
  return this.request('/users/approval-authorities'); 
}

async getFilteredApprovalAuthorities() { 
  return this.request('/users/approval-authorities/filtered'); 
}
```

---

## Why the Dropdown is Empty

### Possible Reasons:

#### **Reason 1: No Approval Authorities in Database** ⚠️ MOST LIKELY
- There are **no users** with role `approval_authority` or `vice_president` in the database
- OR all such users are **inactive** (`isActive = false`)

#### **Reason 2: Hierarchy Mismatch** (For Filtered Endpoint)
- The logged-in staff member's hierarchy fields don't match any approval authority's hierarchy
- **Academic Wing**: Staff's `college`, `school`, `department` don't match any approval authority
- **Administrative Wing**: Staff's `administrativeUnit` doesn't match any approval authority

#### **Reason 3: API Response Format Issue**
- The API returns data in unexpected format
- Frontend can't extract the array correctly

#### **Reason 4: Authentication Issue**
- User token is invalid or expired
- API request fails silently

---

## How to Diagnose the Issue

### Step 1: Check Database for Approval Authorities

Run this query in PostgreSQL:

```sql
-- Check if any approval authorities exist
SELECT 
  id, 
  username, 
  "firstName", 
  "lastName", 
  role, 
  "isActive",
  wing,
  college,
  school,
  department,
  "administrativeUnit"
FROM users
WHERE role IN ('approval_authority', 'vice_president')
ORDER BY "isActive" DESC, "firstName" ASC;
```

**Expected Result:**
- Should show at least 1 user with role `approval_authority` or `vice_president`
- `isActive` should be `true`

**If NO results**: This is the problem! You need to create approval authority users.

### Step 2: Check Logged-in Staff Member's Hierarchy

```sql
-- Check the staff member's hierarchy (replace with actual email)
SELECT 
  id,
  username,
  "firstName",
  "lastName",
  role,
  wing,
  college,
  school,
  department,
  "administrativeUnit",
  "workUnit"
FROM users
WHERE email = 'selemonbeke6@gmail.com';  -- Replace with actual staff email
```

**Check:**
- What is the `wing`? (academic or administrative)
- What are the hierarchy fields? (college, school, department OR administrativeUnit)

### Step 3: Check for Matching Approval Authorities

**If Academic Wing:**
```sql
SELECT 
  id,
  username,
  "firstName",
  "lastName",
  role,
  college,
  school,
  department
FROM users
WHERE role IN ('approval_authority', 'vice_president')
  AND "isActive" = true
  AND college = 'YOUR_COLLEGE'      -- Replace with staff's college
  AND school = 'YOUR_SCHOOL'        -- Replace with staff's school
  AND department = 'YOUR_DEPARTMENT'; -- Replace with staff's department
```

**If Administrative Wing:**
```sql
SELECT 
  id,
  username,
  "firstName",
  "lastName",
  role,
  "administrativeUnit"
FROM users
WHERE role IN ('approval_authority', 'vice_president')
  AND "isActive" = true
  AND "administrativeUnit" = 'YOUR_ADMIN_UNIT'; -- Replace with staff's unit
```

### Step 4: Check Browser Console

1. Open the request creation form
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for errors related to:
   - `Failed to fetch approval authorities`
   - `Failed to fetch filtered approval authorities`
   - Network errors (401, 403, 500)

### Step 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Open the request creation form
4. Look for requests to:
   - `/api/users/approval-authorities/filtered`
   - `/api/users/approval-authorities`
5. Check:
   - **Status Code**: Should be 200
   - **Response**: Should contain array of users
   - **Headers**: Should have valid Authorization token

---

## Implementation Steps to Fix

### Solution 1: Create Approval Authority Users (If None Exist)

**Option A: Using Admin Panel**
1. Login as administrator
2. Go to Users page
3. Click "Create User"
4. Fill in details:
   - **Role**: Select `approval_authority` or `vice_president`
   - **Wing**: Select `academic` or `administrative`
   - **Hierarchy Fields**: Fill based on wing:
     - Academic: College, School, Department
     - Administrative: Administrative Unit
   - **Active**: Check the box
5. Save

**Option B: Using Database Script**

Create file: `Backend/create-approval-authority.js`

```javascript
require('dotenv').config();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

async function createApprovalAuthority() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Create approval authority for academic wing
    const academicAA = await db.User.create({
      username: 'aa_academic',
      email: 'aa.academic@woldia.edu.et',
      password: 'password123', // Will be hashed automatically
      firstName: 'Academic',
      middleName: 'Approval',
      lastName: 'Authority',
      role: 'approval_authority',
      wing: 'academic',
      college: 'Engineering',
      school: 'Computer Science',
      department: 'Software Engineering',
      workUnit: 'Engineering College',
      isActive: true
    });

    console.log('✅ Created academic approval authority:', academicAA.username);

    // Create approval authority for administrative wing
    const adminAA = await db.User.create({
      username: 'aa_admin',
      email: 'aa.admin@woldia.edu.et',
      password: 'password123',
      firstName: 'Administrative',
      middleName: 'Approval',
      lastName: 'Authority',
      role: 'approval_authority',
      wing: 'administrative',
      administrativeUnit: 'Finance Department',
      workUnit: 'Finance Department',
      isActive: true
    });

    console.log('✅ Created administrative approval authority:', adminAA.username);

    // Create vice president
    const vp = await db.User.create({
      username: 'vice_president',
      email: 'vp@woldia.edu.et',
      password: 'password123',
      firstName: 'Vice',
      middleName: '',
      lastName: 'President',
      role: 'vice_president',
      wing: 'academic',
      college: 'Engineering',
      workUnit: 'University Administration',
      isActive: true
    });

    console.log('✅ Created vice president:', vp.username);

    console.log('\n🎉 All approval authorities created successfully!');
    console.log('\nYou can now login with:');
    console.log('  Username: aa_academic, Password: password123');
    console.log('  Username: aa_admin, Password: password123');
    console.log('  Username: vice_president, Password: password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createApprovalAuthority();
```

**Run:**
```bash
cd Backend
node create-approval-authority.js
```

### Solution 2: Update Existing Users to Approval Authority

If you have existing users that should be approval authorities:

```sql
-- Update existing user to approval authority
UPDATE users
SET 
  role = 'approval_authority',
  "isActive" = true,
  wing = 'academic',  -- or 'administrative'
  college = 'Engineering',  -- for academic wing
  school = 'Computer Science',
  department = 'Software Engineering'
WHERE username = 'existing_username';
```

### Solution 3: Ensure Staff Member Has Correct Hierarchy

The staff member creating the request must have hierarchy fields filled:

```sql
-- Update staff member's hierarchy
UPDATE users
SET 
  wing = 'academic',  -- or 'administrative'
  college = 'Engineering',  -- for academic wing
  school = 'Computer Science',
  department = 'Software Engineering',
  "workUnit" = 'Software Engineering Department'
WHERE email = 'selemonbeke6@gmail.com';
```

### Solution 4: Use Fallback Endpoint (All Authorities)

If hierarchy matching is too restrictive, modify the frontend to always use the fallback:

**File**: `Frontend/app/requests/page.tsx`

```typescript
const fetchApprovalAuthorities = async () => {
  try {
    // Use all authorities endpoint (no filtering)
    const data: any = await api.getApprovalAuthorities();
    const authorities = Array.isArray(data) ? data : data.data || [];
    console.log('Approval authorities:', authorities); // Debug log
    setApprovalAuthorities(authorities);
  } catch (err) {
    console.error('Failed to fetch approval authorities:', err);
  }
};
```

---

## Testing the Fix

### Test 1: Check Dropdown Populates

1. Login as staff member
2. Go to Requests page
3. Click "Create Request"
4. Check "Select Approval Authority" dropdown
5. **Expected**: Should show list of approval authorities

### Test 2: Verify Filtered Endpoint

```bash
# Get auth token first (login)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"selemon","password":"your_password"}'

# Use the token to test filtered endpoint
curl -X GET http://localhost:5000/api/users/approval-authorities/filtered \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "aa_academic",
      "firstName": "Academic",
      "middleName": "Approval",
      "lastName": "Authority",
      "role": "approval_authority",
      "college": "Engineering",
      "school": "Computer Science",
      "department": "Software Engineering"
    }
  ],
  "wing": "academic",
  "staffHierarchy": {
    "college": "Engineering",
    "school": "Computer Science",
    "department": "Software Engineering"
  }
}
```

### Test 3: Verify All Authorities Endpoint

```bash
curl -X GET http://localhost:5000/api/users/approval-authorities \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "aa_academic",
      "firstName": "Academic",
      "lastName": "Authority",
      "role": "approval_authority",
      "workUnit": "Engineering College",
      "email": "aa.academic@woldia.edu.et"
    },
    {
      "id": "uuid",
      "username": "vice_president",
      "firstName": "Vice",
      "lastName": "President",
      "role": "vice_president",
      "workUnit": "University Administration",
      "email": "vp@woldia.edu.et"
    }
  ]
}
```

---

## Summary

### Current Status:
- ✅ Backend endpoints implemented correctly
- ✅ Frontend API calls implemented correctly
- ❌ **Dropdown is empty** - likely due to:
  1. No approval authority users in database
  2. Hierarchy mismatch between staff and approval authorities
  3. Inactive approval authority users

### Next Steps:
1. **Run diagnostic queries** (Step 1-3 above)
2. **Create approval authority users** if none exist
3. **Ensure hierarchy fields match** between staff and approval authorities
4. **Test the dropdown** after creating users

### Files to Check:
- `Backend/src/controllers/userController.js` - Controller logic
- `Backend/src/routes/users.js` - Route definitions
- `Frontend/app/requests/page.tsx` - Frontend form
- `Frontend/lib/api.ts` - API client

---

**Last Updated**: May 23, 2026  
**Status**: Analysis Complete - Awaiting Database Verification
