'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

export default function AssignmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Assignments</h1>
          <p className="text-gray-600">Manage asset assignments to staff and departments</p>
        </div>
        <Card>
          <div className="text-center py-12 text-gray-500">
            Assignment management interface coming soon
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
