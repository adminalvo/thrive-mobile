'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../api/supabase';
import { Loader2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/confirm`,
        }
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Qeydiyyat zamanı xəta baş verdi');
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
        <h1 className={styles.title}>Yeni Hesab Yarat</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div style={{ color: '#52c41a', backgroundColor: 'rgba(82, 196, 26, 0.1)', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(82, 196, 26, 0.2)' }}>
            Uğurlu! Zəhmət olmasa e-poçt ünvanınızı yoxlayın və hesabınızı təsdiqləyin.
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleRegister}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Ad və Soyad</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Adınızı daxil edin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              <label className={styles.label}>Şifrə (Minimum 6 simvol)</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Şifrə təyin edin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.primaryButton}
              disabled={loading}
              style={{ marginTop: '30px' }}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Qeydiyyatdan Keç'}
            </button>
          </form>
        )}
        
        <div className={styles.footer}>
          Artıq hesabınız var? 
          <Link href="/login" className={styles.link}>
            Daxil Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
