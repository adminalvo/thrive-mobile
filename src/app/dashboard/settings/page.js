'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../api/supabase';
import { LogOut, Mail, Lock, Loader2, Globe } from 'lucide-react';
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
        <h2 className={styles.sectionTitle}><Globe size={20} color="#39C0C6" /> {t.languageSelect}</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={() => changeLanguage('en')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #39C0C6', background: lang === 'en' ? '#39C0C6' : 'transparent', color: lang === 'en' ? '#fff' : '#39C0C6', fontWeight: 'bold' }}>
            English
          </button>
          <button 
            onClick={() => changeLanguage('az')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #39C0C6', background: lang === 'az' ? '#39C0C6' : 'transparent', color: lang === 'az' ? '#fff' : '#39C0C6', fontWeight: 'bold' }}>
            Azərbaycan
          </button>
          <button 
            onClick={() => changeLanguage('ru')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #39C0C6', background: lang === 'ru' ? '#39C0C6' : 'transparent', color: lang === 'ru' ? '#fff' : '#39C0C6', fontWeight: 'bold' }}>
            Русский
          </button>
        </div>
      </div>

      {/* Email Change */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Mail size={20} color="#39C0C6" /> {t.changeEmail}</h2>
        <form onSubmit={handleUpdateEmail}>
          <label className={styles.inputLabel}>{t.newEmail}</label>
          <input 
            type="email" 
            className={styles.inputField} 
            placeholder="example@thrive.edu.az" 
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.primaryBtn} disabled={loading || !newEmail}>
            {loading ? <Loader2 className="animate-spin" /> : t.updateEmailBtn}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Lock size={20} color="#39C0C6" /> {t.changePassword}</h2>
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
          />
          <button type="submit" className={styles.primaryBtn} disabled={loading || !newPassword}>
            {loading ? <Loader2 className="animate-spin" /> : t.updatePassBtn}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className={styles.glassCard} style={{ borderColor: 'rgba(255, 77, 79, 0.3)' }}>
        <button 
          onClick={handleLogout} 
          className={`${styles.primaryBtn} ${styles.dangerBtn}`} 
          disabled={logoutLoading}
        >
          {logoutLoading ? <Loader2 className="animate-spin" /> : <><LogOut size={20} /> {t.logout}</>}
        </button>
      </div>
    </div>
  );
}
