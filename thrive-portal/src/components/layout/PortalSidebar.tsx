'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  BookOpen,
  CreditCard,
  CheckCircle2,
  Users,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Brain
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SettingsModal } from '../ui/SettingsModal';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const PortalSidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const { profile, role, signOut } = useAuth();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const studentLinks = [
    { href: '/student/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/student/schedule', icon: Calendar, label: t('nav.schedule') },
    { href: '/student/academic', icon: GraduationCap, label: t('nav.academic') },
    { href: '/student/homework', icon: BookOpen, label: t('nav.homework') },
    { href: '/prep', icon: Brain, label: 'ThrivePrep', isPrep: true },
    { href: '/student/finance', icon: CreditCard, label: t('nav.finance') },
    { href: '/student/announcements', icon: Bell, label: t('nav.announcements') },
  ];

  const teacherLinks = [
    { href: '/teacher/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/student/schedule', icon: Calendar, label: t('nav.schedule') },
    { href: '/teacher/attendance', icon: CheckCircle2, label: t('nav.attendance') },
    { href: '/teacher/grading', icon: GraduationCap, label: t('nav.grading') },
    { href: '/teacher/homework', icon: BookOpen, label: t('nav.homework') },
    { href: '/prep', icon: Brain, label: 'ThrivePrep', isPrep: true },
    { href: '/teacher/students', icon: Users, label: t('nav.students') },
    { href: '/teacher/announcements', icon: Bell, label: t('nav.announcements') },
  ];

  const parentLinks = [
    { href: '/parent/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/student/schedule', icon: Calendar, label: t('nav.schedule') },
    { href: '/parent/progress', icon: GraduationCap, label: t('nav.progress') },
    { href: '/prep', icon: Brain, label: 'ThrivePrep', isPrep: true },
    { href: '/parent/finance', icon: CreditCard, label: t('nav.finance') },
    { href: '/parent/announcements', icon: Bell, label: t('nav.announcements') },
  ];

  const links = role === 'teacher' ? teacherLinks : role === 'parent' ? parentLinks : studentLinks;

  return (
    <>
      <aside
        className={cn(
          'h-screen sticky top-0 bg-[#070F1E] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-40 select-none',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div>
          {/* Top Header: Thrive EP & Single Clean Toggle */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80">
            {!collapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-black tracking-wider text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#5ce1e6]">
                    Thrive EP
                  </span>
                </Link>

                <button
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:flex items-center justify-center"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <button
                  onClick={() => setCollapsed(false)}
                  className="p-2 rounded-xl text-[#5ce1e6] hover:bg-slate-800/80 transition-colors flex items-center justify-center group"
                  title="Expand Sidebar"
                >
                  <span className="text-lg font-black group-hover:hidden">EP</span>
                  <ChevronRight className="w-5 h-5 hidden group-hover:block text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className={cn('p-3 space-y-1.5', collapsed && 'px-2')}>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const isPrep = link.isPrep;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center transition-all duration-200 group rounded-2xl relative',
                    collapsed
                      ? 'justify-center p-3 my-1'
                      : 'gap-3 px-3.5 py-2.5 font-semibold text-xs tracking-wide',
                    isActive
                      ? 'bg-[#4CA2B5]/20 text-[#5ce1e6] border border-[#4CA2B5]/40 shadow-lg shadow-[#4CA2B5]/15'
                      : isPrep
                      ? 'text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-[#0D1E36]'
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon
                    className={cn(
                      'transition-transform group-hover:scale-110 shrink-0',
                      collapsed ? 'w-5 h-5' : 'w-4 h-4',
                      isActive
                        ? 'text-[#5ce1e6]'
                        : isPrep
                        ? 'text-amber-400 group-hover:text-amber-300'
                        : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{link.label}</span>
                      {isPrep && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 tracking-wider shadow-sm animate-pulse">
                          Soon
                        </span>
                      )}
                    </div>
                  )}
                  {collapsed && isPrep && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card, Settings & Logout Bottom */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {!collapsed ? (
            <div className="p-3 rounded-2xl bg-[#0D1E36]/90 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#4CA2B5]/20 border border-[#4CA2B5]/40 flex items-center justify-center text-[#5ce1e6] font-black text-xs shrink-0">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{profile?.name || 'User'}</p>
                  <p className="text-[10px] text-[#5ce1e6] uppercase font-bold tracking-wider">{role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={t('nav.settings')}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title={t('common.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={t('nav.settings')}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title={t('common.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
