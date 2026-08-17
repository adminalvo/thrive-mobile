"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Users, Calendar, CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function ParentDashboard() {
  const t = useTranslations("Dashboard");
  const c = useTranslations("Common");
  
  const [children, setChildren] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboards/parent")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setChildren(data.children || []);
          setUpcomingClasses(data.upcomingClasses || []);
          setPayments(data.payments || []);
          setAttendance(data.attendance || []);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem", color: "var(--text-secondary)", textAlign: "center" }}>Yüklənir...</div>;
  }

  const pendingPaymentsCount = payments.filter(p => p.status !== "PAID").length;

  return (
    <div className={styles.dashboard} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("welcome")} (Valideyn)</h1>
          <p className={styles.pageSubtitle}>Övladlarınızın təhsil proqresini və ödənişləri izləyin.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--aqua-teal) 0%, rgba(255,255,255,0.1) 100%)` }}>
              <Users size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{children.length}</h3>
            <p className={styles.statTitle}>Övladlarım</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--ocean-blue) 0%, rgba(255,255,255,0.1) 100%)` }}>
              <Calendar size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{upcomingClasses.length}</h3>
            <p className={styles.statTitle}>Qarşıdan Gələn Dərslər</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${pendingPaymentsCount > 0 ? '#ef4444' : '#10b981'} 0%, rgba(255,255,255,0.1) 100%)` }}>
              <CreditCard size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{pendingPaymentsCount}</h3>
            <p className={styles.statTitle}>Ödənilməmiş Borc (Ay)</p>
          </div>
        </motion.div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
        
        {/* Qarşıdan Gələn Dərslər */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={20} color="var(--ocean-blue)" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>Qarşıdan Gələn Dərslər</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {upcomingClasses.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Yaxın zamanda dərs yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {upcomingClasses.map((cls, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--ocean-blue)" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--white)", fontSize: "1rem" }}>{cls.studentName}</h4>
                      <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={14} /> {cls.date} - {cls.time}</span>
                        <span>{cls.group}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Davamiyyət İzləmə */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>Davamiyyət İzləmə</h3>
          </div>
          <div style={{ padding: "1rem", flex: 1, overflowY: "auto", maxHeight: "400px" }}>
            {attendance.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Davamiyyət qeydi yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {attendance.map((a, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--white)", fontSize: "0.95rem" }}>{a.studentName}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{a.group} • {a.date}</span>
                    </div>
                    <div>
                      {a.status === "PRESENT" && <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" }}>İştirak edib</span>}
                      {a.status === "ABSENT" && <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" }}>Qaib</span>}
                      {a.status === "LATE" && <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" }}>Gecikib</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Ödənişlər */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>Maliyyə və Ödənişlər</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {payments.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Ödəniş tapılmadı</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {payments.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--white)", fontSize: "0.95rem" }}>{p.studentName}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{p.date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <span style={{ fontWeight: 600, color: p.status === 'PAID' ? '#10b981' : '#f59e0b' }}>
                        {p.amount} ₼
                      </span>
                      {p.status === "PENDING" && <AlertTriangle size={16} color="#ef4444" title="Ödəniş gecikir" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
