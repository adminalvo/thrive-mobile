'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../api/supabase';
import { Home, BookOpen, Settings, Loader2, RefreshCw, Trophy, Calendar, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleReload = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f1219' }}>
        <Loader2 className="animate-spin" size={48} color="#38bdf8" />
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.content}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}>
          <Home size={26} />
        </Link>
        <Link href="/dashboard/schedule" className={`${styles.navItem} ${pathname === '/dashboard/schedule' ? styles.navItemActive : ''}`}>
          <Calendar size={26} />
        </Link>
        <Link href="/dashboard/courses" className={`${styles.navItem} ${pathname === '/dashboard/courses' ? styles.navItemActive : ''}`}>
          <BookOpen size={26} />
        </Link>
        <Link href="/dashboard/achievements" className={`${styles.navItem} ${pathname === '/dashboard/achievements' ? styles.navItemActive : ''}`}>
          <Trophy size={26} />
        </Link>
        <Link href="/dashboard/updates" className={`${styles.navItem} ${pathname === '/dashboard/updates' ? styles.navItemActive : ''}`}>
          <Bell size={26} />
        </Link>
        <Link href="/dashboard/settings" className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.navItemActive : ''}`}>
          <Settings size={26} />
        </Link>
      </nav>
    </div>
  );
}
