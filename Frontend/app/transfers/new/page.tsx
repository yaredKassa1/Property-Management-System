'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { Asset, User } from '@/lib/types';

export default function NewTransferPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '', fromUserId: '', toUserId: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: '', notes: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const [assetsData, usersData]: any[] = await Promise.all([
        api.getAssets({ status: 'assigned', assignedTo: currentUser?.id || '' }),
        api.getUsers(),
      ]);
      setAssets(Array.isArray(assetsData) ? assetsData : assetsData?.data || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData?.data || []);
      if (currentUser) setFormData(p => ({ ...p, fromUserId: currentUser.id }));
    } catch { alert('Failed to load data. Please refresh.'); }
    finally { setLoading(false); }
  };

  const handleAssetChange = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId) || null;
    setSelectedAsset(asset);
    const cu = localStorage.getItem('user');
    const currentUser = cu ? JSON.parse(cu) : null;
    setFormData(p => ({ ...p, assetId, fromUserId: currentUser?.id || p.fromUserId }));
  };

  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.toLowerCase();
    return users.filter(u =>
      u.id !== formData.fromUserId && (
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        (u.workUnit || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q)
      )
    );
  }, [users, recipientSearch, formData.fromUserId]);

  const selectedRecipient = users.find(u => u.id === formData.toUserId);
  const currentHolder = users.find(u => u.id === formData.fromUserId);

  const handleSelectRecipient = (user: User) => {
    setFormData(p => ({ ...p, toUserId: user.id }));
    setRecipientSearch(`${user.firstName} ${user.lastName}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.toUserId) { alert('Please fill all required fields'); return; }
    if (formData.fromUserId === formData.toUserId) { alert('Cannot transfer to yourself'); return; }
    if (formData.reason.trim().length < 10) { alert('Reason must be at least 10 characters'); return; }
    setSubmitting(true);
    try {
      const toUser = users.find(u => u.id === formData.toUserId);
      const fromUser = users.find(u => u.id === formData.fromUserId);
      await api.createTransfer({
        assetId: formData.assetId, fromUserId: formData.fromUserId, toUserId: formData.toUserId,
        fromWorkUnit: fromUser?.workUnit || '', toWorkUnit: toUser?.workUnit || '',
        fromLocation: selectedAsset?.location || '', toLocation: toUser?.workUnit || '',
        reason: formData.reason.trim(), notes: formData.notes.trim(),
        transferorSignature: 'Digital Signature',
      });
      alert('Transfer request created successfully!');
      window.location.href = '/transfers';
    } catch (err: any) { alert(err?.message || 'Failed to create transfer.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Asset Transfer</h1>
          <p className="text-gray-600">Transfer an asset to another staff member</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.assetId} onChange={e => handleAssetChange(e.target.value)} required>
                  <option value="">Choose an asset...</option>
                  {assets.length === 0
                    ? <option disabled>No assigned assets found</option>
                    : assets.map(a => <option key={a.id} value={a.id}>{(a as any).assetId || a.id}  {a.name}</option>)
                  }
                </select>
                {selectedAsset && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Asset ID:</span> {(selectedAsset as any).assetId}</div>
                    <div><span className="font-medium">Category:</span> {selectedAsset.category}</div>
                    <div><span className="font-medium">Status:</span> {selectedAsset.status}</div>
                    <div><span className="font-medium">Location:</span> {selectedAsset.location || 'N/A'}</div>
                  </div>
                )}
              </div>
              <div className="border-t" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Staff (You)</label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  {currentHolder ? (
                    <>
                      <p><span className="font-medium">Name:</span> {currentHolder.firstName} {currentHolder.middleName} {currentHolder.lastName}</p>
                      <p><span className="font-medium">Department:</span> {currentHolder.workUnit || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {currentHolder.email}</p>
                    </>
                  ) : <p className="text-gray-500">Loading...</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Staff (Recipient) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input type="text" placeholder="Search by name, department, or username..."
                    value={recipientSearch}
                    onChange={e => { setRecipientSearch(e.target.value); setShowDropdown(true); if (!e.target.value) setFormData(p => ({ ...p, toUserId: '' })); }}
                    onFocus={() => setShowDropdown(true)} />
                  {showDropdown && recipientSearch && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {filteredRecipients.length === 0
                        ? <div className="px-4 py-3 text-sm text-gray-500">No staff found</div>
                        : filteredRecipients.map(u => (
                            <button key={u.id} type="button"
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                              onClick={() => handleSelectRecipient(u)}>
                              <span className="font-medium">{u.firstName} {u.lastName}</span>
                              <span className="text-gray-500 ml-2"> {u.workUnit || 'No department'}</span>
                            </button>
                          ))
                      }
                    </div>
                  )}
                </div>
                {selectedRecipient && formData.toUserId && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <p><span className="font-medium">Name:</span> {selectedRecipient.firstName} {selectedRecipient.lastName}</p>
                    <p><span className="font-medium">Department:</span> {selectedRecipient.workUnit || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedRecipient.email}</p>
                  </div>
                )}
              </div>
              <div className="border-t" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Date <span className="text-red-500">*</span></label>
                <Input type="date" value={formData.transferDate} onChange={e => setFormData(p => ({ ...p, transferDate: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3} value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                  placeholder="e.g., Staff relocation, Department change... (min 10 characters)" required minLength={10} />
                <p className={`text-xs mt-1 ${formData.reason.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>{formData.reason.length}/10 minimum</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any additional information..." />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => window.location.href = '/transfers'} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting || !formData.assetId || !formData.toUserId || formData.reason.trim().length < 10}>
                  {submitting ? 'Creating...' : 'Create Transfer Request'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
