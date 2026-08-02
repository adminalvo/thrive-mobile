'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Award, BookOpen, Star, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './dashboard.module.css';

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setUser(session.user);
      
      // Fetch dynamic data
      const [enrollRes, gradeRes, attendRes] = await Promise.all([
        supabase.from('enrollments').select('progress, next_lesson, courses(title)').eq('user_id', session.user.id),
        supabase.from('grades').select('exam_name, score').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('attendance').select('month, percentage').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1)
      ]);

      if (enrollRes.data) setEnrollments(enrollRes.data);
      if (gradeRes.data && gradeRes.data.length > 0) setGrades(gradeRes.data[0]);
      if (attendRes.data && attendRes.data.length > 0) setAttendance(attendRes.data[0]);

      setLoading(false);
    };
    
    fetchDashboardData();
  }, []);

  if (!user && !loading) return null;

  const role = user?.user_metadata?.role || 'student';
  const firstName = user?.user_metadata?.first_name || t.user;

  // Calculate overall progress
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)
    : 0;

  const currentDate = new Date().toLocaleDateString('az-AZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting}>{t.hello}, {firstName}!</h1>
      <p style={{ color: '#39C0C6', fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>{currentDate}</p>
      <p className={styles.subtitle}>
        {role === 'parent' ? t.parentSubtitle : t.studentSubtitle}
      </p>

      {loading ? (
        <>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </>
      ) : role === 'student' ? (
        // STUDENT DASHBOARD
        <>
          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Award size={24} color="#39C0C6" /> {t.progressTitle}</h2>
            <div className={styles.progressRingContainer}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(57, 192, 198, 0.1)" strokeWidth="10" />
                <circle cx="70" cy="70" r="60" fill="none" stroke="#39C0C6" strokeWidth="10" 
                  strokeDasharray="377" strokeDashoffset={377 - (377 * avgProgress) / 100} strokeLinecap="round" 
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s ease-out' }} 
                />
              </svg>
              <div className={styles.progressRingText}>{avgProgress}%</div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#a4b1d6', fontWeight: 500 }}>
              {enrollments.length === 0 ? t.noCourses : `${t.progressAchieved} ${avgProgress}${t.ofYourGoals}`}
            </p>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><BookOpen size={24} color="#39C0C6" /> {t.activeCourses}</h2>
            {enrollments.length === 0 ? (
              <p style={{ color: 'var(--gray-light)' }}>{t.noCourses}</p>
            ) : (
              enrollments.map((en, idx) => (
                <div key={idx} className={styles.courseItem}>
                  <div className={styles.courseInfo}>
                    <h4>{en.courses?.title || t.unknownCourse}</h4>
                    <p>{t.nextLesson}: {en.next_lesson || t.notAssigned}</p>
                  </div>
                  <div style={{ color: '#39C0C6', fontWeight: '900', fontSize: '1.2rem', textShadow: '0 0 10px rgba(57,192,198,0.3)' }}>
                    {en.progress}%
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        // PARENT DASHBOARD
        <>
          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Star size={24} color="#ffc107" /> {t.childStatus}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#fff', fontWeight: 800 }}>
                  {grades?.score >= 90 ? t.excellent : grades?.score >= 70 ? t.good : t.needsWork}
                </h3>
                <p style={{ color: '#a4b1d6', fontSize: '0.95rem' }}>
                  {t.lastExam}: {grades?.exam_name || t.none} ({grades?.score || 0}/100)
                </p>
              </div>
              <div style={{ background: 'rgba(82, 196, 26, 0.15)', padding: '15px', borderRadius: '50%', border: '1px solid rgba(82, 196, 26, 0.4)', boxShadow: '0 0 15px rgba(82,196,26,0.3)' }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span>
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Calendar size={24} color="#39C0C6" /> {t.attendance} ({attendance?.month || t.none})</h2>
            <p style={{ color: '#a4b1d6', marginBottom: '18px', fontWeight: 500 }}>
              {attendance?.percentage === 100 ? t.perfectAttendance : t.missedClasses}
            </p>
            <div style={{ height: '12px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${attendance?.percentage || 0}%`, background: 'linear-gradient(90deg, #52c41a, #73d13d)' }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.9rem', color: '#73d13d', marginTop: '8px', fontWeight: 'bold' }}>
              {attendance?.percentage || 0}% {t.participation}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
