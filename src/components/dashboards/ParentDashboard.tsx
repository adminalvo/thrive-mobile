"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Users, Calendar, CreditCard, CheckCircle, Clock, AlertTriangle, BookOpen } from "lucide-react";
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
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboards/parent")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setChildren(data.children || []);
          setUpcomingClasses(data.upcomingClasses || []);
          setPayments(data.payments || []);
          setAttendance(data.attendance || []);
          setExams(data.exams || []);
          
          if (data.children && data.children.length > 0) {
            setSelectedChild(data.children[0].id);
          }
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem", color: "var(--text-secondary)", textAlign: "center" }}>Yüklənir...</div>;
  }

  const pendingPaymentsCount = payments.filter(p => p.status !== "PAID" && (selectedChild ? p.studentId === selectedChild : true)).length;

  const filteredClasses = upcomingClasses.filter(c => selectedChild ? c.studentId === selectedChild : true);
  const filteredPayments = payments.filter(p => selectedChild ? p.studentId === selectedChild : true);
  const filteredAttendance = attendance.filter(a => selectedChild ? a.studentId === selectedChild : true);
  const filteredExams = exams.filter(e => selectedChild ? e.studentId === selectedChild : true);

  return (
    <div className={styles.dashboard} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("welcome")} (Valideyn)</h1>
          <p className={styles.pageSubtitle}>{t("parentSubtitle")}</p>
        </div>
      </motion.div>

      {/* Child Switcher Tabs */}
      {children.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(var(--glass-color), 0.1)", paddingBottom: "1rem" }}>
          {children.map(child => (
            <button 
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              style={{
                background: selectedChild === child.id ? "rgba(var(--glass-color), 0.1)" : "transparent",
                color: selectedChild === child.id ? "#fff" : "var(--text-secondary)",
                border: "1px solid",
                borderColor: selectedChild === child.id ? "rgba(var(--glass-color), 0.2)" : "transparent",
                padding: "0.5rem 1.5rem",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: selectedChild === child.id ? "bold" : "normal",
                transition: "0.2s"
              }}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* Needs Attention Banner */}
      {(pendingPaymentsCount > 0 || filteredAttendance.filter(a => a.status === 'ABSENT').length > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", padding: "1.5rem" }}
        >
          <h3 style={{ color: "#ef4444", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={20} />{t("needsAttention")}</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {pendingPaymentsCount > 0 && (
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(var(--glass-color), 0.05)" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f59e0b" }}>{pendingPaymentsCount}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t("pendingPayment")}</div>
              </div>
            )}
            
            {filteredAttendance.filter(a => a.status === 'ABSENT').length > 0 && (
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(var(--glass-color), 0.05)" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ef4444" }}>{filteredAttendance.filter(a => a.status === 'ABSENT').length}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t("absentRecord")}</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--aqua-teal) 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
              <Users size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{children.length}</h3>
            <p className={styles.statTitle}>{t("myChildren")}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--ocean-blue) 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
              <Calendar size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{upcomingClasses.length}</h3>
            <p className={styles.statTitle}>{t("upcomingClasses")}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${pendingPaymentsCount > 0 ? '#ef4444' : '#10b981'} 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>{t("upcomingClasses")}</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {filteredClasses.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Qarşıdan gələn dərs yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {filteredClasses.map((cls, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1rem", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(var(--glass-color), 0.05)" }}>
                    <div style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9", width: "3rem", height: "3rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      {cls.date.substring(0,2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <h4 style={{ margin: 0, color: "var(--text-primary)" }}>{cls.studentName}</h4>
                        <span style={{ fontSize: "0.75rem", background: "rgba(var(--glass-color), 0.1)", padding: "0.2rem 0.5rem", borderRadius: "12px", color: "var(--text-secondary)" }}>{cls.program}</span>
                      </div>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Davamiyyət İzləmə</h3>
          </div>
          <div style={{ padding: "1rem", flex: 1, overflowY: "auto", maxHeight: "400px" }}>
            {filteredAttendance.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Davamiyyət qeydi yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {filteredAttendance.map((a, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>{a.studentName}</h4>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Maliyyə və Ödənişlər</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {filteredPayments.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>{t("noPaymentFound")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {filteredPayments.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>{p.studentName}</h4>
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

        {/* Nəticələr və İmtahanlar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={20} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>İmtahan Nəticələri</h3>
          </div>
          <div style={{ padding: "1rem", flex: 1, overflowY: "auto", maxHeight: "400px" }}>
            {filteredExams.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>İmtahan tapılmadı</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {filteredExams.map((ex, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #8b5cf6" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>{ex.title}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{ex.studentName} • {ex.group}</span>
                      {ex.feedback && <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{ex.feedback}</p>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.1rem", color: parseFloat(ex.score) >= (ex.maxScore/2) ? "#10b981" : "#ef4444" }}>
                        {ex.score}
                      </span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}> / {ex.maxScore}</span>
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
