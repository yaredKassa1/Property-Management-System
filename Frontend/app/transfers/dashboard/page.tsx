'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Transfer {
  id: string;
  status: string;
  asset?: { assetId: string; name: string };
  fromUser?: { firstName: string; lastName: string };
  toUser?: { firstName: string; lastName: string };
  requestDate: string;
}

export default function TransferDashboard() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/transfers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch transfers:', response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const transferList = Array.isArray(data.data) ? data.data : [];
      
      setTransfers(transferList);
      
      // Calculate stats
      setStats({
        total: transferList.length,
        pending: transferList.filter((t: Transfer) => t.status === 'pending').length,
        approved: transferList.filter((t: Transfer) => t.status === 'approved').length,
        completed: transferList.filter((t: Transfer) => t.status === 'completed').length,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setTransfers([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      approved: '✅',
      completed: '🎉',
      rejected: '❌',
      cancelled: '🚫',
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transfers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfer Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and track all asset transfers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transfers</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="text-4xl">🎉</div>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Transfer Workflow</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-2xl mb-2">
                ⏳
              </div>
              <p className="text-sm font-medium text-gray-900">Pending</p>
              <p className="text-xs text-gray-500">Awaiting recipient</p>
            </div>
            <div className="flex-1 h-1 bg-gray-300"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl mb-2">
                ✅
              </div>
              <p className="text-sm font-medium text-gray-900">Approved</p>
              <p className="text-xs text-gray-500">Awaiting property officer</p>
            </div>
            <div className="flex-1 h-1 bg-gray-300"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl mb-2">
                🎉
              </div>
              <p className="text-sm font-medium text-gray-900">Completed</p>
              <p className="text-xs text-gray-500">Transfer finalized</p>
            </div>
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Transfers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.slice(0, 10).map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.asset?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.asset?.assetId || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transfer.fromUser ? `${transfer.fromUser.firstName} ${transfer.fromUser.lastName}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transfer.toUser ? `${transfer.toUser.firstName} ${transfer.toUser.lastName}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                        {getStatusIcon(transfer.status)} {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transfer.requestDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
