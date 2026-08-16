"use client";

import { useState, useEffect } from "react";
import styles from "../students/page.module.css";
import { Plus, Search, Filter, MoreHorizontal, Library, Trash2, Edit, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function ProgramsPage() {
  const c = useTranslations("Common");
  const tp = useTranslations("Programs");
  
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
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
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(tp("successAdd"));
        setShowModal(false);
        setFormData({ name: "" });
        fetchPrograms();
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
    if (!confirm(tp("deleteConfirm"))) return;
    try {
      // NOTE: the DELETE endpoint for /api/programs/[id] might need to be created if not exists
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(tp("successDelete"));
        fetchPrograms();
      } else {
        toast.error("Silinmədi");
      }
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
    setActiveMenu(null);
  };

  const filteredPrograms = programs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Library size={24} className={styles.iconAccent} />
          </div>
          <div>
            <h1 className={styles.title}>{tp("title")}</h1>
            <p className={styles.subtitle}>{tp("subtitle")}</p>
          </div>
        </div>
        
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          {c("add")}
        </button>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={c("search")} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={18} />
          {c("filter")}
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>{c("loading")}</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Adı</th>
                <th style={{ width: "100px", textAlign: "right" }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((prog, idx) => (
                  <motion.tr 
                    key={prog.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                          <Library size={16} />
                        </div>
                        <div>
                          <p className={styles.userName}>{prog.name}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", position: "relative" }}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => setActiveMenu(activeMenu === prog.id ? null : prog.id)}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === prog.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={styles.dropdownMenu}
                          >
                            <button className={styles.dropdownItem} onClick={() => alert("Redaktə (TBD)")}>
                              <Edit size={16} /> Redaktə
                            </button>
                            <button className={`${styles.dropdownItem} ${styles.dangerItem}`} onClick={() => handleDelete(prog.id)}>
                              <Trash2 size={16} /> Sil
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className={styles.emptyState}>
                    <Library size={48} className={styles.emptyIcon} />
                    <p>{tp("emptyState")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modal}
            >
              <div className={styles.modalHeader}>
                <h2>{tp("addProgram")}</h2>
                <button className={styles.closeModal} onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>{tp("programName")}</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={tp("programNamePlaceholder")}
                  />
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
