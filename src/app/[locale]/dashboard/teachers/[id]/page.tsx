"use client";

import { use, useState, useEffect, useCallback } from "react";
import styles from "./teacherProfile.module.css";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Layers,
  Award
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface TeacherProfileData {
  teacher: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialty: string;
    status: string;
    joinDate: string;
  };
  groups: Array<{
    id: string;
    name: string;
    program: string;
    room: string;
    studentCount: number;
    maxCapacity: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    groupName: string;
  }>;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    endTime: string;
    room: string;
    groupName: string;
  }>;
  stats: {
    activeGroupsCount: number;
    totalStudentsCount: number;
    weeklyHours: number;
  };
}

export default function TeacherDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const t = useTranslations("Profile");
  const c = useTranslations("Common");

  const [data, setData] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "groups" | "schedule" | "students">("overview");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: ""
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/teachers/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setEditForm({
          name: json.teacher.name || "",
          email: json.teacher.email || "",
          phone: json.teacher.phone || "",
          specialty: json.teacher.specialty || ""
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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success(c("save"));
        setShowEditModal(false);
        fetchProfile();
      } else {
        toast.error("Xəta baş verdi");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu müəllimi silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi");
        router.push("/dashboard/teachers");
      } else {
        toast.error("Silinmədi");
      }
    } catch {
      toast.error("Xəta baş verdi");
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
        <Link href="/dashboard/teachers" className={styles.backBtn}>
          <ArrowLeft size={18} /> {t("backToTeachers")}
        </Link>
        <p className={styles.emptyState}>{t("notFound")}</p>
      </div>
    );
  }

  const { teacher, groups, students, schedules, stats } = data;

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <Link href="/dashboard/teachers" className={styles.backBtn}>
        <ArrowLeft size={18} /> {t("backToTeachers")}
      </Link>

      {/* Summary Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.headerCard}
      >
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {teacher?.name ? String(teacher.name).substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className={styles.details}>
            <h1>{teacher.name}</h1>
            <div className={styles.metaRow}>
              <span className={styles.idBadge}>
                <Award size={13} style={{ display: "inline", marginRight: 4 }} />
                {teacher.specialty}
              </span>
              <span className={teacher.status === "ACTIVE" ? styles.statusActive : styles.idBadge}>
                <CheckCircle size={14} /> {teacher.status === "ACTIVE" ? c("active") : c("inactive")}
              </span>
              <span className={styles.idBadge}>
                {t("joinDate")}: {teacher?.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
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
          <div className={styles.kpiIcon} style={{ background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
            <Layers size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("activeGroups")}</p>
            <h3>{stats.activeGroupsCount}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <Users size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("totalStudents")}</p>
            <h3>{stats.totalStudentsCount}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <Clock size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("weeklyHours")}</p>
            <h3>{stats.weeklyHours} saat</h3>
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
          className={`${styles.tabBtn} ${activeTab === "groups" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          <Layers size={16} /> {t("groups")} ({groups.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "schedule" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          <Calendar size={16} /> {t("schedule")} ({schedules.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "students" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <Users size={16} /> {t("students")} ({students.length})
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
                <span className={styles.infoLabel}>{t("fullName")}</span>
                <span className={styles.infoValue}>{teacher.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("specialty")}</span>
                <span className={styles.infoValue}>{teacher.specialty}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("email")}</span>
                <span className={styles.infoValue}>{teacher.email || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("phone")}</span>
                <span className={styles.infoValue}>{teacher.phone || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("joinDate")}</span>
                <span className={styles.infoValue}>{teacher?.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "groups" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Layers size={18} /> {t("groups")}
            </h3>
            {groups.length === 0 ? (
              <p className={styles.emptyState}>{t("noGroups")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Qrup Adı</th>
                      <th>{t("program")}</th>
                      <th>{t("room")}</th>
                      <th>{t("capacity")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(g => (
                      <tr key={g.id}>
                        <td>
                          <Link href={`/dashboard/groups/${g.id}`} style={{ color: "var(--aqua-teal)", fontWeight: 600 }}>
                            {g.name}
                          </Link>
                        </td>
                        <td>{g.program}</td>
                        <td>{g.room}</td>
                        <td>{g.studentCount} / {g.maxCapacity}</td>
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
                      <th>Qrup</th>
                      <th>{t("room")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.dayName}</td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>{s.groupName}</td>
                        <td>{s.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "students" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Users size={18} /> {t("students")}
            </h3>
            {students.length === 0 ? (
              <p className={styles.emptyState}>{t("noStudents")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("fullName")}</th>
                      <th>Qrup</th>
                      <th>{t("email")}</th>
                      <th>{t("phone")}</th>
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
                        <td>{s.groupName}</td>
                        <td>{s.email || "—"}</td>
                        <td>{s.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
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
                  <label>{t("fullName")}</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("specialty")}</label>
                  <input 
                    type="text" 
                    value={editForm.specialty} 
                    onChange={e => setEditForm({...editForm, specialty: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("email")}</label>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("phone")}</label>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                  />
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
    </div>
  );
}
