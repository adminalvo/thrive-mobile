import fs from 'fs';
const file = 'src/app/[locale]/dashboard/leads/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add next-auth and new icons
content = content.replace('import { Plus, Phone, Calendar, Mail, MoreVertical, Search } from "lucide-react";', 
'import { Plus, Phone, Calendar, Mail, MoreVertical, Search, Edit2, Trash2, X } from "lucide-react";\nimport { useSession } from "next-auth/react";');

// 2. Add useSession and states
content = content.replace('const [search, setSearch] = useState("");', 
`const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'super_admin';
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);
`);

// 3. Add handleEdit and handleDelete
content = content.replace('const createLead = async (e: React.FormEvent) => {', 
`const deleteLead = async (id: string) => {
    if (!confirm(t("confirmDelete") || "Silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(\`/api/leads/\${id}\`, { method: "DELETE" });
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
      const res = await fetch(\`/api/leads/\${editingLead.id}\`, {
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

  const createLead = async (e: React.FormEvent) => {`);

// 4. Wrap Add Btn with isSuperAdmin check
content = content.replace('<button className={styles.addBtn} onClick={() => setShowModal(true)}>',
'{isSuperAdmin && <button className={styles.addBtn} onClick={() => setShowModal(true)}>');
content = content.replace('<Plus size={18} /> {t("newLead")}\n        </button>', 
'<Plus size={18} /> {t("newLead")}\n        </button>}');

// 5. Update draggable property
content = content.replace('draggable', 'draggable={isSuperAdmin}');

// 6. Update MoreVertical button
content = content.replace('<button className={styles.moreBtn}><MoreVertical size={16} /></button>',
`{isSuperAdmin && (
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
                      )}`);

// 7. Add Edit Modal
content = content.replace('{/* Add Lead Modal */}',
`{/* Edit Lead Modal */}
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

      {/* Add Lead Modal */}`);

fs.writeFileSync(file, content);
console.log("LeadsPage updated.");
