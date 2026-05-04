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

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    
    // Only administrators can access this page
    if (user?.role !== 'administrator') {
      setError('Access denied. Administrator privileges required.');
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
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Deactivate user "${user.username}"? They will no longer be able to log in.`)) return;
    
    setActionLoading(true);
    try {
      await api.deleteUser(user.id, false);
      alert('User deactivated successfully!');
      fetchUsers();
    } catch (err: any) {
      alert('Failed to deactivate user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = prompt(`Enter new password for user "${user.username}":`);
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    setActionLoading(true);
    try {
      await api.resetUserPassword(user.id, newPassword);
      alert('Password reset successfully!');
    } catch (err: any) {
      alert('Failed to reset password: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: UserRole): 'error' | 'warning' | 'info' | 'default' => {
    const colors: Record<UserRole, 'error' | 'warning' | 'info' | 'default'> = {
      administrator: 'error',
      vice_president: 'warning',
      property_officer: 'info',
      approval_authority: 'info',
      purchase_department: 'default',
      quality_assurance: 'default',
      staff: 'default',
    };
    return colors[role] || 'default';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && currentUser?.role !== 'administrator') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-1">Manage system users and access control</p>
          </div>
          <Button onClick={() => setShowWingSelection(true)}>
            Create User
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const fullName = `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`;
                    return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{fullName}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.workUnit || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? 'success' : 'default'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(user as any).lastLogin ? new Date((user as any).lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          disabled={actionLoading || !user.isActive}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        >
                          Reset Password
                        </button>
                        {user.isActive && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeactivate(user)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Wing Selection Modal */}
        {showWingSelection && (
          <WingSelectionModal
            onSelectWing={(wing) => {
              setSelectedWing(wing);
              setShowWingSelection(false);
              setShowCreateModal(true);
            }}
            onClose={() => setShowWingSelection(false)}
          />
        )}

        {/* Create User Modal */}
        {showCreateModal && selectedWing && (
          <CreateUserModal
            wing={selectedWing}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedWing(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setSelectedWing(null);
              fetchUsers();
            }}
          />
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Create User Modal Component
function CreateUserModal({ wing, onClose, onSuccess }: { wing: 'academic' | 'administrative'; onClose: () => void; onSuccess: () => void }) {
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
      return `${fieldName} is required`;
    }
    if (name && !/^[a-zA-Z\s]+$/.test(name)) {
      return `${fieldName} can only contain letters and spaces`;
    }
    if (name && name.length > 50) {
      return `${fieldName} must be less than 50 characters`;
    }
    return '';
  };

  const validateUsername = (username: string): string => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.length < 3 || username.length > 50) {
      return 'Username must be between 3 and 50 characters';
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, dots, underscores, and hyphens';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validatePhoneNumber = (phoneNumber: string): string => {
    if (phoneNumber && !/^[79]\d{8}$/.test(phoneNumber)) {
      return 'Phone number must be 9 digits starting with 7 or 9';
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
        newErrors.college = 'College is required';
      }
      // School is optional
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
    } else if (wing === 'administrative') {
      if (!formData.administrativeUnit) {
        newErrors.administrativeUnit = 'Administrative unit is required';
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
      alert('User created successfully!');
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
        alert('Failed to create user: ' + err.message);
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
            <h2 className="text-2xl font-bold">Create New User</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
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
                  Email *
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
                  First Name *
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
                  Middle Name
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
                  Last Name *
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
                Phone Number
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
                    title="Enter 9 digits starting with 9 (Ethio Telecom) or 7 (Safaricom)"
                  />
                </div>
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                9XXXXXXXX for Ethio Telecom or 7XXXXXXXX for Safaricom
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Min 6 characters"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
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
                  Role *
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
                Active (user can log in)
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
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
      alert('User updated successfully!');
      onSuccess();
    } catch (err: any) {
      alert('Failed to update user: ' + err.message);
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
            <h2 className="text-2xl font-bold">Edit User: {user.username}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
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
                  Middle Name
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
                  Last Name *
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
                Phone Number
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
                    title="Enter 9 digits starting with 9 (Ethio Telecom) or 7 (Safaricom)"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                9XXXXXXXX for Ethio Telecom or 7XXXXXXXX for Safaricom
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
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
                  Role *
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
                  Work Unit
                </label>
                <input
                  type="text"
                  value={formData.workUnit}
                  onChange={(e) => setFormData({ ...formData, workUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., IT Department, College of Engineering"
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
                Active (user can log in)
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
