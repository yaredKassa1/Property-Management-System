'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [items, setItems] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

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
      console.error('Failed to load VP approval requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (req: WorkflowRequest) => {
    const comments = prompt('Approval comments (optional):') ?? '';
    try {
      await api.approveWorkflow(req.procurementWorkflow!.id, 'approve', comments || undefined);
      setSuccessMsg(`"${req.itemName}" approved.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      load();
    } catch (err: any) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleReject = async (req: WorkflowRequest) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.approveWorkflow(req.procurementWorkflow!.id, 'reject', reason);
      setSuccessMsg(`"${req.itemName}" rejected.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      load();
    } catch (err: any) {
      alert('Failed to reject: ' + err.message);
    }
  };

  const fullName = (u: WorkflowRequest['requester']) =>
    u ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`.trim() : 'N/A';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">VP Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve procurement requests pending Vice President sign-off</p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-2 text-sm">
            ✅ {successMsg}
          </div>
        )}

        {/* Summary badge */}
        <div className="flex items-center gap-3">
          <Badge variant={items.length > 0 ? 'warning' : 'success'}>
            {loading ? '…' : `${items.length} pending`}
          </Badge>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Item', 'Qty', 'Permitted Amount (AA)', 'Requested By', 'Work Unit', 'Purpose', 'Request Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No requests pending VP approval
                    </td>
                  </tr>
                ) : items.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{req.itemName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {req.procurementWorkflow?.permittedAmount != null
                        ? `ETB ${Number(req.procurementWorkflow.permittedAmount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fullName(req.requester)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.workUnit}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{req.purpose}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(req)}>
                          Approve Purchase
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(req)}>
                          Reject
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
    </DashboardLayout>
  );
}
