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
    // Only redirect if already authenticated
    const checkAuth = () => {
      if (isAuthenticated()) {
        console.log('[Login] Already authenticated');
        // Try to acquire lock before redirecting
        if (acquireNavigationLock()) {
          console.log('[Login] → Redirecting to /dashboard');
          router.replace('/dashboard');
          // Release lock after a delay
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
    
    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [router]);

  const roleOptions = [
    { value: 'administrator', label: 'Administrator', icon: '🛡️', color: 'purple' },
    { value: 'vice_president', label: 'Vice President', icon: '🎓', color: 'blue' },
    { value: 'property_officer', label: 'Property Officer', icon: '🗂️', color: 'green' },
    { value: 'approval_authority', label: 'Approval Authority', icon: '🧾', color: 'yellow' },
    { value: 'purchase_department', label: 'Purchase Department', icon: '🛒', color: 'red' },
    { value: 'quality_assurance', label: 'Quality Assurance', icon: '🧪', color: 'indigo' },
    { value: 'staff', label: 'Staff', icon: '👤', color: 'gray' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call real backend API
      const response: any = await api.login(formData.username, formData.password);

      console.log('[Login] API Response:', response);

      // Extract token and user from response
      const token = response.token;
      const user = response.user;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Remove only the auth-related keys
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Save using helpers
      setAuthToken(token);
      setUser(user);

      console.log('[Login] Login successful:', { username: user.username, role: user.role });
      console.log('[Login] Token saved:', !!localStorage.getItem('token'));
      console.log('[Login] User saved:', !!localStorage.getItem('user'));

      // Acquire navigation lock and redirect
      acquireNavigationLock();
      router.replace('/dashboard');
      // Release lock after navigation completes
      setTimeout(() => releaseNavigationLock(), 500);
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff6f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b56b6b]"></div>
          <p className="text-[#9b8b8b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#fff6f6] text-[#3b3b3b]">
      {/* Left Side - Branding (rose palette) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#cfaeb0] via-[#e6c7c5] to-[#f6e8e6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-[#e8c7c4] rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-[#f2d6d5] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#e9cfcf] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-[#4a3a3a]">
          <div className="text-center animate-fade-in-up">
            <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="/woldia-logo.jpg"
                alt="Woldia University logo"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Woldia University</h1>
            <div className="h-1 w-32 bg-[#ffffff66] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-2xl font-semibold mb-3">Property Management System</h2>
            <p className="text-lg italic mb-8">"Open Mind, Open Eyes"</p>
          </div>

          <div className="mt-12 space-y-4 max-w-md">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Access</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Role-based authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: '#4b3b3b' }}>Woldia University</h1>
            <p className="text-sm" style={{ color: '#7b6b6b' }}>Property Management System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#f0e6e6' }}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#4b3b3b' }}>Welcome Back</h2>
              <p className="text-sm" style={{ color: '#7b6b6b' }}>Sign in to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#5a4a4a' }}>
                  Select Your Role
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3.5 pr-10 bg-[#fbf5f5] border-2 rounded-xl text-[#4b3b3b] font-medium appearance-none cursor-pointer transition-all duration-200 focus:outline-none"
                    style={{
                      borderColor: '#ead6d6',
                      backgroundColor: '#fbf5f5',
                    }}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#a89a9a' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#5a4a4a' }}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#b7abab' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl font-medium transition-all duration-200"
                    style={{
                      backgroundColor: '#fbf5f5',
                      border: '2px solid #ead6d6',
                      color: '#4b3b3b',
                      placeholderColor: '#b7abab',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#5a4a4a' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#b7abab' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl font-medium transition-all duration-200"
                    style={{
                      backgroundColor: '#fbf5f5',
                      border: '2px solid #ead6d6',
                      color: '#4b3b3b',
                      placeholderColor: '#b7abab',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors p-1"
                    style={{ color: '#a89a9a' }}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#a86f6f] focus:ring-[#a86f6f] cursor-pointer" />
                  <span className="group-hover:text-[#513c3c]" style={{ color: '#6f5f5f' }}>Remember me</span>
                </label>
                <button type="button" className="font-semibold transition-colors" style={{ color: '#a86f6f' }}>
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: '#fff1f1', border: '2px solid #f2d6d6' }}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#c74b4b' }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#8a2a2a' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(90deg, #55603a 0%, #4a5331 100%)',
                  boxShadow: '0 10px 25px rgba(85,96,58,0.12)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#fff' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#f0e6e6' }}>
              <p className="text-sm" style={{ color: '#7b6b6b' }}>
                Need help? <button className="font-semibold" style={{ color: '#a86f6f' }}>Contact administrator</button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#9b8b8b' }}>
            © 2026 Woldia University. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}