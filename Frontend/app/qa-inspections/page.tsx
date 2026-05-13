'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
  const [items, setItems] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await api.getRequests({ limit: '200' });
      const all = Array.isArray(response) ? response : response.data || [];
      setItems(all.filter((r: any) => r.procurementWorkflow?.currentState === 'pending_qa_inspection'));
    } catch (err) {
      console.error('Failed to load workflow QA requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleQAAction = async (req: WorkflowRequest, decision: 'approve' | 'reject') => {
    const comments = prompt(decision === 'approve' ? 'Approval comments (optional):' : 'Rejection reason:');
    if (decision === 'reject' && !comments) return;
    try {
      await api.qaInspect(req.procurementWorkflow!.id, decision, comments || undefined);
      setSuccessMsg(`"${req.itemName}" QA ${decision === 'approve' ? 'approved' : 'rejected'}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      load();
    } catch (err: any) {
      alert(`Failed to ${decision}: ` + err.message);
    }
  };

  const fullName = (u: WorkflowRequest['requester']) =>
    u ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`.trim() : 'N/A';

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      <h2 className="text-xl font-semibold text-gray-800">Pending Workflow QA</h2>
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-2 text-sm">
          ✅ {successMsg}
        </div>
      )}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Item', 'Qty', 'Permitted Amount', 'Requested By', 'Procurement Details', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.procurementWorkflow?.procurementDetails
                      ? JSON.stringify(req.procurementWorkflow.procurementDetails)
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleQAAction(req, 'approve')}>
                        QA Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleQAAction(req, 'reject')}>
                        QA Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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

    if (!assessedCondition) { alert('Please select an assessed condition'); return; }
    if (inspectionResult === 'rejected' && !rejectionReason.trim()) { alert('Please provide a rejection reason'); return; }
    if (inspectionResult === 'needs_correction' && !correctionRequired.trim()) { alert('Please provide a correction description'); return; }

    try {
      setSubmitting(true);
      await api.submitProcurementInspection(selectedInspection.id, {
        result: inspectionResult,
        assessedCondition,
        remarks: remarks.trim() || undefined,
        rejectionReason: inspectionResult === 'rejected' ? rejectionReason : undefined,
        correctionRequired: inspectionResult === 'needs_correction' ? correctionRequired : undefined,
      });
      alert('Inspection submitted successfully');
      setShowInspectModal(false);
      fetchInspections();
    } catch (error: any) {
      console.error('Failed to submit inspection:', error);
      alert(error.message || 'Failed to submit inspection');
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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QA Inspections</h1>
          <p className="text-gray-500 mt-1">Inspect and verify newly procured assets before they enter inventory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Total Inspections</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by asset name, ID, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_correction">Needs Correction</option>
            </select>
          </div>
        </Card>

        {/* Inspections Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Asset ID', 'Asset Name', 'Item', 'Delivered Date', 'Status', 'Condition', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading inspections...</td></tr>
                ) : inspections.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No inspections found</td></tr>
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
                          View
                        </Button>
                        {(inspection.status === 'pending' || inspection.status === 'needs_correction') && (
                          <Button variant="primary" size="sm" onClick={() => handleInspectClick(inspection)}>
                            Inspect
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
              <h2 className="text-xl font-bold mb-5">Inspection Details</h2>
              <div className="flex flex-col gap-4">
                <InspDetail label="Asset ID" value={selectedInspection.asset.assetId} />
                <InspDetail label="Asset Name" value={selectedInspection.asset.name} />
                <InspDetail label="Item Name" value={selectedInspection.request.itemName} />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedInspection.status)}
                </div>
                {selectedInspection.assessedCondition && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assessed Condition</p>
                    {getConditionBadge(selectedInspection.assessedCondition)}
                  </div>
                )}
                {selectedInspection.inspector && (
                  <InspDetail
                    label="Inspected By"
                    value={`${selectedInspection.inspector.firstName} ${selectedInspection.inspector.middleName || ''} ${selectedInspection.inspector.lastName}`.trim()}
                  />
                )}
                {selectedInspection.inspectionDate && (
                  <InspDetail label="Inspection Date" value={new Date(selectedInspection.inspectionDate).toLocaleString()} />
                )}
                {selectedInspection.remarks && <InspDetail label="Remarks" value={selectedInspection.remarks} />}
                {selectedInspection.rejectionReason && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-600">{selectedInspection.rejectionReason}</p>
                  </div>
                )}
                {selectedInspection.correctionRequired && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Correction Required</p>
                    <p className="text-sm text-blue-600">{selectedInspection.correctionRequired}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
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
              <h2 className="text-xl font-bold mb-5">Inspect Asset: {selectedInspection.asset.name}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Result <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inspectionResult}
                    onChange={(e) => setInspectionResult(e.target.value as typeof inspectionResult)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="needs_correction">⚠️ Needs Correction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessed Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assessedCondition}
                    onChange={(e) => setAssessedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    placeholder="Add any additional notes..."
                  />
                </div>

                {inspectionResult === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      placeholder="Explain why the asset is being rejected..."
                    />
                  </div>
                )}

                {inspectionResult === 'needs_correction' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correction Required <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={correctionRequired}
                      onChange={(e) => setCorrectionRequired(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      placeholder="Describe what corrections are needed..."
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowInspectModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmitInspection} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Inspection'}
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
