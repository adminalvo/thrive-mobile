'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, GraduationCap } from 'lucide-react';
import styles from './page.module.css';

export default function Onboarding() {
  const [displayedText, setDisplayedText] = useState('');
  const [language, setLanguage] = useState('en');
  
  const fullText = "Welcome to Thrive";
  const speed = 60;

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className={styles.container}>
      {/* Background Icons */}
      <GraduationCap size={300} color="#39C0C6" className={styles.bgIcon1} />
      <Globe size={250} color="#39C0C6" className={styles.bgIcon2} />
      
      {/* Content */}
      <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '100px' }}>
        <Image 
          src="/logo.png" 
          alt="Thrive Logo" 
          width={250} 
          height={120} 
          className={styles.logo} 
          priority
        />
        
        <h1 className={styles.title}>
          {displayedText}<span className={styles.cursor}>|</span>
        </h1>
        
        <div style={{ width: '100%', marginTop: '40px' }}>
          <Link href="/login" style={{ width: '100%' }}>
            <button className={styles.primaryButton}>Daxil Ol</button>
          </Link>

          <Link href="/register" style={{ width: '100%' }}>
            <button className={styles.secondaryButton}>Qeydiyyatdan Keç</button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.langContainer}>
          <button 
            className={`${styles.langBtn} ${language === 'az' ? styles.langBtnActive : ''}`}
            onClick={() => setLanguage('az')}
          >
            AZ
          </button>
          <button 
            className={`${styles.langBtn} ${language === 'en' ? styles.langBtnActive : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button 
            className={`${styles.langBtn} ${language === 'ru' ? styles.langBtnActive : ''}`}
            onClick={() => setLanguage('ru')}
          >
            RU
          </button>
        </div>
        <p className={styles.footerText}>www.thrive.az</p>
      </div>
    </main>
  );
}
