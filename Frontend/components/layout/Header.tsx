// components/layout/header.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { removeAuthToken } from '@/lib/auth';
import { getRoleLabel } from '@/lib/utils';
import { useTheme } from '@/lib/contexts';
import { useLanguage } from '@/lib/contexts';
import { useNotifications } from '@/lib/contexts';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications();

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setShowProfileDropdown(false);
  };

  const handleLanguageChange = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleNotificationClick = (id: string, type: string, title?: string) => {
    markAsRead(id);
    setShowNotificationPanel(false);
    // Route based on notification title keywords
    const t = (title || '').toLowerCase();
    if (t.includes('vp') || t.includes('vice president') || t.includes('purchase request awaiting')) {
      router.push('/vp-approvals');
    } else if (t.includes('purchase order') || t.includes('procure') || t.includes('procurement')) {
      router.push('/procurement');
    } else if (t.includes('qa') || t.includes('quality') || t.includes('inspection')) {
      router.push('/qa-inspections');
    } else if (t.includes('approval') || t.includes('approve') || t.includes('request')) {
      router.push('/requests');
    } else {
      const routes: Record<string, string> = {
        request: '/requests', transfer: '/transfers', return: '/returns', general: '/dashboard',
      };
      router.push(routes[type] || '/dashboard');
    }
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

        {/* Right: Icons and User Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => {
                const opening = !showNotificationPanel;
                setShowNotificationPanel(opening);
                if (opening) refresh();
              }}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('notifications')}
              title={t('notifications')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {showNotificationPanel && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{t('notifications')}</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {t('no_notifications')}
                  </div>
                ) : (
                  <div>
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.type, notif.title)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notif.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === 'request' ? 'bg-blue-500' :
                            notif.type === 'return' ? 'bg-green-500' :
                            notif.type === 'transfer' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Icon */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('theme_toggle')}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 015.646 5.646 9.003 9.003 0 0015.354 15.354z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Language Preference Icon */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('language_preference')}
              title={t('language_preference')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5l5.68 5.68a1 1 0 001.497 0L16 5m-3 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === 'en'
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('am')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === 'am'
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  አማርኛ (Amharic)
                </button>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative ml-2 pl-2 border-l border-gray-200">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 transition-all hover:bg-gray-50"
              aria-label="User menu"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
              </div>

              {/* User Info */}
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.fullName || user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleLabel(user.role)}
                </p>
              </div>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('profile')}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-100 mt-1"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}