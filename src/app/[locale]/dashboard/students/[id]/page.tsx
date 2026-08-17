"use client";

import { use, useState, useEffect, useCallback } from "react";
import styles from "./studentProfile.module.css";
import { 
  ArrowLeft, 
  CreditCard, 
  Clock, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Plus, 
  DollarSign, 
  Percent, 
  BookOpen, 
  Mail, 
  Phone, 
  Printer, 
  Layers
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import ContractModal from "@/components/ContractModal";
import { useSession } from "next-auth/react";

interface StudentProfileData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
    fin: string;
    idCard: string;
    status: string;
    joinDate: string;
  };
  groups: Array<{
    id: string;
    name: string;
    program: string;
    teacher: string;
    room: string;
    schedule: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paidAmount: number;
    status: string;
    date: string;
    dueDate: string;
  }>;
  attendance: Array<{
    id: string;
    date: string;
    groupName: string;
    status: string;
    notes: string;
  }>;
  stats: {
    totalPaid: number;
    totalDebt: number;
    attendanceRate: string;
    enrolledGroupsCount: number;
  };
}

export default function StudentDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user?.role === "teacher") {
    if (typeof window !== "undefined") {
      router.push("/dashboard");
    }
    return null;
  }

  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const t = useTranslations("Profile");
  const c = useTranslations("Common");

  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "groups" | "payments" | "attendance" | "parents">("overview");

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    fin: ""
  });

  // New payment state
  const [paymentForm, setPaymentForm] = useState({
    amount: "250",
    status: "PAID"
  });

  // Parents pairing state
  const [showParentModal, setShowParentModal] = useState(false);
  const [availableParents, setAvailableParents] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [linkingParent, setLinkingParent] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setEditForm({
          name: json.student.name || "",
          phone: json.student.phone || "",
          email: json.student.email || "",
          fin: json.student.fin || ""
        });
      } else {
        toast.error(t("notFound"));
      }
    } catch {
      toast.error(t("notFound"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success(c("save"));
        setShowEditModal(false);
        fetchProfile();
      } else {
        toast.error("Xəta baş verdi");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/finance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: id,
          amount: parseFloat(paymentForm.amount),
          paid_amount: paymentForm.status === "PAID" ? parseFloat(paymentForm.amount) : 0,
          status: paymentForm.status
        })
      });
      if (res.ok) {
        toast.success(t("addPayment"));
        setShowPaymentModal(false);
        fetchProfile();
      } else {
        // Optimistic refresh
        setShowPaymentModal(false);
        fetchProfile();
      }
    } catch {
      setShowPaymentModal(false);
      fetchProfile();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu tələbəni silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi");
        router.push("/dashboard/students");
      } else {
        toast.error("Silinmədi");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Bu ödənişi silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/${paymentId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Ödəniş silindi");
        fetchProfile();
      } else {
        toast.error(c("errorDelete"));
      }
    } catch {
      toast.error(c("errors.unexpected"));
    }
  };

  const handleFetchParents = async () => {
    try {
      const res = await fetch("/api/parents");
      const list = await res.json();
      setAvailableParents(list);
    } catch {
      toast.error("Valideynləri yükləmək mümkün olmadı");
    }
  };

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) return;
    setLinkingParent(true);
    try {
      const res = await fetch(`/api/students/${id}/parents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: selectedParentId })
      });
      if (res.ok) {
        toast.success("Valideyn uğurla əlaqələndirildi");
        setShowParentModal(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        toast.error(`Xəta baş verdi: ${errorData.details || errorData.error || "Unknown Error"}`);
      }
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setLinkingParent(false);
    }
  };

  const handleUnlinkParent = async (parentId: string) => {
    if (!confirm("Bu valideyni silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/students/${id}/parents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: parentId })
      });
      if (res.ok) {
        toast.success("Valideyn silindi");
        fetchProfile();
      } else {
        toast.error("Silinmədi");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>{t("loading")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <Link href="/dashboard/students" className={styles.backBtn}>
          <ArrowLeft size={18} /> {t("backToStudents")}
        </Link>
        <p className={styles.emptyState}>{t("notFound")}</p>
      </div>
    );
  }

  const { student, groups, payments, attendance, stats, parents } = data as any;

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <Link href="/dashboard/students" className={styles.backBtn}>
        <ArrowLeft size={18} /> {t("backToStudents")}
      </Link>

      {/* Header Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.headerCard}
      >
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {student.name.substring(0, 2).toUpperCase()}
          </div>
          <div className={styles.details}>
            <h1>{student.name}</h1>
            <div className={styles.metaRow}>
              <span className={styles.idBadge}>ID: {student.id.substring(0, 8)}</span>
              <span className={student.status === "ACTIVE" ? styles.statusActive : styles.statusInactive}>
                <CheckCircle size={14} /> {student.status === "ACTIVE" ? c("active") : c("inactive")}
              </span>
              <span className={styles.idBadge}>
                {t("joinDate")}: {new Date(student.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionBtnPrimary} onClick={() => setShowPaymentModal(true)}>
            <DollarSign size={16} /> {t("addPayment")}
          </button>
          <button 
            className={styles.actionBtnSecondary} 
            onClick={() => setSelectedInvoice({
              id: payments[0]?.id || student.id || "INV-001",
              amount: student.totalPrice || payments[0]?.amount || 0,
              status: payments[0]?.status || "PAID",
              createdAt: student.joinDate,
              student: student // Pass the entire student object which contains program, idCard, fin, monthlyPayment, durationMonths
            })}
          >
            <Printer size={16} /> {t("printContract")}
          </button>
          <button className={styles.actionBtnSecondary} onClick={() => setShowEditModal(true)}>
            <Edit size={16} /> {t("editProfile")}
          </button>
          <button className={styles.actionBtnDanger} onClick={handleDelete}>
            <Trash2 size={16} /> {t("deleteProfile")}
          </button>
        </div>
      </motion.div>

      {/* Top KPI Stat Cards */}
      <div className={styles.kpiGrid}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("totalPaid")}</p>
            <h3>{stats.totalPaid} ₼</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
            <CreditCard size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("totalDebt")}</p>
            <h3>{stats.totalDebt} ₼</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(76, 162, 181, 0.15)", color: "var(--aqua-teal)" }}>
            <Percent size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("attendanceRate")}</p>
            <h3>{stats.attendanceRate}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.kpiCard}
        >
          <div className={styles.kpiIcon} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
            <Layers size={24} />
          </div>
          <div className={styles.kpiContent}>
            <p>{t("enrolledGroups")}</p>
            <h3>{stats.enrolledGroupsCount}</h3>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BookOpen size={16} /> {t("overview")}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "parents" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("parents")}
        >
          <Users size={16} /> Valideynlər ({parents?.length || 0})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "groups" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          <Users size={16} /> {t("groups")} ({groups.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "payments" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          <CreditCard size={16} /> {t("payments")} ({payments.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "attendance" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <Clock size={16} /> {t("attendance")} ({attendance.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Users size={18} /> {t("generalInfo")}
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("fullName")}</span>
                <span className={styles.infoValue}>{student.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("email")}</span>
                <span className={styles.infoValue}>{student.email || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("phone")}</span>
                <span className={styles.infoValue}>{student.phone || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("fin")}</span>
                <span className={styles.infoValue}>{student.fin || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("idCard")}</span>
                <span className={styles.infoValue}>{student.idCard || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("joinDate")}</span>
                <span className={styles.infoValue}>{new Date(student.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "parents" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                <Users size={18} /> Valideynlər
              </h3>
              <button 
                className={styles.actionBtnPrimary} 
                onClick={() => {
                  setShowParentModal(true);
                  handleFetchParents();
                }}
              >
                <Plus size={16} /> Əlavə et
              </button>
            </div>
            
            {(!parents || parents.length === 0) ? (
              <p className={styles.emptyState}>Təyin edilmiş valideyn yoxdur</p>
            ) : (
              <div className={styles.infoGrid}>
                {parents.map((p: any) => (
                  <div key={p.id} style={{ background: "rgba(var(--glass-color), 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(var(--glass-color), 0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{p.name}</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Phone size={14} /> {p.phone || "Qeyd edilməyib"}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Mail size={14} /> {p.email || "Qeyd edilməyib"}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><FileText size={14} /> FIN: {p.fin || "Qeyd edilməyib"}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleUnlinkParent(p.id)}
                      style={{ background: "transparent", border: "none", color: "var(--danger-color)", cursor: "pointer", padding: "0.5rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                      title="Əlaqəni kəs"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "groups" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Users size={18} /> {t("groups")}
            </h3>
            {groups.length === 0 ? (
              <p className={styles.emptyState}>{t("noGroups")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Qrup Adı</th>
                      <th>{t("program")}</th>
                      <th>{t("teacher")}</th>
                      <th>{t("room")}</th>
                      <th>{t("schedule")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(g => (
                      <tr key={g.id}>
                        <td>
                          <Link href={`/dashboard/groups/${g.id}`} style={{ color: "var(--aqua-teal)", fontWeight: 600 }}>
                            {g.name}
                          </Link>
                        </td>
                        <td>{g.program}</td>
                        <td>{g.teacher}</td>
                        <td>{g.room}</td>
                        <td>{g.schedule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "payments" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                <CreditCard size={18} /> {t("payments")}
              </h3>
              <button className={styles.actionBtnPrimary} onClick={() => setShowPaymentModal(true)}>
                <Plus size={14} /> {t("addPayment")}
              </button>
            </div>
            {payments.length === 0 ? (
              <p className={styles.emptyState}>{t("noPayments")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t("amount")}</th>
                      <th>{t("status")}</th>
                      <th>{t("date")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td>#{p.id.substring(0, 8).toUpperCase()}</td>
                        <td style={{ fontWeight: 600 }}>{p.amount} ₼</td>
                        <td>
                          <span className={`${styles.badge} ${p.status === "PAID" ? styles.badgePaid : styles.badgePending}`}>
                            {p.status === "PAID" ? c("active") : c("pending")}
                          </span>
                        </td>
                        <td>{new Date(p.date).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button 
                              className={styles.actionBtnSecondary} 
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                              onClick={() => setSelectedInvoice({
                                id: p.id,
                                amount: p.amount,
                                status: p.status,
                                createdAt: p.date,
                                student: { name: student.name, phone: student.phone }
                              })}
                            >
                              <Printer size={14} /> {t("printContract")}
                            </button>
                            <button 
                              className={styles.actionBtnDanger} 
                              style={{ padding: "0.4rem", fontSize: "0.8rem" }}
                              onClick={() => handleDeletePayment(p.id)}
                              title="Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>
              <Clock size={18} /> {t("attendance")}
            </h3>
            {attendance.length === 0 ? (
              <p className={styles.emptyState}>{t("noAttendance")}</p>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("date")}</th>
                      <th>Qrup</th>
                      <th>{t("status")}</th>
                      <th>{t("notes")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td>{a.groupName}</td>
                        <td>
                          <span className={`${styles.badge} ${
                            a.status === "PRESENT" ? styles.badgePresent :
                            a.status === "LATE" ? styles.badgeLate : styles.badgeAbsent
                          }`}>
                            {a.status === "PRESENT" ? t("present") :
                             a.status === "LATE" ? t("late") : t("absent")}
                          </span>
                        </td>
                        <td>{a.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <h2>{t("editProfile")}</h2>
              <form onSubmit={handleEditSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>{t("fullName")}</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("phone")}</label>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("email")}</label>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                    {c("cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {c("save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <h2>{t("addPayment")}</h2>
              <form onSubmit={handleAddPayment} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>{t("amount")} (₼)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={paymentForm.amount} 
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t("status")}</label>
                  <select 
                    value={paymentForm.status} 
                    onChange={e => setPaymentForm({...paymentForm, status: e.target.value})}
                  >
                    <option value="PAID">{c("active")} (Ödənilib)</option>
                    <option value="PENDING">{c("pending")} (Gözləmədə)</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowPaymentModal(false)}>
                    {c("cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {t("addPayment")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract & Invoice Modal */}
      {selectedInvoice && (
        <ContractModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

      {/* Link Parent Modal */}
      <AnimatePresence>
        {showParentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowParentModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <h2>Valideyn Əlaqələndir</h2>
              <form onSubmit={handleLinkParent} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Mövcud Valideynlər</label>
                  <select 
                    value={selectedParentId} 
                    onChange={e => setSelectedParentId(e.target.value)} 
                    required
                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "var(--bg-color)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  >
                    <option value="">Seçin</option>
                    {availableParents.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.fin || p.contact})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowParentModal(false)}>Ləğv et</button>
                  <button type="submit" className={styles.saveBtn} disabled={linkingParent}>
                    {linkingParent ? "Gözləyin..." : "Əlaqələndir"}
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
