// components/layout/header.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { removeAuthToken } from '@/lib/auth';
import { getRoleLabel } from '@/lib/utils'; // Assuming you have this utility

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
    // Optional: force reload to clear any cached state
    // window.location.href = '/login';
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: App Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            Woldia University Property Management System
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Secure • Efficient • Transparent
          </p>
        </div>

        {/* Right: User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 transition-all"
            aria-label="User menu"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-800">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleLabel(user.role)}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-100 mt-1"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}