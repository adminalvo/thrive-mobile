'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../api/supabase';
import { Loader2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Supabase will automatically parse the hash fragment for the token 
  // because we set detectSessionInUrl: true in supabase.js

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard'); // or wherever the user goes after login
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Şifrəni yeniləyərkən xəta baş verdi');
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
        <h1 className={styles.title}>Yeni Şifrə Təyin Et</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div style={{ color: '#52c41a', backgroundColor: 'rgba(82, 196, 26, 0.1)', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(82, 196, 26, 0.2)' }}>
            Şifrəniz uğurla yeniləndi! Sistemə daxil edilirsiniz...
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleUpdate}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Yeni Şifrə (Minimum 6 simvol)</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Yeni şifrə daxil edin"
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
              style={{ marginTop: '20px' }}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Təsdiqlə və Daxil Ol'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
