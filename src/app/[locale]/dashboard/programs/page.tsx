"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Search, Filter, MoreHorizontal, Library, Trash2, Edit, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function ProgramsPage() {
  const tp = useTranslations("Programs");
  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const canEdit = ["super_admin", "staff", "admin", "sales"].includes(userRole);

  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", parent_id: "" });
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

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ id: "", name: "", parent_id: "" });
    setShowModal(true);
  };

  const openEditModal = (prog: any) => {
    setEditMode(true);
    setFormData({ id: prog.id, name: prog.name, parent_id: prog.parent_id || "" });
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editMode ? `/api/programs/${formData.id}` : "/api/programs";
      const method = editMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, parent_id: formData.parent_id || null })
      });
      
      if (res.ok) {
        toast.success(editMode ? tp("successEdit") : tp("successAdd"));
        setShowModal(false);
        setFormData({ id: "", name: "", parent_id: "" });
        fetchPrograms();
      } else {
        toast.error(tp("error"));
      }
    } catch (error) {
      toast.error(tp("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tp("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(tp("successDelete"));
        fetchPrograms();
      } else {
        toast.error(tp("error"));
      }
    } catch (error) {
      toast.error(tp("error"));
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
        
        {canEdit && (
          <button className={styles.addBtn} onClick={openAddModal}>
            <Plus size={18} />
            {tp("add")}
          </button>
        )}
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={tp("search")} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={18} />
          {tp("filter")}
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>{tp("loading")}</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{tp("name")}</th>
                {canEdit && <th style={{ width: "150px", textAlign: "right" }}>{tp("actions")}</th>}
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
                        <div className={styles.avatar} style={{ background: "rgba(76, 162, 181, 0.1)", color: "var(--aqua-teal)" }}>
                          <Library size={16} />
                        </div>
                        <div>
                          <p className={styles.userName}>{prog.name}</p>
                          {prog.parent_id && (
                            <p className={styles.parentName} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              Alt-kurs: {programs.find(p => p.id === prog.parent_id)?.name || "Bilinmir"}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {canEdit && (
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.inlineActions} style={{ justifyContent: "flex-end" }}>
                          <button className={styles.iconBtn} onClick={() => openEditModal(prog)} title={tp("edit")} style={{ color: "var(--aqua-teal)" }}>
                            <Edit size={16} />
                          </button>
                          <button className={styles.iconBtn} onClick={() => handleDelete(prog.id)} title={tp("delete")} style={{ color: "var(--danger-color)" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* Add / Edit Modal */}
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
                <h2>{editMode ? tp("editProgram") : tp("addProgram")}</h2>
                <button className={styles.closeModal} onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className={styles.modalForm}>
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
                
                <div className={styles.formGroup}>
                  <label>Ana Proqram (İstəyə bağlı)</label>
                  <select 
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "var(--white)" }}
                  >
                    <option value="" style={{ background: "#111827", color: "white" }}>Heç biri (Ana Proqram)</option>
                    {programs.filter(p => p.id !== formData.id && !p.parent_id).map(p => (
                      <option key={p.id} value={p.id} style={{ background: "#111827", color: "white" }}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    {tp("cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={submitting}>
                    {submitting ? tp("saving") : tp("save")}
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
