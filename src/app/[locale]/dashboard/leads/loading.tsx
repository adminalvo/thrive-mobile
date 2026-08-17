"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function LeadsLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(var(--glass-color), 0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ width: 260, height: 16, background: "rgba(var(--glass-color), 0.03)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
        </div>
        <div style={{ width: 140, height: 42, background: "rgba(var(--glass-color), 0.08)", borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div style={{ flex: 1, height: 44, background: "rgba(var(--glass-color), 0.04)", borderRadius: 8 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", padding: "0 1rem" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} className={styles.column} style={{ opacity: 0.75 }}>
            <div className={styles.columnHeader}>
              <div className={styles.colIndicator} style={{ background: "rgba(var(--glass-color), 0.2)" }} />
              <div style={{ width: 100, height: 16, background: "rgba(var(--glass-color), 0.05)", borderRadius: 4 }} />
              <span className={styles.count}>...</span>
            </div>
            <div className={styles.columnBody}>
              {[1, 2, 3].map((card) => (
                <div key={card} className={styles.card}>
                  <div style={{ width: 60, height: 18, background: "rgba(var(--glass-color), 0.05)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "80%", height: 16, background: "rgba(var(--glass-color), 0.05)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "50%", height: 14, background: "rgba(var(--glass-color), 0.03)", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
