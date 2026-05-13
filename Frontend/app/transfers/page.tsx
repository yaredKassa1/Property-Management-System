'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Transfer } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { getUser } from '@/lib/auth';

const STATUS_CFG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  pending:    { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   icon: '⏳', label: 'Pending' },
  approved:   { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: '✅', label: 'Approved' },
  completed:  { color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: '🎉', label: 'Completed' },
  rejected:   { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: '❌', label: 'Rejected' },
  cancelled:  { color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',     icon: '🚫', label: 'Cancelled' },
  in_transit: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: '🚚', label: 'In Transit' },
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const user = getUser();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data: any = await api.getTransfers();
      setTransfers(Array.isArray(data) ? data : data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    const sig = prompt('Enter your full name to sign approval:');
    if (!sig) return;
    try { await api.approveTransfer(id, { recipientSignature: sig }); load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (min 10 chars):');
    if (!reason || reason.length < 10) { alert('Reason must be at least 10 characters'); return; }
    try { await api.rejectTransfer(id, reason); load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleComplete = async (id: string) => {
    const sig = prompt('Enter your full name to sign completion:');
    if (!sig) return;
    try { await api.completeTransfer(id, { propertyOfficerSignature: sig }); load(); }
    catch (e: any) { alert(e.message); }
  };

  const canApprove  = (t: Transfer) => t.toUserId === user?.id && t.status === 'pending';
  const canReject   = (t: Transfer) => (t.toUserId === user?.id || ['approval_authority','vice_president','administrator'].includes(user?.role||'')) && t.status === 'pending';
  const canComplete = (t: Transfer) => user?.role === 'property_officer' && t.status === 'approved';

  const stats = {
    total: transfers.length,
    pending:   transfers.filter(t => t.status === 'pending').length,
    approved:  transfers.filter(t => t.status === 'approved').length,
    completed: transfers.filter(t => t.status === 'completed').length,
    rejected:  transfers.filter(t => t.status === 'rejected').length,
  };

  const filtered = transfers.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (t.asset?.name || '').toLowerCase().includes(q) ||
      ((t.fromUser as any)?.firstName || '').toLowerCase().includes(q) ||
      ((t.toUser as any)?.firstName || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asset Transfers</h1>
            <p className="text-gray-500 text-sm mt-1">Track and manage all asset transfer requests</p>
          </div>
          <Button onClick={() => window.location.href = '/transfers/new'}>+ New Transfer</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total',     value: stats.total,     grad: 'from-slate-500 to-slate-700',   icon: '📋' },
            { label: 'Pending',   value: stats.pending,   grad: 'from-amber-400 to-amber-600',   icon: '⏳' },
            { label: 'Approved',  value: stats.approved,  grad: 'from-blue-400 to-blue-600',     icon: '✅' },
            { label: 'Completed', value: stats.completed, grad: 'from-green-400 to-green-600',   icon: '🎉' },
            { label: 'Rejected',  value: stats.rejected,  grad: 'from-red-400 to-red-600',       icon: '❌' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-xl p-4 text-white shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-80">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <span className="text-3xl opacity-80">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Transfer Workflow</p>
          <div className="flex items-center">
            {[
              { icon: '📝', label: 'Initiated',  sub: 'Staff requests' },
              { icon: '⏳', label: 'Pending',    sub: 'Recipient reviews' },
              { icon: '✅', label: 'Approved',   sub: 'Officer processes' },
              { icon: '🎉', label: 'Completed',  sub: 'Asset transferred' },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-lg">{step.icon}</div>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.sub}</p>
                </div>
                {i < arr.length - 1 && <div className="h-0.5 flex-1 bg-indigo-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search by asset or staff name..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-900" />
          <div className="flex gap-2 flex-wrap">
            {['all','pending','approved','completed','rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                }`}>
                {s === 'all' ? 'All' : STATUS_CFG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🔄</p>
              <p className="font-medium">No transfers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Asset','From','To','Date','Status','Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(t => {
                    const cfg = STATUS_CFG[t.status] || STATUS_CFG.pending;
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-sm text-gray-900">{t.asset?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400 font-mono">{(t.asset as any)?.assetId || ''}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-800">{t.fromUser ? `${(t.fromUser as any).firstName} ${(t.fromUser as any).lastName}` : '—'}</p>
                          <p className="text-xs text-gray-400">{(t.fromUser as any)?.workUnit || ''}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-800">{t.toUser ? `${(t.toUser as any).firstName} ${(t.toUser as any).lastName}` : '—'}</p>
                          <p className="text-xs text-gray-400">{(t.toUser as any)?.workUnit || ''}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(t.requestDate)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button onClick={() => window.open(`/transfers/${t.id}/print`, '_blank')}
                              className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                              🖨️ Print
                            </button>
                            {canApprove(t) && (
                              <button onClick={() => handleApprove(t.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 whitespace-nowrap">
                                ✅ Approve
                              </button>
                            )}
                            {canReject(t) && (
                              <button onClick={() => handleReject(t.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 whitespace-nowrap">
                                ❌ Reject
                              </button>
                            )}
                            {canComplete(t) && (
                              <button onClick={() => handleComplete(t.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap">
                                🎉 Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
