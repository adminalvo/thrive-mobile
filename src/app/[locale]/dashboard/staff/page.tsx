"use client";

import { useState, useEffect } from "react";
import styles from "./staff.module.css";
import { useTranslations } from "next-intl";
import { ShieldAlert, CheckCircle, XCircle, KeyRound, Search, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export default function StaffPage() {
  const { data: session } = useSession();
  const t = useTranslations("Staff");
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Permission modal state
  const [showPermModal, setShowPermModal] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);
  const [permissions, setPermissions] = useState<any>({});
  const [savingPerms, setSavingPerms] = useState(false);

  // Add staff modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "staff"
  });
  const [addingStaff, setAddingStaff] = useState(false);

  const modules = ["students", "finance", "groups", "tasks", "staff", "settings", "teachers", "parents"];

  useEffect(() => {
    if (session?.user?.role === 'super_admin') {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== 'super_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#ef4444' }}>
        <ShieldAlert size={48} />
        <h2>{t("denied")}</h2>
        <p>{t("deniedDesc")}</p>
      </div>
    );
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`/api/staff/${id}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      });
      
      if (res.ok) {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: newStatus } : s));
        toast.success(newStatus ? t("active") : t("inactive"));
      } else {
        const data = await res.json();
        toast.error(data.error || "Xəta baş verdi");
      }
    } catch (e) {
      toast.error("Şəbəkə xətası");
    }
  };

  const openPermissions = async (member: StaffMember) => {
    setActiveStaff(member);
    setPermissions({});
    setShowPermModal(true);
    
    try {
      const res = await fetch(`/api/staff/${member.id}/permissions`);
      if (res.ok) {
        const data = await res.json();
        const fullPerms = { ...data };
        modules.forEach(m => {
          if (!fullPerms[m]) {
            fullPerms[m] = { view: false, create: false, edit: false, delete: false, export: false };
          }
        });
        setPermissions(fullPerms);
      }
    } catch (e) {
      toast.error("İcazələri yükləmək mümkün olmadı");
    }
  };

  const handlePermChange = (mod: string, action: string, checked: boolean) => {
    setPermissions((prev: any) => ({
      ...prev,
      [mod]: {
        ...(prev[mod] || {}),
        [action]: checked
      }
    }));
  };

  const savePermissions = async () => {
    if (!activeStaff) return;
    setSavingPerms(true);
    try {
      const res = await fetch(`/api/staff/${activeStaff.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions })
      });
      if (res.ok) {
        toast.success(t("save"));
        setShowPermModal(false);
      } else {
        toast.error("Xəta baş verdi");
      }
    } catch (e) {
      toast.error("Şəbəkə xətası");
    } finally {
      setSavingPerms(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingStaff(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        toast.success(t("save"));
        setShowAddModal(false);
        fetchStaff();
        setAddForm({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "staff" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Xəta baş verdi");
      }
    } catch (e) {
      toast.error("Şəbəkə xətası");
    } finally {
      setAddingStaff(false);
    }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm("Bu işçini silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Uğurla silindi");
        setStaff(prev => prev.filter(s => s.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Silinmə xətası");
      }
    } catch (e) {
      toast.error("Şəbəkə xətası");
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.header}>
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
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          {t("addStaff")}
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>{t("loading")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("email")}</th>
                <th>{t("role")}</th>
                <th>{t("status")}</th>
                <th className={styles.actionsCell}>{t("permissions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.staffInfo}>
                        <div className={styles.avatar}>
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={styles.staffName}>{member.name}</span>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span className={styles.roleBadge}>{member.role}</span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleStatus(member.id, member.isActive)}
                        className={member.isActive ? styles.statusBtnActive : styles.statusBtnInactive}
                        title={t("status")}
                      >
                        {member.isActive ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                        {member.isActive ? t("active") : t("inactive")}
                      </button>
                    </td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.iconBtn} 
                        onClick={() => openPermissions(member)}
                        title={t("permissions")}
                      >
                        <KeyRound size={16} />
                      </button>
                      <button 
                        className={`${styles.iconBtn}`} 
                        onClick={() => deleteStaff(member.id)}
                        title="Sil"
                        style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", marginLeft: "0.5rem" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>{t("empty")}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showPermModal && activeStaff && (
        <div className={styles.modalOverlay} onClick={() => setShowPermModal(false)}>
          <div className={styles.modalLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("modalPermTitle")}: {activeStaff.name}</h2>
              <button onClick={() => setShowPermModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDesc}>
                {t("modalPermDesc")}
              </p>
              
              <div className={styles.permGrid}>
                <div className={styles.permHeader}>
                  <div>{t("module")}</div>
                  <div>{t("view")}</div>
                  <div>{t("create")}</div>
                  <div>{t("edit")}</div>
                  <div>{t("delete")}</div>
                  <div>{t("export")}</div>
                </div>
                
                {modules.map(mod => {
                  const p = permissions[mod] || {};
                  return (
                    <div key={mod} className={styles.permRow}>
                      <div className={styles.modName}>{mod.charAt(0).toUpperCase() + mod.slice(1)}</div>
                      <div className={styles.chkWrap}>
                        <input type="checkbox" checked={p.view || false} onChange={e => handlePermChange(mod, 'view', e.target.checked)} />
                      </div>
                      <div className={styles.chkWrap}>
                        <input type="checkbox" checked={p.create || false} onChange={e => handlePermChange(mod, 'create', e.target.checked)} />
                      </div>
                      <div className={styles.chkWrap}>
                        <input type="checkbox" checked={p.edit || false} onChange={e => handlePermChange(mod, 'edit', e.target.checked)} />
                      </div>
                      <div className={styles.chkWrap}>
                        <input type="checkbox" checked={p.delete || false} onChange={e => handlePermChange(mod, 'delete', e.target.checked)} />
                      </div>
                      <div className={styles.chkWrap}>
                        <input type="checkbox" checked={p.export || false} onChange={e => handlePermChange(mod, 'export', e.target.checked)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowPermModal(false)}>{t("cancel")}</button>
              <button className={styles.saveBtn} onClick={savePermissions} disabled={savingPerms}>
                {savingPerms ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("addStaffTitle")}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleAddStaff} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>{t("firstName")} *</label>
                <input required type="text" value={addForm.firstName} onChange={e => setAddForm({...addForm, firstName: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>{t("lastName")}</label>
                <input type="text" value={addForm.lastName} onChange={e => setAddForm({...addForm, lastName: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>{t("email")} *</label>
                <input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>{t("phone")}</label>
                <input type="text" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>{t("password")} *</label>
                <input required minLength={6} type="password" placeholder={t("passwordPlaceholder")} value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>{t("roleSelect")} *</label>
                <select required value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className={styles.select}>
                  <option value="staff">{t("staff")}</option>
                  <option value="admin">{t("admin")}</option>
                  <option value="teacher">{t("teacher")}</option>
                  <option value="sales">{t("sales")}</option>
                </select>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>{t("cancel")}</button>
                <button type="submit" className={styles.saveBtn} disabled={addingStaff}>
                  {addingStaff ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
