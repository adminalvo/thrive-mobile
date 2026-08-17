"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Phone, Calendar, Mail, MoreVertical, Search, Edit2, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  nextFollowUp: string | null;
};

const COLUMNS = [
  { id: "NEW", color: "#3b82f6" },
  { id: "CONTACTED", color: "#f59e0b" },
  { id: "TRIAL", color: "#8b5cf6" },
  { id: "REGISTERED", color: "#10b981" },
  { id: "LOST", color: "#ef4444" }
];

export default function LeadsPage() {
  const t = useTranslations("Leads");
  const c = useTranslations("Common");
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", source: "Instagram" });
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'super_admin';
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);


  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        toast.error(t("errors.loadFailed"));
      }
    } catch (error) {
      toast.error(t("errors.unexpected"));
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    // API Call
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      toast.error("Statusu dəyişmək mümkün olmadı");
      fetchLeads(); // Revert on failure
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const deleteLead = async (id: string) => {
    if (!confirm(t("confirmDelete") || "Silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        toast.success("Uğurla silindi");
      } else toast.error("Silinmə zamanı xəta baş verdi");
    } catch {
      toast.error("Gözlənilməz xəta");
    }
  };

  const updateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const res = await fetch(`/api/leads/${editingLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLead)
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        setShowEditModal(false);
        toast.success("Uğurla yeniləndi!");
      } else toast.error("Yenilənmə xətası");
    } catch {
      toast.error("Gözlənilməz xəta");
    }
  };

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
      if (res.ok) {
        const created = await res.json();
        setLeads([created, ...leads]);
        setShowModal(false);
        setNewLead({ name: "", phone: "", source: "Instagram" });
        toast.success("Müştəri uğurla əlavə edildi!");
      } else {
        toast.error("Müştəri əlavə edilərkən xəta baş verdi");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const searchTerm = search.trim().toLowerCase();
  const matchesSearch = (lead: Lead) => {
    if (!searchTerm) return true;
    const nameMatch = lead.name ? lead.name.toLowerCase().includes(searchTerm) : false;
    const phoneMatch = lead.phone ? lead.phone.toLowerCase().includes(searchTerm) : false;
    const sourceMatch = lead.source ? lead.source.toLowerCase().includes(searchTerm) : false;
    return nameMatch || phoneMatch || sourceMatch;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        {isSuperAdmin && <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t("newLead")}
        </button>}
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
      </div>

      <div className={styles.kanbanBoard}>
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className={styles.column}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <div className={styles.columnHeader}>
              <div className={styles.colIndicator} style={{ backgroundColor: col.color }}></div>
              <h3>{t(`statuses.${col.id}`)}</h3>
              <span className={styles.count}>
                {leads.filter(l => l.status === col.id && matchesSearch(l)).length}
              </span>
            </div>
            
            <div className={styles.columnBody}>
              {loading ? (
                <div className={styles.loading}>{t("loading")}</div>
              ) : (
                leads.filter(l => l.status === col.id && matchesSearch(l)).map(lead => (
                  <motion.div 
                    layout
                    key={lead.id}
                    draggable={isSuperAdmin}
                    onDragStart={(e: any) => handleDragStart(e, lead.id)}
                    className={styles.card}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setViewingLead(lead)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.sourceBadge}>{lead.source || "Digər"}</span>
                      {isSuperAdmin && (
                        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                          <button 
                            className={styles.moreBtn} 
                            onClick={() => setActiveMenuId(activeMenuId === lead.id ? null : lead.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenuId === lead.id && (
                            <div className={styles.dropdownMenu} style={{ position: "absolute", right: 0, top: "24px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, padding: "4px", minWidth: "120px" }}>
                              <button onClick={() => { setEditingLead(lead); setShowEditModal(true); setActiveMenuId(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", color: "#374151" }}>
                                <Edit2 size={14} /> Redaktə Et
                              </button>
                              <button onClick={() => { deleteLead(lead.id); setActiveMenuId(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", color: "#ef4444" }}>
                                <Trash2 size={14} /> Sil
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <h4 className={styles.leadName}>{lead.name}</h4>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoRow}><Phone size={14} /> {lead.phone}</span>
                      {lead.nextFollowUp && (
                        <span className={styles.infoRow}><Calendar size={14} /> {lead?.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : "Təyin edilməyib"}</span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Müştərini Redaktə Et</h2>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={updateLead} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{t("form.nameLabel")}</label>
                <input required type="text" value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>{t("form.phoneLabel")}</label>
                <input required type="text" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>{t("form.sourceLabel")}</label>
                <select value={editingLead.source || "Digər"} onChange={e => setEditingLead({...editingLead, source: e.target.value})}>
                  <option value="Instagram">{t("form.sources.instagram")}</option>
                  <option value="Facebook">{t("form.sources.facebook")}</option>
                  <option value="Zəng">{t("form.sources.call")}</option>
                  <option value="Dost Tövsiyəsi">{t("form.sources.referral")}</option>
                  <option value="Digər">{t("form.sources.other")}</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>{c("cancel")}</button>
                <button type="submit" className={styles.saveBtn}>{c("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{t("addLeadTitle")}</h2>
            <form onSubmit={createLead} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{t("form.nameLabel")}</label>
                <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder={t("form.namePlaceholder")} />
              </div>
              <div className={styles.inputGroup}>
                <label>{t("form.phoneLabel")}</label>
                <input required type="text" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder={t("form.phonePlaceholder")} />
              </div>
              <div className={styles.inputGroup}>
                <label>{t("form.sourceLabel")}</label>
                <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                  <option value="Instagram">{t("form.sources.instagram")}</option>
                  <option value="Facebook">{t("form.sources.facebook")}</option>
                  <option value="Zəng">{t("form.sources.call")}</option>
                  <option value="Dost Tövsiyəsi">{t("form.sources.referral")}</option>
                  <option value="Digər">{t("form.sources.other")}</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>{c("cancel")}</button>
                <button type="submit" className={styles.saveBtn}>{c("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {viewingLead && (
        <div className={styles.modalOverlay} onClick={() => setViewingLead(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("detail.title") || "Detallı Baxış"}</h2>
              <button className={styles.closeBtn} onClick={() => setViewingLead(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{t("detail.name") || "Ad/Soyad"}</span>
                <span className={styles.detailValue} style={{ fontSize: "1.1rem", fontWeight: 500 }}>{viewingLead.name}</span>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.phone") || "Telefon"}</span>
                  <span className={styles.detailValue}>{viewingLead.phone}</span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.email") || "Email"}</span>
                  <span className={styles.detailValue}>{viewingLead.email || t("detail.none")}</span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.status") || "Status"}</span>
                  <span className={styles.detailValue}>{t(`statuses.${viewingLead.status}`)}</span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.source") || "Mənbə"}</span>
                  <span className={styles.detailValue}>{viewingLead.source || t("detail.none")}</span>
                </div>
              </div>
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{t("detail.notes") || "Qeydlər"}</span>
                <span className={styles.detailValue}>{viewingLead.notes || t("detail.none")}</span>
              </div>
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{t("detail.nextFollowUp") || "Növbəti əlaqə"}</span>
                <span className={styles.detailValue}>{viewingLead.nextFollowUp ? new Date(viewingLead.nextFollowUp).toLocaleDateString() : t("detail.none")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
