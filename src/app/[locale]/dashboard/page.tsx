"use client";

import { useSession } from "next-auth/react";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";
import ParentDashboard from "@/components/dashboards/ParentDashboard";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import styles from "./page.module.css";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin text-gray-500" size={48} />
      </div>
    );
  }

  const role = session?.user?.role || "staff";

  if (role === "teacher") {
    return <TeacherDashboard />;
  }

  if (role === "parent") {
    return <ParentDashboard />;
  }

  if (role === "student") {
    return <StudentDashboard />;
  }

  // Fallback for admin, staff, sales, etc.
  return <AdminDashboard />;
}
