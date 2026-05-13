const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = { ...options, headers: { ...this.getHeaders(), ...options.headers } };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        const detail = error.errors?.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        throw new Error(detail || error.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data !== undefined) return data.data as T;
      return data as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(username: string, password: string, role?: string) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password, role }) });
  }
  async logout() { return this.request('/auth/logout', { method: 'POST' }); }

  // Assets
  async getAssets(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.request(`/assets${query}`);
  }
  async getAsset(id: string) { return this.request(`/assets/${id}`); }
  async createAsset(data: any) { return this.request('/assets', { method: 'POST', body: JSON.stringify(data) }); }
  async updateAsset(id: string, data: any) { return this.request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteAsset(id: string) { return this.request(`/assets/${id}`, { method: 'DELETE' }); }

  // Transfers
  async getTransfers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/transfers${query}`);
  }
  async getTransfer(id: string) { return this.request(`/transfers/${id}`); }
  async getTransferById(id: string) { return this.request(`/transfers/${id}`); }
  async createTransfer(data: any) { return this.request('/transfers', { method: 'POST', body: JSON.stringify(data) }); }
  async approveTransfer(id: string, data?: any) { return this.request(`/transfers/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }); }
  async rejectTransfer(id: string, rejectionReason: string) { return this.request(`/transfers/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejectionReason }) }); }
  async completeTransfer(id: string, data?: any) { return this.request(`/transfers/${id}/complete`, { method: 'POST', body: JSON.stringify(data || {}) }); }
  async cancelTransfer(id: string) { return this.request(`/transfers/${id}`, { method: 'DELETE' }); }

  // Returns
  async getReturns(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/returns${query}`);
  }
  async getReturn(id: string) { return this.request(`/returns/${id}`); }
  async createReturn(data: any) { return this.request('/returns', { method: 'POST', body: JSON.stringify(data) }); }
  async receiveReturn(id: string) { return this.request(`/returns/${id}/receive`, { method: 'POST' }); }
  async inspectReturn(id: string, data: any) { return this.request(`/returns/${id}/inspect`, { method: 'POST', body: JSON.stringify(data) }); }
  async approveReturn(id: string) { return this.request(`/returns/${id}/approve`, { method: 'POST' }); }
  async rejectReturn(id: string, inspectionNotes: string) { return this.request(`/returns/${id}/reject`, { method: 'POST', body: JSON.stringify({ inspectionNotes }) }); }

  // Requests
  async getRequests(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/requests${query}`);
  }
  async getRequest(id: string) { return this.request(`/requests/${id}`); }
  async createRequest(data: any) { return this.request('/requests', { method: 'POST', body: JSON.stringify(data) }); }
  async updateRequest(id: string, data: any) { return this.request(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async reviewRequest(id: string) { return this.request(`/requests/${id}/review`, { method: 'POST' }); }
  async approveRequest(id: string, approvalNotes?: string, permittedAmount?: number, approverSignature?: string) {
    return this.request(`/requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ approvalNotes, permittedAmount, approverSignature }) });
  }
  async rejectRequest(id: string, rejectionReason: string) { return this.request(`/requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejectionReason }) }); }
  async completeRequest(id: string, completerSignature?: string) { return this.request(`/requests/${id}/complete`, { method: 'POST', body: JSON.stringify({ completerSignature }) }); }
  async cancelRequest(id: string) { return this.request(`/requests/${id}`, { method: 'DELETE' }); }

  // Procurement (purchase_department)
  async getProcurementRequests(params?: Record<string, string>) {
    const query = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params)}` : '';
    const url = `${API_URL}/requests/procurement/list${query}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }
  async processProcurement(id: string, data: {
    procurementStatus: 'procurement_in_progress' | 'purchased' | 'delivered';
    supplierName?: string;
    supplierContact?: string;
    quotationAmount?: number;
    purchaseOrderNumber?: string;
    procurementNotes?: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
  }) {
    return this.request(`/requests/${id}/procurement`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Users
  async getUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`);
  }
  async getUser(id: string) { return this.request(`/users/${id}`); }
  async createUser(data: any) { return this.request('/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id: string, data: any) { return this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteUser(id: string, permanent = false) { return this.request(`/users/${id}${permanent ? '?permanent=true' : ''}`, { method: 'DELETE' }); }
  async resetUserPassword(id: string, newPassword: string) { return this.request(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }); }
  async changePassword(currentPassword: string, newPassword: string) { return this.request('/users/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }); }
  async getUserStats() { return this.request('/users/stats/summary'); }
  async getApprovalAuthorities() { return this.request('/users/approval-authorities'); }
  async getFilteredApprovalAuthorities() { return this.request('/users/approval-authorities/filtered'); }

  // Audit logs
  async getAuditLogs(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/audit-logs${query}`);
  }
  async getAuditLog(id: string) { return this.request(`/audit-logs/${id}`); }
  async getUserAuditLogs(userId: string, params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/audit-logs/user/${userId}${query}`);
  }
  async getAuditLogStats(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/audit-logs/stats/summary${query}`);
  }
  async getSecurityEvents(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/audit-logs/security/events${query}`);
  }

  // Notifications
  async getNotifications() { return this.request('/notifications'); }
  async markNotificationRead(id: string) { return this.request(`/notifications/${id}/read`, { method: 'POST' }); }

  // QA Inspections
  async getProcurementInspections(params?: Record<string, string>) {
    const query = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params)}` : '';
    const url = `${API_URL}/qa-inspections${query}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json(); // return full response including stats
  }
  async getProcurementInspection(id: string) { return this.request(`/qa-inspections/${id}`); }
  async submitProcurementInspection(id: string, data: {
    result: 'approved' | 'rejected' | 'needs_correction';
    assessedCondition: string;
    remarks?: string;
    rejectionReason?: string;
    correctionRequired?: string;
  }) {
    return this.request(`/qa-inspections/${id}/inspect`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Procurement Workflows
  async getWorkflow(id: string) { return this.request(`/workflows/${id}`); }
  async approveWorkflow(id: string, decision: 'approve' | 'reject', comments?: string, permittedAmount?: number) {
    return this.request(`/workflows/${id}/approve`, { method: 'POST', body: JSON.stringify({ decision, comments, permittedAmount }) });
  }
  async propertyOfficerComplete(id: string) {
    return this.request(`/workflows/${id}/property-officer-complete`, { method: 'POST' });
  }
  async markProcured(id: string, procurementDetails?: any) {
    return this.request(`/workflows/${id}/mark-procured`, { method: 'POST', body: JSON.stringify({ procurementDetails }) });
  }
  async qaInspect(id: string, decision: 'approve' | 'reject', comments?: string, inspectionDetails?: any) {
    const payload: any = { decision };
    if (comments) payload.comments = comments;
    if (inspectionDetails) payload.inspectionDetails = inspectionDetails;
    return this.request(`/workflows/${id}/qa-inspect`, { method: 'POST', body: JSON.stringify(payload) });
  }
  async collectItem(requestId: string) {
    return this.request(`/requests/${requestId}/collect`, { method: 'POST' });
  }

  // Dashboard
  async getDashboardStats() { return this.request('/dashboard/stats'); }
  async getPropertyOfficerStats(params?: { startDate?: string; endDate?: string }) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.request(`/dashboard/property-officer-stats${query}`);
  }

  // Reports
  async generateReport(filters: any) { return this.request('/reports/generate', { method: 'POST', body: JSON.stringify(filters) }); }
  async getAssetStatusReport(filters?: any) { return this.request('/reports/asset-status', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getAssetAssignmentReport(filters?: any) { return this.request('/reports/asset-assignment', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getWorkUnitSummaryReport(filters?: any) { return this.request('/reports/work-unit-summary', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getOverdueReturnsReport(filters?: any) { return this.request('/reports/overdue-returns', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getAssetConditionReport(filters?: any) { return this.request('/reports/asset-condition', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getRequestStatusReport(filters?: any) { return this.request('/reports/request-status', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getTransferReport(filters?: any) { return this.request('/reports/transfers', { method: 'POST', body: JSON.stringify(filters || {}) }); }
  async getInventoryReport(filters?: any) { return this.request('/reports/inventory', { method: 'POST', body: JSON.stringify(filters || {}) }); }
}

export const api = new ApiClient();
