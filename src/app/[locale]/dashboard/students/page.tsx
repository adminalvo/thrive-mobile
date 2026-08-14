"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { Plus, Search, Filter, MoreHorizontal, UserCheck, UserX, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function StudentsPage() {
  const t = useTranslations("Students");
  const c = useTranslations("Common");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", phone: "", email: "", fin: "", password: "" });
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

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        setShowModal(false);
        setNewStudent({ name: "", phone: "", email: "", fin: "", password: "" });
        toast.success("Tələbə uğurla əlavə edildi!");
        fetchStudents();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Tələbə əlavə edilərkən xəta baş verdi");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

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
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t("newStudent")}
        </button>
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
            <option value="ALL">Bütün Statuslar</option>
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
                          <div className={styles.avatar}>{displayName.substring(0,2).toUpperCase()}</div>
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
                      <div style={{ position: "relative" }}>
                        <button className={styles.actionBtn} onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}>
                          <MoreHorizontal size={18}/>
                        </button>
                        {activeMenu === student.id && (
                          <div className={styles.actionMenu}>
                            <Link href={`/dashboard/students/${student.id}`} style={{ textDecoration: "none", display: "block" }}>
                              <button style={{ color: "var(--aqua-teal)" }}>
                                Profilə bax
                              </button>
                            </Link>
                            <button onClick={() => handleDelete(student.id)} style={{ color: "var(--danger-color)" }}>
                              <Trash2 size={14} /> Sil
                            </button>
                          </div>
                        )}
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
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Yeni Tələbə Əlavə Et</h2>
            <form onSubmit={createStudent} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Ad və Soyad</label>
                <input required type="text" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="Məs: Cavid Rüstəmov" />
              </div>
              <div className={styles.inputGroup}>
                <label>Telefon</label>
                <input required type="text" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} placeholder="+994551234567" />
              </div>
              <div className={styles.inputGroup}>
                <label>Email (İstəyə bağlı)</label>
                <input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} placeholder="ornek@thrive.az" />
              </div>
              <div className={styles.inputGroup}>
                <label>FIN Kod (İstəyə bağlı)</label>
                <input type="text" value={newStudent.fin} onChange={e => setNewStudent({...newStudent, fin: e.target.value})} placeholder="Məs: 5G8Y2P1" />
              </div>
              <div className={styles.inputGroup}>
                <label>Şifrə (Giriş üçün)</label>
                <input required type="text" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} placeholder="Şifrə təyin edin" />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Ləğv et</button>
                <button type="submit" className={styles.saveBtn}>Qeydiyyatdan Keçir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
