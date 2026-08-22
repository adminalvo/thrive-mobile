import { StudentProgressStats, StudentPaymentSummary } from './student.types';

export interface ChildOverview {
  studentId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  programs: string[];
  attendanceRate: number;
  nextClassTime?: string;
  nextClassSubject?: string;
  pendingAssignmentsCount: number;
  paymentStatus: string;
  stats?: StudentProgressStats;
  paymentSummary?: StudentPaymentSummary;
}
