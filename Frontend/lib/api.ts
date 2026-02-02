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

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Asset endpoints
  async getAssets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
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
  async getTransfers() {
    return this.request('/transfers');
  }

  async createTransfer(data: any) {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveTransfer(id: string, comments?: string) {
    return this.request(`/transfers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectTransfer(id: string, reason: string) {
    return this.request(`/transfers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Return endpoints
  async getReturns() {
    return this.request('/returns');
  }

  async createReturn(data: any) {
    return this.request('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async inspectReturn(id: string, data: any) {
    return this.request(`/returns/${id}/inspect`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Request endpoints
  async getRequests() {
    return this.request('/requests');
  }

  async createRequest(data: any) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveRequest(id: string) {
    return this.request(`/requests/${id}/approve`, { method: 'POST' });
  }

  async rejectRequest(id: string, reason: string) {
    return this.request(`/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
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

  // Report endpoints
  async generateReport(filters: any) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }
}

export const api = new ApiClient();
