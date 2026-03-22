'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { setAuthToken, setUser, isAuthenticated, acquireNavigationLock, releaseNavigationLock } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' as UserRole,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        console.log('[Login] Already authenticated');
        if (acquireNavigationLock()) {
          console.log('[Login] → Redirecting to /dashboard');
          router.replace('/dashboard');
          setTimeout(() => releaseNavigationLock(), 500);
        } else {
          console.log('[Login] Navigation locked, staying on page');
          setIsCheckingAuth(false);
        }
      } else {
        console.log('[Login] Not authenticated → showing login form');
        setIsCheckingAuth(false);
      }
    };

    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [router]);

  const roleOptions = [
    { value: 'administrator', label: 'Administrator', icon: '🛡️' },
    { value: 'vice_president', label: 'Vice President', icon: '🎓' },
    { value: 'property_officer', label: 'Property Officer', icon: '🗂️' },
    { value: 'approval_authority', label: 'Approval Authority', icon: '🧾' },
    { value: 'purchase_department', label: 'Purchase Department', icon: '🛒' },
    { value: 'quality_assurance', label: 'Quality Assurance', icon: '🧪' },
    { value: 'staff', label: 'Staff', icon: '👤' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await api.login(formData.username, formData.password);

      console.log('[Login] API Response:', response);

      const token = response.token;
      const user = response.user;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setAuthToken(token);
      setUser(user);

      console.log('[Login] Login successful:', { username: user.username, role: user.role });

      acquireNavigationLock();
      router.replace('/dashboard');
      setTimeout(() => releaseNavigationLock(), 500);
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f87]"></div>
          <p className="text-[#191c1d]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-[#191c1d] font-body">
      {/* Left Side - Branding with architectural background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden editorial-gradient">
        <div className="absolute inset-0 opacity-20">
          <img 
            alt="Woldia University Architecture" 
            className="w-full h-full object-cover grayscale brightness-50"
            src="/stitch_professional_login_page.jpg"
          />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="text-center animate-fade-in-up">
            <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="/woldia-logo.jpg"
                alt="Woldia University logo"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Woldia University</h1>
            <div className="h-1 w-32 bg-white/50 mx-auto mb-6 rounded-full"></div>
            <h2 className="text-2xl font-semibold mb-3">Property Management System</h2>
            <p className="text-lg text-white/90 italic mb-8">"Open Mind, Open Eyes"</p>
          </div>

          <div className="mt-12 space-y-4 max-w-md">
            {/* Your branding cards ... */}
           

            {/* Main heading */}
           
          
           
          </div>
        </div>
      </div>

      {/* Right Side - Login Functional Area */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-[#f8f9fa]">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="md:hidden flex flex-col items-center mb-10 text-center">
            <span className="material-symbols-outlined text-[#003f87] text-5xl mb-2">account_balance</span>
            <h2 className="text-2xl font-headline font-extrabold tracking-tighter text-[#003f87]">Woldia Property system</h2>
          </div>

          {/* Form Header */}
          <div className="mb-10">
            <h3 className="text-3xl font-headline font-extrabold text-[#191c1d] tracking-tight mb-2">Secure Access</h3>
            <p className="text-[#424752] font-body"></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection - Custom styled to match image */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#424752] tracking-wide font-label">
                Account Role
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3.5 bg-[#f3f4f5] border border-[#c2c6d4]/30 rounded-lg focus:ring-2 focus:ring-[#003f87] focus:border-transparent transition-all outline-none font-body text-[#191c1d] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23727784' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#424752] tracking-wide font-label" htmlFor="username">
               Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727784]">
                  alternate_email
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. WU-12345"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f3f4f5] border border-[#c2c6d4]/30 rounded-lg focus:ring-2 focus:ring-[#003f87] focus:border-transparent transition-all outline-none font-body text-[#191c1d]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-[#424752] tracking-wide font-label" htmlFor="password">
                  Security Password
                </label>
                <button
                  type="button"
                  className="text-xs font-bold text-[#735c00] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727784]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#f3f4f5] border border-[#c2c6d4]/30 rounded-lg focus:ring-2 focus:ring-[#003f87] focus:border-transparent transition-all outline-none font-body text-[#191c1d]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727784] hover:text-[#191c1d] transition-colors"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg p-4 bg-[#ffdad6] border border-[#93000a]/20">
                <p className="text-sm font-medium text-[#93000a]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full editorial-gradient text-white py-4 rounded-lg font-headline font-bold text-lg shadow-lg shadow-[#003f87]/20 hover:shadow-[#003f87]/30 active:scale-[0.98] transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Signing in</span>
                  <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Helpdesk Footer */}
          <div className="mt-12 pt-8 border-t border-[#e1e3e4] flex flex-col items-center space-y-4">
            <p className="text-sm text-[#424752] font-body">Access issues or new registration?</p>
            <button
              type="button"
              className="flex items-center space-x-2 py-2 px-6 rounded-full bg-[#cfe2f9] text-[#526478] font-semibold hover:bg-[#d1e4fb] transition-colors"
            >
              <span className="material-symbols-outlined text-xl">support_agent</span>
            
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 px-8 border-t border-slate-200 dark:border-slate-800 absolute bottom-0 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-['Inter'] font-medium">
            © 2024 Woldia University. All rights reserved. Built for Digital Ledger Excellence.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-['Inter'] font-medium">Privacy Policy</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-['Inter'] font-medium">Terms of Service</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-['Inter'] font-medium">IT Support</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-['Inter'] font-medium">Institutional Directory</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .editorial-gradient {
          background: linear-gradient(135deg, #003f87 0%, #0056b3 100%);
        }
        .font-headline {
          font-family: 'Manrope', sans-serif;
        }
        .font-body {
          font-family: 'Inter', sans-serif;
        }
        .font-label {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}