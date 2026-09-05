"use client";

import { useState, useEffect, useMemo } from "react";
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
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

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

export default function TasksSchedulePage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const userEmail = (session?.user?.email || "").toLowerCase();
  const userName = ((session?.user as any)?.name || "").toLowerCase();

  // Access check: super_admin, zeynmedia, Tural Zeynalov, Yusif Verdiyev
  const isAuthorized = useMemo(() => {
    return (
      userRole === "super_admin" ||
      userRole === "admin" ||
      userEmail.includes("zeyn") ||
      userEmail.includes("turalzeynalov") ||
      userEmail.includes("yusifverdiyev") ||
      userName.includes("tural") ||
      userName.includes("zeynalov") ||
      userName.includes("yusif") ||
      userName.includes("zeyn")
    );
  }, [userRole, userEmail, userName]);

  const [schedules, setSchedules] = useState<TaskSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TaskSchedule | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "Shooting" as TaskSchedule["type"],
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "16:00",
    location: "Əsas Studiya (Otaq 3)",
    participants: "Tural Zeynalov, Zeynmedia, Tamerlan",
    description: "",
    status: "PLANNED" as TaskSchedule["status"]
  });

  useEffect(() => {
    if (isAuthorized) {
      fetchSchedules();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks-schedule");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      } else {
        toast.error("Qrafik məlumatlarını yükləmək mümkün olmadı");
      }
    } catch (e) {
      toast.error("Şəbəkə xətası baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error("Başlıq və tarix daxil edilməlidir");
      return;
    }

    try {
      if (editItem) {
        // Optimistic update
        const updatedItem = { ...editItem, ...formData };
        setSchedules(prev => prev.map(s => s.id === editItem.id ? updatedItem : s));
        setShowModal(false);
        toast.success("Qrafik yeniləndi");

        const res = await fetch("/api/tasks-schedule", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem.id, ...formData })
        });
        if (!res.ok) fetchSchedules();
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
        toast.success("Yeni qrafik əlavə olundu");

        const res = await fetch("/api/tasks-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          fetchSchedules();
        } else {
          fetchSchedules();
        }
      }
    } catch {
      toast.error("Əməliyyat uğursuz oldu");
      fetchSchedules();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" qrafikini silmək istədiyinizə əminsiniz?`)) return;

    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success("Qrafik silindi");

    try {
      await fetch(`/api/tasks-schedule?id=${id}`, { method: "DELETE" });
    } catch {
      fetchSchedules();
    }
  };

  const handleStatusChange = async (id: string, status: TaskSchedule["status"]) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success("Status yeniləndi");

    try {
      await fetch("/api/tasks-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
    } catch {
      fetchSchedules();
    }
  };

  const openCreateModal = () => {
    setEditItem(null);
    setFormData({
      title: "",
      type: "Shooting",
      date: new Date().toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "16:00",
      location: "Əsas Studiya (Otaq 3)",
      participants: "Tural Zeynalov, Zeynmedia, Tamerlan",
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

  // Add participant quick tag
  const addParticipantTag = (name: string) => {
    const current = formData.participants ? formData.participants.split(",").map(p => p.trim()) : [];
    if (!current.includes(name)) {
      current.push(name);
      setFormData({ ...formData, participants: current.join(", ") });
    }
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchType = typeFilter === "all" || s.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        s.title.toLowerCase().includes(q) || 
        (s.participants || "").toLowerCase().includes(q) || 
        (s.location || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }, [schedules, typeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const shootings = schedules.filter(s => s.type === "Shooting").length;
    const meetings = schedules.filter(s => s.type === "Meeting" || s.type === "Conference").length;
    const completed = schedules.filter(s => s.status === "COMPLETED").length;
    return { shootings, meetings, completed, total: schedules.length };
  }, [schedules]);

  if (!isAuthorized) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#ef4444" }}>
        <ShieldAlert size={56} />
        <h2 style={{ color: "#fff", margin: 0 }}>Giriş Məhdudlaşdırılıb</h2>
        <p style={{ color: "#94a3b8", maxWidth: "420px", textAlign: "center" }}>
          Tasks schedule bölməsi yalnız Super Admin, Zeynmedia, Tural Zeynalov və Yusif Verdiyev hesabları üçün aktivdir.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <CalendarCheck size={28} style={{ color: "#00c4b5" }} />
            Tasks schedule
          </h1>
          <p className={styles.subtitle}>
            Çəkilişlər, işgüzar görüşlər, iclaslar və komanda tapşırıqlarının vahid idarəetmə qrafiki
          </p>
        </div>

        <button className={styles.btnPrimary} onClick={openCreateModal}>
          <Plus size={16} />
          <span>Yeni Çəkiliş / Görüş</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6" }}>
            <Video size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Çəkilişlər</span>
            <span className={styles.statValue}>{stats.shootings}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Users size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Görüşlər & İclaslar</span>
            <span className={styles.statValue}>{stats.meetings}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Tamamlanmış</span>
            <span className={styles.statValue}>{stats.completed}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(0, 196, 181, 0.15)", color: "#00c4b5" }}>
            <Calendar size={22} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statLabel}>Ümumi Hadisələr</span>
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
            Bütün Qrafik ({schedules.length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Shooting" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Shooting")}
          >
            🎬 Çəkilişlər ({schedules.filter(s => s.type === "Shooting").length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Meeting" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Meeting")}
          >
            🤝 Görüşlər ({schedules.filter(s => s.type === "Meeting").length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Conference" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Conference")}
          >
            👥 İclaslar ({schedules.filter(s => s.type === "Conference").length})
          </button>
          <button 
            className={`${styles.filterPill} ${typeFilter === "Task" ? styles.filterPillActive : ""}`}
            onClick={() => setTypeFilter("Task")}
          >
            📋 Tapşırıqlar ({schedules.filter(s => s.type === "Task").length})
          </button>
        </div>

        <div className={styles.searchGroup}>
          <input 
            type="text"
            placeholder="Axtar (çəkiliş, şəxs, məkan)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Schedules Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>Qrafik yüklənir...</div>
      ) : filteredSchedules.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
          <div>Bu süzgəc üzrə heç bir çəkiliş və ya görüş tapılmadı.</div>
        </div>
      ) : (
        <div className={styles.scheduleGrid}>
          {filteredSchedules.map(item => {
            const typeStyle = 
              item.type === "Shooting" ? styles.typeShooting :
              item.type === "Meeting" ? styles.typeMeeting :
              item.type === "Conference" ? styles.typeConference : styles.typeTask;

            const typeLabel = 
              item.type === "Shooting" ? "🎬 Çəkiliş" :
              item.type === "Meeting" ? "🤝 Görüş" :
              item.type === "Conference" ? "👥 İclas" : "📋 Tapşırıq";

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
                        <span>İştirakçılar:</span>
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
                    <option value="PLANNED">Planlaşdırılıb</option>
                    <option value="IN_PROGRESS">Davam edir</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="CANCELLED">Təxirə salındı</option>
                  </select>

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

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <motion.div 
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h3>{editItem ? "Qrafiki Redaktə Et" : "Yeni Çəkiliş / Görüş Əlavə Et"}</h3>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Başlıq / Mövzu *</label>
                    <input 
                      type="text"
                      placeholder="Məsələn: YouTube Podkast Çəkilişi"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Hadisə Növü</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      >
                        <option value="Shooting">🎬 Çəkiliş (Shooting)</option>
                        <option value="Meeting">🤝 Görüş (Meeting)</option>
                        <option value="Conference">👥 İclas (Conference)</option>
                        <option value="Task">📋 Tapşırıq (Task)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tarix *</label>
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
                      <label>Başlama Saatı</label>
                      <input 
                        type="time"
                        value={formData.startTime}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Bitmə Saatı</label>
                      <input 
                        type="time"
                        value={formData.endTime}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Məkan / Studiya</label>
                    <input 
                      type="text"
                      placeholder="Məsələn: Əsas Studiya (Otaq 3), Nizami Filialı"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>İştirakçılar</label>
                    <input 
                      type="text"
                      placeholder="Vergüllə ayırın: Tural, Zeynmedia, Yusif..."
                      value={formData.participants}
                      onChange={e => setFormData({ ...formData, participants: e.target.value })}
                    />
                    <div className={styles.quickPills}>
                      <span className={styles.quickPill} onClick={() => addParticipantTag("Tural Zeynalov")}>+ Tural Zeynalov</span>
                      <span className={styles.quickPill} onClick={() => addParticipantTag("Yusif Verdiyev")}>+ Yusif Verdiyev</span>
                      <span className={styles.quickPill} onClick={() => addParticipantTag("Zeynmedia")}>+ Zeynmedia</span>
                      <span className={styles.quickPill} onClick={() => addParticipantTag("Tamerlan")}>+ Tamerlan</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Təfərrüat / Qeydlər</label>
                    <textarea 
                      rows={3}
                      placeholder="Çəkiliş və ya görüşlə bağlı vacib detallar..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                    İmtina
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editItem ? "Yadda Saxla" : "Qrafikə Əlavə Et"}
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
