"use client";

import { useState, useEffect } from "react";
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
  Library,
  ShieldAlert,
  GripVertical
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import styles from "@/app/[locale]/dashboard/layout.module.css";
import GlobalSearch from "./GlobalSearch";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const ALL_NAV_ITEMS = [
  { id: "dashboard", href: `/dashboard`, icon: LayoutDashboard },
  { id: "leads", href: `/dashboard/leads`, icon: Target },
  { id: "students", href: "/dashboard/students", icon: Users },
  { id: "programs", href: "/dashboard/programs", icon: Library },
  { id: "universities", href: "/dashboard/universities", icon: GraduationCap },
  { id: "groups", href: "/dashboard/groups", icon: Component },
  { id: "parents", href: "/dashboard/parents", icon: UserPlus },
  { id: "teachers", href: "/dashboard/teachers", icon: BookOpen },
  { id: "schedule", href: `/dashboard/schedule`, icon: Calendar },
  { id: "finance", href: `/dashboard/finance`, icon: CreditCard },
  { id: "tasks", href: `/dashboard/tasks`, icon: KanbanSquare },
  { id: "ai", href: "/dashboard/ai", icon: Bot },
];

function SortableNavItem({ item, isActive, isCollapsed, name, onNavClick }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${styles.navItemContainer} ${isActive ? styles.navActiveContainer : ""}`} >
      <div {...attributes} {...listeners} className={styles.dragHandle} title="Sürüşdür">
        <GripVertical size={16} />
      </div>
      <Link href={item.href} onClick={onNavClick} style={{flex: 1}}>
        <div className={`${styles.navItem} ${isActive ? styles.navActive : ""}`} title={isCollapsed ? name : undefined} style={{paddingLeft: '0.2rem'}}>
          <item.icon size={20} className={isActive ? styles.iconActive : styles.icon} />
          {!isCollapsed && <span>{name}</span>}
        </div>
      </Link>
    </div>
  );
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

  const [orderedItems, setOrderedItems] = useState(ALL_NAV_ITEMS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedOrder = localStorage.getItem(`sidebarOrder_${userRole}`);
    if (savedOrder) {
      try {
        const parsedIds = JSON.parse(savedOrder);
        const newOrder = [];
        // Reconstruct order based on saved IDs
        for (const id of parsedIds) {
          const found = ALL_NAV_ITEMS.find(i => i.id === id);
          if (found) newOrder.push(found);
        }
        // Add any new items that weren't in the saved order
        for (const item of ALL_NAV_ITEMS) {
          if (!newOrder.find(i => i.id === item.id)) {
            newOrder.push(item);
          }
        }
        setOrderedItems(newOrder);
      } catch (e) {
        setOrderedItems(ALL_NAV_ITEMS);
      }
    }
  }, [userRole]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(`sidebarOrder_${userRole}`, JSON.stringify(newArray.map(i => i.id)));
        return newArray;
      });
    }
  };

  const allowedNavItems = orderedItems.filter(item => {
    if (userRole === "super_admin") return true;

    if (userRole === "teacher") {
      const allowed = ["/dashboard", "/dashboard/schedule", "/dashboard/students", "/dashboard/ai", "/dashboard/programs", "/dashboard/universities", "/dashboard/tasks", "/dashboard/groups"];
      return allowed.includes(item.href);
    }
    
    if (userRole === "parent" || userRole === "student") {
      const allowed = ["/dashboard", "/dashboard/ai", "/dashboard/programs", "/dashboard/universities"];
      return allowed.includes(item.href);
    }

    if (userRole === "staff" || userRole === "admin") {
      if (["/dashboard", "/dashboard/schedule", "/dashboard/ai", "/dashboard/programs", "/dashboard/universities", "/dashboard/leads"].includes(item.href)) {
        return true;
      }
      
      const permissions = (session?.user as any)?.permissions || {};
      const modMap: Record<string, string> = {
        "/dashboard/students": "students",
        "/dashboard/finance": "finance",
        "/dashboard/groups": "groups",
        "/dashboard/tasks": "tasks",
        "/dashboard/teachers": "teachers",
        "/dashboard/parents": "parents",
        "/dashboard/staff": "staff"
      };
      
      const modKey = modMap[item.href];
      if (modKey && permissions[modKey]) {
        return !!permissions[modKey].view;
      }
      
      if (item.href.includes('/finance')) return false;
      return true;
    }

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

      <div style={{ padding: "0 1rem", marginBottom: "1rem" }}>
        <GlobalSearch />
      </div>

      <nav className={styles.sidebarNav}>
        {mounted && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={allowedNavItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {allowedNavItems.map((item) => {
                const isActive = pathname === item.href;
                const name = t(item.id) || item.id;
                return (
                  <SortableNavItem 
                    key={item.id} 
                    item={item} 
                    isActive={isActive} 
                    isCollapsed={isCollapsed} 
                    name={name} 
                    onNavClick={() => setSidebarOpen(false)} 
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        {isSuperAdmin && (
          <Link href={`/dashboard/staff`}>
            <div className={`${styles.navItem} ${pathname === '/dashboard/staff' ? styles.navActive : ""}`} title={isCollapsed ? "İşçilər (RBAC)" : undefined}>
              <ShieldAlert size={20} className={pathname === '/dashboard/staff' ? styles.iconActive : styles.icon} />
              {!isCollapsed && <span>İşçilər (RBAC)</span>}
            </div>
          </Link>
        )}
        <div 
          className={`${styles.navItem} ${styles.logoutItem}`}
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/login";
          }}
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
