'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../api/supabase';
import { LogOut, Mail, Lock, Loader2, Globe, Shield, FileText } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from '../dashboard.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { lang, changeLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('success');

  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setMsg(t.successReg);
      setMsgType('success');
      setNewEmail('');
    } catch (err) {
      setMsg(err.message || t.errorOccurred);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg(t.successReg);
      setMsgType('success');
      setNewPassword('');
    } catch (err) {
      setMsg(err.message || t.errorOccurred);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="animate-fade-in">
      <h1 className={styles.greeting} style={{ marginBottom: '25px' }}>{t.settingsTitle}</h1>

      {msg && (
        <div className={`${styles.alertMessage} ${msgType === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg}
        </div>
      )}

      {/* Language Selection */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Globe size={20} color="#38bdf8" /> {t.languageSelect}</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={() => changeLanguage('en')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: lang === 'en' ? 'none' : '1px solid rgba(255,255,255,0.1)', background: lang === 'en' ? '#38bdf8' : 'transparent', color: lang === 'en' ? '#fff' : '#94a3b8', fontWeight: '500' }}>
            English
          </button>
          <button 
            onClick={() => changeLanguage('az')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: lang === 'az' ? 'none' : '1px solid rgba(255,255,255,0.1)', background: lang === 'az' ? '#38bdf8' : 'transparent', color: lang === 'az' ? '#fff' : '#94a3b8', fontWeight: '500' }}>
            Azərbaycan
          </button>
          <button 
            onClick={() => changeLanguage('ru')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: lang === 'ru' ? 'none' : '1px solid rgba(255,255,255,0.1)', background: lang === 'ru' ? '#38bdf8' : 'transparent', color: lang === 'ru' ? '#fff' : '#94a3b8', fontWeight: '500' }}>
            Русский
          </button>
        </div>
      </div>

      {/* Email Change */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Mail size={20} color="#38bdf8" /> {t.changeEmail}</h2>
        <form onSubmit={handleUpdateEmail}>
          <label className={styles.inputLabel}>{t.newEmail}</label>
          <input 
            type="email" 
            className={styles.inputField} 
            placeholder="example@thrive.edu.az" 
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            style={{ background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
          />
          <button type="submit" className={styles.primaryBtn} disabled={loading || !newEmail} style={{ background: '#38bdf8', color: '#0f1219', fontWeight: '600' }}>
            {loading ? <Loader2 className="animate-spin" /> : t.updateEmailBtn}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Lock size={20} color="#38bdf8" /> {t.changePassword}</h2>
        <form onSubmit={handleUpdatePassword}>
          <label className={styles.inputLabel}>{t.newPassword}</label>
          <input 
            type="password" 
            className={styles.inputField} 
            placeholder="••••••••" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={{ background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
          />
          <button type="submit" className={styles.primaryBtn} disabled={loading || !newPassword} style={{ background: '#38bdf8', color: '#0f1219', fontWeight: '600' }}>
            {loading ? <Loader2 className="animate-spin" /> : t.updatePassBtn}
          </button>
        </form>
      </div>

      {/* Legal & Policy */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Shield size={20} color="#38bdf8" /> Legal</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div onClick={() => setActiveModal(activeModal === 'privacy' ? null : 'privacy')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', fontWeight: '500' }}>
              <Shield size={18} color="#94a3b8" /> {t.privacyPolicy}
            </div>
            <span style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{t.readMore}</span>
          </div>
          {activeModal === 'privacy' && (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              This Privacy Policy describes how Thrive Mobile collects, uses, and protects your information when you use our educational services. We only collect data necessary to track your educational progress and do not sell data to third parties.
            </div>
          )}

          <div onClick={() => setActiveModal(activeModal === 'terms' ? null : 'terms')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', fontWeight: '500' }}>
              <FileText size={18} color="#94a3b8" /> {t.termsOfUse}
            </div>
            <span style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{t.readMore}</span>
          </div>
          {activeModal === 'terms' && (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', paddingTop: '15px' }}>
              By accessing Thrive Mobile, you agree to abide by these Terms of Use. The platform is designed for educational tracking. Abuse of the system, including fake consultations or unauthorized access, may result in account termination.
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className={styles.glassCard} style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <button 
          onClick={handleLogout} 
          className={`${styles.primaryBtn} ${styles.dangerBtn}`} 
          disabled={logoutLoading}
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600' }}
        >
          {logoutLoading ? <Loader2 className="animate-spin" /> : <><LogOut size={20} /> {t.logout}</>}
        </button>
      </div>
    </div>
  );
}
