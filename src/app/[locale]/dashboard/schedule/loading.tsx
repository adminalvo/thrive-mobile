"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function ScheduleLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(var(--glass-color), 0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ width: 260, height: 16, background: "rgba(var(--glass-color), 0.03)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
            <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
          </div>
          <div style={{ width: 140, height: 42, background: "rgba(var(--glass-color), 0.08)", borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.scheduleGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.groupCard} style={{ opacity: 0.75 }}>
            <div className={styles.cardHeader}>
              <div style={{ width: 120, height: 20, background: "rgba(var(--glass-color), 0.05)", borderRadius: 4 }} />
              <div style={{ width: 32, height: 20, background: "rgba(var(--glass-color), 0.05)", borderRadius: 6 }} />
            </div>
            <div className={styles.cardInfo}>
              <div style={{ width: "70%", height: 14, background: "rgba(var(--glass-color), 0.03)", borderRadius: 4 }} />
              <div style={{ width: "50%", height: 14, background: "rgba(var(--glass-color), 0.03)", borderRadius: 4 }} />
            </div>
            <div className={styles.schedulesList}>
              <div style={{ width: "100%", height: 24, background: "rgba(var(--glass-color), 0.02)", borderRadius: 4 }} />
              <div style={{ width: "100%", height: 24, background: "rgba(var(--glass-color), 0.02)", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
