'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Award, BookOpen, Star, Calendar } from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    fetchUser();
  }, []);

  if (!user) return null;

  const role = user.user_metadata?.role || 'student';
  const firstName = user.user_metadata?.first_name || 'İstifadəçi';

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting}>Salam, {firstName}!</h1>
      <p className={styles.subtitle}>
        {role === 'parent' ? 'Övladınızın təhsilinə nəzarət edin.' : 'Bugünkü təhsil hədəflərinizə çatmağa hazırsınız?'}
      </p>

      {role === 'student' ? (
        // STUDENT DASHBOARD
        <>
          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Award size={20} color="#39C0C6" /> Tərəqqi (Progress)</h2>
            <div className={styles.progressRingContainer}>
              {/* Simple CSS-based circular progress (Futuristic Ring) */}
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(57, 192, 198, 0.2)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#39C0C6" strokeWidth="8" 
                  strokeDasharray="314" strokeDashoffset="78.5" strokeLinecap="round" 
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'all 1s ease-out' }} 
                />
              </svg>
              <div className={styles.progressRingText}>75%</div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '15px', color: 'var(--gray-light)' }}>Siz bu həftə hədəflərinizin 75%-nə çatmısınız!</p>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><BookOpen size={20} color="#39C0C6" /> Aktiv Kurslar</h2>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}>
                <h4>Riyaziyyat (Ali)</h4>
                <p>Növbəti dərs: Sabah, 14:00</p>
              </div>
              <div style={{ color: '#39C0C6', fontWeight: 'bold' }}>80%</div>
            </div>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}>
                <h4>İngilis Dili (IELTS)</h4>
                <p>Növbəti dərs: Cümə, 16:00</p>
              </div>
              <div style={{ color: '#39C0C6', fontWeight: 'bold' }}>45%</div>
            </div>
          </div>
        </>
      ) : (
        // PARENT DASHBOARD
        <>
          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Star size={20} color="#ffc107" /> Övladınızın Statusu</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Əlaçı!</h3>
                <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>Son imtahan: Riyaziyyat (95/100)</p>
              </div>
              <div style={{ background: 'rgba(82, 196, 26, 0.1)', padding: '15px', borderRadius: '50%', border: '1px solid rgba(82, 196, 26, 0.3)' }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Calendar size={20} color="#39C0C6" /> Davamiyyət</h2>
            <p style={{ color: 'var(--gray-light)', marginBottom: '15px' }}>Bu ay övladınız bütün dərslərdə iştirak edib.</p>
            <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: '#52c41a' }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.8rem', color: '#52c41a', marginTop: '5px' }}>100% İştirak</p>
          </div>
        </>
      )}
    </div>
  );
}
