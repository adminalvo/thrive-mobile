"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "../students/page.module.css";

export default function ParentsLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.skeletonBox} style={{ width: 180, height: 32, marginBottom: 8 }} />
          <div className={styles.skeletonBox} style={{ width: 260, height: 16 }} />
        </div>
        <div className={styles.skeletonBox} style={{ width: 140, height: 42, borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.skeletonBox} style={{ flex: 1, height: 44, borderRadius: 8 }} />
      </div>

      <div className={styles.tableContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0 1rem", color: "var(--text-secondary)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeletonBox} ${styles.skelAvatar}`} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: "45%" }} />
                <div className={styles.skeletonLine} style={{ width: "30%" }} />
              </div>
              <div className={styles.skeletonBox} style={{ width: 100, height: 20 }} />
              <div className={styles.skeletonBox} style={{ width: 80, height: 20 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
