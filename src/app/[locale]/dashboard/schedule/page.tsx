"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Clock, Users, BookOpen, X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

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
        <button className={styles.addBtn} onClick={() => openAddScheduleModal()}>
          <Plus size={18} /> Cədvəl Əlavə Et
        </button>
      </div>

      <div className={styles.scheduleGrid}>
        {loading ? (
          <div className={styles.loading}>{c("loading")}</div>
        ) : groups.length === 0 ? (
          <div className={styles.empty}>{c("empty")}</div>
        ) : (
          groups.map(group => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.groupCard}
            >
              <div className={styles.cardHeader}>
                <h3>{group.name}</h3>
                <span className={styles.badge}>{group.language || "AZ"}</span>
              </div>

              <div className={styles.cardInfo}>
                <div className={styles.infoItem}>
                  <BookOpen size={16} className={styles.icon} />
                  <span>{group.program?.name || "Proqram seçilməyib"}</span>
                </div>
                <div className={styles.infoItem}>
                  <Users size={16} className={styles.icon} />
                  <span>
                    {group._count?.students || 0} / {group.maxCapacity || 15} Tələbə
                  </span>
                </div>
              </div>

              <div className={styles.schedulesList}>
                {group.schedules && group.schedules.length > 0 ? (
                  group.schedules.map(sch => {
                    const dayNum = sch.dayOfWeek || sch.day_of_week || 1;
                    const startTime = sch.startTime || sch.start_time || "";
                    const endTime = sch.endTime || sch.end_time || "";
                    const room = sch.room || group.room;

                    return (
                      <div key={sch.id} className={styles.scheduleItem}>
                        <div>
                          <div className={styles.scheduleDay}>{getDayName(dayNum)}</div>
                          <div className={styles.scheduleTime}>
                            <Clock size={14} /> {startTime} - {endTime}
                          </div>
                        </div>

                        <div className={styles.scheduleDetails}>
                          {room && <div className={styles.room}>Otaq: {room}</div>}
                          <button
                            className={styles.deleteScheduleBtn}
                            title="Cədvəli Sil"
                            onClick={() => handleDeleteSchedule(sch.id, group.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noSchedule}>{t("noSchedule")}</div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Schedule Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Qrupa Dərs Cədvəli Əlavə Et</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddScheduleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Qrup Seçin *</label>
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
                  <option value="">Qrup seçin...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.program?.name || "Proqram yoxdur"})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Həftənin Günü *</label>
                <select
                  required
                  value={formData.dayOfWeek}
                  onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                >
                  <option value="1">1 - Bazar ertəsi (Monday)</option>
                  <option value="2">2 - Çərşənbə axşamı (Tuesday)</option>
                  <option value="3">3 - Çərşənbə (Wednesday)</option>
                  <option value="4">4 - Cümə axşamı (Thursday)</option>
                  <option value="5">5 - Cümə (Friday)</option>
                  <option value="6">6 - Şənbə (Saturday)</option>
                  <option value="7">7 - Bazar (Sunday)</option>
                </select>
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>Başlama Saatı *</label>
                  <input
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Bitmə Saatı *</label>
                  <input
                    required
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Otaq</label>
                <input
                  type="text"
                  placeholder="Məs: Otaq 204 və ya Lab A"
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
                  Ləğv et
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Cədvəli Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
