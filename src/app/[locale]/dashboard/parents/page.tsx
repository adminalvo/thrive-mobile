"use client";

import { useState, useEffect } from "react";
import styles from "../students/page.module.css";
import { Plus, Search, Filter, MoreHorizontal, UserPlus, Trash2, X } from "lucide-react";
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

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
    setActiveMenu(null);
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
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          {t("newParent")}
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
              <th>{t("table.contact")}</th>
              <th>{t("table.fin")}</th>
              <th>{t("table.idCard")}</th>
              <th></th>
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
                    <div style={{ position: "relative" }}>
                      <button className={styles.actionBtn} onClick={() => setActiveMenu(activeMenu === p.id ? null : p.id)}>
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === p.id && (
                        <div className={styles.actionMenu}>
                          <button onClick={() => handleDelete(p.id)} style={{ color: "var(--danger-color)" }}>
                            <Trash2 size={14} /> Sil
                          </button>
                        </div>
                      )}
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
                <h2>{t("newParent")}</h2>
                <button type="button" className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Ad</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Soyad</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Telefon</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>E-poçt</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>FİN Kod</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.fin_code}
                      onChange={(e) => setFormData({...formData, fin_code: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Vəsiqə Nömrəsi</label>
                    <input 
                      type="text" 
                      value={formData.id_card_number}
                      onChange={(e) => setFormData({...formData, id_card_number: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                    <label>Şifrə (Giriş üçün)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Şifrə təyin edin"
                    />
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
