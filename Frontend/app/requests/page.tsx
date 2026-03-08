'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Request, RequestStatus, RequestType, RequestPriority, User } from '@/lib/types';

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await api.getRequests();
      const data = Array.isArray(response) ? response : response.data || [];
      setRequests(data);
    } catch (err: any) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (request: Request) => {
    setActionLoading(true);
    try {
      await api.reviewRequest(request.id);
      alert('Request marked as under review!');
      fetchRequests();
    } catch (err: any) {
      alert('Failed to review request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (request: Request) => {
    const notes = prompt('Enter approval notes (optional):');
    const permittedAmountStr = prompt('Enter permitted amount (optional):');
    const permittedAmount = permittedAmountStr ? parseInt(permittedAmountStr) : undefined;
    
    setActionLoading(true);
    try {
      await api.approveRequest(request.id, notes || undefined, permittedAmount, 'Digital Signature');
      alert('Request approved successfully!');
      fetchRequests();
    } catch (err: any) {
      alert('Failed to approve request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (request: Request) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    setActionLoading(true);
    try {
      await api.rejectRequest(request.id, reason);
      alert('Request rejected successfully!');
      fetchRequests();
    } catch (err: any) {
      alert('Failed to reject request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (request: Request) => {
    if (!confirm('Mark this request as completed?')) return;
    
    setActionLoading(true);
    try {
      await api.completeRequest(request.id, 'Digital Signature');
      alert('Request completed successfully!');
      fetchRequests();
    } catch (err: any) {
      alert('Failed to complete request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (request: Request) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    setActionLoading(true);
    try {
      await api.cancelRequest(request.id);
      alert('Request cancelled successfully!');
      fetchRequests();
    } catch (err: any) {
      alert('Failed to cancel request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: RequestStatus): 'info' | 'success' | 'warning' | 'danger' | 'default' => {
    const colors: Record<RequestStatus, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
      pending: 'warning',
      under_review: 'info',
      approved: 'success',
      rejected: 'danger',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: RequestPriority): 'info' | 'success' | 'warning' | 'danger' | 'default' => {
    const colors: Record<RequestPriority, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      urgent: 'danger',
    };
    return colors[priority] || 'default';
  };

  const canReview = (request: Request): boolean => {
    return (
      (currentUser?.role === 'approval_authority' ||
       currentUser?.role === 'vice_president') &&
      request.status === 'pending'
    );
  };

  const canApproveOrReject = (request: Request): boolean => {
    return (
      (currentUser?.role === 'approval_authority' ||
       currentUser?.role === 'vice_president' ||
       currentUser?.role === 'administrator') &&
      (request.status === 'in_progress' || request.status === 'pending' || request.status === 'under_review')
    );
  };

  const canComplete = (request: Request): boolean => {
    return (
      (currentUser?.role === 'property_officer' ||
       currentUser?.role === 'purchase_department' ||
       currentUser?.role === 'administrator') &&
      request.status === 'approved'
    );
  };

  const canCancel = (request: Request): boolean => {
    return (
      currentUser?.id === request.requestedBy &&
      (request.status === 'pending' || request.status === 'under_review')
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading requests...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
            <p className="text-gray-500 mt-1">Manage withdrawal, purchase, and other requests</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Request
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Requests List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No requests found. Click "Create Request" to submit a new request.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="info">
                          {request.requestType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.itemName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Qty: {request.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.workUnit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {canReview(request) && (
                          <button
                            onClick={() => handleReview(request)}
                            disabled={actionLoading}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          >
                            Review
                          </button>
                        )}
                        {canApproveOrReject(request) && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {canComplete(request) && (
                          <button
                            onClick={() => handleComplete(request)}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/requests/${request.id}/print`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Print"
                        >
                          Print
                        </button>
                        {canCancel(request) && (
                          <button
                            onClick={() => handleCancel(request)}
                            disabled={actionLoading}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        {!canReview(request) && !canApproveOrReject(request) && !canComplete(request) && !canCancel(request) && (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Request Modal */}
        {showCreateModal && (
          <CreateRequestModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchRequests();
            }}
            currentUser={currentUser}
          />
        )}

        {/* View Request Modal */}
        {selectedRequest && (
          <ViewRequestModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Asset Request Item Interface
interface AssetRequestItem {
  assetId: string;
  assetName: string;
  measurement: string;
  requestedAmount: number;
  permittedAmount: number;
  examination: string;
}

// Create Request Modal Component
function CreateRequestModal({ onClose, onSuccess, currentUser }: { 
  onClose: () => void; 
  onSuccess: () => void;
  currentUser: User | null;
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [approvalAuthorities, setApprovalAuthorities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    requestType: 'withdrawal' as RequestType,
    requestDate: new Date().toISOString().split('T')[0],
    reason: '',
    approvalAuthorityId: '',
    items: [
      {
        assetId: '',
        assetName: '',
        measurement: 'pcs',
        requestedAmount: 1,
        permittedAmount: 0,
        examination: ''
      }
    ] as AssetRequestItem[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchUsers();
    fetchApprovalAuthorities();
  }, []);

  const fetchAssets = async () => {
    try {
      const data: any = await api.getAssets();
      const allAssets = Array.isArray(data) ? data : data.data || [];
      // Filter out assets that are already assigned to other users
      const availableAssets = allAssets.filter((asset: any) => 
        asset.status === 'available' || 
        (asset.status === 'assigned' && asset.assignedTo === currentUser?.id)
      );
      setAssets(availableAssets);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data: any = await api.getUsers();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchApprovalAuthorities = async () => {
    try {
      const data: any = await api.getApprovalAuthorities();
      setApprovalAuthorities(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to fetch approval authorities:', err);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          assetId: '',
          assetName: '',
          measurement: 'pcs',
          requestedAmount: 1,
          permittedAmount: 0,
          examination: ''
        }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleItemChange = (index: number, field: keyof AssetRequestItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill asset name and measurement when asset is selected
    if (field === 'assetId' && value) {
      const selectedAsset = assets.find(a => a.id.toString() === value);
      if (selectedAsset) {
        newItems[index].assetName = selectedAsset.name;
        newItems[index].measurement = selectedAsset.unit || 'pcs';
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For withdrawal requests with a single asset, include the assetId
      // This is required for proper asset assignment when completing the request
      const firstAssetId = formData.items.length > 0 && formData.items[0].assetId 
        ? formData.items[0].assetId 
        : undefined;

      // Submit the request with the items
      const dataToSend = {
        requestType: formData.requestType,
        assetId: firstAssetId, // Include the first asset ID for assignment tracking
        itemName: formData.items.map(item => item.assetName).join(', '),
        quantity: formData.items.reduce((sum, item) => sum + item.requestedAmount, 0),
        purpose: formData.reason,
        priority: 'medium' as RequestPriority,
        workUnit: currentUser?.workUnit || '',
        approvalAuthorityId: formData.approvalAuthorityId || undefined,
        justification: `Staff: ${currentUser?.firstName} ${currentUser?.lastName}\nModel: 20`,
        specifications: JSON.stringify(formData.items),
        requesterSignature: 'Digital Signature'
      };
      
      await api.createRequest(dataToSend);
      alert('Asset withdrawal request created successfully!');
      onSuccess();
    } catch (err: any) {
      alert('Failed to create request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8">
        <div className="p-8">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Woldia University</h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">Asset Withdrawal Request Form</h2>
            <div className="flex justify-between items-center mt-4 text-sm">
              <div></div>
              <div className="text-right">
                <p><span className="font-medium">Model:</span> 20</p>
                <p><span className="font-medium">Date:</span> {formData.requestDate}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Requester Info (Auto-filled) */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requester
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Unit
                </label>
                <p className="text-gray-900">
                  {currentUser?.workUnit || 'N/A'}
                </p>
              </div>
            </div>

            {/* Approval Authority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Approval Authority *
              </label>
              <select
                required
                value={formData.approvalAuthorityId}
                onChange={(e) => setFormData({ ...formData, approvalAuthorityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Approval Authority --</option>
                {approvalAuthorities.map((authority) => (
                  <option key={authority.id} value={authority.id}>
                    {authority.firstName} {authority.middleName || ''} {authority.lastName} - {authority.role.replace('_', ' ')} ({authority.workUnit || 'N/A'})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the approval authority who will review and approve this request
              </p>
            </div>

            {/* Reason for Request */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Request *
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why you need these assets..."
              />
            </div>

            {/* Assets Table */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Requested Assets</h3>
                <Button type="button" variant="secondary" onClick={handleAddItem} className="text-sm">
                  + Add Asset
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                        No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Asset Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                        Measurement
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                        Requested Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                        Permitted Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                        Examination
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            required
                            value={item.assetId}
                            onChange={(e) => handleItemChange(index, 'assetId', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Asset</option>
                            {assets.map(asset => (
                              <option key={asset.id} value={asset.id}>
                                {asset.name} ({asset.serialNumber})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            required
                            value={item.measurement}
                            onChange={(e) => handleItemChange(index, 'measurement', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., pcs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.requestedAmount}
                            onChange={(e) => handleItemChange(index, 'requestedAmount', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={item.permittedAmount}
                            onChange={(e) => handleItemChange(index, 'permittedAmount', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                            placeholder="To be filled"
                            disabled
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.examination}
                            onChange={(e) => handleItemChange(index, 'examination', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notes"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Signatures</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Requestor:</p>
                  <div className="space-y-1 text-gray-600">
                    <p>Name: ....................................</p>
                    <p>Signature: .............................</p>
                    <p>Date: ....................................</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Approval Authority:</p>
                  <div className="space-y-1 text-gray-600">
                    <p>Name: ....................................</p>
                    <p>Signature: .............................</p>
                    <p>Date: ....................................</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Property Officer:</p>
                  <div className="space-y-1 text-gray-600">
                    <p>Name: ....................................</p>
                    <p>Signature: .............................</p>
                    <p>Date: ....................................</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={handlePrint}>
                Print
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// View Request Modal Component
function ViewRequestModal({ request, onClose }: { request: Request; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Request Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <div className="mt-1">
                  <Badge variant="info">{request.requestType}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <div className="mt-1">
                  <Badge variant={request.priority === 'urgent' || request.priority === 'high' ? 'danger' : 'info'}>
                    {request.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={request.status === 'completed' || request.status === 'approved' ? 'success' : 'warning'}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Item</label>
              <p className="mt-1 text-gray-900">{request.itemName}</p>
              <p className="text-sm text-gray-500">Quantity: {request.quantity}</p>
            </div>

            {request.estimatedCost && (
              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                <p className="mt-1 text-gray-900">${request.estimatedCost.toFixed(2)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Requested By</label>
              <p className="mt-1 text-gray-900">{request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'N/A'}</p>
              <p className="text-sm text-gray-500">{request.workUnit}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Purpose</label>
              <p className="mt-1 text-gray-900">{request.purpose}</p>
            </div>

            {request.justification && (
              <div>
                <label className="text-sm font-medium text-gray-500">Justification</label>
                <p className="mt-1 text-gray-900">{request.justification}</p>
              </div>
            )}

            {request.specifications && (
              <div>
                <label className="text-sm font-medium text-gray-500">Specifications</label>
                <p className="mt-1 text-gray-900">{request.specifications}</p>
              </div>
            )}

            {request.approvalNotes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Approval Notes</label>
                <p className="mt-1 text-green-600">{request.approvalNotes}</p>
              </div>
            )}

            {request.rejectionReason && (
              <div>
                <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                <p className="mt-1 text-red-600">{request.rejectionReason}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Request Date</label>
                <p className="mt-1 text-gray-900">
                  {new Date(request.requestDate).toLocaleString()}
                </p>
              </div>
              {request.completionDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Completion Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(request.completionDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
