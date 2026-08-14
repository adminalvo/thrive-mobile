"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function FinanceLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ width: 260, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
        </div>
        <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)" }} />
          <div>
            <div style={{ width: 100, height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: 120, height: 28, background: "rgba(255,255,255,0.08)", borderRadius: 4 }} />
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.debtCard}`}>
          <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)" }} />
          <div>
            <div style={{ width: 100, height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: 120, height: 28, background: "rgba(255,255,255,0.08)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <div style={{ width: "100%", height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0 1rem", color: "var(--text-secondary)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
              <div style={{ width: 60, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 140, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 80, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 70, height: 22, background: "rgba(255,255,255,0.05)", borderRadius: 20 }} />
              <div style={{ width: 90, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
