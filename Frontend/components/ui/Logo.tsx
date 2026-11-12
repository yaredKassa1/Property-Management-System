import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, text: 'text-sm' },
  md: { width: 48, height: 48, text: 'text-base' },
  lg: { width: 64, height: 64, text: 'text-lg' },
  xl: { width: 96, height: 96, text: 'text-xl' },
};

export function Logo({ size = 'md', showText = false, className = '' }: LogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <Image
          src="/logo.png"
          alt="Woldia University Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-white ${dimensions.text}`}>
            Woldia University
          </span>
          <span className="text-xs text-gray-300">
            Property Management
          </span>
        </div>
      )}
    </div>
  );
}
