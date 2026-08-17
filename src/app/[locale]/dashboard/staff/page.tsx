"use client";

import { useState, useEffect } from "react";
import styles from "../students/page.module.css";
import { Search, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function StaffPage() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (session?.user?.role === 'super_admin') {
      fetch("/api/staff")
        .then(res => res.json())
        .then(data => setStaff(data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (session?.user?.role !== 'super_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#ef4444' }}>
        <ShieldAlert size={48} />
        <h2>Bu səhifəyə giriş qadağandır</h2>
        <p>Sizin bu səhifəni görmək üçün kifayət qədər yetkiniz yoxdur.</p>
      </div>
    );
  }

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.header}>
        <div>
          <h1 className={styles.title}>İşçilər (Staff)</h1>
          <p className={styles.subtitle}>Sistemdəki bütün işçilərin idarəetmə paneli</p>
        </div>
      </motion.div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.icon} />
          <input 
            type="text" 
            placeholder="Axtarış..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Rol (Yetki)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Yüklənir...</td>
              </tr>
            ) : filteredStaff.length > 0 ? (
              filteredStaff.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.phone || '-'}</td>
                  <td>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px", 
                      fontWeight: 600,
                      backgroundColor: s.role === 'super_admin' ? '#ef4444' : s.role === 'teacher' ? '#3b82f6' : '#10b981',
                      color: "var(--white)"
                    }}>
                      {s.role}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Tapılmadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
