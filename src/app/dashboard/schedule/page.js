'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Calendar, Clock, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../api/supabase';
import styles from '../dashboard.module.css';

export default function SchedulePage() {
  const { t } = useLanguage();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase.from('schedules').select('*').order('created_at', { ascending: false });
      if (data) {
        // Group by day for UI
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.day]) acc[curr.day] = [];
          acc[curr.day].push(curr);
          return acc;
        }, {});
        
        // Convert to array format for rendering
        const formatted = Object.keys(grouped).map(day => ({
          day,
          classes: grouped[day]
        }));
        
        setSchedule(formatted);
      }
      setLoading(false);
    };
    fetchSchedules();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" color="#38bdf8" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>{t.scheduleTitle}</h1>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>{t.scheduleDesc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {schedule.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Heç bir dərs təyin edilməyib.</p>
        ) : (
          schedule.map((dayPlan, idx) => (
            <div key={idx}>
              <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> {dayPlan.day}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayPlan.classes.map((cls, cIdx) => (
                  <div key={cIdx} className={styles.glassCard} style={{ margin: 0, padding: '20px', borderLeft: '3px solid #38bdf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>{cls.subject} ({cls.group_name})</h4>
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
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Gözlənilir
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
