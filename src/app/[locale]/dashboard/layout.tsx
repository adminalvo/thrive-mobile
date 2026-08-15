"use client";

import { useState } from "react";
import styles from "./layout.module.css";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  KanbanSquare, 
  Bell, 
  Target,
  CreditCard,
  Menu,
  X,
  Settings,
  LogOut,
  Globe,
  Component,
  UserPlus,
  FileText,
  Bot
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import GlobalSearch from "@/components/GlobalSearch";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Sidebar");

  const navItems = [
    { name: t("dashboard"), href: `/dashboard`, icon: LayoutDashboard },
    { name: t("leads"), href: `/dashboard/leads`, icon: Target },
    { name: t("students"), href: "/dashboard/students", icon: Users },
    { name: t("groups"), href: "/dashboard/groups", icon: Component },
    { name: t("parents"), href: "/dashboard/parents", icon: UserPlus },
    { name: t("teachers"), href: "/dashboard/teachers", icon: BookOpen },
    { name: t("schedule"), href: `/dashboard/schedule`, icon: Calendar },
    { name: t("finance"), href: `/dashboard/finance`, icon: CreditCard },
    { name: t("tasks"), href: `/dashboard/tasks`, icon: KanbanSquare },
    { name: t("ai"), href: "/dashboard/ai", icon: Bot },
  ];

  return (
    <div className={styles.container}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <GlobalSearch />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.langSwitcher}>
              <Globe size={18} className={styles.langIcon} />
              <select 
                value={locale} 
                onChange={(e) => router.replace(pathname, { locale: e.target.value })}
                className={styles.langSelect}
              >
                <option value="az">AZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>
            <NotificationsDropdown />
            <div className={styles.profile}>
              <div className={styles.avatar}>
                <span>TA</span>
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Tamerlan (Admin)</span>
                <span className={styles.profileRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
