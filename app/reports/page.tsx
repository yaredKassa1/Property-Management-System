'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { ReportType } from '@/lib/types';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'asset_status' as ReportType,
    startDate: '',
    endDate: '',
    department: '',
  });

  const reportTypes = [
    { value: 'asset_status', label: 'Asset Status Report' },
    { value: 'transfer_history', label: 'Transfer History' },
    { value: 'assignment_report', label: 'Assignment Report' },
    { value: 'inventory_summary', label: 'Inventory Summary' },
    { value: 'audit_trail', label: 'Audit Trail' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const report = await api.generateReport(filters);
      console.log('Report generated:', report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and export system reports</p>
        </div>

        <Card title="Report Configuration">
          <div className="space-y-6">
            <Select
              label="Report Type"
              options={reportTypes}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as ReportType })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />

              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />

              <Input
                label="Department (Optional)"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="secondary">Preview</Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Recent Reports">
          <div className="text-center py-12 text-gray-500">
            No recent reports available
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
