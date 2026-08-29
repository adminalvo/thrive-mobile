export interface FinancialPeriod {
  id: string;
  code: string; // e.g. "2026-08"
  name: string; // "Avqust 2026"
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  openingBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: string;
  closedAt?: string;
  closedBy?: string;
  notes?: string;
  officialCertificateNo?: string;
  collectionRate?: string;
  enrolledStudentsCount?: number;
}

export interface BankAccountRegister {
  id: string;
  name: string;
  code: 'digihesab' | 'leobank' | 'nagd' | 'pos' | 'ubank' | 'tamerlan';
  bankName: string;
  initialBalance: number;
  totalRevenue: number;
  totalExpenditure: number;
  currentBalance: number;
  transactions: {
    id: string;
    date: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    category?: string;
    periodCode?: string;
  }[];
}

export interface BranchFinancials {
  branchId: string;
  branchName: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: string;
  periodCode?: string;
  expenseBreakdown: {
    category: string;
    amount: number;
    recipient?: string;
    note?: string;
    periodCode?: string;
  }[];
}

export interface StudentPaymentStatusRecord {
  id: string;
  studentName: string;
  subject: string;
  type: 'Group' | 'Mini Group' | 'Individual';
  amount: number;
  paymentDay: string;
  parentName: string;
  parentPhone: string;
  status: 'PAID' | 'ASKED' | 'NOT_ASKED' | 'OVERDUE';
  paymentMethod: string;
  classesCount: number;
  periodCode?: string;
}

export interface CoursePriceStandard {
  id: string;
  course: string;
  groupPrice: number;
  individualPrice?: number;
  schedule: string;
  audience: string;
  language: string;
  duration: string;
  maxCapacity: string;
}

// 0. Official Company Financial Periods & Archive Registry
export const INITIAL_FINANCIAL_PERIODS: FinancialPeriod[] = [
  {
    id: 'fp-2026-08',
    code: '2026-08',
    name: 'Avqust 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'ACTIVE',
    openingBalance: 12400,
    totalRevenue: 24718,
    totalExpenses: 14212,
    netProfit: 10506,
    profitMargin: '42.50%',
    collectionRate: '94.2%',
    enrolledStudentsCount: 76,
    notes: 'Cari aktiv maliyyə dövrü. Tədris qəbulları və SAT imtahan hazırlığı.',
    officialCertificateNo: 'TRV-FIN-2026-08-ACT'
  },
  {
    id: 'fp-2026-07',
    code: '2026-07',
    name: 'İyul 2026',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'ARCHIVED',
    openingBalance: 10800,
    totalRevenue: 19800,
    totalExpenses: 13100,
    netProfit: 6700,
    profitMargin: '33.84%',
    collectionRate: '98.5%',
    enrolledStudentsCount: 68,
    closedAt: '31.07.2026 23:59',
    closedBy: 'Super Admin (Tamerlan Məmmədov)',
    notes: 'İyul ayı yay intensiv proqramlarının rəsmi bağlanmış hesabatı və tam auditi.',
    officialCertificateNo: 'TRV-FIN-2026-07-ARC'
  },
  {
    id: 'fp-2026-06',
    code: '2026-06',
    name: 'İyun 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'ARCHIVED',
    openingBalance: 9500,
    totalRevenue: 21000,
    totalExpenses: 12400,
    netProfit: 8600,
    profitMargin: '40.95%',
    collectionRate: '97.0%',
    enrolledStudentsCount: 71,
    closedAt: '30.06.2026 23:59',
    closedBy: 'Super Admin (Tamerlan Məmmədov)',
    notes: 'İyun ayı rəsmi imtahan sessiyası və qəbul dövrü qapanışı.',
    officialCertificateNo: 'TRV-FIN-2026-06-ARC'
  },
  {
    id: 'fp-2026-05',
    code: '2026-05',
    name: 'May 2026',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'ARCHIVED',
    openingBalance: 8000,
    totalRevenue: 18500,
    totalExpenses: 11200,
    netProfit: 7300,
    profitMargin: '39.46%',
    collectionRate: '95.5%',
    enrolledStudentsCount: 62,
    closedAt: '31.05.2026 23:59',
    closedBy: 'Super Admin (Tamerlan Məmmədov)',
    notes: 'May ayı rəsmi maliyyə qapanışı və şirkət auditi.',
    officialCertificateNo: 'TRV-FIN-2026-05-ARC'
  }
];

// 1. All Bank & Cash Account Registers from Google Sheets (Multi-period tagged)
export const INITIAL_ACCOUNT_REGISTERS: BankAccountRegister[] = [
  {
    id: 'acc-1',
    name: 'ABB Card (Digihesab)',
    code: 'digihesab',
    bankName: 'ABB Bank',
    initialBalance: 1100,
    totalRevenue: 10358,
    totalExpenditure: 9258,
    currentBalance: 1100,
    transactions: [
      // August 2026
      { id: 'tx-1', date: '05.08.2026', type: 'INCOME', amount: 442.71, description: 'Nuray - IELTS, CSCA', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-2', date: '05.08.2026', type: 'EXPENSE', amount: 95, description: 'Ruchki dla ofisa (300 ədəd)', category: 'Office Supplies', periodCode: '2026-08' },
      { id: 'tx-3', date: '05.08.2026', type: 'INCOME', amount: 12.29, description: 'Tamerlan Məmmədov', category: 'Direct Transfer', periodCode: '2026-08' },
      { id: 'tx-4', date: '05.08.2026', type: 'INCOME', amount: 220, description: 'Cənnət - General English', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-5', date: '05.08.2026', type: 'INCOME', amount: 270, description: 'Lalə - CSCA Math', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-6', date: '05.08.2026', type: 'INCOME', amount: 540, description: 'Nigar - SAT', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-7', date: '05.08.2026', type: 'EXPENSE', amount: 85, description: 'Ustalar və təmir xərcləri', category: 'Maintenance', periodCode: '2026-08' },
      { id: 'tx-8', date: '05.08.2026', type: 'EXPENSE', amount: 300, description: 'Tamerlana borc ödənişi', category: 'Settlement', periodCode: '2026-08' },
      { id: 'tx-9', date: '05.08.2026', type: 'INCOME', amount: 270, description: 'Nəzə - CSCA Math', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-10', date: '06.08.2026', type: 'INCOME', amount: 220, description: 'Cavid - CSCA Math', category: 'Tuition', periodCode: '2026-08' },
      // July 2026
      { id: 'tx-jul-1', date: '08.07.2026', type: 'INCOME', amount: 3200, description: 'İyul İntensiv SAT Qrupu ödənişləri', category: 'Tuition', periodCode: '2026-07' },
      { id: 'tx-jul-2', date: '15.07.2026', type: 'EXPENSE', amount: 1500, description: 'Müəllim maaş avansları', category: 'Salaries', periodCode: '2026-07' },
      { id: 'tx-jul-3', date: '22.07.2026', type: 'INCOME', amount: 1850, description: 'General English & IELTS tələbə daxilolması', category: 'Tuition', periodCode: '2026-07' },
      // June 2026
      { id: 'tx-jun-1', date: '10.06.2026', type: 'INCOME', amount: 4100, description: 'İyun İmtahan Hazırlıq Ödənişləri', category: 'Tuition', periodCode: '2026-06' },
      { id: 'tx-jun-2', date: '20.06.2026', type: 'EXPENSE', amount: 1200, description: 'Tədris materialları və kitablar', category: 'Academic Supplies', periodCode: '2026-06' },
      // May 2026
      { id: 'tx-may-1', date: '12.05.2026', type: 'INCOME', amount: 3600, description: 'May ayı abituriyent hazırlığı', category: 'Tuition', periodCode: '2026-05' }
    ]
  },
  {
    id: 'acc-2',
    name: 'Leobank Register',
    code: 'leobank',
    bankName: 'LeoBank (Unibank)',
    initialBalance: 1300,
    totalRevenue: 1300,
    totalExpenditure: 954.12,
    currentBalance: 345.88,
    transactions: [
      { id: 'tx-201', date: '04.08.2026', type: 'INCOME', amount: 1300, description: 'Start Depozit & Balans', category: 'Deposit', periodCode: '2026-08' },
      { id: 'tx-202', date: '04.08.2026', type: 'EXPENSE', amount: 190.44, description: 'Əhməd - SAT İmtahan Bileti', category: 'SAT Registration', periodCode: '2026-08' },
      { id: 'tx-203', date: '06.08.2026', type: 'EXPENSE', amount: 190.92, description: 'Rəsul - SAT İmtahan Bileti', category: 'SAT Registration', periodCode: '2026-08' },
      { id: 'tx-204', date: '06.08.2026', type: 'EXPENSE', amount: 190.92, description: 'Babək - SAT İmtahan Bileti', category: 'SAT Registration', periodCode: '2026-08' },
      { id: 'tx-205', date: '06.08.2026', type: 'EXPENSE', amount: 190.92, description: 'Cəlil - SAT İmtahan Bileti', category: 'SAT Registration', periodCode: '2026-08' },
      { id: 'tx-206', date: '06.08.2026', type: 'EXPENSE', amount: 190.92, description: 'Emil - SAT İmtahan Bileti', category: 'SAT Registration', periodCode: '2026-08' },
      // July 2026
      { id: 'tx-jul-201', date: '10.07.2026', type: 'INCOME', amount: 950, description: 'SAT İmtahan Bilet Depozitləri', category: 'Deposit', periodCode: '2026-07' },
      { id: 'tx-jul-202', date: '18.07.2026', type: 'EXPENSE', amount: 570, description: 'CollegeBoard İmtahan qeydiyyatları', category: 'SAT Registration', periodCode: '2026-07' }
    ]
  },
  {
    id: 'acc-3',
    name: 'Nəğd Kassa (Cash Desk)',
    code: 'nagd',
    bankName: 'Mərkəz Kassa',
    initialBalance: 0,
    totalRevenue: 3760,
    totalExpenditure: 3120,
    currentBalance: 640,
    transactions: [
      { id: 'tx-301', date: '06.08.2026', type: 'INCOME', amount: 750, description: 'Cəlil - SAT + Bilet', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-302', date: '06.08.2026', type: 'EXPENSE', amount: 700, description: 'Ofis İcarə (Rent)', category: 'Rent', periodCode: '2026-08' },
      { id: 'tx-303', date: '06.08.2026', type: 'EXPENSE', amount: 50, description: 'Tamerlan Məmmədov', category: 'Advance', periodCode: '2026-08' },
      { id: 'tx-304', date: '06.08.2026', type: 'INCOME', amount: 850, description: 'Cəlalın işi', category: 'Service', periodCode: '2026-08' },
      { id: 'tx-305', date: '06.08.2026', type: 'INCOME', amount: 1700, description: 'Rüfət - Tam Kurs', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-306', date: '06.08.2026', type: 'EXPENSE', amount: 220, description: 'Təsərrüfat & Bazar xərcləri', category: 'Office Supplies', periodCode: '2026-08' },
      { id: 'tx-307', date: '06.08.2026', type: 'EXPENSE', amount: 800, description: 'Müşahidə kameraları quraşdırılması', category: 'Equipment', periodCode: '2026-08' },
      { id: 'tx-308', date: '06.08.2026', type: 'EXPENSE', amount: 500, description: 'Komissiya ödənişi', category: 'Commission', periodCode: '2026-08' },
      { id: 'tx-309', date: '06.08.2026', type: 'EXPENSE', amount: 850, description: 'Geri qaytarılma (Vozvrat)', category: 'Refund', periodCode: '2026-08' },
      { id: 'tx-310', date: '06.08.2026', type: 'INCOME', amount: 400, description: 'Ömər - IELTS İntensiv', category: 'Tuition', periodCode: '2026-08' },
      // July 2026
      { id: 'tx-jul-301', date: '14.07.2026', type: 'INCOME', amount: 2100, description: 'Nəğd təhsil haqqı daxilolması', category: 'Tuition', periodCode: '2026-07' },
      { id: 'tx-jul-302', date: '28.07.2026', type: 'EXPENSE', amount: 1200, description: 'Aylıq təsərrüfat & xidmət xərci', category: 'Office Supplies', periodCode: '2026-07' }
    ]
  },
  {
    id: 'acc-4',
    name: 'Tamerlan Hesab (Director Master)',
    code: 'tamerlan',
    bankName: 'Rəhbərlik Xüsusi Hesabı',
    initialBalance: 10000,
    totalRevenue: 10950,
    totalExpenditure: 3950,
    currentBalance: 7000,
    transactions: [
      { id: 'tx-401', date: '01.08.2026', type: 'INCOME', amount: 10000, description: 'Əsas Nizamnamə Fondu / Balans', category: 'Capital', periodCode: '2026-08' },
      { id: 'tx-402', date: '01.08.2026', type: 'EXPENSE', amount: 300, description: 'Marketinq əməliyyat xərcləri', category: 'Marketing', periodCode: '2026-08' },
      { id: 'tx-403', date: '01.08.2026', type: 'EXPENSE', amount: 1260, description: 'Meta / Reklam büdcəsinin artırılması', category: 'Marketing', periodCode: '2026-08' },
      { id: 'tx-404', date: '01.08.2026', type: 'EXPENSE', amount: 140, description: 'Tamerlan Məmmədov cari xərc', category: 'Personal', periodCode: '2026-08' },
      { id: 'tx-405', date: '01.08.2026', type: 'EXPENSE', amount: 100, description: 'Rəngsaz / Malyar ustası', category: 'Maintenance', periodCode: '2026-08' },
      { id: 'tx-406', date: '05.08.2026', type: 'INCOME', amount: 200, description: 'Rəsul - SAT Math', category: 'Tuition', periodCode: '2026-08' },
      { id: 'tx-407', date: '05.08.2026', type: 'INCOME', amount: 300, description: 'Digihesabdan köçürülən gəlir', category: 'Internal Transfer', periodCode: '2026-08' },
      { id: 'tx-408', date: '05.08.2026', type: 'INCOME', amount: 200, description: 'Emil - SAT Bilet ödənişi', category: 'SAT Registration', periodCode: '2026-08' },
      { id: 'tx-409', date: '05.08.2026', type: 'EXPENSE', amount: 450, description: 'Dövlət Vergiləri (Vergi ödənişi)', category: 'Taxes', periodCode: '2026-08' }
    ]
  },
  {
    id: 'acc-5',
    name: 'UBank Register',
    code: 'ubank',
    bankName: 'Unibank UBank',
    initialBalance: 0,
    totalRevenue: 220,
    totalExpenditure: 0,
    currentBalance: 220,
    transactions: [
      { id: 'tx-501', date: '10.08.2026', type: 'INCOME', amount: 220, description: 'Rizvan - General English', category: 'Tuition', periodCode: '2026-08' }
    ]
  },
  {
    id: 'acc-6',
    name: 'POS Terminal (BC)',
    code: 'pos',
    bankName: 'Bank of Baku POS',
    initialBalance: 0,
    totalRevenue: 0,
    totalExpenditure: 0,
    currentBalance: 0,
    transactions: []
  }
];

// 2. Branch Financials (Nizami & Nərimanov P&L)
export const BRANCH_FINANCIALS: BranchFinancials[] = [
  {
    branchId: 'nizami',
    branchName: 'Nizami Filialı',
    totalRevenue: 20120,
    totalExpenses: 12845,
    netProfit: 7275,
    profitMargin: '36.16%',
    expenseBreakdown: [
      { category: 'Rent (İcarə)', amount: 4000, recipient: 'Mülkiyyətçi', note: 'Aylıq əsas ofis icarəsi', periodCode: '2026-08' },
      { category: 'Müəllim Maaşı', amount: 2400, recipient: 'Nadir müəllim', note: 'SAT Math & Verbal dərsləri', periodCode: '2026-08' },
      { category: 'Müəllim Maaşı', amount: 500, recipient: 'Nərgiz müəllimə', note: 'Math dərsləri', periodCode: '2026-08' },
      { category: 'Müəllim Maaşı', amount: 500, recipient: 'Nailə müəllimə', note: 'İngilis dili', periodCode: '2026-08' },
      { category: 'Müəllim Maaşı', amount: 300, recipient: 'Hümayə müəllimə', note: 'General English', periodCode: '2026-08' },
      { category: 'Marketinq & Reklam', amount: 850, recipient: 'Meta / Google Ads', note: 'Nizami filialı üzrə tələbə qəbulu', periodCode: '2026-08' },
      { category: 'Kommunal Xərclər', amount: 500, recipient: 'Azərişıq / Azərsu / Azəriqaz', note: 'Aylıq kommunal', periodCode: '2026-08' },
      { category: 'İnternet & Şəbəkə', amount: 45, recipient: 'CityNet', note: 'Optik internet', periodCode: '2026-08' },
      { category: 'Vergi Ödənişləri', amount: 300, recipient: 'Dövlət Vergi Xidməti', note: 'Aylıq sadələşdirilmiş vergi', periodCode: '2026-08' },
      // July 2026
      { category: 'Rent (İcarə)', amount: 4000, recipient: 'Mülkiyyətçi', note: 'İyul ayı ofis icarəsi', periodCode: '2026-07' },
      { category: 'Müəllim Maaşı', amount: 2600, recipient: 'SAT Heyəti', note: 'İyul ayı dərsləri', periodCode: '2026-07' },
      { category: 'Kommunal & İnternet', amount: 480, recipient: 'Kommunal', note: 'İyul ayı kommunal', periodCode: '2026-07' }
    ]
  },
  {
    branchId: 'narimanov',
    branchName: 'Nərimanov Filialı',
    totalRevenue: 14850,
    totalExpenses: 9420,
    netProfit: 5430,
    profitMargin: '36.56%',
    expenseBreakdown: [
      { category: 'Rent (İcarə)', amount: 3200, recipient: 'Mülkiyyətçi', note: 'Nərimanov korpusu', periodCode: '2026-08' },
      { category: 'Müəllim Maaşı', amount: 3500, recipient: 'Fakültə Müəllimləri', note: 'DİM & SAT hazırlığı', periodCode: '2026-08' },
      { category: 'Kommunal & Ofis', amount: 420, recipient: 'Kommunal', note: 'Kommunal xidmətlər', periodCode: '2026-08' },
      { category: 'Marketinq & Promo', amount: 600, recipient: 'SMM Reklam', note: 'Lokal təbliğat', periodCode: '2026-08' },
      // July 2026
      { category: 'Rent (İcarə)', amount: 3200, recipient: 'Mülkiyyətçi', note: 'İyul ayı Nərimanov icarəsi', periodCode: '2026-07' },
      { category: 'Müəllim Maaşı', amount: 2400, recipient: 'Müəllim heyəti', note: 'İyul ayı hazırlığı', periodCode: '2026-07' }
    ]
  }
];

// 3. Student Payment Status Matrix (August, July, June, May Rosters)
export const STUDENT_PAYMENT_STATUS_ROSTER: StudentPaymentStatusRecord[] = [
  // August 2026 Cohort
  { id: 'st-1', studentName: 'Fizuli', subject: 'General English', type: 'Group', amount: 200, paymentDay: '30-u', parentName: 'Günel', parentPhone: '050-218-68-86', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 4, periodCode: '2026-08' },
  { id: 'st-2', studentName: 'Safiyə', subject: 'General English', type: 'Mini Group', amount: 200, paymentDay: '30-u', parentName: 'Günel', parentPhone: '050-218-68-86', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 4, periodCode: '2026-08' },
  { id: 'st-3', studentName: 'Fizuli', subject: 'Math Olympic', type: 'Mini Group', amount: 375, paymentDay: '30-u', parentName: 'Günel', parentPhone: '050-218-68-86', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 4, periodCode: '2026-08' },
  { id: 'st-4', studentName: 'Safiyə', subject: 'Math Olympic', type: 'Mini Group', amount: 200, paymentDay: '30-u', parentName: 'Günel', parentPhone: '050-218-68-86', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 4, periodCode: '2026-08' },
  { id: 'st-5', studentName: 'Cəlil', subject: 'SAT Math', type: 'Group', amount: 270, paymentDay: '30-u', parentName: 'Zinyət', parentPhone: '050-506-68-68', status: 'PAID', paymentMethod: 'Nəğd Kassa', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-6', studentName: 'Cəlil', subject: 'SAT Verbal', type: 'Group', amount: 270, paymentDay: '30-u', parentName: 'Zinyət', parentPhone: '050-506-68-68', status: 'PAID', paymentMethod: 'Nəğd Kassa', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-7', studentName: 'Əli', subject: 'SAT Math', type: 'Individual', amount: 300, paymentDay: '11-i', parentName: 'Natiq', parentPhone: '050-577-70-77', status: 'ASKED', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-8', studentName: 'Babək', subject: 'SAT Math', type: 'Group', amount: 405, paymentDay: '15-i', parentName: 'Natəvan', parentPhone: '099-319-18-85', status: 'PAID', paymentMethod: 'Leobank', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-9', studentName: 'Babək', subject: 'SAT Verbal', type: 'Group', amount: 405, paymentDay: '15-i', parentName: 'Natəvan', parentPhone: '099-319-18-85', status: 'PAID', paymentMethod: 'Leobank', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-10', studentName: 'Rəsul', subject: 'SAT Math', type: 'Group', amount: 405, paymentDay: '15-i', parentName: 'Mehriban', parentPhone: '077-364-44-44', status: 'PAID', paymentMethod: 'Leobank', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-11', studentName: 'Alsu', subject: 'Math', type: 'Mini Group', amount: 220, paymentDay: '10-u', parentName: 'Jalə', parentPhone: '050-204-10-04', status: 'ASKED', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-12', studentName: 'Rizvan', subject: 'General English', type: 'Mini Group', amount: 220, paymentDay: '10-u', parentName: 'Anar', parentPhone: '050-555-12-34', status: 'ASKED', paymentMethod: 'UBank', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-13', studentName: 'Ömər', subject: 'IELTS', type: 'Individual', amount: 400, paymentDay: '20-si', parentName: 'Nərgiz x.', parentPhone: '055-444-55-66', status: 'ASKED', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-14', studentName: 'Məryəm', subject: 'Math 11th', type: 'Mini Group', amount: 200, paymentDay: '25-i', parentName: 'Heyran', parentPhone: '055-971-99-63', status: 'ASKED', paymentMethod: 'Nəğd Kassa', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-15', studentName: 'Polad', subject: 'SAT Math', type: 'Group', amount: 270, paymentDay: '25-i', parentName: 'Gülnarə', parentPhone: '055-377-73-78', status: 'NOT_ASKED', paymentMethod: 'Gözlənilir', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-16', studentName: 'Polad', subject: 'SAT Verbal', type: 'Group', amount: 270, paymentDay: '25-i', parentName: 'Gülnarə', parentPhone: '055-377-73-78', status: 'NOT_ASKED', paymentMethod: 'Gözlənilir', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-17', studentName: 'Leyla', subject: 'SAT Verbal', type: 'Group', amount: 200, paymentDay: '27-si', parentName: 'Samirə', parentPhone: '055-364-53-44', status: 'ASKED', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-18', studentName: 'Cavid', subject: 'CSCA Math', type: 'Mini Group', amount: 220, paymentDay: '30-u', parentName: 'Bayram', parentPhone: '055-356-46-16', status: 'NOT_ASKED', paymentMethod: 'Gözlənilir', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-19', studentName: 'Cənnət', subject: 'IELTS', type: 'Group', amount: 220, paymentDay: '30-u', parentName: 'Afa', parentPhone: '077-313-17-97', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-08' },
  { id: 'st-20', studentName: 'Lalə', subject: 'CSCA Math', type: 'Group', amount: 270, paymentDay: '05-i', parentName: 'Rauf', parentPhone: '050-333-88-99', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-08' },
  
  // July 2026 Cohort (Archived)
  { id: 'st-jul-1', studentName: 'Kamran Məmmədli', subject: 'SAT Intensive', type: 'Group', amount: 450, paymentDay: '10-u', parentName: 'Vüqar', parentPhone: '050-111-22-33', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 12, periodCode: '2026-07' },
  { id: 'st-jul-2', studentName: 'Aysel Qasımova', subject: 'IELTS Academic', type: 'Group', amount: 350, paymentDay: '12-si', parentName: 'Sevinc', parentPhone: '055-222-33-44', status: 'PAID', paymentMethod: 'Leobank', classesCount: 8, periodCode: '2026-07' },
  { id: 'st-jul-3', studentName: 'Murad Əliyev', subject: 'SAT Math', type: 'Individual', amount: 600, paymentDay: '15-i', parentName: 'Elçin', parentPhone: '070-333-44-55', status: 'PAID', paymentMethod: 'Nəğd Kassa', classesCount: 8, periodCode: '2026-07' },
  { id: 'st-jul-4', studentName: 'Zəhra Həsənli', subject: 'General English', type: 'Mini Group', amount: 220, paymentDay: '18-i', parentName: 'Leyla', parentPhone: '050-444-55-66', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-07' },
  { id: 'st-jul-5', studentName: 'Turan İsmayılov', subject: 'CSCA Math', type: 'Group', amount: 270, paymentDay: '20-si', parentName: 'Rəşad', parentPhone: '055-555-66-77', status: 'PAID', paymentMethod: 'UBank', classesCount: 8, periodCode: '2026-07' },
  { id: 'st-jul-6', studentName: 'Fidan Nəbiyeva', subject: 'SAT Verbal', type: 'Group', amount: 300, paymentDay: '25-i', parentName: 'Nigar', parentPhone: '077-666-77-88', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-07' },

  // June 2026 Cohort (Archived)
  { id: 'st-jun-1', studentName: 'Nihad Tağıyev', subject: 'DİM Riyaziyyat', type: 'Group', amount: 200, paymentDay: '05-i', parentName: 'Tahir', parentPhone: '050-777-88-99', status: 'PAID', paymentMethod: 'Nəğd Kassa', classesCount: 8, periodCode: '2026-06' },
  { id: 'st-jun-2', studentName: 'Dəniz Rüstəmova', subject: 'IELTS Academic', type: 'Group', amount: 350, paymentDay: '10-u', parentName: 'Rəna', parentPhone: '055-888-99-00', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-06' },
  { id: 'st-jun-3', studentName: 'Elmir Cəfərov', subject: 'SAT Math', type: 'Group', amount: 400, paymentDay: '15-i', parentName: 'Cavid', parentPhone: '070-999-00-11', status: 'PAID', paymentMethod: 'Leobank', classesCount: 8, periodCode: '2026-06' },

  // May 2026 Cohort (Archived)
  { id: 'st-may-1', studentName: 'Orxan Babayev', subject: 'SAT Verbal', type: 'Individual', amount: 550, paymentDay: '08-i', parentName: 'İlham', parentPhone: '050-321-65-49', status: 'PAID', paymentMethod: 'ABB Card', classesCount: 8, periodCode: '2026-05' },
  { id: 'st-may-2', studentName: 'Səbinə Məlikova', subject: 'General English', type: 'Group', amount: 220, paymentDay: '14-ü', parentName: 'Kəmalə', parentPhone: '055-654-98-73', status: 'PAID', paymentMethod: 'Nəğd Kassa', classesCount: 8, periodCode: '2026-05' }
];

// 4. Course Pricing Standards (Narimanov & Nizami Prices)
export const COURSE_PRICING_STANDARDS: CoursePriceStandard[] = [
  { id: 'p-1', course: 'ADA Courses', groupPrice: 300, individualPrice: 600, schedule: 'Həftədə 2 dəfə + praktika', audience: 'Böyüklər / Abituriyent', language: 'İngilis dili', duration: '1-3 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-2', course: 'ADA Interview', groupPrice: 200, individualPrice: 450, schedule: '8 dərs (18:00-dan sonra)', audience: 'Tələbə / Məzun', language: 'İngilis dili', duration: '1 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-3', course: 'ADA School', groupPrice: 150, individualPrice: 0, schedule: 'Sənədləşmə & Mentorluq', audience: 'Məktəblilər', language: 'Azərbaycan / İngilis', duration: '1 ay', maxCapacity: 'Fərdi' },
  { id: 'p-4', course: 'ADA Bachelor', groupPrice: 350, individualPrice: 0, schedule: 'Sənədləşmə & Qəbul', audience: 'Bakalavr namizədləri', language: 'İngilis dili', duration: 'Qəbul dövrü', maxCapacity: 'Fərdi' },
  { id: 'p-5', course: 'ADA Masters', groupPrice: 650, individualPrice: 0, schedule: 'Magistratura paketi', audience: 'Magistr namizədləri', language: 'İngilis dili', duration: 'Qəbul dövrü', maxCapacity: 'Fərdi' },
  { id: 'p-6', course: 'Digital SAT Math', groupPrice: 300, individualPrice: 600, schedule: 'Həftədə 2 dəfə + sınaqlar', audience: '9-11-ci siniflər', language: 'İngilis dili', duration: '4-18 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-7', course: 'Digital SAT Verbal', groupPrice: 300, individualPrice: 600, schedule: 'Həftədə 2 dəfə + oxu saatı', audience: '9-11-ci siniflər', language: 'İngilis dili', duration: '4-18 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-8', course: 'preSAT Math', groupPrice: 220, individualPrice: 450, schedule: 'Həftədə 2 dəfə + praktika', audience: '8-9-cu siniflər', language: 'İngilis dili', duration: '1-5 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-9', course: 'preSAT Verbal', groupPrice: 220, individualPrice: 450, schedule: 'Həftədə 2 dəfə + lüğət', audience: '8-9-cu siniflər', language: 'İngilis dili', duration: '1-5 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-10', course: 'IELTS Academic', groupPrice: 220, individualPrice: 450, schedule: 'Həftədə 3 dəfə + 1-on-1 Speaking', audience: '10-11 və Universitet', language: 'İngilis dili', duration: '3-6 ay', maxCapacity: 'Max 6 nəfər' },
  { id: 'p-11', course: 'CSCA Math (Chinese SAT)', groupPrice: 270, individualPrice: 450, schedule: 'Həftədə 2 dəfə intensiv', audience: 'Asiya təqaüd namizədləri', language: 'İngilis dili', duration: '4-6 ay', maxCapacity: 'Max 5 nəfər' },
  { id: 'p-12', course: 'DİM Riyaziyyat', groupPrice: 150, individualPrice: 300, schedule: 'Həftədə 2 dəfə + sınaq', audience: '9-11-ci siniflər', language: 'Azərbaycan dili', duration: 'Tədris ili', maxCapacity: 'Max 8 nəfər' }
];