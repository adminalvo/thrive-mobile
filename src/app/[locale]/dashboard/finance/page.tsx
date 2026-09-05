"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, Users, 
  CreditCard, Search, Download, Plus, Filter, 
  Calendar, CheckCircle2, AlertCircle, Clock, 
  ArrowRightLeft, Wallet, Building2, Phone, MessageSquare,
  Sparkles, RefreshCw, Layers, ShieldCheck, Tag, Trash2, Edit, X, PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import styles from "./page.module.css";

interface StudentEnrollment {
  id: string;
  student_id?: string;
  student_name: string;
  subject: string;
  type: string;
  teacher_name: string;
  payment_day: number;
  amount: number;
  lesson_count: number;
  status: 'Asked' | 'Not asked' | 'Paid';
  payment_method?: string | null;
  student_phone?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  period_code: string;
}

interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  contract_amount: number;
  paid_amount: number;
  remaining_amount: number;
  date: string;
  description: string;
}

interface DailyTransaction {
  id: string;
  account_id: string;
  accountName?: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  category: string;
  periodCode?: string;
}

interface BankAccount {
  id: string;
  name: string;
  code: string;
  bankName: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
}

interface PricingStandard {
  id: string;
  course_name: string;
  group_price: number | null;
  individual_price: number | null;
  schedule: string;
  audience: string;
  language: string;
  duration: string;
  max_students: string;
}

export default function FinanceDashboardPage() {
  const t = useTranslations("Finance");

  // 4 Core Tabs
  const [activeTab, setActiveTab] = useState<'students' | 'expenses' | 'accounts' | 'pricing'>('students');
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>("2026-09");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [dailyTxs, setDailyTxs] = useState<DailyTransaction[]>([]);
  const [pricingList, setPricingList] = useState<PricingStandard[]>([]);

  // Selection & Filters
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'Paid' | 'Asked' | 'Not asked'>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals for Operations
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [targetEnrollment, setTargetEnrollment] = useState<StudentEnrollment | null>(null);
  const [collectForm, setCollectForm] = useState({ paymentMethod: 'ABB Card', accountId: '', amount: '' });

  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [studentForm, setStudentForm] = useState({
    studentName: '', subject: 'SAT Math', type: 'Group', teacherName: 'Tamerlan',
    paymentDay: '5', amount: '270', lessonCount: '8', studentPhone: '', parentName: '', parentPhone: ''
  });

  const [showPayDebtModal, setShowPayDebtModal] = useState<boolean>(false);
  const [targetExpense, setTargetExpense] = useState<ExpenseRecord | null>(null);
  const [debtForm, setDebtForm] = useState({ payAmount: '', accountId: '', note: '' });

  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [newExpenseForm, setNewExpenseForm] = useState({
    category: 'İcarə haqqı (Rent)', contractAmount: '1000', amount: '500', remainingAmount: '500',
    date: new Date().toISOString().split('T')[0], description: '', accountId: ''
  });

  const [showAddTxModal, setShowAddTxModal] = useState<boolean>(false);
  const [txForm, setTxForm] = useState({
    accountId: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE', amount: '',
    comment: '', category: 'Təsərrüfat', date: new Date().toISOString().split('T')[0]
  });

  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferForm, setTransferForm] = useState({
    sourceAccountId: '', destinationAccountId: '', amount: '', note: ''
  });

  const [showNewPeriodModal, setShowNewPeriodModal] = useState<boolean>(false);
  const [newPeriodForm, setNewPeriodForm] = useState({
    code: '2026-10', name: '2026 Oktyabr', startDate: '2026-10-01', endDate: '2026-10-31', cloneFrom: '2026-09'
  });

  const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
  const [newAccountForm, setNewAccountForm] = useState({
    name: '', bankName: '', initialBalance: '', currency: 'AZN'
  });

  // Edit State
  const [editEnrollment, setEditEnrollment] = useState<StudentEnrollment | null>(null);
  const [editExpense, setEditExpense] = useState<ExpenseRecord | null>(null);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [editTx, setEditTx] = useState<DailyTransaction | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Dynamic Teachers & Subjects
  const [liveTeachers, setLiveTeachers] = useState<any[]>([]);
  const [isCustomTeacher, setIsCustomTeacher] = useState<boolean>(false);
  const [customTeacher, setCustomTeacher] = useState<string>('');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
  const [customSubject, setCustomSubject] = useState<string>('');

  // Load Data
  const loadFinanceData = async (periodCode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/finance/bootstrap?periodCode=${periodCode}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.studentCourseEnrollments || []);
        setExpenses(data.expenses || []);
        setAccounts(data.accounts || []);
        setDailyTxs(data.dailyTransactions || []);
        setPricingList(data.pricingStandards || []);
        setLiveTeachers(data.teachers || []);
      } else {
        toast.error("Məlumatlar yüklənərkən xəta baş verdi");
      }
    } catch {
      toast.error("Şəbəkə xətası");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData(selectedPeriodCode);
  }, [selectedPeriodCode]);

  // Current day of month
  const currentDay = useMemo(() => {
    const d = new Date().getDate();
    return d <= 30 ? d : 30;
  }, []);

  // Filtered Students
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      if (statusFilter === 'today' && e.payment_day !== currentDay) return false;
      if (statusFilter === 'Paid' && e.status !== 'Paid') return false;
      if (statusFilter === 'Asked' && e.status !== 'Asked') return false;
      if (statusFilter === 'Not asked' && e.status !== 'Not asked') return false;

      if (teacherFilter !== 'all' && e.teacher_name !== teacherFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = (e.student_name || '').toLowerCase().includes(q);
        const mSubj = (e.subject || '').toLowerCase().includes(q);
        const mParent = (e.parent_name || '').toLowerCase().includes(q);
        const mPhone = (e.parent_phone || '').includes(q) || (e.student_phone || '').includes(q);
        if (!mName && !mSubj && !mParent && !mPhone) return false;
      }
      return true;
    });
  }, [enrollments, statusFilter, currentDay, teacherFilter, searchQuery]);

  const allTeachers = useMemo(() => {
    const fromDb = (liveTeachers || []).map((t: any) => t.name).filter(Boolean);
    const fromEnrollments = enrollments.map(e => e.teacher_name).filter(Boolean);
    const combined = Array.from(new Set([...fromDb, ...fromEnrollments]));
    return combined.length > 0 ? combined : ["Tamerlan", "Nadir", "Ayan", "Nargiz", "Ulvi", "Medina", "Javid"];
  }, [liveTeachers, enrollments]);

  const allSubjects = useMemo(() => {
    const fromPricing = (pricingList || []).map((p: any) => p.course_name).filter(Boolean);
    const fromEnrollments = enrollments.map(e => e.subject).filter(Boolean);
    const defaults = ["SAT Math", "SAT Verbal", "IELTS", "General English", "CSCA Math", "Math Senior", "Math 11th", "Math Olympic", "AP Economics", "AP Statistics"];
    return Array.from(new Set([...defaults, ...fromPricing, ...fromEnrollments]));
  }, [pricingList, enrollments]);

  const handleCourseSelection = (subj: string, typ: string) => {
    const matched = pricingList.find(p => p.course_name.toLowerCase().trim() === subj.toLowerCase().trim());
    let amt = studentForm.amount;
    if (matched) {
      if (typ === 'Individual' && matched.individual_price) amt = matched.individual_price.toString();
      else if (matched.group_price) amt = matched.group_price.toString();
    }
    setStudentForm(prev => ({ ...prev, subject: subj, type: typ, amount: amt }));
  };

  const uniqueTeachers = allTeachers;

  // KPIs
  const kpis = useMemo(() => {
    const totalTarget = enrollments.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const paidSum = enrollments
      .filter(e => e.status === 'Paid')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalExpensePaid = expenses.reduce((sum, e) => sum + Number(e.paid_amount || e.amount || 0), 0);
    const totalRemainingDebt = expenses.reduce((sum, e) => sum + Number(e.remaining_amount || 0), 0);
    const netProfit = (paidSum || totalTarget) - totalExpensePaid;
    const totalCash = accounts.reduce((sum, a) => sum + Number(a.initialBalance || 0), 0);

    return {
      totalTarget: totalTarget || 20595,
      paidSum: paidSum || 1450,
      totalExpensePaid: totalExpensePaid || 11295,
      totalRemainingDebt: totalRemainingDebt || 6803,
      netProfit: netProfit || 9300,
      totalCash: totalCash || 7316
    };
  }, [enrollments, expenses, accounts]);

  // Operational vs Payroll expenses
  const { operationalExpenses, payrollExpenses } = useMemo(() => {
    const op: ExpenseRecord[] = [];
    const pay: ExpenseRecord[] = [];
    expenses.forEach(exp => {
      const cat = exp.category.toLowerCase();
      if (cat.includes('maaş') || cat.includes('tamerlan') || cat.includes('nadir') || cat.includes('nərgiz') || cat.includes('orxan') || cat.includes('humay') || cat.includes('adil') || cat.includes('javid') || cat.includes('ayan') || cat.includes('nailə')) {
        pay.push(exp);
      } else {
        op.push(exp);
      }
    });
    return { operationalExpenses: op, payrollExpenses: pay };
  }, [expenses]);

  // Dynamic Expenses Pie Chart Data Breakdown
  const expensePieData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { total: 0, items: [] };
    }

    const categoriesMap: Record<string, { key: string; label: string; color: string; paid: number; remaining: number; contract: number }> = {
      payroll: { key: "payroll", label: t("pie.payroll"), color: "#38bdf8", paid: 0, remaining: 0, contract: 0 },
      rent: { key: "rent", label: t("pie.rent"), color: "#818cf8", paid: 0, remaining: 0, contract: 0 },
      marketing: { key: "marketing", label: t("pie.marketing"), color: "#f472b6", paid: 0, remaining: 0, contract: 0 },
      utilities: { key: "utilities", label: t("pie.utilities"), color: "#fb923c", paid: 0, remaining: 0, contract: 0 },
      taxes: { key: "taxes", label: t("pie.taxes"), color: "#34d399", paid: 0, remaining: 0, contract: 0 },
      other: { key: "other", label: t("pie.other"), color: "#a78bfa", paid: 0, remaining: 0, contract: 0 },
    };

    expenses.forEach((e) => {
      const cat = (e.category || "").toLowerCase();
      const paid = Number(e.paid_amount || e.amount || 0);
      const rem = Number(e.remaining_amount || 0);
      const contract = Number(e.contract_amount || (paid + rem) || 0);

      if (cat.includes("maaş") || cat.includes("tamerlan") || cat.includes("nadir") || cat.includes("nərgiz") || cat.includes("orxan") || cat.includes("humay") || cat.includes("adil") || cat.includes("javid") || cat.includes("ayan") || cat.includes("nailə")) {
        categoriesMap.payroll.paid += paid;
        categoriesMap.payroll.remaining += rem;
        categoriesMap.payroll.contract += contract;
      } else if (cat.includes("icarə") || cat.includes("rent") || cat.includes("ofis")) {
        categoriesMap.rent.paid += paid;
        categoriesMap.rent.remaining += rem;
        categoriesMap.rent.contract += contract;
      } else if (cat.includes("market") || cat.includes("smm") || cat.includes("reklam") || cat.includes("zeyn")) {
        categoriesMap.marketing.paid += paid;
        categoriesMap.marketing.remaining += rem;
        categoriesMap.marketing.contract += contract;
      } else if (cat.includes("kommunal") || cat.includes("internet") || cat.includes("rabitə") || cat.includes("işıq") || cat.includes("su") || cat.includes("qaz") || cat.includes("dəftərxana")) {
        categoriesMap.utilities.paid += paid;
        categoriesMap.utilities.remaining += rem;
        categoriesMap.utilities.contract += contract;
      } else if (cat.includes("vergi") || cat.includes("dsmf") || cat.includes("rəsmi") || cat.includes("bank")) {
        categoriesMap.taxes.paid += paid;
        categoriesMap.taxes.remaining += rem;
        categoriesMap.taxes.contract += contract;
      } else {
        categoriesMap.other.paid += paid;
        categoriesMap.other.remaining += rem;
        categoriesMap.other.contract += contract;
      }
    });

    const activeItems = Object.values(categoriesMap).filter((item) => item.contract > 0 || item.paid > 0);
    const totalExpenses = activeItems.reduce((sum, item) => sum + (item.paid > 0 ? item.paid : item.contract), 0);

    let accumulatedPercentage = 0;
    const itemsWithPerc = activeItems.map((item, idx) => {
      const val = item.paid > 0 ? item.paid : item.contract;
      const percentage = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
      const startPerc = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return {
        ...item,
        id: idx,
        value: val,
        percentage,
        startPerc,
      };
    });

    return { total: totalExpenses, items: itemsWithPerc };
  }, [expenses, t]);

  // Teacher badge style
  const getTeacherBadgeClass = (teacher: string) => {
    const tLower = (teacher || '').toLowerCase();
    if (tLower.includes('tamerlan')) return `${styles.teacherBadge} ${styles.teacherTamerlan}`;
    if (tLower.includes('nadir')) return `${styles.teacherBadge} ${styles.teacherNadir}`;
    if (tLower.includes('ayan')) return `${styles.teacherBadge} ${styles.teacherAyan}`;
    if (tLower.includes('nargiz')) return `${styles.teacherBadge} ${styles.teacherNargiz}`;
    if (tLower.includes('ulvi')) return `${styles.teacherBadge} ${styles.teacherUlvi}`;
    if (tLower.includes('medina')) return `${styles.teacherBadge} ${styles.teacherMedina}`;
    return styles.teacherBadge;
  };

  // Mark Asked
  const handleMarkAsked = async (id: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: 'Asked' } : e));
    try {
      await fetch("/api/finance/student-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ASKED", id })
      });
      toast.success(t("status.asked"));
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  // Collect Payment
  const handleOpenCollect = (item: StudentEnrollment) => {
    setTargetEnrollment(item);
    setCollectForm({
      paymentMethod: item.payment_method || 'ABB Card',
      accountId: accounts[1]?.id || accounts[0]?.id || '',
      amount: item.amount.toString()
    });
    setShowCollectModal(true);
  };

  const handleConfirmCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnrollment) return;
    const payAmt = Number(collectForm.amount) || targetEnrollment.amount;

    setEnrollments(prev => prev.map(e => e.id === targetEnrollment.id ? { 
      ...e, status: 'Paid', payment_method: collectForm.paymentMethod 
    } : e));
    setShowCollectModal(false);
    toast.success(t("status.paid"));

    try {
      await fetch("/api/finance/student-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COLLECT_PAYMENT",
          id: targetEnrollment.id,
          amount: payAmt,
          paymentMethod: collectForm.paymentMethod,
          accountId: collectForm.accountId,
          periodCode: selectedPeriodCode
        })
      });
      loadFinanceData(selectedPeriodCode);
    } catch {
      toast.error("Sinxronizasiya xətası");
    }
  };

  // Batch Status
  const handleBatchMark = async (status: 'Asked' | 'Paid' | 'Not asked') => {
    if (selectedIds.length === 0) return;
    setEnrollments(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, status } : e));
    const count = selectedIds.length;
    setSelectedIds([]);
    toast.success(`${count} tələbə yeniləndi`);

    try {
      await fetch("/api/finance/student-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BATCH_STATUS", ids: selectedIds, status })
      });
      loadFinanceData(selectedPeriodCode);
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEnrollments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEnrollments.map(e => e.id));
    }
  };

  // Rollover
  const handleCreateNewPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newPeriodForm.code,
          name: newPeriodForm.name,
          startDate: newPeriodForm.startDate,
          endDate: newPeriodForm.endDate,
          cloneFromPeriod: newPeriodForm.cloneFrom
        })
      });
      if (res.ok) {
        toast.success(`Dövr (${newPeriodForm.name}) uğurla açıldı!`);
        setShowNewPeriodModal(false);
        setSelectedPeriodCode(newPeriodForm.code);
        loadFinanceData(newPeriodForm.code);
      } else {
        toast.error("Dövr yaradılarkən xəta baş verdi");
      }
    } catch {
      toast.error("Şəbəkə xətası");
    }
  };

  // Edit / Delete Student
  const handleSaveEditEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEnrollment) return;
    try {
      const res = await fetch("/api/finance/student-payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEnrollment)
      });
      if (res.ok) {
        toast.success("Məlumatlar yeniləndi!");
        setEditEnrollment(null);
        loadFinanceData(selectedPeriodCode);
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!confirm("Bu tələbə qeydiyyatını silmək istəyirsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/student-payments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Qeydiyyat silindi");
        loadFinanceData(selectedPeriodCode);
      }
    } catch {
      toast.error("Silinmə xətası");
    }
  };

  // Edit / Delete Expense
  const handleSaveEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExpense) return;
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExpense)
      });
      if (res.ok) {
        toast.success("Xərc yeniləndi!");
        setEditExpense(null);
        loadFinanceData(selectedPeriodCode);
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Bu xərc maddəsini silmək istəyirsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Xərc silindi");
        loadFinanceData(selectedPeriodCode);
      }
    } catch {
      toast.error("Silinmə xətası");
    }
  };

  // Create, Edit & Delete Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountForm.name.trim()) {
      toast.error("Hesab adı daxil edilməlidir");
      return;
    }
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ACCOUNT",
          name: newAccountForm.name.trim(),
          bank_name: newAccountForm.bankName.trim() || "Standart Bank",
          initial_balance: Number(newAccountForm.initialBalance) || 0,
          currency: newAccountForm.currency || "AZN"
        })
      });
      if (res.ok) {
        toast.success("Yeni hesab əlavə edildi!");
        setShowAddAccountModal(false);
        setNewAccountForm({ name: '', bankName: '', initialBalance: '', currency: 'AZN' });
        loadFinanceData(selectedPeriodCode);
      } else {
        toast.error("Hesab yaradıla bilmədi");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleSaveEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editAccount.id,
          name: editAccount.name,
          bankName: editAccount.bankName,
          bank_name: editAccount.bankName,
          accountNumber: editAccount.accountNumber,
          account_number: editAccount.accountNumber,
          initialBalance: editAccount.initialBalance,
          initial_balance: editAccount.initialBalance
        })
      });
      if (res.ok) {
        toast.success("Hesab məlumatları yeniləndi!");
        setEditAccount(null);
        loadFinanceData(selectedPeriodCode);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Yenilənmə xətası");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`"${name}" hesabını silmək istədiyinizə əminsiniz?`)) return;
    try {
      const res = await fetch(`/api/finance/accounts?id=${id}&target=ACCOUNT`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Hesab silindi");
        if (editAccount?.id === id) setEditAccount(null);
        loadFinanceData(selectedPeriodCode);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Hesabı silmək mümkün olmadı");
      }
    } catch {
      toast.error("Silinmə xətası");
    }
  };

  // Edit / Delete Transaction
  const handleSaveEditTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTx) return;
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          target: "TRANSACTION", 
          ...editTx,
          comment: editTx.description,
          description: editTx.description
        })
      });
      if (res.ok) {
        toast.success("Kassa əməliyyatı yeniləndi!");
        setEditTx(null);
        loadFinanceData(selectedPeriodCode);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Yenilənmə xətası");
      }
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm("Bu kassa əməliyyatını silmək istəyirsiniz?")) return;
    try {
      const res = await fetch(`/api/finance/accounts?id=${id}&target=TRANSACTION`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Əməliyyat silindi");
        if (editTx?.id === id) setEditTx(null);
        loadFinanceData(selectedPeriodCode);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Silinmə xətası");
      }
    } catch {
      toast.error("Silinmə xətası");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      t("table.day"),
      t("table.studentAndSubject"),
      t("table.teacher"),
      t("table.amount"),
      t("table.status"),
      t("table.parentAndContact")
    ];
    const rows = filteredEnrollments.map(e => [
      e.payment_day,
      `"${e.student_name} (${e.subject})"`,
      `"${e.teacher_name}"`,
      e.amount,
      `"${e.status}"`,
      `"${e.parent_name || '-'} (${e.parent_phone || '-'})"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Thrive_Finance_${selectedPeriodCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel/CSV faylı endirildi!");
  };

  return (
    <div className={styles.container}>
      {/* --- SƏLİQƏLİ BAŞLIQ --- */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.periodSwitcher}>
            <Calendar size={15} color="#38bdf8" />
            <select 
              value={selectedPeriodCode} 
              onChange={(e) => setSelectedPeriodCode(e.target.value)}
              className={styles.periodSelect}
            >
              <option value="2026-09">2026 Sentyabr</option>
              <option value="2026-10">2026 Oktyabr</option>
              <option value="2026-08">2026 Avqust</option>
            </select>
          </div>

          <button className={styles.btnPrimary} onClick={() => setShowNewPeriodModal(true)}>
            <Plus size={14} />
            <span>{t("btnNewPeriod")}</span>
          </button>

          <button className={styles.btnTransfer} onClick={() => setShowTransferModal(true)}>
            <ArrowRightLeft size={14} />
            <span>{t("btnInternalTransfer")}</span>
          </button>

          <button className={styles.btnExport} onClick={handleExportCSV}>
            <Download size={14} />
            <span>{t("btnExportExcel")}</span>
          </button>
        </div>
      </div>

      {/* --- 4 ƏSAS KPI GÖSTƏRİCİSİ --- */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
            <DollarSign size={22} />
          </div>
          <div className={styles.kpiDetails}>
            <span className={styles.kpiLabel}>{t("kpis.plannedRevenue")}</span>
            <div className={styles.kpiValue}>
              {kpis.totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₼
            </div>
            <span className={styles.kpiSub} style={{ color: "#34d399" }}>
              {t("kpis.actualCollected")} {kpis.paidSum.toLocaleString()} ₼
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
            <ArrowDownRight size={22} />
          </div>
          <div className={styles.kpiDetails}>
            <span className={styles.kpiLabel}>{t("kpis.monthlyExpenses")}</span>
            <div className={styles.kpiValue} style={{ color: "#ef4444" }}>
              -{kpis.totalExpensePaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₼
            </div>
            <span className={styles.kpiSub} style={{ color: "#f87171" }}>
              {t("kpis.remainingDebt")} -{kpis.totalRemainingDebt.toLocaleString()} ₼
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
            <ArrowUpRight size={22} />
          </div>
          <div className={styles.kpiDetails}>
            <span className={styles.kpiLabel}>{t("kpis.netProfit")}</span>
            <div className={styles.kpiValue} style={{ color: "#38bdf8" }}>
              {kpis.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₼
            </div>
            <span className={styles.kpiSub} style={{ color: "#7dd3fc" }}>
              {t("kpis.margin")} 45.2%
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>
            <Wallet size={22} />
          </div>
          <div className={styles.kpiDetails}>
            <span className={styles.kpiLabel}>{t("kpis.cashAndAccounts")}</span>
            <div className={styles.kpiValue} style={{ color: "#fbbf24" }}>
              {kpis.totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₼
            </div>
            <span className={styles.kpiSub} style={{ color: "#94a3b8" }}>
              {t("kpis.activeAccounts")}
            </span>
          </div>
        </div>
      </div>

      {/* --- XƏRCLƏRİN PARÇALARA BÖLGÜSÜ (PIE CHART) --- */}
      <div className={styles.pieSection}>
        <div className={styles.pieHeader}>
          <div className={styles.pieTitleGroup}>
            <h3 className={styles.pieTitle}>
              <PieChart size={20} style={{ color: "#38bdf8" }} />
              <span>{t("pie.title")}</span>
            </h3>
            <p className={styles.pieSubtitle}>{t("pie.subtitle")}</p>
          </div>
          <span className={styles.pieBadge}>
            {expensePieData.items.length} {t("pie.title").toLowerCase().includes("pie") ? "kateqoriya" : "kateqoriya"}
          </span>
        </div>

        {expensePieData.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontSize: "0.9rem" }}>
            {t("pie.empty")}
          </div>
        ) : (
          <div className={styles.pieBody}>
            {/* Donut Chart SVG */}
            <div className={styles.pieSvgWrapper}>
              <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
                {/* Background Ring */}
                <circle
                  cx="110"
                  cy="110"
                  r="70"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="24"
                />

                {/* Data Segments */}
                {expensePieData.items.map((item, idx) => {
                  const circumference = 2 * Math.PI * 70; // ~439.82
                  const strokeDasharray = `${Math.max(0.1, (item.percentage / 100) * circumference)} ${circumference}`;
                  const strokeDashoffset = -((item.startPerc / 100) * circumference);
                  const isHovered = hoveredPieIndex === idx;

                  return (
                    <circle
                      key={item.id}
                      cx="110"
                      cy="110"
                      r="70"
                      fill="none"
                      stroke={item.color}
                      strokeWidth={isHovered ? 32 : 24}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        opacity: hoveredPieIndex === null || isHovered ? 1 : 0.45,
                        filter: isHovered ? `drop-shadow(0 0 8px ${item.color})` : "none",
                      }}
                      onMouseEnter={() => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Details */}
              <div className={styles.pieCenterText}>
                {hoveredPieIndex !== null && expensePieData.items[hoveredPieIndex] ? (
                  <>
                    <div className={styles.pieCenterAmount} style={{ color: expensePieData.items[hoveredPieIndex].color }}>
                      {expensePieData.items[hoveredPieIndex].percentage.toFixed(1)}%
                    </div>
                    <div className={styles.pieCenterLabel} title={expensePieData.items[hoveredPieIndex].label}>
                      {expensePieData.items[hoveredPieIndex].label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#f8fafc", fontWeight: 700, marginTop: "2px" }}>
                      {expensePieData.items[hoveredPieIndex].value.toLocaleString()} ₼
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.pieCenterAmount} style={{ color: "#38bdf8" }}>
                      {expensePieData.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₼
                    </div>
                    <div className={styles.pieCenterLabel}>
                      {t("pie.totalExpenses")}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Legend Cards */}
            <div className={styles.pieLegendGrid}>
              {expensePieData.items.map((item, idx) => {
                const isHovered = hoveredPieIndex === idx;
                return (
                  <div
                    key={item.id}
                    className={`${styles.pieLegendItem} ${isHovered ? styles.pieLegendItemActive : ''}`}
                    onMouseEnter={() => setHoveredPieIndex(idx)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  >
                    <div className={styles.pieLegendTop}>
                      <div className={styles.pieLegendCategory}>
                        <span className={styles.pieDot} style={{ background: item.color, boxShadow: isHovered ? `0 0 8px ${item.color}` : 'none' }} />
                        <span>{item.label}</span>
                      </div>
                      <span className={styles.pieLegendPercent} style={{ color: item.color }}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className={styles.pieProgressBarBg}>
                      <div
                        className={styles.pieProgressBarFill}
                        style={{
                          width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>

                    <div className={styles.pieLegendBottom}>
                      <span>{t("pie.paidExpenses")}: <strong style={{ color: "#10b981" }}>{item.paid.toLocaleString()} ₼</strong></span>
                      {item.remaining > 0 && (
                        <span>{t("pie.remainingDebt")}: <strong style={{ color: "#f87171" }}>-{item.remaining.toLocaleString()} ₼</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- 4 ƏSAS TAB --- */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'students' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} />
          <span>{t("tabs.students")}</span>
          <span className={styles.tabBadge}>{enrollments.length}</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'expenses' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <ArrowDownRight size={16} />
          <span>{t("tabs.expenses")}</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'accounts' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <Wallet size={16} />
          <span>{t("tabs.accounts")}</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'pricing' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <Tag size={16} />
          <span>{t("tabs.pricing")}</span>
          <span className={styles.tabBadge}>23</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TƏLƏBƏ ÖDƏNİŞLƏRİ VƏ REYESTR */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className={styles.tabContent}>
          {/* Təmiz Süzgəclər */}
          <div className={styles.filterCard}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <button 
                  className={`${styles.dayFilterPill} ${statusFilter === 'all' ? styles.dayFilterPillActive : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  {t("filters.allStudents")} ({enrollments.length})
                </button>

                <button 
                  className={`${styles.dayFilterPill} ${statusFilter === 'today' ? styles.dayFilterPillActive : ''}`}
                  onClick={() => setStatusFilter('today')}
                  style={{ background: statusFilter === 'today' ? undefined : "rgba(239, 68, 68, 0.12)", color: statusFilter === 'today' ? undefined : "#f87171" }}
                >
                  {t("filters.todayPayments")} ({currentDay})
                </button>

                <button 
                  className={`${styles.dayFilterPill} ${statusFilter === 'Paid' ? styles.dayFilterPillActive : ''}`}
                  onClick={() => setStatusFilter('Paid')}
                >
                  {t("filters.paid")}
                </button>

                <button 
                  className={`${styles.dayFilterPill} ${statusFilter === 'Asked' ? styles.dayFilterPillActive : ''}`}
                  onClick={() => setStatusFilter('Asked')}
                >
                  {t("filters.asked")}
                </button>

                <button 
                  className={`${styles.dayFilterPill} ${statusFilter === 'Not asked' ? styles.dayFilterPillActive : ''}`}
                  onClick={() => setStatusFilter('Not asked')}
                >
                  {t("filters.waiting")}
                </button>
              </div>

              <div className={styles.filterGroup}>
                <input 
                  type="text" 
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  style={{ minWidth: "220px" }}
                />

                <select 
                  value={teacherFilter} 
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="all">{t("filters.allTeachers")}</option>
                  {uniqueTeachers.map(tc => (
                    <option key={tc} value={tc}>{tc} {t("filters.teacherSuffix")}</option>
                  ))}
                </select>

                <button className={styles.btnPrimary} onClick={() => setShowAddStudentModal(true)}>
                  <Plus size={14} />
                  <span>{t("filters.btnNewStudent")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Toplu Əməliyyat Zolağı */}
          {selectedIds.length > 0 && (
            <motion.div 
              className={styles.batchToolbar}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.batchInfo}>
                <CheckCircle2 size={16} color="#38bdf8" />
                <span>{t("batch.selectedCount", { count: selectedIds.length })}</span>
              </div>
              <div className={styles.batchActions}>
                <button className={styles.batchBtnPaid} onClick={() => handleBatchMark('Paid')}>
                  {t("batch.markPaid")}
                </button>
                <button className={styles.batchBtnAsked} onClick={() => handleBatchMark('Asked')}>
                  {t("batch.markAsked")}
                </button>
                <button className={styles.batchBtnReset} onClick={() => setSelectedIds([])}>
                  {t("batch.resetSelection")}
                </button>
              </div>
            </motion.div>
          )}

          {/* Əsas Cədvəl */}
          <div className={styles.tableCard}>
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: "36px", textAlign: "center" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                        onChange={handleToggleSelectAll}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                    </th>
                    <th style={{ width: "60px" }}>{t("table.day")}</th>
                    <th>{t("table.studentAndSubject")}</th>
                    <th>{t("table.teacher")}</th>
                    <th>{t("table.amount")}</th>
                    <th>{t("table.parentAndContact")}</th>
                    <th>{t("table.status")}</th>
                    <th style={{ textAlign: "right" }}>{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                        {t("table.noData")}
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((st) => (
                      <tr key={st.id}>
                        <td style={{ textAlign: "center" }}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(st.id)}
                            onChange={() => {
                              setSelectedIds(prev => prev.includes(st.id) 
                                ? prev.filter(x => x !== st.id) 
                                : [...prev, st.id]
                              );
                            }}
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                        </td>
                        <td>
                          <span className={styles.dayBadge}>
                            {st.payment_day}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                              {st.student_id ? (
                                <Link 
                                  href={`/dashboard/students/${st.student_id}`}
                                  style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.92rem", textDecoration: "none" }}
                                  title="CRM Profilini Aç"
                                >
                                  {st.student_name}
                                </Link>
                              ) : (
                                <span style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.92rem" }}>
                                  {st.student_name}
                                </span>
                              )}
                              <span className={styles.subjectPill}>
                                {st.subject}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                              {st.type} • {st.lesson_count} {t("table.lessons")} {st.student_phone ? `• ${st.student_phone}` : ''}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={getTeacherBadgeClass(st.teacher_name)}>
                            {st.teacher_name}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                            <span style={{ fontWeight: 700, color: "#10b981", fontSize: "0.95rem" }}>
                              {st.amount.toFixed(2)} ₼
                            </span>
                            <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                              {t("table.dayOfMonth", { day: st.payment_day })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.84rem" }}>
                                {st.parent_name || t("table.notSpecified")}
                              </span>
                              <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                                {st.parent_phone || '-'}
                              </span>
                            </div>
                            {st.parent_phone && (
                              <a 
                                href={`https://wa.me/${st.parent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(st.student_name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.btnWhatsApp}
                                title="WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          {st.status === 'Paid' ? (
                            <span className={styles.statusPaidBadge}>
                              <CheckCircle2 size={12} />
                              <span>{t("status.paid")} {st.payment_method ? `(${st.payment_method})` : ''}</span>
                            </span>
                          ) : st.status === 'Asked' ? (
                            <span className={styles.statusAskedBadge}>
                              <Clock size={12} />
                              <span>{t("status.asked")}</span>
                            </span>
                          ) : (
                            <span className={styles.statusNotAskedBadge}>
                              <span>{t("status.waiting")}</span>
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                            {st.status !== 'Paid' && (
                              <>
                                {st.status !== 'Asked' && (
                                  <button 
                                    className={styles.btnActionAsked} 
                                    onClick={() => handleMarkAsked(st.id)}
                                    title={t("status.asked")}
                                  >
                                    <Phone size={12} />
                                    <span>{t("status.asked")}</span>
                                  </button>
                                )}
                                <button 
                                  className={styles.btnActionCollect} 
                                  onClick={() => handleOpenCollect(st)}
                                  title={t("expenses.btnPay")}
                                >
                                  <CreditCard size={12} />
                                  <span>{t("expenses.btnPay")}</span>
                                </button>
                              </>
                            )}

                            <button 
                              className={styles.btnSecondary} 
                              style={{ padding: "0.35rem 0.55rem" }}
                              onClick={() => setEditEnrollment(st)}
                              title={t("table.actions")}
                            >
                              <Edit size={13} />
                            </button>

                            <button 
                              className={styles.btnSecondary} 
                              style={{ padding: "0.35rem 0.55rem", color: "#ef4444" }}
                              onClick={() => handleDeleteEnrollment(st.id)}
                              title={t("modals.cancel")}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. XƏRCLƏR VƏ MAAŞLAR */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className={styles.tabContent}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className={styles.btnPrimary} onClick={() => setShowAddExpenseModal(true)}>
              <Plus size={14} />
              <span>{t("expenses.btnAddExpense")}</span>
            </button>
          </div>

          {/* Bölmə 1: İcarə və Əməliyyat Xərcləri */}
          <div className={styles.tableCard}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>
                {t("expenses.opTitle")}
              </h3>
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("expenses.tableCategory")}</th>
                    <th>{t("expenses.tableContractAmount")}</th>
                    <th>{t("expenses.tablePaid")}</th>
                    <th>{t("expenses.tableRemaining")}</th>
                    <th>{t("expenses.tableDate")}</th>
                    <th>{t("expenses.tableDesc")}</th>
                    <th style={{ textAlign: "right" }}>{t("expenses.tableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {operationalExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 600, color: "#ffffff" }}>{exp.category}</td>
                      <td>{exp.contract_amount.toFixed(2)} ₼</td>
                      <td style={{ color: "#ef4444", fontWeight: 600 }}>-{exp.paid_amount.toFixed(2)} ₼</td>
                      <td>
                        {exp.remaining_amount > 0 ? (
                          <span className={styles.debtBadge}>{t("expenses.debtPrefix")} -{exp.remaining_amount.toFixed(2)} ₼</span>
                        ) : (
                          <span className={styles.paidFullBadge}>{t("expenses.fullyPaid")}</span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{exp.date}</td>
                      <td style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{exp.description}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.3rem" }}>
                          {exp.remaining_amount > 0 && (
                            <button 
                              className={styles.btnActionCollect}
                              onClick={() => {
                                setTargetExpense(exp);
                                setDebtForm({ payAmount: exp.remaining_amount.toString(), accountId: accounts[0]?.id || '', note: '' });
                                setShowPayDebtModal(true);
                              }}
                            >
                              {t("expenses.btnPay")}
                            </button>
                          )}
                          <button className={styles.btnSecondary} style={{ padding: "0.3rem 0.5rem" }} onClick={() => setEditExpense(exp)}>
                            <Edit size={13} />
                          </button>
                          <button className={styles.btnSecondary} style={{ padding: "0.3rem 0.5rem", color: "#ef4444" }} onClick={() => handleDeleteExpense(exp.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bölmə 2: Müəllim və Heyət Maaşları */}
          <div className={styles.tableCard}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>
                {t("expenses.payrollTitle")}
              </h3>
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("expenses.tableStaff")}</th>
                    <th>{t("expenses.tableSalaryFund")}</th>
                    <th>{t("expenses.tableAdvance")}</th>
                    <th>{t("expenses.tableRemainingSalary")}</th>
                    <th>{t("expenses.tableDate")}</th>
                    <th>{t("expenses.tableDesc")}</th>
                    <th style={{ textAlign: "right" }}>{t("expenses.tableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 600, color: "#ffffff" }}>{exp.category}</td>
                      <td>{exp.contract_amount.toFixed(2)} ₼</td>
                      <td style={{ color: "#ef4444", fontWeight: 600 }}>-{exp.paid_amount.toFixed(2)} ₼</td>
                      <td>
                        {exp.remaining_amount > 0 ? (
                          <span className={styles.debtBadge}>{t("expenses.debtSalaryPrefix")} -{exp.remaining_amount.toFixed(2)} ₼</span>
                        ) : (
                          <span className={styles.paidFullBadge}>{t("expenses.fullyPaidSalary")}</span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{exp.date}</td>
                      <td style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{exp.description}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.3rem" }}>
                          {exp.remaining_amount > 0 && (
                            <button 
                              className={styles.btnActionCollect}
                              onClick={() => {
                                setTargetExpense(exp);
                                setDebtForm({ payAmount: exp.remaining_amount.toString(), accountId: accounts[0]?.id || '', note: '' });
                                setShowPayDebtModal(true);
                              }}
                            >
                              {t("expenses.btnPay")}
                            </button>
                          )}
                          <button className={styles.btnSecondary} style={{ padding: "0.3rem 0.5rem" }} onClick={() => setEditExpense(exp)}>
                            <Edit size={13} />
                          </button>
                          <button className={styles.btnSecondary} style={{ padding: "0.3rem 0.5rem", color: "#ef4444" }} onClick={() => handleDeleteExpense(exp.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KASSALAR VƏ ÇIXARIŞ JURNALI */}
      {/* ========================================================================= */}
      {activeTab === 'accounts' && (
        <div className={styles.tabContent}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                {t("tabs.accounts")}
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
                Kassalar, bank hesabları və cari qalıqlar
              </p>
            </div>
            <button 
              className={styles.btnPrimary}
              onClick={() => setShowAddAccountModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Plus size={15} />
              <span>Yeni Kassa / Hesab Əlavə Et</span>
            </button>
          </div>

          <div className={styles.kpiGrid}>
            {accounts.map((acc) => (
              <div key={acc.id} className={styles.kpiCard} style={{ position: "relative" }}>
                <div className={styles.kpiIconWrapper} style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
                  <Building2 size={22} />
                </div>
                <div className={styles.kpiDetails} style={{ flex: 1, paddingRight: "3.5rem" }}>
                  <span className={styles.kpiLabel}>{acc.name}</span>
                  <div className={styles.kpiValue} style={{ color: "#38bdf8", fontSize: "1.45rem" }}>
                    {acc.initialBalance.toFixed(2)} {acc.currency}
                  </div>
                  <span className={styles.kpiSub}>
                    {acc.bankName} • {acc.code}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.3rem", position: "absolute", top: "12px", right: "12px" }}>
                  <button 
                    className={styles.btnSecondary} 
                    style={{ padding: "0.25rem 0.45rem" }}
                    onClick={() => setEditAccount(acc)}
                    title="Redaktə et"
                  >
                    <Edit size={13} />
                  </button>
                  <button 
                    className={styles.btnSecondary} 
                    style={{ padding: "0.25rem 0.45rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.25)" }}
                    onClick={() => handleDeleteAccount(acc.id, acc.name)}
                    title="Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.filterCard} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>
                {t("accounts.journalTitle")}
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
                {t("accounts.journalSubtitle")}
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={() => setShowAddTxModal(true)}>
              <Plus size={14} />
              <span>{t("accounts.btnAddTx")}</span>
            </button>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("accounts.tableDate")}</th>
                    <th>{t("accounts.tableAccount")}</th>
                    <th>{t("accounts.tableType")}</th>
                    <th>{t("accounts.tableAmount")}</th>
                    <th>{t("accounts.tableCategory")}</th>
                    <th>{t("accounts.tableDesc")}</th>
                    <th style={{ textAlign: "right" }}>{t("accounts.tableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTxs.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{tx.date}</td>
                      <td style={{ fontWeight: 600, color: "#ffffff" }}>{tx.accountName || 'Nəğd Kassa'}</td>
                      <td>
                        {tx.type === 'INCOME' ? (
                          <span style={{ color: "#10b981", fontWeight: 600 }}>{t("status.income")}</span>
                        ) : tx.type === 'TRANSFER' ? (
                          <span style={{ color: "#38bdf8", fontWeight: 600 }}>{t("status.transfer")}</span>
                        ) : (
                          <span style={{ color: "#ef4444", fontWeight: 600 }}>{t("status.expense")}</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: tx.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toFixed(2)} ₼
                      </td>
                      <td>{tx.category || 'Kassa'}</td>
                      <td style={{ color: "#e2e8f0" }}>{tx.description}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.3rem" }}>
                          <button className={styles.btnSecondary} style={{ padding: "0.3rem 0.5rem" }} onClick={() => setEditTx(tx)}>
                            <Edit size={13} />
                          </button>
                          <button className={styles.btnSecondary} style={{ padding: "0.3rem 0.5rem", color: "#ef4444" }} onClick={() => handleDeleteTx(tx.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QİYMƏT KATALOQU */}
      {/* ========================================================================= */}
      {activeTab === 'pricing' && (
        <div className={styles.tabContent}>
          <div className={styles.tableCard}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>
                {t("pricing.title")}
              </h3>
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("pricing.tableCourse")}</th>
                    <th>{t("pricing.tableGroupPrice")}</th>
                    <th>{t("pricing.tableIndPrice")}</th>
                    <th>{t("pricing.tableSchedule")}</th>
                    <th>{t("pricing.tableAudience")}</th>
                    <th>{t("pricing.tableLanguage")}</th>
                    <th>{t("pricing.tableDuration")}</th>
                    <th>{t("pricing.tableMaxStudents")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingList.map((pr) => (
                    <tr key={pr.id}>
                      <td style={{ fontWeight: 600, color: "#38bdf8" }}>{pr.course_name}</td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>{pr.group_price ? `${pr.group_price.toFixed(2)} ₼` : '-'}</td>
                      <td style={{ fontWeight: 700, color: "#f59e0b" }}>{pr.individual_price ? `${pr.individual_price.toFixed(2)} ₼` : '-'}</td>
                      <td>{pr.schedule}</td>
                      <td>{pr.audience}</td>
                      <td>{pr.language}</td>
                      <td>{pr.duration}</td>
                      <td>{pr.max_students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALLAR */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNewPeriodModal && (
          <div className={styles.modalOverlay} onClick={() => setShowNewPeriodModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.newPeriodTitle")}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "-0.5rem", marginBottom: "1.2rem" }}>
                {t("modals.newPeriodDesc")}
              </p>

              <form onSubmit={handleCreateNewPeriod}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.periodCode")}</label>
                    <input type="text" placeholder="2026-10" value={newPeriodForm.code} onChange={(e) => setNewPeriodForm({ ...newPeriodForm, code: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.periodName")}</label>
                    <input type="text" placeholder="2026 Oktyabr" value={newPeriodForm.name} onChange={(e) => setNewPeriodForm({ ...newPeriodForm, name: e.target.value })} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.startDate")}</label>
                    <input type="date" value={newPeriodForm.startDate} onChange={(e) => setNewPeriodForm({ ...newPeriodForm, startDate: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.endDate")}</label>
                    <input type="date" value={newPeriodForm.endDate} onChange={(e) => setNewPeriodForm({ ...newPeriodForm, endDate: e.target.value })} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.cloneFrom")}</label>
                  <select value={newPeriodForm.cloneFrom} onChange={(e) => setNewPeriodForm({ ...newPeriodForm, cloneFrom: e.target.value })} className={styles.input}>
                    <option value="2026-09">2026 Sentyabr</option>
                    <option value="2026-08">2026 Avqust</option>
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowNewPeriodModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnStartPeriod")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redaktə: Tələbə */}
      <AnimatePresence>
        {editEnrollment && (
          <div className={styles.modalOverlay} onClick={() => setEditEnrollment(null)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.editStudentTitle")}</h3>

              <form onSubmit={handleSaveEditEnrollment}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.studentName")}</label>
                    <input type="text" value={editEnrollment.student_name} onChange={(e) => setEditEnrollment({ ...editEnrollment, student_name: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.studentPhone")}</label>
                    <input type="text" value={editEnrollment.student_phone || ''} onChange={(e) => setEditEnrollment({ ...editEnrollment, student_phone: e.target.value })} className={styles.input} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.subject")}</label>
                    <input 
                      type="text" 
                      list="edit-subjects-list"
                      value={editEnrollment.subject} 
                      onChange={(e) => setEditEnrollment({ ...editEnrollment, subject: e.target.value })} 
                      className={styles.input} 
                      required 
                    />
                    <datalist id="edit-subjects-list">
                      {allSubjects.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.format")}</label>
                    <select value={editEnrollment.type} onChange={(e) => setEditEnrollment({ ...editEnrollment, type: e.target.value })} className={styles.input}>
                      <option value="Group">{t("modals.group")}</option>
                      <option value="Mini Group">{t("modals.miniGroup")}</option>
                      <option value="Individual">{t("modals.individual")}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.teacher")}</label>
                    <input 
                      type="text" 
                      list="edit-teachers-list"
                      value={editEnrollment.teacher_name} 
                      onChange={(e) => setEditEnrollment({ ...editEnrollment, teacher_name: e.target.value })} 
                      className={styles.input} 
                      required 
                    />
                    <datalist id="edit-teachers-list">
                      {allTeachers.map(tc => <option key={tc} value={tc} />)}
                    </datalist>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.paymentDay")}</label>
                    <input type="number" min="1" max="30" value={editEnrollment.payment_day} onChange={(e) => setEditEnrollment({ ...editEnrollment, payment_day: Number(e.target.value) })} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.amount")}</label>
                    <input type="number" step="0.01" value={editEnrollment.amount} onChange={(e) => setEditEnrollment({ ...editEnrollment, amount: Number(e.target.value) })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.lessonCount")}</label>
                    <input type="number" value={editEnrollment.lesson_count} onChange={(e) => setEditEnrollment({ ...editEnrollment, lesson_count: Number(e.target.value) })} className={styles.input} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.parentName")}</label>
                    <input type="text" value={editEnrollment.parent_name || ''} onChange={(e) => setEditEnrollment({ ...editEnrollment, parent_name: e.target.value })} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.parentPhone")}</label>
                    <input type="text" value={editEnrollment.parent_phone || ''} onChange={(e) => setEditEnrollment({ ...editEnrollment, parent_phone: e.target.value })} className={styles.input} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.statusLabel")}</label>
                    <select value={editEnrollment.status} onChange={(e) => setEditEnrollment({ ...editEnrollment, status: e.target.value as any })} className={styles.input}>
                      <option value="Not asked">{t("status.waiting")}</option>
                      <option value="Asked">{t("status.asked")}</option>
                      <option value="Paid">{t("status.paid")}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.paymentMethod")}</label>
                    <input type="text" value={editEnrollment.payment_method || ''} onChange={(e) => setEditEnrollment({ ...editEnrollment, payment_method: e.target.value })} placeholder="ABB Card, UBank, Nəğd..." className={styles.input} />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setEditEnrollment(null)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.save")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Yeni Tələbə Modalı */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddStudentModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.addStudentTitle")}</h3>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const finalTeacher = isCustomTeacher ? customTeacher.trim() : studentForm.teacherName.trim();
                const finalSubject = isCustomSubject ? customSubject.trim() : studentForm.subject.trim();

                if (!studentForm.studentName.trim() || !finalSubject || !finalTeacher) {
                  toast.error("Zəhmət olmasa tələbə adı, fənn və müəllimi daxil edin");
                  return;
                }
                try {
                  const res = await fetch("/api/finance/student-payments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                      action: "ADD_COURSE", 
                      ...studentForm, 
                      teacherName: finalTeacher,
                      subject: finalSubject,
                      periodCode: selectedPeriodCode 
                    })
                  });
                  if (res.ok) {
                    toast.success("Yeni tələbə əlavə edildi!");
                    setShowAddStudentModal(false);
                    setStudentForm({
                      studentName: '', subject: 'SAT Math', type: 'Group', teacherName: allTeachers[0] || 'Tamerlan',
                      paymentDay: '5', amount: '270', lessonCount: '8', studentPhone: '', parentName: '', parentPhone: ''
                    });
                    setIsCustomTeacher(false);
                    setCustomTeacher('');
                    setIsCustomSubject(false);
                    setCustomSubject('');
                    loadFinanceData(selectedPeriodCode);
                  }
                } catch {
                  toast.error("Xəta baş verdi");
                }
              }}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.studentName")}</label>
                    <input type="text" placeholder="Məs: Fərhad Nağıyev" value={studentForm.studentName} onChange={(e) => setStudentForm({ ...studentForm, studentName: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.studentPhone")}</label>
                    <input type="text" placeholder="50-123-45-67" value={studentForm.studentPhone} onChange={(e) => setStudentForm({ ...studentForm, studentPhone: e.target.value })} className={styles.input} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className={styles.label}>{t("modals.subject")}</label>
                      <button 
                        type="button" 
                        onClick={() => setIsCustomSubject(!isCustomSubject)} 
                        style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.74rem", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {isCustomSubject ? t("modals.selectSubjectPrompt") : t("modals.customSubjectPrompt")}
                      </button>
                    </div>
                    {isCustomSubject ? (
                      <input 
                        type="text" 
                        placeholder="Yeni fənnin adını yazın..." 
                        value={customSubject} 
                        onChange={(e) => setCustomSubject(e.target.value)} 
                        className={styles.input} 
                        required 
                      />
                    ) : (
                      <select 
                        value={studentForm.subject} 
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setIsCustomSubject(true);
                          } else {
                            handleCourseSelection(e.target.value, studentForm.type);
                          }
                        }} 
                        className={styles.input}
                      >
                        {allSubjects.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="__NEW__">{t("modals.customSubjectPrompt")}</option>
                      </select>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.format")}</label>
                    <select 
                      value={studentForm.type} 
                      onChange={(e) => handleCourseSelection(isCustomSubject ? customSubject : studentForm.subject, e.target.value)} 
                      className={styles.input}
                    >
                      <option value="Group">{t("modals.group")}</option>
                      <option value="Mini Group">{t("modals.miniGroup")}</option>
                      <option value="Individual">{t("modals.individual")}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className={styles.label}>{t("modals.teacher")}</label>
                      <button 
                        type="button" 
                        onClick={() => setIsCustomTeacher(!isCustomTeacher)} 
                        style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.74rem", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {isCustomTeacher ? t("modals.selectTeacherPrompt") : t("modals.customTeacherPrompt")}
                      </button>
                    </div>
                    {isCustomTeacher ? (
                      <input 
                        type="text" 
                        placeholder="Yeni müəllimin adını yazın..." 
                        value={customTeacher} 
                        onChange={(e) => setCustomTeacher(e.target.value)} 
                        className={styles.input} 
                        required 
                      />
                    ) : (
                      <select 
                        value={studentForm.teacherName} 
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setIsCustomTeacher(true);
                          } else {
                            setStudentForm({ ...studentForm, teacherName: e.target.value });
                          }
                        }} 
                        className={styles.input}
                      >
                        {allTeachers.map(tc => (
                          <option key={tc} value={tc}>{tc} {t("filters.teacherSuffix")}</option>
                        ))}
                        <option value="__NEW__">{t("modals.customTeacherPrompt")}</option>
                      </select>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.paymentDay")}</label>
                    <select 
                      value={studentForm.paymentDay} 
                      onChange={(e) => setStudentForm({ ...studentForm, paymentDay: e.target.value })} 
                      className={styles.input} 
                      required
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{t("table.dayOfMonth", { day })}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.amount")}</label>
                    <input type="number" step="0.01" value={studentForm.amount} onChange={(e) => setStudentForm({ ...studentForm, amount: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.lessonCount")}</label>
                    <select 
                      value={studentForm.lessonCount} 
                      onChange={(e) => setStudentForm({ ...studentForm, lessonCount: e.target.value })} 
                      className={styles.input}
                    >
                      <option value="4">4 {t("table.lessons")}</option>
                      <option value="8">8 {t("table.lessons")}</option>
                      <option value="12">12 {t("table.lessons")}</option>
                      <option value="16">16 {t("table.lessons")}</option>
                      <option value="24">24 {t("table.lessons")}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.parentName")}</label>
                    <input type="text" placeholder="Məs: Günel xanım" value={studentForm.parentName} onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.parentPhone")}</label>
                    <input type="text" placeholder="50-218-68-86" value={studentForm.parentPhone} onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })} className={styles.input} />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowAddStudentModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnAddStudent")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redaktə: Xərc */}
      <AnimatePresence>
        {editExpense && (
          <div className={styles.modalOverlay} onClick={() => setEditExpense(null)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.editExpenseTitle")}</h3>

              <form onSubmit={handleSaveEditExpense}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.expenseCategory")}</label>
                  <input type="text" value={editExpense.category} onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.contractAmount")}</label>
                    <input type="number" step="0.01" value={editExpense.contract_amount} onChange={(e) => {
                      const c = Number(e.target.value) || 0;
                      const p = Number(editExpense.paid_amount) || 0;
                      setEditExpense({ ...editExpense, contract_amount: c, remaining_amount: Math.max(0, c - p) });
                    }} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.paidAmount")}</label>
                    <input type="number" step="0.01" value={editExpense.paid_amount} onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      const c = Number(editExpense.contract_amount) || 0;
                      setEditExpense({ ...editExpense, paid_amount: p, amount: p, remaining_amount: Math.max(0, c - p) });
                    }} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.description")}</label>
                  <input type="text" value={editExpense.description || ''} onChange={(e) => setEditExpense({ ...editExpense, description: e.target.value })} className={styles.input} />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setEditExpense(null)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.save")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redaktə: Hesab */}
      <AnimatePresence>
        {editAccount && (
          <div className={styles.modalOverlay} onClick={() => setEditAccount(null)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.editAccountTitle")}</h3>

              <form onSubmit={handleSaveEditAccount}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.accountName")}</label>
                  <input type="text" value={editAccount.name} onChange={(e) => setEditAccount({ ...editAccount, name: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.bankName")}</label>
                    <input type="text" value={editAccount.bankName} onChange={(e) => setEditAccount({ ...editAccount, bankName: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.balance")}</label>
                    <input type="number" step="0.01" value={editAccount.initialBalance} onChange={(e) => setEditAccount({ ...editAccount, initialBalance: Number(e.target.value) })} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.modalActions} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}
                    onClick={() => handleDeleteAccount(editAccount.id, editAccount.name)}
                  >
                    <Trash2 size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                    Hesabı Sil
                  </button>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className={styles.btnSecondary} onClick={() => setEditAccount(null)}>{t("modals.cancel")}</button>
                    <button type="submit" className={styles.btnPrimary}>{t("modals.save")}</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Yeni Kassa / Hesab Əlavə Et Modal */}
      <AnimatePresence>
        {showAddAccountModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddAccountModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>Yeni Kassa / Hesab Əlavə Et</h3>

              <form onSubmit={handleCreateAccount}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Hesab Adı *</label>
                  <input 
                    type="text" 
                    placeholder="Məsələn: Əsas Nəğd Kassa, Paşa Bank Kart..." 
                    value={newAccountForm.name} 
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })} 
                    className={styles.input} 
                    required 
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Bank / Filial</label>
                    <input 
                      type="text" 
                      placeholder="Məsələn: Kapital Bank, Resepşn..." 
                      value={newAccountForm.bankName} 
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, bankName: e.target.value })} 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>İlkin Balans (₼)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={newAccountForm.initialBalance} 
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, initialBalance: e.target.value })} 
                      className={styles.input} 
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowAddAccountModal(false)}>
                    {t("modals.cancel")}
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Hesabı Yarat
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redaktə: Kassa Əməliyyatı */}
      <AnimatePresence>
        {editTx && (
          <div className={styles.modalOverlay} onClick={() => setEditTx(null)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.editTxTitle")}</h3>

              <form onSubmit={handleSaveEditTx}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.txType")}</label>
                    <select value={editTx.type} onChange={(e) => setEditTx({ ...editTx, type: e.target.value as any })} className={styles.input}>
                      <option value="EXPENSE">{t("status.expense")}</option>
                      <option value="INCOME">{t("status.income")}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.txAmount")}</label>
                    <input type="number" step="0.01" value={editTx.amount} onChange={(e) => setEditTx({ ...editTx, amount: Number(e.target.value) })} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("accounts.tableDate")}</label>
                    <input type="date" value={editTx.date ? editTx.date.split("T")[0] : ""} onChange={(e) => setEditTx({ ...editTx, date: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("accounts.tableCategory")}</label>
                    <input type="text" value={editTx.category || ''} onChange={(e) => setEditTx({ ...editTx, category: e.target.value })} className={styles.input} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.txComment")}</label>
                  <input type="text" value={editTx.description} onChange={(e) => setEditTx({ ...editTx, description: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.modalActions} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}
                    onClick={() => handleDeleteTx(editTx.id)}
                  >
                    <Trash2 size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                    Əməliyyatı Sil
                  </button>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className={styles.btnSecondary} onClick={() => setEditTx(null)}>{t("modals.cancel")}</button>
                    <button type="submit" className={styles.btnPrimary}>{t("modals.save")}</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ödəniş Qəbul Modalı */}
      <AnimatePresence>
        {showCollectModal && targetEnrollment && (
          <div className={styles.modalOverlay} onClick={() => setShowCollectModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.collectTitle")}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "-0.5rem", marginBottom: "1.2rem" }}>
                {targetEnrollment.student_name} — {targetEnrollment.subject} ({targetEnrollment.teacher_name})
              </p>

              <form onSubmit={handleConfirmCollect}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.collectAmount")}</label>
                  <input type="number" step="0.01" value={collectForm.amount} onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.paymentMethod")}</label>
                  <select value={collectForm.paymentMethod} onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })} className={styles.input}>
                    <option value="ABB Card">ABB Card</option>
                    <option value="UBank">UBank</option>
                    <option value="Nəğd Kassa">Nəğd Kassa</option>
                    <option value="Şirkət Hesabı">Şirkət Hesabı</option>
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowCollectModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnConfirmCollect")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Modalı */}
      <AnimatePresence>
        {showTransferModal && (
          <div className={styles.modalOverlay} onClick={() => setShowTransferModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.internalTransferTitle")}</h3>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/finance/accounts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "TRANSFER", ...transferForm, periodCode: selectedPeriodCode })
                  });
                  if (res.ok) {
                    toast.success("Daxili transfer icra olundu!");
                    setShowTransferModal(false);
                    loadFinanceData(selectedPeriodCode);
                  }
                } catch {
                  toast.error("Xəta baş verdi");
                }
              }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.sourceAccount")}</label>
                  <select value={transferForm.sourceAccountId} onChange={(e) => setTransferForm({ ...transferForm, sourceAccountId: e.target.value })} className={styles.input} required>
                    <option value="">Seçin...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.initialBalance.toFixed(2)} {a.currency})</option>)}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.destAccount")}</label>
                  <select value={transferForm.destinationAccountId} onChange={(e) => setTransferForm({ ...transferForm, destinationAccountId: e.target.value })} className={styles.input} required>
                    <option value="">Seçin...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.initialBalance.toFixed(2)} {a.currency})</option>)}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.amount")}</label>
                  <input type="number" step="0.01" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowTransferModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnExecuteTransfer")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Xərc Əlavə Modalı */}
      <AnimatePresence>
        {showAddExpenseModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddExpenseModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.addExpenseTitle")}</h3>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/finance/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newExpenseForm)
                  });
                  if (res.ok) {
                    toast.success("Xərc qeydə alındı!");
                    setShowAddExpenseModal(false);
                    loadFinanceData(selectedPeriodCode);
                  }
                } catch {
                  toast.error("Xəta baş verdi");
                }
              }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.expenseCategory")}</label>
                  <input type="text" placeholder="İcarə, Kommunal, Maaş..." value={newExpenseForm.category} onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.contractAmount")}</label>
                    <input type="number" step="0.01" value={newExpenseForm.contractAmount} onChange={(e) => {
                      const c = Number(e.target.value) || 0;
                      const p = Number(newExpenseForm.amount) || 0;
                      setNewExpenseForm({ ...newExpenseForm, contractAmount: e.target.value, remainingAmount: Math.max(0, c - p).toString() });
                    }} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.paidAmount")}</label>
                    <input type="number" step="0.01" value={newExpenseForm.amount} onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      const c = Number(newExpenseForm.contractAmount) || 0;
                      setNewExpenseForm({ ...newExpenseForm, amount: e.target.value, remainingAmount: Math.max(0, c - p).toString() });
                    }} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowAddExpenseModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnAddExpenseConfirm")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kassa Əməliyyat Əlavə Modalı */}
      <AnimatePresence>
        {showAddTxModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddTxModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.addTxTitle")}</h3>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/finance/accounts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "ADD_TRANSACTION",
                      accountId: txForm.accountId,
                      type: txForm.type,
                      amount: Number(txForm.amount),
                      category: txForm.category,
                      description: txForm.comment,
                      date: txForm.date,
                      periodCode: selectedPeriodCode
                    })
                  });
                  if (res.ok) {
                    toast.success("Əməliyyat qeydə alındı!");
                    setShowAddTxModal(false);
                    loadFinanceData(selectedPeriodCode);
                  }
                } catch {
                  toast.error("Xəta baş verdi");
                }
              }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.txAccount")}</label>
                  <select value={txForm.accountId} onChange={(e) => setTxForm({ ...txForm, accountId: e.target.value })} className={styles.input} required>
                    <option value="">Seçin...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.initialBalance.toFixed(2)} {a.currency})</option>)}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.txType")}</label>
                    <select value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value as any })} className={styles.input}>
                      <option value="EXPENSE">{t("status.expense")}</option>
                      <option value="INCOME">{t("status.income")}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("modals.txAmount")}</label>
                    <input type="number" step="0.01" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} className={styles.input} required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.txComment")}</label>
                  <input type="text" placeholder="Ofis ləvazimatı, kofe..." value={txForm.comment} onChange={(e) => setTxForm({ ...txForm, comment: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowAddTxModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnSaveTx")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Borc Ödəniş Modalı */}
      <AnimatePresence>
        {showPayDebtModal && targetExpense && (
          <div className={styles.modalOverlay} onClick={() => setShowPayDebtModal(false)}>
            <motion.div className={styles.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className={styles.modalTitle}>{t("modals.payDebtTitle")}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "-0.5rem", marginBottom: "1.2rem" }}>
                {targetExpense.category} — {t("expenses.debtPrefix")} <strong style={{ color: "#ef4444" }}>-{targetExpense.remaining_amount.toFixed(2)} ₼</strong>
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/finance/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "PAY_ON_DEBT",
                      id: targetExpense.id,
                      payAmount: Number(debtForm.payAmount),
                      accountId: debtForm.accountId,
                      note: debtForm.note
                    })
                  });
                  if (res.ok) {
                    toast.success("Ödəniş qeydə alındı!");
                    setShowPayDebtModal(false);
                    loadFinanceData(selectedPeriodCode);
                  }
                } catch {
                  toast.error("Xəta baş verdi");
                }
              }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.payAmount")}</label>
                  <input type="number" step="0.01" value={debtForm.payAmount} onChange={(e) => setDebtForm({ ...debtForm, payAmount: e.target.value })} className={styles.input} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("modals.payAccount")}</label>
                  <select value={debtForm.accountId} onChange={(e) => setDebtForm({ ...debtForm, accountId: e.target.value })} className={styles.input}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.initialBalance.toFixed(2)} {a.currency})</option>)}
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowPayDebtModal(false)}>{t("modals.cancel")}</button>
                  <button type="submit" className={styles.btnPrimary}>{t("modals.btnPayDebt")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
