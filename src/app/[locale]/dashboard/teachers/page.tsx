"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Search, BookOpen, User, MoreHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function TeachersPage() {
  const t = useTranslations("Teachers");
  const c = useTranslations("Common");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    groupIds: [] as string[]
  });

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      } else {
        toast.error(t("errors.fetch"));
      }
    } catch (error) {
      toast.error(c("errors.unexpected"));
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setAvailableGroups(data);
      }
    } catch (err) {
      console.error("Fetch groups error:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchGroups();
  }, []);

  const createTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        setShowModal(false);
        setNewTeacher({ name: "", email: "", password: "", specialty: "", groupIds: [] });
        toast.success(t("success.created") || "Müəllim uğurla əlavə edildi!");
        fetchTeachers();
        fetchGroups();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || t("errors.create") || "Xəta baş verdi");
      }
    } catch (error) {
      toast.error(c("errors.unexpected"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu müəllimi silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi");
        fetchTeachers();
      } else {
        toast.error("Silinmədi");
      }
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
    setActiveMenu(null);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const q = searchTerm.toLowerCase();
    const displayName = (teacher.name || teacher.user?.name || "").toLowerCase();
    const displayEmail = (teacher.email || teacher.user?.email || "").toLowerCase();
    const specialty = (teacher.specialty || "").toLowerCase();
    return displayName.includes(q) || displayEmail.includes(q) || specialty.includes(q);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t("newTeacher")}
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.icon} />
          <input 
            type="text" 
            placeholder={t("search")} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>{c("loading")}</div>
        ) : filteredTeachers.length === 0 ? (
          <div className={styles.empty}>{t("noTeachers")}</div>
        ) : (
          filteredTeachers.map((teacher) => {
            const displayName = teacher.name || teacher.user?.name || "Müəllim";
            const displayEmail = teacher.email || teacher.user?.email || "";
            return (
              <motion.div 
                key={teacher.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <Link href={`/dashboard/teachers/${teacher.id}`} style={{ textDecoration: "none" }}>
                    <div className={styles.avatar}>
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                  </Link>
                  <div style={{ position: "relative" }}>
                    <button className={styles.actionBtn} onClick={() => setActiveMenu(activeMenu === teacher.id ? null : teacher.id)}>
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenu === teacher.id && (
                      <div className={styles.actionMenu}>
                        <Link href={`/dashboard/teachers/${teacher.id}`} style={{ textDecoration: "none", display: "block" }}>
                          <button style={{ color: "var(--aqua-teal)" }}>
                            Profilə bax
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(teacher.id)} style={{ color: "var(--danger-color)" }}>
                          <Trash2 size={14} /> Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Link href={`/dashboard/teachers/${teacher.id}`} style={{ textDecoration: "none" }}>
                  <h3 className={styles.name} style={{ color: "var(--white)", transition: "color 0.2s" }}>{displayName}</h3>
                </Link>
                <p className={styles.email}>{displayEmail}</p>
                
                <div className={styles.infoRow}>
                  <BookOpen size={16} className={styles.infoIcon} />
                  <span>{teacher.specialty || t("noSubject")}</span>
                </div>
                <div className={styles.infoRow}>
                  <User size={16} className={styles.infoIcon} />
                  <span>{teacher.groups?.length || teacher.activeGroups || 0} {t("activeGroups")}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Yeni Müəllim Əlavə Et</h2>
            <form onSubmit={createTeacher} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Ad və Soyad</label>
                <input required type="text" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} placeholder="Məs: Əli Əliyev" />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input required type="email" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} placeholder="ornek@thrive.az" />
              </div>
              <div className={styles.inputGroup}>
                <label>Şifrə</label>
                <input 
                  required 
                  type="password" 
                  value={newTeacher.password} 
                  onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} 
                  placeholder="••••••••" 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Fənn / İxtisas</label>
                <input type="text" value={newTeacher.specialty} onChange={e => setNewTeacher({...newTeacher, specialty: e.target.value})} placeholder="Məs: İngilis Dili" />
              </div>
              <div className={styles.inputGroup}>
                <label>Qruplar</label>
                <select 
                  value={newTeacher.groupIds[0] || ""} 
                  onChange={e => {
                    const val = e.target.value;
                    setNewTeacher({ ...newTeacher, groupIds: val ? [val] : [] });
                  }}
                >
                  <option value="">Qrup təyin et (İstəyə bağlı)</option>
                  {availableGroups.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.program || "Ümumi"})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Ləğv et</button>
                <button type="submit" className={styles.saveBtn}>Əlavə Et</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
