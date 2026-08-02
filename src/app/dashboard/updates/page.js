'use client';

import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Bell, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import styles from '../dashboard.module.css';

const updatesData = {
  az: [
    { 
      version: "2.1.0", 
      date: "03 Avqust, 2026", 
      title: "Yeni Dizayn və Yeniliklər Sistemi", 
      desc: "Tətbiqin əsas ekranı yeniləndi. Yeni 'Yeniliklər' bölməsi əlavə olundu.",
      icon: <Sparkles size={24} color="#38bdf8" />
    },
    { 
      version: "2.0.5", 
      date: "01 Avqust, 2026", 
      title: "Təhlükəsizlik və Sürət", 
      desc: "Supabase təhlükəsizliyi artırıldı, şifrə dəyişmə paneli aktivləşdirildi və performans optimizasiyaları edildi.",
      icon: <ShieldCheck size={24} color="#22c55e" />
    },
    { 
      version: "2.0.0", 
      date: "25 İyul, 2026", 
      title: "Admin Panel və Konsultasiyalar", 
      desc: "Tam funksional Admin Panel, tələbə müraciətləri və kurs qeydiyyat sistemi istifadəyə verildi.",
      icon: <Zap size={24} color="#f59e0b" />
    }
  ],
  en: [
    { 
      version: "2.1.0", 
      date: "August 03, 2026", 
      title: "New Design & Updates System", 
      desc: "The main screen of the application has been updated. A new 'Updates' section has been added.",
      icon: <Sparkles size={24} color="#38bdf8" />
    },
    { 
      version: "2.0.5", 
      date: "August 01, 2026", 
      title: "Security & Performance", 
      desc: "Supabase security improved, password change panel activated, and performance optimized.",
      icon: <ShieldCheck size={24} color="#22c55e" />
    },
    { 
      version: "2.0.0", 
      date: "July 25, 2026", 
      title: "Admin Panel & Consultations", 
      desc: "Fully functional Admin Panel, student applications, and course registration system released.",
      icon: <Zap size={24} color="#f59e0b" />
    }
  ],
  ru: [
    { 
      version: "2.1.0", 
      date: "03 Август, 2026", 
      title: "Новый дизайн и система обновлений", 
      desc: "Главный экран приложения обновлен. Добавлен новый раздел 'Обновления'.",
      icon: <Sparkles size={24} color="#38bdf8" />
    },
    { 
      version: "2.0.5", 
      date: "01 Август, 2026", 
      title: "Безопасность и скорость", 
      desc: "Улучшена безопасность Supabase, активирована панель смены пароля, оптимизирована производительность.",
      icon: <ShieldCheck size={24} color="#22c55e" />
    },
    { 
      version: "2.0.0", 
      date: "25 Июль, 2026", 
      title: "Панель администратора и консультации", 
      desc: "Выпущена полнофункциональная панель администратора, заявки студентов и система регистрации на курсы.",
      icon: <Zap size={24} color="#f59e0b" />
    }
  ]
};

export default function UpdatesPage() {
  const { t, lang } = useLanguage();
  const currentUpdates = updatesData[lang] || updatesData['en'];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Bell size={28} color="#38bdf8" />
        <h1 className={styles.greeting} style={{ marginBottom: 0 }}>{t.navUpdates || "Yeniliklər"}</h1>
      </div>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>
        {lang === 'az' ? 'Sistem yenilikləri və versiya məlumatları.' : lang === 'en' ? 'System updates and version info.' : 'Обновления системы и информация о версиях.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {currentUpdates.map((update, index) => (
          <div key={index} className={styles.glassCard} style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Version Badge */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              v{update.version}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {update.icon}
              </div>
              <div style={{ flex: 1, paddingRight: '40px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>{update.date}</p>
                <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '8px' }}>{update.title}</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>{update.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '30px', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px' }}>
        DEVELOPED BY HACTAG 2026
      </div>
    </div>
  );
}
