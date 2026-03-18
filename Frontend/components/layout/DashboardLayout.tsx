// components/layout/DashboardLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, acquireNavigationLock, releaseNavigationLock } from '@/lib/auth';
import { User } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

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
        console.log('[DashboardLayout] ✓ Authenticated - showing dashboard');
        setCurrentUser(user);
        setIsAuthorized(true);
        setIsChecking(false);
        // Release any navigation lock since we're successfully showing the page
        releaseNavigationLock();
      } else {
        console.log('[DashboardLayout] ✗ Not authenticated');
        setIsChecking(false);
        setIsAuthorized(false);
        // Try to acquire lock before redirecting
        if (acquireNavigationLock()) {
          console.log('[DashboardLayout] → Redirecting to /login');
          router.replace('/login');
          // Release lock after a delay
          setTimeout(() => releaseNavigationLock(), 500);
        } else {
          console.log('[DashboardLayout] Navigation locked, blocking redirect');
        }
      }
    };

    // Give localStorage a moment to be ready after navigation
    const timer = setTimeout(checkAuthentication, 50);

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
        <Sidebar user={currentUser} />

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto ml-64">
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