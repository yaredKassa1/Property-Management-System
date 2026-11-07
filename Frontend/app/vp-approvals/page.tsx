'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast, ToastType } from '@/components/ui/Toast';
import { ApprovalDialog, RejectionDialog, TwoFieldDialog, InputDialog } from '@/components/ui/Dialog';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/contexts';

interface WorkflowRequest {
  id: string;
  itemName: string;
  quantity: number;
  purpose: string;
  requestDate: string;
  workUnit: string;
  requester: { id: string; firstName: string; middleName?: string; lastName: string } | null;
  procurementWorkflow: {
    id: string;
    currentState: string;
    permittedAmount: number | null;
  } | null;
}

export default function VPApprovalsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [approveTarget, setApproveTarget] = useState<WorkflowRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<WorkflowRequest | null>(null);

  useEffect(() => {
    const user = getUser();
    if (user && !['vice_president', 'administrator'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await api.getRequests({ limit: '200' });
      const all = Array.isArray(response) ? response : response.data || [];
      setItems(all.filter((r: any) => r.procurementWorkflow?.currentState === 'pending_vp_approval'));
    } catch (err) {
      setToast({ message: 'Failed to load requests. Please refresh.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (comments: string, amountStr: string) => {
    if (!approveTarget) return;
    const permittedAmount = amountStr ? parseInt(amountStr) : undefined;
    try {
      await api.approveWorkflow(approveTarget.procurementWorkflow!.id, 'approve', comments || undefined, permittedAmount);
      setToast({ message: `Purchase request for "${approveTarget.itemName}" has been approved.`, type: 'success' });
      setApproveTarget(null);
      load();
    } catch (err: any) {
      setToast({ message: `Approval failed: ${err.message}`, type: 'error' });
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await api.approveWorkflow(rejectTarget.procurementWorkflow!.id, 'reject', reason);
      setToast({ message: `Purchase request for "${rejectTarget.itemName}" has been rejected.`, type: 'warning' });
      setRejectTarget(null);
      load();
    } catch (err: any) {
      setToast({ message: `Rejection failed: ${err.message}`, type: 'error' });
    }
  };

  const fullName = (u: WorkflowRequest['requester']) =>
    u ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`.trim() : 'N/A';

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {approveTarget && (
        <TwoFieldDialog
          title={`Approve: "${approveTarget.itemName}"`}
          field1Label="Comments (Optional)"
          field1Placeholder="Add any notes or conditions for this approval..."
          field2Label="Adjust Permitted Amount (Optional)"
          field2Placeholder={`AA approved: ${approveTarget.procurementWorkflow?.permittedAmount ?? approveTarget.quantity}. Enter new amount to override.`}
          field2Type="number"
          confirmLabel="Approve Purchase"
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
        />
      )}

      {rejectTarget && (
        <InputDialog
          title={`Reject: "${rejectTarget.itemName}"`}
          label="Rejection Reason"
          placeholder="Please provide a clear reason for rejection..."
          required
          multiline
          confirmLabel="Reject Request"
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="space-y-6">
        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">VP Approvals</h1>
              {/* Short Horizontal Accent Line */}
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
              <p className="text-sm text-gray-600">Review and approve procurement requests pending Vice President sign-off</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={items.length > 0 ? 'warning' : 'success'}>
            {loading ? '…' : `${items.length} pending`}
          </Badge>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Item', 'Qty', 'Permitted Amount (AA)', 'Requested By', 'Work Unit', 'Purpose', 'Request Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No requests pending VP approval</td></tr>
                ) : items.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{req.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {req.procurementWorkflow?.permittedAmount != null
                        ? `ETB ${Number(req.procurementWorkflow.permittedAmount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fullName(req.requester)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.workUnit}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{req.purpose}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setApproveTarget(req)}>{t('action_approve')} Purchase</Button>
                        <Button size="sm" variant="danger" onClick={() => setRejectTarget(req)}>{t('action_reject')}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
