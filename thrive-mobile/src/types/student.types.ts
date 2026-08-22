import { AttendanceStatus } from './database.types';

export interface LessonScheduleItem {
  id: string;
  groupId: string;
  groupName: string;
  programName: string;
  teacherName: string;
  room: string;
  dayOfWeek: number; // 1-7
  startTime: string;
  endTime: string;
  isToday?: boolean;
}

export interface StudentProgressStats {
  attendanceRate: number; // e.g. 94
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  pendingAssignmentsCount: number;
  upcomingExamsCount: number;
}

export interface StudentAssignmentItem {
  id: string;
  groupId: string;
  groupName: string;
  programName: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissionId?: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  submittedAt?: string;
  submissionText?: string;
}

export interface StudentExamItem {
  id: string;
  groupId: string;
  groupName: string;
  programName: string;
  title: string;
  examDate: string;
  maxScore: number;
  resultId?: string;
  score?: number;
  feedback?: string;
}

export interface StudentPaymentSummary {
  totalDue: number;
  paidAmount: number;
  remainingDebt: number;
  nextDueDate: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}
