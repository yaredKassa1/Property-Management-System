'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';
import { WingSelectionModal } from './WingSelectionModal';
import { ACADEMIC_COLLEGES, ACADEMIC_SCHOOLS, ACADEMIC_DEPARTMENTS, ADMINISTRATIVE_UNITS } from './organizationalData';
import { AcademicWingForm } from './AcademicWingForm';
import { AdministrativeWingForm } from './AdministrativeWingForm';
import { useLanguage } from '@/lib/contexts';
import {
  UsersIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  AcademicCapIcon,
  FolderIcon,
  DocumentCheckIcon,
  ShoppingCartIcon,
  BeakerIcon,
  PencilIcon,
  KeyIcon,
  NoSymbolIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWingSelection, setShowWingSelection] = useState(false);
  const [selectedWing, setSelectedWing] = useState<'academic' | 'administrative' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { t } = useLanguage();

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    if (user?.role !== 'administrator') {
      setError(t('access_denied_admin'));
      setLoading(false);
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await api.getUsers();
      const data = Array.isArray(response) ? response : response.data || [];
      setUsers(data);
    } catch (err: any) {
      setError(t('failed_to_load_users'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`${t('deactivate_user_confirm')} "${user.username}"?`)) return;
    setActionLoading(true);
    try { await api.deleteUser(user.id, false); fetchUsers(); }
    catch (err: any) { alert(`${t('failed')}: ` + err.message); }
    finally { setActionLoading(false); }
  };

  const handleResetPassword = async (user: User) => {
    const pw = prompt(`${t('new_password_prompt')} "${user.username}" (${t('min_6_chars')}):`);
    if (!pw || pw.length < 6) { if (pw !== null) alert(t('min_6_characters_required')); return; }
    setActionLoading(true);
    try { await api.resetUserPassword(user.id, pw); alert(t('password_reset_success')); }
    catch (err: any) { alert(`${t('failed')}: ` + err.message); }
    finally { setActionLoading(false); }
  };

  const handleEdit = (user: User) => { setSelectedUser(user); setShowEditModal(true); };

  const ROLE_COLORS: Record<string, string> = {
    administrator:    'bg-red-100 text-red-700 border-red-200',
    vice_president:   'bg-purple-100 text-purple-700 border-purple-200',
    property_officer: 'bg-blue-100 text-blue-700 border-blue-200',
    approval_authority: 'bg-amber-100 text-amber-700 border-amber-200',
    purchase_department: 'bg-teal-100 text-teal-700 border-teal-200',
    quality_assurance: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    staff:            'bg-gray-100 text-gray-700 border-gray-200',
  };

  const ROLE_ICONS: Record<string, any> = {
    administrator: ShieldCheckIcon,
    vice_president: AcademicCapIcon,
    property_officer: FolderIcon,
    approval_authority: DocumentCheckIcon,
    purchase_department: ShoppingCartIcon,
    quality_assurance: BeakerIcon,
    staff: UserIcon,
  };

  const roles = ['all', 'administrator', 'vice_president', 'property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff'];

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.workUnit || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'administrator').length,
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    </DashboardLayout>
  );

  if (error && currentUser?.role !== 'administrator') return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">{error}</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">

        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Title with Short Accent Line */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('user_management')}</h1>
                {/* Short Horizontal Accent Line */}
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
                <p className="text-sm text-gray-600">{t('manage_system_users')}</p>
              </div>
              
              {/* Action Button */}
              <button onClick={() => setShowWingSelection(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow">
                {t('create_user')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('total_users'),  value: stats.total,    grad: 'from-slate-500 to-slate-700',   icon: UsersIcon },
            { label: t('active'),       value: stats.active,   grad: 'from-green-400 to-green-600',   icon: CheckCircleIcon },
            { label: t('inactive'),     value: stats.inactive, grad: 'from-gray-400 to-gray-600',     icon: PauseCircleIcon },
            { label: t('admins'),       value: stats.admins,   grad: 'from-red-400 to-red-600',       icon: ShieldCheckIcon },
          ].map(s => {
            const IconComponent = s.icon;
            return (
              <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-xl p-4 text-white shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-80">{s.label}</p>
                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                  </div>
                  <IconComponent className="w-8 h-8 opacity-80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder={t('search_users')}
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-900" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {roles.map(r => {
              const RoleIcon = ROLE_ICONS[r];
              return (
                <option key={r} value={r}>
                  {r === 'all' ? t('all_roles') : r.replace(/_/g, ' ')}
                </option>
              );
            })}
          </select>
        </div>

        {/* User Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UsersIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">{t('no_users_found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(u => {
              const fullName = `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`;
              const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
              const roleColor = ROLE_COLORS[u.role] || ROLE_COLORS.staff;
              const RoleIcon = ROLE_ICONS[u.role] || UserIcon;
              return (
                <div key={u.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${!u.isActive ? 'opacity-60' : ''}`}>
                  {/* Card top accent */}
                  <div className={`h-1.5 ${u.isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-300'}`} />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${u.isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-400'}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{fullName}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{u.email}</p>
                      </div>
                      {/* Status dot */}
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${u.isActive ? 'bg-green-500' : 'bg-gray-400'}`} title={u.isActive ? t('active') : t('inactive')} />
                    </div>

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColor}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {u.role.replace(/_/g, ' ')}
                      </span>
                      {u.workUnit && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-[140px]">
                          <BuildingOfficeIcon className="w-3 h-3" />
                          {u.workUnit}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <button onClick={() => handleEdit(u)} disabled={actionLoading}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium transition-colors inline-flex items-center justify-center gap-1">
                        <PencilIcon className="w-3.5 h-3.5" />
                        {t('edit')}
                      </button>
                      <button onClick={() => handleResetPassword(u)} disabled={actionLoading || !u.isActive}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 font-medium transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1">
                        <KeyIcon className="w-3.5 h-3.5" />
                        {t('reset_pw')}
                      </button>
                      {u.isActive && u.id !== currentUser?.id && (
                        <button onClick={() => handleDeactivate(u)} disabled={actionLoading}
                          className="flex-1 text-xs py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium transition-colors inline-flex items-center justify-center gap-1">
                          <NoSymbolIcon className="w-3.5 h-3.5" />
                          {t('deactivate')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wing Selection Modal */}
        {showWingSelection && (
          <WingSelectionModal
            onSelectWing={(wing) => { setSelectedWing(wing); setShowWingSelection(false); setShowCreateModal(true); }}
            onClose={() => setShowWingSelection(false)}
          />
        )}

        {showCreateModal && selectedWing && (
          <CreateUserModal wing={selectedWing}
            onClose={() => { setShowCreateModal(false); setSelectedWing(null); }}
            onSuccess={() => { setShowCreateModal(false); setSelectedWing(null); fetchUsers(); }}
          />
        )}

        {showEditModal && selectedUser && (
          <EditUserModal user={selectedUser}
            onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
            onSuccess={() => { setShowEditModal(false); setSelectedUser(null); fetchUsers(); }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Create User Modal Component
function CreateUserModal({ wing, onClose, onSuccess }: { wing: 'academic' | 'administrative'; onClose: () => void; onSuccess: () => void }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    countryCode: '+251',
    phoneNumber: '',
    role: 'staff' as UserRole,
    wing,
    college: '',
    school: '',
    department: '',
    administrativeUnit: '',
    workUnit: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCollege, setNewCollege] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newAdminUnit, setNewAdminUnit] = useState('');
  const [showNewCollegeInput, setShowNewCollegeInput] = useState(false);
  const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);
  const [showNewDepartmentInput, setShowNewDepartmentInput] = useState(false);
  const [showNewAdminUnitInput, setShowNewAdminUnitInput] = useState(false);
  
  // Dynamic lists for colleges, schools, departments
  const [colleges, setColleges] = useState<string[]>([...ACADEMIC_COLLEGES]);
  const [schools, setSchools] = useState<Record<string, string[] | null>>(ACADEMIC_SCHOOLS);
  const [departments, setDepartments] = useState<Record<string, string[]>>(ACADEMIC_DEPARTMENTS);
  const [adminUnits, setAdminUnits] = useState<string[]>([...ADMINISTRATIVE_UNITS]);

  // Validation functions
  const validateName = (name: string, fieldName: string, required = true): string => {
    if (required && !name.trim()) {
      return `${fieldName} ${t('required')}`;
    }
    if (name && !/^[a-zA-Z\s]+$/.test(name)) {
      return t(`${fieldName.toLowerCase().replace(' ', '_')}_format`);
    }
    if (name && name.length > 50) {
      return t(`${fieldName.toLowerCase().replace(' ', '_')}_max_length`);
    }
    return '';
  };

  const validateUsername = (username: string): string => {
    if (!username.trim()) {
      return t('username_required');
    }
    if (username.length < 3 || username.length > 50) {
      return t('username_length');
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return t('username_format');
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return t('email_required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('email_invalid');
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return t('password_required');
    }
    if (password.length < 8) {
      return t('password_min_length');
    }
    if (!/[A-Z]/.test(password)) {
      return t('password_uppercase_required');
    }
    if (!/[a-z]/.test(password)) {
      return t('password_lowercase_required');
    }
    if (!/\d/.test(password)) {
      return t('password_number_required');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return t('password_special_required');
    }
    return '';
  };

  const validatePhoneNumber = (phoneNumber: string): string => {
    if (phoneNumber && !/^[79]\d{8}$/.test(phoneNumber)) {
      return t('phone_number_format');
    }
    return '';
  };

  // Real-time validation
  const handleFieldChange = (field: string, value: string) => {
    console.log('handleFieldChange called:', field, value);
    
    setFormData(prevFormData => {
      console.log('Previous formData:', prevFormData);
      const newFormData = { ...prevFormData, [field]: value };
      console.log('New formData:', newFormData);
      return newFormData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: '' }));
    }

    // Real-time validation
    let error = '';
    switch (field) {
      case 'firstName':
        error = validateName(value, 'First name', true);
        break;
      case 'middleName':
        error = validateName(value, 'Middle name', false);
        break;
      case 'lastName':
        error = validateName(value, 'Last name', true);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'college':
      case 'school':
      case 'department':
      case 'administrativeUnit':
        // These fields don't need real-time validation, just update
        break;
    }
    
    if (error) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    newErrors.firstName = validateName(formData.firstName, 'First name', true);
    newErrors.middleName = validateName(formData.middleName, 'Middle name', false);
    newErrors.lastName = validateName(formData.lastName, 'Last name', true);
    newErrors.username = validateUsername(formData.username);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);

    // Wing-specific validation
    if (wing === 'academic') {
      if (!formData.college) {
        newErrors.college = t('college_required');
      }
      // School is optional
      if (!formData.department) {
        newErrors.department = t('department_required');
      }
    } else if (wing === 'administrative') {
      if (!formData.administrativeUnit) {
        newErrors.administrativeUnit = t('administrative_unit_required');
      }
    }

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Combine country code and phone number
      const fullPhoneNumber = formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : '';
      const { countryCode, ...dataToSend } = formData;
      const submitData = { ...dataToSend, phoneNumber: fullPhoneNumber };
      
      await api.createUser(submitData);
      alert(t('user_created_success'));
      onSuccess();
    } catch (err: any) {
      // Handle server validation errors
      if (err.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          serverErrors[error.field] = error.message;
        });
        setErrors(serverErrors);
      } else {
        alert(`${t('failed_to_create_user')}: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Back"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold">{t('create_new_user_title')}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('username')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => handleFieldChange('username', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john.doe"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@woldia.edu.et"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('first_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('middle_name')}
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleFieldChange('middleName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.middleName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Michael"
                />
                {errors.middleName && (
                  <p className="text-red-500 text-xs mt-1">{errors.middleName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('last_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone_number')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="+251">🇪🇹 +251</option>
                </select>
                <div className="col-span-2">
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        handleFieldChange('phoneNumber', value);
                      }
                    }}
                    pattern="[79]\d{8}"
                    className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9XXXXXXXX or 7XXXXXXXX"
                    title={t('phone_number_helper')}
                  />
                </div>
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t('phone_number_helper')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')} *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('min_8_characters')}
              />
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">{t('password_requirements')}</p>
              )}
            </div>

            {/* Wing-Specific Fields */}
            {wing === 'academic' && (
              <AcademicWingForm
                formData={formData}
                errors={errors}
                onFormDataChange={handleFieldChange}
                colleges={colleges}
                schools={schools}
                departments={departments}
                onAddCollege={(college) => {
                  setColleges([...colleges, college]);
                  handleFieldChange('college', college);
                }}
                onAddSchool={(school) => {
                  if (formData.college) {
                    const collegeSchools = schools[formData.college] || [];
                    setSchools({
                      ...schools,
                      [formData.college]: [...(collegeSchools as string[]), school]
                    });
                    handleFieldChange('school', school);
                  }
                }}
                onAddDepartment={(department) => {
                  const key = formData.school || formData.college;
                  if (key) {
                    const depts = departments[key] || [];
                    setDepartments({
                      ...departments,
                      [key]: [...depts, department]
                    });
                    handleFieldChange('department', department);
                  }
                }}
              />
            )}

            {wing === 'administrative' && (
              <AdministrativeWingForm
                formData={formData}
                errors={errors}
                onFormDataChange={handleFieldChange}
                adminUnits={adminUnits}
                onAddUnit={(unit) => {
                  setAdminUnits([...adminUnits, unit]);
                  handleFieldChange('administrativeUnit', unit);
                }}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('role_label')} *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="property_officer">Property Officer</option>
                  <option value="vice_president">Vice President</option>
                  <option value="approval_authority">Approval Authority</option>
                  <option value="purchase_department">Purchase Department</option>
                  <option value="quality_assurance">Quality Assurance</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                {t('active_user_can_login')}
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? t('creating') : t('create_user_button')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    middleName: user.middleName || '',
    lastName: user.lastName,
    countryCode: user.phoneNumber?.startsWith('+251') ? '+251' : '+251',
    phoneNumber: user.phoneNumber?.startsWith('+251') ? user.phoneNumber.substring(4) : '',
    email: user.email,
    role: user.role,
    workUnit: user.workUnit || '',
    isActive: user.isActive,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine country code and phone number
      const fullPhoneNumber = formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : '';
      const { countryCode, ...dataToSend } = formData;
      const submitData = { ...dataToSend, phoneNumber: fullPhoneNumber };
      
      await api.updateUser(user.id, submitData);
      alert(t('user_updated_success'));
      onSuccess();
    } catch (err: any) {
      alert(`${t('failed')}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Back"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold">{t('edit_user_title')}: {user.username}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('first_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('middle_name')}
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('last_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone_number')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="+251">🇪🇹 +251</option>
                </select>
                <div className="col-span-2">
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setFormData({ ...formData, phoneNumber: value });
                      }
                    }}
                    pattern="[79]\d{8}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9XXXXXXXX or 7XXXXXXXX"
                    title={t('phone_number_helper')}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('phone_number_helper')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('role_label')} *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="property_officer">Property Officer</option>
                  <option value="vice_president">Vice President</option>
                  <option value="approval_authority">Approval Authority</option>
                  <option value="purchase_department">Purchase Department</option>
                  <option value="quality_assurance">Quality Assurance</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('work_unit')}
                </label>
                <input
                  type="text"
                  value={formData.workUnit}
                  onChange={(e) => setFormData({ ...formData, workUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('work_unit_placeholder')}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                {t('active_user_can_login')}
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? t('updating') : t('update_user_button')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
