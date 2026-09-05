"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./page.module.css";
import { 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  X, 
  Search, 
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
  RefreshCw,
  Loader2,
  PlayCircle,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface TaskSchedule {
  id: string;
  title: string;
  type: "Shooting" | "Meeting" | "Conference" | "Task" | "Other";
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  participants: string | null;
  description: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdBy: string | null;
  createdAt: string;
}

const CORE_TEAM_MEMBERS = [
  "Tural Zeynalov",
  "Zeynmedia",
  "Yusif Verdiyev",
  "Tamerlan",
  "Mehti"
];

const LOCATION_SUGGESTIONS = [
  "Əsas Studiya (Otaq 3)",
  "Nizami Filialı",
  "İclas Otağı (Konfrans)",
  "Online (Zoom / Google Meet)"
];

export default function TasksSchedulePage() {
  const t = useTranslations("TasksSchedule");
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user?.role || "").toLowerCase();
  const userEmail = (session?.user?.email || "").toLowerCase();
  const userName = (((session?.user as any)?.name) || "").toLowerCase();

  // Access check: super_admin, admin, zeynmedia, Tural Zeynalov, Yusif Verdiyev, Tamerlan, Mehti
  const isAuthorized = useMemo(() => {
    if (sessionStatus === "loading") return null;
    return (
      userRole === "super_admin" ||
      userRole === "admin" ||
      userEmail.includes("zeyn") ||
      userEmail.includes("turalzeynalov") ||
      userEmail.includes("yusifverdiyev") ||
      userEmail.includes("tamerlan") ||
      userEmail.includes("mehti") ||
      userName.includes("tural") ||
      userName.includes("zeynalov") ||
      userName.includes("yusif") ||
      userName.includes("zeyn") ||
      userName.includes("tamerlan")
    );
  }, [userRole, userEmail, userName, sessionStatus]);

  const [schedules, setSchedules] = useState<TaskSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "this_week">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TaskSchedule | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "Shooting" as TaskSchedule["type"],
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:30",
    location: "",
    participants: "",
    description: "",
    status: "PLANNED" as TaskSchedule["status"]
  });

  const fetchSchedules = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const res = await fetch("/api/tasks-schedule");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSchedules(data);
        } else if (data?.schedules) {
          setSchedules(data.schedules);
        }
        setLastSyncTime(new Date().toLocaleTimeString());
      } else if (!silent) {
        toast.error("Qrafik məlumatlarını yükləmək mümkün olmadı");
      }
    } catch {
      if (!silent) toast.error("Şəbəkə xətası baş verdi");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and Real-time background sync polling every 4 seconds
  useEffect(() => {
    if (isAuthorized === true) {
      fetchSchedules(false);

      const interval = setInterval(() => {
        fetchSchedules(true);
      }, 4000);

      return () => clearInterval(interval);
    } else if (isAuthorized === false) {
      setLoading(false);
    }
  }, [isAuthorized, fetchSchedules]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error(t("formTitlePlaceholder"));
      return;
    }

    try {
      if (editItem) {
        const updatedItem: TaskSchedule = { ...editItem, ...formData };
        setSchedules(prev => prev.map(s => s.id === editItem.id ? updatedItem : s));
        setShowModal(false);
        toast.success(t("updateSuccess"));

        const res = await fetch("/api/tasks-schedule", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem.id, ...formData })
        });
        if (!res.ok) fetchSchedules(true);
      } else {
        const tempId = "temp-" + Date.now();
        const newItem: TaskSchedule = {
          id: tempId,
          ...formData,
          createdBy: session?.user?.name || "Admin",
          createdAt: new Date().toISOString()
        };
        setSchedules(prev => [newItem, ...prev]);
        setShowModal(false);
        toast.success(t("createSuccess"));

        const res = await fetch("/api/tasks-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          fetchSchedules(true);
        } else {
          fetchSchedules(true);
        }
      }
    } catch {
      toast.error("Xəta baş verdi");
      fetchSchedules(true);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(t("deleteConfirm", { title }))) return;

    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success(t("deleteSuccess"));

    try {
      await fetch(`/api/tasks-schedule?id=${id}`, { method: "DELETE" });
    } catch {
      fetchSchedules(true);
    }
  };

  const handleStatusChange = async (id: string, status: TaskSchedule["status"]) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success(t("statusSuccess"));

    try {
      await fetch("/api/tasks-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
    } catch {
      fetchSchedules(true);
    }
  };

  const handleQuickStatusCycle = async (item: TaskSchedule) => {
    const nextStatusMap: Record<TaskSchedule["status"], TaskSchedule["status"]> = {
      PLANNED: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "PLANNED",
      CANCELLED: "PLANNED"
    };
    const nextStatus = nextStatusMap[item.status];
    await handleStatusChange(item.id, nextStatus);
  };

  const openCreateModal = () => {
    setEditItem(null);
    setFormData({
      title: "",
      type: "Shooting",
      date: new Date().toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "15:30",
      location: "",
      participants: "Tural Zeynalov, Zeynmedia",
      description: "",
      status: "PLANNED"
    });
    setShowModal(true);
  };

  const openEditModal = (item: TaskSchedule) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      date: item.date,
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      location: item.location || "",
      participants: item.participants || "",
      description: item.description || "",
      status: item.status
    });
    setShowModal(true);
  };

  const toggleParticipant = (name: string) => {
    const current = formData.participants 
      ? formData.participants.split(",").map(p => p.trim()).filter(Boolean) 
      : [];
    
    if (current.some(p => p.toLowerCase() === name.toLowerCase())) {
      const updated = current.filter(p => p.toLowerCase() !== name.toLowerCase());
      setFormData({ ...formData, participants: updated.join(", ") });
    } else {
      current.push(name);
      setFormData({ ...formData, participants: current.join(", ") });
    }
  };

  const filteredSchedules = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const dayOfWeek = now.getDay();
    const diffToMon = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diffToMon);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split("T")[0];
    const sundayStr = sunday.toISOString().split("T")[0];

    return schedules.filter(s => {
      const matchType = typeFilter === "all" || s.type === typeFilter;
      
      let matchDate = true;
      if (dateFilter === "today") {
        matchDate = s.date === todayStr;
      } else if (dateFilter === "tomorrow") {
        matchDate = s.date === tomorrowStr;
      } else if (dateFilter === "this_week") {
        matchDate = s.date >= mondayStr && s.date <= sundayStr;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        s.title.toLowerCase().includes(q) || 
        (s.participants || "").toLowerCase().includes(q) || 
        (s.location || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);

      return matchType && matchDate && matchQuery;
    });
  }, [schedules, typeFilter, dateFilter, searchQuery]);

  const stats = useMemo(() => {
    const shootings = schedules.filter(s => s.type === "Shooting").length;
    const meetings = schedules.filter(s => s.type === "Meeting" || s.type === "Conference").length;
    const completed = schedules.filter(s => s.status === "COMPLETED").length;
    return { shootings, meetings, completed, total: schedules.length };
  }, [schedules]);

  if (sessionStatus === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#38bdf8" }}>
        <Loader2 size={40} className={styles.spin} />
        <p style={{ color: "#94a3b8" }}>{t("checkingSession")}</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#ef4444" }}>
        <ShieldAlert size={56} />
        <h2 style={{ color: "#fff", margin: 0 }}>{t("unauthorizedTitle")}</h2>
        <p style={{ color: "#94a3b8", maxWidth: "420px", textAlign: "center" }}>
          {t("unauthorizedDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
            <h1 className={styles.title} style={{ margin: 0 }}>
              <CalendarCheck size={28} style={{ color: "#00c4b5" }} />
              {t("title")}
            </h1>
            <div className={styles.liveBadge} title="Real-time 4s">
              <span className={styles.pulseDot} />
              <span>{t("liveSync")}</span>
              {lastSyncTime && (
                <span style={{ fontSize: "0.7rem", opacity: 0.8, marginLeft: "2px" }}>({lastSyncTime})</span>
              )}
              <button 
                onClick={() => fetchSchedules(true)} 
                title={t("refresh")}
                style={{ background: "transparent", border: "none", color: "#10b981", cursor: "pointer", display: "inline-flex", alignItems: "center", padding: "1px" }}
              >
                <RefreshCw size={12} className={isRefreshing ? styles.spin : ""} />
              </button>
            </div>
          </div>
          <p className={styles.subtitle} style={{ marginTop: "0.4rem" }}>
            {t("subtitle")}
          </p>
        </div>

        <button className={styles.btnPrimary} onClick={openCreateModal}>
          <Plus size={16} />
          <span>{t("newScheduleBtn")}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6" }}>
            <Video size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>{t("statsShootings")}</span>
            <span className={styles.statValue}>{stats.shootings}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Users size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>{t("statsMeetings")}</span>
            <span className={styles.statValue}>{stats.meetings}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>{t("statsCompleted")}</span>
            <span className={styles.statValue}>{stats.completed}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(0, 196, 181, 0.15)", color: "#00c4b5" }}>
            <Calendar size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>{t("statsTotal")}</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterPills}>
          <button 
            className={`${styles.filterPill} ${typeFilter === "all" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("all")}
          >
            {t("filterAll")} ({schedules.length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Shooting" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Shooting")}
          >
            {t("filterShooting")} ({schedules.filter(s => s.type === "Shooting").length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Meeting" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Meeting")}
          >
            {t("filterMeeting")} ({schedules.filter(s => s.type === "Meeting").length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Conference" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Conference")}
          >
            {t("filterConference")} ({schedules.filter(s => s.type === "Conference").length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Task" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Task")}
          >
            {t("filterTask")} ({schedules.filter(s => s.type === "Task").length})
          </button>
        </div>

        {/* Date Filters */}
        <div className={styles.dateFilterGroup}>
          <button 
            className={`${styles.dateFilterBtn} ${dateFilter === "all" ? styles.dateFilterBtnActive : ""}`}
            onClick={() => setDateFilter("all")}
          >
            {t("dateAll")}
          </button>
          <button 
            className={`${styles.dateFilterBtn} ${dateFilter === "today" ? styles.dateFilterBtnActive : ""}`}
            onClick={() => setDateFilter("today")}
          >
            {t("dateToday")}
          </button>
          <button 
            className={`${styles.dateFilterBtn} ${dateFilter === "tomorrow" ? styles.dateFilterBtnActive : ""}`}
            onClick={() => setDateFilter("tomorrow")}
          >
            {t("dateTomorrow")}
          </button>
          <button 
            className={`${styles.dateFilterBtn} ${dateFilter === "this_week" ? styles.dateFilterBtnActive : ""}`}
            onClick={() => setDateFilter("this_week")}
          >
            {t("dateThisWeek")}
          </button>
        </div>

        <div className={styles.searchGroup}>
          <Search size={15} style={{ color: "#64748b" }} />
          <input 
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", color: "#94a3b8", gap: "0.5rem" }}>
          <Loader2 size={24} className={styles.spin} />
          <span>{t("loading")}</span>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
          <div>{t("emptyState")}</div>
        </div>
      ) : (
        <div className={styles.scheduleGrid}>
          {filteredSchedules.map(item => {
            const typeStyle = 
              item.type === "Shooting" ? styles.typeShooting :
              item.type === "Meeting" ? styles.typeMeeting :
              item.type === "Conference" ? styles.typeConference : styles.typeTask;

            const typeLabel = 
              item.type === "Shooting" ? t("typeShooting") :
              item.type === "Meeting" ? t("typeMeeting") :
              item.type === "Conference" ? t("typeConference") : t("typeTask");

            return (
              <motion.div 
                key={item.id} 
                className={styles.scheduleCard}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={`${styles.typeBadge} ${typeStyle}`}>{typeLabel}</span>
                    <h3 className={styles.cardTitle} style={{ marginTop: "0.5rem" }}>{item.title}</h3>
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={14} style={{ color: "#00c4b5" }} />
                    <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{item.date}</span>
                    {item.startTime && (
                      <span style={{ color: "#94a3b8" }}>
                        • <Clock size={13} style={{ verticalAlign: "middle", margin: "0 2px" }} />
                        {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
                      </span>
                    )}
                  </div>

                  {item.location && (
                    <div className={styles.metaItem}>
                      <MapPin size={14} style={{ color: "#f472b6" }} />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {item.participants && (
                    <div>
                      <div className={styles.metaItem} style={{ marginBottom: "2px" }}>
                        <Users size={14} style={{ color: "#60a5fa" }} />
                        <span>{t("participantsLabel")}</span>
                      </div>
                      <div className={styles.participantsList}>
                        {item.participants.split(",").map((p, idx) => (
                          <span key={idx} className={styles.participantPill}>{p.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {item.description && (
                  <div className={styles.cardDescription}>
                    {item.description}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <select 
                      value={item.status} 
                      onChange={e => handleStatusChange(item.id, e.target.value as any)}
                      className={styles.statusSelect}
                      style={{
                        borderColor: 
                          item.status === "COMPLETED" ? "#10b981" :
                          item.status === "IN_PROGRESS" ? "#00c4b5" :
                          item.status === "CANCELLED" ? "#ef4444" : "#f59e0b",
                        color:
                          item.status === "COMPLETED" ? "#34d399" :
                          item.status === "IN_PROGRESS" ? "#00c4b5" :
                          item.status === "CANCELLED" ? "#f87171" : "#fbbf24"
                      }}
                    >
                      <option value="PLANNED">{t("statusPlanned")}</option>
                      <option value="IN_PROGRESS">{t("statusInProgress")}</option>
                      <option value="COMPLETED">{t("statusCompleted")}</option>
                      <option value="CANCELLED">{t("statusCancelled")}</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleQuickStatusCycle(item)}
                      title="Statusu Dəyiş"
                      className={styles.iconBtn}
                      style={{ padding: "5px 7px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "2px" }}
                    >
                      {item.status === "PLANNED" && <PlayCircle size={14} style={{ color: "#38bdf8" }} />}
                      {item.status === "IN_PROGRESS" && <CheckCircle size={14} style={{ color: "#10b981" }} />}
                      {item.status === "COMPLETED" && <RotateCcw size={14} style={{ color: "#94a3b8" }} />}
                      {item.status === "CANCELLED" && <RotateCcw size={14} style={{ color: "#94a3b8" }} />}
                    </button>
                  </div>

                  <div className={styles.cardActions}>
                    <button 
                      className={styles.iconBtn} 
                      onClick={() => openEditModal(item)}
                      title="Redaktə et"
                    >
                      <Edit size={15} />
                    </button>
                    <button 
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`} 
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Clean, compact Modal */}
      <AnimatePresence>
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <motion.div 
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: "560px", width: "95%" }}
            >
              <div className={styles.modalHeader}>
                <h3>{editItem ? t("modalTitleEdit") : t("modalTitleNew")}</h3>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className={styles.modalBody} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label>{t("formTitle")}</label>
                    <input 
                      type="text"
                      placeholder={t("formTitlePlaceholder")}
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>{t("formType")}</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      >
                        <option value="Shooting">{t("typeShooting")}</option>
                        <option value="Meeting">{t("typeMeeting")}</option>
                        <option value="Conference">{t("typeConference")}</option>
                        <option value="Task">{t("typeTask")}</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>{t("formDate")}</label>
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>{t("formStartTime")}</label>
                      <input 
                        type="time"
                        value={formData.startTime}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>{t("formEndTime")}</label>
                      <input 
                        type="time"
                        value={formData.endTime}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t("formLocation")}</label>
                    <input 
                      type="text"
                      placeholder={t("formLocationPlaceholder")}
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.35rem" }}>
                      {LOCATION_SUGGESTIONS.map(loc => (
                        <button
                          key={loc}
                          type="button"
                          className={styles.participantChip}
                          style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem" }}
                          onClick={() => setFormData({ ...formData, location: loc })}
                        >
                          📍 {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t("formParticipants")}</label>
                    <input 
                      type="text"
                      placeholder={t("formParticipantsPlaceholder")}
                      value={formData.participants}
                      onChange={e => setFormData({ ...formData, participants: e.target.value })}
                    />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.45rem" }}>
                      {CORE_TEAM_MEMBERS.map(name => {
                        const isSelected = formData.participants
                          .toLowerCase()
                          .split(",")
                          .map(p => p.trim())
                          .includes(name.toLowerCase());
                        return (
                          <button
                            key={name}
                            type="button"
                            className={`${styles.participantChip} ${isSelected ? styles.participantChipActive : ""}`}
                            onClick={() => toggleParticipant(name)}
                          >
                            {isSelected ? "✓ " : "+ "}{name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t("formDesc")}</label>
                    <textarea 
                      rows={2}
                      placeholder={t("formDescPlaceholder")}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                    {t("btnCancel")}
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editItem ? t("btnSave") : t("btnAdd")}
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
