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
  Bot,
  GraduationCap,
  Library
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";
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
  const locale = useLocale();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const isSuperAdmin = userRole === "super_admin";

  const allNavItems = [
    { name: t("dashboard"), href: `/dashboard`, icon: LayoutDashboard },
    { name: t("leads"), href: `/dashboard/leads`, icon: Target },
    { name: t("students"), href: "/dashboard/students", icon: Users },
    { name: t("programs"), href: "/dashboard/programs", icon: Library },
    { name: t("universities") || "Universities", href: "/dashboard/universities", icon: GraduationCap },
    { name: t("groups"), href: "/dashboard/groups", icon: Component },
    { name: t("parents"), href: "/dashboard/parents", icon: UserPlus },
    { name: t("teachers"), href: "/dashboard/teachers", icon: BookOpen },
    { name: t("schedule"), href: `/dashboard/schedule`, icon: Calendar },
    { name: t("finance"), href: `/dashboard/finance`, icon: CreditCard },
    { name: t("tasks"), href: `/dashboard/tasks`, icon: KanbanSquare },
    { name: t("ai"), href: "/dashboard/ai", icon: Bot },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === "super_admin") return true;
    
    if (userRole === "teacher") {
      const allowed = ["/dashboard", "/dashboard/schedule", "/dashboard/students", "/dashboard/ai"];
      return allowed.includes(item.href);
    }
    
    if (userRole === "parent" || userRole === "student") {
      const allowed = ["/dashboard", "/dashboard/ai"];
      return allowed.includes(item.href);
    }

    // Default staff / sales
    if (item.href.includes('/finance')) return false;
    return true;
  });

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
        {isSuperAdmin && (
          <>
            <Link href={`/dashboard/logs`}>
              <div className={`${styles.navItem} ${pathname === '/dashboard/logs' ? styles.navActive : ""}`} title={isCollapsed ? "Logs" : undefined}>
                <Target size={20} className={pathname === '/dashboard/logs' ? styles.iconActive : styles.icon} />
                {!isCollapsed && <span>Tarixçə (Logs)</span>}
              </div>
            </Link>
            <Link href={`/dashboard/staff`}>
              <div className={`${styles.navItem} ${pathname === '/dashboard/staff' ? styles.navActive : ""}`} title={isCollapsed ? "İşçilər (Staff)" : undefined}>
                <Users size={20} className={pathname === '/dashboard/staff' ? styles.iconActive : styles.icon} />
                {!isCollapsed && <span>İşçilər (Staff)</span>}
              </div>
            </Link>
            <Link href={`/dashboard/settings`}>
              <div className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.navActive : ""}`} title={isCollapsed ? t("settings") : undefined}>
                <Settings size={20} className={pathname === '/dashboard/settings' ? styles.iconActive : styles.icon} />
                {!isCollapsed && <span>{t("settings")}</span>}
              </div>
            </Link>
          </>
        )}
        <div 
          className={`${styles.navItem} ${styles.logoutItem}`}
          onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
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
