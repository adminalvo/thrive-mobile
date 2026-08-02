'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../api/supabase';
import { Shield, Users, BookOpen, Calendar, LogOut, Loader2, Plus, Trash2, TrendingUp, Save } from 'lucide-react';
import styles from '../dashboard/dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [msg, setMsg] = useState(null);

  // States for dynamic data
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState([]);

  // Forms
  const [newCourse, setNewCourse] = useState({ title: '', description: '', image_url: '', monthly_price: '0 ₼' });
  const [newSchedule, setNewSchedule] = useState({ day: 'Bazar ertəsi', time: '', subject: '', room: '', group_name: '' });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const user = session.user;
      if (user.email !== 'admin@thrive.az') {
        alert('Access Denied. Only admin can view this page.');
        router.push('/dashboard');
        return;
      }
      await fetchData();
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const fetchData = async () => {
    const [coursesRes, schedRes, regRes, statsRes] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('schedules').select('*').order('created_at', { ascending: false }),
      supabase.from('course_registrations').select('id, status, created_at, courses(title), user_id, course_id').order('created_at', { ascending: false }),
      supabase.from('student_stats').select('*, courses(title)').order('created_at', { ascending: false })
    ]);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (schedRes.data) setSchedules(schedRes.data);
    if (regRes.data) setRegistrations(regRes.data);
    if (statsRes.data) setStats(statsRes.data);
  };

  const handleUpdateReg = async (id, status, user_id, course_id) => {
    const { error } = await supabase.from('course_registrations').update({ status }).eq('id', id);
    if (!error) {
      if (status === 'approved' && user_id && course_id) {
        await supabase.from('student_stats').insert([{ user_id, course_id }]).select();
      }
      fetchData();
    }
  };

  const handleUpdateStat = async (id, updatedFields) => {
    const { error } = await supabase.from('student_stats').update(updatedFields).eq('id', id);
    if (error) {
      setMsg({ type: 'error', text: 'Error updating stats: ' + error.message });
    } else {
      setMsg({ type: 'success', text: 'Stats updated successfully!' });
      fetchData();
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { data, error } = await supabase.from('courses').insert([{ ...newCourse }]);
    if (error) {
      setMsg({ type: 'error', text: 'Error adding course: ' + error.message });
    } else {
      setMsg({ type: 'success', text: 'Course added successfully!' });
      setNewCourse({ title: '', description: '', image_url: '', monthly_price: '0 ₼' });
      fetchData();
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { data, error } = await supabase.from('schedules').insert([{ ...newSchedule }]);
    if (error) {
      setMsg({ type: 'error', text: 'Error adding schedule: ' + error.message });
    } else {
      setMsg({ type: 'success', text: 'Schedule added successfully!' });
      setNewSchedule({ day: 'Bazar ertəsi', time: '', subject: '', room: '', group_name: '' });
      fetchData();
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm('Silmək istədiyinizə əminsiniz?')) return;
    await supabase.from('schedules').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Silmək istədiyinizə əminsiniz?')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f1219' }}>
        <Loader2 className="animate-spin" size={48} color="#38bdf8" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f1219', minHeight: '100vh', color: '#f8fafc', padding: '20px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={32} color="#38bdf8" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Thrive Admin Panel</h1>
        </div>
        <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 15px', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <LogOut size={16} /> Çıxış
        </button>
      </div>

      {msg && (
        <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: msg.type === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${msg.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('courses')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: activeTab === 'courses' ? '#38bdf8' : 'rgba(255,255,255,0.05)', color: activeTab === 'courses' ? '#0f1219' : '#94a3b8', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <BookOpen size={18} /> Kurslar
        </button>
        <button onClick={() => setActiveTab('schedule')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: activeTab === 'schedule' ? '#38bdf8' : 'rgba(255,255,255,0.05)', color: activeTab === 'schedule' ? '#0f1219' : '#94a3b8', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Calendar size={18} /> Cədvəl
        </button>
        <button onClick={() => setActiveTab('registrations')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: activeTab === 'registrations' ? '#38bdf8' : 'rgba(255,255,255,0.05)', color: activeTab === 'registrations' ? '#0f1219' : '#94a3b8', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Users size={18} /> Müraciətlər
        </button>
        <button onClick={() => setActiveTab('stats')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: activeTab === 'stats' ? '#38bdf8' : 'rgba(255,255,255,0.05)', color: activeTab === 'stats' ? '#0f1219' : '#94a3b8', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <TrendingUp size={18} /> Nəticələr
        </button>
      </div>

      {/* Registrations Tab */}
      {activeTab === 'registrations' && (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#f8fafc' }}>Tələbə Müraciətləri</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {registrations.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>Heç bir müraciət yoxdur.</p>
            ) : (
              registrations.map(reg => (
                <div key={reg.id} className={styles.glassCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Kurs: {reg.courses?.title || 'Bilinmir'}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '5px' }}>Status: {reg.status === 'pending' ? 'Gözləmədədir' : reg.status === 'approved' ? 'Təsdiqlənib' : 'Rədd edilib'}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Tarix: {new Date(reg.created_at).toLocaleDateString()}</p>
                  </div>
                  {reg.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleUpdateReg(reg.id, 'approved', reg.user_id, reg.course_id)} style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '8px 15px', borderRadius: '8px', color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>
                        Təsdiqlə
                      </button>
                      <button onClick={() => handleUpdateReg(reg.id, 'rejected', reg.user_id, reg.course_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 15px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
                        Rədd et
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          <div className={styles.glassCard}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} /> Yeni Kurs Əlavə Et
            </h2>
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Kursun Adı (Title)</label>
                <input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Qısa Təsvir (Description)</label>
                <input type="text" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Aylıq Ödəniş (Monthly Price)</label>
                <input type="text" value={newCourse.monthly_price} onChange={e => setNewCourse({...newCourse, monthly_price: e.target.value})} required placeholder="Məs: 150 ₼" style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </div>
              <button type="submit" style={{ padding: '12px', background: '#38bdf8', color: '#0f1219', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Yadda Saxla</button>
            </form>
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#f8fafc' }}>Mövcud Kurslar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {courses.map(c => (
              <div key={c.id} className={styles.glassCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{c.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '5px' }}>Ödəniş: {c.monthly_price || 'Yoxdur'}</p>
                </div>
                <button onClick={() => handleDeleteCourse(c.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '10px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div>
          <div className={styles.glassCard}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} /> Cədvələ Dərs Əlavə Et
            </h2>
            <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Gün</label>
                <select value={newSchedule.day} onChange={e => setNewSchedule({...newSchedule, day: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                  <option value="Bazar ertəsi">Bazar ertəsi (Monday)</option>
                  <option value="Çərşənbə axşamı">Çərşənbə axşamı (Tuesday)</option>
                  <option value="Çərşənbə">Çərşənbə (Wednesday)</option>
                  <option value="Cümə axşamı">Cümə axşamı (Thursday)</option>
                  <option value="Cümə">Cümə (Friday)</option>
                  <option value="Şənbə">Şənbə (Saturday)</option>
                  <option value="Bazar">Bazar (Sunday)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Saat (Məs: 14:00 - 15:30)</label>
                  <input type="text" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Otaq (Məs: Otaq 101)</label>
                  <input type="text" value={newSchedule.room} onChange={e => setNewSchedule({...newSchedule, room: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Fənn (Məs: SAT Math)</label>
                  <input type="text" value={newSchedule.subject} onChange={e => setNewSchedule({...newSchedule, subject: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Qrup (Məs: Qrup A)</label>
                  <input type="text" value={newSchedule.group_name} onChange={e => setNewSchedule({...newSchedule, group_name: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>
              <button type="submit" style={{ padding: '12px', background: '#38bdf8', color: '#0f1219', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Dərsi Yarat</button>
            </form>
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#f8fafc' }}>Cədvəl Siyahısı</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {schedules.map(s => (
              <div key={s.id} className={styles.glassCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>{s.subject} ({s.group_name})</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.day} | {s.time} | {s.room}</p>
                </div>
                <button onClick={() => handleDeleteSchedule(s.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '10px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#f8fafc' }}>Tələbə Nəticələri</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>Göstərici tapılmadı.</p>
            ) : (
              stats.map(s => (
                <div key={s.id} className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '5px' }}>Kurs: {s.courses?.title || 'Bilinmir'} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(ID: {s.user_id.slice(0,8)}...)</span></h4>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>İrəliləyiş (Progress %)</label>
                      <input 
                        type="number" 
                        defaultValue={s.progress} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f1219', color: '#fff' }} 
                        id={`prog_${s.id}`} 
                      />
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Davamiyyət (Attendance %)</label>
                      <input 
                        type="number" 
                        defaultValue={s.attendance_percentage} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f1219', color: '#fff' }} 
                        id={`att_${s.id}`} 
                      />
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Son İmtahan Adı</label>
                      <input 
                        type="text" 
                        defaultValue={s.last_exam_name} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f1219', color: '#fff' }} 
                        id={`ename_${s.id}`} 
                      />
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Son İmtahan Balı</label>
                      <input 
                        type="number" 
                        defaultValue={s.last_exam_score} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f1219', color: '#fff' }} 
                        id={`escore_${s.id}`} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const updatedFields = {
                        progress: parseInt(document.getElementById(`prog_${s.id}`).value) || 0,
                        attendance_percentage: parseInt(document.getElementById(`att_${s.id}`).value) || 0,
                        last_exam_name: document.getElementById(`ename_${s.id}`).value,
                        last_exam_score: parseInt(document.getElementById(`escore_${s.id}`).value) || 0,
                      };
                      handleUpdateStat(s.id, updatedFields);
                    }}
                    style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px 15px', borderRadius: '8px', color: '#38bdf8', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                    <Save size={16} /> Yadda saxla
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
