"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import styles from "./NotificationsDropdown.module.css";
import { formatDistanceToNow } from "date-fns";
import { az, enUS, ru } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations("Notifications");
  const c = useTranslations("Common");

  const dateLocale = locale === "az" ? az : locale === "ru" ? ru : enUS;

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.iconBtn} onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>{t("title")}</h3>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={() => notifications.forEach(n => !n.is_read && markAsRead(n.id))}>
                <Check size={14} /> {t("markAllRead")}
              </button>
            )}
          </div>
          <div className={styles.list}>
            {loading ? (
              <div className={styles.empty}>{c("loading")}</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>{t("noNotifications")}</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`${styles.item} ${n.is_read ? styles.read : styles.unread}`} onClick={() => !n.is_read && markAsRead(n.id)}>
                  <div className={styles.itemHeader}>
                    <h4>{n.title}</h4>
                    {!n.is_read && <span className={styles.dot}></span>}
                  </div>
                  {n.message && <p>{n.message}</p>}
                  <span className={styles.time}>
                    {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: dateLocale }) : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
