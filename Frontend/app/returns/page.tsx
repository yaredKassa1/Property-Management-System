'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import { useLanguage } from '@/lib/contexts';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  assetId: string;
  name: string;
  serialNumber?: string;
  category?: string;
}

interface ReturnRecord {
  id: string;
  assetId: string;
  asset?: Asset;
  returnedBy: string;
  returner?: { id: string; firstName: string; lastName: string; workUnit?: string };
  returnDate: string;
  status: string;
  returnCondition?: string;
  reason: string;
  inspectionNotes?: string;
}

// ─── Submit Return Modal ──────────────────────────────────────────────────────
function ProcessReturnModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetId, setAssetId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the logged-in user's ID and load only assets assigned to them
    const currentUser = getUser();
    if (!currentUser?.id) {
      setLoadingAssets(false);
      return;
    }

    api
      .getAssets({ status: 'assigned', assignedTo: currentUser.id, limit: '100' } as any)
      .then((data: any) => {
        // Backend returns paginated: { rows, count } or plain array
        const list: Asset[] = Array.isArray(data) ? data : (data?.rows ?? []);
        setAssignedAssets(list);
      })
      .catch(() => setAssignedAssets([]))
      .finally(() => setLoadingAssets(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) { setError(t('error_select_asset')); return; }
    if (!reason.trim()) { setError(t('error_provide_reason')); return; }
    if (reason.trim().length < 10) { setError(t('error_min_10_chars')); return; }

    setSubmitting(true);
    setError('');
    try {
      await api.createReturn({ assetId, reason: reason.trim() });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a3a6b' }}>
            {t('process_return').replace('+ ', '')}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={errorBoxStyle}>{error}</div>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle}>{t('asset_to_return')} *</label>
            <select
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              style={{ ...inputStyle, color: assetId ? '#1a3a6b' : '#7a90b8' }}
              required
              disabled={loadingAssets}
            >
              <option value="">
                {loadingAssets ? t('loading_assets_placeholder') : t('select_asset_placeholder')}
              </option>
              {assignedAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetId} — {a.name}
                  {a.serialNumber ? ` (S/N: ${a.serialNumber})` : ''}
                </option>
              ))}
            </select>
            {!loadingAssets && assignedAssets.length === 0 && (
              <p style={{ fontSize: '12px', color: '#7a90b8', marginTop: '6px' }}>
                {t('no_assets_assigned')}
              </p>
            )}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t('reason_for_return')} *</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('reason_placeholder')}
              rows={4}
              style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
              required
            />
            <p style={{ fontSize: '11.5px', color: reason.trim().length < 10 ? '#c0392b' : '#7a90b8', marginTop: '4px' }}>
              {t('min_characters_count').replace('{count}', reason.trim().length.toString())}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || loadingAssets || assignedAssets.length === 0}>
              {submitting ? t('submitting') : t('submit_return')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────
function RejectModal({
  returnId,
  onClose,
  onSuccess,
}: {
  returnId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) { setError(t('error_provide_reason')); return; }

    setSubmitting(true);
    setError('');
    try {
      await api.rejectReturn(returnId, notes);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject return.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '440px' }}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#c0392b' }}>
            {t('reject_return')}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && <div style={errorBoxStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label style={labelStyle}>{t('reason_for_rejection')} *</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('rejection_placeholder')}
              rows={4}
              style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? t('rejecting') : t('confirm_reject')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({
  record,
  onClose,
  isOfficer,
}: {
  record: ReturnRecord;
  onClose: () => void;
  isOfficer: boolean;
}) {
  const { t } = useLanguage();
  const assetLabel = record.asset
    ? `${record.asset.assetId} — ${record.asset.name}`
    : record.assetId;

  const returnerLabel = record.returner
    ? `${record.returner.firstName} ${record.returner.lastName}${record.returner.workUnit ? ` (${record.returner.workUnit})` : ''}`
    : record.returnedBy;

  const statusLabel = isOfficer
    ? ({ 
        pending: t('status_pending_officer'), 
        received: t('status_received_officer'), 
        completed: t('status_completed_officer'), 
        rejected: t('status_rejected_officer') 
      }[record.status] ?? record.status)
    : ({ 
        pending: t('status_pending_staff'), 
        received: t('status_received_staff'), 
        completed: t('status_completed_staff'), 
        rejected: t('status_rejected_staff') 
      }[record.status] ?? record.status);

  const conditionLabel = record.returnCondition 
    ? ({
        excellent: t('condition_excellent'),
        good: t('condition_good'),
        fair: t('condition_fair'),
        poor: t('condition_poor')
      }[record.returnCondition] ?? record.returnCondition)
    : null;

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '500px' }}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a3a6b' }}>
            {t('return_details')}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <DetailRow label={t('asset')} value={assetLabel} />
          <DetailRow label={t('returned_by')} value={returnerLabel} />
          <DetailRow label={t('return_date')} value={formatDate(record.returnDate)} />
          <DetailRow
            label={t('status')}
            value={
              <Badge variant={
                record.status === 'completed' ? 'success' :
                record.status === 'pending' ? 'warning' :
                record.status === 'received' ? 'info' :
                record.status === 'rejected' ? 'danger' : 'default'
              }>
                {statusLabel}
              </Badge>
            }
          />
          <DetailRow label={t('reason')} value={record.reason} />
          {conditionLabel && (
            <DetailRow label={t('condition')} value={conditionLabel} />
          )}
          {record.inspectionNotes && (
            <DetailRow label={t('notes')} value={record.inspectionNotes} />
          )}
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>{t('close')}</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <span style={{ minWidth: '120px', fontSize: '12px', color: '#7a90b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '2px' }}>
        {label}
      </span>
      <span style={{ fontSize: '13.5px', color: '#1a3a6b', flex: 1 }}>{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReturnsPage() {
  const { t } = useLanguage();
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [viewTarget, setViewTarget] = useState<ReturnRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const user = getUser();
  const isOfficer = user?.role === 'property_officer' || user?.role === 'administrator';

  // Status label shown depends on who is viewing
  const getStatusLabel = (status: string) => {
    if (isOfficer) {
      // Officer sees technical workflow labels
      const officerLabels: Record<string, string> = {
        pending: t('status_pending_officer'),
        received: t('status_received_officer'),
        completed: t('status_completed_officer'),
        rejected: t('status_rejected_officer'),
      };
      return officerLabels[status] ?? status.replace(/_/g, ' ');
    } else {
      // Staff sees action-oriented labels
      const staffLabels: Record<string, string> = {
        pending: t('status_pending_staff'),
        received: t('status_received_staff'),
        completed: t('status_completed_staff'),
        rejected: t('status_rejected_staff'),
      };
      return staffLabels[status] ?? status.replace(/_/g, ' ');
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const data = await api.getReturns() as any;
      const list: ReturnRecord[] = Array.isArray(data) ? data : data?.rows ?? [];
      setReturns(list);
    } catch (error) {
      console.error('Failed to load returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (id: string) => {
    setActionLoading(id + '_receive');
    try {
      await api.receiveReturn(id);
      await loadReturns();
    } catch (err: any) {
      alert(err.message || 'Failed to receive return.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve');
    try {
      await api.approveReturn(id);
      await loadReturns();
    } catch (err: any) {
      alert(err.message || 'Failed to approve return.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReturns = returns.filter(r => {
    const assetId = r.asset?.assetId ?? r.assetId ?? '';
    const assetName = r.asset?.name ?? '';
    const returnerName = r.returner
      ? `${r.returner.firstName} ${r.returner.lastName}`
      : r.returnedBy ?? '';

    const matchesSearch =
      !searchTerm ||
      assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending' || r.status === 'received').length,
    completed: returns.filter(r => r.status === 'completed').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Professional Header Card with Short Accent Line */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Title with Short Accent Line */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('asset_returns')}</h1>
                {/* Short Horizontal Accent Line */}
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
                <p className="text-sm text-gray-600">{t('manage_return_requests')}</p>
              </div>
              
              {/* Action Button */}
              <Button variant="primary" onClick={() => setShowProcessModal(true)}>
                {t('process_return')}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('total_returns')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentCheckIcon className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('completed')}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('rejected')}</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-7 h-7 text-red-600" />
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
              <h3 className="text-sm font-semibold text-gray-700">{t('filter')} {t('asset_returns')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('search_returns')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9FE8] focus:border-[#1E9FE8] bg-white text-gray-900"
              >
                <option value="">{t('all_status_filter')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="received">{t('received')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="rejected">{t('rejected')}</option>
              </select>

              {(searchTerm || statusFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  variant="outline"
                  className="flex items-center justify-center gap-2 md:col-span-3"
                >
                  <XMarkIcon className="w-4 h-4" />
                  {t('clear_filters')}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Returns Table */}
        <Card title={t('return_requests_list')} className="border border-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="text-gray-600 mt-4">{t('loading_returns')}</p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 font-medium">{t('no_returns_found')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableHead>{t('asset_id_col')}</TableHead>
                <TableHead>{t('asset_name_col')}</TableHead>
                <TableHead>{t('returned_by_col')}</TableHead>
                <TableHead>{t('return_date_col')}</TableHead>
                <TableHead>{t('status_col')}</TableHead>
                <TableHead>{t('condition_col')}</TableHead>
                <TableHead>{t('actions_col')}</TableHead>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((r) => {
                  const assetIdLabel = r.asset?.assetId ?? r.assetId;
                  const assetName = r.asset?.name ?? '—';
                  const returnerLabel = r.returner
                    ? `${r.returner.firstName} ${r.returner.lastName}`
                    : r.returnedBy;

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">
                        {assetIdLabel}
                      </TableCell>
                      <TableCell className="font-medium">{assetName}</TableCell>
                      <TableCell>
                        <div>{returnerLabel}</div>
                        {r.returner?.workUnit && (
                          <div className="text-xs text-gray-500">{r.returner.workUnit}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(r.returnDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          r.status === 'completed' ? 'success' :
                          r.status === 'pending' ? 'warning' :
                          r.status === 'received' ? 'info' :
                          r.status === 'rejected' ? 'danger' : 'default'
                        }>
                          {getStatusLabel(r.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.returnCondition ? (
                          <Badge variant={
                            r.returnCondition === 'excellent' || r.returnCondition === 'good' ? 'success' :
                            r.returnCondition === 'fair' ? 'warning' : 'danger'
                          }>
                            {({
                              excellent: t('condition_excellent'),
                              good: t('condition_good'),
                              fair: t('condition_fair'),
                              poor: t('condition_poor')
                            }[r.returnCondition] ?? r.returnCondition)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-500 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {/* View — always visible */}
                          <Button size="sm" variant="ghost" onClick={() => setViewTarget(r)}>
                            {t('view')}
                          </Button>

                          {/* Accept — officer only, status: pending */}
                          {isOfficer && r.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={actionLoading === r.id + '_receive'}
                              onClick={() => handleReceive(r.id)}
                            >
                              {actionLoading === r.id + '_receive' ? '...' : t('accept')}
                            </Button>
                          )}

                          {/* Reject on pending — officer only */}
                          {isOfficer && r.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setRejectTarget(r.id)}
                            >
                              {t('reject')}
                            </Button>
                          )}

                          {/* Confirm Received / Reject — officer only, status: received */}
                          {isOfficer && r.status === 'received' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={actionLoading === r.id + '_approve'}
                                onClick={() => handleApprove(r.id)}
                              >
                                {actionLoading === r.id + '_approve' ? '...' : t('confirm_received')}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setRejectTarget(r.id)}
                              >
                                {t('reject')}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Modals */}
      {showProcessModal && (
        <ProcessReturnModal
          onClose={() => setShowProcessModal(false)}
          onSuccess={loadReturns}
        />
      )}

      {rejectTarget && (
        <RejectModal
          returnId={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={loadReturns}
        />
      )}

      {viewTarget && (
        <ViewModal
          record={viewTarget}
          onClose={() => setViewTarget(null)}
          isOfficer={isOfficer}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(10, 20, 50, 0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
  padding: '16px',
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '520px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
  overflow: 'hidden',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 24px',
  borderBottom: '1px solid #eef2fa',
  background: '#f8faff',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none',
  fontSize: '16px', color: '#7a90b8',
  cursor: 'pointer', lineHeight: 1,
  padding: '2px 6px', borderRadius: '4px',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '18px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#4a5a7a',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '13.5px',
  border: '1px solid #dce6f5',
  borderRadius: '6px',
  color: '#1a3a6b',
  background: '#f8faff',
  outline: 'none',
  boxSizing: 'border-box',
};

const errorBoxStyle: React.CSSProperties = {
  background: '#fdf2f2',
  border: '1px solid #f0b8b8',
  color: '#c0392b',
  borderRadius: '6px',
  padding: '10px 14px',
  fontSize: '13px',
  marginBottom: '16px',
};
