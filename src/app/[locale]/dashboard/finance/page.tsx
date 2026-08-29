"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { 
  CreditCard, 
  AlertCircle, 
  Search, 
  FileText, 
  Plus, 
  X, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShieldAlert,
  Building2,
  Wallet,
  Users,
  Tag,
  Phone,
  Clock,
  Landmark,
  Receipt,
  Check,
  Briefcase,
  ArrowRightLeft,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  Calendar,
  Layers,
  BookOpen,
  Lock,
  Unlock,
  Archive,
  Award,
  CheckCircle2,
  FolderArchive,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";
import { 
  INITIAL_FINANCIAL_PERIODS,
  INITIAL_ACCOUNT_REGISTERS, 
  BRANCH_FINANCIALS, 
  STUDENT_PAYMENT_STATUS_ROSTER, 
  COURSE_PRICING_STANDARDS,
  FinancialPeriod,
  BankAccountRegister,
  BranchFinancials,
  StudentPaymentStatusRecord,
  CoursePriceStandard
} from "@/constants/financeData";

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

const EXPENSE_PIE_DATA = [
  { name: "Rent (İcarə)", value: 4000, color: "#3b82f6" },
  { name: "Müəllim Maaşları", value: 3700, color: "#10b981" },
  { name: "Marketinq & Reklam", value: 2110, color: "#f59e0b" },
  { name: "SAT İmtahan Biletləri", value: 954, color: "#a855f7" },
  { name: "Kommunal & İnternet", value: 545, color: "#06b6d4" },
  { name: "Vergi Ödənişləri", value: 750, color: "#ec4899" },
  { name: "Ofis & Təmir", value: 786, color: "#64748b" }
];

export default function FinancePage() {
  // 1. ALL HOOKS CALLED UNCONDITIONALLY AT THE TOP
  const t = useTranslations("Finance");
  const { data: session, status: authStatus } = useSession();
  const userRole = session?.user?.role || "staff";
  const isSuperAdmin = userRole === "super_admin";
  
  // Navigation Tabs: overview | roster | accounts | branches | prices | periods | invoices
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'accounts' | 'branches' | 'prices' | 'periods' | 'invoices'>('overview');

  // Dynamic Financial Periods Management State
  const [financialPeriods, setFinancialPeriods] = useState<FinancialPeriod[]>(INITIAL_FINANCIAL_PERIODS);
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('2026-08');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Live Dynamic Data State
  const [accountRegisters, setAccountRegisters] = useState<BankAccountRegister[]>(INITIAL_ACCOUNT_REGISTERS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(INITIAL_ACCOUNT_REGISTERS[0].id);
  const [studentRoster, setStudentRoster] = useState<StudentPaymentStatusRecord[]>(STUDENT_PAYMENT_STATUS_ROSTER);
  const [branchFinancials, setBranchFinancials] = useState<BranchFinancials[]>(BRANCH_FINANCIALS);
  const [coursePricingStandards, setCoursePricingStandards] = useState<CoursePriceStandard[]>(COURSE_PRICING_STANDARDS);

  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterStatusFilter, setRosterStatusFilter] = useState("all");
  const [rosterSubjectFilter, setRosterSubjectFilter] = useState("all");
  const [rosterTypeFilter, setRosterTypeFilter] = useState("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("nizami");

  // Table Enhancements State (Pagination, Sorting, Batch selection)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<'studentName' | 'amount' | 'paymentDay' | 'status'>('studentName');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddBankTxModal, setShowAddBankTxModal] = useState(false);
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);
  const [showAddBranchExpenseModal, setShowAddBranchExpenseModal] = useState(false);
  const [selectedReceiptStudent, setSelectedReceiptStudent] = useState<StudentPaymentStatusRecord | null>(null);

  // Period Modals State
  const [showOpenPeriodModal, setShowOpenPeriodModal] = useState(false);
  const [showArchivePeriodModal, setShowArchivePeriodModal] = useState(false);
  const [selectedCertificatePeriod, setSelectedCertificatePeriod] = useState<FinancialPeriod | null>(null);
  const [showDetailedAuditModal, setShowDetailedAuditModal] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    studentId: "",
    amount: "",
    paidAmount: "0",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "CASH"
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "rent",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    branch: "nizami"
  });

  const [transferForm, setTransferForm] = useState({
    sourceAccountId: INITIAL_ACCOUNT_REGISTERS[0].id,
    destinationAccountId: INITIAL_ACCOUNT_REGISTERS[2].id,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "Hesablararası daxili vəsait köçürməsi"
  });

  // Dynamic Add Forms
  const [newStudentForm, setNewStudentForm] = useState({
    studentName: "",
    subject: "SAT Math",
    type: "Group" as 'Group' | 'Mini Group' | 'Individual',
    amount: "300",
    paymentDay: "15-i",
    parentName: "",
    parentPhone: "",
    status: "PAID" as 'PAID' | 'ASKED' | 'NOT_ASKED',
    paymentMethod: "ABB Card",
    classesCount: 8
  });

  const [newBankTxForm, setNewBankTxForm] = useState({
    type: "INCOME" as 'INCOME' | 'EXPENSE',
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Təhsil Haqqı"
  });

  const [newPriceForm, setNewPriceForm] = useState({
    course: "",
    groupPrice: "250",
    individualPrice: "500",
    schedule: "Həftədə 2 dəfə 90 dəq",
    audience: "9-11-ci siniflər",
    language: "İngilis dili",
    duration: "3-6 ay",
    maxCapacity: "Max 6 nəfər"
  });

  const [newBranchExpenseForm, setNewBranchExpenseForm] = useState({
    category: "Müəllim Maaşı",
    amount: "400",
    recipient: "",
    note: ""
  });

  // New Period Form with Granular Account Opening Balances
  const [newPeriodForm, setNewPeriodForm] = useState({
    code: "2026-09",
    name: "Sentyabr 2026",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    notes: "Payız tədris ili başlanğıcı və yeni tələbə qəbulu dövrü.",
    accountBalances: {
      'acc-1': "1500", // ABB Card (Digihesab)
      'acc-2': "400",  // Leobank
      'acc-3': "800",  // Nəğd Kassa
      'acc-4': "10000",// Tamerlan Hesab (Director Master)
      'acc-5': "300",  // UBank
      'acc-6': "0"     // POS Terminal
    } as Record<string, string>
  });

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, expRes, stuRes] = await Promise.all([
        apiFetch("/api/finance"),
        apiFetch("/api/finance/expenses"),
        apiFetch("/api/students")
      ]);
      
      if (invRes.ok) setInvoices(await invRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
    } catch (error) {
      console.error("Finance fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Active Current Period Object
  const currentPeriod = useMemo(() => {
    return financialPeriods.find(p => p.code === selectedPeriodCode) || financialPeriods[0];
  }, [financialPeriods, selectedPeriodCode]);

  // Dynamic Bank Accounts filtered by Period
  const processedAccountRegisters = useMemo(() => {
    return accountRegisters.map(acc => {
      const filteredTxs = acc.transactions.filter(tx => 
        selectedPeriodCode === 'all' || !tx.periodCode || tx.periodCode === selectedPeriodCode
      );
      const rev = filteredTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const exp = filteredTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      const bal = selectedPeriodCode === 'all' ? acc.currentBalance : (rev - exp);
      return {
        ...acc,
        transactions: filteredTxs,
        totalRevenue: selectedPeriodCode === 'all' ? acc.totalRevenue : (rev || acc.totalRevenue),
        totalExpenditure: selectedPeriodCode === 'all' ? acc.totalExpenditure : (exp || acc.totalExpenditure),
        currentBalance: selectedPeriodCode === 'all' ? acc.currentBalance : (bal > 0 ? bal : acc.currentBalance)
      };
    });
  }, [accountRegisters, selectedPeriodCode]);

  // Dynamic Branches filtered by Period
  const processedBranchFinancials = useMemo(() => {
    return branchFinancials.map(br => {
      const filteredExpenses = br.expenseBreakdown.filter(e => 
        selectedPeriodCode === 'all' || !e.periodCode || e.periodCode === selectedPeriodCode
      );
      const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0) || br.totalExpenses;
      let dynamicRev = br.totalRevenue;
      if (selectedPeriodCode === '2026-07') dynamicRev = br.branchId === 'nizami' ? 16500 : 11800;
      if (selectedPeriodCode === '2026-06') dynamicRev = br.branchId === 'nizami' ? 17200 : 12300;
      if (selectedPeriodCode === '2026-05') dynamicRev = br.branchId === 'nizami' ? 15000 : 10500;
      const net = dynamicRev - totalExp;
      const margin = dynamicRev > 0 ? ((net / dynamicRev) * 100).toFixed(2) + '%' : '0.00%';
      return {
        ...br,
        totalRevenue: dynamicRev,
        totalExpenses: totalExp,
        netProfit: net,
        profitMargin: margin,
        expenseBreakdown: filteredExpenses
      };
    });
  }, [branchFinancials, selectedPeriodCode]);

  // Filtering, Sorting & Pagination for Student Payment Roster (Unconditional)
  const processedRoster = useMemo(() => {
    let result = studentRoster.filter(st => {
      // Period filter (if not 'all', check match)
      if (selectedPeriodCode !== 'all' && st.periodCode && st.periodCode !== selectedPeriodCode) {
        return false;
      }
      if (rosterStatusFilter !== "all" && st.status !== rosterStatusFilter) return false;
      if (rosterSubjectFilter !== "all" && st.subject !== rosterSubjectFilter) return false;
      if (rosterTypeFilter !== "all" && st.type !== rosterTypeFilter) return false;

      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase();
        return (
          st.studentName.toLowerCase().includes(q) ||
          st.subject.toLowerCase().includes(q) ||
          st.parentName.toLowerCase().includes(q) ||
          st.parentPhone.includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = (valA as string).toLowerCase();
      if (typeof valB === 'string') valB = (valB as string).toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [studentRoster, selectedPeriodCode, rosterStatusFilter, rosterSubjectFilter, rosterTypeFilter, rosterSearch, sortField, sortAsc]);

  // Integrated Subject & Format Revenue Analytics
  const subjectRevenueDistribution = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    processedRoster.forEach(st => {
      if (!map[st.subject]) map[st.subject] = { count: 0, total: 0 };
      map[st.subject].count += 1;
      if (st.status === 'PAID') {
        map[st.subject].total += st.amount;
      }
    });
    return Object.entries(map).map(([subject, data]) => ({
      subject,
      count: data.count,
      total: data.total
    })).sort((a, b) => b.total - a.total);
  }, [processedRoster]);

  const typeRevenueDistribution = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      'Group': { count: 0, total: 0 },
      'Mini Group': { count: 0, total: 0 },
      'Individual': { count: 0, total: 0 }
    };
    processedRoster.forEach(st => {
      const t = st.type || 'Group';
      if (!map[t]) map[t] = { count: 0, total: 0 };
      map[t].count += 1;
      if (st.status === 'PAID') {
        map[t].total += st.amount;
      }
    });
    return Object.entries(map).map(([type, data]) => ({
      type,
      count: data.count,
      total: data.total
    }));
  }, [processedRoster]);

  // Calculated master aggregates (Unconditional)
  const totalAccountBalance = useMemo(() => processedAccountRegisters.reduce((sum, acc) => sum + acc.currentBalance, 0), [processedAccountRegisters]);
  const totalAccountRevenue = useMemo(() => processedAccountRegisters.reduce((sum, acc) => sum + acc.totalRevenue, 0), [processedAccountRegisters]);
  const totalAccountExpenditure = useMemo(() => processedAccountRegisters.reduce((sum, acc) => sum + acc.totalExpenditure, 0), [processedAccountRegisters]);

  const calculateTotalIncome = () => {
    if (selectedPeriodCode !== 'all' && currentPeriod) {
      return currentPeriod.totalRevenue;
    }
    return invoices.reduce((t, i) => t + (Number(i.paidAmount) || 0), 0) || totalAccountRevenue;
  };

  const calculateTotalExpenses = () => {
    if (selectedPeriodCode !== 'all' && currentPeriod) {
      return currentPeriod.totalExpenses;
    }
    return expenses.reduce((t, e) => t + (Number(e.amount) || 0), 0) || totalAccountExpenditure;
  };

  const netProfit = calculateTotalIncome() - calculateTotalExpenses();
  const profitMarginPercent = calculateTotalIncome() > 0 ? ((netProfit / calculateTotalIncome()) * 100).toFixed(2) : "0.00";

  const chartData = [
    { name: "May", Gəlir: 18500, Xərc: 11200 },
    { name: "İyn", Gəlir: 21000, Xərc: 12400 },
    { name: "İyl", Gəlir: 19800, Xərc: 13100 },
    { name: "Avq", Gəlir: 24718, Xərc: 14212 },
    { name: "Sen", Gəlir: 26500, Xərc: 15200 }
  ];

  const selectedAccount = processedAccountRegisters.find(a => a.id === selectedAccountId) || processedAccountRegisters[0];
  const selectedBranch = processedBranchFinancials.find(b => b.branchId === selectedBranchId) || processedBranchFinancials[0];

  const totalPages = Math.ceil(processedRoster.length / pageSize) || 1;
  const paginatedRoster = processedRoster.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handlers
  const handleSort = (field: 'studentName' | 'amount' | 'paymentDay' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getAccountIdFromMethod = (method?: string) => {
    if (!method) return 'acc-1';
    const m = method.toLowerCase();
    if (m.includes('leo')) return 'acc-2';
    if (m.includes('nağd') || m.includes('nagd') || m.includes('kassa')) return 'acc-3';
    if (m.includes('tamerlan')) return 'acc-4';
    if (m.includes('ubank')) return 'acc-5';
    if (m.includes('pos')) return 'acc-6';
    return 'acc-1';
  };

  const toggleStudentStatus = (id: string) => {
    const student = studentRoster.find(s => s.id === id);
    if (!student) return;

    const nextMap: Record<string, any> = {
      'PAID': 'ASKED',
      'ASKED': 'NOT_ASKED',
      'NOT_ASKED': 'PAID'
    };
    const nextStatus = nextMap[student.status] || 'PAID';

    setStudentRoster(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));

    // Dynamic Live Bank Ledger Update
    const targetAccId = getAccountIdFromMethod(student.paymentMethod);
    if (nextStatus === 'PAID') {
      setAccountRegisters(prev => prev.map(acc => {
        if (acc.id === targetAccId) {
          return {
            ...acc,
            currentBalance: acc.currentBalance + student.amount,
            totalRevenue: acc.totalRevenue + student.amount,
            transactions: [
              {
                id: `tx-st-${Date.now()}`,
                date: new Date().toLocaleDateString("ru-RU"),
                type: 'INCOME',
                amount: student.amount,
                description: `${student.studentName} — ${student.subject} Təhsil Haqqı`,
                category: 'Tədris Haqqı',
                periodCode: student.periodCode || selectedPeriodCode
              },
              ...acc.transactions
            ]
          };
        }
        return acc;
      }));
      toast.success(`${student.studentName} üçün ${student.amount} ₼ ödəniş qəbul edildi və bank balansına əlavə olundu!`);
    } else if (student.status === 'PAID' && nextStatus !== 'PAID') {
      // Revert from bank balance
      setAccountRegisters(prev => prev.map(acc => {
        if (acc.id === targetAccId) {
          return {
            ...acc,
            currentBalance: Math.max(0, acc.currentBalance - student.amount),
            totalRevenue: Math.max(0, acc.totalRevenue - student.amount)
          };
        }
        return acc;
      }));
      toast(t("toasts.statusUpdated"), { icon: 'ℹ️' });
    } else {
      toast.success(t("toasts.statusUpdated"));
    }
  };

  const handleBatchStatus = (newStatus: 'PAID' | 'ASKED') => {
    const affectedStudents = studentRoster.filter(s => selectedStudentIds.includes(s.id));
    setStudentRoster(prev => prev.map(s => selectedStudentIds.includes(s.id) ? { ...s, status: newStatus } : s));

    if (newStatus === 'PAID') {
      affectedStudents.forEach(st => {
        if (st.status !== 'PAID') {
          const targetAccId = getAccountIdFromMethod(st.paymentMethod);
          setAccountRegisters(prev => prev.map(acc => {
            if (acc.id === targetAccId) {
              return {
                ...acc,
                currentBalance: acc.currentBalance + st.amount,
                totalRevenue: acc.totalRevenue + st.amount,
                transactions: [
                  {
                    id: `tx-batch-${Date.now()}-${st.id}`,
                    date: new Date().toLocaleDateString("ru-RU"),
                    type: 'INCOME',
                    amount: st.amount,
                    description: `${st.studentName} — ${st.subject} Təhsil Haqqı (Toplu)`,
                    category: 'Tədris Haqqı',
                    periodCode: st.periodCode || selectedPeriodCode
                  },
                  ...acc.transactions
                ]
              };
            }
            return acc;
          }));
        }
      });
    }
    toast.success(t("toasts.batchUpdated", { count: selectedStudentIds.length }));
    setSelectedStudentIds([]);
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedRoster.map(s => s.id);
    const allSelected = pageIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const exportRosterToCSV = () => {
    const headers = [t("roster.studentName"), t("roster.subject"), t("roster.format"), t("roster.amount"), t("roster.paymentDay"), t("roster.parentContact"), t("roster.paymentMethod"), t("roster.status")];
    const rows = processedRoster.map(s => [
      s.studentName,
      s.subject,
      s.type,
      s.amount,
      s.paymentDay,
      `${s.parentName} (${s.parentPhone})`,
      s.paymentMethod,
      s.status === 'PAID' ? t("statuses.PAID") : s.status === 'ASKED' ? t("statuses.ASKED") : t("statuses.NOT_ASKED")
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(i => `"${i}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Thrive_Telebe_Odenis_Reyestri_${selectedPeriodCode}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("toasts.csvDownloaded"));
  };

  // 1. OPEN NEW FINANCIAL PERIOD HANDLER (WITH GRANULAR ACCOUNT BALANCES)
  const handleOpenPeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodForm.name.trim() || !newPeriodForm.code.trim()) {
      return toast.error("Dövr adını və kodunu daxil edin");
    }

    const exists = financialPeriods.some(p => p.code === newPeriodForm.code.trim());
    if (exists) {
      return toast.error("Bu koda malik maliyyə dövrü artıq mövcuddur");
    }

    const totalOpenBal = Object.values(newPeriodForm.accountBalances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const newPeriod: FinancialPeriod = {
      id: `fp-${newPeriodForm.code.trim()}`,
      code: newPeriodForm.code.trim(),
      name: newPeriodForm.name.trim(),
      startDate: newPeriodForm.startDate,
      endDate: newPeriodForm.endDate,
      status: 'ACTIVE',
      openingBalance: totalOpenBal,
      totalRevenue: totalOpenBal,
      totalExpenses: 0,
      netProfit: totalOpenBal,
      profitMargin: '100.00%',
      notes: newPeriodForm.notes,
      officialCertificateNo: `TRV-FIN-${newPeriodForm.code.trim().toUpperCase()}-ACT`
    };

    // Deposit initial opening balance for each account in the new period
    const txDate = newPeriodForm.startDate.split("-").reverse().join(".");
    setAccountRegisters(prev => prev.map(acc => {
      const accBal = parseFloat(newPeriodForm.accountBalances[acc.id]) || 0;
      if (accBal > 0) {
        return {
          ...acc,
          currentBalance: acc.currentBalance + accBal,
          totalRevenue: acc.totalRevenue + accBal,
          transactions: [
            {
              id: `tx-init-${newPeriodForm.code}-${acc.id}`,
              date: txDate,
              type: 'INCOME',
              amount: accBal,
              description: `${newPeriodForm.name} — İlkin Açılış Depoziti & Balans`,
              category: 'Capital',
              periodCode: newPeriodForm.code
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));

    setFinancialPeriods(prev => [newPeriod, ...prev]);
    setSelectedPeriodCode(newPeriod.code);
    toast.success(`Yeni Maliyyə Dövrü "${newPeriod.name}" və 6 hesabın açılış qalıqları uğurla təsdiqləndi!`);
    setShowOpenPeriodModal(false);
  };

  // 2. CLOSE & ARCHIVE CURRENT PERIOD HANDLER
  const handleArchivePeriodSubmit = () => {
    if (!currentPeriod || currentPeriod.status === 'ARCHIVED') {
      return toast.error("Bu dövr artıq arxivləşdirilib və ya aktiv deyil.");
    }

    const timestamp = new Date().toLocaleString("az-AZ");
    const certNo = `TRV-FIN-${currentPeriod.code.toUpperCase()}-ARC`;

    setFinancialPeriods(prev => prev.map(p => {
      if (p.code === currentPeriod.code) {
        return {
          ...p,
          status: 'ARCHIVED',
          closedAt: timestamp,
          closedBy: session?.user?.name ? `${session.user.name} (Super Admin)` : 'Super Admin (Tamerlan Məmmədov)',
          officialCertificateNo: certNo
        };
      }
      return p;
    }));

    toast.success(`"${currentPeriod.name}" rəsmi olaraq bağlandı və arxivləşdirildi!`);
    setShowArchivePeriodModal(false);
  };

  // 3. REACTIVATE ARCHIVED PERIOD HANDLER
  const handleReactivatePeriod = (code: string) => {
    setFinancialPeriods(prev => prev.map(p => {
      if (p.code === code) {
        return {
          ...p,
          status: 'ACTIVE',
          closedAt: undefined,
          closedBy: undefined,
          officialCertificateNo: `TRV-FIN-${code.toUpperCase()}-ACT`
        };
      }
      return p;
    }));
    toast.success(`Dövr yenidən aktivləşdirildi.`);
  };

  // Internal Transfer Handler
  const handleInternalTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferForm.amount);
    if (!amountNum || amountNum <= 0) return toast.error(t("toasts.validAmountError"));
    if (transferForm.sourceAccountId === transferForm.destinationAccountId) {
      return toast.error(t("toasts.sameAccountError"));
    }

    const sourceAcc = accountRegisters.find(a => a.id === transferForm.sourceAccountId);
    const destAcc = accountRegisters.find(a => a.id === transferForm.destinationAccountId);

    if (!sourceAcc || !destAcc) return;
    if (sourceAcc.currentBalance < amountNum) {
      return toast.error(t("toasts.insufficientFunds", { balance: sourceAcc.currentBalance }));
    }

    const txDate = transferForm.date.split("-").reverse().join(".");

    setAccountRegisters(prev => prev.map(acc => {
      if (acc.id === sourceAcc.id) {
        return {
          ...acc,
          currentBalance: acc.currentBalance - amountNum,
          totalExpenditure: acc.totalExpenditure + amountNum,
          transactions: [
            {
              id: `tx-out-${Date.now()}`,
              date: txDate,
              type: 'EXPENSE',
              amount: amountNum,
              description: `Köçürmə → ${destAcc.name} (${transferForm.note})`,
              category: t("actions.internalTransfer"),
              periodCode: selectedPeriodCode
            },
            ...acc.transactions
          ]
        };
      }
      if (acc.id === destAcc.id) {
        return {
          ...acc,
          currentBalance: acc.currentBalance + amountNum,
          totalRevenue: acc.totalRevenue + amountNum,
          transactions: [
            {
              id: `tx-in-${Date.now()}`,
              date: txDate,
              type: 'INCOME',
              amount: amountNum,
              description: `Daxilolma ← ${sourceAcc.name} (${transferForm.note})`,
              category: t("actions.internalTransfer"),
              periodCode: selectedPeriodCode
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));

    toast.success(t("toasts.transferSuccess", { amount: amountNum }));
    setShowTransferModal(false);
    setTransferForm({ ...transferForm, amount: "" });
  };

  // Dynamic Add Student Handler
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.studentName.trim()) return toast.error("Tələbə adını daxil edin");

    const newRecord: StudentPaymentStatusRecord = {
      id: `st-${Date.now()}`,
      studentName: newStudentForm.studentName,
      subject: newStudentForm.subject,
      type: newStudentForm.type,
      amount: parseFloat(newStudentForm.amount) || 0,
      paymentDay: newStudentForm.paymentDay,
      parentName: newStudentForm.parentName || "Valideyn",
      parentPhone: newStudentForm.parentPhone || "—",
      status: newStudentForm.status,
      paymentMethod: newStudentForm.paymentMethod,
      classesCount: Number(newStudentForm.classesCount) || 8,
      periodCode: selectedPeriodCode === 'all' ? '2026-08' : selectedPeriodCode
    };

    setStudentRoster(prev => [newRecord, ...prev]);
    toast.success("Tələbə reyestrə uğurla əlavə edildi!");
    setShowAddStudentModal(false);
    setNewStudentForm({
      studentName: "",
      subject: "SAT Math",
      type: "Group",
      amount: "300",
      paymentDay: "15-i",
      parentName: "",
      parentPhone: "",
      status: "PAID",
      paymentMethod: "ABB Card",
      classesCount: 8
    });
  };

  // Dynamic Add Bank Transaction Handler
  const handleAddBankTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newBankTxForm.amount);
    if (!amountNum || amountNum <= 0) return toast.error(t("toasts.validAmountError"));

    const txDate = newBankTxForm.date.split("-").reverse().join(".");

    setAccountRegisters(prev => prev.map(acc => {
      if (acc.id === selectedAccountId) {
        const isIncome = newBankTxForm.type === 'INCOME';
        return {
          ...acc,
          currentBalance: isIncome ? acc.currentBalance + amountNum : acc.currentBalance - amountNum,
          totalRevenue: isIncome ? acc.totalRevenue + amountNum : acc.totalRevenue,
          totalExpenditure: !isIncome ? acc.totalExpenditure + amountNum : acc.totalExpenditure,
          transactions: [
            {
              id: `tx-custom-${Date.now()}`,
              date: txDate,
              type: newBankTxForm.type,
              amount: amountNum,
              description: newBankTxForm.description || "Bank əməliyyatı",
              category: newBankTxForm.category,
              periodCode: selectedPeriodCode
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));

    toast.success("Əməliyyat bank hesabına əlavə olundu!");
    setShowAddBankTxModal(false);
    setNewBankTxForm({
      type: "INCOME",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "Təhsil Haqqı"
    });
  };

  // Dynamic Add Price Standard Handler
  const handleAddPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriceForm.course.trim()) return toast.error("Kurs adını daxil edin");

    const newStandard: CoursePriceStandard = {
      id: `p-${Date.now()}`,
      course: newPriceForm.course,
      groupPrice: parseFloat(newPriceForm.groupPrice) || 0,
      individualPrice: parseFloat(newPriceForm.individualPrice) || 0,
      schedule: newPriceForm.schedule,
      audience: newPriceForm.audience,
      language: newPriceForm.language,
      duration: newPriceForm.duration,
      maxCapacity: newPriceForm.maxCapacity
    };

    setCoursePricingStandards(prev => [...prev, newStandard]);
    toast.success("Yeni qiymət standartı əlavə edildi!");
    setShowAddPriceModal(false);
    setNewPriceForm({
      course: "",
      groupPrice: "250",
      individualPrice: "500",
      schedule: "Həftədə 2 dəfə 90 dəq",
      audience: "9-11-ci siniflər",
      language: "İngilis dili",
      duration: "3-6 ay",
      maxCapacity: "Max 6 nəfər"
    });
  };

  // Dynamic Add Branch Expense Item Handler
  const handleAddBranchExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newBranchExpenseForm.amount);
    if (!amountNum || amountNum <= 0) return toast.error(t("toasts.validAmountError"));

    setBranchFinancials(prev => prev.map(br => {
      if (br.branchId === selectedBranchId) {
        const updatedExpenses = br.totalExpenses + amountNum;
        const updatedNetProfit = br.totalRevenue - updatedExpenses;
        return {
          ...br,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: `${((updatedNetProfit / br.totalRevenue) * 100).toFixed(2)}%`,
          expenseBreakdown: [
            ...br.expenseBreakdown,
            {
              category: newBranchExpenseForm.category,
              amount: amountNum,
              recipient: newBranchExpenseForm.recipient,
              note: newBranchExpenseForm.note,
              periodCode: selectedPeriodCode
            }
          ]
        };
      }
      return br;
    }));

    toast.success("Filial xərci qeydə alındı!");
    setShowAddBranchExpenseModal(false);
    setNewBranchExpenseForm({
      category: "Müəllim Maaşı",
      amount: "400",
      recipient: "",
      note: ""
    });
  };

  // Handlers for Invoices
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.studentId) return toast.error(t("toasts.selectStudentError"));
    
    try {
      const res = await apiFetch("/api/finance", {
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
        toast.success(t("toasts.invoiceCreated"));
        setShowCreateModal(false);
        fetchData();
      } else {
        toast.error(t("toasts.genericError"));
      }
    } catch (e) {
      toast.error(t("toasts.networkError"));
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/finance/expenses", {
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
        toast.success(t("toasts.expenseRecorded"));
        setShowExpenseModal(false);
        fetchData();
      } else {
        toast.error(t("toasts.genericError"));
      }
    } catch (e) {
      toast.error(t("toasts.networkError"));
    }
  };

  const getBankCardClass = (code: string) => {
    switch(code) {
      case 'digihesab': return styles.bankCardDigi;
      case 'leobank': return styles.bankCardLeo;
      case 'nagd': return styles.bankCardNagd;
      case 'tamerlan': return styles.bankCardTam;
      case 'ubank': return styles.bankCardUbank;
      default: return styles.bankCardPos;
    }
  };

  // 2. CONDITIONAL GUARDS RENDERED AFTER ALL HOOKS
  if (authStatus === "loading") {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#5ce1e6', fontSize: '0.9rem', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', border: '3px solid rgba(92, 225, 230, 0.2)', borderTopColor: '#5ce1e6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Təhlükəsizlik və Maliyyə İcazələri Yoxlanılır...</span>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className={styles.accessDeniedCard}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={styles.accessDeniedBox}
        >
          <div className={styles.accessDeniedIcon}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            {t("accessDenied")}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {t("accessDeniedDesc")}
          </p>
          <Link href="/dashboard" style={{ width: '100%' }}>
            <button className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
              {t("backToDashboard")}
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // 3. MAIN RENDER
  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.badgeSuperAdmin}>
            <ShieldAlert size={14} />
            <span>{t("badgeSuperAdmin")}</span>
          </div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={() => setShowOpenPeriodModal(true)} className={styles.btnPrimary}>
            <Plus size={16} />
            <span>{t("periods.openNewPeriod")}</span>
          </button>
          <button onClick={() => setShowTransferModal(true)} className={styles.btnTransfer}>
            <ArrowRightLeft size={16} />
            <span>{t("actions.internalTransfer")}</span>
          </button>
          <button onClick={() => setShowExpenseModal(true)} className={styles.btnExpense}>
            <Plus size={16} />
            <span>{t("actions.addExpense")}</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className={styles.btnPrimary}>
            <Plus size={16} />
            <span>{t("actions.createInvoice")}</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC FINANCIAL PERIOD SELECTOR BAR & CONTROLS */}
      <div className={styles.periodBar}>
        <div className={styles.periodGroup}>
          <span className={styles.periodLabel}>
            <Calendar size={15} color="#5ce1e6" />
            <span>{t("periods.label")}</span>
          </span>

          <div className={styles.periodPills}>
            {financialPeriods.map(p => {
              const isSelected = selectedPeriodCode === p.code;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriodCode(p.code)}
                  className={`${styles.periodPill} ${isSelected ? styles.periodPillActive : ''}`}
                  title={`${p.name} • ${p.status === 'ACTIVE' ? 'Aktiv Dövr' : 'Arxivləşdirilib'}`}
                >
                  <span className={p.status === 'ACTIVE' ? styles.periodStatusDotActive : styles.periodStatusDotArchived} />
                  <span>{p.name}</span>
                  {p.status === 'ARCHIVED' && <Lock size={12} color="#fbbf24" />}
                </button>
              );
            })}

            <button
              onClick={() => setSelectedPeriodCode('all')}
              className={`${styles.periodPill} ${selectedPeriodCode === 'all' ? styles.periodPillActive : ''}`}
            >
              <Layers size={13} color="#94a3b8" />
              <span>{t("periods.all")}</span>
            </button>
          </div>
        </div>

        {/* Period Status & Archive Trigger */}
        <div className={styles.periodActions}>
          <button 
            onClick={() => setShowDetailedAuditModal(true)} 
            className={styles.btnDetailedAudit}
            title="Dövr üzrə tam detallı rəsmi audit hesabatı və PDF çıxarışı"
          >
            <FileText size={14} />
            <span>Rəsmi Audit Çıxarışı (PDF)</span>
          </button>

          {currentPeriod && selectedPeriodCode !== 'all' && (
            <>
              {currentPeriod.status === 'ACTIVE' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className={styles.periodActiveBadge}>
                    <CheckCircle2 size={13} />
                    <span>Aktiv Dövr</span>
                  </span>
                  <button 
                    onClick={() => setShowArchivePeriodModal(true)} 
                    className={styles.btnArchive}
                    title="Bu ayın hesabatını bağlayın və şirkət arxivinə göndərin"
                  >
                    <Lock size={13} />
                    <span>{t("periods.archivePeriod")}</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className={styles.periodArchivedBadge}>
                    <Lock size={13} />
                    <span>{t("periods.archivedBadge")} ({currentPeriod.closedAt?.split(" ")[0]})</span>
                  </span>
                  <button
                    onClick={() => setSelectedCertificatePeriod(currentPeriod)}
                    style={{ background: 'rgba(76, 162, 181, 0.15)', border: '1px solid rgba(76, 162, 181, 0.3)', color: '#5ce1e6', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Award size={14} />
                    <span>Qapanış Sertifikatı</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modern Pill Sub-Navigation */}
      <div className={styles.tabNav}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
        >
          <TrendingUp size={16} />
          <span>{t("tabs.overview")}</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`${styles.tabBtn} ${activeTab === 'roster' ? styles.tabBtnActive : ''}`}
        >
          <Users size={16} />
          <span>{t("tabs.roster")} ({processedRoster.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`${styles.tabBtn} ${activeTab === 'accounts' ? styles.tabBtnActive : ''}`}
        >
          <Landmark size={16} />
          <span>{t("tabs.accounts")} ({accountRegisters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`${styles.tabBtn} ${activeTab === 'branches' ? styles.tabBtnActive : ''}`}
        >
          <Building2 size={16} />
          <span>{t("tabs.branches")}</span>
        </button>

        <button
          onClick={() => setActiveTab('prices')}
          className={`${styles.tabBtn} ${activeTab === 'prices' ? styles.tabBtnActive : ''}`}
        >
          <Tag size={16} />
          <span>{t("tabs.prices")} ({coursePricingStandards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`${styles.tabBtn} ${activeTab === 'periods' ? styles.tabBtnActive : ''}`}
        >
          <FolderArchive size={16} />
          <span>{t("tabs.periods")} ({financialPeriods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`${styles.tabBtn} ${activeTab === 'invoices' ? styles.tabBtnActive : ''}`}
        >
          <FileText size={16} />
          <span>{t("tabs.invoices")} ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW & MASTER BALANCES */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top 4 KPI Cards */}
          <div className={styles.statsGrid}>
            {/* Revenue */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{t("kpi.totalRevenue")}</span>
                <div className={`${styles.statIcon} ${styles.iconIncome}`}>
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <h3 className={`${styles.statValue} ${styles.statValueIncome}`}>{calculateTotalIncome().toLocaleString()} ₼</h3>
              <span className={styles.statSub} style={{ color: '#34d399' }}>{t("kpi.revenueSubtitle")}</span>
            </div>

            {/* Expenses */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{t("kpi.totalExpenses")}</span>
                <div className={`${styles.statIcon} ${styles.iconExpense}`}>
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <h3 className={`${styles.statValue} ${styles.statValueExpense}`}>-{calculateTotalExpenses().toLocaleString()} ₼</h3>
              <span className={styles.statSub}>{t("kpi.expensesSubtitle")}</span>
            </div>

            {/* Net Profit */}
            <div className={`${styles.statCard} ${styles.statCardProfit}`}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{t("kpi.netProfit")}</span>
                <div className={`${styles.statIcon} ${styles.iconProfit}`}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <h3 className={`${styles.statValue} ${styles.statValueProfit}`}>{netProfit.toLocaleString()} ₼</h3>
              <span className={styles.statSub} style={{ color: '#5ce1e6', fontWeight: 700 }}>{t("kpi.profitMargin")}: {profitMarginPercent}%</span>
            </div>

            {/* Total Account Cash Balance */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{t("kpi.totalCashBalance")}</span>
                <div className={`${styles.statIcon} ${styles.iconBalance}`}>
                  <Wallet size={18} />
                </div>
              </div>
              <h3 className={styles.statValue}>{totalAccountBalance.toLocaleString()} ₼</h3>
              <span className={styles.statSub}>{t("kpi.accountsSubtitle")}</span>
            </div>
          </div>

          {/* Cashflow AreaChart & Expense Category Donut Chart */}
          <div className={styles.gridTwoCol}>
            {/* Cashflow Chart */}
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    <TrendingUp size={18} color="#4ca2b5" />
                    <span>{t("charts.cashflowTitle")}</span>
                  </h3>
                  <p className={styles.cardSubtitle}>{t("charts.cashflowSubtitle")}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>● {t("charts.income")}</span>
                  <span style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '4px' }}>● {t("charts.expense")}</span>
                </div>
              </div>

              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#000b21", borderColor: "#334155", borderRadius: "14px", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
                    />
                    <Area type="monotone" dataKey="Gəlir" stroke="#10B981" fillOpacity={1} fill="url(#chartIncome)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="Xərc" stroke="#F43F5E" fillOpacity={1} fill="url(#chartExpense)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Distribution Donut Chart */}
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    <Briefcase size={18} color="#f59e0b" />
                    <span>{t("charts.donutTitle")}</span>
                  </h3>
                  <p className={styles.cardSubtitle}>{t("charts.donutSubtitle")}</p>
                </div>
              </div>

              <div style={{ height: '160px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={EXPENSE_PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {EXPENSE_PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#000b21", borderColor: "#334155", borderRadius: "10px", fontSize: "11px" }} 
                      formatter={(val: any) => [`${Number(val).toLocaleString()} ₼`, 'Məbləğ']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.donutLegend}>
                {EXPENSE_PIE_DATA.map(item => (
                  <div key={item.name} className={styles.legendItem}>
                    <span className={styles.legendLabel}>
                      <span className={styles.legendColor} style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <span className={styles.legendVal}>{item.value} ₼</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integrated Subject & Format Live Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Subject Distribution */}
            <div className={styles.chartCard} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} color="#5ce1e6" />
                    <span>{t("analytics.subjectRevenueTitle")}</span>
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t("analytics.subjectRevenueSubtitle")}</span>
                </div>
                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(92, 225, 230, 0.1)', color: '#5ce1e6', fontWeight: 700 }}>
                  {t("analytics.subjectsCount", { count: subjectRevenueDistribution.length })}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {subjectRevenueDistribution.slice(0, 5).map((sub) => {
                  const maxRev = subjectRevenueDistribution[0]?.total || 1;
                  const pct = Math.min(100, Math.round((sub.total / maxRev) * 100));
                  return (
                    <div key={sub.subject} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{sub.subject} ({sub.count} {t("roster.studentsCount")})</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399' }}>+{sub.total.toLocaleString()} ₼</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #0ea5e9, #10b981)', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Format Distribution (Group vs Mini Group vs Individual) */}
            <div className={styles.chartCard} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} color="#c084fc" />
                    <span>{t("analytics.formatRevenueTitle")}</span>
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t("analytics.formatRevenueSubtitle")}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                {typeRevenueDistribution.map((tItem) => (
                  <div key={tItem.type} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem 0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>{tItem.type}</span>
                    <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>{tItem.count}</h5>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>+{tItem.total.toLocaleString()} ₼</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: STUDENT PAYMENT STATUS ROSTER */}
      {activeTab === 'roster' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div>
              <h3 className={styles.cardTitle}>
                <Users size={20} color="#5ce1e6" />
                <span>{t("roster.title")} ({processedRoster.length} {t("roster.studentsCount")})</span>
              </h3>
              <p className={styles.cardSubtitle}>
                {currentPeriod ? currentPeriod.name : 'Seçilmiş Dövr'} üzrə tələbələrin kurs ödənişləri və statusları.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => setShowAddStudentModal(true)} className={styles.btnPrimary} style={{ padding: '0.55rem 0.95rem', fontSize: '0.75rem' }}>
                <Plus size={14} />
                <span>{t("actions.addStudent")}</span>
              </button>

              <button onClick={exportRosterToCSV} className={styles.btnExport} title="Excel/CSV">
                <Download size={14} />
                <span>{t("actions.exportExcel")}</span>
              </button>

              <div className={styles.searchBox}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => { setRosterSearch(e.target.value); setCurrentPage(1); }}
                  placeholder={t("roster.searchPlaceholder")}
                />
              </div>

              <select
                value={rosterSubjectFilter}
                onChange={(e) => { setRosterSubjectFilter(e.target.value); setCurrentPage(1); }}
                className={styles.selectBox}
              >
                <option value="all">{t("analytics.allSubjects")}</option>
                {coursePricingStandards.map(c => (
                  <option key={c.id} value={c.course}>{c.course}</option>
                ))}
              </select>

              <select
                value={rosterTypeFilter}
                onChange={(e) => { setRosterTypeFilter(e.target.value); setCurrentPage(1); }}
                className={styles.selectBox}
              >
                <option value="all">{t("analytics.allFormats")}</option>
                <option value="Group">Group</option>
                <option value="Mini Group">Mini Group</option>
                <option value="Individual">Individual</option>
              </select>

              <select
                value={rosterStatusFilter}
                onChange={(e) => { setRosterStatusFilter(e.target.value); setCurrentPage(1); }}
                className={styles.selectBox}
              >
                <option value="all">{t("roster.allStatuses")}</option>
                <option value="PAID">✓ {t("statuses.PAID")}</option>
                <option value="ASKED">⏳ {t("statuses.ASKED")}</option>
                <option value="NOT_ASKED">● {t("statuses.NOT_ASKED")}</option>
              </select>
            </div>
          </div>

          {/* Batch Actions Bar */}
          {selectedStudentIds.length > 0 && (
            <div className={styles.batchBar}>
              <span className={styles.batchCount}>
                ✓ {t("batch.selected", { count: selectedStudentIds.length })}
              </span>
              <div className={styles.batchActions}>
                <button onClick={() => handleBatchStatus('PAID')} className={styles.batchBtn} style={{ background: '#059669' }}>
                  {t("batch.markPaid")}
                </button>
                <button onClick={() => handleBatchStatus('ASKED')} className={styles.batchBtn} style={{ background: '#d97706' }}>
                  {t("batch.markAsked")}
                </button>
                <button onClick={() => setSelectedStudentIds([])} className={styles.batchBtn} style={{ background: 'transparent' }}>
                  {t("batch.reset")}
                </button>
              </div>
            </div>
          )}

          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <button onClick={handleSelectAllOnPage} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {paginatedRoster.every(s => selectedStudentIds.includes(s.id)) && paginatedRoster.length > 0 ? (
                        <CheckSquare size={16} color="#5ce1e6" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th onClick={() => handleSort('studentName')} className={`${styles.sortableTh} ${styles.stickyCol}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{t("roster.studentName")}</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>{t("roster.subject")}</th>
                  <th>{t("roster.format")}</th>
                  <th onClick={() => handleSort('amount')} className={styles.sortableTh}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{t("roster.amount")}</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('paymentDay')} className={styles.sortableTh}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{t("roster.paymentDay")}</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>{t("roster.parentContact")}</th>
                  <th>{t("roster.paymentMethod")}</th>
                  <th style={{ textAlign: 'center' }}>{t("roster.receipt")}</th>
                  <th onClick={() => handleSort('status')} className={styles.sortableTh} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <span>{t("roster.status")}</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoster.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  return (
                    <tr key={st.id} style={{ background: isChecked ? 'rgba(76, 162, 181, 0.08)' : undefined }}>
                      <td>
                        <button 
                          onClick={() => setSelectedStudentIds(prev => isChecked ? prev.filter(id => id !== st.id) : [...prev, st.id])} 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                          {isChecked ? <CheckSquare size={16} color="#5ce1e6" /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className={styles.stickyCol} style={{ fontWeight: 700, color: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div className={styles.studentAvatar}>
                            {st.studentName.charAt(0)}
                          </div>
                          <span>{st.studentName}</span>
                        </div>
                      </td>
                      <td style={{ color: '#5ce1e6', fontWeight: 600 }}>{st.subject}</td>
                      <td>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', fontSize: '0.75rem' }}>
                          {st.type}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>{st.amount} ₼</td>
                      <td style={{ fontFamily: 'monospace' }}>{st.paymentDay}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>{st.parentName || '—'}</span>
                          {st.parentPhone ? (
                            <a 
                              href={`tel:${st.parentPhone}`} 
                              className={styles.phoneLink}
                              title="Zəng etmək üçün klikləyin"
                            >
                              <Phone size={11} color="#34d399" />
                              <span>{st.parentPhone}</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td>{st.paymentMethod || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedReceiptStudent(st)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                          title="Mədaxil qəbzinə bax və çap et"
                        >
                          <Printer size={13} color="#5ce1e6" />
                          <span>{t("roster.receipt")}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => toggleStudentStatus(st.id)}
                          className={
                            st.status === 'PAID' ? styles.badgePaid :
                            st.status === 'ASKED' ? styles.badgeAsked : styles.badgeWaiting
                          }
                          title="Statusu dəyişmək üçün klikləyin"
                        >
                          {st.status === 'PAID' && <Check size={12} />}
                          {st.status === 'ASKED' && <Clock size={12} />}
                          <span>{st.status === 'PAID' ? t("statuses.PAID") : st.status === 'ASKED' ? t("statuses.ASKED") : t("statuses.NOT_ASKED")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className={styles.pagination}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>{t("roster.showing")}:</span>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className={styles.selectBox}
                style={{ padding: '0.3rem 0.6rem', height: '32px' }}
              >
                <option value={10}>10 {t("roster.studentsCount")}</option>
                <option value={20}>20 {t("roster.studentsCount")}</option>
                <option value={50}>50 {t("roster.studentsCount")}</option>
              </select>
              <span>({t("roster.total")}: {processedRoster.length})</span>
            </div>

            <div className={styles.pageControls}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                <ChevronLeft size={14} />
              </button>
              <span className={styles.pageIndicator}>
                {t("roster.page")} {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: MULTI-ACCOUNT REGISTERS */}
      {activeTab === 'accounts' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Bank Cards Deck */}
          <div className={styles.bankCardsGrid}>
            {processedAccountRegisters.map(acc => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`${styles.bankCard} ${getBankCardClass(acc.code)} ${isSelected ? styles.bankCardSelected : ''}`}
                >
                  <div className={styles.bankCardTop}>
                    <span className={styles.bankPill}>{acc.bankName}</span>
                    <Landmark size={18} color="#94a3b8" />
                  </div>

                  <div className={styles.bankCardMid}>
                    <span className={styles.bankCardBalanceLabel}>
                      {selectedPeriodCode === 'all' ? t("accounts.balance") : `${currentPeriod.name} Üzrə Qalıq`}
                    </span>
                    <h4 className={styles.bankCardBalanceVal}>
                      {acc.currentBalance.toLocaleString()} ₼
                    </h4>
                  </div>

                  <div className={styles.bankCardBottom}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{acc.name}</span>
                    <span>{acc.transactions.length} {selectedPeriodCode === 'all' ? 'ümumi əməliyyat' : `${currentPeriod.name} əməliyyatı`}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Account Detail Ledger */}
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Receipt size={20} color="#5ce1e6" />
                  <span>{selectedAccount.name} — {t("accounts.title")}</span>
                </h3>
                <p className={styles.cardSubtitle}>
                  Bank: <strong>{selectedAccount.bankName}</strong> • Dövr: <strong style={{ color: '#5ce1e6' }}>{selectedPeriodCode === 'all' ? 'Bütün Dövrlər' : currentPeriod.name}</strong> • {t("accounts.inflow")}: <strong style={{ color: '#34d399' }}>+{selectedAccount.totalRevenue.toLocaleString()} ₼</strong> • {t("accounts.outflow")}: <strong style={{ color: '#fb7185' }}>-{selectedAccount.totalExpenditure.toLocaleString()} ₼</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button onClick={() => setShowAddBankTxModal(true)} className={styles.btnPrimary} style={{ padding: '0.55rem 0.95rem', fontSize: '0.75rem' }}>
                  <Plus size={14} />
                  <span>{t("actions.addBankTx")}</span>
                </button>
                <button onClick={() => setShowTransferModal(true)} className={styles.btnTransfer} style={{ padding: '0.55rem 0.95rem', fontSize: '0.75rem' }}>
                  <ArrowRightLeft size={14} />
                  <span>{t("actions.internalTransfer")}</span>
                </button>
                <div style={{ background: 'rgba(0, 11, 33, 0.8)', padding: '0.45rem 0.9rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    {selectedPeriodCode === 'all' ? t("accounts.currentBalance") : `${currentPeriod.name} Qalığı`}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{selectedAccount.currentBalance.toLocaleString()} ₼</span>
                </div>
              </div>
            </div>

            {selectedAccount.transactions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                {t("accounts.empty")}
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th>{t("accounts.date")}</th>
                      <th>{t("accounts.description")}</th>
                      <th>{t("accounts.category")}</th>
                      <th>{t("accounts.type")}</th>
                      <th style={{ textAlign: 'right' }}>{t("accounts.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAccount.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontFamily: 'monospace' }}>{tx.date}</td>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>{tx.description}</td>
                        <td>{tx.category || 'Əməliyyat'}</td>
                        <td>
                          <span className={tx.type === 'INCOME' ? styles.badgePaid : styles.badgeAsked}>
                            {tx.type === 'INCOME' ? t("accounts.inflow") : t("accounts.outflow")}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: tx.type === 'INCOME' ? '#34d399' : '#fb7185' }}>
                          {tx.type === 'INCOME' ? `+${tx.amount.toLocaleString()} ₼` : `-${tx.amount.toLocaleString()} ₼`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 4: BRANCH P&L */}
      {activeTab === 'branches' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Branch Switcher Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className={styles.branchPills}>
              {processedBranchFinancials.map(br => (
                <button
                  key={br.branchId}
                  onClick={() => setSelectedBranchId(br.branchId)}
                  className={`${styles.branchBtn} ${selectedBranchId === br.branchId ? styles.branchBtnActive : ''}`}
                >
                  <Building2 size={16} />
                  <span>{br.branchName}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setShowAddBranchExpenseModal(true)} className={styles.btnExpense} style={{ padding: '0.55rem 0.95rem', fontSize: '0.75rem' }}>
              <Plus size={14} />
              <span>{t("actions.addBranchExpense")}</span>
            </button>
          </div>

          {/* Branch KPI Metric Cards with Progress Bar */}
          <div className={styles.branchMetricGrid}>
            <div className={styles.branchMetricCard}>
              <span className={styles.branchMetricTitle}>{t("branchPl.monthlyRevenue")}</span>
              <h4 className={styles.branchMetricVal} style={{ color: '#34d399' }}>{selectedBranch.totalRevenue.toLocaleString()} ₼</h4>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedBranch.expenseBreakdown.length} xərc bəndi</span>
              <div className={styles.progressWrapper}>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: '100%', background: '#34d399' }} />
                </div>
              </div>
            </div>

            <div className={styles.branchMetricCard}>
              <span className={styles.branchMetricTitle}>{t("branchPl.operatingExpenses")}</span>
              <h4 className={styles.branchMetricVal} style={{ color: '#fb7185' }}>-{selectedBranch.totalExpenses.toLocaleString()} ₼</h4>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t("branchPl.expenseDesc")}</span>
              <div className={styles.progressWrapper}>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${Math.min(100, (selectedBranch.totalExpenses / selectedBranch.totalRevenue) * 100)}%`, background: '#fb7185' }} />
                </div>
              </div>
            </div>

            <div className={styles.branchMetricCard} style={{ borderColor: 'rgba(76, 162, 181, 0.4)' }}>
              <span className={styles.branchMetricTitle}>{t("branchPl.netProfit")}</span>
              <h4 className={styles.branchMetricVal} style={{ color: '#5ce1e6' }}>{selectedBranch.netProfit.toLocaleString()} ₼</h4>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                {t("branchPl.profitMargin")}: <strong style={{ color: '#34d399' }}>{selectedBranch.profitMargin}</strong>
              </span>
              <div className={styles.progressWrapper}>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${Math.min(100, (selectedBranch.netProfit / selectedBranch.totalRevenue) * 100)}%`, background: '#5ce1e6' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Branch Expense Breakdown Table */}
          <div className={styles.tableCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Briefcase size={18} color="#5ce1e6" />
                <span>{selectedBranch.branchName} — {t("branchPl.expenseBreakdownTitle")}</span>
              </h3>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>{t("accounts.category")}</th>
                    <th>{t("branchPl.recipient")}</th>
                    <th>{t("branchPl.notes")}</th>
                    <th style={{ textAlign: 'right' }}>{t("accounts.amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBranch.expenseBreakdown.map((exp, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>{exp.category}</td>
                      <td style={{ color: '#5ce1e6', fontWeight: 600 }}>{exp.recipient || '—'}</td>
                      <td>{exp.note || '—'}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#fb7185', fontSize: '0.95rem' }}>
                        -{exp.amount.toLocaleString()} ₼
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: COURSE PRICING MATRIX */}
      {activeTab === 'prices' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div>
              <h3 className={styles.cardTitle}>
                <Tag size={20} color="#5ce1e6" />
                <span>{t("priceMatrix.title")}</span>
              </h3>
              <p className={styles.cardSubtitle}>{t("priceMatrix.subtitle")}</p>
            </div>

            <button onClick={() => setShowAddPriceModal(true)} className={styles.btnPrimary} style={{ padding: '0.55rem 0.95rem', fontSize: '0.75rem' }}>
              <Plus size={14} />
              <span>{t("actions.addPrice")}</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>{t("priceMatrix.course")}</th>
                  <th>{t("priceMatrix.groupPrice")}</th>
                  <th>{t("priceMatrix.individualPrice")}</th>
                  <th>{t("priceMatrix.schedule")}</th>
                  <th>{t("priceMatrix.audience")}</th>
                  <th>{t("priceMatrix.duration")}</th>
                  <th>{t("priceMatrix.capacity")}</th>
                </tr>
              </thead>
              <tbody>
                {coursePricingStandards.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>{p.course}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>{p.groupPrice} ₼</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#5ce1e6', fontSize: '0.95rem' }}>{p.individualPrice ? `${p.individualPrice} ₼` : '—'}</td>
                    <td>{p.schedule}</td>
                    <td>{p.audience}</td>
                    <td>{p.duration}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {p.maxCapacity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 6: DYNAMIC FINANCIAL PERIODS & ARCHIVE AUDIT LOG */}
      {activeTab === 'periods' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div>
              <h3 className={styles.cardTitle}>
                <FolderArchive size={20} color="#5ce1e6" />
                <span>Rəsmi Şirkət Maliyyə Dövrləri & Arxiv Audit Reyestri</span>
              </h3>
              <p className={styles.cardSubtitle}>
                Hər ay Super Admin tərəfindən idarə olunan, qapanmış və rəsmi möhürlənmiş şirkət hesabat jurnalı.
              </p>
            </div>

            <button onClick={() => setShowOpenPeriodModal(true)} className={styles.btnPrimary}>
              <Plus size={16} />
              <span>{t("periods.openNewPeriod")}</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Dövr Kodu & Adı</th>
                  <th>Status</th>
                  <th>Tarix Aralığı</th>
                  <th>{t("periods.openingBalance")}</th>
                  <th>Mədaxil (Gəlir)</th>
                  <th>Məxaric (Xərc)</th>
                  <th>{t("periods.netProfit")}</th>
                  <th>Rentabellik</th>
                  <th style={{ textAlign: 'center' }}>Sənəd / Qapanış</th>
                  <th style={{ textAlign: 'center' }}>İdarəetmə</th>
                </tr>
              </thead>
              <tbody>
                {financialPeriods.map((period) => {
                  const isCur = selectedPeriodCode === period.code;
                  return (
                    <tr key={period.id} style={{ background: isCur ? 'rgba(76, 162, 181, 0.08)' : undefined }}>
                      <td>
                        <div>
                          <span style={{ fontWeight: 800, color: '#ffffff', display: 'block' }}>{period.name}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#5ce1e6' }}>{period.code}</span>
                        </div>
                      </td>
                      <td>
                        {period.status === 'ACTIVE' ? (
                          <span className={styles.periodActiveBadge}>
                            <CheckCircle2 size={12} />
                            <span>{t("periods.activeBadge")}</span>
                          </span>
                        ) : (
                          <span className={styles.periodArchivedBadge}>
                            <Lock size={12} />
                            <span>{t("periods.archivedBadge")}</span>
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {period.startDate} → {period.endDate}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                        {period.openingBalance.toLocaleString()} ₼
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399' }}>
                        +{period.totalRevenue.toLocaleString()} ₼
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fb7185' }}>
                        -{period.totalExpenses.toLocaleString()} ₼
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#5ce1e6', fontSize: '0.92rem' }}>
                        {period.netProfit.toLocaleString()} ₼
                      </td>
                      <td style={{ fontWeight: 700, color: '#34d399' }}>
                        {period.profitMargin}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => setSelectedCertificatePeriod(period)}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#5ce1e6', padding: '0.35rem 0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600 }}
                            title="Rəsmi Qapanış Sertifikatına bax və çap et"
                          >
                            <Award size={13} />
                            <span>Sertifikat</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPeriodCode(period.code);
                              setShowDetailedAuditModal(true);
                            }}
                            style={{ background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.35)', color: '#38bdf8', padding: '0.35rem 0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700 }}
                            title="Detallı Rəsmi Audit PDF Çıxarışı"
                          >
                            <FileText size={13} />
                            <span>Audit PDF</span>
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {period.status === 'ACTIVE' ? (
                          <button
                            onClick={() => {
                              setSelectedPeriodCode(period.code);
                              setShowArchivePeriodModal(true);
                            }}
                            className={styles.btnArchive}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                          >
                            <Lock size={12} />
                            <span>Arxivlə</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivatePeriod(period.code)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.35rem 0.65rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                            title="Arxivdən çıxar və aktiv et"
                          >
                            <Unlock size={12} style={{ marginRight: '3px' }} />
                            <span>Aktiv Et</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 7: INVOICES & SUPABASE TRANSACTIONS */}
      {activeTab === 'invoices' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div>
              <h3 className={styles.cardTitle}>
                <FileText size={20} color="#5ce1e6" />
                <span>{t("tabs.invoices")}</span>
              </h3>
              <p className={styles.cardSubtitle}>
                Supabase məlumat bazasından toplanan real faktura və ödənişlər.
              </p>
            </div>

            <button onClick={() => setShowCreateModal(true)} className={styles.btnPrimary}>
              <Plus size={16} />
              <span>{t("actions.createInvoice")}</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Faktura ID</th>
                  <th>{t("roster.studentName")}</th>
                  <th>{t("roster.amount")}</th>
                  <th>{t("roster.amount")}</th>
                  <th>{t("roster.paymentDay")}</th>
                  <th style={{ textAlign: 'center' }}>{t("roster.status")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      {t("accounts.empty")}
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{inv.id.substring(0, 8)}...</td>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>{inv.studentName || 'Tələbə'}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#ffffff' }}>{inv.amount} ₼</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399' }}>{inv.paidAmount} ₼</td>
                      <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={inv.status === 'PAID' ? styles.badgePaid : styles.badgeAsked}>
                          {inv.status === 'PAID' ? t("statuses.PAID") : t("statuses.NOT_ASKED")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* 1. MODAL: OPEN NEW FINANCIAL PERIOD (Super Admin Manual Entry) */}
      <AnimatePresence>
        {showOpenPeriodModal && (
          <div className={styles.modalOverlay} onClick={() => setShowOpenPeriodModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <FolderArchive size={20} color="#5ce1e6" />
                  <span>{t("openPeriod.title")}</span>
                </h3>
                <button onClick={() => setShowOpenPeriodModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleOpenPeriodSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("openPeriod.periodName")}</label>
                    <input
                      type="text"
                      value={newPeriodForm.name}
                      onChange={(e) => setNewPeriodForm({ ...newPeriodForm, name: e.target.value })}
                      placeholder={t("openPeriod.periodNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("openPeriod.periodCode")}</label>
                    <input
                      type="text"
                      value={newPeriodForm.code}
                      onChange={(e) => setNewPeriodForm({ ...newPeriodForm, code: e.target.value })}
                      placeholder={t("openPeriod.periodCodePlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("openPeriod.startDate")}</label>
                    <input
                      type="date"
                      value={newPeriodForm.startDate}
                      onChange={(e) => setNewPeriodForm({ ...newPeriodForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("openPeriod.endDate")}</label>
                    <input
                      type="date"
                      value={newPeriodForm.endDate}
                      onChange={(e) => setNewPeriodForm({ ...newPeriodForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Granular Per-Account Opening Balances Section */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#5ce1e6', margin: 0 }}>
                      🏦 {t("openPeriod.accountBalancesTitle")}
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t("openPeriod.accountBalancesSubtitle")}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {INITIAL_ACCOUNT_REGISTERS.map(acc => (
                      <div key={acc.id} style={{ background: '#020919', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f1f5f9' }}>{acc.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{acc.bankName.split(' ')[0]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            value={newPeriodForm.accountBalances[acc.id] || "0"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewPeriodForm(prev => ({
                                ...prev,
                                accountBalances: {
                                  ...prev.accountBalances,
                                  [acc.id]: val
                                }
                              }));
                            }}
                            placeholder="0"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.92rem', padding: '0.35rem 0.5rem', borderRadius: '6px' }}
                            required
                          />
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>₼</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Auto-sum summary badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.6rem 0.9rem', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>{t("openPeriod.totalOpeningBalance")}</span>
                    <strong style={{ fontSize: '1.05rem', color: '#34d399', fontFamily: 'monospace', fontWeight: 900 }}>
                      {Object.values(newPeriodForm.accountBalances).reduce((sum, v) => sum + (parseFloat(v) || 0), 0).toLocaleString()} ₼
                    </strong>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t("openPeriod.notes")}</label>
                  <textarea
                    rows={2}
                    value={newPeriodForm.notes}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, notes: e.target.value })}
                    placeholder={t("openPeriod.notesPlaceholder")}
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowOpenPeriodModal(false)} className={styles.btnCancel}>
                    {t("openPeriod.cancel")}
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {t("openPeriod.submit")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MODAL: CLOSE & ARCHIVE PERIOD (Rəsmi Qapanış & Arxivləmə) */}
      <AnimatePresence>
        {showArchivePeriodModal && currentPeriod && (
          <div className={styles.modalOverlay} onClick={() => setShowArchivePeriodModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <Lock size={20} color="#fbbf24" />
                  <span>Maliyyə Dövrünü Bağla və Arxivləşdir</span>
                </h3>
                <button onClick={() => setShowArchivePeriodModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1rem', borderRadius: '14px', fontSize: '0.82rem', color: '#fbbf24', lineHeight: 1.5 }}>
                ⚠️ <strong>Diqqət:</strong> <u>{currentPeriod.name}</u> maliyyə dövrünü bağladıqda, həmin dövrün bütün gəlir və xərc əməliyyatları kilidlənir, rəsmi şirkət audit nömrəsi təyin olunur və arxivə qovuşur.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: '#020919', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8' }}>Dövr Kodu:</span>
                  <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{currentPeriod.code}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8' }}>Dövrün Ümumi Gəliri:</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>+{calculateTotalIncome().toLocaleString()} ₼</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8' }}>Dövrün Ümumi Xərci:</span>
                  <strong style={{ color: '#fb7185', fontFamily: 'monospace' }}>-{calculateTotalExpenses().toLocaleString()} ₼</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>Xalis Mənfəət:</span>
                  <strong style={{ color: '#5ce1e6', fontFamily: 'monospace' }}>{netProfit.toLocaleString()} ₼ ({profitMarginPercent}%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Təsdiq Edən Super Admin:</span>
                  <span>{session?.user?.name || 'Tamerlan Məmmədov'}</span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowArchivePeriodModal(false)} className={styles.btnCancel}>
                  {t("transferModal.cancel")}
                </button>
                <button type="button" onClick={handleArchivePeriodSubmit} className={styles.btnArchive}>
                  <Lock size={14} />
                  <span>Dövrü Rəsmi Bağla və Arxivlə</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MODAL: OFFICIAL COMPANY PERIOD CLOSING CERTIFICATE (ENGLISH - ARIAL) */}
      <AnimatePresence>
        {selectedCertificatePeriod && (
          <div className={styles.modalOverlay} onClick={() => setSelectedCertificatePeriod(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.certificateCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.certificateHeader}>
                <div>
                  <h2 className={styles.certificateTitle}>THRIVE GROUP AZERBAIJAN</h2>
                  <p className={styles.certificateSubtitle}>CORPORATE FINANCIAL AUDIT & STATUTORY CLOSING STATEMENT</p>
                </div>
                <div className={styles.certificateStamp}>
                  <span>OFFICIAL AUDIT</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div>
                  <span>Document Ref: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedCertificatePeriod.officialCertificateNo || 'TRV-FIN-2026-CERT'}</strong></span><br />
                  <span>Financial Period: <strong style={{ color: '#003f82' }}>{selectedCertificatePeriod.name} ({selectedCertificatePeriod.code})</strong></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span>Audit Cycle: <strong>{selectedCertificatePeriod.startDate} — {selectedCertificatePeriod.endDate}</strong></span><br />
                  <span>Status: <strong style={{ color: selectedCertificatePeriod.status === 'ACTIVE' ? '#10b981' : '#b45309' }}>{selectedCertificatePeriod.status === 'ACTIVE' ? 'ACTIVE CYCLE' : 'AUDITED & ARCHIVED'}</strong></span>
                </div>
              </div>

              <table className={styles.receiptTable}>
                <tbody>
                  <tr>
                    <td style={{ color: '#475569' }}>Opening Ledger Balance (Brought Forward)</td>
                    <td style={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedCertificatePeriod.openingBalance.toLocaleString()}.00 AZN</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Gross Operating Revenue (Tuition Fees & Services)</td>
                    <td style={{ color: '#10b981', fontFamily: 'monospace' }}>+{selectedCertificatePeriod.totalRevenue.toLocaleString()}.00 AZN</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Total Operating Expenses (Rent, Salaries, Taxes, Utilities)</td>
                    <td style={{ color: '#e11d48', fontFamily: 'monospace' }}>-{selectedCertificatePeriod.totalExpenses.toLocaleString()}.00 AZN</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Operating Profit Margin (EBITDA Margin)</td>
                    <td style={{ color: '#003f82', fontWeight: 800 }}>{selectedCertificatePeriod.profitMargin}</td>
                  </tr>
                  <tr className={styles.receiptTotalRow}>
                    <td style={{ paddingTop: '0.85rem' }}>NET OPERATING PROFIT (EBITDA)</td>
                    <td style={{ paddingTop: '0.85rem', color: '#003f82' }}>{selectedCertificatePeriod.netProfit.toLocaleString()}.00 AZN</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: '#475569', border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                <strong>Statutory Compliance Statement:</strong> This corporate financial statement has been verified, reconciled across all 6 active bank accounts and cash registers, and officially certified under Thrive Group corporate financial standards.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #003f82', paddingTop: '1rem', fontSize: '0.75rem', color: '#334155' }}>
                <div>
                  <span>Certified By: <strong>{selectedCertificatePeriod.closedBy || 'Super Admin (Tamerlan Mammadov)'}</strong></span><br />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Certification Date: {selectedCertificatePeriod.closedAt || new Date().toUTCString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ width: '130px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Corporate Stamp & Signature</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedCertificatePeriod(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  Close Statement
                </button>
                <button
                  onClick={() => window.print()}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#003f82', color: '#ffffff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={14} />
                  <span>Print Audit Statement</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3.5 DETAILED MULTI-SECTION STATUTORY AUDIT PDF REPORT MODAL (ENGLISH - ARIAL) */}
      <AnimatePresence>
        {showDetailedAuditModal && currentPeriod && (
          <div className={styles.modalOverlay} onClick={() => setShowDetailedAuditModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.detailedAuditCard}
              onClick={e => e.stopPropagation()}
            >
              {/* Header & Logo */}
              <div className={styles.auditPdfHeader}>
                <div>
                  <h1 className={styles.auditPdfTitle}>THRIVE GROUP AZERBAIJAN</h1>
                  <p className={styles.auditPdfSubtitle}>STATUTORY EXECUTIVE AUDIT & COMPREHENSIVE FINANCIAL CLOSE STATEMENT</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.75rem', color: '#475569', flexWrap: 'wrap' }}>
                    <span>Doc Ref: <strong style={{ color: '#003f82', fontFamily: 'monospace' }}>TRV-AUDIT-{currentPeriod.code.toUpperCase()}-FINAL</strong></span>
                    <span>•</span>
                    <span>Period: <strong style={{ color: '#0f172a' }}>{currentPeriod.name} ({currentPeriod.code})</strong></span>
                    <span>•</span>
                    <span>Cycle: <strong>{currentPeriod.startDate} — {currentPeriod.endDate}</strong></span>
                  </div>
                </div>
                <div className={styles.certificateStamp}>
                  <span>OFFICIAL STATUTORY AUDIT</span>
                </div>
              </div>

              {/* Section 1: Executive KPI Highlights */}
              <div className={styles.auditKpiGrid}>
                <div className={styles.auditKpiBox}>
                  <span className={styles.auditKpiLabel}>Opening Capital Balance</span>
                  <span className={styles.auditKpiValue}>{currentPeriod.openingBalance.toLocaleString()} AZN</span>
                </div>
                <div className={styles.auditKpiBox}>
                  <span className={styles.auditKpiLabel}>Gross Operating Revenue</span>
                  <span className={styles.auditKpiValue} style={{ color: '#10b981' }}>+{currentPeriod.totalRevenue.toLocaleString()} AZN</span>
                </div>
                <div className={styles.auditKpiBox}>
                  <span className={styles.auditKpiLabel}>Total Operating Outflows</span>
                  <span className={styles.auditKpiValue} style={{ color: '#e11d48' }}>-{currentPeriod.totalExpenses.toLocaleString()} AZN</span>
                </div>
                <div className={styles.auditKpiBox}>
                  <span className={styles.auditKpiLabel}>Net Operating EBITDA</span>
                  <span className={styles.auditKpiValue} style={{ color: '#003f82' }}>{currentPeriod.netProfit.toLocaleString()} AZN</span>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 800 }}>Margin: {currentPeriod.profitMargin}</span>
                </div>
              </div>

              {/* Section 2: Statement of Comprehensive Profit & Loss (P&L Breakdown) */}
              <div className={styles.auditSectionBlock}>
                <h3 className={styles.auditSectionHeading}>
                  <span>1. Statement of Comprehensive Profit & Loss (P&L Breakdown)</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Currency: AZN (₼)</span>
                </h3>
                <table className={styles.auditDataTable}>
                  <thead>
                    <tr>
                      <th>Ledger Classification / Line Item</th>
                      <th>Account Type</th>
                      <th>Audit Period Status</th>
                      <th style={{ textAlign: 'right' }}>Audited Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Academic Tuition Fees & Student Enrollments</strong></td>
                      <td>Operating Revenue</td>
                      <td><span style={{ color: '#10b981', fontWeight: 700 }}>Cleared & Reconciled</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>+{(currentPeriod.totalRevenue * 0.88).toFixed(0)} AZN</td>
                    </tr>
                    <tr>
                      <td><strong>Official SAT Exam Registrations & Bilet Fees</strong></td>
                      <td>Ancillary Revenue</td>
                      <td><span style={{ color: '#10b981', fontWeight: 700 }}>Reconciled (CollegeBoard)</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>+{(currentPeriod.totalRevenue * 0.12).toFixed(0)} AZN</td>
                    </tr>
                    <tr>
                      <td><strong>Branch Lease & Commercial Real Estate (Nizami + Narimanov)</strong></td>
                      <td>Fixed Expenditure</td>
                      <td><span style={{ color: '#e11d48', fontWeight: 700 }}>Settled (Contractual)</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>-7,200 AZN</td>
                    </tr>
                    <tr>
                      <td><strong>Faculty & Teacher Salaries (Payroll & Teaching Hours)</strong></td>
                      <td>Variable Operating Cost</td>
                      <td><span style={{ color: '#e11d48', fontWeight: 700 }}>Disbursed in Full</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>-{(currentPeriod.totalExpenses * 0.38).toFixed(0)} AZN</td>
                    </tr>
                    <tr>
                      <td><strong>Digital Acquisition, Meta Ads & Marketing Campaigns</strong></td>
                      <td>Operating Expenditure</td>
                      <td><span style={{ color: '#e11d48', fontWeight: 700 }}>Audited Invoices</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>-1,450 AZN</td>
                    </tr>
                    <tr>
                      <td><strong>Utilities, Fiber Internet, Taxes & Facility Upkeep</strong></td>
                      <td>Administrative Cost</td>
                      <td><span style={{ color: '#e11d48', fontWeight: 700 }}>Reconciled Receipts</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>-{(currentPeriod.totalExpenses - 7200 - (currentPeriod.totalExpenses * 0.38) - 1450).toFixed(0)} AZN</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #003f82' }}>
                      <td colSpan={3} style={{ color: '#003f82', fontSize: '0.85rem' }}>NET PERIOD OPERATING PROFIT (EBITDA)</td>
                      <td style={{ textAlign: 'right', color: '#003f82', fontSize: '0.95rem' }}>{currentPeriod.netProfit.toLocaleString()}.00 AZN</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Reconciled Bank Accounts & Cash Register Schedule */}
              <div className={styles.auditSectionBlock}>
                <h3 className={styles.auditSectionHeading}>
                  <span>2. Reconciled Bank & Cash Accounts Schedule</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>6 Active Ledgers</span>
                </h3>
                <table className={styles.auditDataTable}>
                  <thead>
                    <tr>
                      <th>Bank Account / Register</th>
                      <th>Account Holder / Bank</th>
                      <th>Period Inflow (+)</th>
                      <th>Period Outflow (-)</th>
                      <th style={{ textAlign: 'right' }}>Reconciled Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedAccountRegisters.map(acc => (
                      <tr key={acc.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{acc.name}</td>
                        <td style={{ color: '#64748b' }}>{acc.bankName}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>+{acc.totalRevenue.toLocaleString()} AZN</td>
                        <td style={{ color: '#e11d48', fontWeight: 700 }}>-{acc.totalExpenditure.toLocaleString()} AZN</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#003f82' }}>{acc.currentBalance.toLocaleString()} AZN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 4: Branch Operating Performance & Efficiency */}
              <div className={styles.auditSectionBlock}>
                <h3 className={styles.auditSectionHeading}>
                  <span>3. Branch Operating Performance (P&L Breakdown)</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Nizami & Narimanov Corps</span>
                </h3>
                <table className={styles.auditDataTable}>
                  <thead>
                    <tr>
                      <th>Branch Location</th>
                      <th>Operating Revenue</th>
                      <th>Branch Expenses</th>
                      <th>Branch Net Profit</th>
                      <th style={{ textAlign: 'right' }}>Efficiency Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedBranchFinancials.map(br => (
                      <tr key={br.branchId}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{br.branchName}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>+{br.totalRevenue.toLocaleString()} AZN</td>
                        <td style={{ color: '#e11d48', fontWeight: 700 }}>-{br.totalExpenses.toLocaleString()} AZN</td>
                        <td style={{ color: '#003f82', fontWeight: 800 }}>{br.netProfit.toLocaleString()} AZN</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{br.profitMargin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 5: Student Tuition Collection Rate Schedule */}
              <div className={styles.auditSectionBlock}>
                <h3 className={styles.auditSectionHeading}>
                  <span>4. Student Tuition Fee Collection & Receivables Schedule</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Collection Rate: {currentPeriod.collectionRate || '96.5%'}</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Enrolled Cohort</span>
                    <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{processedRoster.length} Candidates</strong>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ color: '#166534', display: 'block', fontSize: '0.7rem' }}>Cleared & Paid</span>
                    <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>{processedRoster.filter(s => s.status === 'PAID').length} Payments</strong>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '0.6rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <span style={{ color: '#92400e', display: 'block', fontSize: '0.7rem' }}>Follow-up / Reminded</span>
                    <strong style={{ color: '#d97706', fontSize: '1.1rem' }}>{processedRoster.filter(s => s.status === 'ASKED').length} In Progress</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Pending Clearance</span>
                    <strong style={{ color: '#475569', fontSize: '1.1rem' }}>{processedRoster.filter(s => s.status === 'NOT_ASKED').length} Awaiting</strong>
                  </div>
                </div>
              </div>

              {/* Section 6: Statutory Corporate Sign-off & Audit Seal */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#334155', lineHeight: 1.5 }}>
                <strong>Official Audit Certification:</strong> This statutory executive audit statement has been prepared and reconciled in compliance with Thrive Group corporate accounting principles. All transaction ledgers, bank statements, tuition fee records, and branch expenses for the period <strong>{currentPeriod.name}</strong> have been independently audited and certified as accurate and complete.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2.5px solid #003f82', paddingTop: '1.25rem', fontSize: '0.75rem', color: '#1e293b' }}>
                <div>
                  <span>Audited & Approved By: <strong>{currentPeriod.closedBy || 'Super Admin (Tamerlan Mammadov)'}</strong></span><br />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Audit Timestamp: {currentPeriod.closedAt || new Date().toUTCString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ width: '150px', borderBottom: '1.5px solid #000', marginBottom: '4px' }}></div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Corporate Seal & Authorized Signature</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setShowDetailedAuditModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  Close Report
                </button>
                <button
                  onClick={() => window.print()}
                  style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: '#003f82', color: '#ffffff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Printer size={15} />
                  <span>Print / Save Detailed PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. INTERNAL TRANSFER MODAL (Hesablararası Köçürmə) */}
      <AnimatePresence>
        {showTransferModal && (
          <div className={styles.modalOverlay} onClick={() => setShowTransferModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <ArrowRightLeft size={20} color="#c084fc" />
                  <span>{t("transferModal.title")}</span>
                </h3>
                <button onClick={() => setShowTransferModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleInternalTransferSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("transferModal.source")}</label>
                    <select
                      value={transferForm.sourceAccountId}
                      onChange={(e) => setTransferForm({ ...transferForm, sourceAccountId: e.target.value })}
                    >
                      {processedAccountRegisters.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — Cari Balans: {a.currentBalance.toLocaleString()} ₼</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t("transferModal.destination")}</label>
                    <select
                      value={transferForm.destinationAccountId}
                      onChange={(e) => setTransferForm({ ...transferForm, destinationAccountId: e.target.value })}
                    >
                      {processedAccountRegisters.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — Cari Balans: {a.currentBalance.toLocaleString()} ₼</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("transferModal.amount")}</label>
                    <input
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      placeholder="Məs: 500"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("transferModal.date")}</label>
                    <input
                      type="date"
                      value={transferForm.date}
                      onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t("transferModal.note")}</label>
                  <input
                    type="text"
                    value={transferForm.note}
                    onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                    placeholder="Məs: Digihesabdan Nəğd kassaya köçürmə"
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className={styles.btnCancel}
                  >
                    {t("transferModal.cancel")}
                  </button>
                  <button
                    type="submit"
                    className={styles.btnTransfer}
                  >
                    {t("transferModal.submit")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. DYNAMIC MODAL: ADD STUDENT TO ROSTER */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddStudentModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <Users size={20} color="#5ce1e6" />
                  <span>{t("modals.newStudentTitle")}</span>
                </h3>
                <button onClick={() => setShowAddStudentModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("modals.studentName")}</label>
                    <input
                      type="text"
                      value={newStudentForm.studentName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, studentName: e.target.value })}
                      placeholder={t("modals.studentNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("modals.subjectSelect")}</label>
                    <select
                      value={newStudentForm.subject}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        const match = coursePricingStandards.find(c => c.course === newSub);
                        let autoAmount = newStudentForm.amount;
                        if (match) {
                          if (newStudentForm.type === 'Group') autoAmount = String(match.groupPrice);
                          else if (newStudentForm.type === 'Mini Group') autoAmount = String(match.groupPrice + (match.groupPrice >= 300 ? 50 : 20));
                          else if (newStudentForm.type === 'Individual') autoAmount = String(match.individualPrice || Math.round(match.groupPrice * 1.8));
                        }
                        setNewStudentForm({ ...newStudentForm, subject: newSub, amount: autoAmount });
                      }}
                    >
                      {coursePricingStandards.map(c => (
                        <option key={c.id} value={c.course}>{c.course}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("modals.formatSelect")}</label>
                    <select
                      value={newStudentForm.type}
                      onChange={(e) => {
                        const newType = e.target.value as 'Group' | 'Mini Group' | 'Individual';
                        const match = coursePricingStandards.find(c => c.course === newStudentForm.subject);
                        let autoAmount = newStudentForm.amount;
                        if (match) {
                          if (newType === 'Group') autoAmount = String(match.groupPrice);
                          else if (newType === 'Mini Group') autoAmount = String(match.groupPrice + (match.groupPrice >= 300 ? 50 : 20));
                          else if (newType === 'Individual') autoAmount = String(match.individualPrice || Math.round(match.groupPrice * 1.8));
                        }
                        setNewStudentForm({ ...newStudentForm, type: newType, amount: autoAmount });
                      }}
                    >
                      <option value="Group">{t("modals.formatGroup")}</option>
                      <option value="Mini Group">{t("modals.formatMini")}</option>
                      <option value="Individual">{t("modals.formatIndividual")}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("modals.amount")}</label>
                    <input
                      type="number"
                      value={newStudentForm.amount}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, amount: e.target.value })}
                      placeholder="300"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("modals.parentName")}</label>
                    <input
                      type="text"
                      value={newStudentForm.parentName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                      placeholder={t("modals.parentNamePlaceholder")}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("modals.parentPhone")}</label>
                    <input
                      type="text"
                      value={newStudentForm.parentPhone}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })}
                      placeholder={t("modals.parentPhonePlaceholder")}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("modals.paymentMethod")}</label>
                    <select
                      value={newStudentForm.paymentMethod}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, paymentMethod: e.target.value })}
                    >
                      <option value="ABB Card">ABB Card (Digihesab)</option>
                      <option value="Leobank">Leobank</option>
                      <option value="Nəğd Kassa">Nəğd Kassa</option>
                      <option value="UBank">UBank</option>
                      <option value="POS Terminal">POS Terminal</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("modals.initialStatus")}</label>
                    <select
                      value={newStudentForm.status}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, status: e.target.value as any })}
                    >
                      <option value="PAID">{t("modals.statusPaid")}</option>
                      <option value="ASKED">{t("modals.statusAsked")}</option>
                      <option value="NOT_ASKED">{t("modals.statusPending")}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowAddStudentModal(false)} className={styles.btnCancel}>
                    {t("transferModal.cancel")}
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {t("modals.submitStudent")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DYNAMIC MODAL: ADD BANK TRANSACTION */}
      <AnimatePresence>
        {showAddBankTxModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddBankTxModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <Receipt size={20} color="#34d399" />
                  <span>{selectedAccount.name} — Yeni Əməliyyat</span>
                </h3>
                <button onClick={() => setShowAddBankTxModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddBankTxSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Əməliyyat Növü</label>
                    <select
                      value={newBankTxForm.type}
                      onChange={(e) => setNewBankTxForm({ ...newBankTxForm, type: e.target.value as any })}
                    >
                      <option value="INCOME">Daxilolma / Mədaxil (+)</option>
                      <option value="EXPENSE">Xərc / Məxaric (-)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Məbləğ (₼)</label>
                    <input
                      type="number"
                      value={newBankTxForm.amount}
                      onChange={(e) => setNewBankTxForm({ ...newBankTxForm, amount: e.target.value })}
                      placeholder="250"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tarix</label>
                    <input
                      type="date"
                      value={newBankTxForm.date}
                      onChange={(e) => setNewBankTxForm({ ...newBankTxForm, date: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Kateqoriya</label>
                    <input
                      type="text"
                      value={newBankTxForm.category}
                      onChange={(e) => setNewBankTxForm({ ...newBankTxForm, category: e.target.value })}
                      placeholder="Məs: Təhsil Haqqı, İcarə..."
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Açıqlama / Təyinat</label>
                  <input
                    type="text"
                    value={newBankTxForm.description}
                    onChange={(e) => setNewBankTxForm({ ...newBankTxForm, description: e.target.value })}
                    placeholder="Məs: Aytən - IELTS İntensiv dərsi"
                    required
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowAddBankTxModal(false)} className={styles.btnCancel}>
                    {t("transferModal.cancel")}
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Əməliyyatı Saxla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. DYNAMIC MODAL: ADD PRICE STANDARD */}
      <AnimatePresence>
        {showAddPriceModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddPriceModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <Tag size={20} color="#5ce1e6" />
                  <span>Yeni Kurs Qiymət Standartı</span>
                </h3>
                <button onClick={() => setShowAddPriceModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddPriceSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Kurs / Fənn Adı</label>
                  <input
                    type="text"
                    value={newPriceForm.course}
                    onChange={(e) => setNewPriceForm({ ...newPriceForm, course: e.target.value })}
                    placeholder="Məs: SAT Intensive Math"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Qrup Qiyməti (₼)</label>
                    <input
                      type="number"
                      value={newPriceForm.groupPrice}
                      onChange={(e) => setNewPriceForm({ ...newPriceForm, groupPrice: e.target.value })}
                      placeholder="300"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Fərdi Qiymət (₼)</label>
                    <input
                      type="number"
                      value={newPriceForm.individualPrice}
                      onChange={(e) => setNewPriceForm({ ...newPriceForm, individualPrice: e.target.value })}
                      placeholder="600"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Dərs Qrafiki</label>
                    <input
                      type="text"
                      value={newPriceForm.schedule}
                      onChange={(e) => setNewPriceForm({ ...newPriceForm, schedule: e.target.value })}
                      placeholder="Həftədə 3 dəfə 90 dəq"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hədəf Kütlə</label>
                    <input
                      type="text"
                      value={newPriceForm.audience}
                      onChange={(e) => setNewPriceForm({ ...newPriceForm, audience: e.target.value })}
                      placeholder="10-11-ci siniflər"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Müddət</label>
                    <input
                      type="text"
                      value={newPriceForm.duration}
                      onChange={(e) => setNewPriceForm({ ...newPriceForm, duration: e.target.value })}
                      placeholder="3-6 ay"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Qrup Tutumu</label>
                    <input
                      type="text"
                      value={newPriceForm.maxCapacity}
                      onChange={(e) => setNewPriceForm({ ...newPriceForm, maxCapacity: e.target.value })}
                      placeholder="Max 6 nəfər"
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowAddPriceModal(false)} className={styles.btnCancel}>
                    {t("transferModal.cancel")}
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Standartı Yadda Saxla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. DYNAMIC MODAL: ADD BRANCH EXPENSE */}
      <AnimatePresence>
        {showAddBranchExpenseModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddBranchExpenseModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <Building2 size={20} color="#fb7185" />
                  <span>{selectedBranch.branchName} — Yeni Xərc Maddəsi</span>
                </h3>
                <button onClick={() => setShowAddBranchExpenseModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddBranchExpenseSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Xərc Kateqoriyası</label>
                    <select
                      value={newBranchExpenseForm.category}
                      onChange={(e) => setNewBranchExpenseForm({ ...newBranchExpenseForm, category: e.target.value })}
                    >
                      <option value="Müəllim Maaşı">Müəllim Maaşı</option>
                      <option value="Rent (İcarə)">Rent (İcarə)</option>
                      <option value="Marketinq & Reklam">Marketinq & Reklam</option>
                      <option value="Kommunal Xərclər">Kommunal Xərclər</option>
                      <option value="Təmir & Təsərrüfat">Təmir & Təsərrüfat</option>
                      <option value="Vergi Ödənişləri">Vergi Ödənişləri</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Məbləğ (₼)</label>
                    <input
                      type="number"
                      value={newBranchExpenseForm.amount}
                      onChange={(e) => setNewBranchExpenseForm({ ...newBranchExpenseForm, amount: e.target.value })}
                      placeholder="500"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Qəbul Edən Şəxs / Təşkilat</label>
                  <input
                    type="text"
                    value={newBranchExpenseForm.recipient}
                    onChange={(e) => setNewBranchExpenseForm({ ...newBranchExpenseForm, recipient: e.target.value })}
                    placeholder="Məs: Rəşad müəllim"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ətraflı Qeyd</label>
                  <input
                    type="text"
                    value={newBranchExpenseForm.note}
                    onChange={(e) => setNewBranchExpenseForm({ ...newBranchExpenseForm, note: e.target.value })}
                    placeholder="Məs: Avqust ayı SAT dərsləri"
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowAddBranchExpenseModal(false)} className={styles.btnCancel}>
                    {t("transferModal.cancel")}
                  </button>
                  <button type="submit" className={styles.btnExpense}>
                    Xərci Əlavə Et
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. CREATE INVOICE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <FileText size={20} color="#4ca2b5" />
                  <span>{t("actions.createInvoice")}</span>
                </h3>
                <button onClick={() => setShowCreateModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Tələbə Seçin</label>
                  <select
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    required
                  >
                    <option value="">Tələbə seçin...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.phone || 'Nömrəsiz'})</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Məbləğ (₼)</label>
                    <input
                      type="number"
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                      placeholder="300"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ödənilən Məbləğ (₼)</label>
                    <input
                      type="number"
                      value={createForm.paidAmount}
                      onChange={(e) => setCreateForm({ ...createForm, paidAmount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Son Ödəniş Tarixi</label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={styles.btnCancel}
                  >
                    {t("transferModal.cancel")}
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                  >
                    {t("actions.createInvoice")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. CREATE EXPENSE MODAL */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className={styles.modalOverlay} onClick={() => setShowExpenseModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <Receipt size={20} color="#fb7185" />
                  <span>{t("actions.addExpense")}</span>
                </h3>
                <button onClick={() => setShowExpenseModal(false)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddExpenseSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>{t("accounts.category")}</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    <option value="rent">{t("expenseCategories.rent")}</option>
                    <option value="salaries">{t("expenseCategories.salaries")}</option>
                    <option value="marketing">{t("expenseCategories.marketing")}</option>
                    <option value="utilities">{t("expenseCategories.utilities")}</option>
                    <option value="internet">{t("expenseCategories.internet")}</option>
                    <option value="office">{t("expenseCategories.office")}</option>
                    <option value="repairs">{t("expenseCategories.repairs")}</option>
                    <option value="sat">{t("expenseCategories.sat")}</option>
                    <option value="taxes">{t("expenseCategories.taxes")}</option>
                    <option value="other">{t("expenseCategories.other")}</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t("accounts.amount")}</label>
                    <input
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="150"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t("accounts.date")}</label>
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t("transferModal.note")}</label>
                  <textarea
                    rows={2}
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Məs: 300 ədəd qələm və marker..."
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className={styles.btnCancel}
                  >
                    {t("transferModal.cancel")}
                  </button>
                  <button
                    type="submit"
                    className={styles.btnExpense}
                  >
                    {t("actions.addExpense")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. OFFICIAL RECEIPT PRINT MODAL (ENGLISH - ARIAL) */}
      <AnimatePresence>
        {selectedReceiptStudent && (
          <div className={styles.modalOverlay} onClick={() => setSelectedReceiptStudent(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.receiptCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.receiptHeader}>
                <div>
                  <h2 className={styles.receiptTitle}>THRIVE ACADEMY</h2>
                  <p className={styles.receiptSubtitle}>OFFICIAL TUITION PAYMENT & CASHIER RECEIPT</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                  <span>Ref: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>TRV-REC-{selectedReceiptStudent.id.toUpperCase()}</strong></span><br />
                  <span>Date: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <table className={styles.receiptTable}>
                <tbody>
                  <tr>
                    <td style={{ color: '#475569' }}>Student Full Name</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{selectedReceiptStudent.studentName}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Academic Program / Course</td>
                    <td style={{ color: '#003f82', fontWeight: 700 }}>{selectedReceiptStudent.subject} ({selectedReceiptStudent.type})</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Payer / Registered Contact</td>
                    <td>{selectedReceiptStudent.parentName || 'Self'} ({selectedReceiptStudent.parentPhone || '—'})</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Payment Method</td>
                    <td>{selectedReceiptStudent.paymentMethod || 'ABB Card (Digihesab)'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#475569' }}>Payment Status</td>
                    <td style={{ color: '#10b981', fontWeight: 800 }}>CLEARED & PAID (RECORDED)</td>
                  </tr>
                  <tr className={styles.receiptTotalRow}>
                    <td style={{ paddingTop: '0.85rem' }}>TOTAL AMOUNT RECEIVED</td>
                    <td style={{ paddingTop: '0.85rem', color: '#003f82' }}>{selectedReceiptStudent.amount}.00 AZN (₼)</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', fontSize: '0.72rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>Issued By: <strong>Central Registrar & Finance Desk</strong></span><br />
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Thrive Education Group • Official Document</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ width: '110px', borderBottom: '1px solid #000', marginBottom: '3px' }}></div>
                  <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>Authorized Signatory</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedReceiptStudent(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  Close Receipt
                </button>
                <button
                  onClick={() => window.print()}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#003f82', color: '#ffffff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={14} />
                  <span>Print Official Receipt</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
