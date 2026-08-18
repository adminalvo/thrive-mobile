"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { Plus, Search, Filter, MoreHorizontal, UserCheck, UserX, Trash2, Edit, X, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import StudentRegistrationModal from "@/components/StudentRegistrationModal";

export default function StudentsPage() {
  const t = useTranslations("Students");
  const c = useTranslations("Common");
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role || "staff";
  const permissions = (session?.user as any)?.permissions?.students || {};
  const canCreate = userRole === "super_admin" || userRole === "admin" || permissions.create;
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ 
    name: "", phone: "", email: "", program: "", monthlyPayment: "", durationMonths: "", password: "",
    parentName: "", parentPhone: "", parentEmail: "", parentFin: "", parentIdCard: "", parentPassword: ""
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter(student => {
      const displayName = (student.name || student.user?.name || "").toLowerCase();
      const phone = (student.phone || "").toLowerCase();
      const fin = (student.fin || "").toLowerCase();

      const matchesSearch = !term || displayName.includes(term) || phone.includes(term) || fin.includes(term);
      const matchesStatus = statusFilter === "ALL" || !statusFilter || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        toast.error("Tələbələri yükləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  // createStudent logic removed because it is handled inside StudentRegistrationModal

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tələbəni silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi");
        fetchStudents();
      } else {
        toast.error("Silinmədi");
      }
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
    setActiveMenu(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        {canCreate && (
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={18} /> {t("newStudent")}
          </button>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.icon} />
          <input 
            type="text" 
            placeholder={t("search")} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterBox}>
          <Filter size={18} className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{t("filter.all")}</option>
            <option value="ACTIVE">{c("active")} (ACTIVE)</option>
            <option value="FROZEN">{c("inactive")} (FROZEN)</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.skeletonContainer}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.skeletonRow}>
                <div className={`${styles.skeletonBox} ${styles.skelAvatar}`}></div>
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} style={{width: '60%'}}></div>
                  <div className={styles.skeletonLine} style={{width: '40%'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("table.name")}</th>
                <th>{t("table.contact")}</th>
                <th>{t("table.group")}</th>
                <th>{t("table.status")}</th>
                <th>{t("table.enrollDate")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    {c("empty")}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                const displayName = student.name || student.user?.name || "Tələbə";
                const displayEmail = student.email || student.user?.email || "";
                const displayDate = student.joinDate || (student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : "—");
                return (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <td>
                      <Link href={`/dashboard/students/${student.id}`} style={{ textDecoration: "none" }}>
                        <div className={styles.studentInfo}>
                          <div className={styles.avatar}>{displayName ? String(displayName).substring(0,2).toUpperCase() : "U"}</div>
                          <div>
                            <div className={styles.name} style={{ color: "var(--white)", transition: "color 0.2s" }}>
                              {displayName}
                            </div>
                            <div className={styles.fin}>FIN: {student.fin || c("notSpecified")}</div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <div className={styles.contact}>
                        <span>{student.phone || "—"}</span>
                        <span className={styles.email}>{displayEmail}</span>
                      </div>
                    </td>
                    <td>
                      {student.groups?.length > 0 ? (
                        student.groups.map((g: any) => (
                          <span key={g.groupId || g.id} className={styles.groupBadge}>{g.group?.name || g.name}</span>
                        ))
                      ) : (
                        <span className={styles.groupBadge}>{student.group || "Əsas Qrup"}</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${student.status === 'ACTIVE' ? styles.statusActive : styles.statusFrozen}`}>
                        {student.status === 'ACTIVE' ? <UserCheck size={14}/> : <UserX size={14}/>}
                        {student.status === 'ACTIVE' ? c("active") : c("inactive")}
                      </span>
                    </td>
                    <td className={styles.date}>{displayDate}</td>
                    <td>
                      <div className={styles.inlineActions}>
                        <Link href={`/dashboard/students/${student.id}`} style={{ textDecoration: "none" }}>
                          <button className={styles.iconBtn} title="Profilə bax" style={{ color: "var(--aqua-teal)" }}>
                            <BookOpen size={16} />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                );
              }))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <StudentRegistrationModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            fetchStudents();
          }} 
        />
      )}
    </div>
  );
}
