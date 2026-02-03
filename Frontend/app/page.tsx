'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDefaultRouteForRole } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Get token and user from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    console.log('HomePage: Token:', token);
    console.log('HomePage: User:', user);

    // Check if both exist and are valid
    const hasValidToken = token && token !== 'undefined' && token !== 'null';
    const hasValidUser = user && user !== 'undefined' && user !== 'null';

    if (hasValidToken && hasValidUser) {
      const parsedUser = user ? JSON.parse(user) : null;
      const targetRoute = parsedUser?.role ? getDefaultRouteForRole(parsedUser.role) : '/dashboard';
      console.log('HomePage: Has valid auth, redirecting to', targetRoute);
      router.replace(targetRoute);
    } else {
      console.log('HomePage: No valid auth, redirecting to login');
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
