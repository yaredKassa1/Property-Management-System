'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Toast, ToastType } from '@/components/ui/Toast';
import { InputDialog } from '@/components/ui/Dialog';
import { useLanguage } from '@/lib/contexts';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

// ── Workflow-based pending QA ─────────────────────────────────────────────────

interface WorkflowRequest {
  id: string;
  itemName: string;
  quantity: number;
  purpose: string;
  requestDate: string;
  requester: { id: string; firstName: string; middleName?: string; lastName: string } | null;
  procurementWorkflow: {
    id: string;
    currentState: string;
    permittedAmount: number | null;
    procurementDetails?: any;
  } | null;
}

function WorkflowQASection() {
  const { t } = useLanguage();
  const [items, setItems] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [approveTarget, setApproveTarget] = useState<WorkflowRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<WorkflowRequest | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await api.getRequests({ limit: '200' });
      const all = Array.isArray(response) ? response : response.data || [];
      setItems(all.filter((r: any) =>
        r.procurementWorkflow?.currentState === 'pending_qa_inspection' ||
        r.procurementWorkflow?.currentState === 'qa_rejected'
      ));
    } catch (err) {
      console.error('Failed to load workflow QA requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleQAAction = async (decision: 'approve' | 'reject', comments: string) => {
    const req = decision === 'approve' ? approveTarget : rejectTarget;
    if (!req) return;
    try {
      await api.qaInspect(req.procurementWorkflow!.id, decision, comments || undefined);
      setToast({
        message: decision === 'approve'
          ? t('qa_passed_message').replace('{item}', req.itemName)
          : t('qa_failed_message').replace('{item}', req.itemName),
        type: decision === 'approve' ? 'success' : 'warning',
      });
      setApproveTarget(null);
      setRejectTarget(null);
      load();
    } catch (err: any) {
      setToast({ message: t('qa_action_failed').replace('{message}', err.message), type: 'error' });
    }
  };

  const fullName = (u: WorkflowRequest['requester']) =>
    u ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`.trim() : 'N/A';

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {approveTarget && (
        <InputDialog
          title={t('qa_approve_title').replace('{item}', approveTarget.itemName)}
          label={t('inspection_comments_optional')}
          placeholder={t('inspection_comments_placeholder')}
          multiline
          confirmLabel={t('approve_add_inventory')}
          onConfirm={(comments) => handleQAAction('approve', comments)}
          onCancel={() => setApproveTarget(null)}
        />
      )}

      {rejectTarget && (
        <InputDialog
          title={t('qa_reject_title').replace('{item}', rejectTarget.itemName)}
          label={t('rejection_reason_label')}
          placeholder={t('quality_issues_placeholder')}
          required
          multiline
          confirmLabel={t('reject_notify_purchase')}
          onConfirm={(reason) => handleQAAction('reject', reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <h2 className="text-xl font-semibold text-gray-800">{t('pending_workflow_qa')}</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[t('item'), t('qty'), t('permitted_amount'), t('requested_by'), t('status'), t('procurement_details'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((req) => {
                const state = req.procurementWorkflow?.currentState;
                const isRejected = state === 'qa_rejected';
                return (
                  <tr key={req.id} className={`hover:bg-gray-50 ${isRejected ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{req.itemName}</div>
                      <div className="text-xs text-gray-400">{new Date(req.requestDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {req.procurementWorkflow?.permittedAmount != null
                        ? `ETB ${Number(req.procurementWorkflow.permittedAmount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fullName(req.requester)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                        isRejected
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {isRejected ? (
                          <>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            {t('previously_rejected')}
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-4 h-4" />
                            {t('pending_inspection')}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {req.procurementWorkflow?.procurementDetails
                        ? JSON.stringify(req.procurementWorkflow.procurementDetails)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isRejected ? (
                        <span className="text-xs text-gray-400 italic">{t('awaiting_reprocurement')}</span>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setApproveTarget(req)}>
                            {t('qa_approve')}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setRejectTarget(req)}>
                            {t('qa_reject')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Legacy ProcurementInspection records ─────────────────────────────────────

interface ProcurementInspection {
  id: string;
  requestId: string;
  assetId: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_correction';
  inspectedBy: string | null;
  inspectionDate: string | null;
  assessedCondition: string | null;
  remarks: string | null;
  rejectionReason: string | null;
  correctionRequired: string | null;
  createdAt: string;
  updatedAt: string;
  asset: {
    id: string;
    assetId: string;
    name: string;
    serialNumber: string;
    condition: string;
    status: string;
  };
  request: {
    id: string;
    itemName: string;
    requestType: string;
    completionDate: string;
    requestedBy: string;
  };
  inspector: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    role: string;
  } | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  needs_correction: number;
}

export default function QAInspectionsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [inspections, setInspections] = useState<ProcurementInspection[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, needs_correction: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<ProcurementInspection | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);

  // Inspection form state
  const [inspectionResult, setInspectionResult] = useState<'approved' | 'rejected' | 'needs_correction'>('approved');
  const [assessedCondition, setAssessedCondition] = useState('excellent');
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionRequired, setCorrectionRequired] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser && !['quality_assurance', 'property_officer', 'administrator'].includes(currentUser.role)) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    fetchInspections();
  }, [statusFilter, searchTerm]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.getProcurementInspections(Object.keys(params).length > 0 ? params : undefined);
      setInspections(response.data || []);
      setStats(response.stats || { total: 0, pending: 0, approved: 0, rejected: 0, needs_correction: 0 });
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInspection = (inspection: ProcurementInspection) => {
    setSelectedInspection(inspection);
    setShowViewModal(true);
  };

  const handleInspectClick = (inspection: ProcurementInspection) => {
    setSelectedInspection(inspection);
    setInspectionResult('approved');
    setAssessedCondition('excellent');
    setRemarks('');
    setRejectionReason('');
    setCorrectionRequired('');
    setShowInspectModal(true);
  };

  const handleSubmitInspection = async () => {
    if (!selectedInspection) return;

    if (!assessedCondition) { alert(t('qa_select_condition_alert')); return; }
    if (inspectionResult === 'rejected' && !rejectionReason.trim()) { alert(t('qa_provide_rejection_reason')); return; }
    if (inspectionResult === 'needs_correction' && !correctionRequired.trim()) { alert(t('qa_provide_correction_description')); return; }

    try {
      setSubmitting(true);
      await api.submitProcurementInspection(selectedInspection.id, {
        result: inspectionResult,
        assessedCondition,
        remarks: remarks.trim() || undefined,
        rejectionReason: inspectionResult === 'rejected' ? rejectionReason : undefined,
        correctionRequired: inspectionResult === 'needs_correction' ? correctionRequired : undefined,
      });
      alert(t('inspection_submitted'));
      setShowInspectModal(false);
      fetchInspections();
    } catch (error: any) {
      console.error('Failed to submit inspection:', error);
      alert(error.message || t('inspection_submit_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      needs_correction: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status.replace('_', ' ')}</Badge>;
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      excellent: 'success',
      good: 'success',
      fair: 'warning',
      poor: 'error',
      damaged: 'error',
    };
    return <Badge variant={variants[condition] || 'info'}>{condition}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Workflow-based pending QA */}
        <WorkflowQASection />

        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('qa_inspections')}</h1>
              {/* Short Horizontal Accent Line */}
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
              <p className="text-sm text-gray-600">{t('qa_inspections_subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">{t('total_inspections')}</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">{t('pending')}</div>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">{t('approved')}</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">{t('rejected')}</div>
            <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder={t('search_qa_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('all_statuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="approved">{t('approved')}</option>
              <option value="rejected">{t('rejected')}</option>
              <option value="needs_correction">{t('needs_correction')}</option>
            </select>
          </div>
        </Card>

        {/* Inspections Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[t('asset_id'), t('asset_name_col'), t('item'), t('delivered_date_col'), t('status'), t('condition'), t('actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t('loading_inspections')}</td></tr>
                ) : inspections.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t('no_inspections_found')}</td></tr>
                ) : inspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{inspection.asset.assetId}</td>
                    <td className="px-4 py-3 text-sm">{inspection.asset.name}</td>
                    <td className="px-4 py-3 text-sm">{inspection.request.itemName}</td>
                    <td className="px-4 py-3 text-sm">
                      {inspection.request.completionDate
                        ? new Date(inspection.request.completionDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(inspection.status)}</td>
                    <td className="px-4 py-3">
                      {inspection.assessedCondition ? getConditionBadge(inspection.assessedCondition) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewInspection(inspection)}>
                          {t('view')}
                        </Button>
                        {(inspection.status === 'pending' || inspection.status === 'needs_correction') && (
                          <Button variant="primary" size="sm" onClick={() => handleInspectClick(inspection)}>
                            {t('inspect')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View Modal */}
        {showViewModal && selectedInspection && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50"
            onClick={() => setShowViewModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-5">{t('inspection_details')}</h2>
              <div className="flex flex-col gap-4">
                <InspDetail label={t('asset_id')} value={selectedInspection.asset.assetId} />
                <InspDetail label={t('asset_name_col')} value={selectedInspection.asset.name} />
                <InspDetail label={t('item')} value={selectedInspection.request.itemName} />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('status')}</p>
                  {getStatusBadge(selectedInspection.status)}
                </div>
                {selectedInspection.assessedCondition && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('assessed_condition_label')}</p>
                    {getConditionBadge(selectedInspection.assessedCondition)}
                  </div>
                )}
                {selectedInspection.inspector && (
                  <InspDetail
                    label={t('inspected_by')}
                    value={`${selectedInspection.inspector.firstName} ${selectedInspection.inspector.middleName || ''} ${selectedInspection.inspector.lastName}`.trim()}
                  />
                )}
                {selectedInspection.inspectionDate && (
                  <InspDetail label={t('inspection_date')} value={new Date(selectedInspection.inspectionDate).toLocaleString()} />
                )}
                {selectedInspection.remarks && <InspDetail label={t('remarks_optional')} value={selectedInspection.remarks} />}
                {selectedInspection.rejectionReason && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('rejection_reason_label')}</p>
                    <p className="text-sm text-red-600">{selectedInspection.rejectionReason}</p>
                  </div>
                )}
                {selectedInspection.correctionRequired && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('correction_required_label')}</p>
                    <p className="text-sm text-blue-600">{selectedInspection.correctionRequired}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>{t('close')}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Inspect Modal */}
        {showInspectModal && selectedInspection && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50"
            onClick={() => setShowInspectModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-5">{t('inspect_asset_title').replace('{asset}', selectedInspection.asset.name)}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inspection_result_label')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inspectionResult}
                    onChange={(e) => setInspectionResult(e.target.value as typeof inspectionResult)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="approved">{t('approved')}</option>
                    <option value="rejected">{t('rejected')}</option>
                    <option value="needs_correction">{t('needs_correction')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('assessed_condition_label')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assessedCondition}
                    onChange={(e) => setAssessedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">{t('condition_excellent')}</option>
                    <option value="good">{t('condition_good')}</option>
                    <option value="fair">{t('condition_fair')}</option>
                    <option value="poor">{t('condition_poor')}</option>
                    <option value="damaged">{t('damaged')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('remarks_optional')}</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    placeholder={t('remarks_placeholder')}
                  />
                </div>

                {inspectionResult === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('rejection_reason_required')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      placeholder={t('qa_rejection_placeholder')}
                    />
                  </div>
                )}

                {inspectionResult === 'needs_correction' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('correction_required_label')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={correctionRequired}
                      onChange={(e) => setCorrectionRequired(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      placeholder={t('correction_required_placeholder')}
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowInspectModal(false)} disabled={submitting}>
                  {t('cancel')}
                </Button>
                <Button variant="primary" onClick={handleSubmitInspection} disabled={submitting}>
                  {submitting ? t('submitting') : t('submit_inspection')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function InspDetail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value ?? '—'}</p>
    </div>
  );
}
