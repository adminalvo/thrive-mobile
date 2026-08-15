"use client";

import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  KanbanSquare, 
  Target,
  CreditCard,
  Menu,
  X,
  Settings,
  LogOut,
  Component,
  UserPlus,
  Bot
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import styles from "@/app/[locale]/dashboard/layout.module.css";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  const pathname = usePathname();
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
    <aside 
      className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <LayoutDashboard className={styles.logoAccent} size={24} />
          {!isCollapsed && <span>Thrive<span className={styles.logoAccent}>CRM</span></span>}
        </div>
        <button className={styles.desktopCollapseBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
          <Menu size={20} />
        </button>
        <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div className={`${styles.navItem} ${isActive ? styles.navActive : ""}`} title={isCollapsed ? item.name : undefined}>
                <item.icon size={20} className={isActive ? styles.iconActive : styles.icon} />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href={`/dashboard/settings`}>
          <div className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.navActive : ""}`} title={isCollapsed ? t("settings") : undefined}>
            <Settings size={20} className={pathname === '/dashboard/settings' ? styles.iconActive : styles.icon} />
            {!isCollapsed && <span>{t("settings")}</span>}
          </div>
        </Link>
        <div 
          className={`${styles.navItem} ${styles.logoutItem}`}
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ cursor: "pointer" }}
          title={isCollapsed ? t("logout") : undefined}
        >
          <LogOut size={20} className={styles.iconLogout} />
          {!isCollapsed && <span>{t("logout")}</span>}
        </div>
      </div>
    </aside>
  );
}
