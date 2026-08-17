"use client";

import { useState, useEffect } from "react";
import styles from "../students/page.module.css";
import { Plus, Search, Filter, MoreHorizontal, UserPlus, Trash2, X, Users, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function ParentsPage() {
  const t = useTranslations("Parents");
  const c = useTranslations("Common");
  
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    first_name: "", last_name: "", email: "", phone: "", fin_code: "", id_card_number: "", password: "" 
  });
  const [submitting, setSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: "", fin_code: "", id_card_number: "" });

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");

  const fetchAllStudents = async () => {
    const res = await fetch("/api/students");
    if(res.ok) {
      const data = await res.json();
      setAllStudents(data);
    }
  };

  const fetchLinkedStudents = async (parentId: string) => {
    const res = await fetch(`/api/parents/${parentId}/students`);
    if(res.ok) {
      const data = await res.json();
      setLinkedStudents(data);
    }
  };

  const openStudentsModal = (parentId: string) => {
    setSelectedParentId(parentId);
    fetchAllStudents();
    fetchLinkedStudents(parentId);
    setShowStudentsModal(true);
  };

  const linkStudent = async () => {
    if(!selectedStudentToAdd || !selectedParentId) return;
    try {
      const res = await fetch(`/api/parents/${selectedParentId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: selectedStudentToAdd })
      });
      if(res.ok) {
        toast.success("Tələbə uğurla əlavə edildi");
        fetchLinkedStudents(selectedParentId);
        setSelectedStudentToAdd("");
      } else toast.error("Xəta baş verdi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const unlinkStudent = async (studentId: string) => {
    if(!selectedParentId) return;
    try {
      const res = await fetch(`/api/parents/${selectedParentId}/students?student_id=${studentId}`, {
        method: "DELETE"
      });
      if(res.ok) {
        toast.success("Tələbə silindi");
        fetchLinkedStudents(selectedParentId);
      } else toast.error("Xəta baş verdi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };


  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const res = await fetch("/api/parents");
      if (res.ok) {
        const data = await res.json();
        setParents(data);
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
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Valideyn uğurla yaradıldı!");
        setShowModal(false);
        setFormData({ first_name: "", last_name: "", email: "", phone: "", fin_code: "", id_card_number: "", password: "" });
        fetchParents();
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
    if (!confirm("Bu valideyni silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/parents/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi");
        fetchParents();
      } else {
        toast.error("Silinmədi");
      }
    } catch (e) {
      toast.error("Xəta baş verdi");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/parents/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fin_code: editData.fin_code,
          id_card_number: editData.id_card_number
        })
      });
      if (res.ok) {
        toast.success("Valideyn məlumatları yeniləndi!");
        setShowEditModal(false);
        fetchParents();
      } else {
        toast.error("Xəta baş verdi");
      }
    } catch (error) {
      toast.error("Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParents = parents.filter(p => 
    (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (p.contact || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.fin || "").toLowerCase().includes(search.toLowerCase())
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
              <th>{t("table.contact")}</th>
              <th>{t("table.fin")}</th>
              <th>{t("table.idCard")}</th>
              <th>{c("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>{c("loading")}</td>
              </tr>
            ) : filteredParents.length > 0 ? (
              filteredParents.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.studentInfo}>
                      <div className={styles.avatar} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <UserPlus size={18} />
                      </div>
                      <div>
                        <div className={styles.name}>{p.name}</div>
                        <div className={styles.email}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.contact}</td>
                  <td>{p.fin}</td>
                  <td>{p.idCard}</td>
                  <td>
                    <div className={styles.actionMenu}>
                      <button className={styles.iconBtn} onClick={() => {
                        setEditData({ id: p.id, fin_code: p.fin, id_card_number: p.idCard });
                        setShowEditModal(true);
                      }} title="Redaktə et" style={{ color: "var(--aqua-teal)", marginRight: 8 }}>
                        <Edit size={16} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleDelete(p.id)} title="Sil" style={{ color: "var(--danger-color)" }}>
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
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal}
            >
              <div className={styles.modalHeader}>
                <h2>Valideyni Redaktə Et</h2>
                <button type="button" className={styles.closeModalBtn} onClick={() => setShowEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>FİN Kod</label>
                    <input 
                      type="text" 
                      value={editData.fin_code}
                      onChange={(e) => setEditData({...editData, fin_code: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Vəsiqənin Seriya No</label>
                    <input 
                      type="text" 
                      value={editData.id_card_number}
                      onChange={(e) => setEditData({...editData, id_card_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                    Ləğv et
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={submitting}>
                    {submitting ? "Yadda saxlanılır..." : "Yadda saxla"}
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
