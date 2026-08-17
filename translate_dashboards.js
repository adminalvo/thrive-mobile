const fs = require('fs');
const path = require('path');

const tsxFiles = [
  'src/components/dashboards/ParentDashboard.tsx',
  'src/components/dashboards/StudentDashboard.tsx',
  'src/components/dashboards/TeacherDashboard.tsx'
];

const stringMappings = {
  // Parent
  "Övladlarınızın təhsil proqresini və ödənişləri izləyin.": "parentSubtitle",
  "Diqqət Tələb Edən Məsələlər": "needsAttention",
  "Gecikən Ödəniş": "pendingPayment",
  "Qayıb Qeydi": "absentRecord",
  "Övladlarım": "myChildren",
  "Qarşıdan Gələn Dərslər (Cədvəl)": "upcomingClassesSchedule",
  "Qarşıdan Gələn Dərslər": "upcomingClasses",
  "Ödənilməmiş Məbləğ": "unpaidAmount",
  "Tələbə Seçilməyib": "noStudentSelected",
  "Zəhmət olmasa yuxarıdan tələbə seçin.": "pleaseSelectStudent",
  "Son Ödənişlər": "recentPayments",
  "Davamiyyət və Performans": "attendanceAndPerformance",
  "Məbləğ:": "amountLabel",
  "Otaq:": "roomLabel",
  "Ödəniş tapılmadı": "noPaymentFound",
  "Dərs tapılmadı": "noClassFound",
  "Nəticə tapılmadı": "noResultFound",
  
  // Student
  "Öz dərslərinizi, tapşırıqlarınızı və proqresinizi izləyin.": "studentSubtitle",
  "Növbəti Səviyyəyə": "nextLevel",
  "Gözləyən Tapşırıqlar": "pendingTasks",
  "Cari Ayın Davamiyyəti": "monthlyAttendance",
  "İndi Həll Et": "solveNow",
  "Tapşırıq tapılmadı": "noTaskFound",
  
  // Teacher
  "Yoxla": "checkBtn",
  "Tapşırıq": "assignmentBtn",
  "İmtahan": "examBtn",
  "Bugünkü Dərslər (Cədvəl)": "todayClassesSchedule",
  "Tapşırığı Yoxla (Gözləyən)": "checkPendingAssignment",
  "Qeyd Et": "recordBtn",
  "Nəticə": "resultBtn",
  "Xəbərdarlıq göndər": "sendWarningBtn",
  "Yoxlanılmamış tapşırıqlar yoxdur": "noUncheckedTasks",
  "Davamiyyət qeyd edildi": "attendanceRecorded",
  "Nəticə uğurla qeyd edildi": "resultRecorded",
  "İmtahan yaradıldı": "examCreated",
  "Şagird seçilməyib": "noStudentSelectedExam",
  "Yeni İmtahan / Sınaq Yarat": "createNewExam",
  "İmtahan Adı": "examName",
  "Tarix": "date",
  "Maksimum Bal": "maxScore",
  "Yarat": "createBtn"
};

const translations = {
  az: {
    parentSubtitle: "Övladlarınızın təhsil proqresini və ödənişləri izləyin.",
    needsAttention: "Diqqət Tələb Edən Məsələlər",
    pendingPayment: "Gecikən Ödəniş",
    absentRecord: "Qayıb Qeydi",
    myChildren: "Övladlarım",
    upcomingClassesSchedule: "Qarşıdan Gələn Dərslər (Cədvəl)",
    upcomingClasses: "Qarşıdan Gələn Dərslər",
    unpaidAmount: "Ödənilməmiş Məbləğ",
    noStudentSelected: "Tələbə Seçilməyib",
    pleaseSelectStudent: "Zəhmət olmasa yuxarıdan tələbə seçin.",
    recentPayments: "Son Ödənişlər",
    attendanceAndPerformance: "Davamiyyət və Performans",
    amountLabel: "Məbləğ:",
    roomLabel: "Otaq:",
    noPaymentFound: "Ödəniş tapılmadı",
    noClassFound: "Dərs tapılmadı",
    noResultFound: "Nəticə tapılmadı",
    studentSubtitle: "Öz dərslərinizi, tapşırıqlarınızı və proqresinizi izləyin.",
    nextLevel: "Növbəti Səviyyəyə",
    pendingTasks: "Gözləyən Tapşırıqlar",
    monthlyAttendance: "Cari Ayın Davamiyyəti",
    solveNow: "İndi Həll Et",
    noTaskFound: "Tapşırıq tapılmadı",
    checkBtn: "Yoxla",
    assignmentBtn: "Tapşırıq",
    examBtn: "İmtahan",
    todayClassesSchedule: "Bugünkü Dərslər (Cədvəl)",
    checkPendingAssignment: "Tapşırığı Yoxla (Gözləyən)",
    recordBtn: "Qeyd Et",
    resultBtn: "Nəticə",
    sendWarningBtn: "Xəbərdarlıq göndər",
    noUncheckedTasks: "Yoxlanılmamış tapşırıqlar yoxdur",
    attendanceRecorded: "Davamiyyət qeyd edildi",
    resultRecorded: "Nəticə uğurla qeyd edildi",
    examCreated: "İmtahan yaradıldı",
    noStudentSelectedExam: "Şagird seçilməyib",
    createNewExam: "Yeni İmtahan / Sınaq Yarat",
    examName: "İmtahan Adı",
    date: "Tarix",
    maxScore: "Maksimum Bal",
    createBtn: "Yarat"
  },
  en: {
    parentSubtitle: "Track your children's educational progress and payments.",
    needsAttention: "Needs Attention",
    pendingPayment: "Pending Payment",
    absentRecord: "Absent Record",
    myChildren: "My Children",
    upcomingClassesSchedule: "Upcoming Classes (Schedule)",
    upcomingClasses: "Upcoming Classes",
    unpaidAmount: "Unpaid Amount",
    noStudentSelected: "No Student Selected",
    pleaseSelectStudent: "Please select a student from above.",
    recentPayments: "Recent Payments",
    attendanceAndPerformance: "Attendance & Performance",
    amountLabel: "Amount:",
    roomLabel: "Room:",
    noPaymentFound: "No payment found",
    noClassFound: "No class found",
    noResultFound: "No result found",
    studentSubtitle: "Track your classes, assignments, and progress.",
    nextLevel: "To Next Level",
    pendingTasks: "Pending Tasks",
    monthlyAttendance: "Monthly Attendance",
    solveNow: "Solve Now",
    noTaskFound: "No task found",
    checkBtn: "Check",
    assignmentBtn: "Assignment",
    examBtn: "Exam",
    todayClassesSchedule: "Today's Classes (Schedule)",
    checkPendingAssignment: "Check Pending Assignment",
    recordBtn: "Record",
    resultBtn: "Result",
    sendWarningBtn: "Send Warning",
    noUncheckedTasks: "No unchecked tasks",
    attendanceRecorded: "Attendance recorded",
    resultRecorded: "Result successfully recorded",
    examCreated: "Exam created",
    noStudentSelectedExam: "No student selected",
    createNewExam: "Create New Exam / Test",
    examName: "Exam Name",
    date: "Date",
    maxScore: "Max Score",
    createBtn: "Create"
  },
  ru: {
    parentSubtitle: "Отслеживайте успеваемость и платежи ваших детей.",
    needsAttention: "Требует Внимания",
    pendingPayment: "Ожидающий Платеж",
    absentRecord: "Запись о Пропуске",
    myChildren: "Мои Дети",
    upcomingClassesSchedule: "Предстоящие Занятия (Расписание)",
    upcomingClasses: "Предстоящие Занятия",
    unpaidAmount: "Неоплаченная Сумма",
    noStudentSelected: "Студент Не Выбран",
    pleaseSelectStudent: "Пожалуйста, выберите студента выше.",
    recentPayments: "Последние Платежи",
    attendanceAndPerformance: "Посещаемость и Успеваемость",
    amountLabel: "Сумма:",
    roomLabel: "Комната:",
    noPaymentFound: "Платеж не найден",
    noClassFound: "Занятие не найдено",
    noResultFound: "Результат не найден",
    studentSubtitle: "Отслеживайте свои занятия, задания и прогресс.",
    nextLevel: "До Следующего Уровня",
    pendingTasks: "Ожидающие Задания",
    monthlyAttendance: "Ежемесячная Посещаемость",
    solveNow: "Решить Сейчас",
    noTaskFound: "Задание не найдено",
    checkBtn: "Проверить",
    assignmentBtn: "Задание",
    examBtn: "Экзамен",
    todayClassesSchedule: "Сегодняшние Занятия (Расписание)",
    checkPendingAssignment: "Проверить Ожидающее Задание",
    recordBtn: "Записать",
    resultBtn: "Результат",
    sendWarningBtn: "Отправить Предупреждение",
    noUncheckedTasks: "Нет непроверенных заданий",
    attendanceRecorded: "Посещаемость записана",
    resultRecorded: "Результат успешно записан",
    examCreated: "Экзамен создан",
    noStudentSelectedExam: "Студент не выбран",
    createNewExam: "Создать Новый Экзамен / Тест",
    examName: "Название Экзамена",
    date: "Дата",
    maxScore: "Макс. Балл",
    createBtn: "Создать"
  }
};

// 1. Update TSX files
tsxFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  for (const [azString, key] of Object.entries(stringMappings)) {
    // Attempt to replace exact string inside text nodes
    const regexText = new RegExp(`>\\s*${azString}\\s*<`, 'g');
    if (regexText.test(content)) {
      content = content.replace(regexText, `>{t("${key}")}<`);
      updated = true;
    }

    // Attempt to replace exact string inside quotes (attributes or inline js)
    const regexQuotes = new RegExp(`["']${azString}["']`, 'g');
    if (regexQuotes.test(content)) {
      content = content.replace(regexQuotes, `t("${key}")`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated TSX: ${file}`);
  }
});

// 2. Update JSON files
['az', 'en', 'ru'].forEach(lang => {
  const jsonPath = path.join(__dirname, `messages/${lang}.json`);
  if (!fs.existsSync(jsonPath)) return;
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!data.Dashboard) data.Dashboard = {};
  
  // Add new keys to Dashboard
  for (const [key, value] of Object.entries(translations[lang])) {
    data.Dashboard[key] = value;
  }
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`Updated JSON: ${lang}.json`);
});
