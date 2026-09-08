
"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { Plus, ChevronDown, Calendar, Clock, User, UserCheck, Search, BookOpen, X, Trash2, Users, Phone, MapPin, Globe, Layers, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import MultiSelectFilter, { MultiSelectOption } from "./MultiSelectFilter";

interface ScheduleItem {
  id: string;
  groupId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

interface EnrolledStudent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  studyMode?: 'offline' | 'online' | 'hybrid';
}

interface GroupWithSchedule {
  id: string;
  name: string;
  room?: string;
  teacher?: string;
  teacherPhone?: string;
  language?: string;
  maxCapacity?: number;
  _count?: { students: number };
  students?: EnrolledStudent[];
  formatStats?: {
    offline: number;
    online: number;
    hybrid: number;
    primaryFormat: 'offline' | 'online' | 'hybrid';
  };
  program?: { name: string };
  schedules: ScheduleItem[];
}

export default function SchedulePage() {
  const tToast = useTranslations("Toasts");
  const t = useTranslations("Schedule");
  const c = useTranslations("Common");
  
  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const canEdit = ["super_admin", "staff", "admin", "sales", "teacher"].includes(userRole);
  
  const [groups, setGroups] = useState<GroupWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Multi-Select Filters
  const [view, setView] = useState("week");
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 7 : today;
  });
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  // Options memoized from loaded groups data with accurate schedule count badges
  const programOptions: MultiSelectOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    groups.forEach(g => {
      const p = g.program?.name;
      if (p) {
        counts[p] = (counts[p] || 0) + (g.schedules?.length || 0);
      }
    });
    return Object.keys(counts).sort().map(p => ({
      value: p,
      label: p,
      count: counts[p]
    }));
  }, [groups]);

  const teacherOptions: MultiSelectOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    groups.forEach(g => {
      const t = g.teacher?.trim();
      if (t) {
        counts[t] = (counts[t] || 0) + (g.schedules?.length || 0);
      }
    });
    return Object.keys(counts).sort().map(t => ({
      value: t,
      label: t,
      count: counts[t]
    }));
  }, [groups]);

  const roomOptions: MultiSelectOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    groups.forEach(g => {
      (g.schedules || []).forEach(s => {
        const r = (s.room || g.room)?.trim();
        if (r) {
          counts[r] = (counts[r] || 0) + 1;
        }
      });
    });
    return Object.keys(counts).sort().map(r => ({
      value: r,
      label: r.toLowerCase().startsWith('room') || r.toLowerCase().startsWith('otaq') ? r : `Otaq ${r}`,
      count: counts[r]
    }));
  }, [groups]);

  const formatOptions: MultiSelectOption[] = useMemo(() => {
    let offlineCount = 0;
    let onlineCount = 0;
    let hybridCount = 0;
    groups.forEach(g => {
      const f = g.formatStats?.primaryFormat || 'offline';
      const schedLen = g.schedules?.length || 0;
      if (f === 'online') onlineCount += schedLen;
      else if (f === 'hybrid') hybridCount += schedLen;
      else offlineCount += schedLen;
    });
    return [
      { value: 'offline', label: '📍 Əyani (Offline)', count: offlineCount },
      { value: 'online', label: '🌐 Online', count: onlineCount },
      { value: 'hybrid', label: '🔄 Hibrid', count: hybridCount },
    ];
  }, [groups]);

  const totalActiveFilters = selectedPrograms.length + selectedTeachers.length + selectedRooms.length + selectedFormats.length;

  const clearAllFilters = () => {
    setSelectedPrograms([]);
    setSelectedTeachers([]);
    setSelectedRooms([]);
    setSelectedFormats([]);
  };

  const totalMatchingClasses = useMemo(() => {
    return groups.flatMap(g => {
      if (selectedPrograms.length > 0 && (!g.program?.name || !selectedPrograms.includes(g.program.name))) return [];
      if (selectedFormats.length > 0) {
        const fmt = g.formatStats?.primaryFormat || 'offline';
        if (!selectedFormats.includes(fmt)) return [];
      }
      return (g.schedules || []).filter(s => {
        if (selectedTeachers.length > 0) {
          const t = g.teacher?.trim().toLowerCase();
          if (!t || !selectedTeachers.some(st => st.trim().toLowerCase() === t)) return false;
        }
        if (selectedRooms.length > 0) {
          const r = (s.room || g.room || '').trim().toLowerCase();
          if (!r || !selectedRooms.some(sr => sr.trim().toLowerCase() === r)) return false;
        }
        return true;
      });
    }).length;
  }, [groups, selectedPrograms, selectedTeachers, selectedRooms, selectedFormats]);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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

  // Supabase Realtime Live Synchronization: update instantly when student is added to group or schedule changes
  useEffect(() => {
    const channel = supabase
      .channel("schedule-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_students" }, () => {
        fetchSchedules();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, () => {
        fetchSchedules();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_schedules" }, () => {
        fetchSchedules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`/api/schedules?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      } else {
        toast.error(t("errorLoad"));
      }
    } catch (error) {
      toast.error(t("errorUnexpected"));
    } finally {
      setLoading(false);
    }
  };

  const openAddScheduleModal = () => {
    setIsEditing(false);
    setEditId(null);
    const targetGroupId = groups[0]?.id || "";
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

  
  const handleDeleteSchedule = async () => {
    if (!selectedClass?.schedule?.id) return;
    if (!confirm("Bu dərsi cədvəldən silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/schedules/${selectedClass.schedule.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(tToast("scheduleDeleted"));
        setSelectedClass(null);
        fetchSchedules();
      } else {
        toast.error(tToast("scheduleDeleteError"));
      }
    } catch {
      toast.error(tToast("genericError"));
    }
  };

  useEffect(() => {
    // Dynamic auto-update ticker every 60 seconds
    const interval = setInterval(() => {
      fetchSchedules();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const openEditScheduleModal = () => {
    if (!selectedClass) return;
    setIsEditing(true);
    setEditId(selectedClass.schedule.id);
    setFormData({
      groupId: selectedClass.group.id,
      dayOfWeek: selectedClass.schedule.dayOfWeek.toString(),
      startTime: selectedClass.schedule.startTime,
      endTime: selectedClass.schedule.endTime,
      room: selectedClass.schedule.room || ""
    });
    setSelectedClass(null);
    setShowModal(true);
  };


  const handleAddScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupId) {
      toast.error(t("selectGroupError"));
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error(t("timeError"));
      return;
    }

    try {
      const url = isEditing && editId ? `/api/schedules/${editId}` : "/api/schedules";
      const method = isEditing && editId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
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
        const returnedSchedule = await res.json();
        
        const newSchedule = {
          ...returnedSchedule,
          dayOfWeek: returnedSchedule.day_of_week || returnedSchedule.dayOfWeek,
          startTime: returnedSchedule.start_time || returnedSchedule.startTime,
          endTime: returnedSchedule.end_time || returnedSchedule.endTime,
        };

        setGroups(prev =>
          prev.map(g => {
            const filteredSchedules = (g.schedules || []).filter(s => s.id !== editId);
            
            if (g.id === formData.groupId) {
              const updatedSchedules = [...filteredSchedules, newSchedule].sort(
                (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
              );
              return { ...g, schedules: updatedSchedules };
            }
            return { ...g, schedules: filteredSchedules };
          })
        );
        setShowModal(false);
        toast.success(isEditing ? t("successEdit") : t("successAdd"));
      } else {
        toast.error(isEditing ? t("errorEdit") : t("errorAdd"));
      }
    } catch (error) {
      toast.error(t("errorUnexpected"));
    }
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":");
    return parseInt(h, 10) * 60 + parseInt(m || "0", 10);
  };

  const calculateTopAndHeight = (start: string, end: string) => {
    const dayStartMinutes = 8 * 60; // 08:00
    const startM = timeToMinutes(start);
    const endM = timeToMinutes(end);
    
    // Each hour is 60px height. So 1 min = 1px height
    let top = (startM - dayStartMinutes);
    if (top < 0) top = 0;
    
    let height = (endM - startM);
    if (height < 30) height = 30; // Min height

    return { top: `${top}px`, height: `${height}px` };
  };

  const getColorClass = (programName: string) => {
    const p = programName.toLowerCase();
    if (p.includes("math")) return styles.colorGreen;
    if (p.includes("csca")) return styles.colorBlue;
    if (p.includes("business")) return styles.colorPurple;
    if (p.includes("ielts") || p.includes("sat")) return styles.colorCyan;
    return styles.colorYellow;
  };

  const baseDate = new Date(startDate);
  const dayOfWeek = baseDate.getDay();
  // Adjust to start on Monday
  const diffToMonday = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  baseDate.setDate(diffToMonday);

  const days = [
    { num: 1, name: t("monday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 0)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) },
    { num: 2, name: t("tuesday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 1)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) },
    { num: 3, name: t("wednesday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 2)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) },
    { num: 4, name: t("thursday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 3)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) },
    { num: 5, name: t("friday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 4)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) },
    { num: 6, name: t("saturday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 5)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) },
    { num: 7, name: t("sunday"), date: new Date(new Date(baseDate).setDate(baseDate.getDate() + 6)).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) }
  ];

  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  // Filter out classes for the calendar grid
  const renderClassesForDay = (dayNum: number) => {
    const allValidClasses = groups.flatMap(g => {
      if (selectedPrograms.length > 0 && (!g.program?.name || !selectedPrograms.includes(g.program.name))) return [];
      if (selectedFormats.length > 0 && !selectedFormats.includes(g.formatStats?.primaryFormat || 'offline')) return [];

      const daySchedules = (g.schedules || []).filter(s => {
        if (s.dayOfWeek !== dayNum) return false;
        if (selectedTeachers.length > 0) {
          const t = g.teacher?.trim().toLowerCase();
          if (!t || !selectedTeachers.some(st => st.trim().toLowerCase() === t)) return false;
        }
        if (selectedRooms.length > 0) {
          const r = (s.room || g.room || '').trim().toLowerCase();
          if (!r || !selectedRooms.some(sr => sr.trim().toLowerCase() === r)) return false;
        }
        return true;
      });
      return daySchedules.map(s => ({ group: g, schedule: s }));
    });

    allValidClasses.sort((a, b) => timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime));

    const placedClasses: any[] = [];
    allValidClasses.forEach(item => {
      const startM = timeToMinutes(item.schedule.startTime);
      const endM = timeToMinutes(item.schedule.endTime);
      
      const overlaps = placedClasses.filter(p => p.startM < endM && p.endM > startM);
      let column = 0;
      while(overlaps.some(o => o.column === column)) {
         column++;
      }
      
      placedClasses.push({ ...item, startM, endM, column });
    });
    
    const clusters: any[] = [];
    let currentCluster: any[] = [];
    let currentClusterEnd = 0;
    
    placedClasses.forEach(p => {
       if (currentCluster.length === 0) {
          currentCluster.push(p);
          currentClusterEnd = p.endM;
       } else {
          if (p.startM < currentClusterEnd) {
             currentCluster.push(p);
             currentClusterEnd = Math.max(currentClusterEnd, p.endM);
          } else {
             clusters.push(currentCluster);
             currentCluster = [p];
             currentClusterEnd = p.endM;
          }
       }
    });
    if(currentCluster.length > 0) clusters.push(currentCluster);
    
    return clusters.flatMap(cluster => {
       const maxCol = Math.max(...cluster.map(c => c.column)) + 1;
       return cluster.map(item => {
         const { top, height } = calculateTopAndHeight(item.schedule.startTime, item.schedule.endTime);
         const color = getColorClass(item.group.program?.name || "");
         
         const width = `calc(${100 / maxCol}% - 4px)`;
         const left = `calc(${item.column * (100 / maxCol)}% + 2px)`;
         const stCount = item.group._count?.students || 0;
         const format = item.group.formatStats?.primaryFormat || 'offline';
         
         return (
          <div 
            key={item.schedule.id} 
            className={`${styles.scheduleCard} ${color}`}
            style={{ top, height, width, left }}
            onClick={() => setSelectedClass({ group: item.group, schedule: item.schedule })}
          >
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{item.group.name}</h4>
            </div>
            <div className={styles.cardProgram}>{item.group.program?.name || t("noProgram")}</div>
            <div className={styles.cardFooter}>
              <span className={styles.cardTime}>{item.schedule.startTime} - {item.schedule.endTime}</span>
              <span>• {item.group.teacher || t("unassigned")}</span>
            </div>

            <div className={styles.cardMetaRow}>
              <span className={styles.studentsBadge}>
                <Users size={11} /> {stCount} {t("students") || "tələbə"}
              </span>
              {format === 'online' ? (
                <span className={styles.formatBadgeOnline}><Globe size={10} /> Online</span>
              ) : format === 'hybrid' ? (
                <span className={styles.formatBadgeHybrid}><Layers size={10} /> Hibrid</span>
              ) : (
                <span className={styles.formatBadgeOffline}><MapPin size={10} /> Əyani</span>
              )}
            </div>
          </div>
         );
       });
    });
  };

  const renderMobileDayCards = (dayNum: number) => {
    const dayClasses = groups.flatMap(g => 
      g.schedules.filter(s => s.dayOfWeek === dayNum).map(s => ({ group: g, schedule: s }))
    ).filter(({ group, schedule }) => {
      if (selectedPrograms.length > 0 && (!group.program?.name || !selectedPrograms.includes(group.program.name))) return false;
      if (selectedTeachers.length > 0) {
        const t = group.teacher?.trim().toLowerCase();
        if (!t || !selectedTeachers.some(st => st.trim().toLowerCase() === t)) return false;
      }
      if (selectedRooms.length > 0) {
        const r = (schedule.room || group.room || '').trim().toLowerCase();
        if (!r || !selectedRooms.some(sr => sr.trim().toLowerCase() === r)) return false;
      }
      if (selectedFormats.length > 0) {
        const primary = group.formatStats?.primaryFormat || 'offline';
        if (!selectedFormats.includes(primary)) return false;
      }
      return true;
    }).sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

    if (dayClasses.length === 0) {
      return (
        <div className={styles.mobileEmptyState}>
          <Calendar size={28} style={{ opacity: 0.4, marginBottom: '0.4rem', color: '#38bdf8' }} />
          <p>Bu gün üçün təyin edilmiş dərs yoxdur</p>
        </div>
      );
    }

    return (
      <div className={styles.mobileClassesList}>
        {dayClasses.map((item, idx) => {
          const stCount = item.group._count?.students || 0;
          const format = item.group.formatStats?.primaryFormat || 'offline';
          return (
            <div
              key={item.schedule.id || idx}
              className={styles.mobileClassCard}
              onClick={() => setSelectedClass(item)}
            >
              <div className={styles.mobileCardTop}>
                <h4 className={styles.mobileCardTitle}>{item.group.name}</h4>
                <span className={styles.mobileCardTimeBadge}>
                  <Clock size={12} /> {item.schedule.startTime} - {item.schedule.endTime}
                </span>
              </div>
              
              <div className={styles.mobileCardProgram}>
                <BookOpen size={13} /> {item.group.program?.name || t("noProgram")}
              </div>

              <div className={styles.mobileCardMeta}>
                <span className={styles.mobileTeacherBadge}>
                  <User size={12} /> {item.group.teacher || t("unassigned")}
                </span>
                <span className={styles.studentsBadge}>
                  <Users size={11} /> {stCount} tələbə
                </span>
                {format === 'online' ? (
                  <span className={styles.formatBadgeOnline}><Globe size={10} /> Online</span>
                ) : format === 'hybrid' ? (
                  <span className={styles.formatBadgeHybrid}><Layers size={10} /> Hibrid</span>
                ) : (
                  <span className={styles.formatBadgeOffline}><MapPin size={10} /> Əyani</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateSelector} style={{ position: "relative" }}>
            <Calendar size={16} />
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer"
              }}
            />
          </div>
          {canEdit && (
            <button className={styles.addBtn} onClick={openAddScheduleModal}>
              <Plus size={18} /> Add Schedule
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <MultiSelectFilter
            label={t("allPrograms")}
            icon={<BookOpen size={15} />}
            options={programOptions}
            selectedValues={selectedPrograms}
            onChange={setSelectedPrograms}
            placeholder="Proqram axtar..."
          />
          <MultiSelectFilter
            label={t("allTeachers")}
            icon={<User size={15} />}
            options={teacherOptions}
            selectedValues={selectedTeachers}
            onChange={setSelectedTeachers}
            placeholder="Müəllim axtar..."
          />
          <MultiSelectFilter
            label={t("allRooms")}
            icon={<MapPin size={15} />}
            options={roomOptions}
            selectedValues={selectedRooms}
            onChange={setSelectedRooms}
            placeholder="Otaq axtar..."
          />
          <MultiSelectFilter
            label="Bütün Formatlar"
            icon={<Layers size={15} />}
            options={formatOptions}
            selectedValues={selectedFormats}
            onChange={setSelectedFormats}
            placeholder="Format axtar..."
          />
        </div>
        
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === "week" ? styles.active : ""}`} onClick={() => setView("week")}>{t("week")}</button>
          <button className={`${styles.viewBtn} ${view === "day" ? styles.active : ""}`} onClick={() => setView("day")}>{t("day")}</button>
          <button className={`${styles.viewBtn} ${view === "list" ? styles.active : ""}`} onClick={() => setView("list")}>{t("list")}</button>
        </div>
      </div>

      {totalActiveFilters > 0 && (
        <div className={styles.activeFiltersBar}>
          <div className={styles.activeChipsGroup}>
            <span className={styles.matchCountText}>Filtrlər:</span>
            {selectedPrograms.map(p => (
              <span key={p} className={`${styles.activeFilterChip} ${styles.activeFilterChipProgram}`}>
                <BookOpen size={11} /> {p}
                <button type="button" className={styles.chipRemoveBtn} onClick={() => setSelectedPrograms(selectedPrograms.filter(v => v !== p))} title="Sil">
                  <X size={11} />
                </button>
              </span>
            ))}
            {selectedTeachers.map(teach => (
              <span key={teach} className={`${styles.activeFilterChip} ${styles.activeFilterChipTeacher}`}>
                <User size={11} /> {teach}
                <button type="button" className={styles.chipRemoveBtn} onClick={() => setSelectedTeachers(selectedTeachers.filter(v => v !== teach))} title="Sil">
                  <X size={11} />
                </button>
              </span>
            ))}
            {selectedRooms.map(r => (
              <span key={r} className={`${styles.activeFilterChip} ${styles.activeFilterChipRoom}`}>
                <MapPin size={11} /> {r.toLowerCase().startsWith('room') || r.toLowerCase().startsWith('otaq') ? r : `Otaq ${r}`}
                <button type="button" className={styles.chipRemoveBtn} onClick={() => setSelectedRooms(selectedRooms.filter(v => v !== r))} title="Sil">
                  <X size={11} />
                </button>
              </span>
            ))}
            {selectedFormats.map(f => (
              <span key={f} className={`${styles.activeFilterChip} ${styles.activeFilterChipFormat}`}>
                <Layers size={11} /> {f === 'offline' ? 'Əyani' : f === 'online' ? 'Online' : 'Hibrid'}
                <button type="button" className={styles.chipRemoveBtn} onClick={() => setSelectedFormats(selectedFormats.filter(v => v !== f))} title="Sil">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          <div className={styles.activeFilterSummaryRight}>
            <span className={styles.matchCountText}>
              <strong>{totalMatchingClasses}</strong> dərs tapıldı
            </span>
            <button type="button" className={styles.resetAllFiltersBtn} onClick={clearAllFilters}>
              <X size={12} /> Bütün filtrləri sıfırla
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>{t("loading")}</div>
      ) : (
        <>
          {view === "week" && (
            <>
              {/* Mobile Day Selector Bar */}
              <div className={styles.mobileDaySelector}>
                {days.map(d => (
                  <button
                    key={d.num}
                    type="button"
                    className={`${styles.mobileDayBtn} ${selectedMobileDay === d.num ? styles.mobileDayBtnActive : ''}`}
                    onClick={() => setSelectedMobileDay(d.num)}
                  >
                    <span className={styles.mobileDayName}>{d.name.substring(0, 3)}</span>
                    <span className={styles.mobileDayNum}>{d.date.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Selected Day Cards View */}
              <div className={styles.mobileCalendarView}>
                {renderMobileDayCards(selectedMobileDay)}
              </div>

              {/* Desktop 7-Column Grid */}
              <div className={styles.calendarWrapper}>
                <div className={styles.calendarHeader}>
                  <div className={styles.timeSpacer}></div>
                  {days.map(d => (
                    <div key={d.num} className={styles.dayHeader}>
                      <div className={styles.dayName}>{d.name}</div>
                      <div className={styles.dayDate}>{d.date}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.calendarGrid}>
                  <div className={styles.timeColumn}>
                    {hours.map(h => (
                      <div key={h} className={styles.timeLabel}>{h}</div>
                    ))}
                  </div>
                  <div className={styles.daysColumns}>
                    {days.map(d => (
                      <div key={d.num} className={styles.dayColumn}>
                        {renderClassesForDay(d.num)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {view === "day" && (
            <div className={styles.calendarWrapper}>
              <div className={styles.calendarHeader} style={{ gridTemplateColumns: "60px 1fr" }}>
                <div className={styles.timeSpacer}></div>
                <div className={styles.dayHeader}>
                  <div className={styles.dayName}>{days[0].name}</div>
                  <div className={styles.dayDate}>{days[0].date}</div>
                </div>
              </div>
              <div className={styles.calendarGrid} style={{ gridTemplateColumns: "60px 1fr" }}>
                <div className={styles.timeColumn}>
                  {hours.map(h => (
                    <div key={h} className={styles.timeLabel}>{h}</div>
                  ))}
                </div>
                <div className={styles.daysColumns} style={{ gridTemplateColumns: "1fr" }}>
                  <div className={styles.dayColumn}>
                    {renderClassesForDay(1)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "list" && (
            <div className={styles.panel} style={{ marginBottom: "2rem" }}>
              <div className={styles.upcomingList}>
                {groups.flatMap(g => g.schedules.map(s => ({ group: g, schedule: s })))
                  .filter(({ group, schedule }) => {
                    if (selectedPrograms.length > 0 && (!group.program?.name || !selectedPrograms.includes(group.program.name))) return false;
                    if (selectedTeachers.length > 0) {
                      const t = group.teacher?.trim().toLowerCase();
                      if (!t || !selectedTeachers.some(st => st.trim().toLowerCase() === t)) return false;
                    }
                    if (selectedRooms.length > 0) {
                      const r = (schedule.room || group.room || '').trim().toLowerCase();
                      if (!r || !selectedRooms.some(sr => sr.trim().toLowerCase() === r)) return false;
                    }
                    if (selectedFormats.length > 0) {
                      const primary = group.formatStats?.primaryFormat || 'offline';
                      if (!selectedFormats.includes(primary)) return false;
                    }
                    return true;
                  })
                  .sort((a, b) => a.schedule.dayOfWeek - b.schedule.dayOfWeek || a.schedule.startTime.localeCompare(b.schedule.startTime))
                  .map((item, idx) => (
                    <div key={item.schedule.id || idx} className={styles.upcomingRow} onClick={() => setSelectedClass(item)}>
                      <div className={styles.statusDot} style={{ backgroundColor: "rgba(255,255,255,0.2)" }}></div>
                      <div>
                        <div className={styles.rowTitle}>{item.group.name}</div>
                        <div className={styles.rowSubtitle}>{item.group.program?.name || t("noProgram")}</div>
                      </div>
                      <div className={styles.rowText}><Clock size={14} /> {days.find(d => d.num === item.schedule.dayOfWeek)?.name} {item.schedule.startTime}</div>
                      <div className={styles.rowText}><User size={14} /> {item.group.teacher || t("unassigned")}</div>
                      <div className={styles.rowText}>Room {item.schedule.room || item.group.room || "TBA"}</div>
                    </div>
                  ))
                }
                {groups.length === 0 && <div className={styles.emptyState}>{t("noSchedules")}</div>}
              </div>
            </div>
          )}

          <div className={styles.panels}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>{t("upcomingClasses")}</h3>
              <div className={styles.upcomingList}>
                {(() => {
                  // Real-time upcoming: sort by next occurrence relative to now
                  const now = new Date();
                  // JS getDay(): 0=Sun,1=Mon...6=Sat → convert to our 1=Mon...7=Sun
                  const jsDay = now.getDay();
                  const todayNum = jsDay === 0 ? 7 : jsDay;
                  const nowMinutes = now.getHours() * 60 + now.getMinutes();

                  const allItems = groups.flatMap(g =>
                    (g.schedules || []).map(s => ({ group: g, schedule: s }))
                  );

                  // For each item, compute "minutes until next occurrence this week"
                  const withOffset = allItems.map(item => {
                    const s = item.schedule;
                    const [hh, mm] = s.startTime.split(':').map(Number);
                    const startMinutes = hh * 60 + mm;
                    const dayOfWeek = s.dayOfWeek; // 1=Mon...7=Sun

                    let dayDiff = dayOfWeek - todayNum;
                    if (dayDiff < 0) dayDiff += 7;
                    // Same day but class already started/passed → show as next week
                    if (dayDiff === 0 && startMinutes <= nowMinutes) dayDiff = 7;

                    const minutesUntil = dayDiff * 24 * 60 + startMinutes - nowMinutes;
                    return { ...item, minutesUntil, dayOfWeek, startMinutes };
                  });

                  // Sort ascending → nearest class first
                  withOffset.sort((a, b) => a.minutesUntil - b.minutesUntil);

                  return withOffset.slice(0, 5).map((item, idx) => {
                    const isSoon = idx === 0;
                    const dayName = days.find(d => d.num === item.dayOfWeek)?.name || '';
                    const s = item.schedule;
                    const group = item.group;

                    return (
                      <div key={s.id || idx} className={styles.upcomingRow} onClick={() => setSelectedClass({ group, schedule: s })}>
                        <div className={styles.statusDot} style={{ backgroundColor: isSoon ? "var(--aqua-teal, #00C4B5)" : "rgba(255,255,255,0.2)" }}></div>
                        <div>
                          <div className={styles.rowTitle}>{group.name}</div>
                          <div className={styles.rowSubtitle}>{group.program?.name || t("noProgram")}</div>
                        </div>
                        <div className={styles.rowText}><Clock size={14} /> {dayName} {s.startTime}</div>
                        <div className={styles.rowText}><User size={14} /> {group.teacher || t("unassigned")}</div>
                        <div className={styles.rowText}>Room {s.room || group.room || "TBA"}</div>
                        <div className={styles.badge}>{isSoon ? "Next" : "Scheduled"}</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>{t("classDetails")}</h3>
              {selectedClass ? (
                <div>
                  <div className={styles.detailsHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 className={styles.detailsTitle}>{selectedClass.group.name}</h3>
                      <p className={styles.detailsSubtitle}>
                        {selectedClass.group.program?.name || t("noProgram")} • {selectedClass.group.teacher || t("unassigned")}
                      </p>
                    </div>
                    {canEdit && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button onClick={openEditScheduleModal} style={{ background: "var(--aqua-teal, #00C4B5)", color: "#fff", border: "none", padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}>
                          {t("edit")}
                        </button>
                        <button onClick={handleDeleteSchedule} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                          <Trash2 size={14} /> Sil
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.detailsGrid}>
                    <div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>{t("frequency")}</div>
                        <div className={styles.infoValue}>{selectedClass.group.schedules?.length || 0} lessons / week</div>
                      </div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>{t("duration")}</div>
                        <div className={styles.infoValue}>{selectedClass.schedule.startTime} - {selectedClass.schedule.endTime}</div>
                      </div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>{t("students")}</div>
                        <div className={styles.infoValue}>
                          {selectedClass.group._count?.students || 0} / {selectedClass.group.maxCapacity || 12} Tələbə
                          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                            <span className={styles.formatBadgeOffline}><MapPin size={10} /> {selectedClass.group.formatStats?.offline || 0} Əyani</span>
                            <span className={styles.formatBadgeOnline}><Globe size={10} /> {selectedClass.group.formatStats?.online || 0} Online</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>{t("room")}</div>
                        <div className={styles.infoValue}>{selectedClass.schedule.room || selectedClass.group.room || "TBA"}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={styles.weeklyScheduleTitle}>{t("weeklySchedule")}</h4>
                      <div className={styles.weeklyList}>
                        {days.map(d => {
                          const hasClass = selectedClass.group.schedules?.find((s: any) => s.dayOfWeek === d.num);
                          return (
                            <div key={d.num} className={styles.weeklyItem}>
                              <div className={styles.weeklyDay}>
                                <div className={`${styles.weeklyIndicator} ${hasClass ? styles.active : ""}`}></div>
                                {d.name}
                              </div>
                              <div className={styles.weeklyTime}>
                                {hasClass ? `${hasClass.startTime} - ${hasClass.endTime}` : "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Enrolled Students Live Roster */}
                  <div className={styles.rosterCard}>
                    <div className={styles.rosterHeader}>
                      <h4 className={styles.rosterTitle}>
                        <Users size={16} color="#00C4B5" />
                        <span>Qrupdakı Tələbələr ({selectedClass.group.students?.length || 0})</span>
                      </h4>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        Maks. Tutum: {selectedClass.group.maxCapacity || 12}
                      </span>
                    </div>

                    {selectedClass.group.students && selectedClass.group.students.length > 0 ? (
                      <div className={styles.rosterList}>
                        {selectedClass.group.students.map((st: EnrolledStudent) => (
                          <div key={st.id} className={styles.rosterItem}>
                            <div className={styles.studentInfo}>
                              <div className={styles.studentAvatar}>
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className={styles.studentName}>{st.name}</span>
                                {st.phone && st.phone !== "—" && (
                                  <a href={`tel:${st.phone}`} className={styles.studentPhone} title="Zəng et">
                                    <Phone size={10} /> {st.phone}
                                  </a>
                                )}
                              </div>
                            </div>

                            <div>
                              {st.studyMode === "online" ? (
                                <span className={styles.formatBadgeOnline}><Globe size={11} /> Online</span>
                              ) : st.studyMode === "hybrid" ? (
                                <span className={styles.formatBadgeHybrid}><Layers size={11} /> Hibrid</span>
                              ) : (
                                <span className={styles.formatBadgeOffline}><MapPin size={11} /> Əyani</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "1rem", color: "#64748b", fontSize: "0.8rem" }}>
                        Bu qrupda hələlik tələbə qeydiyyatı yoxdur.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  Select a class from the calendar or upcoming list to view details.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{t("addScheduleBtn")}</h2>
                <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddScheduleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>{t("groupLabel")}</label>
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
                    <option value="">{t("selectGroup")}</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.program?.name || t("noProgram")})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("dayOfWeekLabel")}</label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  >
                    <option value="1">1 - {t("monday")}</option>
                    <option value="2">2 - {t("tuesday")}</option>
                    <option value="3">3 - {t("wednesday")}</option>
                    <option value="4">4 - {t("thursday")}</option>
                    <option value="5">5 - {t("friday")}</option>
                    <option value="6">6 - {t("saturday")}</option>
                    <option value="7">7 - {t("sunday")}</option>
                  </select>
                </div>

                <div className={styles.rowInputs}>
                  <div className={styles.inputGroup}>
                    <label>{t("startTimeLabel")}</label>
                    <input
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>{t("endTimeLabel")}</label>
                    <input
                      required
                      type="time"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("room")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 204"
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Save Schedule
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
