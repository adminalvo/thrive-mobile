"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Users, Calendar, MoreVertical, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function TeacherDashboard() {
  const t = useTranslations("Dashboard");
  const c = useTranslations("Common");
  
  const [students, setStudents] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    fetch("/api/dashboards/teacher")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStudents(data.students || []);
          setTodayClasses(data.todayClasses || []);
        }
      });
  }, []);

  const sendNote = async () => {
    if (!noteStudentId || !noteContent) return;
    try {
      const res = await fetch("/api/teacher/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: noteStudentId, content: noteContent })
      });
      if (res.ok) {
        alert(c("success") || "Uğurla göndərildi");
        setNoteContent("");
        setNoteStudentId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    { title: t("myStudents") || "Mənim Tələbələrim", value: students.length, icon: Users, color: "var(--aqua-teal)" },
    { title: t("todayClasses"), value: todayClasses.length, icon: Calendar, color: "var(--ocean-blue)" }
  ];

  return (
    <div className={styles.dashboard}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("welcome")} (Müəllim)</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
      </motion.div>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statCard}
          >
            <div className={styles.statTop}>
              <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${stat.color} 0%, rgba(255,255,255,0.1) 100%)` }}>
                <stat.icon size={22} color="#fff" />
              </div>
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statValue}>{stat.value}</h3>
              <p className={styles.statTitle}>{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.tableCard}
        >
          <div className={styles.cardHeader}>
            <h3>{t("myStudents") || "Mənim Tələbələrim"}</h3>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("table.student")}</th>
                  <th>{t("table.group")}</th>
                  <th>Əlaqə</th>
                  <th>Qeyd Göndər</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map(student => (
                  <tr key={student.id}>
                    <td className={styles.studentName}>{student.name}</td>
                    <td className={styles.studentGroup}>{student.group}</td>
                    <td className={styles.studentDate}>{student.phone || student.email}</td>
                    <td>
                      <button 
                        onClick={() => setNoteStudentId(student.id)}
                        className={styles.iconBtn} 
                        style={{ color: "var(--aqua-teal)", background: "rgba(76, 162, 181, 0.1)" }}
                      >
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{textAlign: "center", padding: "1rem"}}>{c("empty")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.sideCard}
        >
          <div className={styles.cardHeader}>
            <h3>{t("todayClasses")}</h3>
          </div>
          <div className={styles.taskList}>
            {todayClasses.length > 0 ? todayClasses.map((cls, idx) => (
              <div key={idx} className={styles.taskItem}>
                <div className={styles.taskTime}>{cls.time}</div>
                <div className={styles.taskInfo}>
                  <h4>{cls.group}</h4>
                  <p>{cls.program} • {cls.room}</p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {c("empty")}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {noteStudentId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "400px", maxWidth: "90%"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>Tələbəyə Qeyd Göndər</h3>
            <textarea 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Qeydinizin məzmunu..."
              style={{ width: "100%", height: "100px", marginBottom: "1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem" }}
            />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setNoteStudentId(null)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer" }}>Ləğv et</button>
              <button onClick={sendNote} style={{ padding: "0.5rem 1rem", background: "var(--aqua-teal)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>Göndər</button>
            </div>
          </div>
        </div>
      )}

      {/* New placeholders for Attendance and Group Note modals */}
      {/* TODO: Implement full UI for Attendance and Group Notes */}
    </div>
  );
}
