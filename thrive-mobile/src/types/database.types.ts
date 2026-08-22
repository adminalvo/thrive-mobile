export type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | 'super_admin' | 'staff' | 'sales';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface UserProfileRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  fin_code: string | null;
  id_card_number: string | null;
  created_at: string | null;
}

export interface StudentRow {
  id: string;
  profile_id: string | null;
  created_at: string | null;
  program: string | null;
  monthly_payment: number | null;
  duration_months: number | null;
  total_price: number | null;
  fin_code: string | null;
  id_card_number: string | null;
  dob: string | null;
  address: string | null;
  contract_details: any;
  signed_contract_url: string | null;
}

export interface ParentRow {
  id: string;
  profile_id: string | null;
  full_name: string | null;
  phone: string | null;
  fin_code: string | null;
  id_card_number: string | null;
  address: string | null;
  created_at: string | null;
}

export interface TeacherRow {
  id: string;
  profile_id: string | null;
  specialization: string | null;
  created_at: string | null;
}

export interface ProgramRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  deleted_at: string | null;
  parent_id: string | null;
}

export interface GroupRow {
  id: string;
  name: string;
  program_id: string | null;
  teacher_id: string | null;
  room: string | null;
  created_at: string | null;
}

export interface GroupScheduleRow {
  id: string;
  group_id: string | null;
  day_of_week: number; // 1 = Monday, 7 = Sunday
  start_time: string;
  end_time: string;
  room: string | null;
  teacher_id: string | null;
  created_at: string | null;
}

export interface AttendanceRow {
  id: string;
  group_id: string | null;
  student_id: string | null;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at?: string | null;
}

export interface AssignmentRow {
  id: string;
  group_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number | null;
  created_at: string | null;
}

export interface AssignmentSubmissionRow {
  id: string;
  assignment_id: string | null;
  student_id: string | null;
  submission_text: string | null;
  status: 'pending' | 'submitted' | 'graded';
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
}

export interface ExamRow {
  id: string;
  group_id: string | null;
  title: string;
  exam_date: string | null;
  max_score: number | null;
  created_at: string | null;
}

export interface ExamResultRow {
  id: string;
  exam_id: string | null;
  student_id: string | null;
  score: number | null;
  feedback: string | null;
  created_at: string | null;
}

export interface InvoiceRow {
  id: string;
  student_id: string;
  group_id: string | null;
  amount: number;
  due_date: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
  notes: string | null;
  lesson_time: string | null;
  created_at: string | null;
}

export interface PaymentRow {
  id: string;
  student_id: string | null;
  invoice_id: string | null;
  amount: number | null;
  paid_amount: number | null;
  status: string | null;
  due_date: string | null;
  payment_method: string | null;
  payment_date: string | null;
  created_at: string | null;
}

export interface NotificationRow {
  id: string;
  user_id: string | null;
  title: string | null;
  message: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface StudentNoteRow {
  id: string;
  teacher_id: string | null;
  student_id: string | null;
  content: string;
  is_private: boolean | null;
  created_at: string | null;
}
