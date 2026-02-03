'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { DashboardStats, UserRole } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { getUser } from '@/lib/auth';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('staff');

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUserRole(currentUser.role);
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getDashboardStats();
        setStats(data as DashboardStats);
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
        allowedCards: ['totalAssets', 'assignedAssets', 'availableAssets', 'pendingTransfers', 'pendingReturns'],
        quickActions: [
          { label: 'Inventory Report', href: '/reports', description: 'Generate inventory summaries.' },
          { label: 'Transfer History', href: '/reports', description: 'Export transfer reports.' },
          { label: 'Assignment Report', href: '/reports', description: 'Review assignment reporting.' },
        ],
        highlights: ['System-wide reporting', 'Inventory visibility', 'Audit-ready summaries'],
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
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back • Overview of property management system
          </p>
        </div>

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
      </div>
    </DashboardLayout>
  );
}
