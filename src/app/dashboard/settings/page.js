'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../api/supabase';
import { LogOut, Mail, Lock, Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from '../dashboard.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { lang, changeLanguage } = useLanguage();
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
      setMsg('Təsdiq linki yeni e-poçt ünvanınıza göndərildi.');
      setMsgType('success');
      setNewEmail('');
    } catch (err) {
      setMsg(err.message || 'Xəta baş verdi');
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
      setMsg('Şifrəniz uğurla yeniləndi!');
      setMsgType('success');
      setNewPassword('');
    } catch (err) {
      setMsg(err.message || 'Xəta baş verdi');
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
      <h1 className={styles.greeting} style={{ marginBottom: '25px' }}>Ayarlar</h1>

      {msg && (
        <div className={`${styles.alertMessage} ${msgType === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg}
        </div>
      )}

      {/* Language Selection */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Globe size={20} color="#39C0C6" /> Dil Seçimi</h2>
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
        <h2 className={styles.sectionTitle}><Mail size={20} color="#39C0C6" /> E-poçtu Dəyişdir</h2>
        <form onSubmit={handleUpdateEmail}>
          <label className={styles.inputLabel}>Yeni E-poçt</label>
          <input 
            type="email" 
            className={styles.inputField} 
            placeholder="yeni@email.com" 
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'E-poçtu Yenilə'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className={styles.glassCard}>
        <h2 className={styles.sectionTitle}><Lock size={20} color="#39C0C6" /> Şifrəni Yenilə</h2>
        <form onSubmit={handleUpdatePassword}>
          <label className={styles.inputLabel}>Yeni Şifrə</label>
          <input 
            type="password" 
            className={styles.inputField} 
            placeholder="Yeni şifrə (Min 6 simvol)" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Şifrəni Yenilə'}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout} 
        className={`${styles.primaryBtn} ${styles.dangerBtn}`} 
        style={{ marginTop: '30px' }}
        disabled={logoutLoading}
      >
        {logoutLoading ? <Loader2 className="animate-spin" /> : <><LogOut size={20} /> Sistemdən Çıx</>}
      </button>
    </div>
  );
}
