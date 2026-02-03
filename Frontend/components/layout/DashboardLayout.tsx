// components/layout/DashboardLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { Header } from '@/components/layout/Header'; // adjust path if needed
// import Sidebar or other layout components if you have them

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const checkAuthentication = () => {
      const authenticated = isAuthenticated();
      const user = getUser();

      console.log('[DashboardLayout] Auth check:');
      console.log('   isAuthenticated →', authenticated);
      console.log('   user →', user);

      if (authenticated && user) {
        setCurrentUser(user);
        setIsAuthorized(true);
      } else {
        console.log('[DashboardLayout] → Not authenticated → redirecting to /login');
        router.replace('/login');
      }

      setIsChecking(false);
    };

    // Give localStorage a tiny moment to be ready (helps in some edge cases)
    const timer = setTimeout(checkAuthentication, 80);

    return () => clearTimeout(timer);
  }, [router]);

  // Prevent any flash of content before mount & check
  if (!isMounted || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authorized → we already redirected, but just in case
  if (!isAuthorized || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header user={currentUser} />

      {/* Optional: Sidebar + Main content wrapper */}
      <div className="flex flex-1">
        {/* Sidebar (uncomment/add when you have it) */}
        {/* <Sidebar /> */}

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Optional footer */}
      {/* <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Woldia University Property Management System
      </footer> */}
    </div>
  );
}