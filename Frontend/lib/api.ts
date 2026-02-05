const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns { success: true, data: {...} } or { success: true, user: {...} }
      // Extract the actual data if it's wrapped
      if (data.success && data.data) {
        return data.data as T;
      }
      
      return data as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }


  // Auth endpoints
  async login(username: string, password: string, role?: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Asset endpoints
  async getAssets(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.request(`/assets${query}`);
  }

  async getAsset(id: string) {
    return this.request(`/assets/${id}`);
  }

  async createAsset(data: any) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: any) {
    return this.request(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string) {
    return this.request(`/assets/${id}`, { method: 'DELETE' });
  }

  // Assignment endpoints
  async getAssignments() {
    return this.request('/assignments');
  }

  async createAssignment(data: any) {
    return this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transfer endpoints
  async getTransfers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/transfers${query}`);
  }

  async getTransfer(id: string) {
    return this.request(`/transfers/${id}`);
  }

  async createTransfer(data: any) {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveTransfer(id: string, notes?: string) {
    return this.request(`/transfers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectTransfer(id: string, rejectionReason: string) {
    return this.request(`/transfers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async completeTransfer(id: string) {
    return this.request(`/transfers/${id}/complete`, {
      method: 'POST',
    });
  }

  async cancelTransfer(id: string) {
    return this.request(`/transfers/${id}`, {
      method: 'DELETE',
    });
  }

  // Return endpoints
  async getReturns(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/returns${query}`);
  }

  async getReturn(id: string) {
    return this.request(`/returns/${id}`);
  }

  async createReturn(data: any) {
    return this.request('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async receiveReturn(id: string) {
    return this.request(`/returns/${id}/receive`, {
      method: 'POST',
    });
  }

  async inspectReturn(id: string, data: any) {
    return this.request(`/returns/${id}/inspect`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveReturn(id: string) {
    return this.request(`/returns/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectReturn(id: string, inspectionNotes: string) {
    return this.request(`/returns/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ inspectionNotes }),
    });
  }

  // Request endpoints
  async getRequests(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/requests${query}`);
  }

  async getRequest(id: string) {
    return this.request(`/requests/${id}`);
  }

  async createRequest(data: any) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRequest(id: string, data: any) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async reviewRequest(id: string) {
    return this.request(`/requests/${id}/review`, {
      method: 'POST',
    });
  }

  async approveRequest(id: string, approvalNotes?: string) {
    return this.request(`/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalNotes }),
    });
  }

  async rejectRequest(id: string, rejectionReason: string) {
    return this.request(`/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async completeRequest(id: string) {
    return this.request(`/requests/${id}/complete`, {
      method: 'POST',
    });
  }

  async cancelRequest(id: string) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // User management endpoints (administrator only)
  async getUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string, permanent = false) {
    const query = permanent ? '?permanent=true' : '';
    return this.request(`/users/${id}${query}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: string, newPassword: string) {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async getUserStats() {
    return this.request('/users/stats/summary');
  }

  // Audit log endpoints (administrator only)
  async getAuditLogs(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/audit-logs${query}`);
  }

  async getAuditLog(id: string) {
    return this.request(`/audit-logs/${id}`);
  }

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

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getPropertyOfficerStats(params?: { startDate?: string; endDate?: string }) {
    const queryString = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    return this.request(`/dashboard/property-officer-stats${queryString}`);
  }

  // Report endpoints
  async generateReport(filters: any) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }
}

export const api = new ApiClient();
