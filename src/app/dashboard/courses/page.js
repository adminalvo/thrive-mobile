'use client';

import React from 'react';
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';
import styles from '../dashboard.module.css';

export default function CoursesPage() {
  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '25px' }}>Kurslarım</h1>

      {/* Active Course */}
      <div className={styles.glassCard} style={{ borderLeft: '4px solid #39C0C6' }}>
        <h2 className={styles.sectionTitle}>
          <BookOpen size={20} color="#39C0C6" /> Riyaziyyat (Ali)
        </h2>
        <p className={styles.subtitle} style={{ marginBottom: '15px' }}>Davam edən kurs - 80% Tamamlanıb</p>
        
        <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ height: '100%', width: '80%', background: '#39C0C6' }}></div>
        </div>

        <button className={styles.primaryBtn} style={{ padding: '12px' }}>
          <PlayCircle size={20} /> Dərsə Davam Et
        </button>
      </div>

      {/* Another Course */}
      <div className={styles.glassCard} style={{ borderLeft: '4px solid #39C0C6' }}>
        <h2 className={styles.sectionTitle}>
          <BookOpen size={20} color="#39C0C6" /> İngilis Dili (IELTS)
        </h2>
        <p className={styles.subtitle} style={{ marginBottom: '15px' }}>Davam edən kurs - 45% Tamamlanıb</p>
        
        <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ height: '100%', width: '45%', background: '#39C0C6' }}></div>
        </div>

        <button className={styles.primaryBtn} style={{ padding: '12px' }}>
          <PlayCircle size={20} /> Dərsə Davam Et
        </button>
      </div>

      {/* Completed Course */}
      <div className={styles.glassCard} style={{ opacity: 0.7 }}>
        <h2 className={styles.sectionTitle} style={{ color: 'var(--gray-light)' }}>
          <CheckCircle size={20} color="#52c41a" /> Fizika (Ümumi)
        </h2>
        <p className={styles.subtitle} style={{ marginBottom: '0' }}>Kurs Tamamlanıb - 100%</p>
      </div>

    </div>
  );
}
