"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Users, GraduationCap, TrendingUp, Clock, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";

export default function AdminDashboard() {
  const t = useTranslations("Dashboard");
  const c = useTranslations("Common");
  
  const [statsData, setStatsData] = useState<any>(null);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then(res => res.json()).then(setStatsData);
    fetch("/api/dashboard/recent").then(res => res.json()).then(setRecentStudents);
    fetch("/api/dashboard/today").then(res => res.json()).then(setTodayClasses);
    fetch("/api/dashboard/my-tasks").then(res => res.json()).then(setMyTasks);
  }, []);
  
  const stats = [
    { title: t("totalStudents"), value: statsData?.totalStudents || "0", icon: Users, color: "var(--aqua-teal)", trend: "" },
    { title: t("activeGroups"), value: statsData?.activeGroups || "0", icon: GraduationCap, color: "var(--ocean-blue)", trend: "" },
    { title: t("monthlyIncome"), value: `${statsData?.monthlyIncome || 0} ₼`, icon: TrendingUp, color: "#10b981", trend: "" },
    { title: t("pendingPayments"), value: statsData?.pendingPayments || "0", icon: Clock, color: "#f59e0b", trend: "" },
  ];

  return (
    <div className={styles.dashboard}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("welcome")}</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
        <Link href="/dashboard/students">
          <button className={styles.actionBtn}>+</button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.title}
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

      {/* Main Content Split */}
      <div className={styles.contentGrid}>
        {/* Recent Students Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.tableCard}
        >
          <div className={styles.cardHeader}>
            <h3>{t("recentRegistrations")}</h3>
            <Link href="/dashboard/students">
              <button className={styles.iconBtn}><MoreVertical size={18} /></button>
            </Link>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("table.student")}</th>
                  <th>{t("table.group")}</th>
                  <th>{t("table.date")}</th>
                  <th>{t("table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length > 0 ? recentStudents.map(student => (
                  <tr key={student.id}>
                    <td className={styles.studentName}>{student.name}</td>
                    <td className={styles.studentGroup}>{student.group}</td>
                    <td className={styles.studentDate}>{student.date}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${student.status === 'ACTIVE' ? styles.statusActive : styles.statusPending}`}>
                        {student.status === 'ACTIVE' ? c('active') : c('pending')}
                      </span>
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

        {/* Schedule/Tasks Mini */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.sideCard}
          >
            <div className={styles.cardHeader}>
              <h3>{t("todayClasses")}</h3>
              <Link href="/dashboard/schedule">
                <button className={styles.iconBtn}><MoreVertical size={18} /></button>
              </Link>
            </div>
            <div className={styles.taskList}>
              {todayClasses.length > 0 ? todayClasses.map((cls, idx) => (
                <div key={idx} className={styles.taskItem}>
                  <div className={styles.taskTime}>{cls.time}</div>
                  <div className={styles.taskInfo}>
                    <h4>{cls.title}</h4>
                    <p>{cls.room} • {cls.teacher}</p>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {c("empty")}
                </div>
              )}
            </div>
          </motion.div>

          {/* My Tasks Mini */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.sideCard}
          >
            <div className={styles.cardHeader}>
              <h3>Mənim Tapşırıqlarım</h3>
              <Link href="/dashboard/tasks">
                <button className={styles.iconBtn}><MoreVertical size={18} /></button>
              </Link>
            </div>
            <div className={styles.taskList}>
              {myTasks && myTasks.length > 0 ? myTasks.slice(0, 5).map((task, idx) => (
                <div 
                  key={idx} 
                  className={styles.taskItem} 
                  style={{ cursor: "pointer", padding: "0.8rem", borderRadius: "8px", background: "var(--glass-bg)" }}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className={styles.taskInfo}>
                    <h4 style={{ marginBottom: "0.3rem" }}>{task.title}</h4>
                    <span style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.1)" }}>
                      {task.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Mövcud deyil
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {selectedTask && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTask(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000 }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ background: "var(--bg-color)", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "500px", color: "var(--text-color)" }}>
            <h2 style={{ marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>{selectedTask.title}</h2>
            <div style={{ marginBottom: "1rem", whiteSpace: "pre-wrap", lineHeight: 1.5, color: "var(--text-secondary)" }}>
              {selectedTask.description || "Təsvir yoxdur."}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", fontSize: "0.9rem" }}>
              <div style={{ padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                <strong>Status:</strong> {selectedTask.status}
              </div>
              <div style={{ padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                <strong>Prioritet:</strong> {selectedTask.priority}
              </div>
            </div>
            <button 
              onClick={() => setSelectedTask(null)}
              style={{ width: "100%", padding: "0.8rem", background: "var(--aqua-teal)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
