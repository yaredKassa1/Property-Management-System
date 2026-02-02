'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats() as DashboardStats;
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { title: 'Total Assets', value: stats?.totalAssets || 0, icon: '📦', color: 'bg-blue-500' },
    { title: 'Assigned Assets', value: stats?.assignedAssets || 0, icon: '👤', color: 'bg-green-500' },
    { title: 'Available Assets', value: stats?.availableAssets || 0, icon: '✅', color: 'bg-purple-500' },
    { title: 'Under Maintenance', value: stats?.underMaintenance || 0, icon: '🔧', color: 'bg-orange-500' },
    { title: 'Pending Transfers', value: stats?.pendingTransfers || 0, icon: '🔄', color: 'bg-yellow-500' },
    { title: 'Pending Returns', value: stats?.pendingReturns || 0, icon: '↩️', color: 'bg-red-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of property management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Recent Activities">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} • {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
