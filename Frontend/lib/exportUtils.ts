// Utility functions for exporting dashboard data

export const exportToCSV = (data: any, filename: string) => {
  const csvRows: string[] = [];

  // Add header section
  csvRows.push('Property Officer Dashboard Statistics');
  csvRows.push(`Generated on: ${new Date().toLocaleString()}`);
  if (data.dateRange?.startDate && data.dateRange?.endDate) {
    csvRows.push(`Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}`);
  }
  csvRows.push('');

  // Asset Overview
  csvRows.push('ASSET OVERVIEW');
  csvRows.push('Metric,Value');
  csvRows.push(`Total Assets,${data.assetOverview?.totalAssets || 0}`);
  csvRows.push(`Available,${data.assetOverview?.availableAssets || 0}`);
  csvRows.push(`Assigned,${data.assetOverview?.assignedAssets || 0}`);
  csvRows.push(`Under Maintenance,${data.assetOverview?.underMaintenance || 0}`);
  csvRows.push(`Damaged,${data.assetOverview?.damagedAssets || 0}`);
  csvRows.push(`Disposed,${data.assetOverview?.disposedAssets || 0}`);
  csvRows.push(`Utilization Rate,${data.assetOverview?.utilizationRate || 0}%`);
  csvRows.push('');

  // Transfer Stats
  csvRows.push('TRANSFER MANAGEMENT');
  csvRows.push('Metric,Value');
  csvRows.push(`Pending Transfers,${data.transferStats?.pendingTransfers || 0}`);
  csvRows.push(`Approved Transfers,${data.transferStats?.approvedTransfers || 0}`);
  csvRows.push(`Completed Today,${data.transferStats?.completedToday || 0}`);
  csvRows.push(`Avg Processing Time,${data.transferStats?.avgProcessingTime || 0} days`);
  csvRows.push('');

  // Return Stats
  csvRows.push('RETURN MANAGEMENT');
  csvRows.push('Metric,Value');
  csvRows.push(`Pending Returns,${data.returnStats?.pendingReturns || 0}`);
  csvRows.push(`Under Inspection,${data.returnStats?.underInspection || 0}`);
  csvRows.push(`Completed Today,${data.returnStats?.completedToday || 0}`);
  csvRows.push(`Avg Processing Time,${data.returnStats?.avgProcessingTime || 0} days`);
  csvRows.push('');

  // Monthly Activity
  if (data.monthlyActivity) {
    csvRows.push('MONTHLY ACTIVITY');
    csvRows.push('Metric,Value');
    csvRows.push(`Registrations,${data.monthlyActivity.registrations || 0}`);
    csvRows.push(`Transfers,${data.monthlyActivity.transfers || 0}`);
    csvRows.push(`Returns,${data.monthlyActivity.returns || 0}`);
    csvRows.push('');
  }

  // Condition Breakdown
  if (data.conditionBreakdown && data.conditionBreakdown.length > 0) {
    csvRows.push('ASSET CONDITION BREAKDOWN');
    csvRows.push('Condition,Count');
    data.conditionBreakdown.forEach((item: any) => {
      csvRows.push(`${item.condition},${item.count}`);
    });
    csvRows.push('');
  }

  // Category Breakdown
  if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
    csvRows.push('ASSET CATEGORY BREAKDOWN');
    csvRows.push('Category,Count');
    data.categoryBreakdown.forEach((item: any) => {
      csvRows.push(`${item.category},${item.count}`);
    });
    csvRows.push('');
  }

  // Assignments by Department
  if (data.assignmentsByDepartment && data.assignmentsByDepartment.length > 0) {
    csvRows.push('ASSIGNMENTS BY DEPARTMENT');
    csvRows.push('Department,Count');
    data.assignmentsByDepartment.forEach((item: any) => {
      csvRows.push(`${item.department || 'Unknown'},${item.count}`);
    });
    csvRows.push('');
  }

  // Assets Requiring Attention
  if (data.assetsRequiringAttention && data.assetsRequiringAttention.length > 0) {
    csvRows.push('ASSETS REQUIRING ATTENTION');
    csvRows.push('Asset ID,Name,Status,Condition,Location');
    data.assetsRequiringAttention.forEach((asset: any) => {
      csvRows.push(`${asset.assetId},${asset.name},${asset.status},${asset.condition},${asset.location || 'N/A'}`);
    });
  }

  // Create and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printDashboard = () => {
  window.print();
};

export const generatePrintContent = (data: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Property Officer Dashboard Report</title>
      <style>
        @media print {
          body { 
            font-family: Arial, sans-serif; 
            color: #000;
            margin: 20px;
          }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          h1 { color: #1a202c; font-size: 24px; margin-bottom: 10px; }
          h2 { color: #2d3748; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background-color: #f7fafc; font-weight: bold; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
          .metric-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .metric-label { font-size: 12px; color: #718096; margin-bottom: 5px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #2d3748; }
          .header { margin-bottom: 30px; }
          .footer { margin-top: 30px; font-size: 12px; color: #718096; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Property Officer Dashboard Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        ${data.dateRange?.startDate && data.dateRange?.endDate ? `
          <p>Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}</p>
        ` : ''}
      </div>

      <h2>Asset Overview</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Total Assets</div>
          <div class="metric-value">${data.assetOverview?.totalAssets || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Available</div>
          <div class="metric-value">${data.assetOverview?.availableAssets || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Assigned</div>
          <div class="metric-value">${data.assetOverview?.assignedAssets || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Under Maintenance</div>
          <div class="metric-value">${data.assetOverview?.underMaintenance || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Damaged</div>
          <div class="metric-value">${data.assetOverview?.damagedAssets || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Utilization Rate</div>
          <div class="metric-value">${data.assetOverview?.utilizationRate || 0}%</div>
        </div>
      </div>

      <h2>Transfer & Return Management</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Pending</th>
            <th>In Progress</th>
            <th>Completed Today</th>
            <th>Avg Processing Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Transfers</td>
            <td>${data.transferStats?.pendingTransfers || 0}</td>
            <td>${data.transferStats?.approvedTransfers || 0}</td>
            <td>${data.transferStats?.completedToday || 0}</td>
            <td>${data.transferStats?.avgProcessingTime || 0} days</td>
          </tr>
          <tr>
            <td>Returns</td>
            <td>${data.returnStats?.pendingReturns || 0}</td>
            <td>${data.returnStats?.underInspection || 0}</td>
            <td>${data.returnStats?.completedToday || 0}</td>
            <td>${data.returnStats?.avgProcessingTime || 0} days</td>
          </tr>
        </tbody>
      </table>

      ${data.assetsRequiringAttention && data.assetsRequiringAttention.length > 0 ? `
        <div class="page-break"></div>
        <h2>Assets Requiring Attention</h2>
        <table>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${data.assetsRequiringAttention.map((asset: any) => `
              <tr>
                <td>${asset.assetId}</td>
                <td>${asset.name}</td>
                <td>${asset.status}</td>
                <td>${asset.condition}</td>
                <td>${asset.location || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        <p>Property Management System - Property Officer Dashboard</p>
        <p>This report is confidential and for internal use only.</p>
      </div>
    </body>
    </html>
  `;
};
