'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['all'] },
    { name: 'Assets', href: '/assets', icon: '📦', roles: ['property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff', 'vice_president'] },
    { name: 'Assignments', href: '/assignments', icon: '👤', roles: ['property_officer'] },
    { name: 'Transfers', href: '/transfers', icon: '🔄', roles: ['property_officer', 'staff', 'vice_president', 'approval_authority', 'purchase_department', 'quality_assurance'] },
    { name: 'Returns', href: '/returns', icon: '↩️', roles: ['property_officer', 'staff', 'quality_assurance'] },
    { name: 'Requests', href: '/requests', icon: '📝', roles: ['property_officer', 'staff', 'approval_authority', 'purchase_department', 'vice_president'] },
    { name: 'Reports', href: '/reports', icon: '📈', roles: ['property_officer', 'vice_president', 'approval_authority'] },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['administrator'] },
    { name: 'User Management', href: '/users', icon: '👥', roles: ['administrator'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: '📋', roles: ['administrator'] },
  ];

  const navigation = user.role === 'administrator' ? adminNavigation : baseNavigation;

  const filteredNav = navigation.filter(
    (item) => item.roles.includes('all') || item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col w-64 bg-gray-900 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="flex items-center justify-center h-16 bg-gray-800 flex-shrink-0">
        <h1 className="text-white text-xl font-bold">WDUPMS</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
