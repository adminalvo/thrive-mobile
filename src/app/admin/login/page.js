'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../../api/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email === 'admin@thrive.az') {
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (email !== 'admin@thrive.az') {
      setErrorMsg("Yalnız administrator bu panelə daxil ola bilər.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1219', padding: '20px' }}>
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '40px 30px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Geri
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
            <Shield size={32} color="#38bdf8" />
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 600 }}>Moderator Girişi</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Sistem idarəetmə paneli</p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>E-poçt (Admin)</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@thrive.az"
              required
              style={{ width: '100%', padding: '14px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>Şifrə</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '14px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#0f1219', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Giriş Et'}
          </button>
        </form>
      </div>
    </div>
  );
}
