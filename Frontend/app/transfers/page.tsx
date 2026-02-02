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
    try {
      await api.approveTransfer(id);
      loadTransfers();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
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

  const canApprove = user?.role === 'vice_president' || user?.role === 'approval_authority';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Transfers</h1>
          <p className="text-gray-600">Manage asset transfer requests</p>
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
                    <TableCell className="font-medium">{transfer.assetName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.fromUserName}</p>
                        <p className="text-xs text-gray-500">{transfer.fromDepartment}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.toUserName}</p>
                        <p className="text-xs text-gray-500">{transfer.toDepartment}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transfer.requestDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transfer.status)}`}>
                        {transfer.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {transfer.status === 'pending' && canApprove && (
                        <div className="flex space-x-2">
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
                        </div>
                      )}
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
