'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../api/supabase';
import { LogOut, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--deep-navy)' }}>
        <Loader2 className="animate-spin" size={48} color="#39C0C6" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: 'var(--deep-navy)', minHeight: '100vh', color: 'var(--white)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--aqua-teal)' }}>Thrive Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            backgroundColor: 'rgba(255,77,79,0.1)', 
            color: '#ff4d4f', 
            border: '1px solid rgba(255,77,79,0.3)', 
            padding: '10px 15px', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          Çıxış
        </button>
      </div>
      
      <div style={{ backgroundColor: 'rgba(17, 34, 64, 0.8)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(57, 192, 198, 0.2)' }}>
        <h2>Xoş Gəldiniz, {user?.user_metadata?.first_name || 'İstifadəçi'}!</h2>
        <p style={{ color: 'var(--gray-light)', marginTop: '10px' }}>
          Rolunuz: {user?.user_metadata?.role === 'parent' ? 'Valideyn' : 'Şagird'}
        </p>
        <p style={{ color: 'var(--gray-light)', marginTop: '5px' }}>
          E-poçt: {user?.email}
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <p style={{ color: 'var(--gray-light)' }}>
          * Dashboard (Ana Panel) və Kurslar hissəsinin əsas dizaynı burada olacaq. <br/>
          (Slider-i test etmək üçün yuxarıdakı "Çıxış" düyməsinə basa bilərsiniz)
        </p>
      </div>
    </div>
  );
}
