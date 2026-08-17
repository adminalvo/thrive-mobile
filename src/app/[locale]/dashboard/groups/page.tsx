"use client";

import { useState, useEffect } from "react";
import styles from "../students/page.module.css";
import { Plus, Search, Filter, MoreHorizontal, Component, Trash2, Edit, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function GroupsPage() {
  const t = useTranslations("Groups");
  const c = useTranslations("Common");
  const tp = useTranslations("Programs");
  
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", program_id: "", teacher_id: "", room: "" });
  const [submitting, setSubmitting] = useState(false);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [programs, setPrograms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchProgramsAndTeachers();
  }, []);

  const fetchProgramsAndTeachers = async () => {
    try {
      const [progRes, teachRes] = await Promise.all([
        fetch("/api/programs"),
        fetch("/api/teachers")
      ]);
      if (progRes.ok) setPrograms(await progRes.json());
      if (teachRes.ok) setTeachers(await teachRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Qrup uğurla yaradıldı!");
        setShowModal(false);
        setFormData({ name: "", program_id: "", teacher_id: "", room: "" });
        fetchGroups();
      } else {
        toast.error("Xəta baş verdi");
      }
    } catch (error) {
      toast.error("Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu qrupu silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi");
        fetchGroups();
      } else {
        toast.error("Silinmədi");
      }
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
    setActiveMenu(null);
  };

  const filteredGroups = groups.filter(g => 
    (g.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (g.program || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          {t("newGroup")}
        </button>
      </motion.div>

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
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("table.name")}</th>
              <th>{t("table.program")}</th>
              <th>{t("table.teacher")}</th>
              <th>{t("table.room")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>{c("loading")}</td>
              </tr>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((g) => (
                <tr key={g.id}>
                  <td>
                    <Link href={`/dashboard/groups/${g.id}`} style={{ textDecoration: "none" }}>
                      <div className={styles.studentInfo}>
                        <div className={styles.avatar} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                          <Component size={18} />
                        </div>
                        <div>
                          <div className={styles.name} style={{ color: "var(--white)", transition: "color 0.2s" }}>{g.name}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>{g.program}</td>
                  <td>{g.teacher}</td>
                  <td>{g.room}</td>
                  <td>
                    <div className={styles.inlineActions}>
                      <Link href={`/dashboard/groups/${g.id}`} style={{ textDecoration: "none" }}>
                        <button className={styles.iconBtn} title="Profilə bax" style={{ color: "var(--aqua-teal)" }}>
                          <Component size={16} />
                        </button>
                      </Link>
                      <button className={styles.iconBtn} onClick={() => handleDelete(g.id)} title="Sil" style={{ color: "var(--danger-color)" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>{c("empty")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal}
            >
              <div className={styles.modalHeader}>
                <h2>{t("newGroup")}</h2>
                <button type="button" className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Qrup Adı</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Otaq (Room)</label>
                    <input 
                      type="text" 
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Proqram</label>
                    <select 
                      required
                      value={formData.program_id}
                      onChange={(e) => setFormData({...formData, program_id: e.target.value})}
                    >
                      <option value="">Seçin...</option>
                      {programs.map(p => {
                        let translatedName = p.name;
                        try { translatedName = tp(p.name); } catch(e) {}
                        return <option key={p.id} value={p.id}>{translatedName}</option>;
                      })}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Məsul Müəllim</label>
                    <select 
                      value={formData.teacher_id}
                      onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    >
                      <option value="">Seçin...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    {c("cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={submitting}>
                    {submitting ? c("saving") : c("save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
