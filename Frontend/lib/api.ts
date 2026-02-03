const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Mock data for testing without backend
const MOCK_MODE = true; // Set to false when backend is ready

const mockData = {
  dashboardStats: {
    totalAssets: 1250,
    assignedAssets: 890,
    availableAssets: 320,
    underMaintenance: 40,
    pendingTransfers: 15,
    pendingReturns: 8,
    recentActivities: [
      {
        id: '1',
        description: 'New laptop assigned to John Doe',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '2',
        description: 'Transfer request approved for Office Chair',
        user: 'Property Officer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '3',
        description: 'Asset returned: Projector PJ-001',
        user: 'Staff Member',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: '4',
        description: 'New asset registered: Desktop Computer',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  },
  assets: [
    {
      id: '1',
      assetId: 'WU-LAP-001',
      name: 'Dell Latitude 5420',
      category: 'fixed',
      status: 'assigned',
      location: 'Computer Science Department',
      value: 45000,
      purchaseDate: '2024-01-15',
      serialNumber: 'DL5420-2024-001',
      description: 'Laptop for faculty use',
    },
    {
      id: '2',
      assetId: 'WU-PRJ-001',
      name: 'Epson EB-X41 Projector',
      category: 'fixed',
      status: 'available',
      location: 'Equipment Store',
      value: 28000,
      purchaseDate: '2024-02-20',
      serialNumber: 'EP-EBX41-001',
      description: 'Classroom projector',
    },
    {
      id: '3',
      assetId: 'WU-CHR-045',
      name: 'Office Chair',
      category: 'fixed',
      status: 'assigned',
      location: 'Administration Building',
      value: 3500,
      purchaseDate: '2023-11-10',
      serialNumber: 'OC-2023-045',
      description: 'Ergonomic office chair',
    },
    {
      id: '4',
      assetId: 'WU-DSK-012',
      name: 'HP Desktop Computer',
      category: 'fixed',
      status: 'under_maintenance',
      location: 'IT Department',
      value: 35000,
      purchaseDate: '2023-08-05',
      serialNumber: 'HP-DSK-2023-012',
      description: 'Desktop computer for staff',
    },
    {
      id: '5',
      assetId: 'WU-TBL-089',
      name: 'Conference Table',
      category: 'fixed',
      status: 'available',
      location: 'Meeting Room 2',
      value: 15000,
      purchaseDate: '2023-06-12',
      serialNumber: 'CT-2023-089',
      description: 'Large conference table',
    },
  ],
  transfers: [
    {
      id: '1',
      assetId: '1',
      assetName: 'Dell Latitude 5420',
      fromUserId: '1',
      fromUserName: 'Dr. Ahmed Ali',
      fromDepartment: 'IT Department',
      toUserId: '2',
      toUserName: 'Prof. Sara Mohammed',
      toDepartment: 'Computer Science Department',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: 'pending',
      reason: 'Department needs additional laptop for new faculty',
    },
    {
      id: '2',
      assetId: '3',
      assetName: 'Office Chair',
      fromUserId: '3',
      fromUserName: 'Storage',
      fromDepartment: 'Storage Room',
      toUserId: '4',
      toUserName: 'Ato Bekele Tesfaye',
      toDepartment: 'Administration Building',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      approvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      status: 'approved',
      reason: 'Replacement for damaged chair',
    },
  ],
  returns: [
    {
      id: '1',
      assetId: 'WU-PRJ-001',
      assetName: 'Epson EB-X41 Projector',
      returnedBy: 'Prof. Sara Mohammed',
      returnDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      status: 'pending_inspection',
      reason: 'Course completed',
    },
    {
      id: '2',
      assetId: 'WU-LAP-002',
      assetName: 'HP Laptop',
      returnedBy: 'Dr. Yohannes Kebede',
      returnDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      status: 'completed',
      condition: 'good',
      reason: 'End of assignment period',
    },
  ],
  requests: [
    {
      id: '1',
      itemName: 'Whiteboard Markers',
      quantity: 50,
      requestedBy: 'Ato Mulugeta Assefa',
      department: 'Mathematics Department',
      status: 'pending',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      purpose: 'Classroom teaching supplies',
    },
    {
      id: '2',
      itemName: 'Printer Paper (A4)',
      quantity: 100,
      requestedBy: 'W/ro Tigist Haile',
      department: 'Administration',
      status: 'approved',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      approvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      purpose: 'Office documentation',
    },
  ],
  assignments: [
    {
      id: '1',
      assetId: 'WU-LAP-001',
      assetName: 'Dell Latitude 5420',
      assignedTo: 'Dr. Ahmed Ali',
      assignedBy: 'Property Officer',
      assignmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      status: 'active',
      department: 'Computer Science',
    },
    {
      id: '2',
      assetId: 'WU-CHR-045',
      assetName: 'Office Chair',
      assignedTo: 'Ato Bekele Tesfaye',
      assignedBy: 'Admin User',
      assignmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      status: 'active',
      department: 'Administration',
    },
  ],
};

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
    // Return mock data if in mock mode
    if (MOCK_MODE) {
      return this.getMockData(endpoint, options) as Promise<T>;
    }

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

  private async getMockData(endpoint: string, options: RequestInit): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : null;

    // Auth login
    if (endpoint.includes('/auth/login') && method === 'POST') {
      const username = body?.username || 'user';
      const role = body?.role || 'staff';
      return {
        token: `mock-token-${Date.now()}`,
        user: {
          id: 'mock-user-1',
          username,
          email: `${username}@example.com`,
          fullName: username,
          role,
          department: 'General',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // Auth logout
    if (endpoint.includes('/auth/logout') && method === 'POST') {
      return { success: true };
    }

    // Dashboard stats
    if (endpoint.includes('/dashboard/stats')) {
      return mockData.dashboardStats;
    }

    // Assets
    if (endpoint.includes('/assets') && method === 'GET') {
      return mockData.assets;
    }

    // Transfers
    if (endpoint.includes('/transfers') && method === 'GET') {
      return mockData.transfers;
    }

    // Returns
    if (endpoint.includes('/returns') && method === 'GET') {
      return mockData.returns;
    }

    // Requests
    if (endpoint.includes('/requests') && method === 'GET') {
      return mockData.requests;
    }

    // Assignments
    if (endpoint.includes('/assignments') && method === 'GET') {
      return mockData.assignments;
    }

    // POST/PUT/DELETE operations - return success
    if (method !== 'GET') {
      return { success: true, message: 'Operation completed successfully' };
    }

    return [];
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
