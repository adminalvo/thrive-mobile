'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Trophy } from 'lucide-react';
import styles from '../dashboard.module.css';

export default function AchievementsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('SAT');

  const students = [
    { name: "Omar Babayev", exam: "SAT", score: "1510", color: "#ffd700" }, // Gold
    { name: "Fatima Yunus", exam: "SAT", score: "1490", color: "#e8e8e8" }, // Silver
    { name: "Rufat Humbatov", exam: "SAT", score: "1490", color: "#e8e8e8" },
    { name: "Aydan Mammadli", exam: "SAT", score: "1470", color: "#cd7f32" }, // Bronze
    { name: "Maryam Hayatova", exam: "SAT", score: "1440", color: "#38bdf8" },
    { name: "Taghizada Samila", exam: "CSCA", score: "Math: 92.5 | Physics: 72.5", color: "#ffd700" },
    { name: "Javad Rahioli", exam: "CSCA", score: "Math: 87.5", color: "#e8e8e8" },
    { name: "Ulvi Ibrahimov", exam: "CSCA", score: "Math: 82.5 | Physics: 67.5", color: "#cd7f32" },
    { name: "Sadig Rahimzade", exam: "CSCA", score: "Math: 82.5 | Physics: 65", color: "#38bdf8" },
    { name: "Alakbarli Jamil", exam: "CSCA", score: "Math: 77.5 | Physics: 50", color: "#38bdf8" },
    { name: "Taghizada Saida", exam: "CSCA", score: "Math: 75", color: "#38bdf8" },
    { name: "Rufat Humbatov", exam: "Duolingo", score: "125", color: "#22c55e" }
  ];

  const filteredStudents = students.filter(s => s.exam === activeTab);

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>{t.achievementsTitle}</h1>
      <p className={styles.subtitle} style={{ marginBottom: '25px' }}>{t.achievementsSubtitle}</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {['SAT', 'CSCA', 'Duolingo'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: activeTab === tab ? '#38bdf8' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? '#0f1219' : '#94a3b8',
              fontWeight: '600',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leaderboard Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        {filteredStudents.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>No results for this category.</p>
        ) : (
          filteredStudents.map((student, idx) => (
            <div key={idx} className={styles.glassCard} style={{ margin: 0, padding: '15px 20px', borderLeft: `5px solid ${student.color}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
                <Trophy size={100} color={student.color} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600, marginBottom: '5px' }}>{student.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{student.exam}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: `linear-gradient(45deg, ${student.color}33, transparent)`, padding: '8px 15px', borderRadius: '12px', border: `1px solid ${student.color}66` }}>
                    <span style={{ color: student.color, fontWeight: 700, fontSize: '1.1rem' }}>
                      {student.score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
