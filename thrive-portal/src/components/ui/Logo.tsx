'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-20 sm:h-24 md:h-28',
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Thrive"
        className={`${heights[size]} w-auto object-contain drop-shadow-[0_0_25px_rgba(92,225,230,0.5)] transition-all`}
      />
    </div>
  );
};
