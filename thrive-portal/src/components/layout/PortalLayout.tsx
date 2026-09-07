'use client';

import React, { useState } from 'react';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { useAuth } from '@/context/AuthContext';

export const PortalLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#4CA2B5] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Thrive Portal yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] flex text-slate-100">
      <PortalSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader title={title} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
};
