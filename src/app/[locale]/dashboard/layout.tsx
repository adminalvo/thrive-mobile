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
  FileText
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import GlobalSearch from "@/components/GlobalSearch";

export default function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <aside 
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <LayoutDashboard className={styles.logoAccent} size={24} />
            <span>Thrive<span className={styles.logoAccent}>CRM</span></span>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}>
                  <item.icon size={20} className={isActive ? styles.iconActive : styles.icon} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href={`/dashboard/settings`}>
            <div className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.navActive : ""}`}>
              <Settings size={20} className={pathname === '/dashboard/settings' ? styles.iconActive : styles.icon} />
              <span>{t("settings")}</span>
            </div>
          </Link>
          <div 
            className={`${styles.navItem} ${styles.logoutItem}`}
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ cursor: "pointer" }}
          >
            <LogOut size={20} className={styles.iconLogout} />
            <span>{t("logout")}</span>
          </div>
        </div>
      </aside>

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
