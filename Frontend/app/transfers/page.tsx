'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Transfer } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { getUser } from '@/lib/auth';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      const data = await api.getTransfers() as Transfer[];
      setTransfers(data);
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const signature = prompt('Please enter your full name to sign the transfer approval:');
    if (!signature) return;

    try {
      await api.approveTransfer(id, { recipientSignature: signature });
      alert('Transfer approved successfully!');
      loadTransfers();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
      alert('Failed to approve transfer');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.rejectTransfer(id, reason);
      loadTransfers();
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    }
  };

  const handleComplete = async (id: string) => {
    const signature = prompt('Please enter your full name to sign the transfer completion:');
    if (!signature) return;

    try {
      await api.completeTransfer(id, { propertyOfficerSignature: signature });
      alert('Transfer completed successfully!');
      loadTransfers();
    } catch (error) {
      console.error('Failed to complete transfer:', error);
      alert('Failed to complete transfer');
    }
  };

  const canApprove = (transfer: Transfer) => {
    // Only the recipient (toUser) can approve the transfer
    return transfer.toUserId === user?.id && transfer.status === 'pending';
  };

  const canComplete = (transfer: Transfer) => {
    // Only property officer can complete approved transfers
    return user?.role === 'property_officer' && transfer.status === 'approved';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asset Transfers</h1>
            <p className="text-gray-600">Manage asset transfer requests</p>
          </div>
          <Button onClick={() => window.location.href = '/transfers/new'}>
            New Transfer
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : transfers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableHead>Asset</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.asset?.name || transfer.assetName || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.fromUser ? `${transfer.fromUser.firstName} ${transfer.fromUser.lastName}` : transfer.fromUserName || 'Storage'}</p>
                        <p className="text-xs text-gray-500">{transfer.fromWorkUnit || transfer.fromUser?.workUnit || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.toUser ? `${transfer.toUser.firstName} ${transfer.toUser.lastName}` : transfer.toUserName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{transfer.toWorkUnit || transfer.toUser?.workUnit || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transfer.requestDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transfer.status)}`}>
                        {transfer.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(`/transfers/${transfer.id}/print`, '_blank')}
                        >
                          Print
                        </Button>
                        {canApprove(transfer) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(transfer.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(transfer.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {canComplete(transfer) && (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(transfer.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No transfer requests found
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
