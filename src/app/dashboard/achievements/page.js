'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Trophy, Star, Send, Loader2 } from 'lucide-react';
import styles from '../dashboard.module.css';

export default function AchievementsPage() {
  const { t } = useLanguage();
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Student Data Provided by User
  const students = [
    { name: "Omar Babayev", exam: "SAT", score: "1510", color: "#ffd700" }, // Gold
    { name: "Fatima Yunus", exam: "SAT", score: "1490", color: "#e8e8e8" }, // Silver
    { name: "Rufat Humbatov", exam: "SAT", score: "1490", color: "#e8e8e8" },
    { name: "Aydan Mammadli", exam: "SAT", score: "1470", color: "#cd7f32" }, // Bronze
    { name: "Maryam Hayatova", exam: "SAT", score: "1440", color: "#39C0C6" },
    { name: "Taghizada Samila", exam: "CSCA", score: "Math: 92.5 | Physics: 72.5", color: "#ffd700" },
    { name: "Javad Rahioli", exam: "CSCA", score: "Math: 87.5", color: "#e8e8e8" },
    { name: "Ulvi Ibrahimov", exam: "CSCA", score: "Math: 82.5 | Physics: 67.5", color: "#cd7f32" },
    { name: "Sadig Rahimzade", exam: "CSCA", score: "Math: 82.5 | Physics: 65", color: "#39C0C6" },
    { name: "Alakbarli Jamil", exam: "CSCA", score: "Math: 77.5 | Physics: 50", color: "#39C0C6" },
    { name: "Taghizada Saida", exam: "CSCA", score: "Math: 75", color: "#39C0C6" },
    { name: "Rufat Humbatov", exam: "Duolingo", score: "125", color: "#52c41a" }
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate booking API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setBooking(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>{t.achievementsTitle}</h1>
      <p className={styles.subtitle} style={{ marginBottom: '25px' }}>{t.achievementsSubtitle}</p>

      {success && (
        <div className={`${styles.alertMessage} ${styles.alertSuccess}`}>
          {t.consultationSuccess}
        </div>
      )}

      {/* Leaderboard Cards */}
      {!booking ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            {students.map((student, idx) => (
              <div key={idx} className={styles.glassCard} style={{ margin: 0, padding: '15px 20px', borderLeft: `5px solid ${student.color}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
                  <Trophy size={100} color={student.color} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, marginBottom: '5px' }}>{student.name}</h3>
                    <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem', fontWeight: 600 }}>{student.exam}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ background: `linear-gradient(45deg, ${student.color}33, transparent)`, padding: '8px 15px', borderRadius: '12px', border: `1px solid ${student.color}66` }}>
                      <span style={{ color: student.color, fontWeight: 900, fontSize: '1.2rem', textShadow: `0 0 10px ${student.color}66` }}>
                        {student.score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setBooking(true)} className={styles.primaryBtn} style={{ position: 'sticky', bottom: '90px', zIndex: 10 }}>
            <Star size={20} /> {t.bookConsultation}
          </button>
        </>
      ) : (
        /* Consultation Booking Form */
        <div className={styles.glassCard} style={{ border: '1px solid #ffc107', boxShadow: '0 0 25px rgba(255,193,7,0.2)' }}>
          <h2 className={styles.sectionTitle} style={{ color: '#ffc107' }}>
            <Star size={24} color="#ffc107" /> {t.consultationTitle}
          </h2>
          <p style={{ color: 'var(--gray-light)', marginBottom: '20px' }}>{t.consultationDesc}</p>
          
          <form onSubmit={handleBooking}>
            <label className={styles.inputLabel}>{t.examType}</label>
            <select className={styles.inputField} required style={{ appearance: 'none' }}>
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
              <button type="submit" className={styles.primaryBtn} style={{ flex: 2, background: 'linear-gradient(135deg, #ffc107, #ff9800)' }} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> {t.submitConsultation}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
