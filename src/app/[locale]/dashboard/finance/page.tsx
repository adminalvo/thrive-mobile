"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { CreditCard, AlertCircle, CheckCircle, Search, FileText, Plus, X, DollarSign, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ContractModal from "@/components/ContractModal";
import { useTranslations } from "next-intl";

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
    user?: {
      name?: string;
    };
  };
}

interface StudentOption {
  id: string;
  name: string;
  phone?: string;
}

export default function FinancePage() {
  const t = useTranslations("Finance");
  const c = useTranslations("Common");
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Create Invoice Form State
  const [createForm, setCreateForm] = useState({
    studentId: "",
    amount: "",
    paidAmount: "0",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "CASH",
    status: "PENDING"
  });

  // Process Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    lessonTime: ""
  });

  useEffect(() => {
    fetchInvoices();
    fetchStudents();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/finance");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        toast.error("Maliyyə məlumatlarını yükləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to load students", error);
    }
  };

  const calculateTotalDebt = () => {
    return invoices
      .filter(i => i.status !== "PAID")
      .reduce((total, i) => total + Math.max(0, (Number(i.amount) || 0) - (Number(i.paidAmount) || 0)), 0);
  };

  const calculateMonthlyIncome = () => {
    return invoices.reduce((total, i) => total + (Number(i.paidAmount) || 0), 0);
  };

  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    const term = searchTerm.toLowerCase().trim();
    return invoices.filter(inv => {
      const name = (inv.student?.name || inv.student?.user?.name || inv.studentName || "").toLowerCase();
      const id = (inv.id || "").toLowerCase();
      const status = (inv.status || "").toLowerCase();
      const amountStr = String(inv.amount);
      return name.includes(term) || id.includes(term) || status.includes(term) || amountStr.includes(term);
    });
  }, [invoices, searchTerm]);

  const openCreateModal = () => {
    setCreateForm({
      studentId: students[0]?.id || "",
      amount: "",
      paidAmount: "0",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      paymentMethod: "CASH",
      status: "PENDING"
    });
    setShowCreateModal(true);
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.studentId) {
      toast.error("Zəhmət olmasa tələbə seçin");
      return;
    }
    const amountNum = parseFloat(createForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Zəhmət olmasa düzgün məbləğ daxil edin");
      return;
    }

    const paidNum = parseFloat(createForm.paidAmount) || 0;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: createForm.studentId,
          amount: amountNum,
          paid_amount: paidNum,
          due_date: createForm.dueDate ? new Date(createForm.dueDate).toISOString() : new Date().toISOString(),
          payment_method: createForm.paymentMethod
        })
      });

      if (res.ok) {
        const created = await res.json();
        setInvoices(prev => [created, ...prev]);
        setShowCreateModal(false);
        toast.success("Faktura uğurla yaradıldı");
      } else {
        toast.error("Faktura yaratmaq mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm(c("confirmDelete") || "Bu ödənişi silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        toast.success(c("successDelete") || "Uğurla silindi");
      } else {
        toast.error(c("errorDelete") || "Silmək mümkün olmadı");
      }
    } catch (error) {
      toast.error(c("error") || "Xəta baş verdi");
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    const debt = Math.max(0, (Number(invoice.amount) || 0) - (Number(invoice.paidAmount) || 0));
    setPaymentModalInvoice(invoice);
    setPaymentForm({
      amount: debt > 0 ? String(debt) : "0",
      paymentMethod: "CASH",
      lessonTime: ""
    });
  };

  const handleProcessPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    const amountNum = parseFloat(paymentForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Zəhmət olmasa düzgün ödəniş məbləği daxil edin");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: paymentModalInvoice.id,
          amount: amountNum,
          paymentMethod: paymentForm.paymentMethod,
          lessonTime: paymentForm.lessonTime
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setInvoices(prev => prev.map(inv => (inv.id === updated.id ? updated : inv)));
        setPaymentModalInvoice(null);
        toast.success("Ödəniş uğurla qəbul edildi!");
      } else {
        toast.error("Ödənişi qeyd etmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "PAID") return "Ödənilib";
    if (status === "PARTIAL") return "Qismən";
    return "Gecikir";
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
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.addBtn} onClick={openCreateModal}>
          <CreditCard size={18} /> {t("newInvoice")}
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3>{t("monthlyIncome")}</h3>
            <p className={styles.amount}>
              {calculateMonthlyIncome().toLocaleString()} ₼
            </p>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.debtCard}`}>
          <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3>{t("totalDebt")}</h3>
            <p className={styles.amountError}>{calculateTotalDebt().toLocaleString()} ₼</p>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.icon} />
          <input 
            type="text" 
            placeholder={t("search")} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>{c("loading")}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className={styles.empty}>{c("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("table.invoice")}</th>
                <th>{t("table.student")}</th>
                <th>{t("table.amount")}</th>
                <th>{t("table.paid")}</th>
                <th>{t("table.debt")}</th>
                <th>{t("table.status")}</th>
                <th>{t("table.deadline")}</th>
                <th>{c("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => {
                const amount = Number(inv.amount) || 0;
                const paid = Number(inv.paidAmount) || 0;
                const debt = Math.max(0, amount - paid);
                const dueDateObj = inv.dueDate ? new Date(inv.dueDate) : new Date();
                const isOverdue = dueDateObj < new Date() && inv.status !== "PAID";
                const studentName = inv.student?.name || inv.student?.user?.name || inv.studentName || "Tələbə";
                
                return (
                  <motion.tr 
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={isOverdue ? styles.overdueRow : ""}
                  >
                    <td className={styles.invoiceId}>#{inv.id ? inv.id.substring(0, 6).toUpperCase() : "INV"}</td>
                    <td className={styles.studentName}>
                      <div>
                        <strong>{studentName}</strong>
                        {isOverdue && <AlertCircle size={14} className={styles.alertIcon} />}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        Valideyn: {inv.parentName || "Qeyd edilməyib"}
                      </div>
                    </td>
                    <td>{amount} ₼</td>
                    <td className={styles.paid}>{paid} ₼</td>
                    <td className={debt > 0 ? styles.debt : ""}>{debt} ₼</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(inv.status)}`}>
                        {getStatusLabel(inv.status)}
                      </span>
                    </td>
                    <td className={isOverdue ? styles.debt : ""}>
                      {dueDateObj.toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        {debt > 0 && (
                          <button 
                            className={styles.payBtn}
                            title="Ödəniş Qəbul Et"
                            onClick={() => openPaymentModal(inv)}
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                        <button 
                          className={styles.actionBtn} 
                          title="Müqavilə və Faktura PDF"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          className={styles.actionBtn} 
                          title="Sil"
                          style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)" }}
                          onClick={() => handleDeletePayment(inv.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Yeni Faktura Yarat</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Tələbə Seçin *</label>
                <select
                  required
                  value={createForm.studentId}
                  onChange={e => setCreateForm({ ...createForm, studentId: e.target.value })}
                >
                  <option value="">Tələbə seçin...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.phone ? `(${s.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>Ümumi Məbləğ (₼) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Məs: 250"
                    value={createForm.amount}
                    onChange={e => setCreateForm({ ...createForm, amount: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>İlkin Ödənilən Məbləğ (₼)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={createForm.paidAmount}
                    onChange={e => setCreateForm({ ...createForm, paidAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>Son Ödəniş Tarixi</label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={e => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Ödəniş Üsulu</label>
                  <select
                    value={createForm.paymentMethod}
                    onChange={e => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                  >
                    <option value="CASH">Nağd (CASH)</option>
                    <option value="CARD">Kartla (CARD)</option>
                    <option value="BANK_TRANSFER">Bank Köçürməsi</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Ləğv et
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Faktura Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {paymentModalInvoice && (
        <div className={styles.modalOverlay} onClick={() => setPaymentModalInvoice(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Ödəniş Qəbul Et</h2>
              <button className={styles.closeModalBtn} onClick={() => setPaymentModalInvoice(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoBox}>
              <div className={styles.infoRow}>
                <span>Tələbə:</span>
                <strong>{paymentModalInvoice.student?.name || paymentModalInvoice.studentName || "Tələbə"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Faktura №:</span>
                <strong>#{paymentModalInvoice.id.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Ümumi Məbləğ:</span>
                <strong>{paymentModalInvoice.amount} ₼</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Əvvəlki Ödəniş:</span>
                <strong style={{ color: "#10b981" }}>{paymentModalInvoice.paidAmount} ₼</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Qalıq Borc:</span>
                <strong style={{ color: "#ef4444" }}>
                  {Math.max(0, paymentModalInvoice.amount - paymentModalInvoice.paidAmount)} ₼
                </strong>
              </div>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className={styles.form}>
              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>Ödənilən Məbləğ (₼) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  />
                </div>

                  <div className={styles.inputGroup}>
                    <label>Ödəniş Üsulu</label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    >
                      <option value="CASH">Nağd (CASH)</option>
                      <option value="CARD">Kartla (CARD)</option>
                      <option value="BANK_TRANSFER">Bank Köçürməsi</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Dərs Saatı</label>
                  <input
                    type="text"
                    placeholder="Məs: Həftəiçi 19:00 - 20:30"
                    value={paymentForm.lessonTime}
                    onChange={e => setPaymentForm({ ...paymentForm, lessonTime: e.target.value })}
                  />
                </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setPaymentModalInvoice(null)}
                >
                  Ləğv et
                </button>
                <button type="submit" className={styles.payActionBtn}>
                  Ödənişi Təsdiq Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <ContractModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}
