"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, Phone, Calendar, Mail, MoreVertical, Search, Edit2, Trash2, X, Check, Users, User, BookOpen, Layers } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  programs?: string[] | null;
  lesson_type?: string | null;
  source?: string | null;
  status: string;
  notes?: string | null;
  nextFollowUp?: string | null;
  created_at?: string;
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
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'super_admin' || session?.user?.role === 'admin' || session?.user?.role === 'sales';
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Form State with all 7 fields
  const initialForm = {
    name: "",
    phone: "",
    parent_name: "",
    parent_phone: "",
    programs: [] as string[],
    lesson_type: "group",
    source: "Instagram",
    notes: ""
  };
  const [formData, setFormData] = useState(initialForm);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);


  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } else {
        toast.error(t("errors.loadFailed") || "Lead-ləri yükləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        setProgramsList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("fetchPrograms error:", e);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchPrograms();
  }, []);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;
    
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(t("toasts.statusUpdated") || "Status yeniləndi");
    } catch (error) {
      toast.error("Statusu dəyişmək mümkün olmadı");
      fetchLeads();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const deleteLead = async (id: string) => {
    if (!confirm(c("confirmDelete") || "Silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        toast.success(t("toasts.deletedSuccess") || "Lead silindi");
      } else {
        toast.error(c("errorDelete") || "Silinmə zamanı xəta baş verdi");
      }
    } catch {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta");
    }
  };

  const toggleProgramSelection = (programName: string) => {
    setFormData(prev => {
      const exists = prev.programs.includes(programName);
      return {
        ...prev,
        programs: exists 
          ? prev.programs.filter(p => p !== programName)
          : [...prev.programs, programName]
      };
    });
  };

  const openCreateModal = () => {
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || "",
      phone: lead.phone || "",
      parent_name: lead.parent_name || "",
      parent_phone: lead.parent_phone || "",
      programs: Array.isArray(lead.programs) ? lead.programs : [],
      lesson_type: lead.lesson_type || "group",
      source: lead.source || "Instagram",
      notes: lead.notes || ""
    });
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      return toast.error(t("toasts.reqFields") || "Zəhmət olmasa tələbənin adı və nömrəsini daxil edin");
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const created = await res.json();
        setLeads([created, ...leads]);
        setShowModal(false);
        setFormData(initialForm);
        toast.success(t("toasts.createdSuccess") || "Lead uğurla əlavə edildi!");
      } else {
        toast.error("Lead əlavə edilərkən xəta baş verdi");
      }
    } catch (error) {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta baş verdi");
    }
  };

  const updateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      return toast.error(t("toasts.reqFields") || "Zəhmət olmasa tələbənin adı və nömrəsini daxil edin");
    }

    try {
      const res = await fetch(`/api/leads/${editingLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        setShowEditModal(false);
        setEditingLead(null);
        toast.success(t("toasts.updatedSuccess") || "Lead uğurla yeniləndi!");
      } else {
        toast.error(c("errors.unexpected") || "Yenilənmə xətası");
      }
    } catch {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta");
    }
  };

  const searchTerm = search.trim().toLowerCase();
  const matchesSearch = (lead: Lead) => {
    if (!searchTerm) return true;
    const nameMatch = lead.name ? lead.name.toLowerCase().includes(searchTerm) : false;
    const phoneMatch = lead.phone ? lead.phone.toLowerCase().includes(searchTerm) : false;
    const parentMatch = lead.parent_name ? lead.parent_name.toLowerCase().includes(searchTerm) : false;
    const parentPhoneMatch = lead.parent_phone ? lead.parent_phone.toLowerCase().includes(searchTerm) : false;
    const sourceMatch = lead.source ? lead.source.toLowerCase().includes(searchTerm) : false;
    const progMatch = Array.isArray(lead.programs) && lead.programs.some(p => p.toLowerCase().includes(searchTerm));
    return nameMatch || phoneMatch || parentMatch || parentPhoneMatch || sourceMatch || progMatch;
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
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.id && matchesSearch(l));
          return (
            <div 
              key={col.id} 
              className={styles.column}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
            >
              <div className={styles.columnHeader}>
                <div className={styles.colIndicator} style={{ backgroundColor: col.color }}></div>
                <h3>{t(`statuses.${col.id}`)}</h3>
                <span className={styles.count}>{colLeads.length}</span>
              </div>
              
              <div className={styles.columnBody}>
                {loading ? (
                  <div className={styles.loading}>{c("loading") || "Yüklənir..."}</div>
                ) : colLeads.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "1rem" }}>
                    Lead yoxdur
                  </p>
                ) : (
                  colLeads.map(lead => {
                    const programs = Array.isArray(lead.programs) ? lead.programs : [];
                    const isIndividual = lead.lesson_type === "individual";

                    return (
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
                          <div className={styles.cardBadgeRow}>
                            <span className={styles.sourceBadge}>{lead.source || "Digər"}</span>
                            <span className={`${styles.lessonTypeBadge} ${isIndividual ? styles.lessonTypeBadgeIndividual : ""}`}>
                              {isIndividual ? "👤 Fərdi" : "👥 Qrup"}
                            </span>
                          </div>

                          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                            <button 
                              className={styles.moreBtn} 
                              onClick={() => setActiveMenuId(activeMenuId === lead.id ? null : lead.id)}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeMenuId === lead.id && (
                              <div className={styles.dropdownMenu} style={{ position: "absolute", right: 0, top: "24px", background: "#1e293b", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 50, padding: "4px", minWidth: "120px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <button onClick={() => openEditModal(lead)} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", color: "#fff", fontSize: "0.85rem" }}>
                                  <Edit2 size={14} /> Redaktə Et
                                </button>
                                <button onClick={() => { deleteLead(lead.id); setActiveMenuId(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", fontSize: "0.85rem" }}>
                                  <Trash2 size={14} /> Sil
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 className={styles.leadName}>{lead.name}</h4>
                        
                        <div className={styles.cardInfo}>
                          <span className={styles.infoRow}><Phone size={13} /> {lead.phone}</span>
                          
                          {lead.parent_name && (
                            <span className={styles.cardParentRow} title={`Valideyn: ${lead.parent_name}`}>
                              <User size={13} /> {lead.parent_name} {lead.parent_phone ? `(${lead.parent_phone})` : ""}
                            </span>
                          )}

                          {programs.length > 0 && (
                            <div className={styles.cardProgramsList}>
                              {programs.map((pName, idx) => (
                                <span key={idx} className={styles.cardProgramTag}>
                                  {pName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.modalLarge}`} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>{t("addLeadTitle") || "Yeni Lead Əlavə Et"}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>

            <form onSubmit={createLead} className={styles.form}>
              <div className={styles.modalScrollArea}>
                {/* 1. Student Information */}
                <div className={styles.sectionHeading}>
                  <User size={16} /> {t("sections.student") || "🎓 Tələbə Məlumatları"}
                </div>
                <div className={styles.formGrid2}>
                  <div className={styles.inputGroup}>
                    <label>{t("form.studentNameLabel") || "Tələbənin Adı və Soyadı *"}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder={t("form.studentNamePlaceholder") || "Məs: Əli Əliyev"} 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t("form.studentPhoneLabel") || "Tələbənin Əlaqə Nömrəsi *"}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      placeholder={t("form.studentPhonePlaceholder") || "+994 XX XXX XX XX"} 
                    />
                  </div>
                </div>

                {/* 2. Parent Information */}
                <div className={styles.sectionHeading}>
                  <Users size={16} /> {t("sections.parent") || "👨‍👩‍👦 Valideyn Məlumatları"}
                </div>
                <div className={styles.formGrid2}>
                  <div className={styles.inputGroup}>
                    <label>{t("form.parentNameLabel") || "Valideynin Adı və Soyadı"}</label>
                    <input 
                      type="text" 
                      value={formData.parent_name} 
                      onChange={e => setFormData({...formData, parent_name: e.target.value})} 
                      placeholder={t("form.parentNamePlaceholder") || "Məs: Vəli Əliyev"} 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t("form.parentPhoneLabel") || "Valideynin Əlaqə Nömrəsi"}</label>
                    <input 
                      type="text" 
                      value={formData.parent_phone} 
                      onChange={e => setFormData({...formData, parent_phone: e.target.value})} 
                      placeholder={t("form.parentPhonePlaceholder") || "+994 XX XXX XX XX"} 
                    />
                  </div>
                </div>

                {/* 3. Academic & Programs */}
                <div className={styles.sectionHeading}>
                  <BookOpen size={16} /> {t("sections.academic") || "📚 Tədris və Proqram Seçimi"}
                </div>
                
                <div className={styles.inputGroup}>
                  <label>{t("form.lessonTypeLabel") || "Tədris Formatı"}</label>
                  <div className={styles.lessonTypeContainer}>
                    <button
                      type="button"
                      className={`${styles.lessonTypeBtn} ${formData.lesson_type === 'group' ? styles.lessonTypeActive : ''}`}
                      onClick={() => setFormData({...formData, lesson_type: 'group'})}
                    >
                      <Users size={15} /> 👥 Qrup
                    </button>
                    <button
                      type="button"
                      className={`${styles.lessonTypeBtn} ${formData.lesson_type === 'individual' ? styles.lessonTypeActive : ''}`}
                      onClick={() => setFormData({...formData, lesson_type: 'individual'})}
                    >
                      <User size={15} /> 👤 Fərdi
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("form.programsLabel") || "Yazıldığı Proqram / Proqramlar (1+ seçim)"}</label>
                  <div className={styles.programChipsContainer}>
                    {programsList.map(prog => {
                      const isSelected = formData.programs.includes(prog.name);
                      return (
                        <div
                          key={prog.id}
                          className={`${styles.programChip} ${isSelected ? styles.programChipActive : ''}`}
                          onClick={() => toggleProgramSelection(prog.name)}
                        >
                          <span>{prog.name}</span>
                          {isSelected && <Check size={13} color="var(--aqua-teal, #00C4B5)" />}
                        </div>
                      );
                    })}
                    {programsList.length === 0 && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "0.4rem" }}>
                        Heç bir proqram tapılmadı
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Source & Notes */}
                <div className={styles.sectionHeading}>
                  <Layers size={16} /> {t("sections.other") || "🌐 Mənbə və Digər"}
                </div>
                <div className={styles.formGrid2}>
                  <div className={styles.inputGroup}>
                    <label>{t("form.sourceLabel") || "Mənbə (Haradan gəlib)"}</label>
                    <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="TikTok">TikTok</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Dost / Tanış Tövsiyəsi">Dost / Tanış Tövsiyəsi</option>
                      <option value="Vebsayt">Vebsayt</option>
                      <option value="Zəng / Müraciət">Zəng / Müraciət</option>
                      <option value="Digər">Digər</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t("form.notesLabel") || "Əlavə Qeydlər"}</label>
                    <input 
                      type="text" 
                      value={formData.notes} 
                      onChange={e => setFormData({...formData, notes: e.target.value})} 
                      placeholder={t("form.notesPlaceholder") || "Qeyd..."} 
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>{c("cancel") || "Ləğv et"}</button>
                <button type="submit" className={styles.saveBtn}>{c("save") || "Yadda saxla"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={`${styles.modal} ${styles.modalLarge}`} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>{t("editLeadTitle") || "Leadi Redaktə Et"}</h2>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}><X size={20}/></button>
            </div>

            <form onSubmit={updateLead} className={styles.form}>
              <div className={styles.modalScrollArea}>
                {/* 1. Student Information */}
                <div className={styles.sectionHeading}>
                  <User size={16} /> {t("sections.student") || "🎓 Tələbə Məlumatları"}
                </div>
                <div className={styles.formGrid2}>
                  <div className={styles.inputGroup}>
                    <label>{t("form.studentNameLabel") || "Tələbənin Adı və Soyadı *"}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t("form.studentPhoneLabel") || "Tələbənin Əlaqə Nömrəsi *"}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>

                {/* 2. Parent Information */}
                <div className={styles.sectionHeading}>
                  <Users size={16} /> {t("sections.parent") || "👨‍👩‍👦 Valideyn Məlumatları"}
                </div>
                <div className={styles.formGrid2}>
                  <div className={styles.inputGroup}>
                    <label>{t("form.parentNameLabel") || "Valideynin Adı və Soyadı"}</label>
                    <input 
                      type="text" 
                      value={formData.parent_name} 
                      onChange={e => setFormData({...formData, parent_name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t("form.parentPhoneLabel") || "Valideynin Əlaqə Nömrəsi"}</label>
                    <input 
                      type="text" 
                      value={formData.parent_phone} 
                      onChange={e => setFormData({...formData, parent_phone: e.target.value})} 
                    />
                  </div>
                </div>

                {/* 3. Academic & Programs */}
                <div className={styles.sectionHeading}>
                  <BookOpen size={16} /> {t("sections.academic") || "📚 Tədris və Proqram Seçimi"}
                </div>
                
                <div className={styles.inputGroup}>
                  <label>{t("form.lessonTypeLabel") || "Tədris Formatı"}</label>
                  <div className={styles.lessonTypeContainer}>
                    <button
                      type="button"
                      className={`${styles.lessonTypeBtn} ${formData.lesson_type === 'group' ? styles.lessonTypeActive : ''}`}
                      onClick={() => setFormData({...formData, lesson_type: 'group'})}
                    >
                      <Users size={15} /> 👥 Qrup
                    </button>
                    <button
                      type="button"
                      className={`${styles.lessonTypeBtn} ${formData.lesson_type === 'individual' ? styles.lessonTypeActive : ''}`}
                      onClick={() => setFormData({...formData, lesson_type: 'individual'})}
                    >
                      <User size={15} /> 👤 Fərdi
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("form.programsLabel") || "Yazıldığı Proqram / Proqramlar (1+ seçim)"}</label>
                  <div className={styles.programChipsContainer}>
                    {programsList.map(prog => {
                      const isSelected = formData.programs.includes(prog.name);
                      return (
                        <div
                          key={prog.id}
                          className={`${styles.programChip} ${isSelected ? styles.programChipActive : ''}`}
                          onClick={() => toggleProgramSelection(prog.name)}
                        >
                          <span>{prog.name}</span>
                          {isSelected && <Check size={13} color="var(--aqua-teal, #00C4B5)" />}
                        </div>
                      );
                    })}
                    {programsList.length === 0 && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "0.4rem" }}>
                        Heç bir proqram tapılmadı
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Source & Notes */}
                <div className={styles.sectionHeading}>
                  <Layers size={16} /> {t("sections.other") || "🌐 Mənbə və Digər"}
                </div>
                <div className={styles.formGrid2}>
                  <div className={styles.inputGroup}>
                    <label>{t("form.sourceLabel") || "Mənbə (Haradan gəlib)"}</label>
                    <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="TikTok">TikTok</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Dost / Tanış Tövsiyəsi">Dost / Tanış Tövsiyəsi</option>
                      <option value="Vebsayt">Vebsayt</option>
                      <option value="Zəng / Müraciət">Zəng / Müraciət</option>
                      <option value="Digər">Digər</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t("form.notesLabel") || "Əlavə Qeydlər"}</label>
                    <input 
                      type="text" 
                      value={formData.notes} 
                      onChange={e => setFormData({...formData, notes: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>{c("cancel") || "Ləğv et"}</button>
                <button type="submit" className={styles.saveBtn}>{c("save") || "Yadda saxla"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Detail Modal */}
      {viewingLead && (
        <div className={styles.modalOverlay} onClick={() => setViewingLead(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("detail.title") || "Lead Detalları"}</h2>
              <button className={styles.closeBtn} onClick={() => setViewingLead(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.detailBody}>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>🎓 Tələbənin Adı Soyadı</span>
                  <span className={styles.detailValue} style={{ fontSize: "1.1rem", fontWeight: 600 }}>{viewingLead.name}</span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>📞 Tələbənin Nömrəsi</span>
                  <span className={styles.detailValue}>{viewingLead.phone}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>👨‍👩‍👦 Valideynin Adı Soyadı</span>
                  <span className={styles.detailValue}>{viewingLead.parent_name || "Qeyd edilməyib"}</span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>📞 Valideynin Nömrəsi</span>
                  <span className={styles.detailValue}>{viewingLead.parent_phone || "Qeyd edilməyib"}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>📚 Tədris Formatı</span>
                  <span className={styles.detailValue}>
                    {viewingLead.lesson_type === 'individual' ? "👤 Fərdi" : "👥 Qrup"}
                  </span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>🌐 Mənbə</span>
                  <span className={styles.detailValue}>{viewingLead.source || "Digər"}</span>
                </div>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>📖 Yazıldığı Proqramlar</span>
                <div className={styles.cardProgramsList} style={{ marginTop: "0.25rem" }}>
                  {Array.isArray(viewingLead.programs) && viewingLead.programs.length > 0 ? (
                    viewingLead.programs.map((pName, idx) => (
                      <span key={idx} className={styles.cardProgramTag} style={{ fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}>
                        {pName}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Proqram seçilməyib</span>
                  )}
                </div>
              </div>

              {viewingLead.notes && (
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>📝 Qeydlər</span>
                  <span className={styles.detailValue}>{viewingLead.notes}</span>
                </div>
              )}

              <div className={styles.modalActions} style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    const l = viewingLead;
                    setViewingLead(null);
                    openEditModal(l);
                  }}
                >
                  <Edit2 size={14} style={{ marginRight: 6 }} /> Redaktə Et
                </button>
                <button type="button" className={styles.saveBtn} onClick={() => setViewingLead(null)}>
                  {c("close") || "Bağla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
