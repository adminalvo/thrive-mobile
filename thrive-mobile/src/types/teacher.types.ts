import { AttendanceStatus } from './database.types';

export interface TeacherGroupItem {
  id: string;
  name: string;
  programName: string;
  room: string;
  studentCount: number;
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }[];
}

export interface TeacherStudentRosterItem {
  studentId: string;
  profileId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  attendanceStatus?: AttendanceStatus;
  notes?: string;
}

export interface TeacherSubmissionToGrade {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  groupName: string;
  studentId: string;
  studentName: string;
  maxScore: number;
  score: number | null;
  feedback: string | null;
  status: 'pending' | 'submitted' | 'graded';
  submissionText: string | null;
  submittedAt: string | null;
}
