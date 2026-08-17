"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Users, Calendar, MoreVertical, MessageSquare, CheckCircle, GraduationCap } from "lucide-react";
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

  const [attendanceModal, setAttendanceModal] = useState<{studentId: string, groupId: string, name: string} | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");

  const [createExamModal, setCreateExamModal] = useState(false);
  const [newExamForm, setNewExamForm] = useState({ title: "", groupId: "", date: new Date().toISOString().split("T")[0], maxScore: 100 });

  const [examModal, setExamModal] = useState<{studentId: string, name: string, groupId: string} | null>(null);
  const [examsList, setExamsList] = useState<any[]>([]);
  const [examForm, setExamForm] = useState({ examId: "", score: "", feedback: "" });

  const fetchExams = async (groupId: string) => {
    try {
      const res = await fetch(`/api/teacher/exams?groupId=${groupId}`);
      const data = await res.json();
      setExamsList(data || []);
      if (data && data.length > 0) {
        setExamForm({ examId: data[0].id, score: "", feedback: "" });
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const markAttendance = async () => {
    if (!attendanceModal) return;
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: attendanceModal.studentId,
          groupId: attendanceModal.groupId,
          date: attendanceDate,
          status: attendanceStatus
        })
      });
      if (res.ok) {
        alert(c("success") || "Davamiyyət qeyd edildi");
        setAttendanceModal(null);
      } else {
        alert("Xəta baş verdi. Zəhmət olmasa bir daha yoxlayın.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitExamGrade = async () => {
    if (!examModal || !examForm.examId || !examForm.score) return;
    try {
      const res = await fetch("/api/teacher/exams/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: examForm.examId,
          studentId: examModal.studentId,
          score: parseFloat(examForm.score),
          feedback: examForm.feedback
        })
      });
      if (res.ok) {
        alert("Nəticə uğurla qeyd edildi");
        setExamModal(null);
      } else {
        alert("Xəta baş verdi");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createExam = async () => {
    if (!newExamForm.title || !newExamForm.groupId || !newExamForm.date) return;
    try {
      const res = await fetch("/api/teacher/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExamForm)
      });
      if (res.ok) {
        alert("İmtahan yaradıldı");
        setCreateExamModal(false);
        setNewExamForm({ title: "", groupId: "", date: new Date().toISOString().split("T")[0], maxScore: 100 });
      } else {
        alert("Xəta baş verdi");
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
        <button className={styles.actionBtn} onClick={() => setCreateExamModal(true)}>
          <GraduationCap size={18} style={{ marginRight: "8px" }} /> Yeni İmtahan
        </button>
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
                  <th style={{textAlign: "right"}}>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map(student => (
                  <tr key={student.id}>
                    <td className={styles.studentName}>{student.name}</td>
                    <td className={styles.studentGroup}>{student.group}</td>
                    <td className={styles.studentDate}>{student.phone || student.email}</td>
                    <td style={{textAlign: "right"}}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => setAttendanceModal({ studentId: student.id, groupId: student.groupId, name: student.name })}
                          className={styles.iconBtn} 
                          style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}
                          title="Davamiyyət"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setExamModal({ studentId: student.id, name: student.name, groupId: student.groupId });
                            fetchExams(student.groupId);
                          }}
                          className={styles.iconBtn} 
                          style={{ color: "#8b5cf6", background: "rgba(139, 92, 246, 0.1)" }}
                          title="Qiymətləndir"
                        >
                          <GraduationCap size={16} />
                        </button>
                        <button 
                          onClick={() => setNoteStudentId(student.id)}
                          className={styles.iconBtn} 
                          style={{ color: "var(--aqua-teal)", background: "rgba(76, 162, 181, 0.1)" }}
                          title="Qeyd Göndər"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
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

      {/* Attendance Modal */}
      {attendanceModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "400px", maxWidth: "90%"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>Davamiyyət: {attendanceModal.name}</h3>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Tarix</label>
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Status</label>
              <select 
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
              >
                <option value="PRESENT" style={{ background: "var(--bg-dark)" }}>İştirak edib</option>
                <option value="ABSENT" style={{ background: "var(--bg-dark)" }}>Qaib</option>
                <option value="LATE" style={{ background: "var(--bg-dark)" }}>Gecikib</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setAttendanceModal(null)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
              <button onClick={markAttendance} style={{ padding: "0.5rem 1rem", background: "#10b981", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>Yadda Saxla</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Grading Modal */}
      {examModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "400px", maxWidth: "90%"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>Qiymətləndirmə: {examModal.name}</h3>
            
            {examsList.length === 0 ? (
              <div style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
                Bu qrup üçün aktiv imtahan tapılmadı. Əvvəlcə imtahan yaratmalısınız.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>İmtahan seçin</label>
                  <select 
                    value={examForm.examId}
                    onChange={(e) => setExamForm({...examForm, examId: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
                  >
                    {examsList.map(ex => (
                      <option key={ex.id} value={ex.id} style={{ background: "var(--bg-dark)" }}>{ex.title} (Max: {ex.max_score})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Bal / Nəticə</label>
                  <input 
                    type="number" 
                    value={examForm.score}
                    onChange={(e) => setExamForm({...examForm, score: e.target.value})}
                    placeholder="Məs: 85"
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Müəllim Rəyi (Köməkçi)</label>
                  <textarea 
                    value={examForm.feedback}
                    onChange={(e) => setExamForm({...examForm, feedback: e.target.value})}
                    placeholder="Tələbə haqqında rəyiniz..."
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", minHeight: "80px" }}
                  />
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setExamModal(null)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
              {examsList.length > 0 && (
                <button onClick={submitExamGrade} style={{ padding: "0.5rem 1rem", background: "#8b5cf6", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>Yadda Saxla</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {createExamModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "400px", maxWidth: "90%"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>Yeni İmtahan Yarat</h3>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Başlıq</label>
              <input 
                type="text" 
                value={newExamForm.title}
                onChange={(e) => setNewExamForm({...newExamForm, title: e.target.value})}
                placeholder="Məs: Fevral Sınaq İmtahanı"
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Qrup</label>
              <select 
                value={newExamForm.groupId}
                onChange={(e) => setNewExamForm({...newExamForm, groupId: e.target.value})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
              >
                <option value="" style={{ background: "var(--bg-dark)" }}>Qrup Seçin</option>
                {/* Extract unique groups from todayClasses or students array */}
                {Array.from(new Map(students.map(s => [s.groupId, {id: s.groupId, name: s.group}])).values()).map((g: any) => (
                  <option key={g.id} value={g.id} style={{ background: "var(--bg-dark)" }}>{g.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Tarix</label>
              <input 
                type="date" 
                value={newExamForm.date}
                onChange={(e) => setNewExamForm({...newExamForm, date: e.target.value})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Maksimal Bal</label>
              <input 
                type="number" 
                value={newExamForm.maxScore}
                onChange={(e) => setNewExamForm({...newExamForm, maxScore: parseInt(e.target.value) || 100})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setCreateExamModal(false)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
              <button onClick={createExam} style={{ padding: "0.5rem 1rem", background: "#8b5cf6", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px" }}>İmtahan Yarat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
