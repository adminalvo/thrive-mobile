"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { CreditCard, AlertCircle, CheckCircle, Search, FileText, Plus, X, DollarSign, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ContractModal from "@/components/ContractModal";
import { useTranslations } from "next-intl";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Invoice {
  id: string;
  studentId?: string;
  studentName?: string;
  amount: number;
  paidAmount: number;
  status: "PAID" | "PENDING" | "PARTIAL" | string;
  dueDate: string;
  createdAt: string;
  date?: string;
  paymentMethod?: string;
  student: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface StudentOption {
  id: string;
  name: string;
  phone?: string;
}

export default function FinancePage() {
  const t = useTranslations("Finance");
  const c = useTranslations("Common");
  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const permissions = (session?.user as any)?.permissions?.finance || {};
  const canCreate = userRole === "super_admin" || userRole === "admin" || permissions.create;
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchIncome, setSearchIncome] = useState("");
  const [searchExpense, setSearchExpense] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // 1month, 6month, 1year, all

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    studentId: "",
    amount: "",
    paidAmount: "0",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "CASH",
    status: "PENDING"
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    lessonTime: ""
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "Ofis xərcləri",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, expRes, stuRes] = await Promise.all([
        fetch("/api/finance"),
        fetch("/api/finance/expenses"),
        fetch("/api/students")
      ]);
      
      if (invRes.ok) setInvoices(await invRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
    } catch (error) {
      toast.error("Məlumatları yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  };

  const timeFilteredInvoices = useMemo(() => {
    if (timeFilter === "all") return invoices;
    const now = new Date();
    const limit = new Date();
    if (timeFilter === "1month") limit.setMonth(now.getMonth() - 1);
    if (timeFilter === "6month") limit.setMonth(now.getMonth() - 6);
    if (timeFilter === "1year") limit.setFullYear(now.getFullYear() - 1);
    
    return invoices.filter(inv => {
      const d = new Date(inv.date || inv.createdAt || 0);
      return d >= limit;
    });
  }, [invoices, timeFilter]);

  const timeFilteredExpenses = useMemo(() => {
    if (timeFilter === "all") return expenses;
    const now = new Date();
    const limit = new Date();
    if (timeFilter === "1month") limit.setMonth(now.getMonth() - 1);
    if (timeFilter === "6month") limit.setMonth(now.getMonth() - 6);
    if (timeFilter === "1year") limit.setFullYear(now.getFullYear() - 1);
    
    return expenses.filter(exp => {
      const d = new Date(exp.date || 0);
      return d >= limit;
    });
  }, [expenses, timeFilter]);

  const calculateTotalIncome = () => timeFilteredInvoices.reduce((t, i) => t + (Number(i.paidAmount) || 0), 0);
  const calculateTotalDebt = () => timeFilteredInvoices.filter(i => i.status !== "PAID").reduce((t, i) => t + Math.max(0, (Number(i.amount) || 0) - (Number(i.paidAmount) || 0)), 0);
  const calculateTotalExpenses = () => timeFilteredExpenses.reduce((t, e) => t + (Number(e.amount) || 0), 0);
  
  const chartData = useMemo(() => {
    const months = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
    const curMonth = new Date().getMonth();
    const data = [];
    
    // Group dynamically
    const incomesByMonth: Record<number, number> = {};
    const expensesByMonth: Record<number, number> = {};

    timeFilteredInvoices.forEach(inv => {
      const d = new Date(inv.date || inv.createdAt || 0);
      const mKey = d.getFullYear() * 12 + d.getMonth();
      incomesByMonth[mKey] = (incomesByMonth[mKey] || 0) + (Number(inv.paidAmount) || 0);
    });

    timeFilteredExpenses.forEach(exp => {
      const d = new Date(exp.date || 0);
      const mKey = d.getFullYear() * 12 + d.getMonth();
      expensesByMonth[mKey] = (expensesByMonth[mKey] || 0) + (Number(exp.amount) || 0);
    });

    for (let i = 5; i >= 0; i--) {
      let m = curMonth - i;
      let yOffset = 0;
      if (m < 0) {
        m += 12;
        yOffset = -1;
      }
      const y = new Date().getFullYear() + yOffset;
      const mKey = y * 12 + m;
      
      data.push({
        name: months[m],
        Gəlir: incomesByMonth[mKey] || 0,
        Xərc: expensesByMonth[mKey] || 0
      });
    }
    return data;
  }, [timeFilteredInvoices, timeFilteredExpenses]);

  const filteredInvoices = useMemo(() => {
    if (!searchIncome.trim()) return timeFilteredInvoices;
    const term = searchIncome.toLowerCase().trim();
    return timeFilteredInvoices.filter(inv => {
      const name = (inv.studentName || "").toLowerCase();
      return name.includes(term) || (inv.id || "").includes(term) || String(inv.amount).includes(term);
    });
  }, [timeFilteredInvoices, searchIncome]);

  const filteredExpenses = useMemo(() => {
    if (!searchExpense.trim()) return timeFilteredExpenses;
    const term = searchExpense.toLowerCase().trim();
    return timeFilteredExpenses.filter(exp => 
      (exp.category || "").toLowerCase().includes(term) || 
      (exp.description || "").toLowerCase().includes(term) ||
      String(exp.amount).includes(term)
    );
  }, [timeFilteredExpenses, searchExpense]);

  // Handlers
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.studentId) return toast.error("Tələbə seçin");
    
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: createForm.studentId,
          amount: parseFloat(createForm.amount),
          paid_amount: parseFloat(createForm.paidAmount) || 0,
          due_date: new Date(createForm.dueDate).toISOString()
        })
      });

      if (res.ok) {
        toast.success("Faktura uğurla yaradıldı");
        setShowCreateModal(false);
        fetchData();
      } else toast.error("Xəta baş verdi");
    } catch (e) {
      toast.error("Şəbəkə xətası");
    }
  };

  const handleProcessPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: paymentModalInvoice.id,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod
        })
      });

      if (res.ok) {
        toast.success("Ödəniş qəbul edildi");
        setPaymentModalInvoice(null);
        fetchData();
      } else toast.error("Xəta baş verdi");
    } catch (e) {
      toast.error("Şəbəkə xətası");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm(c("confirmDelete") || "Bu fakturanı silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        toast.success(c("successDelete") || "Uğurla silindi");
      }
    } catch (e) {}
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(c("confirmDelete") || "Bu xərci silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
        toast.success(c("successDelete") || "Uğurla silindi");
      }
    } catch (e) {}
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expenseForm.category,
          amount: parseFloat(expenseForm.amount),
          date: new Date(expenseForm.date).toISOString(),
          description: expenseForm.description
        })
      });

      if (res.ok) {
        toast.success("Xərc əlavə edildi");
        setShowExpenseModal(false);
        fetchData();
      } else toast.error("Xəta baş verdi");
    } catch (e) {
      toast.error("Şəbəkə xətası");
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "PAID") return t("modal.statusPaid") || "Ödənilib";
    if (status === "PARTIAL") return "Qismən";
    return t("modal.statusPending") || "Gözləyir";
  };

  const getStatusClass = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return styles.paid;
    if (s === "partial") return styles.partial;
    return styles.pending;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.subtitle}>{t("subtitle")}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ color: "var(--gray-300)", fontSize: "0.9rem" }}>Dövr:</span>
            <select 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value)}
              style={{
                background: "var(--card-bg)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
                padding: "8px 12px",
                borderRadius: "8px",
                outline: "none"
              }}
            >
              <option value="1month">Son 1 Ay</option>
              <option value="6month">Son 6 Ay</option>
              <option value="1year">Son 1 İl</option>
              <option value="all">Bütün dövr</option>
            </select>
          </div>
        </div>
      </div>

      {/* OVERVIEW SECTION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.overviewTab}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <ArrowDownRight size={24} />
            </div>
            <div>
              <h3>{t("totalIncome") || "Ümumi Gəlir"}</h3>
              <p className={styles.amount}>{calculateTotalIncome().toLocaleString()} ₼</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <ArrowUpRight size={24} />
            </div>
            <div>
              <h3>{t("totalExpense") || "Ümumi Xərc"}</h3>
              <p className={styles.amountError}>{calculateTotalExpenses().toLocaleString()} ₼</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <h3>{t("totalDebt") || "Gözlənilən (Borclar)"}</h3>
              <p className={styles.amountWarning}>{calculateTotalDebt().toLocaleString()} ₼</p>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer} style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--white)', fontWeight: 600 }}>{t("last6Months") || "Son 6 Ayın Statistikası"}</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="Gəlir" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Xərc" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* INCOME SECTION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.tabContent} style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--white)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowDownRight size={22} color="#10b981" /> {t("incomes") || "Gəlirlər"}
        </h2>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.icon} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder") || "Axtarış..."}
              value={searchIncome}
              onChange={e => setSearchIncome(e.target.value)}
            />
          </div>
          {canCreate && (
            <button className={styles.addBtn} onClick={() => {
              setCreateForm({
                studentId: students[0]?.id || "", amount: "", paidAmount: "0",
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                paymentMethod: "CASH", status: "PENDING"
              });
              setShowCreateModal(true);
            }}>
              <Plus size={18} /> {t("modal.newInvoice")}
            </button>
          )}
        </div>

        <div className={styles.tableContainer}>
          {loading ? <div className={styles.loading}>{c("loading")}</div> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t("modal.student") || "Tələbə"}</th>
                  <th>{t("modal.amount") || "Məbləğ"}</th>
                  <th>{t("paidAmount") || "Ödənilib"}</th>
                  <th>{t("debt") || "Borc"}</th>
                  <th>{t("modal.dueDate") || "Tarix"}</th>
                  <th>{t("modal.status") || "Status"}</th>
                  <th style={{ textAlign: 'right' }}>{t("action") || "Əməliyyat"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const debt = Math.max(0, (Number(inv.amount) || 0) - (Number(inv.paidAmount) || 0));
                  return (
                    <tr key={inv.id}>
                      <td className={styles.invoiceId}>#{String(inv.id).substring(0,6).toUpperCase()}</td>
                      <td>
                        <div className={styles.studentInfo}>
                          <span className={styles.studentName}>{inv.studentName}</span>
                        </div>
                      </td>
                      <td className={styles.boldAmount}>{inv.amount} ₼</td>
                      <td className={styles.paidAmount}>{inv.paidAmount} ₼</td>
                      <td className={debt > 0 ? styles.debtAmount : ""}>{debt} ₼</td>
                      <td className={styles.date}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("az-AZ") : "-"}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(inv.status)}`}>
                          {getStatusLabel(inv.status)}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actions}>
                          <button className={styles.iconBtn} onClick={() => setSelectedInvoice(inv)} title="Fakturaya bax">
                            <FileText size={16} />
                          </button>
                          {canCreate && inv.status !== 'PAID' && (
                            <button className={styles.payBtn} onClick={() => {
                              setPaymentModalInvoice(inv);
                              setPaymentForm({ amount: String(Math.max(0, Number(inv.amount) - Number(inv.paidAmount))), paymentMethod: "CASH", lessonTime: "" });
                            }} title="Ödəniş qəbul et">
                              <DollarSign size={16} />
                            </button>
                          )}
                          {canCreate && (
                            <button className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => handleDeletePayment(inv.id)} title="Sil">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* EXPENSES SECTION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.tabContent}>
        <h2 style={{ color: 'var(--white)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpRight size={22} color="#ef4444" /> {t("expenses") || "Xərclər"}
        </h2>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.icon} />
            <input 
              type="text" 
              placeholder={t("searchExpensePlaceholder") || "Xərclərdə axtarış..."}
              value={searchExpense}
              onChange={e => setSearchExpense(e.target.value)}
            />
          </div>
          {canCreate && (
            <button className={styles.addBtn} onClick={() => setShowExpenseModal(true)}>
              <Plus size={18} /> {t("modal.newExpense") || "Yeni Xərc"}
            </button>
          )}
        </div>

        <div className={styles.tableContainer}>
          {loading ? <div className={styles.loading}>{c("loading")}</div> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarix</th>
                  <th>{t("modal.category") || "Kateqoriya"}</th>
                  <th>{t("modal.description") || "Təsvir"}</th>
                  <th>{t("modal.amount") || "Məbləğ"}</th>
                  <th style={{ width: "80px", textAlign: "right" }}>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className={styles.date}>{exp.date ? new Date(exp.date).toLocaleDateString("az-AZ") : "-"}</td>
                    <td>
                      <span className={styles.expenseCategory}>{exp.category}</span>
                    </td>
                    <td style={{ color: "var(--gray-300)" }}>{exp.description || "-"}</td>
                    <td className={styles.amountError}>{exp.amount} ₼</td>
                    <td className={styles.actions}>
                      <button className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => handleDeleteExpense(exp.id)} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr><td colSpan={5} className={styles.emptyState}>Tapılmadı</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <ContractModal 
          isOpen={true} 
          onClose={() => setSelectedInvoice(null)} 
          student={selectedInvoice.student} 
        />
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModalInvoice && (
          <div className={styles.modalOverlay} onClick={() => setPaymentModalInvoice(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t("modal.acceptPayment") || "Ödəniş Qəbulu"}</h2>
                <button className={styles.closeModalBtn} onClick={() => setPaymentModalInvoice(null)}><X size={20}/></button>
              </div>
              <form onSubmit={handleProcessPaymentSubmit} className={styles.modalForm}>
                <div className={styles.paymentSummary}>
                  <div>{t("modal.student") || "Tələbə"}: <strong>{paymentModalInvoice.studentName}</strong></div>
                  <div>{t("debt") || "Qalıq Borc"}: <strong style={{color:'#ef4444'}}>{Math.max(0, Number(paymentModalInvoice.amount) - Number(paymentModalInvoice.paidAmount))} ₼</strong></div>
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.paidAmount") || "Ödənilən Məbləğ"} (₼)</label>
                  <input type="number" required min="1" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.paymentMethod") || "Ödəniş Metodu"}</label>
                  <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className={styles.select}>
                    <option value="CASH">{t("modal.cash") || "Nağd"}</option>
                    <option value="CARD">{t("modal.card") || "Kart"}</option>
                    <option value="TRANSFER">{t("modal.transfer") || "Köçürmə"}</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setPaymentModalInvoice(null)}>{t("modal.cancel") || c("cancel")}</button>
                  <button type="submit" className={styles.submitBtn}>{t("modal.confirm") || "Təsdiqlə"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t("modal.newInvoice")}</h2>
                <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateInvoiceSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>{t("modal.student") || "Tələbə"}</label>
                  <select required value={createForm.studentId} onChange={e => setCreateForm({...createForm, studentId: e.target.value})} className={styles.select}>
                    <option value="">{t("modal.selectStudentPlaceholder") || "Seçin..."}</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.totalAmount") || "Ümumi Məbləğ"} (₼)</label>
                  <input type="number" required min="1" step="0.01" value={createForm.amount} onChange={e => setCreateForm({...createForm, amount: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.initialPayment") || "İlkin Ödəniş"} (₼)</label>
                  <input type="number" min="0" step="0.01" value={createForm.paidAmount} onChange={e => setCreateForm({...createForm, paidAmount: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.dueDate") || "Son Ödəniş Tarixi"}</label>
                  <input type="date" required value={createForm.dueDate} onChange={e => setCreateForm({...createForm, dueDate: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>{t("modal.cancel") || c("cancel")}</button>
                  <button type="submit" className={styles.submitBtn}>{t("modal.create") || "Yarat"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className={styles.modalOverlay} onClick={() => setShowExpenseModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t("modal.newExpense") || "Yeni Xərc Əlavə Et"}</h2>
                <button className={styles.closeModalBtn} onClick={() => setShowExpenseModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleAddExpenseSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>{t("modal.category") || "Kateqoriya"}</label>
                  <select required value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className={styles.select}>
                    <option value="Maaşlar">{t("categories.salaries") || "Maaşlar"}</option>
                    <option value="Ofis xərcləri">{t("categories.office") || "Ofis xərcləri"}</option>
                    <option value="Vergilər">{t("categories.taxes") || "Vergilər"}</option>
                    <option value="Reklam">{t("categories.marketing") || "Reklam və Marketinq"}</option>
                    <option value="Digər">{t("categories.other") || "Digər"}</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.amount") || "Məbləğ"} (₼)</label>
                  <input type="number" required min="1" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.date") || "Tarix"}</label>
                  <input type="date" required value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("modal.description") || "Təsvir (İstəyə bağlı)"}</label>
                  <textarea value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className={styles.input} rows={3} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowExpenseModal(false)}>{t("modal.cancel") || c("cancel")}</button>
                  <button type="submit" className={styles.submitBtn}>Təsdiqlə</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
