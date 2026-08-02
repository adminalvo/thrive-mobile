'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../api/supabase';
import { Loader2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Xəta baş verdi');
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
        <h1 className={styles.title}>Şifrəni Yenilə</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div style={{ color: '#52c41a', backgroundColor: 'rgba(82, 196, 26, 0.1)', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(82, 196, 26, 0.2)' }}>
            Şifrə sıfırlama linki e-poçtunuza göndərildi. Zəhmət olmasa yoxlayın.
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleReset}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Qeydiyyatdan keçdiyiniz e-poçt</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="E-poçtunuzu daxil edin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.primaryButton}
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sıfırlama Linki Göndər'}
            </button>
          </form>
        )}
        
        <div className={styles.footer}>
          <Link href="/login" className={styles.link} style={{ marginLeft: 0 }}>
            &larr; Giriş səhifəsinə qayıt
          </Link>
        </div>
      </div>
    </div>
  );
}
