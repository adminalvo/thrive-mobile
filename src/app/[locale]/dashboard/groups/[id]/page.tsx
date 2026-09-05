"use client";

import { use, useState, useEffect, useCallback } from "react";
import styles from "./groupProfile.module.css";
import { 
  ArrowLeft, 
  Component, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Plus, 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Percent, 
  Layers
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface GroupProfileData {
  group: {
    id: string;
    name: string;
    program: string;
    programDescription: string;
    durationMonths: number;
    teacher: string;
    teacherEmail: string;
    teacherPhone: string;
    room: string;
    maxCapacity: number;
    status: string;
    createdAt: string;
  };
  students: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    enrolledAt: string;
    paymentStatus: string;
    attendanceRate: string;
  }>;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    endTime: string;
    room: string;
  }>;
  attendanceHistory: Array<{
    id?: string;
    date: string;
    presentCount: number;
    absentCount: number;
    topic: string;
  }>;
  stats: {
    enrolledStudentsCount: number;
    maxCapacity: number;
    capacityPercentage: number;
    averageAttendance: string;
  };
}

export default function GroupDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const tToast = useTranslations("Toasts");

  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const t = useTranslations("Profile");
  const c = useTranslations("Common");

  const [data, setData] = useState<GroupProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "schedule" | "attendance">("overview");

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    room: "",
    program_id: "",
    teacher_id: ""
  });

  // Data for selects
  const [programs, setPrograms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Add student form
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setEditForm({
          name: json.group.name || "",
          room: json.group.room || "",
          program_id: json.group.program_id || "",
          teacher_id: json.group.teacher_id || ""
        });
      } else {
        toast.error(t("notFound"));
      }
    } catch {
      toast.error(t("notFound"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const fetchAvailableStudents = async () => {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setAvailableStudents(data);
      }
    } catch (e) {
      console.error("Failed to fetch students", e);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [progRes, teachRes] = await Promise.all([
        fetch("/api/programs"),
        fetch("/api/teachers")
      ]);
      if (progRes.ok) setPrograms(await progRes.json());
      if (teachRes.ok) setTeachers(await teachRes.json());
    } catch (e) {
      console.error("Failed to fetch dropdown data", e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAvailableStudents();
    fetchDropdownData();
  }, [fetchProfile]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success(c("save"));
        setShowEditModal(false);
        fetchProfile();
      } else {
        toast.error(tToast("genericError"));
      }
    } catch {
      toast.error(tToast("genericError"));
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentToAdd) return;
    try {
      const res = await fetch(`/api/groups/${id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: selectedStudentToAdd })
      });
      if (res.ok) {
        toast.success("Tələbə uğurla qrupa əlavə edildi");
        setShowAddStudentModal(false);
        setSelectedStudentToAdd("");
        setActiveTab("students");
        await fetchProfile();
      } else {
        const errorData = await res.json();
        toast.error(`Xəta baş verdi: ${errorData.details || errorData.error || "Məlumatsız xəta"}`);
      }
    } catch {
      toast.error(tToast("genericError"));
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`${studentName || "Tələbəni"} bu qrupdan çıxarmaq istədiyinizə əminsiniz?`)) return;
    try {
      const res = await fetch(`/api/groups/${id}/students?student_id=${studentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Tələbə qrupdan çıxarıldı");
        fetchProfile();
      } else {
        toast.error(tToast("genericError"));
      }
    } catch {
      toast.error(tToast("genericError"));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu qrupu silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(tToast("deleteSuccess"));
        router.push("/dashboard/groups");
      } else {
        toast.error(tToast("deleteError"));
      }
    } catch {
      toast.error(tToast("genericError"));
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>{t("loading")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <Link href="/dashboard/groups" className={styles.backBtn}>
          <ArrowLeft size={18} /> {t("backToGroups")}
        </Link>
        <p className={styles.emptyState}>{t("notFound")}</p>
      </div>
    );
  }

  const { group, students, schedules, attendanceHistory, stats } = data;

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <Link href="/dashboard/groups" className={styles.backBtn}>
        <ArrowLeft size={18} /> {t("backToGroups")}
      </Link>

      {/* Header Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.headerCard}
      >
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            <Component size={32} />
          </div>
          <div className={styles.details}>
            <h1>{group.name}</h1>
            <div className={styles.metaRow}>
              <span className={styles.tagBadge}>
                <BookOpen size={13} /> {group.program}
              </span>
              <span className={styles.tagBadge}>
                <MapPin size={13} /> {group.room}
              </span>
              <span className={group.status === "ACTIVE" ? styles.statusActive : styles.tagBadge}>
                <CheckCircle size={14} /> {group.status === "ACTIVE" ? c("active") : c("inactive")}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionBtnPrimary} onClick={() => setShowAddStudentModal(true)}>
            <Plus size={16} /> {t("addStudent")}
          </button>
          <button className={styles.actionBtnSecondary} onClick={() => setShowEditModal(true)}>
            <Edit size={16} /> {t("editProfile")}
          </button>
          <button className={styles.actionBtnDanger} onClick={handleDelete}>
            <Trash2 size={16} /> {t("deleteProfile")}
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" }}>
            <Users size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("totalStudents")}</p>
            <h3>{stats.enrolledStudentsCount} / {stats.maxCapacity}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <Percent size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("capacityUsage")}</p>
            <h3>{stats.capacityPercentage}%</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
            <Clock size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("avgAttendance")}</p>
            <h3>{stats.averageAttendance}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
            <Calendar size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("duration")}</p>
            <h3>{group.durationMonths} {t("months")}</h3>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BookOpen size={16} /> {t("overview")}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "students" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <Users size={16} /> {t("students")} ({students.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "schedule" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          <Calendar size={16} /> {t("schedule")} ({schedules.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "attendance" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <Clock size={16} /> {t("attendance")} ({attendanceHistory.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <BookOpen size={18} /> {t("generalInfo")}
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("program")}</span>
                <span className={styles.infoValue}>{group.program}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("teacher")}</span>
                <span className={styles.infoValue}>{group.teacher}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("room")}</span>
                <span className={styles.infoValue}>{group.room}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("capacity")}</span>
                <span className={styles.infoValue}>{stats.enrolledStudentsCount} / {group.maxCapacity}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("duration")}</span>
                <span className={styles.infoValue}>{group.durationMonths} {t("months")}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("joinDate")}</span>
                <span className={styles.infoValue}>{group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "students" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                <Users size={18} /> {t("students")}
              </h3>
              <button className={styles.actionBtnPrimary} onClick={() => setShowAddStudentModal(true)}>
                <Plus size={14} /> {t("addStudent")}
              </button>
            </div>
            {students.length === 0 ? (
              <p className={styles.emptyState}>{t("noStudents")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("fullName")}</th>
                      <th>{t("phone")}</th>
                      <th>{t("email")}</th>
                      <th>{t("status")}</th>
                      <th>{t("attendanceRate")}</th>
                      <th style={{ textAlign: "right" }}>Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td>
                          <Link href={`/dashboard/students/${s.id}`} style={{ color: "var(--aqua-teal)", fontWeight: 600 }}>
                            {s.name}
                          </Link>
                        </td>
                        <td>{s.phone || "—"}</td>
                        <td>{s.email || "—"}</td>
                        <td>
                          <span className={`${styles.badge} ${s.paymentStatus === "PAID" ? styles.badgePaid : styles.badgePending}`}>
                            {s.paymentStatus === "PAID" ? c("active") : c("pending")}
                          </span>
                        </td>
                        <td>{s.attendanceRate}</td>
                        <td style={{ textAlign: "right" }}>
                          <button 
                            onClick={() => handleRemoveStudent(s.id, s.name)}
                            style={{ 
                              background: "rgba(239, 68, 68, 0.1)", 
                              border: "1px solid rgba(239, 68, 68, 0.25)", 
                              color: "#ef4444", 
                              borderRadius: "6px", 
                              padding: "4px 10px", 
                              cursor: "pointer", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "4px", 
                              fontSize: "0.8rem",
                              fontWeight: 600
                            }}
                            title="Qrupdan çıxar"
                          >
                            <Trash2 size={13} /> Çıxar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "schedule" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Calendar size={18} /> {t("schedule")}
            </h3>
            {schedules.length === 0 ? (
              <p className={styles.emptyState}>{t("noSchedule")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("day")}</th>
                      <th>{t("time")}</th>
                      <th>{t("room")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.dayName}</td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>{s.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Clock size={18} /> {t("attendance")}
            </h3>
            {attendanceHistory.length === 0 ? (
              <p className={styles.emptyState}>{t("noAttendance")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("date")}</th>
                      <th>{t("present")}</th>
                      <th>{t("absent")}</th>
                      <th>{t("topic")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((ah, idx) => (
                      <tr key={ah.id || idx}>
                        <td>{ah.date}</td>
                        <td>
                          <span className={styles.badgePaid} style={{ padding: "0.2rem 0.6rem", borderRadius: 4 }}>
                            {ah.presentCount} {t("present")}
                          </span>
                        </td>
                        <td>
                          <span className={styles.badgePending} style={{ padding: "0.2rem 0.6rem", borderRadius: 4 }}>
                            {ah.absentCount} {t("absent")}
                          </span>
                        </td>
                        <td>{ah.topic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <h2>{t("editProfile")}</h2>
              <form onSubmit={handleEditSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Qrup Adı</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("room")}</label>
                  <input 
                    type="text" 
                    value={editForm.room} 
                    onChange={e => setEditForm({...editForm, room: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("program")}</label>
                  <select 
                    value={editForm.program_id} 
                    onChange={e => setEditForm({...editForm, program_id: e.target.value})}
                  >
                    <option value="">Seçin...</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("teacher")}</label>
                  <select 
                    value={editForm.teacher_id} 
                    onChange={e => setEditForm({...editForm, teacher_id: e.target.value})}
                  >
                    <option value="">Seçin...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.teacher_table_id || t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                    {c("cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {c("save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddStudentModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <h2>{t("addStudent")}</h2>
              <form onSubmit={handleAddStudent} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Tələbə Seçin</label>
                  {(() => {
                    const enrolledIds = new Set((students || []).map(s => s.id));
                    const eligible = availableStudents.filter(s => !enrolledIds.has(s.id));
                    return (
                      <select 
                        required 
                        value={selectedStudentToAdd} 
                        onChange={e => setSelectedStudentToAdd(e.target.value)} 
                      >
                        <option value="">-- Tələbə Seçin ({eligible.length} tələbə mövcuddur) --</option>
                        {eligible.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.phone ? `(${s.phone})` : s.email ? `(${s.email})` : ""}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowAddStudentModal(false)}>
                    {c("cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={!selectedStudentToAdd}>
                    {c("save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
