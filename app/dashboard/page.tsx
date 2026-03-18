'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { api } from '@/lib/api';
import { DashboardStats, UserRole, User } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { getUser } from '@/lib/auth';
import { exportToCSV, exportToJSON, printDashboard } from '@/lib/exportUtils';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [propertyOfficerStats, setPropertyOfficerStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchPropertyOfficerStats = async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const propertyStats = await api.getPropertyOfficerStats(params).catch(() => null);
      setPropertyOfficerStats(propertyStats);
    } catch (err) {
      console.error('Failed to load property officer stats:', err);
    }
  };

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    fetchPropertyOfficerStats({ startDate, endDate });
  };

  const handleDateRangeReset = () => {
    setDateRange(null);
    fetchPropertyOfficerStats();
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!propertyOfficerStats) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `property-officer-dashboard-${timestamp}`;
    
    if (format === 'csv') {
      exportToCSV(propertyOfficerStats, filename);
    } else {
      exportToJSON(propertyOfficerStats, filename);
    }
    
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserRole(user.role);
      setCurrentUser(user);
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch core dashboard stats
        const data = await api.getDashboardStats();
        setStats(data as DashboardStats);

        // If admin, fetch admin-specific stats
        if (user?.role === 'administrator') {
          const [userStatsResponse, auditStatsResponse, securityEventsResponse] = await Promise.all([
            api.getUserStats().catch(() => null),
            api.getAuditLogStats().catch(() => null),
            api.getSecurityEvents({ limit: '5' }).catch(() => [])
          ]);

          setUserStats(userStatsResponse || {
            totalUsers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            roleBreakdown: []
          });

          setAuditStats(auditStatsResponse || {
            totalLogs: 0,
            failedLogins: 0,
            failedActions: 0,
            errorActions: 0,
            topActions: []
          });

          const events = Array.isArray(securityEventsResponse)
            ? securityEventsResponse
            : securityEventsResponse?.data || [];
          setSecurityEvents(events);
        }

        // If property officer, fetch property officer specific stats
        if (user?.role === 'property_officer') {
          fetchPropertyOfficerStats();
        }
      } catch (err: any) {
        console.error('Failed to load dashboard stats:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const roleAccess = useMemo(() => {
    const roleMap: Record<UserRole, {
      allowedCards: (keyof DashboardStats)[];
      quickActions: { label: string; href: string; description: string }[];
      highlights: string[];
    }> = {
      administrator: {
        allowedCards: [],
        quickActions: [
          { label: 'Create User', href: '/users', description: 'Add new system accounts.' },
          { label: 'Audit Logs', href: '/audit-logs', description: 'Review system activity logs.' },
          { label: 'Reset Password', href: '/users', description: 'Manage access and passwords.' },
        ],
        highlights: ['User management', 'Security monitoring', 'System configuration'],
      },
      vice_president: {
        allowedCards: ['totalAssets', 'assignedAssets', 'pendingTransfers', 'pendingReturns'],
        quickActions: [
          { label: 'Review Reports', href: '/reports', description: 'Executive summaries and analytics.' },
          { label: 'Track Transfers', href: '/transfers', description: 'Monitor transfer approvals.' },
        ],
        highlights: ['Executive oversight', 'High-level approvals', 'Reporting access'],
      },
      property_officer: {
        allowedCards: [
          'totalAssets',
          'assignedAssets',
          'availableAssets',
          'underMaintenance',
          'pendingTransfers',
          'pendingReturns',
        ],
        quickActions: [
          { label: 'Register Asset', href: '/assets/new', description: 'Register new fixed assets.' },
          { label: 'Assign Asset', href: '/assignments', description: 'Assign assets to staff.' },
          { label: 'Process Return', href: '/returns', description: 'Record asset returns.' },
        ],
        highlights: ['Asset registration', 'Assignments and returns', 'Operational control'],
      },
      approval_authority: {
        allowedCards: ['pendingTransfers', 'assignedAssets'],
        quickActions: [
          { label: 'Approve Transfers', href: '/transfers', description: 'Review transfer requests.' },
        ],
        highlights: ['Transfer approvals', 'Pending request oversight', 'Decision tracking'],
      },
      purchase_department: {
        allowedCards: ['availableAssets', 'underMaintenance', 'pendingReturns'],
        quickActions: [
          { label: 'Purchase Requests', href: '/requests', description: 'Manage purchase workflows.' },
          { label: 'Asset Inventory', href: '/assets', description: 'Review available assets.' },
        ],
        highlights: ['Procurement readiness', 'Inventory visibility', 'Purchase approvals'],
      },
      quality_assurance: {
        allowedCards: ['underMaintenance', 'pendingReturns', 'availableAssets'],
        quickActions: [
          { label: 'Return Inspections', href: '/returns', description: 'Inspect asset conditions.' },
          { label: 'Asset Status', href: '/assets', description: 'Verify asset condition.' },
        ],
        highlights: ['Quality checks', 'Asset condition tracking', 'Maintenance oversight'],
      },
      staff: {
        allowedCards: ['assignedAssets', 'availableAssets', 'pendingTransfers'],
        quickActions: [
          { label: 'Request Transfer', href: '/transfers', description: 'Submit transfer requests.' },
          { label: 'My Assets', href: '/assets', description: 'Review your assigned assets.' },
        ],
        highlights: ['Personal asset view', 'Transfer requests', 'Request status tracking'],
      },
    };

    return roleMap[userRole];
  }, [userRole]);

  const statCards = useMemo(() => {
    if (!stats) return [];

    const allCards = [
      { key: 'totalAssets', title: 'Total Assets', value: stats.totalAssets, icon: '📦', color: 'bg-blue-500' },
      { key: 'assignedAssets', title: 'Assigned Assets', value: stats.assignedAssets, icon: '👤', color: 'bg-green-500' },
      { key: 'availableAssets', title: 'Available Assets', value: stats.availableAssets, icon: '✅', color: 'bg-purple-500' },
      { key: 'underMaintenance', title: 'Under Maintenance', value: stats.underMaintenance, icon: '🔧', color: 'bg-orange-500' },
      { key: 'pendingTransfers', title: 'Pending Transfers', value: stats.pendingTransfers, icon: '🔄', color: 'bg-yellow-500' },
      { key: 'pendingReturns', title: 'Pending Returns', value: stats.pendingReturns, icon: '↩️', color: 'bg-red-500' },
    ];

    return allCards.filter((card) => roleAccess.allowedCards.includes(card.key as keyof DashboardStats));
  }, [roleAccess.allowedCards, stats]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-lg text-center">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-after: always;
          }
          nav, header, footer, .sidebar {
            display: none !important;
          }
          .dashboard-content {
            margin: 0 !important;
            padding: 20px !important;
          }
          h1, h2, h3 {
            color: #000 !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
        }
        @media screen {
          .print-header {
            display: none;
          }
        }
      `}</style>
      
      <div className="space-y-8 pb-12 dashboard-content">
        {/* Print Header - Only visible when printing */}
        {userRole === 'property_officer' && propertyOfficerStats && (
          <div className="print-header">
            <h1 className="text-2xl font-bold">Property Officer Dashboard Report</h1>
            <p className="text-sm mt-2">Generated on: {new Date().toLocaleString()}</p>
            {dateRange && (
              <p className="text-sm">Date Range: {dateRange.startDate} to {dateRange.endDate}</p>
            )}
          </div>
        )}
        
        <div className="no-print">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back • Overview of property management system
          </p>
        </div>

        {userRole === 'property_officer' && propertyOfficerStats ? (
          <div className="space-y-6">
            {/* Dashboard Controls - Date Range and Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 no-print relative z-50">
              <div className="flex items-center gap-3 relative">
                <DateRangePicker 
                  onApply={handleDateRangeApply}
                  onReset={handleDateRangeReset}
                />
                {dateRange && (
                  <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    📅 {dateRange.startDate} to {dateRange.endDate}
                  </div>
                )}
              </div>

              <div className="relative flex gap-2">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  📤 Export
                </button>
                
                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[999]"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="fixed top-32 right-4 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 z-[1000]">
                      <div className="py-2">
                        <button
                          onClick={() => handleExport('csv')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          📊 Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          📋 Export as JSON
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handlePrint}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          🖨️ Print Dashboard
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Asset Overview Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Inventory Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">Total Assets</p>
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl text-white">
                        📦
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertyOfficerStats.assetOverview?.totalAssets || 0}
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">Available</p>
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl text-white">
                        ✅
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertyOfficerStats.assetOverview?.availableAssets || 0}
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">Assigned</p>
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-xl text-white">
                        👤
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertyOfficerStats.assetOverview?.assignedAssets || 0}
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">Maintenance</p>
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-xl text-white">
                        🔧
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertyOfficerStats.assetOverview?.underMaintenance || 0}
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">Damaged</p>
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-xl text-white">
                        ⚠️
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertyOfficerStats.assetOverview?.damagedAssets || 0}
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">Disposed</p>
                      <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-xl text-white">
                        🗑️
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {propertyOfficerStats.assetOverview?.disposedAssets || 0}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Transfer and Return Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Transfer Management" className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pending Transfers</p>
                      <p className="text-xs text-gray-500 mt-1">Awaiting VP approval</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {propertyOfficerStats.transferStats?.pendingTransfers || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Approved Transfers</p>
                      <p className="text-xs text-gray-500 mt-1">Ready to complete</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {propertyOfficerStats.transferStats?.approvedTransfers || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Completed Today</p>
                      <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {propertyOfficerStats.transferStats?.completedToday || 0}
                    </div>
                  </div>

                  <Link
                    href="/transfers"
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Manage Transfers
                  </Link>
                </div>
              </Card>

              <Card title="Return Management" className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pending Returns</p>
                      <p className="text-xs text-gray-500 mt-1">Need to receive</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {propertyOfficerStats.returnStats?.pendingReturns || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Under Inspection</p>
                      <p className="text-xs text-gray-500 mt-1">Quality check required</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {propertyOfficerStats.returnStats?.underInspection || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Completed Today</p>
                      <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {propertyOfficerStats.returnStats?.completedToday || 0}
                    </div>
                  </div>

                  <Link
                    href="/returns"
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Manage Returns
                  </Link>
                </div>
              </Card>
            </div>

            {/* Pending Actions Summary */}
            <Card title="⚡ Priority Actions" className="border-2 border-indigo-200 bg-indigo-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Transfers to Complete</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.transfersToComplete || 0}
                  </p>
                  <Link href="/transfers?status=approved" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Returns to Receive</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.returnsToReceive || 0}
                  </p>
                  <Link href="/returns?status=pending" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Returns to Inspect</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.returnsToInspect || 0}
                  </p>
                  <Link href="/returns?status=under_inspection" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Assets in Maintenance</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.assetsToMaintain || 0}
                  </p>
                  <Link href="/assets?status=under_maintenance" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>
              </div>
            </Card>

            {/* Asset Breakdown and Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Asset Condition Breakdown" className="border border-gray-200">
                <div className="space-y-3">
                  {propertyOfficerStats.conditionBreakdown?.map((condition: any) => (
                    <div key={condition.condition} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {condition.condition}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{condition.count}</span>
                    </div>
                  ))}
                  {(!propertyOfficerStats.conditionBreakdown || propertyOfficerStats.conditionBreakdown.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </Card>

              <Card title="Asset Category Breakdown" className="border border-gray-200">
                <div className="space-y-3">
                  {propertyOfficerStats.categoryBreakdown?.map((category: any) => (
                    <div key={category.category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.category === 'fixed' ? 'Fixed Assets' : 'Fixed Consumable'}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{category.count}</span>
                    </div>
                  ))}
                  {(!propertyOfficerStats.categoryBreakdown || propertyOfficerStats.categoryBreakdown.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </Card>

              <Card title="Quick Actions" className="border border-gray-200">
                <div className="space-y-3">
                  <Link
                    href="/assets/new"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">Register New Asset</p>
                    <p className="text-xs text-gray-500 mt-1">Add asset to inventory</p>
                  </Link>

                  <Link
                    href="/assignments"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">Assign Asset</p>
                    <p className="text-xs text-gray-500 mt-1">Allocate to staff member</p>
                  </Link>

                  <Link
                    href="/returns"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">Process Returns</p>
                    <p className="text-xs text-gray-500 mt-1">Receive and inspect returns</p>
                  </Link>

                  <Link
                    href="/assets"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">View All Assets</p>
                    <p className="text-xs text-gray-500 mt-1">Browse asset inventory</p>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Recent Asset Activities */}
            <Card title="Recent Asset Activities" className="border border-gray-200">
              {propertyOfficerStats.recentActivities && propertyOfficerStats.recentActivities.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {propertyOfficerStats.recentActivities.map((activity: any) => (
                    <div key={activity.id} className="py-3 px-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.user} • {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {activity.action?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>No recent activities found</p>
                </div>
              )}
            </Card>

            {/* Additional Metrics Row 1: Utilization, Processing Times, Monthly Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Asset Utilization Rate" className="border border-gray-200">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(propertyOfficerStats.assetOverview?.utilizationRate || 0) * 3.52} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {propertyOfficerStats.assetOverview?.utilizationRate || 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Percentage of assets currently assigned
                  </p>
                </div>
              </Card>

              <Card title="Average Processing Times" className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Transfer Processing</p>
                      <p className="text-xs text-gray-500 mt-1">From pending to complete</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {propertyOfficerStats.transferStats?.avgProcessingTime || 0}d
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Return Processing</p>
                      <p className="text-xs text-gray-500 mt-1">From received to complete</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {propertyOfficerStats.returnStats?.avgProcessingTime || 0}d
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="This Month's Activity" className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">New Registrations</p>
                      <p className="text-xs text-gray-500 mt-1">Assets added</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {propertyOfficerStats.monthlyActivity?.registrations || 0}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Completed Transfers</p>
                      <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {propertyOfficerStats.monthlyActivity?.transfers || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Assignments by Department */}
            {propertyOfficerStats.assignmentsByDepartment && propertyOfficerStats.assignmentsByDepartment.length > 0 && (
              <Card title="Asset Assignments by Department" className="border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyOfficerStats.assignmentsByDepartment.map((dept: any) => (
                    <div key={dept.department} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">{dept.department || 'Unknown'}</p>
                      <p className="text-3xl font-bold text-blue-600">{dept.count}</p>
                      <p className="text-xs text-gray-500 mt-1">assets assigned</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Assets Requiring Attention */}
            {propertyOfficerStats.assetsRequiringAttention && propertyOfficerStats.assetsRequiringAttention.length > 0 && (
              <Card title="⚠️ Assets Requiring Attention" className="border-2 border-orange-200 bg-orange-50">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-orange-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Asset ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Condition</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-orange-100">
                      {propertyOfficerStats.assetsRequiringAttention.map((asset: any) => (
                        <tr key={asset.id} className="hover:bg-orange-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{asset.assetId}</td>
                          <td className="px-4 py-3 text-gray-700">{asset.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              asset.status === 'under_maintenance' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {asset.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              asset.condition === 'damaged' 
                                ? 'bg-red-100 text-red-700' 
                                : asset.condition === 'poor'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {asset.condition}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{asset.location || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Recent Registrations Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
                  <p className="text-sm text-gray-600 mt-1">Assets registered in the last 7 days</p>
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {propertyOfficerStats.recentRegistrations || 0}
                </div>
              </div>
            </div>
          </div>
        ) : userRole === 'administrator' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card title="User Management Overview" className="border border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Total Users: <span className="font-semibold text-gray-900">{userStats?.totalUsers ?? '-'}</span></p>
                  <p>Active Users: <span className="font-semibold text-green-600">{userStats?.activeUsers ?? '-'}</span></p>
                  <p>Inactive Users: <span className="font-semibold text-gray-500">{userStats?.inactiveUsers ?? '-'}</span></p>
                  <p className="pt-2 text-xs text-gray-400">Recently updated accounts tracked in audit logs.</p>
                </div>
              </Card>

              <Card title="Role & Permission Summary" className="border border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  {(userStats?.roleBreakdown || []).map((role: any) => (
                    <div key={role.role} className="flex justify-between">
                      <span className="capitalize">{role.role.replace('_', ' ')}</span>
                      <span className="font-semibold text-gray-900">{role.count}</span>
                    </div>
                  ))}
                  <p className="pt-2 text-xs text-gray-400">Monitor roles and permissions assignments.</p>
                </div>
              </Card>

              <Card title="Authentication & Security" className="border border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Total Logs: <span className="font-semibold text-gray-900">{auditStats?.totalLogs ?? '-'}</span></p>
                  <p>Failed Attempts: <span className="font-semibold text-red-600">{auditStats?.failedLogins ?? '-'}</span></p>
                  <p>Errors: <span className="font-semibold text-orange-600">{auditStats?.errorActions ?? '-'}</span></p>
                  <p className="pt-2 text-xs text-gray-400">Login attempts and password resets tracked.</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="System Activity Monitoring" className="border border-gray-200">
                <div className="space-y-3 text-sm text-gray-600">
                  {(auditStats?.topActions || []).slice(0, 5).map((action: any) => (
                    <div key={action.action} className="flex justify-between">
                      <span>{action.action.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-gray-900">{action.count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Notifications & Alerts" className="border border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Security Alerts: <span className="font-semibold text-red-600">{auditStats?.failedActions ?? 0}</span></p>
                  <p>System Warnings: <span className="font-semibold text-orange-600">{auditStats?.errorActions ?? 0}</span></p>
                  <p>Pending Admin Actions: <span className="font-semibold text-blue-600">{auditStats?.failedActions ?? 0}</span></p>
                  <p className="pt-2 text-xs text-gray-400">Review audit logs for full details.</p>
                </div>
              </Card>

              <Card title="Quick Actions" className="border border-gray-200">
                <div className="space-y-4">
                  {roleAccess.quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <Card title="Recent Security Events" className="border border-gray-200">
              {securityEvents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="py-3 px-4 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{event.action?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">
                        {event.user?.fullName || 'System'} • {formatDateTime(event.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">No recent security events</div>
              )}
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat) => (
                <Card
                  key={stat.title}
                  className="hover:shadow-lg transition-all duration-200 border border-gray-200"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-3xl text-white shadow-md`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Role Highlights" className="border border-gray-200">
                <ul className="space-y-3 text-sm text-gray-600">
                  {roleAccess.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Quick Actions" className="border border-gray-200">
                <div className="space-y-4">
                  {roleAccess.quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card title="Recent Activities" className="border border-gray-200">
                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {stats.recentActivities.map((activity) => (
                      <div key={activity.id} className="py-4 px-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-gray-900 font-medium">{activity.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {activity.user} • {formatDateTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    </svg>
                    <p>No recent activities found</p>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
