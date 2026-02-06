'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { User } from '@/lib/types';

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
  timestamp: string;
  user?: User;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filter, setFilter] = useState({
    action: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    
    // Only administrators can access this page
    if (user?.role !== 'administrator') {
      setError('Access denied. Administrator privileges required.');
      setLoading(false);
      return;
    }
    
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string> = {};
      if (filter.action) params.action = filter.action;
      if (filter.status) params.status = filter.status;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;
      
      const response: any = await api.getAuditLogs(params);
      const data = Array.isArray(response) ? response : response.data || [];
      setAuditLogs(data);
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchAuditLogs();
  };

  const handleClearFilter = () => {
    setFilter({
      action: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchAuditLogs(), 100);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      success: 'success',
      failure: 'warning',
      error: 'error',
    };
    return colors[status] || 'default';
  };

  const getActionColor = (action: string): string => {
    if (action.includes('LOGIN')) return 'info';
    if (action.includes('CREATE')) return 'success';
    if (action.includes('UPDATE')) return 'warning';
    if (action.includes('DELETE') || action.includes('DEACTIVATE')) return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading audit logs...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && currentUser?.role !== 'administrator') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Monitor system activities and security events</p>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={filter.action}
                  onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN_SUCCESS">Login Success</option>
                  <option value="LOGIN_FAILURE">Login Failure</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="CREATE_USER">Create User</option>
                  <option value="UPDATE_USER">Update User</option>
                  <option value="DEACTIVATE_USER">Deactivate User</option>
                  <option value="DELETE_USER_PERMANENT">Delete User</option>
                  <option value="RESET_PASSWORD">Reset Password</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <Button onClick={handleApplyFilter}>Apply Filters</Button>
              <Button variant="outline" onClick={handleClearFilter}>Clear Filters</Button>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Audit Logs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No audit logs found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user?.fullName || 'System'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.user?.username || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.entityType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View Log Details Modal */}
        {selectedLog && (
          <ViewLogModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// View Log Details Modal Component
function ViewLogModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Audit Log Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Action</label>
                <div className="mt-1">
                  <Badge variant={log.action.includes('LOGIN') ? 'info' : log.action.includes('CREATE') ? 'success' : log.action.includes('DELETE') ? 'error' : 'default'}>
                    {log.action.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={log.status === 'success' ? 'success' : log.status === 'failure' ? 'warning' : 'error'}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Performed By</label>
              <p className="mt-1 text-gray-900">{log.user?.fullName || 'System'}</p>
              <p className="text-sm text-gray-500">@{log.user?.username || 'N/A'} ({log.user?.role || 'N/A'})</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Timestamp</label>
              <p className="mt-1 text-gray-900">{new Date(log.timestamp).toLocaleString()}</p>
            </div>

            {log.entityType && (
              <div>
                <label className="text-sm font-medium text-gray-500">Entity Type</label>
                <p className="mt-1 text-gray-900">{log.entityType}</p>
              </div>
            )}

            {log.entityId && (
              <div>
                <label className="text-sm font-medium text-gray-500">Entity ID</label>
                <p className="mt-1 text-gray-900 font-mono text-xs">{log.entityId}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">IP Address</label>
                <p className="mt-1 text-gray-900">{log.ipAddress || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Log ID</label>
                <p className="mt-1 text-gray-900 font-mono text-xs">{log.id}</p>
              </div>
            </div>

            {log.userAgent && (
              <div>
                <label className="text-sm font-medium text-gray-500">User Agent</label>
                <p className="mt-1 text-gray-900 text-sm break-all">{log.userAgent}</p>
              </div>
            )}

            {log.errorMessage && (
              <div>
                <label className="text-sm font-medium text-gray-500">Error Message</label>
                <p className="mt-1 text-red-600">{log.errorMessage}</p>
              </div>
            )}

            {log.details && (
              <div>
                <label className="text-sm font-medium text-gray-500">Details</label>
                <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
