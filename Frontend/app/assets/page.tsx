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

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
            <p className="text-gray-600">
              {isPropertyOfficer ? 'Manage university property assets' : 'Your assigned assets'}
            </p>
          </div>
          {isPropertyOfficer && (
            <Button onClick={() => router.push('/assets/new')}>
              + Register New Asset
            </Button>
          )}
        </div>

        <Card>
          <div className="mb-4">
            <Input
              placeholder="Search by asset ID, name, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableHead>Tag No.</TableHead>
                <TableHead>Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Item Category</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
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
                        {asset.category === 'fixed' ? 'Fixed' : 'Fixed-Consumable'}
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
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/assets/${asset.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No assets found matching your search' : 'No assets found'}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
