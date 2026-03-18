'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Asset, User } from '@/lib/types';

interface TransferFormData {
  assetId: string;
  fromUserId: string;
  toUserId: string;
  transferDate: string;
  reason: string;
  notes: string;
}

export default function NewTransferPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<TransferFormData>({
    assetId: '',
    fromUserId: '',
    toUserId: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      // Fetch only assets assigned to the current user
      const [assetsData, usersData] = await Promise.all([
        api.getAssets({ 
          status: 'assigned',
          assignedTo: currentUser?.id || '' 
        }) as Promise<any>,
        api.getUsers() as Promise<any>
      ]);
      
      const fetchedAssets = Array.isArray(assetsData) ? assetsData : assetsData.data || assetsData.assets || [];
      const fetchedUsers = Array.isArray(usersData) ? usersData : usersData.data || usersData.users || [];
      
      setAssets(fetchedAssets);
      setUsers(fetchedUsers);
      
      // Auto-set fromUserId to current user
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          fromUserId: currentUser.id
        }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load assets and staff. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetChange = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    setSelectedAsset(asset || null);
    
    // Get current user
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    setFormData({
      ...formData,
      assetId,
      // Keep fromUserId as current user (don't change it)
      fromUserId: currentUser?.id || asset?.assignedTo || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.fromUserId || !formData.toUserId) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.fromUserId === formData.toUserId) {
      alert('Cannot transfer asset to the same staff member');
      return;
    }

    if (formData.reason.trim().length < 10) {
      alert('Reason for transfer must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const fromUser = users.find(u => u.id === formData.fromUserId);
      const toUser = users.find(u => u.id === formData.toUserId);

      await api.createTransfer({
        assetId: formData.assetId,
        fromUserId: formData.fromUserId,
        toUserId: formData.toUserId,
        fromWorkUnit: fromUser?.workUnit || '',
        toWorkUnit: toUser?.workUnit || '',
        fromLocation: selectedAsset?.location || '',
        toLocation: toUser?.workUnit || '',
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
        transferorSignature: 'Digital Signature' // Transferor signs when initiating
      });

      alert('Transfer request created successfully!');
      window.location.href = '/transfers';
    } catch (error: any) {
      console.error('Failed to create transfer:', error);
      const errorMessage = error?.message || 'Failed to create transfer request. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Get staff options
  const staffOptions = users.map(user => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName || ''} - ${user.workUnit || 'N/A'}`
  }));

  // Get asset options (only assigned assets can be transferred)
  const assetOptions = assets.map(asset => ({
    value: asset.id,
    label: `${asset.assetTag} - ${asset.name}`
  }));

  // Get current holder info
  const currentHolder = users.find(u => u.id === formData.fromUserId);
  const newHolder = users.find(u => u.id === formData.toUserId);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Asset Transfer</h1>
          <p className="text-gray-600">Transfer an asset from one staff member to another</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Asset <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.assetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  required
                >
                  <option value="">Choose an asset to transfer...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetTag} - {asset.name}
                    </option>
                  ))}
                </select>
                {selectedAsset && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Asset Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Tag:</span> {selectedAsset.assetTag}</div>
                      <div><span className="font-medium">Category:</span> {selectedAsset.category}</div>
                      <div><span className="font-medium">Status:</span> {selectedAsset.status}</div>
                      <div><span className="font-medium">Location:</span> {selectedAsset.location || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6"></div>

              {/* From Staff (Current Holder) - Auto-set to logged in user */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Staff (Current Holder) <span className="text-red-500">*</span>
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  {currentHolder ? (
                    <>
                      <p className="text-sm"><span className="font-medium">Name:</span> {currentHolder.firstName} {currentHolder.middleName} {currentHolder.lastName}</p>
                      <p className="text-sm"><span className="font-medium">Work Unit:</span> {currentHolder.workUnit || 'N/A'}</p>
                      <p className="text-sm"><span className="font-medium">Email:</span> {currentHolder.email}</p>
                      <p className="text-xs text-blue-600 mt-2">✓ Automatically set to you (logged in user)</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Loading your information...</p>
                  )}
                </div>
                <input type="hidden" value={formData.fromUserId} required />
              </div>

              {/* To Staff (New Holder) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Staff (New Holder) <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.toUserId}
                  onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                  options={staffOptions}
                  placeholder="Select new staff holder..."
                  required
                />
                {newHolder && (
                  <div className="mt-2 p-3 bg-green-50 rounded">
                    <p className="text-sm"><span className="font-medium">Name:</span> {newHolder.firstName} {newHolder.lastName}</p>
                    <p className="text-sm"><span className="font-medium">Work Unit:</span> {newHolder.workUnit || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {newHolder.email}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6"></div>

              {/* Transfer Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Transfer <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Staff relocation, Department change, etc. (minimum 10 characters)"
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.reason.length}/10 characters minimum
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information about this transfer..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => window.location.href = '/transfers'}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.assetId || !formData.toUserId || formData.reason.trim().length < 10}
                >
                  {submitting ? 'Creating...' : 'Create Transfer Request'}
                </Button>
                {/* Debug info - remove after testing */}
                <div className="text-xs text-gray-500 mt-2">
                  Debug: Asset={formData.assetId ? '✓' : '✗'} | 
                  To={formData.toUserId ? '✓' : '✗'} | 
                  Reason={formData.reason.length >= 10 ? '✓' : formData.reason.length + '/10'}
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
