'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, TrendingUp, Award, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../api/supabase';
import { translations } from '../translations';
import styles from './page.module.css';

export default function OnboardingSlider() {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const t = translations[lang];

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
      {/* Language Switcher */}
      <div className={styles.langSwitcher}>
        <button className={lang === 'en' ? styles.langActive : ''} onClick={() => setLang('en')}>EN</button>
        <button className={lang === 'az' ? styles.langActive : ''} onClick={() => setLang('az')}>AZ</button>
        <button className={lang === 'ru' ? styles.langActive : ''} onClick={() => setLang('ru')}>RU</button>
      </div>

      <div className={styles.sliderContainer} style={{ transform: `translateX(-${currentSlide * 33.3333}%)` }}>
        
        {/* SLIDE 1: Welcome & Logo */}
        <div className={styles.slide}>
          <div className={styles.slideContent}>
            <Image 
              src="/logo.png" 
              alt="Thrive Logo" 
              width={250} 
              height={120} 
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
