'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../api/supabase';
import styles from '../dashboard.module.css';

export default function CoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    const fetchCoursesAndRegs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [coursesRes, regsRes] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('course_registrations').select('*').eq('user_id', session.user.id)
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (regsRes.data) {
        const regsMap = {};
        regsRes.data.forEach(r => regsMap[r.course_id] = r.status);
        setRegistrations(regsMap);
      }
      setLoading(false);
    };
    fetchCoursesAndRegs();
  }, []);

  const handleRegister = async (courseId) => {
    setRegistering(courseId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('course_registrations').insert([
      { user_id: session.user.id, course_id: courseId }
    ]);

    if (!error) {
      setRegistrations(prev => ({ ...prev, [courseId]: 'pending' }));
    } else {
      alert('Xəta baş verdi: ' + error.message);
    }
    setRegistering(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" color="#38bdf8" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>Kataloq (Kurslar)</h1>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>Aktiv kurslarımıza baxın və qeydiyyatdan keçin.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {courses.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Hazırda heç bir kurs aktiv deyil.</p>
        ) : (
          courses.map(course => {
            const status = registrations[course.id];
            return (
              <div key={course.id} className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600 }}>{course.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>{course.description}</p>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '8px 15px', borderRadius: '8px', fontWeight: 600 }}>
                    {course.monthly_price || 'Pulsuz'}
                  </div>
                </div>
                
                {status === 'pending' ? (
                  <button disabled className={styles.primaryBtn} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                    Gözləmədədir
                  </button>
                ) : status === 'approved' ? (
                  <button disabled className={styles.primaryBtn} style={{ marginTop: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <CheckCircle size={18} /> Təsdiqlənib
                  </button>
                ) : (
                  <button 
                    onClick={() => handleRegister(course.id)} 
                    disabled={registering === course.id}
                    className={styles.primaryBtn} 
                    style={{ marginTop: '10px', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8' }}
                  >
                    {registering === course.id ? <Loader2 className="animate-spin" /> : 'Qeydiyyatdan Keç'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
