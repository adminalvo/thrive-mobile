"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Activity, Clock } from "lucide-react";

export default function LogsPage() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.dashboard}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>Fəaliyyət Tarixçəsi (Logs)</h1>
          <p className={styles.pageSubtitle}>Sistemdə baş verən bütün əməliyyatların qeydləri</p>
        </div>
      </motion.div>

      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vaxt</th>
                <th>İstifadəçi</th>
                <th>Əməliyyat</th>
                <th>Detallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Yüklənir...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Clock size={14} />
                        {new Date(log.created_at).toLocaleString(locale)}
                      </div>
                    </td>
                    <td>{log.user_email || "Sistem"}</td>
                    <td>
                      <span style={{ 
                        background: "rgba(43, 217, 185, 0.1)", 
                        color: "var(--aqua-teal)",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem"
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {locale === 'az' ? log.details_az : locale === 'ru' ? log.details_ru : log.details_en}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Qeyd tapılmadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
