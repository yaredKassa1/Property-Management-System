'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Toast, ToastType } from '@/components/ui/Toast';
import { InputDialog } from '@/components/ui/Dialog';
import { api } from '@/lib/api';
import { Transfer } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import { useLanguage } from '@/lib/contexts';
import {
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  XCircleIcon,
  NoSymbolIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

const STATUS_CFG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending:    { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   icon: ClockIcon, label: 'pending' },
  approved:   { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: CheckCircleIcon, label: 'approved' },
  completed:  { color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: SparklesIcon, label: 'completed' },
  rejected:   { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircleIcon, label: 'rejected' },
  cancelled:  { color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',     icon: NoSymbolIcon, label: 'cancelled' },
  in_transit: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: TruckIcon, label: 'in_transit' },
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<string | null>(null);
  const { t } = useLanguage();
  const user = getUser();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data: any = await api.getTransfers();
      setTransfers(Array.isArray(data) ? data : data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleApprove = async (sig: string) => {
    if (!approveTarget) return;
    try {
      await api.approveTransfer(approveTarget, { recipientSignature: sig });
      setToast({ message: t('transfer_approved_success'), type: 'success' });
      setApproveTarget(null);
      load();
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await api.rejectTransfer(rejectTarget, reason);
      setToast({ message: t('transfer_rejected'), type: 'warning' });
      setRejectTarget(null);
      load();
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleComplete = async (sig: string) => {
    if (!completeTarget) return;
    try {
      await api.completeTransfer(completeTarget, { propertyOfficerSignature: sig });
      setToast({ message: t('transfer_completed'), type: 'success' });
      setCompleteTarget(null);
      load();
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {approveTarget && (
        <InputDialog
          title={t('sign_transfer_approval')}
          label={t('your_full_name_signature')}
          placeholder={t('enter_full_name_approval')}
          required
          confirmLabel={t('approve_transfer')}
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
        />
      )}

      {rejectTarget && (
        <InputDialog
          title={t('reject_transfer')}
          label={t('rejection_reason_min')}
          placeholder={t('provide_rejection_reason')}
          required
          multiline
          confirmLabel={t('reject_transfer')}
          onConfirm={(reason) => {
            if (reason.length < 10) {
              setToast({ message: t('rejection_reason_10_chars'), type: 'warning' });
              return;
            }
            handleReject(reason);
          }}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {completeTarget && (
        <InputDialog
          title={t('sign_transfer_completion')}
          label={t('property_officer_signature')}
          placeholder={t('enter_full_name_completion')}
          required
          confirmLabel={t('mark_as_completed')}
          onConfirm={handleComplete}
          onCancel={() => setCompleteTarget(null)}
        />
      )}

      <div className="space-y-6 pb-10">

        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Title with Short Accent Line */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('asset_transfers')}</h1>
                {/* Short Horizontal Accent Line */}
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
                <p className="text-sm text-gray-600">{t('track_manage_transfers')}</p>
              </div>
              
              {/* Action Button */}
              <Button onClick={() => window.location.href = '/transfers/new'}>{t('new_transfer')}</Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: t('total'),     value: stats.total,     grad: 'from-slate-500 to-slate-700',   icon: ClipboardDocumentListIcon },
            { label: t('pending'),   value: stats.pending,   grad: 'from-amber-400 to-amber-600',   icon: ClockIcon },
            { label: t('approved'),  value: stats.approved,  grad: 'from-blue-400 to-blue-600',     icon: CheckCircleIcon },
            { label: t('completed'), value: stats.completed, grad: 'from-green-400 to-green-600',   icon: SparklesIcon },
            { label: t('rejected'),  value: stats.rejected,  grad: 'from-red-400 to-red-600',       icon: XCircleIcon },
          ].map(s => {
            const IconComponent = s.icon;
            return (
              <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-xl p-4 text-white shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-80">{s.label}</p>
                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                  </div>
                  <IconComponent className="w-8 h-8 opacity-80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('transfer_workflow')}</p>
          <div className="flex items-center">
            {[
              { icon: PencilSquareIcon, label: t('initiated'),  sub: t('staff_requests') },
              { icon: ClockIcon, label: t('pending'),    sub: t('recipient_reviews') },
              { icon: CheckCircleIcon, label: t('approved'),   sub: t('officer_processes') },
              { icon: SparklesIcon, label: t('completed'),  sub: t('asset_transferred') },
            ].map((step, i, arr) => {
              const IconComponent = step.icon;
              return (
                <div key={step.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-[#5BC0EB] flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-[#1E9FE8]" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-1">{step.label}</p>
                    <p className="text-xs text-gray-400">{step.sub}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-0.5 flex-1 bg-[#5BC0EB] mx-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder={t('search_asset_staff')}
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E9FE8] bg-white text-gray-900" />
          <div className="flex gap-2 flex-wrap">
            {['all','pending','approved','completed','rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === s ? 'bg-[#1E9FE8] text-white border-[#1E9FE8]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#1E9FE8]'
                }`}>
                {s === 'all' ? t('all') : t(STATUS_CFG[s]?.label)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E9FE8]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <TruckIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">{t('no_transfers_found_filters')}</p>
              <p className="text-sm mt-1">{t('try_adjusting_filters')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {[t('asset'),t('from'),t('to_location'),'Timeline',t('status'),t('actions')].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(transfer => {
                    const cfg = STATUS_CFG[transfer.status] || STATUS_CFG.pending;
                    return (
                      <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-sm text-gray-900">{transfer.asset?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400 font-mono">{(transfer.asset as any)?.assetId || ''}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-800">{transfer.fromUser ? `${(transfer.fromUser as any).firstName} ${(transfer.fromUser as any).lastName}` : '—'}</p>
                          <p className="text-xs text-gray-400">{(transfer.fromUser as any)?.workUnit || ''}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-800">{transfer.toUser ? `${(transfer.toUser as any).firstName} ${(transfer.toUser as any).lastName}` : '—'}</p>
                          <p className="text-xs text-gray-400">{(transfer.toUser as any)?.workUnit || ''}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-20">Requested:</span>
                              <span className="text-gray-900 font-medium">{formatDate(transfer.requestDate)}</span>
                            </div>
                            {transfer.approvalDate && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-20">Approved:</span>
                                <span className="text-green-700 font-medium">{formatDate(transfer.approvalDate)}</span>
                              </div>
                            )}
                            {transfer.completionDate && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-20">Completed:</span>
                                <span className="text-blue-700 font-medium">{formatDate(transfer.completionDate)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                            <cfg.icon className="w-3.5 h-3.5" />
                            {t(cfg.label)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button onClick={() => window.open(`/transfers/${transfer.id}/print`, '_blank')}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors">
                              <PrinterIcon className="w-3.5 h-3.5" />
                              {t('print')}
                            </button>
                            {canApprove(transfer) && (
                              <button onClick={() => setApproveTarget(transfer.id)}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 whitespace-nowrap transition-colors">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                {t('approve')}
                              </button>
                            )}
                            {canReject(transfer) && (
                              <button onClick={() => setRejectTarget(transfer.id)}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 whitespace-nowrap transition-colors">
                                <XCircleIcon className="w-3.5 h-3.5" />
                                {t('reject')}
                              </button>
                            )}
                            {canComplete(transfer) && (
                              <button onClick={() => setCompleteTarget(transfer.id)}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#1E9FE8] text-white hover:bg-[#1578B8] whitespace-nowrap transition-colors">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                {t('complete')}
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
