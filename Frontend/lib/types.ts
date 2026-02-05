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
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'cancelled';

export interface Transfer {
  id: string;
  assetId: string;
  fromUserId?: string | null;
  toUserId: string;
  fromLocation: string;
  toLocation: string;
  fromDepartment?: string;
  toDepartment?: string;
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  notes?: string;
  requestDate: string;
  approvalDate?: string;
  completionDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  asset?: Asset;
  fromUser?: User;
  toUser?: User;
  requester?: User;
  approver?: User;
}

// Return Types
export type ReturnStatus = 'pending' | 'received' | 'under_inspection' | 'approved' | 'rejected' | 'completed';

export interface Return {
  id: string;
  assetId: string;
  returnedBy: string;
  receivedBy?: string;
  inspectedBy?: string;
  status: ReturnStatus;
  returnCondition?: AssetCondition;
  reason: string;
  inspectionNotes?: string;
  damageDescription?: string;
  returnDate: string;
  receivedDate?: string;
  inspectionDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  asset?: Asset;
  returner?: User;
  receiver?: User;
  inspector?: User;
}

// Request Types
export type RequestType = 'withdrawal' | 'purchase' | 'transfer' | 'maintenance' | 'disposal';
export type RequestStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Request {
  id: string;
  requestType: RequestType;
  assetId?: string;
  itemName: string;
  quantity: number;
  estimatedCost?: number;
  status: RequestStatus;
  priority: RequestPriority;
  requestedBy: string;
  department: string;
  approvedBy?: string;
  purpose: string;
  justification?: string;
  specifications?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  requestDate: string;
  reviewDate?: string;
  approvalDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  asset?: Asset;
  requester?: User;
  approver?: User;
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
