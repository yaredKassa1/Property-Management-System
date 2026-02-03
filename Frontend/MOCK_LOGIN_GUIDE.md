# Mock Login Guide - Frontend Testing Without Backend

The application now works **completely without the backend** using mock authentication and mock data.

## How to Login

You can use **any username and password** to login. The system will create a mock user based on the role you select.

### Quick Login Examples:

1. **Administrator**
   - Username: `admin` (or any text)
   - Password: `anything` (or any text)
   - Role: Select "Administrator"

2. **Vice President**
   - Username: `vp` (or any text)
   - Password: `anything` (or any text)
   - Role: Select "Vice President"

3. **Property Officer**
   - Username: `officer` (or any text)
   - Password: `anything` (or any text)
   - Role: Select "Property Officer"

4. **Staff**
   - Username: `staff` (or any text)
   - Password: `anything` (or any text)
   - Role: Select "Staff"

## Available Pages with Mock Data

All pages now work with realistic mock data:

### ✅ Dashboard
- Shows statistics: Total Assets, Assigned Assets, Available Assets, etc.
- Displays recent activities with timestamps
- All data is mock but realistic

### ✅ Assets
- Lists 5 sample assets (laptops, projectors, chairs, etc.)
- Search functionality works
- Status badges and categories displayed
- "Register New Asset" button available

### ✅ Transfers
- Shows 2 sample transfer requests
- Displays from/to locations and users
- Status tracking (pending, approved)
- Approve/Reject buttons for authorized roles

### ✅ Returns
- Shows 2 sample return requests
- Displays return status and condition
- Inspection workflow visible
- Process return functionality

### ✅ Assignments
- Basic page structure ready
- Coming soon message displayed

### ✅ Requests
- Basic page structure ready
- Coming soon message displayed

### ✅ Users
- Basic page structure ready
- Coming soon message displayed

### ✅ Reports
- Basic page structure ready
- Coming soon message displayed

## What Happens

- The system creates a mock user with the username you entered
- A mock JWT token is generated and stored
- You're redirected to the dashboard
- All API calls return mock data (no backend needed)
- Navigation between pages works seamlessly

## Testing Different Roles

To test different role dashboards:
1. Logout from the current session
2. Login again with a different role selected
3. Each role may have different permissions and views

## Switching to Real Backend

When the backend is ready, simply change one line in `Frontend/lib/api.ts`:

```typescript
const MOCK_MODE = false; // Change from true to false
```

That's it! The app will automatically start making real API calls.

## Note

- ✅ No backend server needed
- ✅ All data is mock/temporary but realistic
- ✅ Perfect for UI testing and development
- ✅ Logo has been removed from the login page
- ✅ All major pages have mock data
- ✅ Easy to switch to real backend later
