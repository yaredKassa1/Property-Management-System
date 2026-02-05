# 🎉 New Modules Added: Transfers, Returns, and Requests

Three new modules have been added to the backend API, providing complete workflow management for asset operations.

---

## 📦 What's New

### 1. **Transfer Module** 🔄
Complete asset transfer workflow between users and locations.

**Features:**
- Create transfer requests
- Approval workflow (by VP or admin)
- Track transfer status
- Complete transfers (updates asset location)
- Cancel pending transfers

**Statuses:** `pending` → `approved`/`rejected` → `in_transit` → `completed`

### 2. **Return Module** ↩️
Asset return and inspection workflow.

**Features:**
- Submit return requests
- Receive returns (property officer)
- Inspect returns (QA officer)
- Assess asset condition
- Approve/reject returns
- Update asset status after return

**Statuses:** `pending` → `received` → `under_inspection` → `approved`/`rejected` → `completed`

### 3. **Request Module** 📝
General request management for various asset operations.

**Features:**
- Create requests (withdrawal, purchase, transfer, maintenance, disposal)
- Priority levels (low, medium, high, urgent)
- Review and approval workflow
- Track request progress
- Complete requests

**Statuses:** `pending` → `under_review` → `approved`/`rejected` → `in_progress` → `completed`

---

## 🚀 Getting Started

### Step 1: Run Migrations

The new tables need to be created in your database:

```bash
cd Backend
npm run migrate
```

This will create three new tables:
- `transfers`
- `returns`
- `requests`

### Step 2: Restart Server

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
🚀 WDUPMS Backend Server running in development mode
📡 Server: http://localhost:5000
```

### Step 3: Test the New Endpoints

Visit: http://localhost:5000/api

You'll see the new endpoints listed!

---

## 📚 API Documentation

### 🔄 Transfer Endpoints

#### 1. Get All Transfers
```http
GET /api/transfers
Authorization: Bearer <token>

Query Parameters:
- status: pending|approved|rejected|in_transit|completed|cancelled
- toUserId: UUID
- fromUserId: UUID
- assetId: UUID
- page: number
- limit: number
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetId": "uuid",
      "fromUserId": "uuid",
      "toUserId": "uuid",
      "fromLocation": "IT Department",
      "toLocation": "Engineering Department",
      "status": "pending",
      "reason": "Department needs additional resources",
      "requestDate": "2024-01-15T10:00:00Z",
      "asset": { ... },
      "fromUser": { ... },
      "toUser": { ... }
    }
  ],
  "pagination": { ... }
}
```

#### 2. Create Transfer Request
```http
POST /api/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "fromUserId": "uuid",  // Optional (null if from storage)
  "toUserId": "uuid",
  "fromLocation": "IT Department",
  "toLocation": "Engineering Department",
  "fromDepartment": "IT",
  "toDepartment": "Engineering",
  "reason": "Department needs additional laptop for new faculty member",
  "notes": "Urgent transfer needed"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Transfer request created successfully",
  "data": { ... }
}
```

#### 3. Approve Transfer
```http
POST /api/transfers/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Approved for transfer"
}
```

**Role Required:** `vice_president` or `administrator`

#### 4. Reject Transfer
```http
POST /api/transfers/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Asset is currently needed in the department"
}
```

**Role Required:** `vice_president` or `administrator`

#### 5. Complete Transfer
```http
POST /api/transfers/:id/complete
Authorization: Bearer <token>
```

**Role Required:** `property_officer` or `administrator`

**Effect:** Updates asset location and assigns to new user.

#### 6. Cancel Transfer
```http
DELETE /api/transfers/:id
Authorization: Bearer <token>
```

**Access:** Requester or administrator (only pending transfers)

---

### ↩️ Return Endpoints

#### 1. Get All Returns
```http
GET /api/returns
Authorization: Bearer <token>

Query Parameters:
- status: pending|received|under_inspection|approved|rejected|completed
- returnedBy: UUID
- assetId: UUID
- page: number
- limit: number
```

#### 2. Create Return Request
```http
POST /api/returns
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "reason": "Course completed, returning laptop as assignment period has ended"
}
```

**Note:** User can only return assets assigned to them.

#### 3. Receive Return
```http
POST /api/returns/:id/receive
Authorization: Bearer <token>
```

**Role Required:** `property_officer` or `administrator`

**Effect:** Changes status from `pending` to `received`.

#### 4. Inspect Return
```http
POST /api/returns/:id/inspect
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnCondition": "good",
  "inspectionNotes": "Asset is in good condition with minor wear",
  "damageDescription": null
}
```

**Role Required:** `quality_assurance`, `property_officer`, or `administrator`

**Condition Options:**
- `excellent` - Like new
- `good` - Normal wear
- `fair` - Some wear, fully functional
- `poor` - Significant wear, needs attention
- `damaged` - Needs repair

**Effect:** Updates asset condition and changes status to `under_inspection`.

#### 5. Approve Return
```http
POST /api/returns/:id/approve
Authorization: Bearer <token>
```

**Role Required:** `property_officer` or `administrator`

**Effect:** 
- Changes return status to `completed`
- Sets asset status to `available`
- Unassigns asset from user

#### 6. Reject Return
```http
POST /api/returns/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "inspectionNotes": "Asset has significant damage that was not reported"
}
```

**Role Required:** `property_officer` or `administrator`

---

### 📝 Request Endpoints

#### 1. Get All Requests
```http
GET /api/requests
Authorization: Bearer <token>

Query Parameters:
- status: pending|under_review|approved|rejected|in_progress|completed|cancelled
- requestType: withdrawal|purchase|transfer|maintenance|disposal
- priority: low|medium|high|urgent
- department: string
- requestedBy: UUID
- page: number
- limit: number
```

#### 2. Create Request
```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestType": "purchase",
  "itemName": "Dell Latitude 7420 Laptops",
  "quantity": 10,
  "estimatedCost": 450000,
  "priority": "high",
  "department": "Computer Science",
  "purpose": "New computer lab for students",
  "justification": "Current lab computers are outdated and insufficient for modern programming courses",
  "specifications": "Intel i7, 16GB RAM, 512GB SSD, Windows 11 Pro"
}
```

**Request Types:**
- `withdrawal` - Withdraw existing asset from storage
- `purchase` - Request new asset purchase
- `transfer` - Request asset transfer
- `maintenance` - Request maintenance/repair
- `disposal` - Request asset disposal

**Priority Levels:**
- `low` - Can wait, not urgent
- `medium` - Normal priority (default)
- `high` - Important, needs attention soon
- `urgent` - Critical, immediate attention needed

#### 3. Update Request
```http
PUT /api/requests/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 12,
  "priority": "urgent",
  "justification": "Additional computers needed urgently"
}
```

**Access:** Requester or administrator (only pending requests)

#### 4. Review Request
```http
POST /api/requests/:id/review
Authorization: Bearer <token>
```

**Role Required:** `approval_authority`, `vice_president`, or `administrator`

**Effect:** Changes status from `pending` to `under_review`.

#### 5. Approve Request
```http
POST /api/requests/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approvalNotes": "Approved for purchase. Proceed with procurement process."
}
```

**Role Required:** `approval_authority`, `vice_president`, or `administrator`

#### 6. Reject Request
```http
POST /api/requests/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Budget constraints. Please resubmit in next fiscal year."
}
```

**Role Required:** `approval_authority`, `vice_president`, or `administrator`

#### 7. Complete Request
```http
POST /api/requests/:id/complete
Authorization: Bearer <token>
```

**Role Required:** `property_officer`, `purchase_department`, or `administrator`

**Effect:** Marks request as completed.

#### 8. Cancel Request
```http
DELETE /api/requests/:id
Authorization: Bearer <token>
```

**Access:** Requester or administrator (only pending or under_review requests)

---

## 🔐 Role-Based Access Control

### Transfer Permissions

| Role | Create | View | Approve | Reject | Complete | Cancel Own |
|------|--------|------|---------|--------|----------|------------|
| staff | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| property_officer | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| vice_president | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Return Permissions

| Role | Create | View | Receive | Inspect | Approve | Reject |
|------|--------|------|---------|---------|---------|--------|
| staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| quality_assurance | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| property_officer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Request Permissions

| Role | Create | View | Update Own | Review | Approve | Reject | Complete |
|------|--------|------|------------|--------|---------|--------|----------|
| staff | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| approval_authority | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| property_officer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| purchase_department | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| vice_president | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Examples

### Complete Transfer Workflow

```bash
# 1. Login as staff
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff1","password":"staff123"}' \
  | jq -r '.token')

# 2. Create transfer request
TRANSFER_ID=$(curl -s -X POST http://localhost:5000/api/transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "asset-uuid-here",
    "toUserId": "another-user-uuid",
    "fromLocation": "Computer Science",
    "toLocation": "Engineering",
    "reason": "Transferring laptop to engineering department"
  }' | jq -r '.data.id')

# 3. Login as VP and approve
VP_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"vp","password":"vp123"}' \
  | jq -r '.token')

curl -X POST http://localhost:5000/api/transfers/$TRANSFER_ID/approve \
  -H "Authorization: Bearer $VP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'

# 4. Login as property officer and complete
PROPERTY_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"property","password":"property123"}' \
  | jq -r '.token')

curl -X POST http://localhost:5000/api/transfers/$TRANSFER_ID/complete \
  -H "Authorization: Bearer $PROPERTY_TOKEN"
```

### Complete Return Workflow

```bash
# 1. Staff creates return
curl -X POST http://localhost:5000/api/returns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "asset-uuid-here",
    "reason": "Course completed, no longer needed"
  }'

# 2. Property officer receives
curl -X POST http://localhost:5000/api/returns/$RETURN_ID/receive \
  -H "Authorization: Bearer $PROPERTY_TOKEN"

# 3. QA inspects
curl -X POST http://localhost:5000/api/returns/$RETURN_ID/inspect \
  -H "Authorization: Bearer $QA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "returnCondition": "good",
    "inspectionNotes": "Asset in good condition"
  }'

# 4. Property officer approves
curl -X POST http://localhost:5000/api/returns/$RETURN_ID/approve \
  -H "Authorization: Bearer $PROPERTY_TOKEN"
```

---

## 📊 Database Schema

### Transfers Table
```sql
CREATE TABLE transfers (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  from_location VARCHAR(200) NOT NULL,
  to_location VARCHAR(200) NOT NULL,
  from_department VARCHAR(100),
  to_department VARCHAR(100),
  status VARCHAR(30) NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  notes TEXT,
  request_date TIMESTAMP NOT NULL,
  approval_date TIMESTAMP,
  completion_date TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Returns Table
```sql
CREATE TABLE returns (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id),
  returned_by UUID NOT NULL REFERENCES users(id),
  received_by UUID REFERENCES users(id),
  inspected_by UUID REFERENCES users(id),
  status VARCHAR(30) NOT NULL,
  return_condition VARCHAR(20),
  reason TEXT NOT NULL,
  inspection_notes TEXT,
  damage_description TEXT,
  return_date TIMESTAMP NOT NULL,
  received_date TIMESTAMP,
  inspection_date TIMESTAMP,
  completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Requests Table
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY,
  request_type VARCHAR(30) NOT NULL,
  asset_id UUID REFERENCES assets(id),
  item_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  estimated_cost DECIMAL(15,2),
  status VARCHAR(30) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  department VARCHAR(100) NOT NULL,
  approved_by UUID REFERENCES users(id),
  purpose TEXT NOT NULL,
  justification TEXT,
  specifications TEXT,
  approval_notes TEXT,
  rejection_reason TEXT,
  request_date TIMESTAMP NOT NULL,
  review_date TIMESTAMP,
  approval_date TIMESTAMP,
  completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Next Steps

1. **Run migrations:** `npm run migrate`
2. **Restart server:** `npm run dev`
3. **Test endpoints:** Use Postman or cURL
4. **Update frontend:** Connect to new APIs
5. **Add seed data:** Create sample transfers, returns, and requests (optional)

---

## 🎉 Congratulations!

Your backend now has complete workflow management for:
- ✅ Asset transfers between users/departments
- ✅ Asset returns with inspection
- ✅ Request management with approval workflow

**All modules are production-ready with proper:**
- Role-based access control
- Input validation
- Error handling
- Status workflows
- Database relationships

---

**Happy coding! 🚀**
