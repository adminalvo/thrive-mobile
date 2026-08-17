"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { BookOpen, Calendar, CheckCircle, Clock, Info, AlertCircle, FileText, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function StudentDashboard() {
  const t = useTranslations("Dashboard");
  
  const [schedules, setSchedules] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboards/student")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSchedules(data.schedules || []);
          setNotes(data.notes || []);
          setAttendance(data.attendance || []);
          setExams(data.exams || []);
        }
        setLoading(false);
      });
  }, []);

  const getDayName = (day: number | string) => {
    const days = ["", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə", "Bazar"];
    return days[Number(day)] || "Bilinmir";
  };

  if (loading) {
    return <div style={{ padding: "2rem", color: "var(--text-secondary)", textAlign: "center" }}>Yüklənir...</div>;
  }

  return (
    <div className={styles.dashboard} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("welcome")} (Tələbə)</h1>
          <p className={styles.pageSubtitle}>Dərslərinizi, qeydlərinizi və davamiyyətinizi izləyin.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--aqua-teal) 0%, rgba(255,255,255,0.1) 100%)` }}>
              <Calendar size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{schedules.length}</h3>
            <p className={styles.statTitle}>Həftəlik Dərs</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--ocean-blue) 0%, rgba(255,255,255,0.1) 100%)` }}>
              <FileText size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{notes.length}</h3>
            <p className={styles.statTitle}>Müəllim Qeydləri</p>
          </div>
        </motion.div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
        
        {/* Həftəlik Cədvəl (Schedule) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={20} color="var(--aqua-teal)" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>Həftəlik Dərs Cədvəli</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {schedules.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Cədvəl tapılmadı</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {schedules.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--aqua-teal)" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--white)", fontSize: "1rem" }}>{s.group}</h4>
                      <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={14} /> {getDayName(s.dayOfWeek)}, {s.time}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Info size={14} /> {s.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Müəllim Qeydləri və Tapşırıqlar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={20} color="var(--ocean-blue)" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>Qeydlər və Tapşırıqlar</h3>
          </div>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", maxHeight: "400px" }}>
            {notes.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Qeyd yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {notes.map((n, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--aqua-teal)", fontWeight: "600" }}>{n.group}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {new Date(n.date).toLocaleDateString("az-AZ")}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 0.75rem 0", color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.5" }}>{n.content}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <User size={14} /> <span>{n.teacher}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Davamiyyət */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>Davamiyyət Cədvəli</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {attendance.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Davamiyyət məlumatı yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {attendance.map((a, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--white)", fontSize: "0.95rem" }}>{a.group}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{new Date(a.date).toLocaleDateString("az-AZ")}</span>
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

        {/* Nəticələr və İmtahanlar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={20} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--white)" }}>İmtahan Nəticələri</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {exams.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>İmtahan tapılmadı</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {exams.map((ex, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #8b5cf6" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--white)", fontSize: "0.95rem" }}>{ex.title}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{ex.groupName} • {ex.date}</span>
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
