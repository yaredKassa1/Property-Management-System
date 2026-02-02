'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

export default function ReturnsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Returns</h1>
          <p className="text-gray-600">Manage asset return requests and inspections</p>
        </div>
        <Card>
          <div className="text-center py-12 text-gray-500">
            Return management interface coming soon
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
