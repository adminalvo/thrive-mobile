'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../api/supabase';
import { Home, BookOpen, Settings, Loader2, RefreshCw } from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
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
        {/* Pass the user object to children if needed via Context, or just let them fetch, but for static layouts children can't receive props directly in Next.js app router. They will fetch their own session, but layout ensures protection. */}
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/dashboard" className={pathname === '/dashboard' ? styles.navItemActive : styles.navItem}>
          <Home size={24} />
          <span className={styles.navLabel}>Əsas</span>
        </Link>
        <Link href="/dashboard/courses" className={pathname === '/dashboard/courses' ? styles.navItemActive : styles.navItem}>
          <BookOpen size={24} />
          <span className={styles.navLabel}>Kurslar</span>
        </Link>
        <Link href="/dashboard/settings" className={pathname === '/dashboard/settings' ? styles.navItemActive : styles.navItem}>
          <Settings size={24} />
          <span className={styles.navLabel}>Ayarlar</span>
        </Link>
      </nav>
    </div>
  );
}
