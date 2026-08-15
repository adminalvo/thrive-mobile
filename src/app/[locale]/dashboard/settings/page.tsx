"use client";

import styles from "./page.module.css";
import { User, Bell, Shield, Globe, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "@/i18n/routing";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("profile");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({ first_name: "", last_name: "", email: "", role: "" });
  const [securityData, setSecurityData] = useState({ old_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          role: data.role || "Admin"
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          ...profileData
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("success"));
      } else {
        toast.error(data.error || "Xəta baş verdi");
      }
    } catch (e) {
      toast.error("Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (securityData.new_password !== securityData.confirm_password) {
      toast.error("Yeni şifrə təkrarı ilə uyğun deyil");
      return;
    }
    if (securityData.new_password.length < 6) {
      toast.error("Şifrə ən azı 6 simvol olmalıdır");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_password",
          old_password: securityData.old_password,
          new_password: securityData.new_password
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("success"));
        setSecurityData({ old_password: "", new_password: "", confirm_password: "" });
      } else {
        toast.error(data.error || "Xəta baş verdi");
      }
    } catch (e) {
      toast.error("Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}><Loader2 className={styles.spinner} /></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <button 
            className={`${styles.tabBtn} ${activeTab === "profile" ? styles.active : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} /> {t("tabs.profile")}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "notifications" ? styles.active : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} /> {t("tabs.notifications")}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "security" ? styles.active : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={18} /> {t("tabs.security")}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "system" ? styles.active : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <Globe size={18} /> {t("tabs.system")}
          </button>
        </div>

        <div className={styles.main}>
          {activeTab === "profile" && (
            <div className={styles.panel}>
              <h2>{t("profile.title")}</h2>
              <div className={styles.formGroup}>
                <label>Ad</label>
                <input 
                  type="text" 
                  value={profileData.first_name} 
                  onChange={e => setProfileData({...profileData, first_name: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Soyad</label>
                <input 
                  type="text" 
                  value={profileData.last_name} 
                  onChange={e => setProfileData({...profileData, last_name: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t("profile.email")}</label>
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={e => setProfileData({...profileData, email: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t("profile.role")}</label>
                <input type="text" value={profileData.role} disabled />
              </div>
              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={saving}>
                  <Save size={18} /> {t("save")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={styles.panel}>
              <h2>{t("notifications.title")}</h2>
              <div className={styles.toggleGroup}>
                <span>{t("notifications.newLead")}</span>
                <input type="checkbox" defaultChecked className={styles.toggle} />
              </div>
              <div className={styles.toggleGroup}>
                <span>{t("notifications.payments")}</span>
                <input type="checkbox" defaultChecked className={styles.toggle} />
              </div>
              <div className={styles.toggleGroup}>
                <span>{t("notifications.updates")}</span>
                <input type="checkbox" className={styles.toggle} />
              </div>
              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={() => toast.success(t("success"))}>
                  <Save size={18} /> {t("save")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className={styles.panel}>
              <h2>{t("security.title")}</h2>
              <div className={styles.formGroup}>
                <label>{t("security.oldPass")}</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={securityData.old_password}
                  onChange={e => setSecurityData({...securityData, old_password: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t("security.newPass")}</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={securityData.new_password}
                  onChange={e => setSecurityData({...securityData, new_password: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t("security.newPassConfirm")}</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={securityData.confirm_password}
                  onChange={e => setSecurityData({...securityData, confirm_password: e.target.value})}
                />
              </div>
              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSaveSecurity} disabled={saving}>
                  <Save size={18} /> {t("save")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className={styles.panel}>
              <h2>{t("system.title")}</h2>
              <div className={styles.formGroup}>
                <label>{t("system.theme")}</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="dark">{t("system.themes.dark")}</option>
                  <option value="light">{t("system.themes.light")}</option>
                  <option value="system">{t("system.themes.sys")}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{t("system.lang")}</label>
                <select 
                  value={locale}
                  onChange={(e) => router.replace(pathname, { locale: e.target.value })}
                >
                  <option value="az">{t("system.langs.az")}</option>
                  <option value="en">{t("system.langs.en")}</option>
                  <option value="ru">{t("system.langs.ru")}</option>
                </select>
              </div>
              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={() => toast.success(t("success"))}>
                  <Save size={18} /> {t("save")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
