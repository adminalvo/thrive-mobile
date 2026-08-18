"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Clock, Users, BookOpen, X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

interface ScheduleItem {
  id: string;
  groupId?: string;
  group_id?: string;
  dayOfWeek: number;
  day_of_week?: number;
  startTime: string;
  start_time?: string;
  endTime: string;
  end_time?: string;
  room?: string | null;
}

interface GroupWithSchedule {
  id: string;
  name: string;
  room?: string;
  language?: string;
  maxCapacity?: number;
  _count?: { students: number };
  program?: { name: string };
  schedules: ScheduleItem[];
}

export default function SchedulePage() {
  const t = useTranslations("Schedule");
  const c = useTranslations("Common");
  
  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const canEdit = ["super_admin", "staff", "admin", "sales", "teacher"].includes(userRole);
  
  const [groups, setGroups] = useState<GroupWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    groupId: "",
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "10:30",
    room: ""
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      } else {
        toast.error("Cədvəlləri yükləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (day: number) => {
    const days = [
      t("days.mon"),
      t("days.tue"),
      t("days.wed"),
      t("days.thu"),
      t("days.fri"),
      t("days.sat"),
      t("days.sun")
    ];
    return days[day - 1] || "Bilinmir";
  };

  const openAddScheduleModal = (defaultGroupId?: string) => {
    const targetGroupId = defaultGroupId || (groups[0]?.id || "");
    const targetGroup = groups.find(g => g.id === targetGroupId);
    setFormData({
      groupId: targetGroupId,
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "10:30",
      room: targetGroup?.room || ""
    });
    setShowModal(true);
  };

  const handleAddScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupId) {
      toast.error("Zəhmət olmasa qrup seçin");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Zəhmət olmasa başlama və bitmə vaxtını daxil edin");
      return;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: formData.groupId,
          day_of_week: parseInt(formData.dayOfWeek, 10),
          start_time: formData.startTime,
          end_time: formData.endTime,
          room: formData.room ? formData.room.trim() : null
        })
      });

      if (res.ok) {
        const newSchedule = await res.json();
        setGroups(prev =>
          prev.map(g => {
            if (g.id === formData.groupId) {
              const updatedSchedules = [...(g.schedules || []), newSchedule].sort(
                (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
              );
              return { ...g, schedules: updatedSchedules };
            }
            return g;
          })
        );
        setShowModal(false);
        toast.success("Cədvəl uğurla əlavə edildi");
      } else {
        toast.error("Cədvəl əlavə etmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string, groupId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setGroups(prev =>
          prev.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                schedules: (g.schedules || []).filter(s => s.id !== scheduleId)
              };
            }
            return g;
          })
        );
        toast.success("Cədvəl qeydi silindi");
      } else {
        toast.error("Cədvəli silmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        {canEdit && (
          <button className={styles.addBtn} onClick={() => openAddScheduleModal()}>
            <Plus size={18} /> Cədvəl Əlavə Et
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>{c("loading")}</div>
        ) : groups.length === 0 ? (
          <div className={styles.empty}>{c("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Qrup & Proqram</th>
                <th>Həftənin Günü</th>
                <th>Saat</th>
                <th>Otaq</th>
                {canEdit && <th style={{ textAlign: "right" }}>Əməliyyat</th>}
              </tr>
            </thead>
            <tbody>
              {groups.flatMap(group => 
                (group.schedules && group.schedules.length > 0) ? group.schedules.map((sch: any) => {
                  const dayNum = sch.dayOfWeek || sch.day_of_week || 1;
                  const startTime = sch.startTime || sch.start_time || "";
                  const endTime = sch.endTime || sch.end_time || "";
                  const room = sch.room || group.room || "-";
                  
                  return (
                    <motion.tr
                      key={sch.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.tableRow}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ background: "rgba(76, 162, 181, 0.1)", padding: "0.4rem", borderRadius: "8px", color: "var(--aqua-teal)" }}>
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{group.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{group.program?.name || "Proqram seçilməyib"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "rgba(var(--glass-color), 0.05)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                          {getDayName(dayNum)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          <Clock size={14} /> {startTime} - {endTime}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{room}</span>
                      </td>
                      {canEdit && (
                        <td style={{ textAlign: "right" }}>
                          <button
                            className={styles.deleteScheduleBtn}
                            title="Cədvəli Sil"
                            onClick={() => handleDeleteSchedule(sch.id, group.id)}
                            style={{ display: "inline-flex", background: "transparent", border: "none", color: "var(--danger-color)", padding: "0.4rem", cursor: "pointer", borderRadius: "6px" }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  );
                }) : []
              )}
              
              {groups.flatMap(g => g.schedules || []).length === 0 && (
                 <tr>
                   <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                     {t("noSchedule")}
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Schedule Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("modal.addTitle") || "Qrupa Dərs Cədvəli Əlavə Et"}</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddScheduleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{t("modal.selectGroup") || "Qrup Seçin"} *</label>
                <select
                  required
                  value={formData.groupId}
                  onChange={e => {
                    const gId = e.target.value;
                    const found = groups.find(g => g.id === gId);
                    setFormData({
                      ...formData,
                      groupId: gId,
                      room: found?.room || formData.room
                    });
                  }}
                >
                  <option value="">{t("modal.selectGroupPlaceholder") || "Qrup seçin..."}</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.program?.name || "Proqram yoxdur"})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("modal.dayOfWeek") || "Həftənin Günü"} *</label>
                <select
                  required
                  value={formData.dayOfWeek}
                  onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                >
                  <option value="1">1 - {t("days.monday") || "Bazar ertəsi"}</option>
                  <option value="2">2 - {t("days.tuesday") || "Çərşənbə axşamı"}</option>
                  <option value="3">3 - {t("days.wednesday") || "Çərşənbə"}</option>
                  <option value="4">4 - {t("days.thursday") || "Cümə axşamı"}</option>
                  <option value="5">5 - {t("days.friday") || "Cümə"}</option>
                  <option value="6">6 - {t("days.saturday") || "Şənbə"}</option>
                  <option value="7">7 - {t("days.sunday") || "Bazar"}</option>
                </select>
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>{t("modal.startTime") || "Başlama Saatı"} *</label>
                  <input
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("modal.endTime") || "Bitmə Saatı"} *</label>
                  <input
                    required
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("modal.room") || "Otaq"}</label>
                <input
                  type="text"
                  placeholder={t("modal.roomPlaceholder") || "Məs: Otaq 204 və ya Lab A"}
                  value={formData.room}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  {t("modal.cancel") || "Ləğv et"}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {t("modal.save") || "Cədvəli Yadda Saxla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
