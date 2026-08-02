'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from '../dashboard.module.css';

export default function CoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCourses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase
        .from('enrollments')
        .select('progress, courses(title)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setEnrollments(data);
      setLoading(false);
    };
    
    fetchCourses();
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '25px' }}>{t.myCourses}</h1>

      {loading ? (
        <>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </>
      ) : enrollments.length === 0 ? (
        <div className={styles.glassCard} style={{ textAlign: 'center' }}>
          <p style={{ color: '#a4b1d6' }}>{t.noCourses}</p>
        </div>
      ) : (
        enrollments.map((en, idx) => {
          const isCompleted = en.progress === 100;
          return (
            <div key={idx} className={styles.glassCard} style={{ borderLeft: `4px solid ${isCompleted ? '#52c41a' : '#39C0C6'}`, opacity: isCompleted ? 0.7 : 1 }}>
              <h2 className={styles.sectionTitle} style={{ color: isCompleted ? 'var(--gray-light)' : 'var(--white)' }}>
                {isCompleted ? <CheckCircle size={20} color="#52c41a" /> : <BookOpen size={20} color="#39C0C6" />} 
                {en.courses?.title || t.unknownCourse}
              </h2>
              <p className={styles.subtitle} style={{ marginBottom: isCompleted ? '0' : '15px' }}>
                {isCompleted ? t.courseCompleted : `${t.ongoingCourse} ${en.progress}%`}
              </p>
              
              {!isCompleted && (
                <>
                  <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ height: '100%', width: `${en.progress}%`, background: '#39C0C6', transition: 'width 1s ease-in-out' }}></div>
                  </div>

                  <button className={styles.primaryBtn} style={{ padding: '12px' }}>
                    <PlayCircle size={20} /> {t.continueLesson}
                  </button>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
