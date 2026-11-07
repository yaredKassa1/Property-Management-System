'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast, ToastType } from '@/components/ui/Toast';
import { ConfirmDialog, InputDialog, TwoFieldDialog } from '@/components/ui/Dialog';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Request, RequestStatus, RequestType, RequestPriority, User } from '@/lib/types';
import { useLanguage } from '@/lib/contexts';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function RequestsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowRequest, setWorkflowRequest] = useState<Request | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType = 'success') => setToast({ message, type });

  // Dialog state
  const [approveDialog, setApproveDialog] = useState<Request | null>(null);
  const [rejectDialog, setRejectDialog] = useState<Request | null>(null);
  const [completeDialog, setCompleteDialog] = useState<Request | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Request | null>(null);
  const [wfApproveDialog, setWfApproveDialog] = useState<{ workflowId: string; decision: 'approve' | 'reject'; permittedAmount?: number } | null>(null);
  const [wfRejectDialog, setWfRejectDialog] = useState<string | null>(null); // workflowId
  const [poCompleteDialog, setPoCompleteDialog] = useState<string | null>(null); // workflowId
  const [procureDialog, setProcureDialog] = useState<string | null>(null); // workflowId

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    fetchRequests();
  }, []);

  // Handle URL hash to auto-open request detail - Check on mount and when hash changes
  useEffect(() => {
    const checkHashAndOpenModal = () => {
      if (requests.length > 0 && window.location.hash) {
        const requestId = window.location.hash.substring(1); // Remove the # symbol
        const request = requests.find(r => r.id === requestId);
        if (request) {
          setSelectedRequest(request);
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    // Check immediately when requests are loaded
    checkHashAndOpenModal();

    // Also listen for hash changes (when navigating from another page)
    const handleHashChange = () => {
      checkHashAndOpenModal();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [requests]);

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
      showToast(t('toast_review_success'), 'info');
      fetchRequests();
    } catch (err: any) {
      showToast(t('toast_review_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (notes: string, amountStr: string) => {
    if (!approveDialog) return;
    const permittedAmount = amountStr ? parseInt(amountStr) : undefined;
    setActionLoading(true);
    try {
      await api.approveRequest(approveDialog.id, notes || undefined, permittedAmount, 'Digital Signature');
      showToast(t('toast_approve_success').replace('{item}', approveDialog.itemName), 'success');
      setApproveDialog(null);
      fetchRequests();
    } catch (err: any) {
      showToast(t('toast_approve_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectDialog) return;
    setActionLoading(true);
    try {
      await api.rejectRequest(rejectDialog.id, reason);
      showToast(t('toast_reject_success').replace('{item}', rejectDialog.itemName), 'warning');
      setRejectDialog(null);
      fetchRequests();
    } catch (err: any) {
      showToast(t('toast_reject_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!completeDialog) return;
    setActionLoading(true);
    try {
      await api.completeRequest(completeDialog.id, 'Digital Signature');
      showToast(t('toast_complete_success'), 'success');
      setCompleteDialog(null);
      fetchRequests();
    } catch (err: any) {
      showToast(t('toast_complete_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    setActionLoading(true);
    try {
      await api.cancelRequest(cancelDialog.id);
      showToast(t('toast_cancel_success'), 'info');
      setCancelDialog(null);
      fetchRequests();
    } catch (err: any) {
      showToast(t('toast_cancel_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Workflow actions
  const handleWorkflowApprove = async (comments: string, amountStr: string) => {
    if (!wfApproveDialog) return;
    const permittedAmount = amountStr ? parseInt(amountStr) : wfApproveDialog.permittedAmount;
    setActionLoading(true);
    try {
      await api.approveWorkflow(wfApproveDialog.workflowId, wfApproveDialog.decision, comments || undefined, permittedAmount, 'Digital Signature');
      showToast(t(wfApproveDialog.decision === 'approve' ? 'toast_wf_approve_success' : 'toast_wf_reject_success'), wfApproveDialog.decision === 'approve' ? 'success' : 'warning');
      setWfApproveDialog(null);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      showToast(t('toast_wf_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWorkflowReject = async (reason: string) => {
    if (!wfRejectDialog) return;
    setActionLoading(true);
    try {
      await api.approveWorkflow(wfRejectDialog, 'reject', reason, undefined, 'Digital Signature');
      showToast(t('toast_wf_reject_success'), 'warning');
      setWfRejectDialog(null);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      showToast(t('toast_wf_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePropertyOfficerComplete = async () => {
    if (!poCompleteDialog) return;
    setActionLoading(true);
    try {
      await api.propertyOfficerComplete(poCompleteDialog, 'Digital Signature');
      showToast(t('toast_po_complete_success'), 'success');
      setPoCompleteDialog(null);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      showToast(t('toast_wf_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkProcured = async (supplier: string) => {
    if (!procureDialog) return;
    setActionLoading(true);
    try {
      await api.markProcured(procureDialog, { supplier });
      showToast(t('toast_procured_success'), 'success');
      setProcureDialog(null);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      showToast(t('toast_wf_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQAInspect = async (workflowId: string, decision: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      await api.qaInspect(workflowId, decision);
      showToast(t(decision === 'approve' ? 'toast_qa_approve_success' : 'toast_qa_reject_success'), decision === 'approve' ? 'success' : 'warning');
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      showToast(t('toast_wf_error') + ': ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const [collectDialog, setCollectDialog] = useState<string | null>(null); // requestId

  const handleCollectItem = async (requestId: string) => {
    setCollectDialog(requestId);
  };

  const confirmCollect = async () => {
    if (!collectDialog) return;
    setActionLoading(true);
    try {
      await api.collectItem(collectDialog);
      showToast(t('toast_collect_success'), 'success');
      setCollectDialog(null);
      fetchRequests();
      setShowWorkflowModal(false);
    } catch (err: any) {
      showToast(t('toast_wf_error') + ': ' + err.message, 'error');
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
        pending_approval: t('workflow_state_pending_approval'),
        pending_property_officer: t('workflow_state_pending_po'),
        completed: t('status_completed'),
        rejected: t('status_rejected'),
      };
      return labels[state] || state;
    }
    const labels: Record<string, string> = {
      pending_approval: t('workflow_state_pending_approval'),
      pending_vp_approval: t('workflow_state_pending_vp'),
      pending_property_officer: t('workflow_state_pending_po'),
      purchase_notification_sent: t('workflow_state_purchase_notified'),
      pending_qa_inspection: t('workflow_state_pending_qa'),
      qa_approved: t('workflow_state_qa_approved'),
      qa_rejected: t('workflow_state_qa_rejected'),
      item_ready: t('workflow_state_item_ready'),
      completed: t('status_completed'),
      rejected: t('status_rejected'),
    };
    return labels[state] || state;
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.requester?.firstName + ' ' + request.requester?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      request.status === statusFilter;
    
    const matchesPriority = 
      priorityFilter === 'all' || 
      request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const totalRequests = filteredRequests.length;
  const pendingRequests = filteredRequests.filter(r => 
    r.status === 'pending' || r.status === 'under_review'
  ).length;
  const completedRequests = filteredRequests.filter(r => 
    r.status === 'completed'
  ).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading_requests')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {approveDialog && (
        <TwoFieldDialog
          title={t('dialog_approve_item').replace('{item}', approveDialog.itemName)}
          field1Label={t('label_approval_notes')}
          field1Placeholder={t('placeholder_approval_notes')}
          field2Label={t('label_permitted_amount')}
          field2Placeholder={t('placeholder_permitted_amount')}
          field2Type="number"
          confirmLabel={t('button_approve_request')}
          onConfirm={handleApprove}
          onCancel={() => setApproveDialog(null)}
        />
      )}

      {rejectDialog && (
        <InputDialog
          title={t('dialog_reject_item').replace('{item}', rejectDialog.itemName)}
          label={t('label_rejection_reason')}
          placeholder={t('placeholder_rejection_reason')}
          required
          multiline
          confirmLabel={t('button_reject_request')}
          onConfirm={handleReject}
          onCancel={() => setRejectDialog(null)}
        />
      )}

      {completeDialog && (
        <ConfirmDialog
          title={t('dialog_complete_request')}
          message={t('message_complete_request').replace('{item}', completeDialog.itemName)}
          confirmLabel={t('button_mark_complete')}
          onConfirm={handleComplete}
          onCancel={() => setCompleteDialog(null)}
        />
      )}

      {cancelDialog && (
        <ConfirmDialog
          title={t('dialog_cancel_request')}
          message={t('message_cancel_request').replace('{item}', cancelDialog.itemName)}
          confirmLabel={t('button_cancel_request')}
          variant="danger"
          onConfirm={handleCancel}
          onCancel={() => setCancelDialog(null)}
        />
      )}

      {wfApproveDialog && (
        <TwoFieldDialog
          title={t('dialog_workflow_approval')}
          field1Label={t('label_comments_optional')}
          field1Placeholder={t('placeholder_comments')}
          field2Label={t('label_permitted_amount_optional')}
          field2Placeholder={t('placeholder_enter_quantity')}
          field2Type="number"
          confirmLabel={wfApproveDialog.decision === 'approve' ? t('approve') : t('reject')}
          onConfirm={handleWorkflowApprove}
          onCancel={() => setWfApproveDialog(null)}
        />
      )}

      {wfRejectDialog && (
        <InputDialog
          title={t('dialog_workflow_reject')}
          label={t('label_rejection_reason')}
          placeholder={t('placeholder_rejection_reason')}
          required
          multiline
          confirmLabel={t('reject')}
          onConfirm={handleWorkflowReject}
          onCancel={() => setWfRejectDialog(null)}
        />
      )}

      {poCompleteDialog && (
        <ConfirmDialog
          title={t('dialog_po_complete')}
          message={t('message_po_complete')}
          confirmLabel={t('button_notify_purchase')}
          onConfirm={handlePropertyOfficerComplete}
          onCancel={() => setPoCompleteDialog(null)}
        />
      )}

      {procureDialog && (
        <InputDialog
          title={t('dialog_mark_procured')}
          label={t('label_supplier_name')}
          placeholder={t('placeholder_supplier_name')}
          confirmLabel={t('button_mark_procured')}
          onConfirm={handleMarkProcured}
          onCancel={() => setProcureDialog(null)}
        />
      )}

      {collectDialog && (
        <ConfirmDialog
          title={t('dialog_confirm_collection')}
          message={t('message_confirm_collection')}
          confirmLabel={t('button_confirm_collection')}
          onConfirm={confirmCollect}
          onCancel={() => setCollectDialog(null)}
        />
      )}

      <div className="space-y-6">
        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Title with Short Accent Line */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('requests')}</h1>
                {/* Short Horizontal Accent Line */}
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
                <p className="text-sm text-gray-600">{t('manage_requests_subtitle')}</p>
              </div>
              
              {/* Create Button */}
              <Button onClick={() => setShowCreateModal(true)}>{t('create_request')}</Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm">
            <XMarkIcon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('total_requests')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalRequests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('pending_requests')}</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('completed_requests')}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{completedRequests}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-green-600" />
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
              <h3 className="text-sm font-semibold text-gray-700">{t('filter')} {t('requests')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search_requests_placeholder') || 'Search by item, requester, or purpose...'}
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
                <option value="pending">{t('pending')}</option>
                <option value="under_review">{t('under_review')}</option>
                <option value="approved">{t('approved')}</option>
                <option value="rejected">{t('rejected')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="cancelled">{t('cancelled')}</option>
              </select>

              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9FE8] focus:border-[#1E9FE8] bg-white text-gray-900"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">{t('all_priorities')}</option>
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[t('type'), t('item'), t('requested_by'), t('purpose'), t('priority'), t('status'), t('workflow'), t('date'), t('actions')].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                            ? t('no_requests_match_filters') 
                            : t('no_requests_found')}
                        </p>
                        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                          <p className="text-gray-400 text-sm">
                            {t('try_adjusting_filters')}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request: any) => {
                    const wfAction = getWorkflowAction(request);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="info">{request.requestType}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.itemName}</div>
                          <div className="text-sm text-gray-500">{t('qty')}: {request.quantity}</div>
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
                          <Badge variant={getPriorityColor(request.priority)}>
                            {t(`priority_${request.priority}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(request.status)}>
                            {t(`status_${request.status}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {request.procurementWorkflow ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {getWorkflowStateLabel(request.procurementWorkflow.currentState, request.procurementWorkflow.workflowType)}
                            </span>
                          ) : request.fulfillmentPath === 'direct' ? (
                            <span className="text-green-600">{t('workflow_direct')}</span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {canReview(request) && (
                            <button onClick={() => handleReview(request)} disabled={actionLoading} className="text-purple-600 hover:text-purple-900 disabled:opacity-50">{t('action_review')}</button>
                          )}
                          {canApproveOrReject(request) && !request.procurementWorkflow && (
                            <>
                              <button onClick={() => setApproveDialog(request)} disabled={actionLoading} className="text-green-600 hover:text-green-900 disabled:opacity-50">{t('action_approve')}</button>
                              <button onClick={() => setRejectDialog(request)} disabled={actionLoading} className="text-red-600 hover:text-red-900 disabled:opacity-50">{t('action_reject')}</button>
                            </>
                          )}
                          {canComplete(request) && !request.procurementWorkflow && (
                            <button onClick={() => setCompleteDialog(request)} disabled={actionLoading} className="text-blue-600 hover:text-blue-900 disabled:opacity-50">{t('action_complete')}</button>
                          )}
                          {/* Workflow actions */}
                          {wfAction && (
                            <button
                              onClick={() => { setWorkflowRequest(request); setShowWorkflowModal(true); }}
                              className="text-indigo-600 hover:text-indigo-900 font-semibold"
                            >
                              {t('action_action')}
                            </button>
                          )}
                          <button onClick={() => window.open(`/requests/${request.id}/print`, '_blank')} className="text-indigo-600 hover:text-indigo-900">{t('action_print')}</button>
                          {canCancel(request) && (
                            <button onClick={() => setCancelDialog(request)} disabled={actionLoading} className="text-gray-600 hover:text-gray-900 disabled:opacity-50">{t('action_cancel')}</button>
                          )}
                          {!canReview(request) && !canApproveOrReject(request) && !canComplete(request) && !canCancel(request) && !wfAction && (
                            <button onClick={() => setSelectedRequest(request)} className="text-blue-600 hover:text-blue-900">{t('action_view')}</button>
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
            onSuccess={(message?: string) => { setShowCreateModal(false); fetchRequests(); if (message) showToast(message, 'success'); }}
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
            onApproveAA={(wfId, d, permittedAmount) => setWfApproveDialog({ workflowId: wfId, decision: d, permittedAmount })}
            onApproveVP={(wfId, d) => setWfApproveDialog({ workflowId: wfId, decision: d })}
            onPropertyOfficerComplete={(wfId) => setPoCompleteDialog(wfId)}
            onMarkProcured={(wfId) => setProcureDialog(wfId)}
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
  onSuccess: (message?: string) => void;
  currentUser: User | null;
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [approvalAuthorities, setApprovalAuthorities] = useState<any[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<string[]>([
    'pcs', 'kg', 'g', 'L', 'mL', 'm', 'cm', 'box', 'pack', 'set', 'unit'
  ]);
  const [showAddUnitDialog, setShowAddUnitDialog] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [assetSearchTerms, setAssetSearchTerms] = useState<{ [key: number]: string }>({});
  const [showAssetDropdown, setShowAssetDropdown] = useState<{ [key: number]: boolean }>({});
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

  const handleAddCustomUnit = () => {
    if (newUnit.trim() && !measurementUnits.includes(newUnit.trim())) {
      const updatedUnits = [...measurementUnits, newUnit.trim()];
      setMeasurementUnits(updatedUnits);
      
      // If adding for a specific item, update that item's measurement
      if (currentItemIndex !== null) {
        handleItemChange(currentItemIndex, 'measurement', newUnit.trim());
      }
      
      setNewUnit('');
      setShowAddUnitDialog(false);
      setCurrentItemIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const firstItem = formData.items[0];
      const hasExistingAsset = formData.items.some(i => i.assetId);
      const hasNewItem = formData.items.some(i => !i.assetId && i.assetName.trim());

      if (!hasExistingAsset && !hasNewItem) {
        // No asset selected and no new item name provided
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
      onSuccess(
        hasNewItem
          ? 'Request submitted successfully. Item not in store — forwarded to Approval Authority for procurement.'
          : 'Asset withdrawal request submitted successfully.'
      );
    } catch (err: any) {
      onSuccess(err.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50 overflow-y-auto">
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
              
              {/* Hierarchy Information Box */}
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Your Hierarchy:</p>
                    {currentUser?.wing === 'academic' ? (
                      <div className="text-blue-800 space-y-0.5">
                        <p>• Wing: <span className="font-medium">Academic</span></p>
                        {currentUser?.college && <p>• College: <span className="font-medium">{currentUser.college}</span></p>}
                        {currentUser?.school && <p>• School: <span className="font-medium">{currentUser.school}</span></p>}
                        {currentUser?.department && <p>• Department: <span className="font-medium">{currentUser.department}</span></p>}
                      </div>
                    ) : (
                      <div className="text-blue-800 space-y-0.5">
                        <p>• Wing: <span className="font-medium">Administrative</span></p>
                        {currentUser?.administrativeUnit && <p>• Unit: <span className="font-medium">{currentUser.administrativeUnit}</span></p>}
                      </div>
                    )}
                    <p className="text-blue-700 mt-2 text-xs italic">
                      ℹ️ You can only see approval authorities from your same hierarchy
                    </p>
                  </div>
                </div>
              </div>

              <select
                required
                value={formData.approvalAuthorityId}
                onChange={(e) => setFormData({ ...formData, approvalAuthorityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Approval Authority --</option>
                {approvalAuthorities.length === 0 ? (
                  <option value="" disabled>No approval authorities found in your hierarchy</option>
                ) : (
                  approvalAuthorities.map((authority) => (
                    <option key={authority.id} value={authority.id}>
                      {authority.firstName} {authority.middleName || ''} {authority.lastName} - {authority.role.replace('_', ' ')}
                      {authority.wing === 'academic' 
                        ? ` (${authority.college || 'N/A'} - ${authority.department || 'N/A'})`
                        : ` (${authority.administrativeUnit || 'N/A'})`
                      }
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {approvalAuthorities.length > 0 
                  ? `${approvalAuthorities.length} approval ${approvalAuthorities.length === 1 ? 'authority' : 'authorities'} available in your hierarchy`
                  : 'No approval authorities found - contact administrator'
                }
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
                       <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                         Action
                       </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const searchTerm = assetSearchTerms[index] || '';
                      const filteredAssets = assets.filter(asset =>
                        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      const selectedAsset = assets.find(a => a.id === item.assetId);
                      
                      return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {/* Searchable Asset Dropdown */}
                            <div className="relative">
                              <input
                                type="text"
                                value={selectedAsset ? `${selectedAsset.name} (${selectedAsset.serialNumber})` : searchTerm}
                                onChange={(e) => {
                                  setAssetSearchTerms({ ...assetSearchTerms, [index]: e.target.value });
                                  setShowAssetDropdown({ ...showAssetDropdown, [index]: true });
                                  if (item.assetId) {
                                    handleItemChange(index, 'assetId', '');
                                  }
                                }}
                                onFocus={() => setShowAssetDropdown({ ...showAssetDropdown, [index]: true })}
                                onBlur={() => {
                                  // Delay to allow click on dropdown item
                                  setTimeout(() => {
                                    setShowAssetDropdown({ ...showAssetDropdown, [index]: false });
                                  }, 200);
                                }}
                                placeholder="Search existing asset..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {showAssetDropdown[index] && !selectedAsset && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {filteredAssets.length > 0 ? (
                                    filteredAssets.map(asset => (
                                      <div
                                        key={asset.id}
                                        onMouseDown={(e) => {
                                          e.preventDefault(); // Prevent blur
                                          handleItemChange(index, 'assetId', asset.id);
                                          setAssetSearchTerms({ ...assetSearchTerms, [index]: '' });
                                          setShowAssetDropdown({ ...showAssetDropdown, [index]: false });
                                        }}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="font-medium text-gray-900">{asset.name}</div>
                                        <div className="text-xs text-gray-500">Serial: {asset.serialNumber}</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                      No assets found
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
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
                          <div className="flex items-center gap-1">
                            <select
                              required
                              value={item.measurement}
                              onChange={(e) => handleItemChange(index, 'measurement', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {measurementUnits.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentItemIndex(index);
                                setShowAddUnitDialog(true);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-bold"
                              title="Add custom unit"
                            >
                              +
                            </button>
                          </div>
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
                               className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                               title="Remove this asset"
                             >
                               Remove
                             </button>
                           )}
                         </td>
                      </tr>
                      );
                    })}
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

      {/* Add Custom Unit Dialog */}
      {showAddUnitDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Measurement Unit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Name
                </label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomUnit();
                    }
                  }}
                  placeholder="e.g., dozen, gallon, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUnitDialog(false);
                    setNewUnit('');
                    setCurrentItemIndex(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomUnit}
                  disabled={!newUnit.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Unit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const { t } = useLanguage();
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
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
            <div>
              <span className="text-gray-500">Qty:</span> 
              {wf.permittedAmount != null && wf.permittedAmount !== undefined && wf.permittedAmount < request.quantity ? (
                <span className="font-medium">
                  <span className="text-green-600 font-bold">{wf.permittedAmount}</span>
                  <span className="text-gray-400 text-xs ml-1">({request.quantity} requested)</span>
                </span>
              ) : wf.permittedAmount != null && wf.permittedAmount !== undefined ? (
                <span className="font-medium">
                  {wf.permittedAmount}
                  {wf.permittedAmount === request.quantity && <span className="text-green-600 text-xs ml-1">(full approval)</span>}
                </span>
              ) : (
                <span className="font-medium">{request.quantity}</span>
              )}
            </div>
            <div><span className="text-gray-500">Requested by:</span> <span className="font-medium">{request.requester?.firstName} {request.requester?.lastName}</span></div>
            <div><span className="text-gray-500">Work Unit:</span> <span className="font-medium">{request.workUnit}</span></div>
            {request.purpose && <div className="col-span-2"><span className="text-gray-500">Purpose:</span> <span>{request.purpose}</span></div>}
          </div>

          {/* Partial Approval Notice */}
          {wf.permittedAmount != null && wf.permittedAmount !== undefined && wf.permittedAmount < request.quantity && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Partial Approval</p>
                  <p className="text-sm text-amber-700 mt-1">
                    The Approval Authority permitted only <span className="font-bold">{wf.permittedAmount} out of {request.quantity}</span> requested items. 
                    Please process only the permitted quantity.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const value = parseInt(input.value);
                      if (value > request.quantity) {
                        input.setCustomValidity(`Permitted quantity cannot exceed requested quantity of ${request.quantity}`);
                      } else if (value < 1 && input.value !== '') {
                        input.setCustomValidity('Permitted quantity must be at least 1');
                      } else {
                        input.setCustomValidity('');
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      const input = document.getElementById('permittedAmountInput') as HTMLInputElement;
                      const val = input?.value;
                      
                      // Validate permitted quantity
                      if (val) {
                        const permittedQty = parseInt(val);
                        if (permittedQty > request.quantity) {
                          alert(`Permitted quantity (${permittedQty}) cannot be greater than requested quantity (${request.quantity})`);
                          return;
                        }
                        if (permittedQty < 1) {
                          alert('Permitted quantity must be at least 1');
                          return;
                        }
                      }
                      
                      onApproveAA(wf.id, 'approve', val ? parseInt(val) : undefined);
                    }}
                    disabled={actionLoading} className="flex-1"
                  >
                    {t('action_approve')}
                  </Button>
                  <Button variant="danger" onClick={() => onApproveAA(wf.id, 'reject', undefined)} disabled={actionLoading} className="flex-1">{t('action_reject')}</Button>
                </div>
              </div>
            )}
            {wf.currentState === 'pending_vp_approval' && (currentUser?.role === 'vice_president' || currentUser?.role === 'administrator') && (
              <div className="flex gap-3">
                <Button onClick={() => onApproveVP(wf.id, 'approve')} disabled={actionLoading} className="flex-1">{t('action_approve')} Purchase</Button>
                <Button variant="danger" onClick={() => onApproveVP(wf.id, 'reject')} disabled={actionLoading} className="flex-1">{t('action_reject')}</Button>
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
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
                <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {(() => {
                    try {
                      const specs = JSON.parse(request.specifications);
                      const workflowPermittedAmount = request.procurementWorkflow?.permittedAmount;
                      
                      if (Array.isArray(specs) && specs.length > 0) {
                        return (
                          <div className="space-y-3">
                            {specs.map((item: any, index: number) => (
                              <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {item.assetName || 'Item ' + (index + 1)}
                                  </h4>
                                  {item.assetId && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Asset ID: {item.assetId}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {item.requestedAmount && (
                                    <div>
                                      <span className="text-gray-500">Requested:</span>
                                      <span className="ml-2 font-medium text-gray-900">
                                        {item.requestedAmount} {item.measurement || 'pcs'}
                                      </span>
                                    </div>
                                  )}
                                  {workflowPermittedAmount != null && workflowPermittedAmount !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Permitted:</span>
                                      <span className="ml-2 font-medium text-green-600">
                                        {workflowPermittedAmount} {item.measurement || 'pcs'}
                                      </span>
                                    </div>
                                  )}
                                  {item.examinationResult && (
                                    <div className="col-span-2">
                                      <span className="text-gray-500">Examination:</span>
                                      <span className="ml-2 font-medium text-gray-900">
                                        {item.examinationResult}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return <p className="text-gray-900">{request.specifications}</p>;
                      }
                    } catch (e) {
                      // If JSON parsing fails, display as plain text
                      return <p className="text-gray-900">{request.specifications}</p>;
                    }
                  })()}
                </div>
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
