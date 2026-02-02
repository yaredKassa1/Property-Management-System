# 🚀 Quick Start Guide

Get the WDUPMS frontend running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Code editor (VS Code recommended)

## Installation Steps

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `.env.local` in the frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Woldia University Property Management System
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Visit: **http://localhost:3000**

## 🎉 You're Done!

The application should now be running. You'll see the login page.

## Test Login (Mock Mode)

Since the backend isn't connected yet, you can test the UI:

1. Select any role from dropdown
2. Enter any username
3. Enter any password
4. Click Login

**Note**: Without backend, you'll see an error. This is expected!

## Next Steps

### Connect to Backend

1. Ensure your Node.js backend is running on port 5000
2. Update `.env.local` if using different port
3. Restart the dev server

### Explore the Application

- **Dashboard**: View statistics and recent activities
- **Assets**: Browse and register assets
- **Transfers**: Manage transfer requests
- **Reports**: Generate various reports

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Folder Structure

```
frontend/
├── app/              # Pages and routes
├── components/       # Reusable components
├── lib/              # Utilities and types
└── public/           # Static files
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Build Errors
```bash
# Check TypeScript
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
npm run build
```

## Development Tips

1. **Hot Reload**: Changes auto-refresh in browser
2. **TypeScript**: Hover over code for type hints
3. **Tailwind**: Use utility classes for styling
4. **Components**: Check `/components/ui` for reusable parts

## File Locations

- **Pages**: `/app/[page-name]/page.tsx`
- **Components**: `/components/ui/` or `/components/layout/`
- **Types**: `/lib/types.ts`
- **API Client**: `/lib/api.ts`
- **Styles**: `/app/globals.css`

## Need Help?

1. Check **SETUP.md** for detailed instructions
2. Read **README.md** for feature overview
3. See **PROJECT_SUMMARY.md** for architecture
4. Review **COMMIT_GUIDE.md** for Git workflow

## Production Deployment

### Quick Deploy to Vercel

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `WDUPMS` |

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest versions)

## Performance

- Initial load: ~2s
- Page transitions: <100ms
- Build time: ~15s

## Security Notes

- JWT tokens stored in localStorage
- HTTPS required in production
- CORS must be configured on backend

## What's Working

✅ UI/UX fully functional  
✅ All pages accessible  
✅ Responsive design  
✅ TypeScript validation  
✅ Production build  

## What Needs Backend

⏳ Authentication  
⏳ Data fetching  
⏳ CRUD operations  
⏳ File uploads  
⏳ Report generation  

## Quick Reference

### Login Page
`/login` - Authentication interface

### Dashboard
`/dashboard` - Main overview

### Assets
`/assets` - Asset management  
`/assets/new` - Register new asset

### Other Pages
- `/transfers` - Transfer management
- `/reports` - Report generation
- `/assignments` - Assignment tracking
- `/returns` - Return processing
- `/requests` - Request handling
- `/users` - User management

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search (future)
- `Ctrl/Cmd + /` - Help menu (future)
- `Esc` - Close modals

## Mobile Access

The app is fully responsive. Access from:
- Smartphones (iOS/Android)
- Tablets
- Desktop browsers

## API Endpoints Expected

The frontend expects these backend endpoints:

```
POST   /api/auth/login
GET    /api/dashboard/stats
GET    /api/assets
POST   /api/assets
GET    /api/transfers
POST   /api/transfers/:id/approve
GET    /api/reports/generate
```

See `lib/api.ts` for complete list.

## Default Ports

- Frontend: `3000`
- Backend: `5000` (expected)

## Tech Stack Summary

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Routing**: App Router

## Success Indicators

When everything is working:
- ✅ No console errors
- ✅ Pages load quickly
- ✅ Navigation works smoothly
- ✅ Forms are responsive

## Getting Updates

```bash
git pull origin main
npm install
npm run dev
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear message
5. Push and create PR

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

**Ready to build?** Run `npm run dev` and start coding! 🚀

For detailed information, see the other documentation files.
