"use client";

import { Link } from "@/i18n/routing";
import styles from "./not-found.module.css";
import { Terminal, ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className={styles.container}>
      <div className={styles.glitchBox}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.iconWrapper}
        >
          <ShieldAlert size={80} className={styles.icon} />
        </motion.div>
        
        <h1 className={styles.errorCode}>
          4<span className={styles.glitchSpan}>0</span>4
        </h1>
        
        <h2 className={styles.title}>{t("title")}</h2>
        
        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <div className={styles.dots}>
              <span></span><span></span><span></span>
            </div>
            <div className={styles.terminalTitle}>root@thrive:~</div>
          </div>
          <div className={styles.terminalBody}>
            <p className={styles.command}>$ locate page</p>
            <p className={styles.errorText}>[ERROR] {t("msg1")}</p>
            <p className={styles.command}>$ query database</p>
            <p className={styles.errorText}>[ERROR] {t("msg2")}</p>
            <p className={styles.cursor}>_</p>
          </div>
        </div>

        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={18} /> {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
