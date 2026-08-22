import { supabase } from '../config/supabase';
import {
  LessonScheduleItem,
  StudentProgressStats,
  StudentAssignmentItem,
  StudentExamItem,
  StudentPaymentSummary,
} from '../types/student.types';
import { AttendanceRow } from '../types/database.types';

export const studentService = {
  async getEnrolledGroupIds(studentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('group_students')
        .select('group_id')
        .eq('student_id', studentId);

      if (error || !data || data.length === 0) {
        // Fallback: Check if there are groups with schedules matching student's attendance or general groups
        const { data: allGroups } = await supabase.from('groups').select('id').limit(10);
        return (allGroups || []).map(g => g.id);
      }
      return data.map(d => d.group_id).filter(Boolean) as string[];
    } catch (e) {
      console.error('Error fetching enrolled groups:', e);
      return [];
    }
  },

  async getStudentSchedule(studentId: string): Promise<LessonScheduleItem[]> {
    try {
      const groupIds = await this.getEnrolledGroupIds(studentId);
      if (groupIds.length === 0) return [];

      const { data: schedules, error } = await supabase
        .from('group_schedules')
        .select(`
          id,
          group_id,
          day_of_week,
          start_time,
          end_time,
          room,
          groups:group_id (
            id,
            name,
            room,
            programs:program_id ( name ),
            teachers:teacher_id (
              user_profiles:profile_id ( first_name, last_name )
            )
          )
        `)
        .in('group_id', groupIds)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error || !schedules) return [];

      const todayDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();

      return schedules.map((s: any) => {
        const group = s.groups || {};
        const program = group.programs || {};
        const teacherProfile = group.teachers?.user_profiles || {};
        const teacherName = teacherProfile.first_name
          ? `${teacherProfile.first_name} ${teacherProfile.last_name || ''}`.trim()
          : 'Təyin edilməyib';

        return {
          id: s.id,
          groupId: s.group_id,
          groupName: group.name || 'Əsas Qrup',
          programName: program.name || 'Ümumi Proqram',
          teacherName,
          room: s.room || group.room || 'N/A',
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          isToday: s.day_of_week === todayDayOfWeek,
        };
      });
    } catch (e) {
      console.error('Error fetching student schedule:', e);
      return [];
    }
  },

  async getTodaysClasses(studentId: string): Promise<LessonScheduleItem[]> {
    const all = await this.getStudentSchedule(studentId);
    const todayDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
    return all.filter(item => item.dayOfWeek === todayDayOfWeek);
  },

  async getNextClass(studentId: string): Promise<LessonScheduleItem | null> {
    const todays = await this.getTodaysClasses(studentId);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const item of todays) {
      const [h, m] = item.startTime.split(':').map(Number);
      const startMinutes = (h || 0) * 60 + (m || 0);
      if (startMinutes >= currentMinutes - 30) {
        return item;
      }
    }

    if (todays.length > 0) {
      return todays[0];
    }

    const all = await this.getStudentSchedule(studentId);
    return all.length > 0 ? all[0] : null;
  },

  async getStudentProgress(studentId: string): Promise<StudentProgressStats> {
    try {
      // 1. Attendance stats
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId);

      const records = attendanceData || [];
      const totalAttendance = records.length;
      const presentCount = records.filter(r => r.status === 'PRESENT').length;
      const lateCount = records.filter(r => r.status === 'LATE').length;
      const absentCount = records.filter(r => r.status === 'ABSENT').length;
      const excusedCount = records.filter(r => r.status === 'EXCUSED').length;

      const attendanceRate = totalAttendance > 0
        ? Math.round(((presentCount + lateCount) / totalAttendance) * 100)
        : 100;

      // 2. Pending assignments
      const groupIds = await this.getEnrolledGroupIds(studentId);
      let pendingAssignmentsCount = 0;
      if (groupIds.length > 0) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id')
          .in('group_id', groupIds);

        const assignmentIds = (assignments || []).map(a => a.id);
        if (assignmentIds.length > 0) {
          const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select('assignment_id')
            .eq('student_id', studentId);

          const submittedIds = new Set((submissions || []).map(s => s.assignment_id));
          pendingAssignmentsCount = assignmentIds.filter(id => !submittedIds.has(id)).length;
        }
      }

      // 3. Upcoming exams
      let upcomingExamsCount = 0;
      if (groupIds.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: exams } = await supabase
          .from('exams')
          .select('id')
          .in('group_id', groupIds)
          .gte('exam_date', todayStr);

        upcomingExamsCount = (exams || []).length;
      }

      return {
        attendanceRate,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        pendingAssignmentsCount,
        upcomingExamsCount,
      };
    } catch (e) {
      console.error('Error fetching student progress:', e);
      return {
        attendanceRate: 100,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        excusedCount: 0,
        pendingAssignmentsCount: 0,
        upcomingExamsCount: 0,
      };
    }
  },

  async getStudentAssignments(studentId: string): Promise<StudentAssignmentItem[]> {
    try {
      const groupIds = await this.getEnrolledGroupIds(studentId);
      if (groupIds.length === 0) return [];

      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          id,
          group_id,
          title,
          description,
          due_date,
          max_score,
          groups:group_id (
            name,
            programs:program_id ( name )
          )
        `)
        .in('group_id', groupIds)
        .order('due_date', { ascending: false });

      if (error || !assignments) return [];

      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId);

      const submissionMap = new Map((submissions || []).map(s => [s.assignment_id, s]));

      return assignments.map((a: any) => {
        const sub = submissionMap.get(a.id);
        const group = a.groups || {};
        const program = group.programs || {};

        return {
          id: a.id,
          groupId: a.group_id,
          groupName: group.name || 'Qrup',
          programName: program.name || 'Proqram',
          title: a.title,
          description: a.description || '',
          dueDate: a.due_date || '',
          maxScore: a.max_score || 100,
          submissionId: sub?.id,
          status: (sub?.status as any) || 'pending',
          score: sub?.score,
          feedback: sub?.feedback,
          submittedAt: sub?.submitted_at,
          submissionText: sub?.submission_text,
        };
      });
    } catch (e) {
      console.error('Error fetching student assignments:', e);
      return [];
    }
  },

  async submitAssignment(assignmentId: string, studentId: string, submissionText: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: existing } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('assignment_submissions')
          .update({
            submission_text: submissionText,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: assignmentId,
            student_id: studentId,
            submission_text: submissionText,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          });

        if (error) return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getStudentExams(studentId: string): Promise<StudentExamItem[]> {
    try {
      const groupIds = await this.getEnrolledGroupIds(studentId);
      if (groupIds.length === 0) return [];

      const { data: exams, error } = await supabase
        .from('exams')
        .select(`
          id,
          group_id,
          title,
          exam_date,
          max_score,
          groups:group_id (
            name,
            programs:program_id ( name )
          )
        `)
        .in('group_id', groupIds)
        .order('exam_date', { ascending: false });

      if (error || !exams) return [];

      const { data: results } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_id', studentId);

      const resultMap = new Map((results || []).map(r => [r.exam_id, r]));

      return exams.map((ex: any) => {
        const res = resultMap.get(ex.id);
        const group = ex.groups || {};
        const program = group.programs || {};

        return {
          id: ex.id,
          groupId: ex.group_id,
          groupName: group.name || 'Qrup',
          programName: program.name || 'Proqram',
          title: ex.title,
          examDate: ex.exam_date || '',
          maxScore: ex.max_score || 100,
          resultId: res?.id,
          score: res?.score,
          feedback: res?.feedback,
        };
      });
    } catch (e) {
      console.error('Error fetching student exams:', e);
      return [];
    }
  },

  async getStudentAttendanceHistory(studentId: string): Promise<AttendanceRow[]> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error || !data) return [];
      return data as AttendanceRow[];
    } catch (e) {
      console.error('Error fetching attendance history:', e);
      return [];
    }
  },

  async getStudentPaymentSummary(studentId: string): Promise<StudentPaymentSummary> {
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('student_id', studentId);

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId);

      let totalDue = 0;
      let paidAmount = 0;
      let nextDueDate: string | null = null;

      if (invoices && invoices.length > 0) {
        totalDue = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        const pendingInvoices = invoices.filter(inv => inv.status !== 'PAID');
        if (pendingInvoices.length > 0) {
          nextDueDate = pendingInvoices[0].due_date;
        }
      }

      if (payments && payments.length > 0) {
        paidAmount = payments.reduce((sum, p) => sum + (Number(p.paidAmount || p.amount) || 0), 0);
      }

      // If no invoices exist in database yet, gracefully inspect students table monthly_payment
      if (totalDue === 0) {
        const { data: student } = await supabase
          .from('students')
          .select('monthly_payment, total_price')
          .eq('id', studentId)
          .maybeSingle();

        if (student) {
          totalDue = Number(student.total_price || student.monthly_payment || 0);
        }
      }

      const remainingDebt = Math.max(0, totalDue - paidAmount);
      const status = remainingDebt <= 0 ? 'PAID' : 'PENDING';

      return {
        totalDue,
        paidAmount,
        remainingDebt,
        nextDueDate,
        status,
      };
    } catch (e) {
      console.error('Error fetching student payments:', e);
      return {
        totalDue: 0,
        paidAmount: 0,
        remainingDebt: 0,
        nextDueDate: null,
        status: 'PAID',
      };
    }
  },
};
