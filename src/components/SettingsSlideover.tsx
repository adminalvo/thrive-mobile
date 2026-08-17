"use client";

import { useState } from "react";
import { X, User, Lock, Globe, Mail, LogOut, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SettingsSlideover.module.css";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface SettingsSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  locale: string;
}

export default function SettingsSlideover({ isOpen, onClose, user, locale }: SettingsSlideoverProps) {
  const t = useTranslations("Settings");
  const c = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("profile");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(user?.email || "");

  const handleSaveProfile = async () => {
    // API call to update profile would go here
    toast.success(t("profileUpdated") || "Profil yeniləndi");
  };

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={styles.slideover}
          >
            <div className={styles.header}>
              <h2>{t("settings") || "Ayarlar"}</h2>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === "profile" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={16} /> Profil
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "language" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("language")}
              >
                <Globe size={16} /> Dil
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "about" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("about")}
              >
                <Info size={16} /> Haqqında
              </button>
            </div>

            <div className={styles.content}>
              {activeTab === "profile" && (
                <div className={styles.section}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Yeni Şifrə</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={16} className={styles.inputIcon} />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                  </div>
                  <button className={styles.saveBtn} onClick={handleSaveProfile}>Yadda Saxla</button>
                </div>
              )}

              {activeTab === "language" && (
                <div className={styles.section}>
                  <div className={styles.langGrid}>
                    <button 
                      className={`${styles.langBtn} ${locale === "az" ? styles.activeLang : ""}`}
                      onClick={() => handleLanguageChange("az")}
                    >
                      Azərbaycan dili
                    </button>
                    <button 
                      className={`${styles.langBtn} ${locale === "en" ? styles.activeLang : ""}`}
                      onClick={() => handleLanguageChange("en")}
                    >
                      English
                    </button>
                    <button 
                      className={`${styles.langBtn} ${locale === "ru" ? styles.activeLang : ""}`}
                      onClick={() => handleLanguageChange("ru")}
                    >
                      Русский
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className={styles.section} style={{ lineHeight: "1.6", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ background: "var(--aqua-teal)", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "var(--bg-dark)", fontWeight: "bold", fontSize: "1.2rem" }}>T</span>
                    </div>
                    <div>
                      <h3 style={{ color: "var(--text-primary)", margin: 0, fontSize: "1.1rem" }}>Thrive CRM</h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--aqua-teal)" }}>v1.0.0</span>
                    </div>
                  </div>
                  <p style={{ marginBottom: "1rem" }}>
                    <strong dangerouslySetInnerHTML={{ __html: t("about.p1").replace('Thrive CRM', '<strong>Thrive CRM</strong>') }} />
                  </p>
                  <p style={{ marginBottom: "1rem" }}>
                    <span dangerouslySetInnerHTML={{ __html: t("about.p2").replace('HacTag', '<strong>HacTag</strong>') }} />
                  </p>
                  <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", textAlign: "center", fontSize: "0.85rem" }}>
                    {t("about.copyright")}
                  </div>
                </div>
              )}
            </div>


          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
