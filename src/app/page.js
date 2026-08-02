'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, TrendingUp, Award, Loader2, ChevronRight, ChevronLeft, Shield, PenTool, Globe } from 'lucide-react';
import { supabase } from '../api/supabase';
import { useLanguage } from '../context/LanguageContext';
import styles from './page.module.css';

export default function OnboardingSlider() {
  const router = useRouter();
  const { lang, changeLanguage, t } = useLanguage();

  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Slide 3: Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // 'student' or 'parent'
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [fin, setFin] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Typewriter effect for Welcome text
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    // Typewriter effect logic when language changes or slide 0 renders
    setDisplayText('');
    setIsTyping(true);
    let i = 0;
    const text = t.welcome;
    
    const intervalId = setInterval(() => {
      setDisplayText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [lang, t.welcome, currentSlide]);

  const handleNext = () => {
    if (currentSlide < 2) setCurrentSlide(curr => curr + 1);
  };
  
  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  const validatePhone = (val) => {
    // Matches +994 51 389 48 04 or +9940513894804
    const phoneRegex = /^\+994\s?(0?[1-9][0-9])\s?([0-9]{3})\s?([0-9]{2})\s?([0-9]{2})$/;
    return phoneRegex.test(val);
  };

  const validatePassword = (val) => {
    // At least 1 uppercase, 1 lowercase, 1 number, 1 special char, min 6 chars
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passRegex.test(val);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (isLogin) {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) router.push('/dashboard');
      } catch (err) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Validation for Signup
      if (!name || !surname || !email || !password || !fin || !phone) {
        setError(t.errRequired);
        return;
      }
      if (fin.length !== 7) {
        setError(t.errFin);
        return;
      }
      if (!validatePhone(phone)) {
        setError(t.errPhone);
        return;
      }
      if (!validatePassword(password)) {
        setError(t.errPass);
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: name,
              last_name: surname,
              fin_code: fin,
              phone: phone,
              role: role,
            },
            emailRedirectTo: `${window.location.origin}/confirm`,
          }
        });
        if (error) throw error;
        setSuccess(true);
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
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
      {/* Language Switcher */}
      <div className={styles.langSwitcher}>
        <button className={lang === 'en' ? styles.langActive : ''} onClick={() => changeLanguage('en')}>EN</button>
        <button className={lang === 'az' ? styles.langActive : ''} onClick={() => changeLanguage('az')}>AZ</button>
        <button className={lang === 'ru' ? styles.langActive : ''} onClick={() => changeLanguage('ru')}>RU</button>
      </div>

      <div className={styles.sliderContainer} style={{ transform: `translateX(-${currentSlide * 33.3333}%)` }}>
        
        {/* SLIDE 1: Welcome & Logo */}
        <div className={styles.slide}>
          <div className={styles.slideContent}>
            <Image 
              src="/logo.png" 
              alt="Thrive Logo" 
              width={350} 
              height={170} 
              className={styles.hugeLogo} 
            />
            <h1 className={styles.welcomeText}>
              {currentSlide === 0 ? displayText : t.welcome}
              {isTyping && currentSlide === 0 && <span className={styles.cursor}>|</span>}
            </h1>
          </div>
        </div>

        {/* SLIDE 2: Explainer */}
        <div className={styles.slide}>
          <div className={styles.slideContent}>
            <h2 className={styles.slideTitle}>{t.slide2Title}</h2>
            <p className={styles.slideDesc}>{t.slide2Desc}</p>
            
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <BookOpen size={40} color="#39C0C6" />
              </div>
              <div className={styles.featureCard}>
                <TrendingUp size={40} color="#39C0C6" />
              </div>
              <div className={styles.featureCard}>
                <Award size={40} color="#39C0C6" />
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: Login / Signup */}
        <div className={styles.slide}>
          <div className={styles.authContainer}>
            <div className={styles.authTabs}>
              <button 
                className={isLogin ? styles.tabActive : styles.tab} 
                onClick={() => { setIsLogin(true); setError(null); setSuccess(false); }}
              >
                {t.loginTab}
              </button>
              <button 
                className={!isLogin ? styles.tabActive : styles.tab} 
                onClick={() => { setIsLogin(false); setError(null); setSuccess(false); }}
              >
                {t.signupTab}
              </button>
            </div>

            <div className={styles.authCard}>
              {error && <div className={styles.errorAlert}>{error}</div>}
              {success && <div className={styles.successAlert}>{t.successReg}</div>}
              
              {!success && (
                <form onSubmit={handleAuth} className={styles.authForm}>
                  {!isLogin && (
                    <>
                      <div className={styles.roleToggle}>
                        <button 
                          type="button"
                          className={role === 'student' ? styles.roleActive : styles.roleBtn}
                          onClick={() => setRole('student')}
                        >
                          {t.roleStudent}
                        </button>
                        <button 
                          type="button"
                          className={role === 'parent' ? styles.roleActive : styles.roleBtn}
                          onClick={() => setRole('parent')}
                        >
                          {t.roleParent}
                        </button>
                      </div>

                      <div className={styles.row}>
                        <div className={styles.inputGroup}>
                          <input type="text" placeholder={t.name} className={styles.input} value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className={styles.inputGroup}>
                          <input type="text" placeholder={t.surname} className={styles.input} value={surname} onChange={e => setSurname(e.target.value)} required />
                        </div>
                      </div>

                      <div className={styles.row}>
                        <div className={styles.inputGroup}>
                          <input type="text" placeholder={t.fin} maxLength={7} className={styles.input} value={fin} onChange={e => setFin(e.target.value.toUpperCase())} required />
                        </div>
                        <div className={styles.inputGroup}>
                          <input type="tel" placeholder={t.phone} className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.inputGroup}>
                    <input type="email" placeholder={t.email} className={styles.input} value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <input type="password" placeholder={t.password} className={styles.input} value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? t.loginBtn : t.signupBtn)}
                  </button>
                </form>
              )}
              
              {!success && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ margin: '0 10px', color: '#94a3b8', fontSize: '0.85rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  </div>
                  <button 
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '1rem', fontWeight: '500', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              )}

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
      </div>

      {/* Navigation Controls */}
      <div className={styles.controls}>
        {currentSlide > 0 && (
          <button className={styles.navBtn} onClick={handlePrev}>
            <ChevronLeft size={24} />
          </button>
        )}
        
        <div className={styles.dots}>
          {[0, 1, 2].map(idx => (
            <div key={idx} className={currentSlide === idx ? styles.dotActive : styles.dot} onClick={() => setCurrentSlide(idx)} />
          ))}
        </div>

        {currentSlide < 2 && (
          <button className={styles.navBtn} onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
