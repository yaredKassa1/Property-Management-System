'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setAuthToken, setUser } from '@/lib/auth';
import { AuthResponse, UserRole } from '@/lib/types';

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
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roleOptions = [
    { value: 'administrator', label: 'Administrator', icon: '👑' },
    { value: 'vice_president', label: 'Vice President', icon: '🎯' },
    { value: 'property_officer', label: 'Property Officer', icon: '🏢' },
    { value: 'approval_authority', label: 'Approval Authority', icon: '✅' },
    { value: 'purchase_department', label: 'Purchase Department', icon: '🛒' },
    { value: 'quality_assurance', label: 'Quality Assurance', icon: '🔍' },
    { value: 'staff', label: 'Staff', icon: '👤' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(formData.username, formData.password) as AuthResponse;
      setAuthToken(response.token);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Refined Background – More blue-centric, subtler blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[140px] opacity-30 animate-pulse slow-pulse"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Enhanced Glass Card - Light Theme */}
        <div className="relative bg-white/70 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">

          {/* Header – Woldia University Branding */}
          <div className="px-8 pt-12 pb-8 text-center">
            {/* University Logo – Replace with actual logo in public/wdu-logo.png */}
            <div className="relative inline-block group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl ring-1 ring-slate-100 transform transition-transform duration-500 group-hover:scale-105">
                {/* Placeholder for official logo */}
                <img
                  src="/wdu-logo.png"
                  alt="Woldia University Logo"
                  className="w-24 h-24 object-contain rounded-full"
                  onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('fallback-logo');
                  }}
                />
                <div className="hidden fallback-logo text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-600">WDU</div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Woldia University</h1>
              <p className="text-lg font-semibold text-blue-600">Property Management System</p>
              <p className="text-sm text-slate-500 font-medium">WDUPMS - "Open Mind, Open Eyes"</p>
            </div>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Role Select */}
              <div className="relative group">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                  className="peer w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-4 pt-5 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-slate-100 hover:border-blue-300"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-slate-800">
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <label className="absolute left-4 top-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider transition-all pointer-events-none">
                  Select Role
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>

              {/* Username */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="peer w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-4 pt-5 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-transparent hover:bg-slate-100 hover:border-blue-300"
                  placeholder="Username"
                />
                <label className={`absolute left-11 transition-all pointer-events-none duration-200 ${focusedField === 'username' || formData.username ? 'top-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider' : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'}`}>
                  Username
                </label>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'username' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="peer w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-4 pt-5 pl-11 pr-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-transparent hover:bg-slate-100 hover:border-blue-300"
                  placeholder="Password"
                />
                <label className={`absolute left-11 transition-all pointer-events-none duration-200 ${focusedField === 'password' || formData.password ? 'top-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider' : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'}`}>
                  Password
                </label>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2.5 cursor-pointer group select-none">
                  <div className="relative">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only peer" />
                    <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200"></div>
                    <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-500 group-hover:text-slate-700 transition-colors font-medium">Remember me</span>
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-700 transition-colors font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center animate-shake">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl shadow-blue-500/20 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    'Access Dashboard'
                  )}
                </span>
              </button>
            </form>

            {/* Footer – Updated */}
            <div className="mt-10 text-center border-t border-slate-100 pt-6">
              <p className="text-slate-400 text-xs">© {new Date().getFullYear()} Woldia University. All rights reserved.</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider font-semibold">Privacy</a>
                <span className="text-slate-300">•</span>
                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider font-semibold">Terms</a>
                <span className="text-slate-300">•</span>
                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider font-semibold">Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}