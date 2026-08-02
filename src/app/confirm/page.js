'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import styles from '../auth.module.css';

export default function ConfirmEmail() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Supabase avtomatik olaraq URL-dəki hash-dən tokeni oxuyub
  // sessiyanı aktivləşdirəcək (detectSessionInUrl: true sayəsində).
  // Biz sadəcə qısa bir vizual ləngimə (loading) verib uğur mesajını göstəririk.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
      
      <div className={`${styles.card} animate-fade-in`} style={{ textAlign: 'center' }}>
        {loading ? (
          <div style={{ padding: '40px 0' }}>
            <Loader2 className="animate-spin" size={48} color="#39C0C6" style={{ margin: '0 auto', marginBottom: '20px' }} />
            <h2 style={{ color: 'var(--white)', fontSize: '1.2rem' }}>Təsdiqlənir...</h2>
            <p style={{ color: 'var(--gray-light)', marginTop: '10px' }}>Zəhmət olmasa gözləyin.</p>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ padding: '20px 0' }}>
            <CheckCircle size={64} color="#52c41a" style={{ margin: '0 auto', marginBottom: '20px' }} />
            <h1 className={styles.title} style={{ marginBottom: '15px' }}>Uğurlu Təsdiq!</h1>
            <p style={{ color: 'var(--gray-light)', lineHeight: '1.6', marginBottom: '30px' }}>
              E-poçt ünvanınız uğurla təsdiqləndi. İndi Thrive platformasına tam giriş əldə etdiniz.
            </p>
            <Link href="/dashboard" style={{ width: '100%', display: 'block' }}>
              <button className={styles.primaryButton}>
                Hesaba Daxil Ol
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
