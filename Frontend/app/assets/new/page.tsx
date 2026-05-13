'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { AssetCategory, AssetCondition } from '@/lib/types';

const ITEM_CATEGORIES = [
  'Furniture and Fixtures',
  'Electronics and IT Equipment',
  'Office Equipment',
  'Laboratory Equipment',
  'Medical Equipment',
  'Vehicles and Transport',
  'Books and Library Materials',
  'Sports and Recreation',
  'Kitchen and Catering',
  'Cleaning and Sanitation',
  'Construction and Infrastructure',
  'Other',
];

const KNOWN_DONORS = [
  'Wollo University',
  'Addis Ababa University',
  'Government of Ethiopia',
  'USAID',
  'World Bank',
  'UNICEF',
  'Other',
];

export default function NewAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagPreview, setTagPreview] = useState('WDUXXXXX');
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'fixed' as AssetCategory,
    serialNumber: '',
    value: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    condition: 'excellent' as AssetCondition,
    description: '',
    warrantyExpiry: '',
    itemCategory: '',
    sourceType: 'purchased',
    donorName: '',
    customDonor: '',
    quantity: '1',
  });

  // Update tag preview when sourceType or donorName changes
  useEffect(() => {
    const donor = formData.donorName === 'Other' ? formData.customDonor : formData.donorName;
    const name = donor || '';
    const initials = name.trim().split(/\s+/).map((w: string) => w[0] || '').join('').toUpperCase();
    if ((formData.sourceType === 'donation' || formData.sourceType === 'transferred') && initials) {
      setTagPreview(`${initials}XXXXX`);
    } else {
      setTagPreview('WDUXXXXX');
    }
  }, [formData.sourceType, formData.donorName, formData.customDonor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const donorName = formData.donorName === 'Other' ? formData.customDonor : formData.donorName;
      const result: any = await api.createAsset({
        name: formData.name,
        category: formData.category,
        serialNumber: formData.serialNumber || undefined,
        value: parseFloat(formData.value),
        purchaseDate: formData.purchaseDate,
        condition: formData.condition,
        description: formData.description || undefined,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        itemCategory: formData.itemCategory || undefined,
        sourceType: formData.sourceType,
        donorName: donorName || undefined,
        quantity: parseInt(formData.quantity) || 1,
      });
      const tag = result?.tagNumber || result?.assetId || 'generated';
      setToast(`✅ Asset registered! Tag number: ${tag}`);
      setTimeout(() => {
        router.push('/assets');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to register asset');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: string) => setFormData(p => ({ ...p, [field]: value }));

  return (
    <DashboardLayout>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down">
          <span className="text-lg">🏷️</span>
          <div>
            <p className="font-semibold text-sm">Asset Registered Successfully!</p>
            <p className="text-green-100 text-xs mt-0.5">Tag No. generated: <span className="font-mono font-bold text-white">{toast.split(': ')[1]}</span></p>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Asset</h1>
          <p className="text-gray-600">Add a new asset to the inventory</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Asset Name *" required placeholder="e.g., Expert Table"
                value={formData.name} onChange={e => set('name', e.target.value)} />

              {/* Item Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Category *</label>
                <select required value={formData.itemCategory} onChange={e => set('itemCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                  <option value="">-- Select category --</option>
                  {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <Select label="Asset Type *" required
                options={[{ value: 'fixed', label: 'Fixed Asset' }, { value: 'fixed_consumable', label: 'Fixed-Consumable' }]}
                value={formData.category}
                onChange={e => set('category', e.target.value)} />

              {/* Source Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Type *</label>
                <select required value={formData.sourceType} onChange={e => set('sourceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                  <option value="purchased">Purchased</option>
                  <option value="donation">Donation</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>

              {/* Donor / Supplier */}
              {formData.sourceType === 'donation' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor *</label>
                  <select value={formData.donorName} onChange={e => set('donorName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                    <option value="">-- Select donor --</option>
                    {KNOWN_DONORS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {formData.donorName === 'Other' && (
                    <Input className="mt-2" placeholder="Enter donor name"
                      value={formData.customDonor} onChange={e => set('customDonor', e.target.value)} />
                  )}
                </div>
              ) : (
                <Input label={formData.sourceType === 'purchased' ? 'Supplier / Vendor' : 'Transferred From'}
                  placeholder={formData.sourceType === 'purchased' ? 'e.g., ABC Supplies Ltd' : 'e.g., Ministry of Education'}
                  value={formData.donorName} onChange={e => set('donorName', e.target.value)} />
              )}

              <Input label="Quantity *" type="number" required min="1"
                value={formData.quantity} onChange={e => set('quantity', e.target.value)} />

              <Input label="Serial Number" placeholder="Optional"
                value={formData.serialNumber} onChange={e => set('serialNumber', e.target.value)} />

              <Input label="Value (ETB) *" type="number" step="0.01" required
                value={formData.value} onChange={e => set('value', e.target.value)} />

              <Input label="Purchase / Acquisition Date *" type="date" required
                value={formData.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />

              <Select label="Condition *" required
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' },
                ]}
                value={formData.condition}
                onChange={e => set('condition', e.target.value)} />

              <Input label="Warranty Expiry" type="date"
                value={formData.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                rows={3} value={formData.description} onChange={e => set('description', e.target.value)}
                placeholder="e.g., Expert table for conference room use" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Asset'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
