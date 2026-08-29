"use client";

import { 
  LayoutDashboard, 
  Calendar, 
  KanbanSquare, 
  CreditCard, 
  Bot,
  Menu
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import styles from "./MobileBottomNav.module.css";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");

  const NAV_ITEMS = [
    { id: "dashboard", href: "/dashboard", label: t("dashboard") || "İcmal", icon: LayoutDashboard, exact: true },
    { id: "schedule", href: "/dashboard/schedule", label: t("schedule") || "Cədvəl", icon: Calendar },
    { id: "tasks", href: "/dashboard/tasks", label: t("tasks") || "İşlər", icon: KanbanSquare },
    { id: "finance", href: "/dashboard/finance", label: t("finance") || "Maliyyə", icon: CreditCard },
    { id: "ai", href: "/dashboard/ai", label: "ThrAIve", icon: Bot },
  ];

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href || pathname === `${item.href}/`
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
          >
            <div className={styles.iconWrapper}>
              <item.icon size={19} />
              {isActive && <div className={styles.activeDot} />}
            </div>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        className={styles.navItem}
        onClick={onOpenMenu}
        aria-label="Open Full Menu"
      >
        <div className={styles.iconWrapper}>
          <Menu size={19} />
        </div>
        <span className={styles.label}>{t("menu") || "Menyu"}</span>
      </button>
    </nav>
  );
}
