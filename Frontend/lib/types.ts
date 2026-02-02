// User and Authentication Types
export type UserRole = 
  | 'administrator' 
  | 'vice_president' 
  | 'property_officer' 
  | 'approval_authority' 
  | 'purchase_department' 
  | 'quality_assurance' 
  | 'staff';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Asset Types
export type AssetCategory = 'fixed' | 'fixed_consumable';
export type AssetStatus = 'available' | 'assigned' | 'in_transfer' | 'under_maintenance' | 'disposed';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  value: number;
  purchaseDate: string;
  location: string;
  department?: string;
  status: AssetStatus;
  condition: AssetCondition;
  assignedTo?: string;
  assignedToName?: string;
  description?: string;
  warrantyExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  assetId: string;
  assetName: string;
  assigneeId: string;
  assigneeName: string;
  department: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  conditionAtAssignment: AssetCondition;
  status: 'active' | 'returned';
  createdBy: string;
}

// Transfer Types
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface Transfer {
  id: string;
  assetId: string;
  assetName: string;
  fromUserId: string;
  fromUserName: string;
  fromDepartment: string;
  toUserId: string;
  toUserName: string;
  toDepartment: string;
  reason: string;
  requestDate: string;
  approvalDate?: string;
  completionDate?: string;
  status: TransferStatus;
  approvedBy?: string;
  comments?: string;
}

// Return Types
export type ReturnStatus = 'pending' | 'inspected' | 'completed';

export interface Return {
  id: string;
  assetId: string;
  assetName: string;
  returningUserId: string;
  returningUserName: string;
  returnDate: string;
  conditionOnReturn: AssetCondition;
  reason: string;
  damages?: string;
  status: ReturnStatus;
  inspectedBy?: string;
  inspectionNotes?: string;
}

// Request Types
export type RequestType = 'withdrawal' | 'purchase' | 'transfer';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Request {
  id: string;
  type: RequestType;
  requestedBy: string;
  requestedByName: string;
  department: string;
  assetType?: string;
  quantity?: number;
  purpose: string;
  requestDate: string;
  status: RequestStatus;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Report Types
export type ReportType = 
  | 'asset_status' 
  | 'transfer_history' 
  | 'assignment_report' 
  | 'inventory_summary' 
  | 'audit_trail';

export interface ReportFilter {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: AssetCategory;
  status?: AssetStatus;
}

// Dashboard Stats
export interface DashboardStats {
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  underMaintenance: number;
  pendingTransfers: number;
  pendingReturns: number;
  pendingRequests: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'assignment' | 'transfer' | 'return' | 'registration';
  description: string;
  timestamp: string;
  user: string;
}
