"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { BookOpen, Calendar, CheckCircle, Clock, Info, AlertCircle, FileText, User, Zap, Trophy, PenTool } from "lucide-react";
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
  const [assignments, setAssignments] = useState<any[]>([]);
  const [performance, setPerformance] = useState<{averageScore: number}>({ averageScore: 0 });
  const [loading, setLoading] = useState(true);

  const [submitAssignmentModal, setSubmitAssignmentModal] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState("");

  const submitAssignment = async () => {
    if (!submitAssignmentModal || !submissionContent) return;
    try {
      const res = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: submitAssignmentModal.id, content: submissionContent })
      });
      if (res.ok) {
        alert("Tapşırıq uğurla göndərildi!");
        setSubmitAssignmentModal(null);
        setSubmissionContent("");
        // Reload page to reflect changes
        window.location.reload();
      } else {
        alert("Xəta baş verdi");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch("/api/dashboards/student")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSchedules(data.schedules || []);
          setNotes(data.notes || []);
          setAttendance(data.attendance || []);
          setExams(data.exams || []);
          setAssignments(data.assignments || []);
          setPerformance(data.performance || { averageScore: 0 });
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

      {/* Gamification / Next Action Banner */}
      {assignments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderRadius: "16px", padding: "1.5rem 2rem", color: "var(--text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" }}
        >
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem" }}>
              <Zap fill="#fff" /> Növbəti Addım!
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>Sizin həll etməli olduğunuz <strong>{assignments.length}</strong> yeni tapşırıq var. İlk tapşırıq: <strong>{assignments[0].title}</strong> (Son tarix: {assignments[0].dueDate})</p>
          </div>
          <button 
            onClick={() => setSubmitAssignmentModal(assignments[0])}
            style={{ background: "#fff", color: "#d97706", border: "none", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >{t("solveNow")}</button>
        </motion.div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--aqua-teal) 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
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
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, var(--ocean-blue) 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
              <FileText size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{notes.length}</h3>
            <p className={styles.statTitle}>Müəllim Qeydləri</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, #8b5cf6 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
              <Trophy size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{performance.averageScore}%</h3>
            <p className={styles.statTitle}>Ümumi Nəticə</p>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Həftəlik Dərs Cədvəli</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {schedules.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Cədvəl tapılmadı</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {schedules.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--aqua-teal)" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--text-primary)", fontSize: "1rem" }}>{s.group}</h4>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Qeydlər və Tapşırıqlar</h3>
          </div>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", maxHeight: "400px" }}>
            {notes.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Qeyd yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {notes.map((n, idx) => (
                  <div key={idx} style={{ background: "rgba(var(--glass-color), 0.03)", border: "1px solid rgba(var(--glass-color), 0.05)", borderRadius: "12px", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--aqua-teal)", fontWeight: "600" }}>{n.group}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {n.date ? new Date(n.date).toLocaleDateString("az-AZ") : "-"}
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

        {/* Tapşırıqlar List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface-dark)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PenTool size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Aktiv Tapşırıqlar</h3>
          </div>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", maxHeight: "400px" }}>
            {assignments.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Gözləyən tapşırıq yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {assignments.map((a, idx) => (
                  <div key={idx} style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "12px", padding: "1rem", cursor: "pointer", transition: "0.2s" }} onClick={() => setSubmitAssignmentModal(a)}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.95rem", color: "#f59e0b", fontWeight: "600" }}>{a.title}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{a.group}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", background: "rgba(var(--glass-color), 0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                        Son: {a.dueDate}
                      </span>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Davamiyyət Cədvəli</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {attendance.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>Davamiyyət məlumatı yoxdur</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {attendance.map((a, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>{a.group}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{a.date ? new Date(a.date).toLocaleDateString("az-AZ") : "-"}</span>
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>İmtahan Nəticələri</h3>
          </div>
          <div style={{ padding: "1rem" }}>
            {exams.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem 0" }}>İmtahan tapılmadı</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {exams.map((ex, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(var(--glass-color), 0.02)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #8b5cf6" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>{ex.title}</h4>
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

      {/* Submit Assignment Modal */}
      {submitAssignmentModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "500px", maxWidth: "90%"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: "#f59e0b" }}>{submitAssignmentModal.title}</h3>
              <button onClick={() => setSubmitAssignmentModal(null)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Son Tarix: {submitAssignmentModal.dueDate}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Cavabınız (Mətn və ya Link)</label>
              <textarea 
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Müəllimə cavabınızı bura yazın və ya Google Drive linki əlavə edin..."
                style={{ width: "100%", padding: "1rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px", minHeight: "150px", fontSize: "0.95rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setSubmitAssignmentModal(null)} style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", cursor: "pointer", borderRadius: "6px" }}>Ləğv et</button>
              <button onClick={submitAssignment} style={{ padding: "0.6rem 1.2rem", background: "#f59e0b", border: "none", color: "var(--text-primary)", cursor: "pointer", borderRadius: "6px", fontWeight: "bold" }}>Göndər</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
