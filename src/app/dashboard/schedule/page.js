'use client';

import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import styles from '../dashboard.module.css';

export default function SchedulePage() {
  const { t } = useLanguage();

  const schedule = [
    {
      day: "Bazar ertəsi (Monday)",
      classes: [
        { time: "14:00 - 15:30", subject: "SAT Mathematics", room: "Otaq 101", status: "attended" },
        { time: "16:00 - 17:30", subject: "SAT English", room: "Otaq 104", status: "attended" }
      ]
    },
    {
      day: "Çərşənbə (Wednesday)",
      classes: [
        { time: "14:00 - 15:30", subject: "SAT Mathematics", room: "Otaq 101", status: "upcoming" },
        { time: "16:00 - 17:30", subject: "SAT English", room: "Otaq 104", status: "upcoming" }
      ]
    },
    {
      day: "Cümə (Friday)",
      classes: [
        { time: "15:00 - 17:00", subject: "Practice Exam", room: "Main Hall", status: "upcoming" }
      ]
    }
  ];

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>{t.scheduleTitle}</h1>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>{t.scheduleDesc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {schedule.map((dayPlan, idx) => (
          <div key={idx}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} /> {dayPlan.day}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayPlan.classes.map((cls, cIdx) => (
                <div key={cIdx} className={styles.glassCard} style={{ margin: 0, padding: '20px', borderLeft: cls.status === 'attended' ? '3px solid #22c55e' : '3px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>{cls.subject}</h4>
                      <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={14} /> {cls.time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} /> {cls.room}
                        </span>
                      </div>
                    </div>
                    <div>
                      {cls.status === 'attended' ? (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle size={14} /> İştirak etdi
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Gözlənilir
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
