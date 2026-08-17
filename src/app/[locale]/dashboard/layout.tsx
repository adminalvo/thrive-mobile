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
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import GlobalSearch from "@/components/GlobalSearch";
import Sidebar from "@/components/Sidebar";
import SettingsSlideover from "@/components/SettingsSlideover";
import AiChatbot from "@/components/AiChatbot";

export default function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Sidebar");
  const { data: session } = useSession();

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
            <h2 style={{ marginLeft: "1rem", fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)" }}>
              {t("dashboard") || "Thrive CRM"}
            </h2>
          </div>

          <div className={styles.headerRight}>
            <NotificationsDropdown />
            <button 
              className={styles.settingsBtn} 
              onClick={() => setSettingsOpen(true)}
              title="Settings"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Settings size={20} />
            </button>
            <div className={styles.profile} onClick={() => setSettingsOpen(true)} style={{ cursor: 'pointer' }}>
              <div className={styles.avatar}>
                <span>{session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}</span>
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{session?.user?.name || "User"}</span>
                <span className={styles.profileRole} style={{textTransform: "capitalize"}}>{session?.user?.role?.replace("_", " ") || "Staff"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
      <AiChatbot />
      
      <SettingsSlideover 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        user={session?.user} 
        locale={locale} 
      />
    </div>
  );
}
