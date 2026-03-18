# WDUPMS Frontend - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Woldia University Property Management System
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Default Login Credentials (Development)

These should be configured in your backend:

- **Administrator**
  - Username: admin
  - Password: admin123

- **Property Officer**
  - Username: officer
  - Password: officer123

- **Staff**
  - Username: staff
  - Password: staff123

## Project Features Implemented

### ✅ Completed Features

1. **Authentication System**
   - Login page with role selection
   - JWT token management
   - Protected routes
   - Session persistence

2. **Dashboard**
   - Statistics cards (Total Assets, Assigned, Available, etc.)
   - Recent activities feed
   - Role-based view

3. **Asset Management**
   - Asset listing with search
   - Asset registration form
   - Asset details view
   - Status badges and filters

4. **Transfer Management**
   - Transfer request listing
   - Approval/Rejection workflow
   - Status tracking

5. **Reports**
   - Report type selection
   - Date range filters
   - Export functionality

6. **UI Components**
   - Reusable Input, Button, Select
   - Table components
   - Card layouts
   - Badge components
   - Responsive sidebar navigation
   - Header with user profile

### 🚧 To Be Implemented (Backend Integration Required)

1. **Assignment Management**
   - Create assignments
   - View assignment history
   - User card generation

2. **Return Management**
   - Return request submission
   - Inspection workflow
   - Condition assessment

3. **Request System**
   - Withdrawal requests
   - Purchase requests
   - Approval workflow

4. **User Management**
   - Create/Edit users
   - Role assignment
   - User activation/deactivation

5. **Notifications**
   - Real-time notifications
   - Notification center
   - Email notifications

6. **Advanced Reporting**
   - PDF export
   - Excel export
   - Custom report builder

## File Structure Explanation

### `/app` Directory
- **page.tsx**: Home page (redirects to dashboard or login)
- **layout.tsx**: Root layout with metadata
- **globals.css**: Global styles and Tailwind imports
- **/login**: Authentication pages
- **/dashboard**: Main dashboard
- **/assets**: Asset management pages
- **/transfers**: Transfer workflow pages
- **/reports**: Reporting interface
- Other feature pages (assignments, returns, requests, users)

### `/components` Directory
- **/layout**: Layout components (Header, Sidebar, DashboardLayout)
- **/ui**: Reusable UI components (Button, Input, Table, etc.)

### `/lib` Directory
- **api.ts**: API client with all endpoint methods
- **auth.ts**: Authentication utilities (token management)
- **types.ts**: TypeScript type definitions
- **utils.ts**: Helper functions (formatting, colors, etc.)

## Backend API Requirements

The frontend expects the following API structure:

### Authentication
```
POST /api/auth/login
Body: { username, password }
Response: { token, user }
```

### Assets
```
GET    /api/assets
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
DELETE /api/assets/:id
```

### Transfers
```
GET  /api/transfers
POST /api/transfers
POST /api/transfers/:id/approve
POST /api/transfers/:id/reject
```

### Dashboard
```
GET /api/dashboard/stats
Response: {
  totalAssets, assignedAssets, availableAssets,
  underMaintenance, pendingTransfers, pendingReturns,
  recentActivities: []
}
```

## Customization

### Changing Colors
Edit `tailwind.config.ts` or use Tailwind classes directly in components.

### Adding New Routes
1. Create folder in `/app`
2. Add `page.tsx`
3. Update sidebar navigation in `components/layout/Sidebar.tsx`

### Modifying API URL
Update `.env.local` file with your backend URL.

## Deployment Checklist

- [ ] Update API URL in `.env.local`
- [ ] Run `npm run build` to check for errors
- [ ] Test all user roles
- [ ] Verify authentication flow
- [ ] Test on different browsers
- [ ] Check mobile responsiveness
- [ ] Configure production environment variables
- [ ] Set up SSL certificate
- [ ] Configure CORS on backend

## Troubleshooting

### Issue: "Failed to fetch"
- Check if backend API is running
- Verify API URL in `.env.local`
- Check CORS configuration on backend

### Issue: "Unauthorized" errors
- Clear localStorage
- Re-login
- Check JWT token expiration

### Issue: Components not styling correctly
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

## Performance Optimization

- Images are optimized with Next.js Image component
- Code splitting with dynamic imports
- API responses are cached where appropriate
- Lazy loading for heavy components

## Security Considerations

- JWT tokens stored in localStorage
- Protected routes with authentication check
- Role-based access control
- Input validation on forms
- XSS protection with React
- CSRF protection (implement on backend)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. Connect to actual backend API
2. Implement remaining features
3. Add comprehensive error handling
4. Implement loading states
5. Add form validation
6. Create unit tests
7. Add E2E tests
8. Optimize bundle size
9. Add analytics
10. Deploy to production

## Contact

For technical support or questions:
- Frontend Developer: Aklilu Mengesha
- Project Advisor: Zeleke C.
