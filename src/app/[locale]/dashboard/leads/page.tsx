"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Phone, Calendar, Mail, MoreVertical, Search } from "lucide-react";
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
  { id: "NEW", title: "Yeni", color: "#3b82f6" },
  { id: "CONTACTED", title: "Əlaqə Quruldu", color: "#f59e0b" },
  { id: "TRIAL", title: "Sınaq Dərsi", color: "#8b5cf6" },
  { id: "REGISTERED", title: "Qeydiyyat", color: "#10b981" },
  { id: "LOST", title: "İtirilmiş", color: "#ef4444" }
];

export default function LeadsPage() {
  const t = useTranslations("Leads");
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", source: "Instagram" });
  const [search, setSearch] = useState("");

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
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t("newLead")}
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
              <h3>{col.title}</h3>
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
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, lead.id)}
                    className={styles.card}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.sourceBadge}>{lead.source || "Digər"}</span>
                      <button className={styles.moreBtn}><MoreVertical size={16} /></button>
                    </div>
                    <h4 className={styles.leadName}>{lead.name}</h4>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoRow}><Phone size={14} /> {lead.phone}</span>
                      {lead.nextFollowUp && (
                        <span className={styles.infoRow}><Calendar size={14} /> {new Date(lead.nextFollowUp).toLocaleDateString()}</span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{t("addLeadTitle")}</h2>
            <form onSubmit={createLead} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Ad və Soyad</label>
                <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Məs: Aysel Məmmədova" />
              </div>
              <div className={styles.inputGroup}>
                <label>Telefon</label>
                <input required type="text" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="Məs: +994501234567" />
              </div>
              <div className={styles.inputGroup}>
                <label>Mənbə (Haradan gəlib?)</label>
                <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Zəng">Zəng</option>
                  <option value="Dost Tövsiyəsi">Dost Tövsiyəsi</option>
                  <option value="Digər">Digər</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Ləğv et</button>
                <button type="submit" className={styles.saveBtn}>Yadda Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
