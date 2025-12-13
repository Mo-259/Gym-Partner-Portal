import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'neutral' | 'blue' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white/10 text-gray-200',
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-400',
    error: 'bg-red-500/10 text-red-400',
    neutral: 'bg-gray-700/50 text-gray-400',
    blue: 'bg-[#005CFF]/10 text-[#005CFF]',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};