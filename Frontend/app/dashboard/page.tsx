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
import { useLanguage } from '@/lib/contexts';

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

  const { t } = useLanguage();

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

          const eventsRaw = securityEventsResponse as any;
          const events = Array.isArray(eventsRaw)
            ? eventsRaw
            : eventsRaw?.data || [];
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
            <p className="text-gray-600">{t('loading')}...</p>
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
            <h3 className="text-lg font-medium text-red-800 mb-2">{t('error')}</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-600 mt-1">
            Welcome back • {t('asset_inventory_overview')}
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
                  📤 {t('export')}
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
                          📊 {t('export')} as CSV
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          📋 {t('export')} as JSON
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handlePrint}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          🖨️ {t('dashboard')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Asset Overview Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('asset_inventory_overview')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600 uppercase">{t('total_assets')}</p>
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
                      <p className="text-xs font-medium text-gray-600 uppercase">{t('available')}</p>
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
                      <p className="text-xs font-medium text-gray-600 uppercase">{t('assigned')}</p>
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
                      <p className="text-xs font-medium text-gray-600 uppercase">{t('maintenance')}</p>
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
              <Card title={t('transfer_management')} className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('pending_transfers')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('awaiting_vp_approval')}</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {propertyOfficerStats.transferStats?.pendingTransfers || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('approved_transfers')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('ready_to_complete')}</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {propertyOfficerStats.transferStats?.approvedTransfers || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('completed_today')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('successfully_processed')}</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {propertyOfficerStats.transferStats?.completedToday || 0}
                    </div>
                  </div>

                  <Link
                    href="/transfers"
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {t('manage_transfers')}
                  </Link>
                </div>
              </Card>

              <Card title={t('return_management')} className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('pending_returns')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('need_to_receive')}</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {propertyOfficerStats.returnStats?.pendingReturns || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('under_inspection')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('quality_check_required')}</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {propertyOfficerStats.returnStats?.underInspection || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('completed_today')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('successfully_processed')}</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {propertyOfficerStats.returnStats?.completedToday || 0}
                    </div>
                  </div>

                  <Link
                    href="/returns"
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {t('manage_returns')}
                  </Link>
                </div>
              </Card>
            </div>

            {/* Pending Actions Summary */}
            <Card title={t('priority_actions')} className="border-2 border-indigo-200 bg-indigo-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">{t('transfers_to_complete')}</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.transfersToComplete || 0}
                  </p>
                  <Link href="/transfers?status=approved" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    {t('view_details')}
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">{t('returns_to_receive')}</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.returnsToReceive || 0}
                  </p>
                  <Link href="/returns?status=pending" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    {t('view_details')}
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">{t('returns_to_inspect')}</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.returnsToInspect || 0}
                  </p>
                  <Link href="/returns?status=under_inspection" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    {t('view_details')}
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">{t('assets_to_maintain')}</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {propertyOfficerStats.pendingActions?.assetsToMaintain || 0}
                  </p>
                  <Link href="/assets?status=under_maintenance" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                    {t('view_details')}
                  </Link>
                </div>
              </div>
            </Card>

            {/* Asset Breakdown and Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title={t('asset_condition_breakdown')} className="border border-gray-200">
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
                    <p className="text-sm text-gray-500 text-center py-4">{t('no_data_available')}</p>
                  )}
                </div>
              </Card>

              <Card title={t('asset_category_breakdown')} className="border border-gray-200">
                <div className="space-y-3">
                  {propertyOfficerStats.categoryBreakdown?.map((category: any) => (
                    <div key={category.category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.category === 'fixed' ? t('fixed_assets') : t('fixed_consumable')}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{category.count}</span>
                    </div>
                  ))}
                  {(!propertyOfficerStats.categoryBreakdown || propertyOfficerStats.categoryBreakdown.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">{t('no_data_available')}</p>
                  )}
                </div>
              </Card>

              <Card title={t('quick_actions')} className="border border-gray-200">
                <div className="space-y-3">
                  <Link
                    href="/assets/new"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">{t('register_new_asset')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('add_asset_to_inventory')}</p>
                  </Link>

                  <Link
                    href="/assignments"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">{t('assign_asset')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('allocate_to_staff')}</p>
                  </Link>

                  <Link
                    href="/returns"
                    className="block rounded-lg border border-gray-200 p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">{t('process_return')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('record_asset_returns')}</p>
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
              <Card title="Asset Assignments by Work Unit" className="border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyOfficerStats.assignmentsByDepartment.map((dept: any) => (
                    <div key={dept.workUnit} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">{dept.workUnit || 'Unknown'}</p>
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

            {/* Top KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',    value: userStats?.totalUsers   ?? 0, icon: '👥', grad: 'from-indigo-500 to-indigo-700',  sub: 'Registered accounts' },
                { label: 'Active Users',   value: userStats?.activeUsers  ?? 0, icon: '✅', grad: 'from-green-500 to-green-700',    sub: 'Can log in now' },
                { label: 'Failed Logins',  value: auditStats?.failedLogins ?? 0, icon: '🔐', grad: 'from-red-500 to-red-700',       sub: 'Last 30 days' },
                { label: 'Audit Events',   value: auditStats?.totalLogs   ?? 0, icon: '📋', grad: 'from-slate-500 to-slate-700',    sub: 'Total log entries' },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-75 uppercase tracking-wider">{s.label}</p>
                      <p className="text-4xl font-bold mt-2">{s.value.toLocaleString()}</p>
                      <p className="text-xs opacity-60 mt-1">{s.sub}</p>
                    </div>
                    <span className="text-3xl opacity-80">{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle row: Role breakdown + Security + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Role breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Users by Role</p>
                <div className="space-y-3">
                  {(userStats?.roleBreakdown || []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No data</p>
                  ) : (
                    (userStats?.roleBreakdown || []).map((r: any) => {
                      const pct = userStats?.totalUsers ? Math.round((r.count / userStats.totalUsers) * 100) : 0;
                      const colors: Record<string, string> = {
                        administrator: 'bg-red-500', vice_president: 'bg-purple-500',
                        property_officer: 'bg-blue-500', approval_authority: 'bg-amber-500',
                        purchase_department: 'bg-teal-500', quality_assurance: 'bg-indigo-500', staff: 'bg-gray-400',
                      };
                      return (
                        <div key={r.role}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 capitalize">{r.role.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-900">{r.count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${colors[r.role] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Security panel */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Security Overview</p>
                <div className="space-y-3">
                  {[
                    { label: 'Failed Login Attempts', value: auditStats?.failedLogins ?? 0,  color: 'text-red-600',    bg: 'bg-red-50',    icon: '🔴' },
                    { label: 'Failed Actions',         value: auditStats?.failedActions ?? 0, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🟠' },
                    { label: 'System Errors',          value: auditStats?.errorActions ?? 0,  color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${item.bg}`}>
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/audit-logs" className="mt-4 flex items-center justify-center gap-1 text-xs text-indigo-600 hover:underline font-medium">
                  View full audit log →
                </Link>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</p>
                <div className="space-y-3">
                  {[
                    { label: 'Manage Users',   href: '/users',      icon: '👥', desc: 'Create, edit, deactivate accounts' },
                    { label: 'Audit Logs',     href: '/audit-logs', icon: '📋', desc: 'Review system activity' },
                    { label: 'Reset Password', href: '/users',      icon: '🔑', desc: 'Manage user credentials' },
                  ].map(a => (
                    <Link key={a.label} href={a.href}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                      <span className="text-2xl">{a.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">{a.label}</p>
                        <p className="text-xs text-gray-400">{a.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Top actions + Recent security events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Top system actions */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Top System Actions</p>
                {(auditStats?.topActions || []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No activity data</p>
                ) : (
                  <div className="space-y-2">
                    {(auditStats?.topActions || []).slice(0, 6).map((a: any, i: number) => (
                      <div key={a.action} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-700 truncate capitalize">{a.action.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-900 ml-2">{a.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full"
                              style={{ width: `${Math.min(100, (a.count / ((auditStats?.topActions?.[0]?.count) || 1)) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent security events */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Security Events</p>
                  <Link href="/audit-logs" className="text-xs text-indigo-600 hover:underline">View all</Link>
                </div>
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">🛡️</p>
                    <p className="text-sm">No recent security events</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {securityEvents.slice(0, 6).map((event: any) => (
                      <div key={event.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          event.status === 'failure' ? 'bg-red-500' :
                          event.status === 'error'   ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate capitalize">
                            {event.action?.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {event.user?.fullName || 'System'} · {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          event.status === 'failure' ? 'bg-red-100 text-red-700' :
                          event.status === 'error'   ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>{event.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
