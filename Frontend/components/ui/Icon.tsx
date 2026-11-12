import { ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: ComponentType<{ className?: string }>;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  'aria-hidden'?: boolean;
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export function Icon({ 
  icon: IconComponent, 
  className = '', 
  size = 'md',
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <IconComponent 
      className={cn(sizeMap[size], className)} 
      aria-hidden={ariaHidden}
    />
  );
}
