'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { User, Globe, Shield, ChevronRight, LogOut, ChevronDown, CheckCircle } from 'lucide-react';
import { supabase } from '../../../api/supabase';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

export default function SettingsPage() {
  const { t, language, changeLanguage } = useLanguage();
  const router = useRouter();
  
  // Accordion state: null, 'account', 'language', 'legal'
  const [activeSection, setActiveSection] = useState(null);
  const [langMsg, setLangMsg] = useState('');

  const toggleSection = (section) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleLangSelect = (code) => {
    changeLanguage(code);
    setLangMsg(t.languageChanged || 'Dil dəyişdirildi.');
    setTimeout(() => setLangMsg(''), 2500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>Parametrlər</h1>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>Hesabınızı və tətbiq tənzimləmələrini idarə edin.</p>

      {/* Accordion Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* 1. Account Management */}
        <div className={styles.glassCard} style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
          <button 
            onClick={() => toggleSection('account')}
            style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <User color="#38bdf8" size={24} />
              <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Hesab İdarə Etmə</span>
            </div>
            {activeSection === 'account' ? <ChevronDown color="#94a3b8" /> : <ChevronRight color="#94a3b8" />}
          </button>
          
          {activeSection === 'account' && (
            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '15px 0' }}>Buradan şifrənizi və digər hesab məlumatlarınızı yeniləyə bilərsiniz (Tezliklə).</p>
              
              <button onClick={handleSignOut} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', width: '100%', borderRadius: '8px', color: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                <LogOut size={18} /> Çıxış et
              </button>
            </div>
          )}
        </div>

        {/* 2. Language Selection */}
        <div className={styles.glassCard} style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
          <button 
            onClick={() => toggleSection('language')}
            style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Globe color="#38bdf8" size={24} />
              <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Dil Dəyişdirmə</span>
            </div>
            {activeSection === 'language' ? <ChevronDown color="#94a3b8" /> : <ChevronRight color="#94a3b8" />}
          </button>
          
          {activeSection === 'language' && (
            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {langMsg && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '10px', borderRadius: '8px', marginBottom: '15px', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} /> {langMsg}</div>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => handleLangSelect('az')} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: language === 'az' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)', background: language === 'az' ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  Azərbaycan Dili {language === 'az' && <CheckCircle color="#38bdf8" size={18} />}
                </button>
                <button onClick={() => handleLangSelect('en')} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: language === 'en' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)', background: language === 'en' ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  English {language === 'en' && <CheckCircle color="#38bdf8" size={18} />}
                </button>
                <button onClick={() => handleLangSelect('ru')} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: language === 'ru' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)', background: language === 'ru' ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  Русский {language === 'ru' && <CheckCircle color="#38bdf8" size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Legal and Administered */}
        <div className={styles.glassCard} style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
          <button 
            onClick={() => toggleSection('legal')}
            style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Shield color="#38bdf8" size={24} />
              <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Legal və Parametrlər</span>
            </div>
            {activeSection === 'legal' ? <ChevronDown color="#94a3b8" /> : <ChevronRight color="#94a3b8" />}
          </button>
          
          {activeSection === 'legal' && (
            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>İstifadəçi Şərtləri</p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>Məxfilik Siyasəti (Privacy Policy)</p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Versiya: 2.1.0</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
