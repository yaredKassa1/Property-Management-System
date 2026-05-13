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
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowRequest, setWorkflowRequest] = useState<Request | null>(null);
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

  // Workflow actions
  const handleWorkflowApprove = async (workflowId: string, decision: 'approve' | 'reject', permittedAmount?: number) => {
    const comments = prompt(`Enter comments for ${decision} (optional):`);
    setActionLoading(true);
    try {
      await api.approveWorkflow(workflowId, decision, comments || undefined, permittedAmount);
      alert(`Workflow ${decision}d successfully!`);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePropertyOfficerComplete = async (workflowId: string) => {
    if (!confirm('Complete this request and notify Purchase Department?')) return;
    setActionLoading(true);
    try {
      await api.propertyOfficerComplete(workflowId);
      alert('Purchase Department notified!');
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkProcured = async (workflowId: string) => {
    const supplier = prompt('Enter supplier name (optional):');
    setActionLoading(true);
    try {
      await api.markProcured(workflowId, { supplier });
      alert('Item marked as procured. QA notified!');
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQAInspect = async (workflowId: string, decision: 'approve' | 'reject') => {
    const comments = prompt(`Enter QA ${decision} comments:`);
    setActionLoading(true);
    try {
      await api.qaInspect(workflowId, decision, comments || undefined);
      alert(`QA inspection ${decision}d!`);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollectItem = async (requestId: string) => {
    if (!confirm('Confirm item collection?')) return;
    setActionLoading(true);
    try {
      await api.collectItem(requestId);
      alert('Item collected and assigned to you!');
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string): 'info' | 'success' | 'warning' | 'danger' | 'default' => {
    const colors: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
      pending: 'warning',
      under_review: 'info',
      approved: 'success',
      rejected: 'danger',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'default',
      item_ready: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: RequestPriority): 'info' | 'success' | 'warning' | 'danger' | 'default' => {
    const colors: Record<RequestPriority, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
      low: 'default', medium: 'info', high: 'warning', urgent: 'danger',
    };
    return colors[priority] || 'default';
  };

  const canReview = (r: Request) =>
    (currentUser?.role === 'approval_authority' || currentUser?.role === 'vice_president') && r.status === 'pending';

  const canApproveOrReject = (r: Request) =>
    (currentUser?.role === 'approval_authority' || currentUser?.role === 'vice_president' || currentUser?.role === 'administrator') &&
    (r.status === 'in_progress' || r.status === 'pending' || r.status === 'under_review');

  const canComplete = (r: Request) =>
    (currentUser?.role === 'property_officer' || currentUser?.role === 'purchase_department' || currentUser?.role === 'administrator') &&
    r.status === 'approved';

  const canCancel = (r: Request) =>
    currentUser?.id === r.requestedBy && (r.status === 'pending' || r.status === 'under_review');

  // Determine if a workflow action is available for this user/state
  const getWorkflowAction = (r: any): string | null => {
    const wf = r.procurementWorkflow;
    if (!wf) return null;
    const state = wf.currentState;
    const role = currentUser?.role;
    const isExisting = wf.workflowType === 'existing_asset';

    if (state === 'pending_approval' && (role === 'approval_authority' || role === 'administrator')) return 'approve_aa';
    // VP step only for new_item
    if (!isExisting && state === 'pending_vp_approval' && (role === 'vice_president' || role === 'administrator')) return 'approve_vp';
    if (state === 'pending_property_officer' && (role === 'property_officer' || role === 'administrator')) return 'property_officer';
    // Purchase/QA steps only for new_item
    if (!isExisting && state === 'purchase_notification_sent' && (role === 'purchase_department' || role === 'administrator')) return 'mark_procured';
    if (!isExisting && state === 'pending_qa_inspection' && (role === 'quality_assurance' || role === 'administrator')) return 'qa_inspect';
    if (!isExisting && state === 'item_ready' && currentUser?.id === r.requestedBy) return 'collect';
    return null;
  };

  const getWorkflowStateLabel = (state: string, workflowType?: string) => {
    if (workflowType === 'existing_asset') {
      const labels: Record<string, string> = {
        pending_approval: 'Awaiting Approval',
        pending_property_officer: 'Awaiting Property Officer',
        completed: 'Completed',
        rejected: 'Rejected',
      };
      return labels[state] || state;
    }
    const labels: Record<string, string> = {
      pending_approval: 'Awaiting Approval',
      pending_vp_approval: 'Awaiting VP Approval',
      pending_property_officer: 'Awaiting Property Officer',
      purchase_notification_sent: 'Purchase Dept. Notified',
      pending_qa_inspection: 'Awaiting QA',
      qa_approved: 'QA Approved',
      qa_rejected: 'QA Rejected',
      item_ready: 'Ready for Collection',
      completed: 'Completed',
      rejected: 'Rejected',
    };
    return labels[state] || state;
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
            <p className="text-gray-500 mt-1">Manage withdrawal, purchase, and procurement requests</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Create Request</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Type', 'Item', 'Requested By', 'Purpose', 'Priority', 'Status', 'Workflow', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No requests found. Click "Create Request" to submit a new request.
                    </td>
                  </tr>
                ) : (
                  requests.map((request: any) => {
                    const wfAction = getWorkflowAction(request);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="info">{request.requestType}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.itemName}</div>
                          <div className="text-sm text-gray-500">Qty: {request.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{request.workUnit}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{request.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getPriorityColor(request.priority)}>{request.priority}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {request.procurementWorkflow ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {getWorkflowStateLabel(request.procurementWorkflow.currentState, request.procurementWorkflow.workflowType)}
                            </span>
                          ) : request.fulfillmentPath === 'direct' ? (
                            <span className="text-green-600">Direct</span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {canReview(request) && (
                            <button onClick={() => handleReview(request)} disabled={actionLoading} className="text-purple-600 hover:text-purple-900 disabled:opacity-50">Review</button>
                          )}
                          {canApproveOrReject(request) && !request.procurementWorkflow && (
                            <>
                              <button onClick={() => handleApprove(request)} disabled={actionLoading} className="text-green-600 hover:text-green-900 disabled:opacity-50">Approve</button>
                              <button onClick={() => handleReject(request)} disabled={actionLoading} className="text-red-600 hover:text-red-900 disabled:opacity-50">Reject</button>
                            </>
                          )}
                          {canComplete(request) && !request.procurementWorkflow && (
                            <button onClick={() => handleComplete(request)} disabled={actionLoading} className="text-blue-600 hover:text-blue-900 disabled:opacity-50">Complete</button>
                          )}
                          {/* Workflow actions */}
                          {wfAction && (
                            <button
                              onClick={() => { setWorkflowRequest(request); setShowWorkflowModal(true); }}
                              className="text-indigo-600 hover:text-indigo-900 font-semibold"
                            >
                              Action
                            </button>
                          )}
                          <button onClick={() => window.open(`/requests/${request.id}/print`, '_blank')} className="text-indigo-600 hover:text-indigo-900">Print</button>
                          {canCancel(request) && (
                            <button onClick={() => handleCancel(request)} disabled={actionLoading} className="text-gray-600 hover:text-gray-900 disabled:opacity-50">Cancel</button>
                          )}
                          {!canReview(request) && !canApproveOrReject(request) && !canComplete(request) && !canCancel(request) && !wfAction && (
                            <button onClick={() => setSelectedRequest(request)} className="text-blue-600 hover:text-blue-900">View</button>
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

        {showCreateModal && (
          <CreateRequestModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => { setShowCreateModal(false); fetchRequests(); }}
            currentUser={currentUser}
          />
        )}

        {selectedRequest && (
          <ViewRequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
        )}

        {showWorkflowModal && workflowRequest && (
          <WorkflowActionModal
            request={workflowRequest as any}
            currentUser={currentUser}
            actionLoading={actionLoading}
            onClose={() => { setShowWorkflowModal(false); setWorkflowRequest(null); }}
            onApproveAA={(wfId, d) => handleWorkflowApprove(wfId, d)}
            onApproveVP={(wfId, d) => handleWorkflowApprove(wfId, d)}
            onPropertyOfficerComplete={handlePropertyOfficerComplete}
            onMarkProcured={handleMarkProcured}
            onQAInspect={handleQAInspect}
            onCollect={handleCollectItem}
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
      // Request available assets specifically (for staff users to see available assets in request form)
      const data: any = await api.getAssets({ status: 'available', includeAvailable: 'true' });
      const allAssets = Array.isArray(data) ? data : data.data || [];
      // For withdrawal requests: show available assets (not assigned to anyone)
      // For purchase requests: no asset selection needed
      const availableAssets = allAssets.filter((asset: any) => 
        asset.status === 'available' && !asset.assignedTo
      );
      console.log('All assets:', allAssets);
      console.log('Available assets for withdrawal:', availableAssets);
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
      // Try to fetch filtered approval authorities based on staff hierarchy
      const data: any = await api.getFilteredApprovalAuthorities();
      const authorities = Array.isArray(data) ? data : data.data || [];
      setApprovalAuthorities(authorities);
    } catch (err) {
      console.error('Failed to fetch filtered approval authorities, falling back to all authorities:', err);
      // Fallback to all approval authorities if filtered endpoint fails
      try {
        const data: any = await api.getApprovalAuthorities();
        const authorities = Array.isArray(data) ? data : data.data || [];
        setApprovalAuthorities(authorities);
      } catch (fallbackErr) {
        console.error('Failed to fetch approval authorities:', fallbackErr);
      }
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
    
    // When an existing asset is selected, auto-fill name and clear any typed name
    if (field === 'assetId') {
      if (value) {
        const selectedAsset = assets.find(a => a.id.toString() === value);
        if (selectedAsset) {
          newItems[index].assetName = selectedAsset.name;
          newItems[index].measurement = selectedAsset.unit || 'pcs';
        }
      } else {
        // Cleared the dropdown — reset name so user can type
        newItems[index].assetName = '';
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const firstItem = formData.items[0];
      const hasExistingAsset = formData.items.some(i => i.assetId);
      const hasNewItem = formData.items.some(i => !i.assetId && i.assetName.trim());

      if (!hasExistingAsset && !hasNewItem) {
        alert('Please select an existing asset or type a new item name.');
        setLoading(false);
        return;
      }

      const itemNames = formData.items.map(i =>
        i.assetId ? i.assetName : i.assetName.trim()
      ).filter(Boolean).join(', ');

      const dataToSend = {
        requestType: hasExistingAsset && !hasNewItem ? 'withdrawal' : 'purchase',
        assetId: hasExistingAsset ? firstItem.assetId || undefined : undefined,
        itemName: itemNames || firstItem.assetName,
        quantity: formData.items.reduce((sum, i) => sum + i.requestedAmount, 0),
        purpose: formData.reason,
        priority: 'medium' as RequestPriority,
        workUnit: currentUser?.workUnit || '',
        approvalAuthorityId: formData.approvalAuthorityId || undefined,
        justification: `Staff: ${currentUser?.firstName} ${currentUser?.lastName}\nModel: 20`,
        specifications: JSON.stringify(formData.items),
        requesterSignature: 'Digital Signature'
      };

      await api.createRequest(dataToSend);
      alert(
        hasNewItem
          ? 'Request submitted! Item not in store — sent to Approval Authority for procurement.'
          : 'Asset withdrawal request created successfully!'
      );
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
                          <div className="space-y-1">
                            <select
                              value={item.assetId}
                              onChange={(e) => handleItemChange(index, 'assetId', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Select existing asset --</option>
                              {assets.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                  {asset.name} ({asset.serialNumber})
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>or type new item:</span>
                            </div>
                            <input
                              type="text"
                              value={item.assetId ? '' : item.assetName}
                              onChange={(e) => {
                                handleItemChange(index, 'assetId', '');
                                handleItemChange(index, 'assetName', e.target.value);
                              }}
                              disabled={!!item.assetId}
                              required={!item.assetId}
                              className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                item.assetId ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300'
                              }`}
                              placeholder="e.g. HP LaserJet Printer"
                            />
                          </div>
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

// Workflow Action Modal
function WorkflowActionModal({
  request, currentUser, actionLoading, onClose,
  onApproveAA, onApproveVP, onPropertyOfficerComplete,
  onMarkProcured, onQAInspect, onCollect
}: {
  request: any;
  currentUser: User | null;
  actionLoading: boolean;
  onClose: () => void;
  onApproveAA: (wfId: string, d: 'approve' | 'reject', permittedAmount?: number) => void;
  onApproveVP: (wfId: string, d: 'approve' | 'reject') => void;
  onPropertyOfficerComplete: (wfId: string) => void;
  onMarkProcured: (wfId: string) => void;
  onQAInspect: (wfId: string, d: 'approve' | 'reject') => void;
  onCollect: (requestId: string) => void;
}) {
  const wf = request.procurementWorkflow;
  if (!wf) return null;

  const isExistingAsset = wf.workflowType === 'existing_asset';

  const stateLabels: Record<string, string> = {
    pending_approval: 'Awaiting Approval Authority',
    pending_vp_approval: 'Awaiting Vice President Approval',
    pending_property_officer: isExistingAsset ? 'Awaiting Property Officer (Assign Asset)' : 'Awaiting Property Officer',
    purchase_notification_sent: 'Purchase Department Notified',
    pending_qa_inspection: 'Awaiting QA Inspection',
    qa_approved: 'QA Approved',
    qa_rejected: 'QA Rejected — Re-procurement needed',
    item_ready: 'Item Ready for Collection',
    completed: 'Completed',
    rejected: 'Rejected',
  };

  const steps = isExistingAsset
    ? [
        { key: 'pending_approval', label: 'Approval Authority', icon: '1' },
        { key: 'pending_property_officer', label: 'Property Officer', icon: '2' },
        { key: 'completed', label: 'Assigned to User', icon: '3' },
      ]
    : [
        { key: 'pending_approval', label: 'Approval Authority', icon: '1' },
        { key: 'pending_vp_approval', label: 'Vice President', icon: '2' },
        { key: 'pending_property_officer', label: 'Property Officer', icon: '3' },
        { key: 'purchase_notification_sent', label: 'Purchase Dept.', icon: '4' },
        { key: 'pending_qa_inspection', label: 'QA Inspection', icon: '5' },
        { key: 'item_ready', label: 'Collection', icon: '6' },
      ];

  const stateOrder = steps.map(s => s.key);
  const currentIdx = stateOrder.indexOf(wf.currentState);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Procurement Workflow</h2>
              <p className="text-sm text-gray-500 mt-1">{request.itemName} — {request.workUnit}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const done = currentIdx > i || wf.currentState === 'completed';
              const active = currentIdx === i;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {done ? '✓' : step.icon}
                  </div>
                  <span className="text-xs text-center mt-1 text-gray-500 leading-tight">{step.label}</span>
                  {i < steps.length - 1 && (
                    <div className={`absolute hidden`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current State */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800">Current Status</p>
            <p className="text-blue-900 font-semibold mt-1">{stateLabels[wf.currentState] || wf.currentState}</p>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Item:</span> <span className="font-medium">{request.itemName}</span></div>
            <div><span className="text-gray-500">Qty:</span> <span className="font-medium">{request.quantity}</span></div>
            <div><span className="text-gray-500">Requested by:</span> <span className="font-medium">{request.requester?.firstName} {request.requester?.lastName}</span></div>
            <div><span className="text-gray-500">Work Unit:</span> <span className="font-medium">{request.workUnit}</span></div>
            {request.purpose && <div className="col-span-2"><span className="text-gray-500">Purpose:</span> <span>{request.purpose}</span></div>}
          </div>

          {/* Approval History */}
          {(wf.approvalAuthorityDecision || wf.vpDecision || wf.qaDecision) && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Approval History</p>
              {wf.approvalAuthorityDecision && (
                <div className={`text-sm p-2 rounded ${wf.approvalAuthorityDecision === 'approve' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  Approval Authority: {wf.approvalAuthorityDecision}
                  {wf.permittedAmount ? ` — permitted qty: ${wf.permittedAmount}` : ''}
                  {wf.approvalAuthorityComments ? ` — ${wf.approvalAuthorityComments}` : ''}
                </div>
              )}
              {wf.vpDecision && (
                <div className={`text-sm p-2 rounded ${wf.vpDecision === 'approve' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  Vice President: {wf.vpDecision} {wf.vpComments && `— ${wf.vpComments}`}
                </div>
              )}
              {wf.qaDecision && (
                <div className={`text-sm p-2 rounded ${wf.qaDecision === 'approve' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  QA Inspector: {wf.qaDecision} {wf.qaComments && `— ${wf.qaComments}`}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-4 space-y-3">
            {wf.currentState === 'pending_approval' && (currentUser?.role === 'approval_authority' || currentUser?.role === 'administrator') && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Permitted Quantity (leave blank to permit full requested amount of {request.quantity})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={request.quantity}
                    id="permittedAmountInput"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder={`Max: ${request.quantity}`}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      const val = (document.getElementById('permittedAmountInput') as HTMLInputElement)?.value;
                      onApproveAA(wf.id, 'approve', val ? parseInt(val) : undefined);
                    }}
                    disabled={actionLoading} className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => onApproveAA(wf.id, 'reject', undefined)} disabled={actionLoading} className="flex-1">Reject</Button>
                </div>
              </div>
            )}
            {wf.currentState === 'pending_vp_approval' && (currentUser?.role === 'vice_president' || currentUser?.role === 'administrator') && (
              <div className="flex gap-3">
                <Button onClick={() => onApproveVP(wf.id, 'approve')} disabled={actionLoading} className="flex-1">Approve Purchase</Button>
                <Button variant="danger" onClick={() => onApproveVP(wf.id, 'reject')} disabled={actionLoading} className="flex-1">Reject</Button>
              </div>
            )}
            {wf.currentState === 'pending_property_officer' && (currentUser?.role === 'property_officer' || currentUser?.role === 'administrator') && (
              <Button onClick={() => onPropertyOfficerComplete(wf.id)} disabled={actionLoading} className="w-full">
                Complete & Notify Purchase Department
              </Button>
            )}
            {wf.currentState === 'purchase_notification_sent' && (currentUser?.role === 'purchase_department' || currentUser?.role === 'administrator') && (
              <Button onClick={() => onMarkProcured(wf.id)} disabled={actionLoading} className="w-full">
                Mark Item as Procured
              </Button>
            )}
            {wf.currentState === 'pending_qa_inspection' && (currentUser?.role === 'quality_assurance' || currentUser?.role === 'administrator') && (
              <div className="flex gap-3">
                <Button onClick={() => onQAInspect(wf.id, 'approve')} disabled={actionLoading} className="flex-1">QA Approve</Button>
                <Button variant="danger" onClick={() => onQAInspect(wf.id, 'reject')} disabled={actionLoading} className="flex-1">QA Reject</Button>
              </div>
            )}
            {wf.currentState === 'item_ready' && currentUser?.id === request.requestedBy && (
              <Button onClick={() => onCollect(request.id)} disabled={actionLoading} className="w-full bg-green-600 hover:bg-green-700">
                Collect Item
              </Button>
            )}
            <Button variant="secondary" onClick={onClose} className="w-full">Close</Button>
          </div>
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
