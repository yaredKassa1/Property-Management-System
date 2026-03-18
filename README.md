# Woldia University Property Management System (WDUPMS) - Frontend

A modern web-based property management system built with Next.js for Woldia University.

## Features

- **User Authentication & Authorization**: Role-based access control with JWT
- **Asset Management**: Register, update, and track university assets
- **Assignment Management**: Assign assets to staff and departments
- **Transfer Workflow**: Request and approve asset transfers
- **Return Management**: Handle asset returns with inspection
- **Request System**: Manage withdrawal and purchase requests
- **Reporting**: Generate various reports (asset status, transfers, inventory, audit trail)
- **Dashboard**: Real-time overview of system statistics

## User Roles

- Administrator
- Vice President
- Property Officer
- Approval Authority
- Purchase Department
- Quality Assurance
- Staff

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **API Communication**: Fetch API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (Node.js + Express + PostgreSQL)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Woldia University Property Management System
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── assets/            # Asset management pages
│   ├── assignments/       # Assignment pages
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Authentication page
│   ├── reports/           # Reporting pages
│   ├── requests/          # Request management
│   ├── returns/           # Return management
│   ├── transfers/         # Transfer management
│   ├── users/             # User management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/               # UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Table.tsx
├── lib/                   # Utility libraries
│   ├── api.ts            # API client
│   ├── auth.ts           # Authentication utilities
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## API Integration

The frontend communicates with a Node.js/Express backend API. Key endpoints:

- `/api/auth/login` - User authentication
- `/api/assets` - Asset CRUD operations
- `/api/assignments` - Assignment management
- `/api/transfers` - Transfer workflow
- `/api/returns` - Return management
- `/api/requests` - Request handling
- `/api/reports` - Report generation
- `/api/users` - User management
- `/api/dashboard/stats` - Dashboard statistics

## Development Guidelines

### Adding New Pages

1. Create a new folder in `app/` directory
2. Add `page.tsx` file
3. Wrap content with `DashboardLayout`
4. Update sidebar navigation in `components/layout/Sidebar.tsx`

### Creating Components

- Place reusable UI components in `components/ui/`
- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling

### State Management

- Use React hooks (useState, useEffect)
- API calls through `lib/api.ts`
- Authentication state in localStorage

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
# Deploy the .next folder and node_modules to your server
npm start
```

## Contributing

This project was developed by:
- Aklilu Mengesha (Frontend Developer)
- Betelhem Asmiro (Requirement Elicitor & Deployment)
- Haftamu Teamr (Requirement Analyst)
- Mastewal Tilaye (System Designer)
- Yared Kassa (Backend Developer)

## License

© 2026 Woldia University. All rights reserved.

## Support

For issues or questions, contact the development team or system administrator.
