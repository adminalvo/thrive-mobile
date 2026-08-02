'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../api/supabase';
import { Home, BookOpen, Settings, Loader2, RefreshCw, Trophy } from 'lucide-react';
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--deep-navy)' }}>
        <Loader2 className="animate-spin" size={48} color="#39C0C6" />
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }}>
        <button onClick={handleReload} style={{ background: 'rgba(57, 192, 198, 0.1)', border: '1px solid rgba(57,192,198,0.3)', padding: '8px', borderRadius: '50%', color: '#39C0C6' }}>
          <RefreshCw size={20} />
        </button>
      </div>

      <div className={styles.content}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}>
          <Home size={22} />
          <span className={styles.navLabel}>{t.navHome}</span>
        </Link>
        <Link href="/dashboard/courses" className={`${styles.navItem} ${pathname === '/dashboard/courses' ? styles.navItemActive : ''}`}>
          <BookOpen size={22} />
          <span className={styles.navLabel}>{t.navCourses}</span>
        </Link>
        <Link href="/dashboard/achievements" className={`${styles.navItem} ${pathname === '/dashboard/achievements' ? styles.navItemActive : ''}`}>
          <Trophy size={22} />
          <span className={styles.navLabel}>{t.navAchievements}</span>
        </Link>
        <Link href="/dashboard/settings" className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.navItemActive : ''}`}>
          <Settings size={22} />
          <span className={styles.navLabel}>{t.navSettings}</span>
        </Link>
      </nav>
    </div>
  );
}
