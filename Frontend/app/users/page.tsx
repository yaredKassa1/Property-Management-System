'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and roles</p>
        </div>
        <Card>
          <div className="text-center py-12 text-gray-500">
            User management interface coming soon
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
