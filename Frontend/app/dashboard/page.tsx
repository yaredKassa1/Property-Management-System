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
import { 
  CubeIcon, 
  CheckCircleIcon, 
  UserIcon, 
  WrenchScrewdriverIcon, 
  ExclamationTriangleIcon, 
  TrashIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PrinterIcon,
  UsersIcon,
  LockClosedIcon,
  ClipboardDocumentListIcon,
  ShieldExclamationIcon,
  KeyIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [propertyOfficerStats, setPropertyOfficerStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { t } = useLanguage();

  // Helper function to get role display name
  const getRoleDisplayName = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      administrator: t('role_administrator'),
      vice_president: t('role_vice_president'),
      property_officer: t('role_property_officer'),
      approval_authority: t('role_approval_authority'),
      purchase_department: t('role_purchase_department'),
      quality_assurance: t('role_quality_assurance'),
      staff: t('role_staff'),
    };
    return roleMap[role] || role;
  };

  // Helper function to get role color
  const getRoleColor = (role: UserRole): string => {
    const colorMap: Record<UserRole, string> = {
      administrator: 'bg-red-50 text-red-900 border-red-400',
      vice_president: 'bg-purple-50 text-purple-900 border-purple-400',
      property_officer: 'bg-blue-50 text-blue-900 border-blue-400',
      approval_authority: 'bg-green-50 text-green-900 border-green-400',
      purchase_department: 'bg-yellow-50 text-yellow-900 border-yellow-400',
      quality_assurance: 'bg-indigo-50 text-indigo-900 border-indigo-400',
      staff: 'bg-gray-50 text-gray-900 border-gray-400',
    };
    return colorMap[role] || 'bg-gray-50 text-gray-900 border-gray-400';
  };

  // Helper function to get role-specific dashboard description
  const getRoleDashboardDescription = (role: UserRole): string => {
    const descMap: Record<UserRole, string> = {
      administrator: t('dashboard_desc_administrator'),
      vice_president: t('dashboard_desc_vice_president'),
      property_officer: t('dashboard_desc_property_officer'),
      approval_authority: t('dashboard_desc_approval_authority'),
      purchase_department: t('dashboard_desc_purchase_department'),
      quality_assurance: t('dashboard_desc_quality_assurance'),
      staff: t('dashboard_desc_staff'),
    };
    return descMap[role] || '';
  };

  // Helper function to get role-specific dashboard title
  const getRoleDashboardTitle = (role: UserRole): string => {
    const titleMap: Record<UserRole, string> = {
      administrator: t('dashboard_title_administrator'),
      vice_president: t('dashboard_title_vice_president'),
      property_officer: t('dashboard_title_property_officer'),
      approval_authority: t('dashboard_title_approval_authority'),
      purchase_department: t('dashboard_title_purchase_department'),
      quality_assurance: t('dashboard_title_quality_assurance'),
      staff: t('dashboard_title_staff'),
    };
    return titleMap[role] || t('dashboard');
  };

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
          console.log('Fetching admin stats...');
          
          const [userStatsResponse, auditStatsResponse] = await Promise.all([
            api.getUserStats().catch((err) => {
              console.error('getUserStats error:', err);
              return null;
            }),
            api.getAuditLogStats().catch((err) => {
              console.error('getAuditLogStats error:', err);
              return null;
            })
          ]);

          console.log('=== DASHBOARD DEBUG ===');
          console.log('userStatsResponse:', JSON.stringify(userStatsResponse, null, 2));
          console.log('auditStatsResponse:', JSON.stringify(auditStatsResponse, null, 2));

          // The API client already extracts data.data, so we use the response directly
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

          console.log('userStats set to:', userStatsResponse);
          console.log('auditStats set to:', auditStatsResponse);
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
          { label: t('create_user'), href: '/users', description: t('add_new_system_accounts') },
          { label: t('audit_logs_title'), href: '/audit-logs', description: t('review_system_activity') },
          { label: t('reset_password'), href: '/users', description: t('manage_access_and_passwords') },
        ],
        highlights: ['User management', 'Security monitoring', 'System configuration'],
      },
      vice_president: {
        allowedCards: ['totalAssets', 'assignedAssets', 'pendingTransfers', 'pendingReturns'],
        quickActions: [
          { label: t('review_reports'), href: '/reports', description: t('executive_summaries_and_analytics') },
          { label: t('track_transfers'), href: '/transfers', description: t('monitor_transfer_approvals') },
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
          { label: t('register_asset'), href: '/assets/new', description: t('register_new_fixed_assets') },
          { label: t('assign_asset'), href: '/assignments', description: t('assign_assets_to_staff') },
          { label: t('process_return'), href: '/returns', description: t('record_asset_returns_desc') },
        ],
        highlights: ['Asset registration', 'Assignments and returns', 'Operational control'],
      },
      approval_authority: {
        allowedCards: ['pendingTransfers', 'assignedAssets'],
        quickActions: [
          { label: t('approve_transfers'), href: '/transfers', description: t('review_transfer_requests') },
        ],
        highlights: ['Transfer approvals', 'Pending request oversight', 'Decision tracking'],
      },
      purchase_department: {
        allowedCards: ['availableAssets', 'underMaintenance', 'pendingReturns'],
        quickActions: [
          { label: t('purchase_requests'), href: '/requests', description: t('manage_purchase_workflows') },
          { label: t('asset_inventory'), href: '/assets', description: t('review_available_assets') },
        ],
        highlights: ['Procurement readiness', 'Inventory visibility', 'Purchase approvals'],
      },
      quality_assurance: {
        allowedCards: ['underMaintenance', 'pendingReturns', 'availableAssets'],
        quickActions: [
          { label: t('return_inspections'), href: '/returns', description: t('inspect_asset_conditions') },
          { label: t('asset_status'), href: '/assets', description: t('verify_asset_condition') },
        ],
        highlights: ['Quality checks', 'Asset condition tracking', 'Maintenance oversight'],
      },
      staff: {
        allowedCards: ['assignedAssets', 'availableAssets', 'pendingTransfers'],
        quickActions: [
          { label: t('request_transfer'), href: '/transfers', description: t('submit_transfer_requests') },
          { label: t('my_assets'), href: '/assets', description: t('review_your_assigned_assets') },
        ],
        highlights: ['Personal asset view', 'Transfer requests', 'Request status tracking'],
      },
    };

    return roleMap[userRole];
  }, [userRole]);

  const statCards = useMemo(() => {
    if (!stats) return [];

    const allCards = [
      { key: 'totalAssets', title: t('total_assets'), value: stats.totalAssets, icon: CubeIcon, color: 'bg-blue-500' },
      { key: 'assignedAssets', title: t('assigned_assets'), value: stats.assignedAssets, icon: UserIcon, color: 'bg-green-500' },
      { key: 'availableAssets', title: t('available_assets'), value: stats.availableAssets, icon: CheckCircleIcon, color: 'bg-purple-500' },
      { key: 'underMaintenance', title: t('maintenance'), value: stats.underMaintenance, icon: WrenchScrewdriverIcon, color: 'bg-orange-500' },
      { key: 'pendingTransfers', title: t('pending_transfers'), value: stats.pendingTransfers, icon: ArrowPathIcon, color: 'bg-yellow-500' },
      { key: 'pendingReturns', title: t('pending_returns'), value: stats.pendingReturns, icon: ArrowUturnLeftIcon, color: 'bg-red-500' },
    ];

    return allCards.filter((card) => roleAccess.allowedCards.includes(card.key as keyof DashboardStats));
  }, [roleAccess.allowedCards, stats]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E9FE8]"></div>
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
            <h1 className="text-2xl font-bold">{t('property_officer_dashboard_report')}</h1>
            <p className="text-sm mt-2">{t('generated_on')}: {new Date().toLocaleString()}</p>
            {dateRange && (
              <p className="text-sm">{t('date_range_label')}: {dateRange.startDate} {t('to')} {dateRange.endDate}</p>
            )}
          </div>
        )}
        
        {/* Welcome Header */}
        <div className="no-print bg-gradient-to-r from-[#0A3A5C] via-[#1578B8] to-[#1E9FE8] rounded-2xl p-6 shadow-2xl mb-8 border border-blue-900">
          <div className="flex justify-between items-center">
            {/* Left Side - Avatar and User Info */}
            <div className="flex items-center gap-4">
              {/* Circular Avatar with Initial */}
              <div className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-700/50">
                <span className="text-3xl font-bold text-white">
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              
              {/* Welcome Text and User Info */}
              <div>
                <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">
                  {t('welcome_back_caps')}
                </p>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {currentUser?.username || 'User'}!
                </h1>
                
                {/* Role Badge with Icon */}
                <div className="flex items-center gap-2 bg-blue-900/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-700/50">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-blue-100 text-sm font-medium">
                    {getRoleDisplayName(userRole)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Date and Status */}
            <div className="flex items-center gap-4">
              {/* Date */}
              <div className="text-right">
                <p className="text-blue-200 text-sm font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-green-100 text-sm font-medium">
                  {t('all_systems_normal')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section Title with Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getRoleDashboardTitle(userRole)}</h1>
              {/* Short Horizontal Accent Line */}
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
              <p className="text-sm text-gray-600">{getRoleDashboardDescription(userRole)}</p>
            </div>

            {/* Dashboard Controls - Property Officer Only */}
            {userRole === 'property_officer' && propertyOfficerStats && (
              <div className="flex items-center gap-3">
                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                  <DateRangePicker 
                    onApply={handleDateRangeApply}
                    onReset={handleDateRangeReset}
                  />
                  {dateRange && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{dateRange.startDate} {t('to')} {dateRange.endDate}</span>
                    </div>
                  )}
                </div>
                
                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1578B8] to-[#1E9FE8] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    {t('export')}
                  </button>
                  
                  {showExportMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-[999]"
                        onClick={() => setShowExportMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000]">
                        <div className="py-2">
                          <button
                            onClick={() => handleExport('csv')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                            {t('export_as_csv')}
                          </button>
                          <button
                            onClick={() => handleExport('json')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                            {t('export_as_json')}
                          </button>
                          <hr className="my-2" />
                          <button
                            onClick={handlePrint}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <PrinterIcon className="w-4 h-4" />
                            {t('print_dashboard')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {userRole === 'property_officer' && propertyOfficerStats ? (
          <div className="space-y-6">

            {/* Primary Metrics - Larger Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {/* Total Assets Card */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-8 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {t('total_assets')}
                      </p>
                      <p className="text-5xl font-bold text-gray-900">
                        {propertyOfficerStats.assetOverview?.totalAssets || 0}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CubeIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">All registered assets in system</p>
                </div>

                {/* Available Assets Card */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-8 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {t('available')}
                      </p>
                      <p className="text-5xl font-bold text-green-600">
                        {propertyOfficerStats.assetOverview?.availableAssets || 0}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">Ready for assignment</p>
                </div>

                {/* Assigned Assets Card */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-8 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {t('assigned')}
                      </p>
                      <p className="text-5xl font-bold text-purple-600">
                        {propertyOfficerStats.assetOverview?.assignedAssets || 0}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">Currently in use by staff</p>
                </div>
              </div>

              {/* Secondary Metrics - Smaller Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Maintenance Card */}
                <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {t('maintenance')}
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {propertyOfficerStats.assetOverview?.underMaintenance || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                      <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Damaged Card */}
                <div className="bg-white rounded-xl shadow-md border-2 border-red-200 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {t('damaged')}
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {propertyOfficerStats.assetOverview?.damagedAssets || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                      <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Disposed Card */}
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {t('disposed')}
                      </p>
                      <p className="text-3xl font-bold text-gray-700">
                        {propertyOfficerStats.assetOverview?.disposedAssets || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                      <TrashIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

            {/* Transfer and Return Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-white to-blue-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1578B8] to-[#1E9FE8] rounded-xl flex items-center justify-center shadow-md">
                      <ArrowPathIcon className="w-6 h-6 text-white" />
                    </div>
                    {t('transfer_management')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t('pending_transfers')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('awaiting_vp_approval')}</p>
                      </div>
                      <div className="text-4xl font-bold text-yellow-600">
                        {propertyOfficerStats.transferStats?.pendingTransfers || 0}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t('approved_transfers')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('ready_to_complete')}</p>
                      </div>
                      <div className="text-4xl font-bold text-[#1E9FE8]">
                        {propertyOfficerStats.transferStats?.approvedTransfers || 0}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t('completed_today')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('successfully_processed')}</p>
                      </div>
                      <div className="text-4xl font-bold text-green-600">
                        {propertyOfficerStats.transferStats?.completedToday || 0}
                      </div>
                    </div>

                    <Link
                      href="/transfers"
                      className="block w-full text-center py-4 px-4 bg-gradient-to-r from-[#1578B8] via-[#1E9FE8] to-[#5BC0EB] text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-bold shadow-md"
                    >
                      {t('manage_transfers')} →
                    </Link>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-white to-purple-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <ArrowUturnLeftIcon className="w-6 h-6 text-white" />
                    </div>
                    {t('return_management')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t('pending_returns')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('need_to_receive')}</p>
                      </div>
                      <div className="text-4xl font-bold text-yellow-600">
                        {propertyOfficerStats.returnStats?.pendingReturns || 0}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t('under_inspection')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('quality_check_required')}</p>
                      </div>
                      <div className="text-4xl font-bold text-orange-600">
                        {propertyOfficerStats.returnStats?.underInspection || 0}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t('completed_today')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('successfully_processed')}</p>
                      </div>
                      <div className="text-4xl font-bold text-green-600">
                        {propertyOfficerStats.returnStats?.completedToday || 0}
                      </div>
                    </div>

                    <Link
                      href="/returns"
                      className="block w-full text-center py-4 px-4 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-bold shadow-md"
                    >
                      {t('manage_returns')} →
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pending Actions Summary */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/30 rounded-full -ml-16 -mb-16"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
                  </div>
                  {t('priority_actions')}
                  <div className="ml-auto px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600 shadow-md">
                    {t('requires_attention')}
                  </div>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('transfers_to_complete')}</p>
                    <p className="text-5xl font-bold text-[#1E9FE8] mb-4">
                      {propertyOfficerStats.pendingActions?.transfersToComplete || 0}
                    </p>
                    <Link href="/transfers?status=approved" className="text-sm text-[#1E9FE8] hover:text-[#1578B8] font-semibold hover:underline flex items-center gap-1 transition-all">
                      {t('view_details')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('returns_to_receive')}</p>
                    <p className="text-5xl font-bold text-[#1E9FE8] mb-4">
                      {propertyOfficerStats.pendingActions?.returnsToReceive || 0}
                    </p>
                    <Link href="/returns?status=pending" className="text-sm text-[#1E9FE8] hover:text-[#1578B8] font-semibold hover:underline flex items-center gap-1 transition-all">
                      {t('view_details')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('returns_to_inspect')}</p>
                    <p className="text-5xl font-bold text-[#1E9FE8] mb-4">
                      {propertyOfficerStats.pendingActions?.returnsToInspect || 0}
                    </p>
                    <Link href="/returns?status=under_inspection" className="text-sm text-[#1E9FE8] hover:text-[#1578B8] font-semibold hover:underline flex items-center gap-1 transition-all">
                      {t('view_details')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('assets_to_maintain')}</p>
                    <p className="text-5xl font-bold text-[#1E9FE8] mb-4">
                      {propertyOfficerStats.pendingActions?.assetsToMaintain || 0}
                    </p>
                    <Link href="/assets?status=under_maintenance" className="text-sm text-[#1E9FE8] hover:text-[#1578B8] font-semibold hover:underline flex items-center gap-1 transition-all">
                      {t('view_details')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

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
                    <p className="text-xs text-gray-500 mt-1">{t('assign_assets_to_staff')}</p>
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
                    <p className="text-sm font-semibold text-gray-900">{t('view_all_assets')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('browse_asset_inventory')}</p>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Recent Asset Activities */}
            <Card title={t('recent_asset_activities')} className="border border-gray-200">
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
                  <p>{t('no_recent_activities')}</p>
                </div>
              )}
            </Card>

            {/* Additional Metrics Row 1: Utilization, Processing Times, Monthly Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title={t('asset_utilization_rate')} className="border border-gray-200">
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
                    {t('percentage_assets_assigned')}
                  </p>
                </div>
              </Card>

              <Card title={t('average_processing_times')} className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('transfer_processing')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('from_pending_to_complete')}</p>
                    </div>
                    <div className="text-2xl font-bold text-[#1E9FE8]">
                      {propertyOfficerStats.transferStats?.avgProcessingTime || 0}d
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('return_processing')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('from_received_to_complete')}</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {propertyOfficerStats.returnStats?.avgProcessingTime || 0}d
                    </div>
                  </div>
                </div>
              </Card>

              <Card title={t('this_months_activity')} className="border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('new_registrations')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('assets_added')}</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {propertyOfficerStats.monthlyActivity?.registrations || 0}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('completed_transfers')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('successfully_processed')}</p>
                    </div>
                    <div className="text-2xl font-bold text-[#1E9FE8]">
                      {propertyOfficerStats.monthlyActivity?.transfers || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Assignments by Department */}
            {propertyOfficerStats.assignmentsByDepartment && propertyOfficerStats.assignmentsByDepartment.length > 0 && (
              <Card title={t('asset_assignments_by_work_unit')} className="border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyOfficerStats.assignmentsByDepartment.map((dept: any) => (
                    <div key={dept.workUnit} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">{dept.workUnit || t('unknown')}</p>
                      <p className="text-3xl font-bold text-[#1E9FE8]">{dept.count}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('assets_assigned_count')}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Assets Requiring Attention */}
            {propertyOfficerStats.assetsRequiringAttention && propertyOfficerStats.assetsRequiringAttention.length > 0 && (
              <Card title={t('assets_requiring_attention')} className="border-2 border-orange-200 bg-orange-50">
                <div className="flex items-center gap-2 mb-4">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-900">{t('assets_requiring_attention')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-orange-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('asset_id_header')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('name_header')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('status_header')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('condition_header')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('location_header')}</th>
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('recent_registrations')}</h3>
                  <p className="text-sm font-medium text-gray-700 mt-1">{t('assets_registered_last_7_days')}</p>
                </div>
                <div className="text-5xl font-bold text-[#1578B8]">
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
                { label: t('total_users').toUpperCase(),    value: userStats?.totalUsers   ?? 0, icon: UsersIcon, bg: 'bg-[#1E9FE8]',  sub: t('registered_accounts') },
                { label: t('active_users').toUpperCase(),    value: userStats?.activeUsers  ?? 0, icon: CheckCircleIcon, bg: 'bg-green-600',    sub: t('can_log_in_now') },
                { label: t('failed_logins').toUpperCase(),  value: auditStats?.failedLogins ?? 0, icon: LockClosedIcon, bg: 'bg-red-600',       sub: t('last_30_days') },
                { label: t('audit_events').toUpperCase(),   value: auditStats?.totalLogs   ?? 0, icon: ClipboardDocumentListIcon, bg: 'bg-[#1578B8]',    sub: t('total_log_entries') },
              ].map(s => {
                const IconComponent = s.icon;
                return (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-white shadow-lg`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium opacity-90 uppercase tracking-wider">{s.label}</p>
                        <p className="text-4xl font-bold mt-2">{s.value.toLocaleString()}</p>
                        <p className="text-xs opacity-80 mt-1">{s.sub}</p>
                      </div>
                      <IconComponent className="w-8 h-8 opacity-90" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle row: Role breakdown + Security + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Role breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('users_by_role')}</p>
                <div className="space-y-3">
                  {(userStats?.roleBreakdown || []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">{t('no_data')}</p>
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('security_overview')}</p>
                <div className="space-y-3">
                  {[
                    { label: t('failed_login_attempts'), value: auditStats?.failedLogins ?? 0,  color: 'text-red-600',    bg: 'bg-red-50',    icon: ShieldExclamationIcon },
                    { label: t('failed_actions'),         value: auditStats?.failedActions ?? 0, color: 'text-orange-600', bg: 'bg-orange-50', icon: ShieldExclamationIcon },
                    { label: t('system_errors'),          value: auditStats?.errorActions ?? 0,  color: 'text-yellow-600', bg: 'bg-yellow-50', icon: ShieldExclamationIcon },
                  ].map(item => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${item.bg}`}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                        <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/audit-logs" className="mt-4 flex items-center justify-center gap-1 text-xs text-[#1E9FE8] hover:underline font-medium">
                  {t('view_full_audit_log')} →
                </Link>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</p>
                <div className="space-y-3">
                  {[
                    { label: 'Manage Users',   href: '/users',      icon: UsersIcon, desc: 'Create, edit, deactivate accounts' },
                    { label: 'Audit Logs',     href: '/audit-logs', icon: ClipboardDocumentListIcon, desc: 'Review system activity' },
                    { label: 'Reset Password', href: '/users',      icon: KeyIcon, desc: 'Manage user credentials' },
                  ].map(a => {
                    const IconComponent = a.icon;
                    return (
                      <Link key={a.label} href={a.href}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#1E9FE8]-light hover:bg-blue-50 transition-all group">
                        <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-[#1E9FE8]" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1E9FE8]">{a.label}</p>
                          <p className="text-xs text-gray-400">{a.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top system actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('top_system_actions')}</p>
              {(auditStats?.topActions || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">{t('no_activity_data')}</p>
              ) : (
                <div className="space-y-2">
                  {(auditStats?.topActions || []).slice(0, 6).map((a: any, i: number) => (
                    <div key={a.action} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E9FE8] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
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
                      className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md`}
                    >
                      {typeof stat.icon === 'string' ? (
                        <span className="text-3xl">{stat.icon}</span>
                      ) : (
                        <stat.icon className="w-8 h-8" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title={t('role_highlights')} className="border border-gray-200">
                <ul className="space-y-3 text-sm text-gray-600">
                  {roleAccess.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title={t('quick_actions')} className="border border-gray-200">
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
