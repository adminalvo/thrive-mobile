'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../api/supabase';
import { Loader2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Daxil olarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/">
        <Image 
          src="/logo.png" 
          alt="Thrive Logo" 
          width={150} 
          height={70} 
          className={styles.logo} 
        />
      </Link>
      
      <div className={`${styles.card} animate-fade-in`}>
        <h1 className={styles.title}>Xoş Gəldiniz</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>E-poçt ünvanı</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="E-poçtunuzu daxil edin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Şifrə</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Şifrənizi daxil edin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Şifrəni unutmusunuz?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Daxil Ol'}
          </button>
        </form>
        
        <div className={styles.footer}>
          Hesabınız yoxdur? 
          <Link href="/register" className={styles.link}>
            Qeydiyyatdan Keç
          </Link>
        </div>
      </div>
    </div>
  );
}
