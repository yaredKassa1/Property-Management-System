'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// ── Workflow-based pending requests ──────────────────────────────────────────

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
  } | null;
}

function WorkflowProcurementSection() {
  const [items, setItems] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await api.getRequests({ limit: '200' });
      const all = Array.isArray(response) ? response : response.data || [];
      setItems(all.filter((r: any) => r.procurementWorkflow?.currentState === 'purchase_notification_sent'));
    } catch (err) {
      console.error('Failed to load workflow procurement requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkProcured = async (req: WorkflowRequest) => {
    const supplier = prompt('Supplier name?');
    if (!supplier) return;
    try {
      await api.markProcured(req.procurementWorkflow!.id, { supplier });
      setSuccessMsg(`"${req.itemName}" marked as procured.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      load();
    } catch (err: any) {
      alert('Failed to mark as procured: ' + err.message);
    }
  };

  const fullName = (u: WorkflowRequest['requester']) =>
    u ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`.trim() : 'N/A';

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-800">Pending Workflow Approvals</h2>
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
                {['Item', 'Qty', 'Permitted Amount', 'Requested By', 'Purpose', 'Actions'].map((h) => (
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
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{req.purpose}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" onClick={() => handleMarkProcured(req)}>
                      Mark as Procured
                    </Button>
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

interface ProcurementRequest {
  id: string;
  itemName: string;
  quantity: number;
  estimatedCost: number | null;
  status: string;
  procurementStatus: string | null;
  priority: string;
  purpose: string;
  specifications: string | null;
  supplierName: string | null;
  supplierContact: string | null;
  quotationAmount: number | null;
  purchaseOrderNumber: string | null;
  procurementNotes: string | null;
  procurementDate: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  requestDate: string;
  approvalDate: string | null;
  workUnit: string;
  requester: { id: string; firstName: string; middleName: string; lastName: string; workUnit: string } | null;
  approver: { id: string; firstName: string; middleName: string; lastName: string } | null;
  processor: { id: string; firstName: string; middleName: string; lastName: string } | null;
  asset: { id: string; assetId: string; name: string; status: string } | null;
}

interface Stats {
  total: number;
  approved: number;
  procurement_in_progress: number;
  purchased: number;
  delivered: number;
  completed: number;
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  procurement_in_progress: 'In Progress',
  purchased: 'Purchased',
  delivered: 'Delivered',
  completed: 'Completed',
};

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  approved: 'info',
  procurement_in_progress: 'warning',
  purchased: 'success',
  delivered: 'success',
  completed: 'default',
};

export default function ProcurementPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, procurement_in_progress: 0, purchased: 0, delivered: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  // Process form state
  const [procurementStatus, setProcurementStatus] = useState<'procurement_in_progress' | 'purchased' | 'delivered'>('procurement_in_progress');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [procurementNotes, setProcurementNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [actualDeliveryDate, setActualDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user && !['purchase_department', 'administrator'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [router]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const response = await api.getProcurementRequests(params);
      setRequests(response.data || []);
      setStats(response.stats || { total: 0, approved: 0, procurement_in_progress: 0, purchased: 0, delivered: 0, completed: 0 });
    } catch (err) {
      console.error('Failed to fetch procurement requests:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openProcessModal = (req: ProcurementRequest) => {
    setSelectedRequest(req);
    // Pre-fill with existing data
    setProcurementStatus(
      req.status === 'procurement_in_progress' ? 'purchased' :
      req.status === 'purchased' ? 'delivered' :
      'procurement_in_progress'
    );
    setSupplierName(req.supplierName || '');
    setSupplierContact(req.supplierContact || '');
    setQuotationAmount(req.quotationAmount?.toString() || '');
    setPurchaseOrderNumber(req.purchaseOrderNumber || '');
    setProcurementNotes(req.procurementNotes || '');
    setExpectedDeliveryDate(req.expectedDeliveryDate ? req.expectedDeliveryDate.split('T')[0] : '');
    setActualDeliveryDate('');
    setShowProcessModal(true);
  };

  const handleSubmitProcess = async () => {
    if (!selectedRequest) return;
    if (!supplierName.trim()) { alert('Supplier name is required'); return; }

    try {
      setSubmitting(true);
      await api.processProcurement(selectedRequest.id, {
        procurementStatus,
        supplierName: supplierName.trim(),
        supplierContact: supplierContact.trim() || undefined,
        quotationAmount: quotationAmount ? parseFloat(quotationAmount) : undefined,
        purchaseOrderNumber: purchaseOrderNumber.trim() || undefined,
        procurementNotes: procurementNotes.trim() || undefined,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        actualDeliveryDate: procurementStatus === 'delivered' ? (actualDeliveryDate || undefined) : undefined,
      });
      alert(`Procurement status updated to: ${STATUS_LABELS[procurementStatus]}`);
      setShowProcessModal(false);
      fetchRequests();
    } catch (err: any) {
      alert('Failed to update procurement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canProcess = (req: ProcurementRequest) =>
    ['approved', 'procurement_in_progress', 'purchased'].includes(req.status);

  const getNextStatusLabel = (req: ProcurementRequest) => {
    if (req.status === 'approved') return 'Start Procurement';
    if (req.status === 'procurement_in_progress') return 'Mark Purchased';
    if (req.status === 'purchased') return 'Mark Delivered';
    return null;
  };

  const fullName = (u: any) => u ? `${u.firstName} ${u.middleName ? u.middleName + ' ' : ''}${u.lastName}`.trim() : 'N/A';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-500 mt-1">Process approved purchase requests and track procurement status</p>
        </div>

        {/* Workflow-based pending procurement */}
        <WorkflowProcurementSection />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Approved', value: stats.approved, color: 'text-blue-600' },
            { label: 'In Progress', value: stats.procurement_in_progress, color: 'text-yellow-600' },
            { label: 'Purchased', value: stats.purchased, color: 'text-green-600' },
            { label: 'Delivered', value: stats.delivered, color: 'text-purple-600' },
            { label: 'Completed', value: stats.completed, color: 'text-gray-500' },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <Card className="p-4">
          <div className="flex gap-4 flex-wrap items-center">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved (Pending Procurement)</option>
              <option value="procurement_in_progress">In Progress</option>
              <option value="purchased">Purchased</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="secondary" onClick={fetchRequests}>Refresh</Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Item', 'Qty', 'Requested By', 'Work Unit', 'Priority', 'Status', 'Supplier', 'PO Number', 'Expected Delivery', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No purchase requests found</td></tr>
                ) : requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{req.itemName}</div>
                      <div className="text-xs text-gray-400">{new Date(req.requestDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fullName(req.requester)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.workUnit}</td>
                    <td className="px-4 py-3">
                      <Badge variant={req.priority === 'urgent' ? 'error' : req.priority === 'high' ? 'warning' : 'info'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[req.status] || 'default'}>
                        {STATUS_LABELS[req.status] || req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.supplierName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.purchaseOrderNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {req.expectedDeliveryDate ? new Date(req.expectedDeliveryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {canProcess(req) && (
                          <button
                            onClick={() => openProcessModal(req)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            {getNextStatusLabel(req)}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Request Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Item" value={selectedRequest.itemName} />
                <Detail label="Quantity" value={selectedRequest.quantity} />
                <Detail label="Status" value={STATUS_LABELS[selectedRequest.status] || selectedRequest.status} />
                <Detail label="Priority" value={selectedRequest.priority} />
                <Detail label="Requested By" value={fullName(selectedRequest.requester)} />
                <Detail label="Work Unit" value={selectedRequest.workUnit} />
                <Detail label="Request Date" value={new Date(selectedRequest.requestDate).toLocaleDateString()} />
                <Detail label="Estimated Cost" value={selectedRequest.estimatedCost ? `ETB ${Number(selectedRequest.estimatedCost).toLocaleString()}` : '—'} />
                <div className="col-span-2"><Detail label="Purpose" value={selectedRequest.purpose} /></div>
                {selectedRequest.specifications && <div className="col-span-2"><Detail label="Specifications" value={selectedRequest.specifications} /></div>}

                {/* Procurement Info */}
                {selectedRequest.supplierName && <>
                  <div className="col-span-2 border-t pt-3 mt-1"><p className="font-semibold text-gray-700">Procurement Details</p></div>
                  <Detail label="Supplier" value={selectedRequest.supplierName} />
                  <Detail label="Supplier Contact" value={selectedRequest.supplierContact || '—'} />
                  <Detail label="Quotation Amount" value={selectedRequest.quotationAmount ? `ETB ${Number(selectedRequest.quotationAmount).toLocaleString()}` : '—'} />
                  <Detail label="PO Number" value={selectedRequest.purchaseOrderNumber || '—'} />
                  <Detail label="Procurement Date" value={selectedRequest.procurementDate ? new Date(selectedRequest.procurementDate).toLocaleDateString() : '—'} />
                  <Detail label="Expected Delivery" value={selectedRequest.expectedDeliveryDate ? new Date(selectedRequest.expectedDeliveryDate).toLocaleDateString() : '—'} />
                  <Detail label="Actual Delivery" value={selectedRequest.actualDeliveryDate ? new Date(selectedRequest.actualDeliveryDate).toLocaleDateString() : '—'} />
                  <Detail label="Processed By" value={fullName(selectedRequest.processor)} />
                  {selectedRequest.procurementNotes && <div className="col-span-2"><Detail label="Notes" value={selectedRequest.procurementNotes} /></div>}
                </>}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                {canProcess(selectedRequest) && (
                  <Button onClick={() => { setShowDetailModal(false); openProcessModal(selectedRequest); }}>
                    {getNextStatusLabel(selectedRequest)}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Process Modal */}
        {showProcessModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowProcessModal(false)}>
            <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-1">Update Procurement</h2>
              <p className="text-sm text-gray-500 mb-5">Item: <span className="font-medium text-gray-800">{selectedRequest.itemName}</span> — Qty: {selectedRequest.quantity}</p>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Status <span className="text-red-500">*</span></label>
                  <select
                    value={procurementStatus}
                    onChange={e => setProcurementStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedRequest.status === 'approved' && <option value="procurement_in_progress">🔄 In Progress (Started Procurement)</option>}
                    {['approved', 'procurement_in_progress'].includes(selectedRequest.status) && <option value="purchased">✅ Purchased (Items Bought)</option>}
                    {['approved', 'procurement_in_progress', 'purchased'].includes(selectedRequest.status) && <option value="delivered">📦 Delivered (Ready for QA)</option>}
                  </select>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name <span className="text-red-500">*</span></label>
                  <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. ABC Electronics Ltd." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label>
                  <input type="text" value={supplierContact} onChange={e => setSupplierContact(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone or email" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Amount (ETB)</label>
                    <input type="number" min="0" value={quotationAmount} onChange={e => setQuotationAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order No.</label>
                    <input type="text" value={purchaseOrderNumber} onChange={e => setPurchaseOrderNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PO-2026-001" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                    <input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {procurementStatus === 'delivered' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery Date</label>
                      <input type="date" value={actualDeliveryDate} onChange={e => setActualDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={3} value={procurementNotes} onChange={e => setProcurementNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional procurement notes..." />
                </div>

                {procurementStatus === 'delivered' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                    📦 Marking as <strong>Delivered</strong> will notify the Property Officer to complete the request and trigger QA inspection.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowProcessModal(false)} disabled={submitting}>Cancel</Button>
                <Button onClick={handleSubmitProcess} disabled={submitting}>
                  {submitting ? 'Saving...' : `Update to ${STATUS_LABELS[procurementStatus]}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}
