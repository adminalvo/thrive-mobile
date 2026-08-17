"use client";

import styles from "@/app/[locale]/dashboard/page.module.css";
import { Calendar, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const t = useTranslations("Dashboard");
  const c = useTranslations("Common");
  
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboards/student")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUpcomingClasses(data.upcomingClasses || []);
          setPayments(data.payments || []);
        }
      });
  }, []);

  const stats = [
    { title: "Qarşıdan Gələn Dərslərim", value: upcomingClasses.length, icon: Calendar, color: "var(--ocean-blue)" }
  ];

  return (
    <div className={styles.dashboard}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("welcome")} (Tələbə)</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
      </motion.div>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statCard}
          >
            <div className={styles.statTop}>
              <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${stat.color} 0%, rgba(255,255,255,0.1) 100%)` }}>
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

      <div className={styles.contentGrid}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.tableCard}
        >
          <div className={styles.cardHeader}>
            <h3>Dərs Cədvəlim</h3>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("table.group")}</th>
                  <th>Müəllim</th>
                  <th>Tarix və Saat</th>
                  <th>{t("table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {upcomingClasses.length > 0 ? upcomingClasses.map(cls => (
                  <tr key={cls.id}>
                    <td className={styles.studentName}>{cls.group} - {cls.program}</td>
                    <td className={styles.studentGroup}>{cls.teacherName}</td>
                    <td className={styles.studentDate}>{cls.date} {cls.time}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${cls.status === 'COMPLETED' ? styles.statusActive : styles.statusPending}`}>
                        {cls.status}
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.sideCard}
        >
          <div className={styles.cardHeader}>
            <h3>Ödənişlərim</h3>
          </div>
          <div className={styles.taskList}>
            {payments.length > 0 ? payments.map((p, idx) => (
              <div key={idx} className={styles.taskItem}>
                <div className={styles.taskIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.5rem", borderRadius: "8px" }}>
                  <CreditCard size={18} />
                </div>
                <div className={styles.taskInfo} style={{ flex: 1 }}>
                  <h4>{p.date}</h4>
                </div>
                <div style={{ fontWeight: 600, color: p.status === 'Paid' ? '#10b981' : '#f59e0b' }}>
                  {p.amount} ₼
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
