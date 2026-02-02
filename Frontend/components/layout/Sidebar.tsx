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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['all'] },
    { name: 'Assets', href: '/assets', icon: '📦', roles: ['all'] },
    { name: 'Assignments', href: '/assignments', icon: '👤', roles: ['property_officer', 'administrator'] },
    { name: 'Transfers', href: '/transfers', icon: '🔄', roles: ['all'] },
    { name: 'Returns', href: '/returns', icon: '↩️', roles: ['all'] },
    { name: 'Requests', href: '/requests', icon: '📝', roles: ['all'] },
    { name: 'Reports', href: '/reports', icon: '📈', roles: ['administrator', 'property_officer', 'vice_president'] },
    { name: 'Users', href: '/users', icon: '👥', roles: ['administrator'] },
  ];

  const filteredNav = navigation.filter(
    (item) => item.roles.includes('all') || item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-white text-xl font-bold">WDUPMS</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
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
