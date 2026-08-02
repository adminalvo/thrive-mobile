'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Award, BookOpen, Star, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './dashboard.module.css';

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setUser(session.user);
      
      const [enrollRes, gradeRes, attendRes] = await Promise.all([
        supabase.from('enrollments').select('progress, next_lesson, courses(title)').eq('user_id', session.user.id),
        supabase.from('grades').select('exam_name, score').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('attendance').select('month, percentage').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1)
      ]);

      if (enrollRes.data) setEnrollments(enrollRes.data);
      if (gradeRes.data && gradeRes.data.length > 0) setGrades(gradeRes.data[0]);
      if (attendRes.data && attendRes.data.length > 0) setAttendance(attendRes.data[0]);

      // Fetch today's schedule
      const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
      const currentDayName = days[new Date().getDay()];
      const { data: schedData } = await supabase.from('schedules').select('*').eq('day', currentDayName);
      if (schedData) setTodaysSchedule(schedData);

      setLoading(false);
    };
    
    fetchDashboardData();
  }, []);

  if (!user && !loading) return null;

  const role = user?.user_metadata?.role || 'student';
  const firstName = user?.user_metadata?.first_name || t.user;

  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)
    : 0;

  // Formatting date as DD.MM.YYYY
  const today = new Date();
  const currentDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

  const handleReload = () => {
    window.location.reload();
  };

  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      setBookingSuccess(true);
      setBooking(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className={styles.greeting}>{t.hello}, {firstName}!</h1>
          <p className={styles.subtitle} style={{ margin: 0 }}>
            {role === 'parent' ? t.parentSubtitle : t.studentSubtitle}
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: '500', margin: 0 }}>{currentDate}</p>
            <button onClick={handleReload} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className={`${styles.alertMessage} ${styles.alertSuccess}`}>
          {t.consultationSuccess}
        </div>
      )}

      {!booking ? (
        <button onClick={() => setBooking(true)} className={styles.primaryBtn} style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
          <Star size={20} /> {t.bookConsultation}
        </button>
      ) : (
        <div className={styles.glassCard} style={{ border: '1px solid #38bdf8' }}>
          <h2 className={styles.sectionTitle} style={{ color: '#38bdf8' }}>
            <Star size={20} color="#38bdf8" /> {t.consultationTitle}
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '0.9rem' }}>{t.consultationDesc}</p>
          
          <form onSubmit={handleBooking}>
            <label className={styles.inputLabel}>{t.examType}</label>
            <select className={styles.inputField} required style={{ appearance: 'none', background: '#0f1219' }}>
              <option value="SAT">SAT Preparation</option>
              <option value="CSCA">CSCA (Math & Physics)</option>
              <option value="Duolingo">Duolingo English Test</option>
            </select>

            <label className={styles.inputLabel}>{t.fullName}</label>
            <input type="text" className={styles.inputField} required placeholder="Məmməd Məmmədov" />

            <label className={styles.inputLabel}>{t.phoneNumber}</label>
            <input type="tel" className={styles.inputField} required placeholder="+994 51 000 00 00" />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setBooking(false)} className={`${styles.primaryBtn} ${styles.dangerBtn}`} style={{ flex: 1 }}>
                Geri
              </button>
              <button type="submit" className={styles.primaryBtn} style={{ flex: 2 }} disabled={bookingLoading}>
                {bookingLoading ? <Loader2 className="animate-spin" /> : t.submitConsultation}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <>
          <div className={styles.skeletonCard} style={{ height: '200px' }} />
          <div className={styles.skeletonCard} style={{ height: '200px' }} />
        </>
      ) : role === 'student' ? (
        <>
          {/* Today's Schedule Card */}
          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Calendar size={20} color="#38bdf8" /> {t.todaysPlan}</h2>
            {todaysSchedule.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>{t.noCourses || 'Bu gün üçün dərs təyin edilməyib.'}</p>
            ) : (
              todaysSchedule.map((cls, idx) => (
                <div key={idx} style={{ padding: '12px 0', borderBottom: idx !== todaysSchedule.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#f8fafc', fontWeight: 500, fontSize: '1rem' }}>{cls.subject}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} /> {cls.time}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                      {cls.room}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.glassCard} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="#38bdf8" strokeWidth="6" 
                  strokeDasharray="226" strokeDashoffset={226 - (226 * avgProgress) / 100} strokeLinecap="round" 
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s ease-out' }} 
                />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
                {avgProgress}%
              </div>
            </div>
            <div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '5px' }}>{t.progressTitle}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {enrollments.length === 0 ? t.noCourses : `${t.progressAchieved} ${avgProgress}${t.ofYourGoals}`}
              </p>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><BookOpen size={20} color="#38bdf8" /> {t.activeCourses}</h2>
            {enrollments.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>{t.noCourses}</p>
            ) : (
              enrollments.map((en, idx) => (
                <div key={idx} style={{ padding: '15px 0', borderBottom: idx !== enrollments.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#f8fafc', fontWeight: 500 }}>{en.courses?.title || t.unknownCourse}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>{t.nextLesson}: {en.next_lesson || t.notAssigned}</p>
                  </div>
                  <div style={{ color: '#38bdf8', fontWeight: '600' }}>
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
            <h2 className={styles.sectionTitle}><Star size={20} color="#fbbf24" /> {t.childStatus}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#f8fafc', fontWeight: 600 }}>
                  {grades?.score >= 90 ? t.excellent : grades?.score >= 70 ? t.good : t.needsWork}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {t.lastExam}: {grades?.exam_name || t.none} ({grades?.score || 0}/100)
                </p>
              </div>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px', color: '#22c55e' }}>
                <Award size={28} />
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.sectionTitle}><Calendar size={20} color="#38bdf8" /> {t.attendance} ({attendance?.month || t.none})</h2>
            <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '0.9rem' }}>
              {attendance?.percentage === 100 ? t.perfectAttendance : t.missedClasses}
            </p>
            <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${attendance?.percentage || 0}%`, background: '#22c55e' }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.85rem', color: '#22c55e', marginTop: '8px', fontWeight: '500' }}>
              {attendance?.percentage || 0}% {t.participation}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
