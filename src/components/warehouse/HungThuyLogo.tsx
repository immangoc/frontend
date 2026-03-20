import { Anchor, Waves, Container } from 'lucide-react';

interface HungThuyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'white';
}

export default function HungThuyLogo({ size = 'md', showText = true, variant = 'default' }: HungThuyLogoProps) {
  const sizes = {
    sm: { logo: 32, icon: 14, text: 'text-sm' },
    md: { logo: 40, icon: 18, text: 'text-base' },
    lg: { logo: 56, icon: 24, text: 'text-xl' },
  };

  const colors = {
    default: {
      bg: 'bg-gradient-to-br from-blue-900 to-blue-700',
      text: 'text-gray-900 dark:text-white',
      subtext: 'text-blue-700 dark:text-blue-400',
    },
    white: {
      bg: 'bg-white',
      text: 'text-white',
      subtext: 'text-white/80',
    },
  };

  const currentSize = sizes[size];
  const currentColor = colors[variant];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <div 
        className={`relative ${currentColor.bg} rounded-xl shadow-lg p-2 flex items-center justify-center`}
        style={{ width: currentSize.logo, height: currentSize.logo }}
      >
        {/* Waves Background */}
        <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-30">
          <Waves className="text-white" size={currentSize.icon * 1.2} />
        </div>
        
        {/* Container Icon */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2">
          <Container className="text-orange-400" size={currentSize.icon * 0.8} />
        </div>
        
        {/* Anchor Icon */}
        <div className="absolute bottom-1">
          <Anchor className="text-white" size={currentSize.icon} />
        </div>
      </div>

      {/* Company Name */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold ${currentSize.text} ${currentColor.text} leading-tight`}>
            Hùng Thủy
          </div>
          <div className={`text-xs ${currentColor.subtext} font-medium`}>
            Port Logistics
          </div>
        </div>
      )}
    </div>
  );
}
