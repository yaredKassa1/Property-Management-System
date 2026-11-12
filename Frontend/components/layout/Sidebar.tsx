'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';
import { useLanguage } from '@/lib/contexts';
import { 
  ChartBarIcon,
  ArchiveBoxIcon,
  UserIcon,
  ArrowsRightLeftIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const baseNavigation = [
    { name: t('dashboard'), href: '/dashboard', icon: ChartBarIcon, roles: ['all'] },
    { name: t('assets'), href: '/assets', icon: ArchiveBoxIcon, roles: ['property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff', 'vice_president'] },
    { name: t('assignments'), href: '/assignments', icon: UserIcon, roles: ['property_officer'] },
    { name: t('transfers'), href: '/transfers', icon: ArrowsRightLeftIcon, roles: ['property_officer', 'staff', 'vice_president', 'approval_authority', 'purchase_department', 'quality_assurance'] },
    { name: t('returns'), href: '/returns', icon: ArrowUturnLeftIcon, roles: ['property_officer', 'staff', 'quality_assurance'] },
    { name: t('requests'), href: '/requests', icon: DocumentTextIcon, roles: ['property_officer', 'staff', 'approval_authority', 'purchase_department', 'vice_president'] },
    { name: t('procurement'), href: '/procurement', icon: ShoppingCartIcon, roles: ['purchase_department', 'administrator'] },
    { name: t('vp_approvals'), href: '/vp-approvals', icon: CheckCircleIcon, roles: ['vice_president', 'administrator'] },
    { name: t('qa_inspections'), href: '/qa-inspections', icon: MagnifyingGlassIcon, roles: ['quality_assurance', 'property_officer', 'administrator'] },
    { name: t('reports'), href: '/reports', icon: ChartPieIcon, roles: ['property_officer', 'vice_president', 'approval_authority'] },
  ];

  const adminNavigation = [
    { name: t('dashboard'), href: '/dashboard', icon: ChartBarIcon, roles: ['administrator'] },
    { name: t('user_management'), href: '/users', icon: UsersIcon, roles: ['administrator'] },
    { name: t('audit_logs'), href: '/audit-logs', icon: ClipboardDocumentListIcon, roles: ['administrator'] },
  ];

  const navigation = user.role === 'administrator' ? adminNavigation : baseNavigation;

  const filteredNav = navigation.filter(
    (item) => item.roles.includes('all') || item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-[#1578B8] via-[#1E9FE8] to-[#1578B8] h-screen fixed left-0 top-0 overflow-y-auto shadow-xl">
      {/* Header Section */}
      <div className="flex items-center justify-center h-20 bg-white/10 backdrop-blur-sm flex-shrink-0 border-b border-white/20">
        <div className="text-center">
          <h3 className="text-white font-bold text-lg">WDUPMS</h3>
          <p className="text-white/70 text-xs">Navigation</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative group',
                isActive
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
              <IconComponent className="mr-3 w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {/* Hover indicator */}
              {!isActive && (
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <p className="text-xs text-white/60 text-center">
          Woldia University
        </p>
        <p className="text-xs text-white/40 text-center mt-1">
          Property Management System
        </p>
      </div>
    </div>
  );
}
