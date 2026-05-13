'use client';

import { useState } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface ReportFilters { startDate: string; endDate: string; }

function exportCSV(filename: string, rows: Record<string, any>[], columns: string[]) {
  const header = columns.join(',');
  const body = rows.map(row => columns.map(col => { const val = row[col] ?? ''; const str = String(val).replace(/"/g, '""'); return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str; }).join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function printReport(title: string, html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write('<!DOCTYPE html><html><head><title>' + title + '</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px}h1{font-size:18px;color:#1a3a6b}table{width:100%;border-collapse:collapse}th{background:#1a3a6b;color:#fff;padding:6px 10px;text-align:left;font-size:11px}td{padding:5px 10px;border-bottom:1px solid #e0e8f0;font-size:11px}.summary{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}.stat{background:#f0f4fb;border:1px solid #dce6f5;border-radius:6px;padding:10px 16px}.stat-label{font-size:10px;color:#7a90b8;text-transform:uppercase}.stat-value{font-size:20px;font-weight:700;color:#1a3a6b}</style></head><body><h1>' + title + '</h1><div style="font-size:11px;color:#666;margin-bottom:16px">Generated: ' + new Date().toLocaleString() + '</div>' + html + '<script>window.onload=function(){window.print();}<\/script></body></html>');
  win.document.close();
}

function makePDFTable(cols: {key:string;label:string}[], rows: any[]) {
  return '<table><thead><tr>' + cols.map(c=>'<th>'+c.label+'</th>').join('') + '</tr></thead><tbody>' + rows.map(r=>'<tr>'+cols.map(c=>'<td>'+(r[c.key]??'')+'</td>').join('')+'</tr>').join('') + '</tbody></table>';
}

function makePDFSummary(items: {label:string;value:any}[]) {
  return '<div class="summary">' + items.map(i=>'<div class="stat"><div class="stat-label">'+i.label+'</div><div class="stat-value">'+i.value+'</div></div>').join('') + '</div>';
}

function SummaryBar({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {items.map(item => (
        <div key={item.label} style={{ background: '#f0f4fb', border: '1px solid #dce6f5', borderRadius: '6px', padding: '10px 16px', minWidth: '100px' }}>
          <div style={{ fontSize: '10px', color: '#7a90b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1a3a6b' }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ columns, rows }: { columns: { key: string; label: string }[]; rows: Record<string, any>[] }) {
  if (rows.length === 0) return <p style={{ color: '#7a90b8', fontSize: '13px', padding: '16px 0' }}>No data found.</p>;
  return (
    <div style={{ overflowX: 'auto', marginTop: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
        <thead><tr>{columns.map(c => (<th key={c.key} style={{ background: '#1a3a6b', color: '#fff', padding: '8px 12px', textAlign: 'left', fontSize: '11px', whiteSpace: 'nowrap' }}>{c.label}</th>))}</tr></thead>
        <tbody>{rows.map((row, i) => (<tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8faff' }}>{columns.map(c => (<td key={c.key} style={{ padding: '7px 12px', borderBottom: '1px solid #eef2fa', color: '#1a3a6b', whiteSpace: 'nowrap' }}>{c.key === 'status' || c.key === 'condition' ? <Badge variant={row[c.key] as any}>{row[c.key]}</Badge> : String(row[c.key] ?? '—')}</td>))}</tr>))}</tbody>
      </table>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { padding: '7px 10px', fontSize: '13px', border: '1px solid #dce6f5', borderRadius: '6px', color: '#1a3a6b', background: '#f8faff', outline: 'none' };

function FilterBar({ filters, onChange }: { filters: ReportFilters; onChange: (f: ReportFilters) => void }) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div><label style={labelStyle}>From</label><input type="date" value={filters.startDate} max={filters.endDate || today} onChange={e => onChange({ ...filters, startDate: e.target.value })} style={inputStyle} /></div>
      <div><label style={labelStyle}>To</label><input type="date" value={filters.endDate} min={filters.startDate || undefined} max={today} onChange={e => onChange({ ...filters, endDate: e.target.value })} style={inputStyle} /></div>
    </div>
  );
}

function ReportPanel({ title, subtitle, onGenerate, onExportCSV, onExportPDF, loading, data, summary, details }: { title: string; subtitle: string; onGenerate: () => void; onExportCSV: () => void; onExportPDF: () => void; loading: boolean; data: any; summary?: React.ReactNode; details?: React.ReactNode; }) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <Card>
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>{title}</h3>
        <p style={{ fontSize: '12.5px', color: '#7a90b8', marginTop: '3px' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: data ? '16px' : 0 }}>
        <Button size="sm" variant="primary" onClick={() => { setShowDetails(false); onGenerate(); }} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Button>
        <Button size="sm" variant="secondary" onClick={onExportCSV} disabled={!data}>Export CSV</Button>
        <Button size="sm" variant="secondary" onClick={onExportPDF} disabled={!data}>Export PDF</Button>
        {data && <Button size="sm" variant="ghost" onClick={() => setShowDetails(p => !p)}>{showDetails ? '▲ Hide' : '▼ Show Details'}</Button>}
      </div>
      {data && summary}
      {data && showDetails && details}
    </Card>
  );
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({ startDate: '', endDate: '' });
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [error, setError] = useState('');

  const generate = async (type: string, fetcher: () => Promise<any>) => {
    setLoadingReport(type); setError('');
    try { const result = await fetcher() as any; setReportData(prev => ({ ...prev, [type]: result })); }
    catch (err: any) { setError(err.message || 'Failed to generate report'); }
    finally { setLoadingReport(null); }
  };

  const se = (obj: any) => Object.entries(obj).map(([k,v])=>({label:k,value:v as number}));

  const cols = {
    asset:      [{ key: 'assetId', label: 'Asset ID' },{ key: 'name', label: 'Name' },{ key: 'category', label: 'Category' },{ key: 'status', label: 'Status' },{ key: 'condition', label: 'Condition' },{ key: 'workUnit', label: 'Work Unit' },{ key: 'location', label: 'Location' },{ key: 'assignedTo', label: 'Assigned To' },{ key: 'value', label: 'Value (ETB)' },{ key: 'purchaseDate', label: 'Purchase Date' }],
    transfer:   [{ key: 'id', label: 'ID' },{ key: 'assetId', label: 'Asset ID' },{ key: 'assetName', label: 'Asset Name' },{ key: 'from', label: 'From' },{ key: 'fromWorkUnit', label: 'From Unit' },{ key: 'to', label: 'To' },{ key: 'toWorkUnit', label: 'To Unit' },{ key: 'status', label: 'Status' },{ key: 'reason', label: 'Reason' },{ key: 'date', label: 'Date' }],
    inventory:  [{ key: 'assetId', label: 'Asset ID' },{ key: 'name', label: 'Name' },{ key: 'category', label: 'Category' },{ key: 'status', label: 'Status' },{ key: 'condition', label: 'Condition' },{ key: 'workUnit', label: 'Work Unit' },{ key: 'location', label: 'Location' },{ key: 'value', label: 'Value (ETB)' }],
    assignment: [{ key: 'assetId', label: 'Asset ID' },{ key: 'name', label: 'Name' },{ key: 'category', label: 'Category' },{ key: 'condition', label: 'Condition' },{ key: 'workUnit', label: 'Asset Work Unit' },{ key: 'location', label: 'Location' },{ key: 'assignedTo', label: 'Assigned To' },{ key: 'assignedUserWorkUnit', label: 'User Work Unit' },{ key: 'value', label: 'Value (ETB)' }],
    returns:    [{ key: 'assetId', label: 'Asset ID' },{ key: 'assetName', label: 'Asset Name' },{ key: 'returnedBy', label: 'Returned By' },{ key: 'workUnit', label: 'Work Unit' },{ key: 'returnDate', label: 'Return Date' },{ key: 'daysSinceReturn', label: 'Days' },{ key: 'status', label: 'Status' },{ key: 'reason', label: 'Reason' }],
    workUnit:   [{ key: 'workUnit', label: 'Work Unit' },{ key: 'total', label: 'Total' },{ key: 'available', label: 'Available' },{ key: 'assigned', label: 'Assigned' },{ key: 'under_maintenance', label: 'Maintenance' },{ key: 'totalValue', label: 'Total Value (ETB)' }],
    condition:  [{ key: 'assetId', label: 'Asset ID' },{ key: 'name', label: 'Name' },{ key: 'category', label: 'Category' },{ key: 'condition', label: 'Condition' },{ key: 'status', label: 'Status' },{ key: 'workUnit', label: 'Work Unit' },{ key: 'location', label: 'Location' },{ key: 'assignedTo', label: 'Assigned To' },{ key: 'value', label: 'Value (ETB)' }],
    request:    [{ key: 'requestId', label: 'ID' },{ key: 'type', label: 'Type' },{ key: 'assetId', label: 'Asset ID' },{ key: 'assetName', label: 'Asset Name' },{ key: 'requestedBy', label: 'Requested By' },{ key: 'workUnit', label: 'Work Unit' },{ key: 'status', label: 'Status' },{ key: 'priority', label: 'Priority' },{ key: 'date', label: 'Date' }],
  };

  const d = (key: string) => reportData[key];

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 32px', background: '#f0f4fb', minHeight: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a90b8', marginBottom: '6px' }}>REPORTING</div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>Reports</h1>
          <p style={{ fontSize: '13.5px', color: '#7a90b8', margin: '4px 0 0 0' }}>Generate and export system reports</p>
        </div>
        {error && <div style={{ background: '#fdf2f2', border: '1px solid #f0b8b8', color: '#c0392b', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}
        <div style={{ marginBottom: '20px' }}>
          <Card>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Date Range Filter</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <FilterBar filters={filters} onChange={setFilters} />
              {(filters.startDate || filters.endDate) && <Button variant="ghost" size="sm" onClick={() => setFilters({ startDate: '', endDate: '' })}>Clear</Button>}
            </div>
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <ReportPanel title="Asset Status Report" subtitle="All assets grouped by current status" loading={loadingReport === 'asset_status'} data={d('asset_status')} onGenerate={() => generate('asset_status', () => api.getAssetStatusReport(filters))} onExportCSV={() => d('asset_status') && exportCSV('asset-status.csv', d('asset_status').rows, cols.asset.map(c=>c.key))} onExportPDF={() => d('asset_status') && printReport('Asset Status Report', makePDFSummary(se(d('asset_status').summary)) + makePDFTable(cols.asset, d('asset_status').rows))} summary={d('asset_status') && <SummaryBar items={se(d('asset_status').summary)} />} details={d('asset_status') && <DataTable columns={cols.asset} rows={d('asset_status').rows} />} />
          <ReportPanel title="Asset Assignment Report" subtitle="Who holds which asset across all work units" loading={loadingReport === 'asset_assignment'} data={d('asset_assignment')} onGenerate={() => generate('asset_assignment', () => api.getAssetAssignmentReport())} onExportCSV={() => d('asset_assignment') && exportCSV('asset-assignment.csv', d('asset_assignment').rows, cols.assignment.map(c=>c.key))} onExportPDF={() => d('asset_assignment') && printReport('Asset Assignment Report', makePDFSummary([{label:'Total Assigned',value:d('asset_assignment').summary.totalAssigned},{label:'Work Units',value:d('asset_assignment').summary.workUnits}]) + makePDFTable(cols.assignment, d('asset_assignment').rows))} summary={d('asset_assignment') && <SummaryBar items={[{label:'Total Assigned',value:d('asset_assignment').summary.totalAssigned},{label:'Work Units',value:d('asset_assignment').summary.workUnits}]} />} details={d('asset_assignment') && <DataTable columns={cols.assignment} rows={d('asset_assignment').rows} />} />
          <ReportPanel title="Work Unit Asset Summary" subtitle="Asset count and value per department" loading={loadingReport === 'work_unit_summary'} data={d('work_unit_summary')} onGenerate={() => generate('work_unit_summary', () => api.getWorkUnitSummaryReport())} onExportCSV={() => d('work_unit_summary') && exportCSV('work-unit.csv', d('work_unit_summary').rows, cols.workUnit.map(c=>c.key))} onExportPDF={() => d('work_unit_summary') && printReport('Work Unit Summary', makePDFSummary([{label:'Work Units',value:d('work_unit_summary').summary.totalWorkUnits},{label:'Total Assets',value:d('work_unit_summary').summary.totalAssets}]) + makePDFTable(cols.workUnit, d('work_unit_summary').rows))} summary={d('work_unit_summary') && <SummaryBar items={[{label:'Work Units',value:d('work_unit_summary').summary.totalWorkUnits},{label:'Total Assets',value:d('work_unit_summary').summary.totalAssets},{label:'Total Value (ETB)',value:d('work_unit_summary').summary.totalValue}]} />} details={d('work_unit_summary') && <DataTable columns={cols.workUnit} rows={d('work_unit_summary').rows} />} />
          <ReportPanel title="Returns Report" subtitle="All asset returns by status" loading={loadingReport === 'overdue_returns'} data={d('overdue_returns')} onGenerate={() => generate('overdue_returns', () => api.getOverdueReturnsReport())} onExportCSV={() => d('overdue_returns') && exportCSV('returns.csv', d('overdue_returns').rows, cols.returns.map(c=>c.key))} onExportPDF={() => d('overdue_returns') && printReport('Returns Report', makePDFSummary(se(d('overdue_returns').summary)) + makePDFTable(cols.returns, d('overdue_returns').rows))} summary={d('overdue_returns') && <SummaryBar items={se(d('overdue_returns').summary)} />} details={d('overdue_returns') && <DataTable columns={cols.returns} rows={d('overdue_returns').rows} />} />
          <ReportPanel title="Asset Condition Report" subtitle="Assets grouped by physical condition" loading={loadingReport === 'asset_condition'} data={d('asset_condition')} onGenerate={() => generate('asset_condition', () => api.getAssetConditionReport())} onExportCSV={() => d('asset_condition') && exportCSV('condition.csv', d('asset_condition').rows, cols.condition.map(c=>c.key))} onExportPDF={() => d('asset_condition') && printReport('Asset Condition Report', makePDFSummary(se(d('asset_condition').summary)) + makePDFTable(cols.condition, d('asset_condition').rows))} summary={d('asset_condition') && <SummaryBar items={se(d('asset_condition').summary)} />} details={d('asset_condition') && <DataTable columns={cols.condition} rows={d('asset_condition').rows} />} />
          <ReportPanel title="Request Status Summary" subtitle="Requests by status and work unit" loading={loadingReport === 'request_status'} data={d('request_status')} onGenerate={() => generate('request_status', () => api.getRequestStatusReport(filters))} onExportCSV={() => d('request_status') && exportCSV('requests.csv', d('request_status').rows, cols.request.map(c=>c.key))} onExportPDF={() => d('request_status') && printReport('Request Status Summary', makePDFSummary(se(d('request_status').summary)) + makePDFTable(cols.request, d('request_status').rows))} summary={d('request_status') && <SummaryBar items={se(d('request_status').summary)} />} details={d('request_status') && <DataTable columns={cols.request} rows={d('request_status').rows} />} />
          <ReportPanel title="Transfer & Withdrawal Report" subtitle="All transfers in selected date range" loading={loadingReport === 'transfer_history'} data={d('transfer_history')} onGenerate={() => generate('transfer_history', () => api.getTransferReport(filters))} onExportCSV={() => d('transfer_history') && exportCSV('transfers.csv', d('transfer_history').rows, cols.transfer.map(c=>c.key))} onExportPDF={() => d('transfer_history') && printReport('Transfer Report', makePDFSummary(se(d('transfer_history').summary)) + makePDFTable(cols.transfer, d('transfer_history').rows))} summary={d('transfer_history') && <SummaryBar items={se(d('transfer_history').summary)} />} details={d('transfer_history') && <DataTable columns={cols.transfer} rows={d('transfer_history').rows} />} />
          <ReportPanel title="Inventory Summary" subtitle="Total assets by category and department" loading={loadingReport === 'inventory_summary'} data={d('inventory_summary')} onGenerate={() => generate('inventory_summary', () => api.getInventoryReport(filters))} onExportCSV={() => d('inventory_summary') && exportCSV('inventory.csv', d('inventory_summary').rows, cols.inventory.map(c=>c.key))} onExportPDF={() => d('inventory_summary') && printReport('Inventory Summary', makePDFSummary([{label:'Total Assets',value:d('inventory_summary').summary.total},{label:'Total Value',value:d('inventory_summary').summary.totalValue}]) + makePDFTable(cols.inventory, d('inventory_summary').rows))} summary={d('inventory_summary') && <SummaryBar items={[{label:'Total Assets',value:d('inventory_summary').summary.total},{label:'Total Value (ETB)',value:d('inventory_summary').summary.totalValue}]} />} details={d('inventory_summary') && <DataTable columns={cols.inventory} rows={d('inventory_summary').rows} />} />
        </div>
      </div>
    </DashboardLayout>
  );
}