# 🔍 Edit User Form - Hierarchy Fields Missing

## Problem Analysis

### What You See in the Screenshot:
The "Edit User" modal shows only these fields:
- ✅ First Name, Middle Name, Last Name
- ✅ Phone Number
- ✅ Email
- ✅ Role
- ✅ Work Unit
- ✅ Active checkbox

### What's Missing:
- ❌ **Wing** (academic or administrative)
- ❌ **College** (for academic wing)
- ❌ **School** (for academic wing)
- ❌ **Department** (for academic wing)
- ❌ **Administrative Unit** (for administrative wing)

---

## Codebase Analysis

### File Location:
**`Frontend/app/users/page.tsx`**

### Current Implementation:

#### 1. **Create User Modal** (Lines 300-709) ✅ HAS HIERARCHY FIELDS

The **CreateUserModal** component includes:
- Wing selection (academic or administrative)
- Academic wing fields: College, School, Department
- Administrative wing fields: Administrative Unit
- Uses separate components:
  - `<AcademicWingForm />` - For academic hierarchy
  - `<AdministrativeWingForm />` - For administrative hierarchy

**Code Structure:**
```typescript
function CreateUserModal({ wing, onClose, onSuccess }) {
  // Has formData with all hierarchy fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    role: 'staff',
    wing,                    // ✅ Has wing
    college: '',             // ✅ Has college
    school: '',              // ✅ Has school
    department: '',          // ✅ Has department
    administrativeUnit: '',  // ✅ Has admin unit
    workUnit: '',
    isActive: true,
  });

  // Renders wing-specific forms
  {wing === 'academic' && (
    <AcademicWingForm ... />
  )}
  {wing === 'administrative' && (
    <AdministrativeWingForm ... />
  )}
}
```

#### 2. **Edit User Modal** (Lines 780-956) ❌ MISSING HIERARCHY FIELDS

The **EditUserModal** component is **SIMPLIFIED** and only includes:
- Basic fields: firstName, middleName, lastName
- Phone number
- Email
- Role
- Work Unit
- Active status

**Code Structure:**
```typescript
function EditUserModal({ user, onClose, onSuccess }) {
  // formData is MISSING hierarchy fields
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    middleName: user.middleName || '',
    lastName: user.lastName || '',
    countryCode: '+251',
    phoneNumber: phoneOnly,
    email: user.email || '',
    role: user.role || 'staff',
    workUnit: user.workUnit || '',
    isActive: user.isActive !== undefined ? user.isActive : true,
    // ❌ NO wing
    // ❌ NO college
    // ❌ NO school
    // ❌ NO department
    // ❌ NO administrativeUnit
  });

  // Form only renders basic fields
  // ❌ NO wing-specific forms
  // ❌ NO <AcademicWingForm />
  // ❌ NO <AdministrativeWingForm />
}
```

---

## Why Hierarchy Fields Are Missing

### Design Decision:
The **EditUserModal** was intentionally simplified to only allow editing:
- Basic user information (name, email, phone)
- Role
- Work Unit
- Active status

### Reasons (Likely):
1. **Simplicity** - Editing hierarchy is complex (wing changes affect which fields are shown)
2. **Data Integrity** - Changing hierarchy might break existing relationships
3. **Incomplete Implementation** - Feature was planned but not implemented yet

---

## Implementation Flow to Add Hierarchy Fields

### **Step 1: Update EditUserModal State**

**File**: `Frontend/app/users/page.tsx` (around line 780)

**Current:**
```typescript
const [formData, setFormData] = useState({
  firstName: user.firstName || '',
  middleName: user.middleName || '',
  lastName: user.lastName || '',
  countryCode: '+251',
  phoneNumber: phoneOnly,
  email: user.email || '',
  role: user.role || 'staff',
  workUnit: user.workUnit || '',
  isActive: user.isActive !== undefined ? user.isActive : true,
});
```

**Needs to be:**
```typescript
const [formData, setFormData] = useState({
  firstName: user.firstName || '',
  middleName: user.middleName || '',
  lastName: user.lastName || '',
  countryCode: '+251',
  phoneNumber: phoneOnly,
  email: user.email || '',
  role: user.role || 'staff',
  wing: user.wing || 'academic',              // ✅ ADD
  college: user.college || '',                 // ✅ ADD
  school: user.school || '',                   // ✅ ADD
  department: user.department || '',           // ✅ ADD
  administrativeUnit: user.administrativeUnit || '', // ✅ ADD
  workUnit: user.workUnit || '',
  isActive: user.isActive !== undefined ? user.isActive : true,
});
```

---

### **Step 2: Add Wing Selection UI**

**Location**: After the "Email" field, before "Role" field

**Add:**
```typescript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Wing *
  </label>
  <select
    required
    value={formData.wing}
    onChange={(e) => setFormData({ 
      ...formData, 
      wing: e.target.value as 'academic' | 'administrative' 
    })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="academic">Academic Wing</option>
    <option value="administrative">Administrative Wing</option>
  </select>
</div>
```

---

### **Step 3: Add Conditional Wing-Specific Forms**

**Location**: After the "Wing" selection, before "Role" field

**Add:**
```typescript
{/* Academic Wing Fields */}
{formData.wing === 'academic' && (
  <AcademicWingForm
    formData={formData}
    errors={{}}
    onFormDataChange={(field, value) => 
      setFormData({ ...formData, [field]: value })
    }
    colleges={colleges}
    schools={schools}
    departments={departments}
    onAddCollege={(college) => {
      setColleges([...colleges, college]);
      setFormData({ ...formData, college });
    }}
    onAddSchool={(school) => {
      if (formData.college) {
        const collegeSchools = schools[formData.college] || [];
        setSchools({
          ...schools,
          [formData.college]: [...(collegeSchools as string[]), school]
        });
        setFormData({ ...formData, school });
      }
    }}
    onAddDepartment={(department) => {
      const key = formData.school || formData.college;
      if (key) {
        const depts = departments[key] || [];
        setDepartments({
          ...departments,
          [key]: [...depts, department]
        });
        setFormData({ ...formData, department });
      }
    }}
  />
)}

{/* Administrative Wing Fields */}
{formData.wing === 'administrative' && (
  <AdministrativeWingForm
    formData={formData}
    errors={{}}
    onFormDataChange={(field, value) => 
      setFormData({ ...formData, [field]: value })
    }
    adminUnits={adminUnits}
    onAddUnit={(unit) => {
      setAdminUnits([...adminUnits, unit]);
      setFormData({ ...formData, administrativeUnit: unit });
    }}
  />
)}
```

---

### **Step 4: Add State for Dynamic Lists**

**Location**: At the top of EditUserModal function, after formData state

**Add:**
```typescript
// Dynamic lists for colleges, schools, departments
const [colleges, setColleges] = useState<string[]>([...ACADEMIC_COLLEGES]);
const [schools, setSchools] = useState<Record<string, string[] | null>>(ACADEMIC_SCHOOLS);
const [departments, setDepartments] = useState<Record<string, string[]>>(ACADEMIC_DEPARTMENTS);
const [adminUnits, setAdminUnits] = useState<string[]>([...ADMINISTRATIVE_UNITS]);
```

---

### **Step 5: Update Submit Handler**

**Current:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const fullPhoneNumber = formData.phoneNumber ? 
      `${formData.countryCode}${formData.phoneNumber}` : '';
    const { countryCode, ...dataToSend } = formData;
    const submitData = { ...dataToSend, phoneNumber: fullPhoneNumber };
    
    await api.updateUser(user.id, submitData);
    alert('User updated successfully!');
    onSuccess();
  } catch (err: any) {
    alert('Failed to update user: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

**No changes needed** - Already sends all formData fields to backend

---

### **Step 6: Import Required Components**

**Location**: Top of file (around line 10)

**Check if these imports exist:**
```typescript
import { AcademicWingForm } from './AcademicWingForm';
import { AdministrativeWingForm } from './AdministrativeWingForm';
import { ACADEMIC_COLLEGES, ACADEMIC_SCHOOLS, ACADEMIC_DEPARTMENTS, ADMINISTRATIVE_UNITS } from './organizationalData';
```

**If missing, add them.**

---

## Backend Support

### Check Backend API:

**File**: `Backend/src/controllers/userController.js`

**Update User Endpoint**: `PUT /api/users/:id`

The backend **SHOULD** already support updating hierarchy fields because the User model has these fields:
- `wing`
- `college`
- `school`
- `department`
- `administrativeUnit`

**Verify** the `updateUser` function accepts and updates these fields.

---

## Component Dependencies

### Required Components:

#### 1. **AcademicWingForm.tsx**
**Location**: `Frontend/app/users/AcademicWingForm.tsx`

**Purpose**: Renders college, school, department dropdowns for academic wing

**Props:**
```typescript
interface AcademicWingFormProps {
  formData: any;
  errors: Record<string, string>;
  onFormDataChange: (field: string, value: string) => void;
  colleges: string[];
  schools: Record<string, string[] | null>;
  departments: Record<string, string[]>;
  onAddCollege: (college: string) => void;
  onAddSchool: (school: string) => void;
  onAddDepartment: (department: string) => void;
}
```

#### 2. **AdministrativeWingForm.tsx**
**Location**: `Frontend/app/users/AdministrativeWingForm.tsx`

**Purpose**: Renders administrative unit dropdown for administrative wing

**Props:**
```typescript
interface AdministrativeWingFormProps {
  formData: any;
  errors: Record<string, string>;
  onFormDataChange: (field: string, value: string) => void;
  adminUnits: string[];
  onAddUnit: (unit: string) => void;
}
```

#### 3. **organizationalData.ts**
**Location**: `Frontend/app/users/organizationalData.ts`

**Purpose**: Contains predefined lists of colleges, schools, departments, and administrative units

**Exports:**
```typescript
export const ACADEMIC_COLLEGES: string[];
export const ACADEMIC_SCHOOLS: Record<string, string[] | null>;
export const ACADEMIC_DEPARTMENTS: Record<string, string[]>;
export const ADMINISTRATIVE_UNITS: string[];
```

---

## Summary of Changes Needed

### EditUserModal Component Changes:

1. ✅ **Add hierarchy fields to formData state**
   - wing, college, school, department, administrativeUnit

2. ✅ **Add state for dynamic lists**
   - colleges, schools, departments, adminUnits

3. ✅ **Add Wing selection dropdown**
   - After Email field

4. ✅ **Add conditional wing-specific forms**
   - `<AcademicWingForm />` when wing === 'academic'
   - `<AdministrativeWingForm />` when wing === 'administrative'

5. ✅ **Verify imports**
   - AcademicWingForm, AdministrativeWingForm, organizationalData

6. ✅ **No changes to submit handler**
   - Already sends all formData fields

---

## Testing After Implementation

### Test Steps:

1. **Login as administrator**
2. **Go to Users page**
3. **Click "Edit" on approval authority user**
4. **Verify new fields appear:**
   - Wing dropdown
   - College dropdown (if academic)
   - School dropdown (if academic)
   - Department dropdown (if academic)
   - Administrative Unit dropdown (if administrative)
5. **Select values:**
   - Wing: Academic
   - College: College of Health Sciences
   - School: School of Medicine
   - Department: Department of Internal Medicine
6. **Click "Update User"**
7. **Verify success message**
8. **Check database:**
   ```sql
   SELECT username, wing, college, school, department 
   FROM users 
   WHERE username = 'approval';
   ```
9. **Test dropdown in request form:**
   - Should now show the approval authority

---

## Alternative Quick Fix (Without Code Changes)

### Use SQL to Update Directly:

```sql
-- Update approval authority
UPDATE users
SET 
  wing = 'academic',
  college = 'College of Health Sciences',
  school = 'School of Medicine',
  department = 'Department of Internal Medicine'
WHERE username = 'approval';

-- Update vice president
UPDATE users
SET 
  wing = 'academic',
  college = 'College of Health Sciences',
  school = 'School of Medicine',
  department = 'Department of Internal Medicine'
WHERE username = 'vp';
```

**Then test the request form dropdown - it should work!**

---

## Recommendation

### **Option 1: Quick Fix (Immediate)**
Use SQL to update the hierarchy fields directly in the database. This will make the dropdown work immediately without any code changes.

### **Option 2: Proper Implementation (Long-term)**
Implement the hierarchy fields in the EditUserModal following the steps above. This allows administrators to manage hierarchy through the UI in the future.

---

**Status**: ✅ Analysis Complete  
**Root Cause**: EditUserModal intentionally simplified - missing hierarchy fields  
**Quick Fix**: Use SQL to update database directly  
**Proper Fix**: Add hierarchy fields to EditUserModal (6 steps above)
