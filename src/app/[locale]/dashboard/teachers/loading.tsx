"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function TeachersLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 220, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ width: 280, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
        </div>
        <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div style={{ width: 300, height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", marginLeft: "auto" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
      </div>

      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.card} style={{ opacity: 0.75 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.06)", marginBottom: "1rem", animation: "pulse 1.5s infinite ease-in-out" }} />
            <div style={{ width: "60%", height: 18, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: "0.5rem", animation: "pulse 1.5s infinite ease-in-out" }} />
            <div style={{ width: "80%", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 4, marginBottom: "1.2rem", animation: "pulse 1.5s infinite ease-in-out" }} />
            <div style={{ width: "100%", height: 36, background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: "0.5rem" }} />
            <div style={{ width: "100%", height: 36, background: "rgba(255,255,255,0.02)", borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
