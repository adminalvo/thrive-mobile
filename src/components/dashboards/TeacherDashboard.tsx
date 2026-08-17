"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Users, Calendar, MoreVertical, MessageSquare, CheckCircle, GraduationCap, ClipboardList, BookOpen } from "lucide-react";
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
  const [noteIsPrivate, setNoteIsPrivate] = useState(false);
  const [alerts, setAlerts] = useState<any>(null);

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

  // Assignments
  const [createAssignmentModal, setCreateAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", groupId: "", dueDate: new Date().toISOString().split("T")[0], maxScore: 100 });
  
  const [checkAssignmentsModal, setCheckAssignmentsModal] = useState(false);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<any[]>([]);
  const [gradingForm, setGradingForm] = useState<{submissionId: string, score: string, feedback: string} | null>(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/teacher/assignments/submissions`);
      const data = await res.json();
      setAssignmentSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const createAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.groupId) return;
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentForm)
      });
      if (res.ok) {
        alert("Tapşırıq yaradıldı");
        setCreateAssignmentModal(false);
        setAssignmentForm({ title: "", description: "", groupId: "", dueDate: new Date().toISOString().split("T")[0], maxScore: 100 });
      } else {
        alert("Xəta baş verdi");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const gradeSubmission = async () => {
    if (!gradingForm || !gradingForm.score) return;
    try {
      const res = await fetch("/api/teacher/assignments/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: gradingForm.submissionId,
          score: parseFloat(gradingForm.score),
          feedback: gradingForm.feedback
        })
      });
      if (res.ok) {
        alert("Qiymət qeyd edildi");
        setGradingForm(null);
        fetchSubmissions(); // refresh
      } else {
        alert("Xəta baş verdi");
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
          setAlerts(data.alerts || null);
        }
      });
  }, []);

  const sendNote = async () => {
    if (!noteStudentId || !noteContent) return;
    try {
      const res = await fetch("/api/teacher/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: noteStudentId, content: noteContent, isPrivate: noteIsPrivate })
      });
      if (res.ok) {
        alert(c("success") || "Uğurla göndərildi");
        setNoteContent("");
        setNoteIsPrivate(false);
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
        alert(c("success") || t("attendanceRecorded"));
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
        alert(t("resultRecorded"));
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
        alert(t("examCreated"));
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
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={styles.actionBtn} onClick={() => {
            fetchSubmissions();
            setCheckAssignmentsModal(true);
          }} style={{ background: "rgba(var(--glass-color), 0.1)", color: "var(--text-primary)" }}>
            <ClipboardList size={18} style={{ marginRight: "8px" }} />{t("checkBtn")}</button>
          <button className={styles.actionBtn} onClick={() => setCreateAssignmentModal(true)} style={{ background: "rgba(var(--glass-color), 0.1)", color: "var(--text-primary)" }}>
            <BookOpen size={18} style={{ marginRight: "8px" }} />{t("assignmentBtn")}</button>
          <button className={styles.actionBtn} onClick={() => setCreateExamModal(true)}>
            <GraduationCap size={18} style={{ marginRight: "8px" }} />{t("examBtn")}</button>
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
              <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${stat.color} 0%, rgba(var(--glass-color), 0.1) 100%)` }}>
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

      {alerts && (alerts.pendingAssignments > 0 || alerts.lowAttendanceStudents?.length > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}
        >
          <h3 style={{ color: "#ef4444", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Diqqət Tələb Edən (Needs Attention)
          </h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {alerts.pendingAssignments > 0 && (
              <div 
                style={{ background: "rgba(2, 6, 23, 0.5)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(var(--glass-color), 0.05)", cursor: "pointer" }}
                onClick={() => {
                  fetchSubmissions();
                  setCheckAssignmentsModal(true);
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f59e0b" }}>{alerts.pendingAssignments}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Yoxlanılmamış Tapşırıq</div>
              </div>
            )}
            
            {alerts.lowAttendanceStudents?.length > 0 && (
              <div 
                style={{ background: "rgba(2, 6, 23, 0.5)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(var(--glass-color), 0.05)", cursor: "pointer" }}
                onClick={() => {
                  const studentIds = alerts.lowAttendanceStudents.map((s: any) => s.id);
                  setStudents(students.filter(s => studentIds.includes(s.id)));
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ef4444" }}>{alerts.lowAttendanceStudents.length}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Aşağı Davamiyyətli Şagird (Baxmaq üçün klikləyin)</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

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
              style={{ width: "100%", height: "100px", marginBottom: "1rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", padding: "0.5rem", borderRadius: "8px" }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={noteIsPrivate} onChange={(e) => setNoteIsPrivate(e.target.checked)} />
              Şəxsi Qeyd (Şagird və Valideyn görməyəcək)
            </label>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setNoteStudentId(null)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", cursor: "pointer" }}>Ləğv et</button>
              <button onClick={sendNote} style={{ padding: "0.5rem 1rem", background: "var(--aqua-teal)", border: "none", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Göndər</button>
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
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{t("date")}</label>
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Status</label>
              <select 
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              >
                <option value="PRESENT" style={{ color: "#000" }}>İştirak edib</option>
                <option value="ABSENT" style={{ color: "#000" }}>Qaib</option>
                <option value="LATE" style={{ color: "#000" }}>Gecikib</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setAttendanceModal(null)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
              <button onClick={markAttendance} style={{ padding: "0.5rem 1rem", background: "#10b981", border: "none", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Yadda Saxla</button>
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
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
                  >
                    {examsList.map(ex => (
                      <option key={ex.id} value={ex.id} style={{ color: "#000" }}>{ex.title} (Max: {ex.max_score})</option>
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
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Müəllim Rəyi (Köməkçi)</label>
                  <textarea 
                    value={examForm.feedback}
                    onChange={(e) => setExamForm({...examForm, feedback: e.target.value})}
                    placeholder="Tələbə haqqında rəyiniz..."
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px", minHeight: "80px" }}
                  />
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setExamModal(null)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
              {examsList.length > 0 && (
                <button onClick={submitExamGrade} style={{ padding: "0.5rem 1rem", background: "#8b5cf6", border: "none", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Yadda Saxla</button>
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
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Qrup</label>
              <select 
                value={newExamForm.groupId}
                onChange={(e) => setNewExamForm({...newExamForm, groupId: e.target.value})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              >
                <option value="" style={{ color: "#000" }}>Qrup Seçin</option>
                {/* Extract unique groups from todayClasses or students array */}
                {Array.from(new Map(students.map(s => [s.groupId, {id: s.groupId, name: s.group}])).values()).map((g: any) => (
                  <option key={g.id} value={g.id} style={{ color: "#000" }}>{g.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{t("date")}</label>
              <input 
                type="date" 
                value={newExamForm.date}
                onChange={(e) => setNewExamForm({...newExamForm, date: e.target.value})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Maksimal Bal</label>
              <input 
                type="number" 
                value={newExamForm.maxScore}
                onChange={(e) => setNewExamForm({...newExamForm, maxScore: parseInt(e.target.value) || 100})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setCreateExamModal(false)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {createAssignmentModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "400px", maxWidth: "90%"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>Yeni Tapşırıq Yarat</h3>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Başlıq</label>
              <input 
                type="text" 
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                placeholder="Məs: Riyaziyyat Fəsil 2 Testi"
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Məzmun (İstəyə bağlı)</label>
              <textarea 
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                placeholder="Tapşırıq haqqında ətraflı..."
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px", minHeight: "80px" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Qrup</label>
              <select 
                value={assignmentForm.groupId}
                onChange={(e) => setAssignmentForm({...assignmentForm, groupId: e.target.value})}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
              >
                <option value="" style={{ color: "#000" }}>Qrup Seçin</option>
                {dashboardData?.groups?.map((g: any) => (
                  <option key={g.id} value={g.id} style={{ color: "#000" }}>{g.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Deadline</label>
                <input 
                  type="date" 
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                  style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Maks Bal</label>
                <input 
                  type="number" 
                  value={assignmentForm.maxScore}
                  onChange={(e) => setAssignmentForm({...assignmentForm, maxScore: parseInt(e.target.value) || 100})}
                  style={{ width: "100%", padding: "0.8rem", background: "rgba(var(--glass-color), 0.05)", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", borderRadius: "8px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setCreateAssignmentModal(false)} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid rgba(var(--glass-color), 0.1)", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>Ləğv et</button>
              <button onClick={createAssignment} style={{ padding: "0.5rem 1rem", background: "var(--aqua-teal)", border: "none", color: "var(--text-primary)", cursor: "pointer", borderRadius: "4px" }}>{t("createBtn")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Check Assignments Modal */}
      {checkAssignmentsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card, #111)", padding: "2rem", borderRadius: "12px", width: "600px", maxWidth: "90%", maxHeight: "80vh", display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0 }}>Gözləyən Tapşırıqlar ({assignmentSubmissions.length})</h3>
              <button onClick={() => setCheckAssignmentsModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {assignmentSubmissions.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem 0" }}>Yoxlanılacaq tapşırıq yoxdur.</div>
              ) : (
                assignmentSubmissions.map(sub => (
                  <div key={sub.id} style={{ background: "rgba(var(--glass-color), 0.02)", border: "1px solid rgba(var(--glass-color), 0.05)", padding: "1rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "bold", color: "#f59e0b" }}>{sub.assignment_title}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{sub.group_name}</span>
                    </div>
                    <div style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Tələbə: <span style={{ color: "var(--text-primary)" }}>{sub.first_name} {sub.last_name}</span> <br/>
                      Tarix: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString("az-AZ", { hour: '2-digit', minute:'2-digit'}) : "-"}
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem", color: "#ddd" }}>
                      {sub.content}
                    </div>
                    
                    {gradingForm?.submissionId === sub.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(16, 185, 129, 0.05)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          <label style={{ fontSize: "0.9rem", color: "#ccc" }}>Bal (Max: {sub.max_score}):</label>
                          <input type="number" value={gradingForm.score} onChange={e => setGradingForm({...gradingForm, score: e.target.value})} style={{ width: "80px", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(var(--glass-color), 0.1)", background: "rgba(var(--glass-color), 0.1)", color: "var(--text-primary)" }} />
                        </div>
                        <input type="text" placeholder="Rəy (istəyə bağlı)..." value={gradingForm.feedback} onChange={e => setGradingForm({...gradingForm, feedback: e.target.value})} style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(var(--glass-color), 0.1)", background: "rgba(var(--glass-color), 0.1)", color: "var(--text-primary)" }} />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <button onClick={() => setGradingForm(null)} style={{ background: "transparent", color: "var(--text-primary)", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Ləğv et</button>
                          <button onClick={gradeSubmission} style={{ background: "#10b981", color: "var(--text-primary)", border: "none", padding: "0.4rem 1rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>Qiymətləndir</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => setGradingForm({ submissionId: sub.id, score: "", feedback: "" })} style={{ background: "transparent", border: "1px solid #10b981", color: "#10b981", padding: "0.4rem 1rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>Yoxla və Qiymətləndir</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
