'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { User, Globe, Shield, ChevronRight, LogOut, ChevronDown, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../../api/supabase';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

export default function SettingsPage() {
  const { t, language, changeLanguage } = useLanguage();
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState(null);
  const [langMsg, setLangMsg] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  
  const [modalContent, setModalContent] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleLangSelect = (code) => {
    changeLanguage(code);
    setLangMsg(code === 'az' ? 'Dil dəyişdirildi.' : code === 'en' ? 'Language updated.' : 'Язык изменен.');
    setTimeout(() => setLangMsg(''), 2500);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setAuthMsg(t.errorOccurred || 'Şifrə ən az 6 simvol olmalıdır.');
      setTimeout(() => setAuthMsg(''), 3000);
      return;
    }
    
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setAuthMsg((t.errorOccurred || 'Xəta') + ': ' + error.message);
    } else {
      setAuthMsg(language === 'az' ? 'Şifrəniz uğurla yeniləndi!' : language === 'en' ? 'Password successfully updated!' : 'Пароль успешно обновлен!');
      setNewPassword('');
    }
    setTimeout(() => setAuthMsg(''), 3000);
  };

  const renderModal = () => {
    if (!modalContent) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,18,25,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '30px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={() => setModalContent(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <h2 style={{ color: '#38bdf8', marginBottom: '15px' }}>{modalContent === 'terms' ? t.termsOfUse : t.privacyPolicy}</h2>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {modalContent === 'terms' ? 
              'Thrive Edu tətbiqinə xoş gəlmisiniz. Bu tətbiqi istifadə edərək bizim qaydalara riayət etməyi qəbul edirsiniz. Kurslara qeydiyyat, ödənişlər və dərslərdə iştirak admin paneldən tənzimlənir. Bütün məlumatlarınız yalnız təhsil məqsədi ilə istifadə edilir.' :
              'Məxfilik Siyasəti olaraq sizin daxil etdiyiniz E-poçt, ad və soyad, o cümlədən dərs nəticələriniz qorunur və üçüncü şəxslərlə paylaşılmır. Bütün şifrələr Supabase (AES-256 şifrələmə) tərəfindən idarə olunur və bizim adminlərin bu şifrələri görmək icazəsi yoxdur.'
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {renderModal()}
      
      <h1 className={styles.greeting} style={{ marginBottom: '10px' }}>{t.settingsTitle}</h1>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>
        {language === 'az' ? 'Hesabınızı və tətbiq tənzimləmələrini idarə edin.' : language === 'en' ? 'Manage your account and application settings.' : 'Управляйте своей учетной записью и настройками.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* 1. Account Management */}
        <div className={styles.glassCard} style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
          <button 
            onClick={() => toggleSection('account')}
            style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <User color="#38bdf8" size={24} />
              <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{language === 'az' ? 'Hesab İdarə Etmə' : language === 'en' ? 'Account Management' : 'Управление аккаунтом'}</span>
            </div>
            {activeSection === 'account' ? <ChevronDown color="#94a3b8" /> : <ChevronRight color="#94a3b8" />}
          </button>
          
          {activeSection === 'account' && (
            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              
              {authMsg && <div style={{ background: authMsg.includes(t.errorOccurred || 'Xəta') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: authMsg.includes(t.errorOccurred || 'Xəta') ? '#ef4444' : '#22c55e', padding: '10px', borderRadius: '8px', marginBottom: '15px', marginTop: '15px' }}>{authMsg}</div>}

              <form onSubmit={handleUpdatePassword} style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t.changePassword}</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <button type="submit" style={{ padding: '14px', borderRadius: '8px', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}>{t.updatePassBtn}</button>
              </form>
              
              <button onClick={handleSignOut} style={{ marginTop: '25px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', width: '100%', borderRadius: '8px', color: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                <LogOut size={18} /> {t.logout}
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
              <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{t.languageSelect}</span>
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
              <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{language === 'az' ? 'Legal və Parametrlər' : language === 'en' ? 'Legal & Settings' : 'Юридическая информация'}</span>
            </div>
            {activeSection === 'legal' ? <ChevronDown color="#94a3b8" /> : <ChevronRight color="#94a3b8" />}
          </button>
          
          {activeSection === 'legal' && (
            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p onClick={() => setModalContent('terms')} style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>{t.termsOfUse}</p>
                <p onClick={() => setModalContent('privacy')} style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>{t.privacyPolicy}</p>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>Versiya: 2.1.0</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px' }}>
        DEVELOPED BY HACTAG
      </div>
    </div>
  );
}
