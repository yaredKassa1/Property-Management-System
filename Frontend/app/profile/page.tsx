'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { useLanguage } from '@/lib/contexts';

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  wing: string;
  college?: string;
  school?: string;
  department?: string;
  administrativeUnit?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedData, setEditedData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Password change state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const { t } = useLanguage();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    try {
      setLoading(true);
      const currentUser = getUser();
      if (!currentUser?.id) {
        setErrorMessage(t('user_not_authenticated'));
        return;
      }

      // Use the authenticated user data from localStorage instead of API call
      const profileData: UserProfile = {
        id: currentUser.id,
        username: currentUser.username || '',
        firstName: currentUser.firstName || '',
        middleName: currentUser.middleName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        role: currentUser.role || '',
        wing: (currentUser as any).wing || '',
        college: (currentUser as any).college || '',
        school: (currentUser as any).school || '',
        department: (currentUser as any).department || '',
        administrativeUnit: (currentUser as any).administrativeUnit || '',
      };

      setProfile(profileData);
      setEditedData({});
      setValidationErrors({});
    } catch (error: any) {
      setErrorMessage(error.message || t('failed_load_profile'));
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) return null;
    const pattern = /^\+251[79]\d{8}$/;
    if (!pattern.test(phone)) {
      return t('invalid_phone');
    }
    return null;
  };

  const validateNameField = (name: string, fieldName: string): string | null => {
    if (!name && (fieldName === 'firstName' || fieldName === 'lastName')) {
      return `${t(fieldName)} ${t('required_field')}`;
    }
    if (name && !/^[a-zA-Z\s]*$/.test(name)) {
      return t('name_letters_only');
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return `${t('email')} ${t('required_field')}`;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
      return t('invalid_email');
    }
    return null;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const firstName = editedData.firstName ?? profile?.firstName ?? '';
    const lastName = editedData.lastName ?? profile?.lastName ?? '';
    const middleName = editedData.middleName ?? profile?.middleName ?? '';
    const email = editedData.email ?? profile?.email ?? '';
    const phoneNumber = editedData.phoneNumber ?? profile?.phoneNumber ?? '';

    const firstNameError = validateNameField(firstName, 'firstName');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateNameField(lastName, 'lastName');
    if (lastNameError) errors.lastName = lastNameError;

    const middleNameError = validateNameField(middleName, 'middleName');
    if (middleNameError) errors.middleName = middleNameError;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = async () => {
    setPwError('');
    setPwSuccess('');
    if (!pwData.currentPassword || !pwData.newPassword || !pwData.confirmPassword) {
      setPwError('All password fields are required');
      return;
    }
    if (pwData.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await api.changePassword(pwData.currentPassword, pwData.newPassword);
      setPwSuccess('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const currentUser = getUser();
      if (!currentUser?.id) {
        setErrorMessage(t('user_not_authenticated'));
        return;
      }

      const updateData = {
        firstName: editedData.firstName ?? profile?.firstName,
        middleName: editedData.middleName ?? profile?.middleName,
        lastName: editedData.lastName ?? profile?.lastName,
        email: editedData.email ?? profile?.email,
        phoneNumber: editedData.phoneNumber ?? profile?.phoneNumber,
      };

      await api.updateUser(currentUser.id, updateData);
      setSuccessMessage(t('profile_updated'));
      setEditedData({});

      if (profile) {
        setProfile({
          ...profile,
          firstName: updateData.firstName || profile.firstName,
          middleName: updateData.middleName || profile.middleName,
          lastName: updateData.lastName || profile.lastName,
          email: updateData.email || profile.email,
          phoneNumber: updateData.phoneNumber || profile.phoneNumber,
        });
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || t('profile_update_failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500">{t('loading_profile')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <p className="text-red-600">{t('failed_load_profile')}</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 32px', background: '#f0f4fb', minHeight: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '8px' }}>
            {t('account_settings')}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b', margin: '0 0 6px 0' }}>
            {t('my_profile')}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#7a90b8', margin: 0 }}>
            {t('manage_personal_info')}
          </p>
        </div>

        {successMessage && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
          }}>
            ✓ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#fdf2f2',
            border: '1px solid #f0b8b8',
            color: '#c0392b',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
          }}>
            ✕ {errorMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>
                {t('personal_information')}
              </h2>
              <p style={{ fontSize: '12px', color: '#7a90b8', margin: '4px 0 0 0' }}>
                {t('update_personal_details')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('first_name')} *
                </label>
                <Input
                  type="text"
                  value={editedData.firstName ?? profile.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  placeholder={t('enter_first_name')}
                />
                {validationErrors.firstName && (
                  <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('middle_name')}
                </label>
                <Input
                  type="text"
                  value={editedData.middleName ?? profile.middleName ?? ''}
                  onChange={(e) => handleFieldChange('middleName', e.target.value)}
                  placeholder={t('enter_middle_name')}
                />
                {validationErrors.middleName && (
                  <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>
                    {validationErrors.middleName}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('last_name')} *
                </label>
                <Input
                  type="text"
                  value={editedData.lastName ?? profile.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  placeholder={t('enter_last_name')}
                />
                {validationErrors.lastName && (
                  <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>
                    {validationErrors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('email')} *
                </label>
                <Input
                  type="email"
                  value={editedData.email ?? profile.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder={t('enter_email')}
                />
                {validationErrors.email && (
                  <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('phone_number')}
                </label>
                <Input
                  type="tel"
                  value={editedData.phoneNumber ?? profile.phoneNumber ?? ''}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                  placeholder={t('phone_format')}
                />
                {validationErrors.phoneNumber && (
                  <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>

              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? t('saving') : t('save_changes')}
              </Button>
            </div>
          </Card>

          <Card>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>
                {t('account_information')}
              </h2>
              <p style={{ fontSize: '12px', color: '#7a90b8', margin: '4px 0 0 0' }}>
                {t('read_only_details')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('username')}
                </label>
                <div style={{
                  padding: '9px 12px',
                  fontSize: '13.5px',
                  border: '1px solid #dce6f5',
                  borderRadius: '6px',
                  color: '#1a3a6b',
                  background: '#f8faff',
                }}>
                  {profile.username}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('role')}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge variant={profile.role === 'administrator' ? 'danger' : 'default'}>
                    {profile.role.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {t('wing')}
                </label>
                <div style={{
                  padding: '9px 12px',
                  fontSize: '13.5px',
                  border: '1px solid #dce6f5',
                  borderRadius: '6px',
                  color: '#1a3a6b',
                  background: '#f8faff',
                }}>
                  {profile.wing ? profile.wing.charAt(0).toUpperCase() + profile.wing.slice(1) : '—'}
                </div>
              </div>

              {profile.wing === 'academic' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {t('college')}
                  </label>
                  <div style={{
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    border: '1px solid #dce6f5',
                    borderRadius: '6px',
                    color: '#1a3a6b',
                    background: '#f8faff',
                  }}>
                    {profile.college || '—'}
                  </div>
                </div>
              )}

              {profile.wing === 'academic' && profile.school && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {t('school')}
                  </label>
                  <div style={{
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    border: '1px solid #dce6f5',
                    borderRadius: '6px',
                    color: '#1a3a6b',
                    background: '#f8faff',
                  }}>
                    {profile.school}
                  </div>
                </div>
              )}

              {profile.wing === 'academic' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {t('department')}
                  </label>
                  <div style={{
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    border: '1px solid #dce6f5',
                    borderRadius: '6px',
                    color: '#1a3a6b',
                    background: '#f8faff',
                  }}>
                    {profile.department || '—'}
                  </div>
                </div>
              )}

              {profile.wing === 'administrative' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {t('administrative_unit')}
                  </label>
                  <div style={{
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    border: '1px solid #dce6f5',
                    borderRadius: '6px',
                    color: '#1a3a6b',
                    background: '#f8faff',
                  }}>
                    {profile.administrativeUnit || '—'}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Password Change Card */}
        <div style={{ marginTop: '24px' }}>
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>Change Password</h2>
              <p style={{ fontSize: '12px', color: '#7a90b8', margin: '4px 0 0 0' }}>Update your account password</p>
            </div>

            {pwSuccess && (
              <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                ✓ {pwSuccess}
              </div>
            )}
            {pwError && (
              <div style={{ background: '#fdf2f2', border: '1px solid #f0b8b8', color: '#c0392b', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                ✕ {pwError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Current Password *
                </label>
                <Input
                  type="password"
                  value={pwData.currentPassword}
                  onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  New Password *
                </label>
                <Input
                  type="password"
                  value={pwData.newPassword}
                  onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Confirm New Password *
                </label>
                <Input
                  type="password"
                  value={pwData.confirmPassword}
                  onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Button variant="primary" onClick={handlePasswordChange} disabled={pwSaving}>
                {pwSaving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
