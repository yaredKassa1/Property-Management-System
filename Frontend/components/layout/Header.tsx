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
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setShowNotificationPanel(false);
    setSelectedNotification(notif);
    setShowNotificationModal(true);
  };

  const handleViewDetails = () => {
    if (!selectedNotification) return;
    
    const title = (selectedNotification.title || '').toLowerCase();
    const relatedId = selectedNotification.relatedId;
    
    setShowNotificationModal(false);
    
    // Small delay to ensure modal closes smoothly
    setTimeout(() => {
      // If we have a relatedId, navigate with hash
      if (relatedId) {
        // Determine the page based on notification type and title
        let targetPage = '/requests';
        
        if (title.includes('transfer')) {
          targetPage = '/transfers';
        } else if (title.includes('return')) {
          targetPage = '/returns';
        } else if (title.includes('vp') || title.includes('vice president')) {
          targetPage = '/vp-approvals';
        } else if (title.includes('purchase') || title.includes('procure') || title.includes('procurement')) {
          targetPage = '/procurement';
        } else if (title.includes('qa') || title.includes('quality') || title.includes('inspection')) {
          targetPage = '/qa-inspections';
        }
        
        // Navigate with hash - force a full navigation
        window.location.href = `${targetPage}#${relatedId}`;
      } else {
        // No relatedId, navigate to general pages
        if (title.includes('assign') || title.includes('ready for collection') || title.includes('approved')) {
          router.push('/requests');
        } else if (title.includes('vp') || title.includes('vice president')) {
          router.push('/vp-approvals');
        } else if (title.includes('purchase') || title.includes('procure') || title.includes('procurement')) {
          router.push('/procurement');
        } else if (title.includes('qa') || title.includes('quality') || title.includes('inspection')) {
          router.push('/qa-inspections');
        } else if (title.includes('transfer')) {
          router.push('/transfers');
        } else if (title.includes('return')) {
          router.push('/returns');
        } else if (title.includes('asset')) {
          router.push('/assets');
        } else {
          router.push('/requests');
        }
      }
    }, 100);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo and App Title */}
        <div className="flex items-center gap-4">
          {/* University Logo */}
          <img 
            src="/university-logo.jpg" 
            alt="Woldia University Logo" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Woldia University Property Management System
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Secure • Efficient • Transparent
            </p>
          </div>
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
              className="relative p-2 text-gray-600 hover:bg-blue-50 hover:text-[#1E9FE8] rounded-lg transition-colors"
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

            {/* Notification Panel - Modern Design */}
            {showNotificationPanel && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-[#1578B8] to-[#1E9FE8] p-5 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{t('notifications')}</h3>
                        <p className="text-xs text-white/80">
                          {unreadCount > 0 ? `${unreadCount} ${unreadCount === 1 ? 'new notification' : 'new notifications'}` : 'All caught up!'}
                        </p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead} 
                        className="text-xs text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[28rem] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">{t('no_notifications')}</p>
                      <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif, index) => {
                        // Determine icon and colors based on notification type
                        const getNotificationStyle = (type: string) => {
                          switch(type) {
                            case 'request':
                              return {
                                bgColor: 'bg-blue-100',
                                iconColor: 'text-[#1E9FE8]',
                                icon: (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                )
                              };
                            case 'return':
                              return {
                                bgColor: 'bg-green-100',
                                iconColor: 'text-green-600',
                                icon: (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                )
                              };
                            case 'transfer':
                              return {
                                bgColor: 'bg-purple-100',
                                iconColor: 'text-purple-600',
                                icon: (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                )
                              };
                            default:
                              return {
                                bgColor: 'bg-gray-100',
                                iconColor: 'text-gray-600',
                                icon: (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )
                              };
                          }
                        };

                        const style = getNotificationStyle(notif.type);
                        
                        return (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group relative ${
                              !notif.isRead ? 'bg-blue-50/50' : ''
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-12 h-12 ${style.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                                <svg className={`w-6 h-6 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {style.icon}
                                </svg>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-[#1E9FE8] transition-colors">
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <div className="w-2.5 h-2.5 bg-[#1E9FE8] rounded-full flex-shrink-0 mt-1 animate-pulse" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }) : ''}</span>
                                </div>
                              </div>

                              {/* Arrow indicator on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg className="w-5 h-5 text-[#1E9FE8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-gray-100 p-3 bg-gray-50">
                    <button 
                      onClick={() => setShowNotificationPanel(false)}
                      className="w-full text-center text-sm text-[#1E9FE8] hover:text-[#1578B8] font-medium py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                    >
                      Close notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Icon */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:bg-blue-50 hover:text-[#1E9FE8] rounded-lg transition-colors"
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
              className="p-2 text-gray-600 hover:bg-blue-50 hover:text-[#1E9FE8] rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
              aria-label={t('language_preference')}
              title={t('language_preference')}
            >
              <span className="text-sm font-bold">
                {language === 'en' ? 'EN' : 'አማ'}
              </span>
            </button>

            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === 'en'
                      ? 'bg-blue-50 text-[#1E9FE8] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('am')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === 'am'
                      ? 'bg-blue-50 text-[#1E9FE8] font-medium'
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
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1E9FE8] rounded-lg p-1 transition-all hover:bg-blue-50"
              aria-label="User menu"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary-light to-brand-primary flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1E9FE8] transition-colors flex items-center gap-3"
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

      {/* Notification Detail Modal */}
      {showNotificationModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1578B8] to-[#1E9FE8] p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon based on type */}
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedNotification.type === 'request' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      ) : selectedNotification.type === 'return' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      ) : selectedNotification.type === 'transfer' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedNotification.title}
                    </h2>
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : ''}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium capitalize">
                        {selectedNotification.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-4"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Message Details
                  </h3>
                  <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Additional Info */}
                {selectedNotification.relatedId && (
                  <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                      Related Information
                    </h3>
                    <div className="flex items-center gap-2 text-blue-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Reference ID: <span className="font-mono font-semibold">{selectedNotification.relatedId}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={handleViewDetails}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1578B8] to-[#1E9FE8] hover:from-[#1E9FE8] hover:to-[#5BC0EB] text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>View Details</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
