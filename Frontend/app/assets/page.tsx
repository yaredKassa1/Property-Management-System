'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Asset } from '@/lib/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import { useLanguage } from '@/lib/contexts';
import {
  CubeIcon,
  CheckCircleIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { t } = useLanguage();
  const user = getUser();
  const isPropertyOfficer = user?.role === 'property_officer' || user?.role === 'administrator';

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      // Backend already filters: staff only see their assigned assets
      const data = await api.getAssets() as any;
      const list: Asset[] = Array.isArray(data) ? data : data?.data || [];
      setAssets(list);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      asset.status === statusFilter;
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      asset.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const totalAssets = filteredAssets.length;
  const availableAssets = filteredAssets.filter(a => a.status === 'available').length;
  const assignedAssets = filteredAssets.filter(a => a.status === 'assigned').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Title with Short Accent Line */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('assets')}</h1>
                {/* Short Horizontal Accent Line */}
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
                <p className="text-sm text-gray-600">
                  {isPropertyOfficer ? t('manage_university_assets') : t('your_assigned_assets')}
                </p>
              </div>
              
              {/* Action Button */}
              {isPropertyOfficer && (
                <Button onClick={() => router.push('/assets/new')}>
                  {t('register_new_asset_btn')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('total_assets')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalAssets}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('available_assets')}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{availableAssets}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('assigned_assets')}</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{assignedAssets}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">{t('filter')} {t('assets')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search_assets_placeholder') || 'Search by name, ID, or serial number...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9FE8] focus:border-[#1E9FE8] bg-white text-gray-900"
                />
              </div>
              
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9FE8] focus:border-[#1E9FE8] bg-white text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('all_status')}</option>
                <option value="available">{t('available')}</option>
                <option value="assigned">{t('assigned')}</option>
                <option value="under_maintenance">{t('under_maintenance')}</option>
                <option value="disposed">{t('disposed')}</option>
              </select>

              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9FE8] focus:border-[#1E9FE8] bg-white text-gray-900"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">{t('all_categories')}</option>
                <option value="fixed">{t('fixed_assets')}</option>
                <option value="consumable">{t('fixed_consumable')}</option>
              </select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                {t('clear_filters')}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E9FE8] mx-auto" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableHead>{t('tag_no')}</TableHead>
                <TableHead>{t('asset_id')}</TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('item_category')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('qty')}</TableHead>
                <TableHead>{t('value')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-xs">{(asset as any).tagNumber || '—'}</TableCell>
                    <TableCell className="font-medium">{asset.assetId}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{(asset as any).itemCategory || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={asset.category === 'fixed' ? 'info' : 'default'}>
                        {asset.category === 'fixed' ? t('fixed_assets') : t('fixed_consumable')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{(asset as any).quantity ?? 1}</TableCell>
                    <TableCell>{formatCurrency(asset.value)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedAsset(asset)}>
                        {t('view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <CubeIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? t('no_assets_match_filters') 
                    : t('no_assets_registered')}
                </p>
                {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                  <p className="text-gray-400 text-sm">
                    {t('try_adjusting_filters')}
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
        </Card>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
    </DashboardLayout>
  );
}

// Asset Detail Modal Component
function AssetDetailModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1578B8] to-[#1E9FE8] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {asset.name}
                </h2>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {asset.assetId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    asset.status === 'available' ? 'bg-green-500/30' :
                    asset.status === 'assigned' ? 'bg-blue-500/30' :
                    asset.status === 'under_maintenance' ? 'bg-yellow-500/30' :
                    'bg-gray-500/30'
                  }`}>
                    {asset.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              {(asset as any).tagNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tag Number</label>
                  <p className="mt-1 text-gray-900 font-mono">{(asset as any).tagNumber}</p>
                </div>
              )}
            
              <div>
                <label className="text-sm font-medium text-gray-500">Asset ID</label>
                <p className="mt-1 text-gray-900 font-mono">{asset.assetId}</p>
              </div>

              {asset.serialNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Serial Number</label>
                  <p className="mt-1 text-gray-900 font-mono">{asset.serialNumber}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    asset.category === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {asset.category === 'fixed' ? 'Fixed Asset' : 'Consumable'}
                  </span>
                </p>
              </div>

              {(asset as any).itemCategory && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Item Category</label>
                  <p className="mt-1 text-gray-900">{(asset as any).itemCategory}</p>
                </div>
              )}

              {(asset as any).quantity && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="mt-1 text-gray-900">{(asset as any).quantity} {asset.unit || 'pcs'}</p>
                </div>
              )}
            </div>

            {/* Financial & Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Financial & Location</h3>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Value</label>
                <p className="mt-1 text-gray-900 text-lg font-semibold">{formatCurrency(asset.value)}</p>
              </div>

              {asset.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="mt-1 text-gray-900">{asset.location}</p>
                </div>
              )}

              {asset.assignedTo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="mt-1 text-gray-900">{asset.assignedTo}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Acquisition Date</label>
                <p className="mt-1 text-gray-900">{formatDate(asset.acquisitionDate)}</p>
              </div>

              {asset.warrantyExpiry && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Warranty Expiry</label>
                  <p className="mt-1 text-gray-900">{formatDate(asset.warrantyExpiry)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 leading-relaxed">{asset.description}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {asset.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Notes</h3>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-gray-800 leading-relaxed">{asset.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
