'use client';

import { useState } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/contexts';

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
  const { t } = useLanguage();
  if (rows.length === 0) return <p style={{ color: '#7a90b8', fontSize: '13px', padding: '16px 0' }}>{t('message_no_data')}</p>;
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
  const { t } = useLanguage();
  const today = new Date().toISOString().split('T')[0];
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div><label style={labelStyle}>{t('filter_from')}</label><input type="date" value={filters.startDate} max={filters.endDate || today} onChange={e => onChange({ ...filters, startDate: e.target.value })} style={inputStyle} /></div>
      <div><label style={labelStyle}>{t('filter_to')}</label><input type="date" value={filters.endDate} min={filters.startDate || undefined} max={today} onChange={e => onChange({ ...filters, endDate: e.target.value })} style={inputStyle} /></div>
    </div>
  );
}

function ReportPanel({ title, subtitle, onGenerate, onExportCSV, onExportPDF, loading, data, summary, details }: { title: string; subtitle: string; onGenerate: () => void; onExportCSV: () => void; onExportPDF: () => void; loading: boolean; data: any; summary?: React.ReactNode; details?: React.ReactNode; }) {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  return (
    <Card>
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>{title}</h3>
        <p style={{ fontSize: '12.5px', color: '#7a90b8', marginTop: '3px' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: data ? '16px' : 0 }}>
        <Button size="sm" variant="primary" onClick={() => { setShowDetails(false); onGenerate(); }} disabled={loading}>{loading ? t('button_generating') : t('button_generate')}</Button>
        <Button size="sm" variant="secondary" onClick={onExportCSV} disabled={!data}>{t('button_export_csv')}</Button>
        <Button size="sm" variant="secondary" onClick={onExportPDF} disabled={!data}>{t('button_export_pdf')}</Button>
        {data && <Button size="sm" variant="ghost" onClick={() => setShowDetails(p => !p)}>{showDetails ? t('button_hide_details') : t('button_show_details')}</Button>}
      </div>
      {data && summary}
      {data && showDetails && details}
    </Card>
  );
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>({ startDate: '', endDate: '' });
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [error, setError] = useState('');

  const generate = async (type: string, fetcher: () => Promise<any>) => {
    setLoadingReport(type); setError('');
    try { const result = await fetcher() as any; setReportData(prev => ({ ...prev, [type]: result })); }
    catch (err: any) { setError(err.message || t('message_error_generate')); }
    finally { setLoadingReport(null); }
  };

  const se = (obj: any) => Object.entries(obj).map(([k,v])=>({label:k,value:v as number}));

  const cols = {
    asset:      [{ key: 'assetId', label: t('col_asset_id') },{ key: 'name', label: t('col_name') },{ key: 'category', label: t('col_category') },{ key: 'status', label: t('status') },{ key: 'condition', label: t('condition') },{ key: 'workUnit', label: t('col_work_unit') },{ key: 'location', label: t('location') },{ key: 'assignedTo', label: t('col_assigned_to') },{ key: 'value', label: t('col_value') },{ key: 'purchaseDate', label: t('col_purchase_date') }],
    transfer:   [{ key: 'id', label: t('col_id') },{ key: 'assetId', label: t('col_asset_id') },{ key: 'assetName', label: t('asset_name_col') },{ key: 'from', label: t('col_from') },{ key: 'fromWorkUnit', label: t('col_from_unit') },{ key: 'to', label: t('col_to') },{ key: 'toWorkUnit', label: t('col_to_unit') },{ key: 'status', label: t('status') },{ key: 'reason', label: t('col_reason') },{ key: 'date', label: t('date') }],
    inventory:  [{ key: 'assetId', label: t('col_asset_id') },{ key: 'name', label: t('col_name') },{ key: 'category', label: t('col_category') },{ key: 'status', label: t('status') },{ key: 'condition', label: t('condition') },{ key: 'workUnit', label: t('col_work_unit') },{ key: 'location', label: t('location') },{ key: 'value', label: t('col_value') }],
    assignment: [{ key: 'assetId', label: t('col_asset_id') },{ key: 'name', label: t('col_name') },{ key: 'category', label: t('col_category') },{ key: 'condition', label: t('condition') },{ key: 'workUnit', label: t('col_asset_work_unit') },{ key: 'location', label: t('location') },{ key: 'assignedTo', label: t('col_assigned_to') },{ key: 'assignedUserWorkUnit', label: t('col_user_work_unit') },{ key: 'value', label: t('col_value') }],
    returns:    [{ key: 'assetId', label: t('col_asset_id') },{ key: 'assetName', label: t('asset_name_col') },{ key: 'returnedBy', label: t('returned_by_col') },{ key: 'workUnit', label: t('col_work_unit') },{ key: 'returnDate', label: t('return_date_col') },{ key: 'daysSinceReturn', label: t('col_days') },{ key: 'status', label: t('status') },{ key: 'reason', label: t('col_reason') }],
    workUnit:   [{ key: 'workUnit', label: t('col_work_unit') },{ key: 'total', label: t('total') },{ key: 'available', label: t('col_available') },{ key: 'assigned', label: t('assigned') },{ key: 'under_maintenance', label: t('col_maintenance') },{ key: 'totalValue', label: t('col_total_value') }],
    condition:  [{ key: 'assetId', label: t('col_asset_id') },{ key: 'name', label: t('col_name') },{ key: 'category', label: t('col_category') },{ key: 'condition', label: t('condition') },{ key: 'status', label: t('status') },{ key: 'workUnit', label: t('col_work_unit') },{ key: 'location', label: t('location') },{ key: 'assignedTo', label: t('col_assigned_to') },{ key: 'value', label: t('col_value') }],
    request:    [{ key: 'requestId', label: t('col_request_id') },{ key: 'type', label: t('type') },{ key: 'assetId', label: t('col_asset_id') },{ key: 'assetName', label: t('asset_name_col') },{ key: 'requestedBy', label: t('requested_by') },{ key: 'workUnit', label: t('col_work_unit') },{ key: 'status', label: t('status') },{ key: 'priority', label: t('priority') },{ key: 'date', label: t('date') }],
  };

  const d = (key: string) => reportData[key];

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 32px', background: '#f0f4fb', minHeight: '100%' }}>
        {/* Professional Header Card with Short Accent Line */}
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '24px' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>{t('reports_page_title')}</h1>
              {/* Short Horizontal Accent Line */}
              <div style={{ height: '4px', width: '64px', background: 'linear-gradient(to right, #2563eb, #4f46e5)', borderRadius: '9999px', marginBottom: '12px' }}></div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{t('reports_page_subtitle')}</p>
            </div>
          </div>
        </div>
        {error && <div style={{ background: '#fdf2f2', border: '1px solid #f0b8b8', color: '#c0392b', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}
        <div style={{ marginBottom: '20px' }}>
          <Card>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{t('filter_date_range')}</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <FilterBar filters={filters} onChange={setFilters} />
              {(filters.startDate || filters.endDate) && <Button variant="ghost" size="sm" onClick={() => setFilters({ startDate: '', endDate: '' })}>{t('button_clear_filters')}</Button>}
            </div>
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <ReportPanel title={t('report_asset_status')} subtitle={t('subtitle_asset_status')} loading={loadingReport === 'asset_status'} data={d('asset_status')} onGenerate={() => generate('asset_status', () => api.getAssetStatusReport(filters))} onExportCSV={() => d('asset_status') && exportCSV('asset-status.csv', d('asset_status').rows, cols.asset.map(c=>c.key))} onExportPDF={() => d('asset_status') && printReport(t('report_asset_status'), makePDFSummary(se(d('asset_status').summary)) + makePDFTable(cols.asset, d('asset_status').rows))} summary={d('asset_status') && <SummaryBar items={se(d('asset_status').summary)} />} details={d('asset_status') && <DataTable columns={cols.asset} rows={d('asset_status').rows} />} />
          <ReportPanel title={t('report_asset_assignment')} subtitle={t('subtitle_asset_assignment')} loading={loadingReport === 'asset_assignment'} data={d('asset_assignment')} onGenerate={() => generate('asset_assignment', () => api.getAssetAssignmentReport())} onExportCSV={() => d('asset_assignment') && exportCSV('asset-assignment.csv', d('asset_assignment').rows, cols.assignment.map(c=>c.key))} onExportPDF={() => d('asset_assignment') && printReport(t('report_asset_assignment'), makePDFSummary([{label:t('summary_total_assigned'),value:d('asset_assignment').summary.totalAssigned},{label:t('summary_work_units'),value:d('asset_assignment').summary.workUnits}]) + makePDFTable(cols.assignment, d('asset_assignment').rows))} summary={d('asset_assignment') && <SummaryBar items={[{label:t('summary_total_assigned'),value:d('asset_assignment').summary.totalAssigned},{label:t('summary_work_units'),value:d('asset_assignment').summary.workUnits}]} />} details={d('asset_assignment') && <DataTable columns={cols.assignment} rows={d('asset_assignment').rows} />} />
          <ReportPanel title={t('report_work_unit')} subtitle={t('subtitle_work_unit')} loading={loadingReport === 'work_unit_summary'} data={d('work_unit_summary')} onGenerate={() => generate('work_unit_summary', () => api.getWorkUnitSummaryReport())} onExportCSV={() => d('work_unit_summary') && exportCSV('work-unit.csv', d('work_unit_summary').rows, cols.workUnit.map(c=>c.key))} onExportPDF={() => d('work_unit_summary') && printReport(t('report_work_unit'), makePDFSummary([{label:t('summary_work_units'),value:d('work_unit_summary').summary.totalWorkUnits},{label:t('summary_total_assets'),value:d('work_unit_summary').summary.totalAssets}]) + makePDFTable(cols.workUnit, d('work_unit_summary').rows))} summary={d('work_unit_summary') && <SummaryBar items={[{label:t('summary_work_units'),value:d('work_unit_summary').summary.totalWorkUnits},{label:t('summary_total_assets'),value:d('work_unit_summary').summary.totalAssets},{label:t('summary_total_value'),value:d('work_unit_summary').summary.totalValue}]} />} details={d('work_unit_summary') && <DataTable columns={cols.workUnit} rows={d('work_unit_summary').rows} />} />
          <ReportPanel title={t('report_returns')} subtitle={t('subtitle_returns')} loading={loadingReport === 'overdue_returns'} data={d('overdue_returns')} onGenerate={() => generate('overdue_returns', () => api.getOverdueReturnsReport())} onExportCSV={() => d('overdue_returns') && exportCSV('returns.csv', d('overdue_returns').rows, cols.returns.map(c=>c.key))} onExportPDF={() => d('overdue_returns') && printReport(t('report_returns'), makePDFSummary(se(d('overdue_returns').summary)) + makePDFTable(cols.returns, d('overdue_returns').rows))} summary={d('overdue_returns') && <SummaryBar items={se(d('overdue_returns').summary)} />} details={d('overdue_returns') && <DataTable columns={cols.returns} rows={d('overdue_returns').rows} />} />
          <ReportPanel title={t('report_condition')} subtitle={t('subtitle_condition')} loading={loadingReport === 'asset_condition'} data={d('asset_condition')} onGenerate={() => generate('asset_condition', () => api.getAssetConditionReport())} onExportCSV={() => d('asset_condition') && exportCSV('condition.csv', d('asset_condition').rows, cols.condition.map(c=>c.key))} onExportPDF={() => d('asset_condition') && printReport(t('report_condition'), makePDFSummary(se(d('asset_condition').summary)) + makePDFTable(cols.condition, d('asset_condition').rows))} summary={d('asset_condition') && <SummaryBar items={se(d('asset_condition').summary)} />} details={d('asset_condition') && <DataTable columns={cols.condition} rows={d('asset_condition').rows} />} />
          <ReportPanel title={t('report_request_status')} subtitle={t('subtitle_request_status')} loading={loadingReport === 'request_status'} data={d('request_status')} onGenerate={() => generate('request_status', () => api.getRequestStatusReport(filters))} onExportCSV={() => d('request_status') && exportCSV('requests.csv', d('request_status').rows, cols.request.map(c=>c.key))} onExportPDF={() => d('request_status') && printReport(t('report_request_status'), makePDFSummary(se(d('request_status').summary)) + makePDFTable(cols.request, d('request_status').rows))} summary={d('request_status') && <SummaryBar items={se(d('request_status').summary)} />} details={d('request_status') && <DataTable columns={cols.request} rows={d('request_status').rows} />} />
          <ReportPanel title={t('report_transfer')} subtitle={t('subtitle_transfer')} loading={loadingReport === 'transfer_history'} data={d('transfer_history')} onGenerate={() => generate('transfer_history', () => api.getTransferReport(filters))} onExportCSV={() => d('transfer_history') && exportCSV('transfers.csv', d('transfer_history').rows, cols.transfer.map(c=>c.key))} onExportPDF={() => d('transfer_history') && printReport(t('report_transfer'), makePDFSummary(se(d('transfer_history').summary)) + makePDFTable(cols.transfer, d('transfer_history').rows))} summary={d('transfer_history') && <SummaryBar items={se(d('transfer_history').summary)} />} details={d('transfer_history') && <DataTable columns={cols.transfer} rows={d('transfer_history').rows} />} />
          <ReportPanel title={t('report_inventory')} subtitle={t('subtitle_inventory')} loading={loadingReport === 'inventory_summary'} data={d('inventory_summary')} onGenerate={() => generate('inventory_summary', () => api.getInventoryReport(filters))} onExportCSV={() => d('inventory_summary') && exportCSV('inventory.csv', d('inventory_summary').rows, cols.inventory.map(c=>c.key))} onExportPDF={() => d('inventory_summary') && printReport(t('report_inventory'), makePDFSummary([{label:t('summary_total_assets'),value:d('inventory_summary').summary.total},{label:t('summary_total_value'),value:d('inventory_summary').summary.totalValue}]) + makePDFTable(cols.inventory, d('inventory_summary').rows))} summary={d('inventory_summary') && <SummaryBar items={[{label:t('summary_total_assets'),value:d('inventory_summary').summary.total},{label:t('summary_total_value'),value:d('inventory_summary').summary.totalValue}]} />} details={d('inventory_summary') && <DataTable columns={cols.inventory} rows={d('inventory_summary').rows} />} />
        </div>
      </div>
    </DashboardLayout>
  );
}