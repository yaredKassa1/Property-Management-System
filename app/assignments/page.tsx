'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  status: string;
  condition: string;
  location: string;
  department: string;
  assignedTo?: string;
  assignedUser?: {
    id: string;
    fullName: string;
    email: string;
    department: string;
  };
}

interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  department: string;
  role: string;
}

export default function AssignmentsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [searchAsset, setSearchAsset] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Unassignment
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [assetToUnassign, setAssetToUnassign] = useState<Asset | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // The API client already extracts data.data and returns just the array
      const assets = await api.getAssets({ limit: 1000 });
      setAssets(Array.isArray(assets) ? assets : []);
      
      // Fetch users - handle permission errors gracefully
      try {
        const users = await api.getUsers();
        setUsers(Array.isArray(users) ? users : []);
      } catch (userError: any) {
        // If property officer doesn't have user access, just continue with empty users
        console.warn('Could not fetch users:', userError.message);
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Fetch error:', err); // Debug log
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAsset = async () => {
    if (!selectedAsset || !selectedUserId) {
      setError('Please select a user');
      return;
    }

    setAssignmentLoading(true);
    setError('');
    
    try {
      await api.updateAsset(selectedAsset.id, {
        assignedTo: selectedUserId,
        status: 'assigned'
      });
      
      setSuccess(`Asset ${selectedAsset.assetId} successfully assigned!`);
      setShowAssignModal(false);
      setSelectedAsset(null);
      setSelectedUserId('');
      setAssignmentNotes('');
      fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to assign asset');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleUnassignAsset = async () => {
    if (!assetToUnassign) return;

    setAssignmentLoading(true);
    setError('');
    
    try {
      await api.updateAsset(assetToUnassign.id, {
        assignedTo: null,
        status: 'available'
      });
      
      setSuccess(`Asset ${assetToUnassign.assetId} successfully unassigned!`);
      setShowUnassignModal(false);
      setAssetToUnassign(null);
      fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to unassign asset');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const openAssignModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssignModal(true);
    setError('');
  };

  const openUnassignModal = (asset: Asset) => {
    setAssetToUnassign(asset);
    setShowUnassignModal(true);
    setError('');
  };

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.assetId.toLowerCase().includes(searchAsset.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchAsset.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'assigned' && asset.status === 'assigned') ||
      (statusFilter === 'available' && asset.status === 'available');
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      asset.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));

  const assignedAssets = filteredAssets.filter(a => a.status === 'assigned');
  const availableAssets = filteredAssets.filter(a => a.status === 'available');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Assignments</h1>
          <p className="text-gray-600 mt-1">Assign and manage asset allocations to staff members</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✅ {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{filteredAssets.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📦
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Assets</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{assignedAssets.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Assets</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{availableAssets.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  📋
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by Asset ID or Name..."
                value={searchAsset}
                onChange={(e) => setSearchAsset(e.target.value)}
              />
              
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
              </select>

              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.length > 0 && departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <Button
                onClick={() => {
                  setSearchAsset('');
                  setStatusFilter('all');
                  setDepartmentFilter('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Assets Table */}
        <Card title="Asset Assignment List" className="border border-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="text-gray-600 mt-4">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>No assets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{asset.assetId}</div>
                        <div className="text-sm text-gray-500">{asset.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={asset.category === 'fixed' ? 'info' : 'warning'}>
                          {asset.category === 'fixed' ? 'Fixed Asset' : 'Fixed-Consumable'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {asset.location || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            asset.status === 'assigned' ? 'success' :
                            asset.status === 'available' ? 'info' : 'default'
                          }
                        >
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {asset.assignedUser ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {asset.assignedUser.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {asset.assignedUser.department || 'No department'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {asset.status === 'available' ? (
                          <Button
                            size="sm"
                            onClick={() => openAssignModal(asset)}
                          >
                            Assign
                          </Button>
                        ) : asset.status === 'assigned' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUnassignModal(asset)}
                          >
                            Unassign
                          </Button>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Assign Asset Modal */}
        {showAssignModal && selectedAsset && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
              onClick={() => !assignmentLoading && setShowAssignModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Assign Asset</h2>
                  <p className="text-gray-600 mt-1">Assign asset to a staff member</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Asset Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Asset Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Asset ID:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedAsset.assetId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedAsset.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedAsset.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedAsset.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Select User */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Staff Member <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="">-- Select a staff member --</option>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} ({user.username}) - {user.department || 'No Dept'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No users available - Contact administrator</option>
                      )}
                    </select>
                  </div>

                  {/* Assignment Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                      rows={3}
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Enter any notes about this assignment..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
                    disabled={assignmentLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignAsset}
                    disabled={!selectedUserId || assignmentLoading}
                  >
                    {assignmentLoading ? 'Assigning...' : 'Assign Asset'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Unassign Asset Modal */}
        {showUnassignModal && assetToUnassign && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
              onClick={() => !assignmentLoading && setShowUnassignModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Unassign Asset</h2>
                </div>

                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to unassign this asset?
                  </p>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Asset ID:</span>
                      <span className="ml-2 font-medium text-gray-900">{assetToUnassign.assetId}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="ml-2 font-medium text-gray-900">{assetToUnassign.name}</span>
                    </div>
                    {assetToUnassign.assignedUser && (
                      <div>
                        <span className="text-sm text-gray-600">Currently assigned to:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {assetToUnassign.assignedUser.fullName}
                        </span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUnassignModal(false)}
                    disabled={assignmentLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUnassignAsset}
                    disabled={assignmentLoading}
                    variant="outline"
                  >
                    {assignmentLoading ? 'Unassigning...' : 'Unassign'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
