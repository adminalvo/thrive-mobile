'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Card: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({
  children,
  className,
  hover = false,
}) => {
  return (
    <div
      className={cn(
        'bg-[#0D1E36] border border-slate-800/80 rounded-2xl p-5 shadow-xl',
        hover && 'hover:border-[#4CA2B5]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4CA2B5]/5',
        className
      )}
    >
      {children}
    </div>
  );
};
