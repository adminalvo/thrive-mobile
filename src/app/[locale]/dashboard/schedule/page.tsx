
"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, ChevronDown, Calendar, Clock, User, UserCheck, Search, BookOpen, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

interface ScheduleItem {
  id: string;
  groupId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

interface GroupWithSchedule {
  id: string;
  name: string;
  room?: string;
  teacher?: string;
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

  // Filters
  const [view, setView] = useState("week");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [currentDateOffset, setCurrentDateOffset] = useState(0);

  const [selectedClass, setSelectedClass] = useState<any>(null);

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

  const openAddScheduleModal = () => {
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

  const days = [
    { num: 1, name: "Monday", date: "24 Aug" },
    { num: 2, name: "Tuesday", date: "25 Aug" },
    { num: 3, name: "Wednesday", date: "26 Aug" },
    { num: 4, name: "Thursday", date: "27 Aug" },
    { num: 5, name: "Friday", date: "28 Aug" }
  ];

  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Filter out classes for the calendar grid
  const renderClassesForDay = (dayNum: number) => {
    const allValidClasses = groups.flatMap(g => {
      if (selectedProgram !== "all" && g.program?.name !== selectedProgram) return [];
      const daySchedules = (g.schedules || []).filter(s => {
        if (s.dayOfWeek !== dayNum) return false;
        if (selectedTeacher !== "all" && (g.teacher !== selectedTeacher)) return false;
        if (selectedRoom !== "all" && (s.room || g.room) !== selectedRoom) return false;
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
            <div className={styles.cardProgram}>{item.group.program?.name || "No Program"}</div>
            <div className={styles.cardFooter}>
              <span className={styles.cardTime}>{item.schedule.startTime} - {item.schedule.endTime}</span>
              <span>• {item.group.teacher || "Təyin edilməyib"}</span>
            </div>
          </div>
         );
       });
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.subtitle}>View and manage all classes and sessions</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateSelector} style={{ userSelect: "none" }} onClick={() => setCurrentDateOffset(p => p === 0 ? 1 : 0)}>
            <Calendar size={16} />
            {new Date(new Date().setDate(new Date().getDate() + currentDateOffset * 7)).toLocaleDateString("en-GB", {day: "numeric", month: "short"})} - {new Date(new Date().setDate(new Date().getDate() + currentDateOffset * 7 + 4)).toLocaleDateString("en-GB", {day: "numeric", month: "short"})}, 2026
            <ChevronDown size={14} />
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
          <div className={styles.filterSelectWrapper}>
            <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
              <option value="all">All Programs</option>
              {Array.from(new Set(groups.map(g => g.program?.name).filter(Boolean))).map(p => (
                <option key={p as string} value={p as string}>{p as string}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className={styles.filterSelectWrapper}>
            <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}>
              <option value="all">All Teachers</option>
              {Array.from(new Set(groups.map(g => g.teacher).filter(Boolean))).map(t => (
                <option key={t as string} value={t as string}>{t as string}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className={styles.filterSelectWrapper}>
            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
              <option value="all">All Rooms</option>
              {Array.from(new Set(groups.flatMap(g => [g.room, ...g.schedules.map(s => s.room)]).filter(Boolean))).map(r => (
                <option key={r as string} value={r as string}>Room {r as string}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
        
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === "week" ? styles.active : ""}`} onClick={() => setView("week")}>Week</button>
          <button className={`${styles.viewBtn} ${view === "day" ? styles.active : ""}`} onClick={() => setView("day")}>Day</button>
          <button className={`${styles.viewBtn} ${view === "list" ? styles.active : ""}`} onClick={() => setView("list")}>List</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Yüklənir...</div>
      ) : (
        <>
          {view === "week" && (
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
                    if (selectedProgram !== "all" && group.program?.name !== selectedProgram) return false;
                    if (selectedTeacher !== "all" && group.teacher !== selectedTeacher) return false;
                    if (selectedRoom !== "all" && (schedule.room || group.room) !== selectedRoom) return false;
                    return true;
                  })
                  .sort((a, b) => a.schedule.dayOfWeek - b.schedule.dayOfWeek || a.schedule.startTime.localeCompare(b.schedule.startTime))
                  .map((item, idx) => (
                    <div key={item.schedule.id || idx} className={styles.upcomingRow} onClick={() => setSelectedClass(item)}>
                      <div className={styles.statusDot} style={{ backgroundColor: "rgba(255,255,255,0.2)" }}></div>
                      <div>
                        <div className={styles.rowTitle}>{item.group.name}</div>
                        <div className={styles.rowSubtitle}>{item.group.program?.name || "Program"}</div>
                      </div>
                      <div className={styles.rowText}><Clock size={14} /> {days.find(d => d.num === item.schedule.dayOfWeek)?.name} {item.schedule.startTime}</div>
                      <div className={styles.rowText}><User size={14} /> {item.group.teacher || "Təyin edilməyib"}</div>
                      <div className={styles.rowText}>Room {item.schedule.room || item.group.room || "TBA"}</div>
                    </div>
                  ))
                }
                {groups.length === 0 && <div className={styles.emptyState}>No schedules found</div>}
              </div>
            </div>
          )}

          <div className={styles.panels}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Upcoming Classes</h3>
              <div className={styles.upcomingList}>
                {groups.flatMap(g => g.schedules).slice(0, 5).map((s, idx) => {
                  if(!s) return null;
                  const group = groups.find(g => g.id === s.groupId);
                  if(!group) return null;
                  const isSoon = idx === 0;
                  
                  return (
                    <div key={s.id || idx} className={styles.upcomingRow} onClick={() => setSelectedClass({ group, schedule: s })}>
                      <div className={styles.statusDot} style={{ backgroundColor: isSoon ? "var(--aqua-teal, #00C4B5)" : "rgba(255,255,255,0.2)" }}></div>
                      <div>
                        <div className={styles.rowTitle}>{group.name}</div>
                        <div className={styles.rowSubtitle}>{group.program?.name || "Program"}</div>
                      </div>
                      <div className={styles.rowText}><Clock size={14} /> {s.startTime}</div>
                      <div className={styles.rowText}><User size={14} /> {group.teacher || "Təyin edilməyib"}</div>
                      <div className={styles.rowText}>Room {s.room || group.room || "TBA"}</div>
                      <div className={styles.badge}>{isSoon ? "Next" : "Scheduled"}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Class Details</h3>
              {selectedClass ? (
                <div>
                  <div className={styles.detailsHeader}>
                    <h2 className={styles.detailsTitle}>{selectedClass.group.name}</h2>
                    <p className={styles.detailsSubtitle}>{selectedClass.group.program?.name} • {selectedClass.group.teacher || "Təyin edilməyib"}</p>
                  </div>
                  
                  <div className={styles.detailsGrid}>
                    <div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>Frequency</div>
                        <div className={styles.infoValue}>{selectedClass.group.schedules?.length || 0} lessons / week</div>
                      </div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>Duration</div>
                        <div className={styles.infoValue}>{selectedClass.schedule.startTime} - {selectedClass.schedule.endTime}</div>
                      </div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>Students</div>
                        <div className={styles.infoValue}>{selectedClass.group._count?.students || 0} Students</div>
                      </div>
                      <div className={styles.infoBlock}>
                        <div className={styles.infoLabel}>Room</div>
                        <div className={styles.infoValue}>{selectedClass.schedule.room || selectedClass.group.room || "TBA"}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={styles.weeklyScheduleTitle}>Weekly Schedule</h4>
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
                <h2>Add Schedule</h2>
                <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddScheduleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Group *</label>
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
                    <option value="">Select a group...</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.program?.name || "No Program"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Day of Week *</label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  >
                    <option value="1">1 - Monday</option>
                    <option value="2">2 - Tuesday</option>
                    <option value="3">3 - Wednesday</option>
                    <option value="4">4 - Thursday</option>
                    <option value="5">5 - Friday</option>
                  </select>
                </div>

                <div className={styles.rowInputs}>
                  <div className={styles.inputGroup}>
                    <label>Start Time *</label>
                    <input
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>End Time *</label>
                    <input
                      required
                      type="time"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Room</label>
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
