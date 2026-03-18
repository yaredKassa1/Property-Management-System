import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_transfer: 'bg-yellow-100 text-yellow-800',
    under_maintenance: 'bg-orange-100 text-orange-800',
    disposed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-orange-600',
    damaged: 'text-red-600',
  };
  return colors[condition] || 'text-gray-600';
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    administrator: 'Administrator',
    vice_president: 'Vice President',
    property_officer: 'Property Officer',
    approval_authority: 'Approval Authority',
    purchase_department: 'Purchase Department',
    quality_assurance: 'Quality Assurance',
    staff: 'Staff',
  };
  return labels[role] || role;
}

export function getDefaultRouteForRole(role: string): string {
  const routes: Record<string, string> = {
    administrator: '/dashboard',
    vice_president: '/reports',
    property_officer: '/assignments',
    approval_authority: '/transfers',
    purchase_department: '/requests',
    quality_assurance: '/returns',
    staff: '/requests',
  };

  return routes[role] || '/dashboard';
}
