"use client";

import styles from "./page.module.css";
import { Users, GraduationCap, TrendingUp, Clock, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const c = useTranslations("Common");
  
  const [statsData, setStatsData] = useState<any>(null);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats").then(res => res.json()).then(setStatsData);
    fetch("/api/dashboard/recent").then(res => res.json()).then(setRecentStudents);
    fetch("/api/dashboard/today").then(res => res.json()).then(setTodayClasses);
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
          <h1 className={styles.pageTitle}>{t("welcome")}, Tamerlan</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.actionBtn}>{t("newStudent")}</button>
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
              <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${stat.color} 0%, rgba(255,255,255,0.1) 100%)` }}>
                <stat.icon size={22} color="#fff" />
              </div>
              {stat.trend && (
                <span className={styles.trend} style={{ color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444' }}>
                  {stat.trend}
                </span>
              )}
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
            <button className={styles.iconBtn}><MoreVertical size={18} /></button>
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          
          className={styles.sideCard}
        >
          <div className={styles.cardHeader}>
            <h3>{t("todayClasses")}</h3>
            <button className={styles.iconBtn}><MoreVertical size={18} /></button>
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
      </div>
    </div>
  );
}
