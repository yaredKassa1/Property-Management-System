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
    
    setActionLoading(true);
    try {
      await api.approveRequest(request.id, notes || undefined);
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
      await api.completeRequest(request.id);
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

  const getStatusColor = (status: RequestStatus): string => {
    const colors: Record<RequestStatus, string> = {
      pending: 'warning',
      under_review: 'info',
      approved: 'success',
      rejected: 'error',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: RequestPriority): string => {
    const colors: Record<RequestPriority, string> = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      urgent: 'error',
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
       currentUser?.role === 'vice_president') &&
      (request.status === 'pending' || request.status === 'under_review')
    );
  };

  const canComplete = (request: Request): boolean => {
    return (
      (currentUser?.role === 'property_officer' ||
       currentUser?.role === 'purchase_department') &&
      (request.status === 'approved' || request.status === 'in_progress')
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
                          {request.requester?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.department}
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

// Create Request Modal Component
function CreateRequestModal({ onClose, onSuccess, currentUser }: { 
  onClose: () => void; 
  onSuccess: () => void;
  currentUser: User | null;
}) {
  const [formData, setFormData] = useState({
    requestType: '' as RequestType,
    itemName: '',
    quantity: 1,
    estimatedCost: '',
    priority: 'medium' as RequestPriority,
    department: currentUser?.department || '',
    purpose: '',
    justification: '',
    specifications: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      };
      await api.createRequest(dataToSend);
      alert('Request created successfully!');
      onSuccess();
    } catch (err: any) {
      alert('Failed to create request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create Request</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type *
                </label>
                <select
                  required
                  value={formData.requestType}
                  onChange={(e) => setFormData({ ...formData, requestType: e.target.value as RequestType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="purchase">Purchase</option>
                  <option value="transfer">Transfer</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="disposal">Disposal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as RequestPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dell Laptops, Office Chairs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose *
              </label>
              <textarea
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain the purpose of this request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justification
              </label>
              <textarea
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional justification (optional)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications
              </label>
              <textarea
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Technical specifications (optional)..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Request'}
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
                  <Badge variant={request.priority === 'urgent' || request.priority === 'high' ? 'error' : 'info'}>
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
              <p className="mt-1 text-gray-900">{request.requester?.fullName || 'N/A'}</p>
              <p className="text-sm text-gray-500">{request.department}</p>
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
