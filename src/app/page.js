'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, TrendingUp, Award, Loader2, ChevronRight, ChevronLeft, Shield, PenTool, Globe } from 'lucide-react';
import { supabase } from '../api/supabase';
import { useLanguage } from '../context/LanguageContext';
import styles from './page.module.css';

export default function AuthPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(t.loginError || error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
          parent_pin: role === 'parent' ? pin : null
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccessMsg(t.signupSuccess || 'Uğurla qeydiyyatdan keçdiniz!');
      setTimeout(() => {
        setIsLogin(true);
        setStep(1);
        setSuccessMsg(null);
        setLoading(false);
      }, 3000);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setPin('');
    setStep(1);
    setErrorMsg(null);
  };

  return (
    <div className={styles.wrapper}>
      {/* Floating Background Icons */}
      <div className={styles.floatingBg}>
        <BookOpen className={styles.floatIcon} />
        <Award className={styles.floatIcon} />
        <TrendingUp className={styles.floatIcon} />
        <Globe className={styles.floatIcon} />
        <PenTool className={styles.floatIcon} />
      </div>

      <div className={styles.glassContainer} style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.header}>
          {/* Logo enlarged */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '-1px' }}>Thrive</span>
            <span style={{ fontSize: '3rem', fontWeight: 300, color: '#f8fafc' }}>Edu</span>
          </div>
          <h1 className={styles.title}>{t.welcomeToThrive}</h1>
          <p className={styles.subtitle}>{isLogin ? t.loginSubtitle : t.signupSubtitle}</p>
        </div>

        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
        {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

        <div className={styles.formArea}>
          <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
            {!isLogin && step === 1 && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <input type="text" placeholder={t.firstName} className={styles.inputField} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  <input type="text" placeholder={t.lastName} className={styles.inputField} value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button type="button" className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`} onClick={() => setRole('student')}>{t.student}</button>
                  <button type="button" className={`${styles.roleBtn} ${role === 'parent' ? styles.roleBtnActive : ''}`} onClick={() => setRole('parent')}>{t.parent}</button>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="button" onClick={() => setIsLogin(true)} className={styles.secondaryBtn}>Geri</button>
                  <button type="button" onClick={() => setStep(2)} disabled={!firstName || !lastName} className={styles.primaryBtn}>
                    İrəli <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {(!isLogin && step === 2) && (
              <div className="animate-fade-in">
                <input type="email" placeholder={t.emailLabel} className={styles.inputField} value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="tel" placeholder={t.phoneLabel} className={styles.inputField} value={phone} onChange={e => setPhone(e.target.value)} required />
                {role === 'parent' && (
                  <input type="password" maxLength="4" placeholder={t.parentPin} className={styles.inputField} value={pin} onChange={e => setPin(e.target.value)} required={role === 'parent'} />
                )}
                <input type="password" placeholder={t.passwordLabel} className={styles.inputField} value={password} onChange={e => setPassword(e.target.value)} required />

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="button" onClick={() => setStep(1)} className={styles.secondaryBtn}><ChevronLeft size={18} /> Geri</button>
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Tamamla'}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="animate-fade-in">
                <input type="email" placeholder={t.emailLabel || "E-poçt"} className={styles.inputField} value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder={t.passwordLabel || "Şifrə"} className={styles.inputField} value={password} onChange={e => setPassword(e.target.value)} required />
                
                <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: '10px' }}>
                  {loading ? <Loader2 className="animate-spin" /> : t.loginBtn}
                  <ChevronRight size={20} />
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                  {t.noAccount} <span onClick={() => { setIsLogin(false); resetForm(); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}>{t.signupBtn}</span>
                </p>
              </div>
            )}
          </form>

          {/* Moderator Icon to access Admin panel */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              onClick={() => router.push('/admin/login')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', gap: '5px' }}
              title="Admin Panel"
            >
              <Shield size={24} />
              <span style={{ fontSize: '0.7rem' }}>Moderator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
