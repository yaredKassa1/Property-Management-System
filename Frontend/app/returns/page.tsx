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
    if (!assetId) { setError('Please select an asset.'); return; }
    if (!reason.trim()) { setError('Please provide a reason for return.'); return; }
    if (reason.trim().length < 10) { setError('Reason must be at least 10 characters.'); return; }

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
            Process Return
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={errorBoxStyle}>{error}</div>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle}>Asset to Return *</label>
            <select
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              style={{ ...inputStyle, color: assetId ? '#1a3a6b' : '#7a90b8' }}
              required
              disabled={loadingAssets}
            >
              <option value="">
                {loadingAssets ? 'Loading your assets...' : '— Select an asset —'}
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
                No assets are currently assigned to you.
              </p>
            )}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Reason for Return *</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe why you are returning this asset..."
              rows={4}
              style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
              required
            />
            <p style={{ fontSize: '11.5px', color: reason.trim().length < 10 ? '#c0392b' : '#7a90b8', marginTop: '4px' }}>
              {reason.trim().length}/10 minimum characters
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || loadingAssets || assignedAssets.length === 0}>
              {submitting ? 'Submitting...' : 'Submit Return'}
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
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) { setError('Please provide a reason for rejection.'); return; }

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
            Reject Return
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && <div style={errorBoxStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label style={labelStyle}>Reason for Rejection *</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Explain why this return is being rejected..."
              rows={4}
              style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? 'Rejecting...' : 'Confirm Reject'}
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
  const assetLabel = record.asset
    ? `${record.asset.assetId} — ${record.asset.name}`
    : record.assetId;

  const returnerLabel = record.returner
    ? `${record.returner.firstName} ${record.returner.lastName}${record.returner.workUnit ? ` (${record.returner.workUnit})` : ''}`
    : record.returnedBy;

  const statusLabel = isOfficer
    ? ({ pending: 'Pending', received: 'Accepted — Awaiting Asset', completed: 'Completed', rejected: 'Rejected' }[record.status] ?? record.status)
    : ({ pending: 'Pending', received: 'Accepted — Bring Asset to Office', completed: 'Completed', rejected: 'Rejected' }[record.status] ?? record.status);

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '500px' }}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a3a6b' }}>
            Return Details
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <DetailRow label="Asset" value={assetLabel} />
          <DetailRow label="Returned By" value={returnerLabel} />
          <DetailRow label="Return Date" value={formatDate(record.returnDate)} />
          <DetailRow
            label="Status"
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
          <DetailRow label="Reason" value={record.reason} />
          {record.returnCondition && (
            <DetailRow label="Condition" value={record.returnCondition} />
          )}
          {record.inspectionNotes && (
            <DetailRow label="Notes" value={record.inspectionNotes} />
          )}
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
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
        pending: 'Pending',
        received: 'Accepted — Awaiting Asset',
        completed: 'Completed',
        rejected: 'Rejected',
      };
      return officerLabels[status] ?? status.replace(/_/g, ' ');
    } else {
      // Staff sees action-oriented labels
      const staffLabels: Record<string, string> = {
        pending: 'Pending',
        received: 'Accepted — Bring Asset to Office',
        completed: 'Completed',
        rejected: 'Rejected',
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
      <div style={{ padding: '28px 32px', background: '#f0f4fb', minHeight: '100%' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '8px' }}>
            ASSET MANAGEMENT
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b', margin: '0 0 6px 0' }}>
                Asset Returns
              </h1>
              <p style={{ fontSize: '13.5px', color: '#7a90b8', margin: 0 }}>
                Manage asset return requests and approvals
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowProcessModal(true)}>
              + Process Return
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          <Card>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '6px' }}>
              Total Returns
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b' }}>{stats.total}</div>
          </Card>
          <Card>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '6px' }}>
              Pending
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b' }}>{stats.pending}</div>
          </Card>
          <Card>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '6px' }}>
              Completed
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b' }}>{stats.completed}</div>
          </Card>
          <Card>
            <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '6px' }}>
              Rejected
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b' }}>{stats.rejected}</div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Input
            type="text"
            placeholder="Search by asset ID, name, or returned by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              minWidth: '180px',
              padding: '8px 12px',
              border: '1px solid #dce6f5',
              borderRadius: '6px',
              fontSize: '13.5px',
              color: '#1a3a6b',
              background: '#f8faff',
              cursor: 'pointer',
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '3px solid #dce6f5', borderTopColor: '#1a3a6b',
                animation: 'spin 0.8s linear infinite', margin: '0 auto',
              }} />
              <p style={{ marginTop: '16px', fontSize: '13px', color: '#7a90b8' }}>Loading returns...</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableHead>ASSET ID</TableHead>
                <TableHead>ASSET NAME</TableHead>
                <TableHead>RETURNED BY</TableHead>
                <TableHead>RETURN DATE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>CONDITION</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableHeader>
              <TableBody>
                {filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-12 col-span-7">
                      No return requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map((r) => {
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
                              {r.returnCondition}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-500 italic">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {/* View — always visible */}
                            <Button size="sm" variant="ghost" onClick={() => setViewTarget(r)}>
                              View
                            </Button>

                            {/* Accept — officer only, status: pending */}
                            {isOfficer && r.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={actionLoading === r.id + '_receive'}
                                onClick={() => handleReceive(r.id)}
                              >
                                {actionLoading === r.id + '_receive' ? '...' : 'Accept'}
                              </Button>
                            )}

                            {/* Reject on pending — officer only */}
                            {isOfficer && r.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setRejectTarget(r.id)}
                              >
                                Reject
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
                                  {actionLoading === r.id + '_approve' ? '...' : 'Confirm Received'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setRejectTarget(r.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}
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
