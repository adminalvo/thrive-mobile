import { supabase } from '../config/supabase';
import {
  LessonScheduleItem,
  StudentProgressStats,
  StudentAssignmentItem,
  StudentExamItem,
  StudentPaymentSummary,
} from '../types/student.types';
import { AttendanceRow } from '../types/database.types';
import { cacheManager } from '../utils/cacheManager';

export interface StudentHomeBatchData {
  nextClass: LessonScheduleItem | null;
  todaysClasses: LessonScheduleItem[];
  schedules: LessonScheduleItem[];
  progress: StudentProgressStats;
  paymentSummary: StudentPaymentSummary;
}

export const studentService = {
  /**
   * Ultra-fast batched & cached home data fetcher (0ms from cache, single network batch)
   */
  async getStudentHomeData(studentId: string, forceRefresh = false): Promise<StudentHomeBatchData> {
    const cacheKey = `student_home_${studentId}`;
    const result = await cacheManager.fetchWithCache<StudentHomeBatchData>(
      cacheKey,
      async () => {
        // 1. Fetch group IDs & student price in parallel
        const [groupRes, studentRes] = await Promise.all([
          supabase.from('group_students').select('group_id').eq('student_id', studentId),
          supabase.from('students').select('monthly_payment, total_price').eq('id', studentId).maybeSingle(),
        ]);

        let groupIds = (groupRes.data || []).map((d) => d.group_id).filter(Boolean) as string[];
        if (groupIds.length === 0) {
          const { data: allGroups } = await supabase.from('groups').select('id').limit(10);
          groupIds = (allGroups || []).map((g) => g.id);
        }

        // 2. Fetch all related records in a single parallel batch
        const [scheduleRes, attendanceRes, assignmentRes, submissionRes, examRes, invoiceRes, paymentRes] =
          await Promise.all([
            groupIds.length > 0
              ? supabase
                  .from('group_schedules')
                  .select(`
                    id, group_id, day_of_week, start_time, end_time, room,
                    groups:group_id (
                      id, name, room,
                      programs:program_id ( name ),
                      teachers:teacher_id (
                        user_profiles:profile_id ( first_name, last_name )
                      )
                    )
                  `)
                  .in('group_id', groupIds)
                  .order('day_of_week', { ascending: true })
                  .order('start_time', { ascending: true })
              : Promise.resolve({ data: [] }),

            supabase.from('attendance').select('status, date').eq('student_id', studentId),
            groupIds.length > 0
              ? supabase.from('assignments').select('id, group_id').in('group_id', groupIds)
              : Promise.resolve({ data: [] }),
            supabase.from('assignment_submissions').select('assignment_id').eq('student_id', studentId),
            groupIds.length > 0
              ? supabase
                  .from('exams')
                  .select('id')
                  .in('group_id', groupIds)
                  .gte('exam_date', new Date().toISOString().split('T')[0])
              : Promise.resolve({ data: [] }),
            supabase.from('invoices').select('amount, status, due_date').eq('student_id', studentId),
            supabase.from('payments').select('amount, paidAmount').eq('student_id', studentId),
          ]);

        // 3. Process schedules in memory (sub-millisecond)
        const todayDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
        const schedules: LessonScheduleItem[] = (scheduleRes.data || []).map((s: any) => {
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

        const todaysClasses = schedules.filter((s) => s.dayOfWeek === todayDayOfWeek);

        // Compute next class
        let nextClass: LessonScheduleItem | null = null;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (const item of todaysClasses) {
          const [h, m] = item.startTime.split(':').map(Number);
          const startMinutes = (h || 0) * 60 + (m || 0);
          if (startMinutes >= currentMinutes - 30) {
            nextClass = item;
            break;
          }
        }
        if (!nextClass && todaysClasses.length > 0) nextClass = todaysClasses[0];
        if (!nextClass && schedules.length > 0) nextClass = schedules[0];

        // 4. Process progress stats in memory
        const attendanceRecords = attendanceRes.data || [];
        const totalAtt = attendanceRecords.length;
        const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
        const lateCount = attendanceRecords.filter((r) => r.status === 'LATE').length;
        const absentCount = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
        const excusedCount = attendanceRecords.filter((r) => r.status === 'EXCUSED').length;
        const attendanceRate = totalAtt > 0 ? Math.round(((presentCount + lateCount) / totalAtt) * 100) : 100;

        const allAssignmentIds = (assignmentRes.data || []).map((a) => a.id);
        const submittedSet = new Set((submissionRes.data || []).map((s) => s.assignment_id));
        const pendingAssignmentsCount = allAssignmentIds.filter((id) => !submittedSet.has(id)).length;
        const upcomingExamsCount = (examRes.data || []).length;

        const progress: StudentProgressStats = {
          attendanceRate,
          presentCount,
          lateCount,
          absentCount,
          excusedCount,
          pendingAssignmentsCount,
          upcomingExamsCount,
        };

        // 5. Process payments in memory
        const invoices = invoiceRes.data || [];
        const payments = paymentRes.data || [];
        let totalDue = 0;
        let paidAmount = 0;
        let nextDueDate: string | null = null;

        if (invoices.length > 0) {
          totalDue = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          const pending = invoices.filter((inv) => inv.status !== 'PAID');
          if (pending.length > 0) nextDueDate = pending[0].due_date;
        }

        if (payments.length > 0) {
          paidAmount = payments.reduce((sum, p) => sum + (Number(p.paidAmount || p.amount) || 0), 0);
        }

        if (totalDue === 0 && studentRes.data) {
          totalDue = Number(studentRes.data.total_price || studentRes.data.monthly_payment || 0);
        }

        const remainingDebt = Math.max(0, totalDue - paidAmount);
        const paymentSummary: StudentPaymentSummary = {
          totalDue,
          paidAmount,
          remainingDebt,
          nextDueDate,
          status: remainingDebt <= 0 ? 'PAID' : 'PENDING',
        };

        return {
          nextClass,
          todaysClasses,
          schedules,
          progress,
          paymentSummary,
        };
      },
      3 * 60 * 1000, // 3 minutes cache
      forceRefresh
    );

    return result.data;
  },

  async getEnrolledGroupIds(studentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('group_students')
        .select('group_id')
        .eq('student_id', studentId);

      if (error || !data || data.length === 0) {
        const { data: allGroups } = await supabase.from('groups').select('id').limit(10);
        return (allGroups || []).map((g) => g.id);
      }
      return data.map((d) => d.group_id).filter(Boolean) as string[];
    } catch (e) {
      console.error('Error fetching enrolled groups:', e);
      return [];
    }
  },

  async getStudentSchedule(studentId: string, forceRefresh = false): Promise<LessonScheduleItem[]> {
    const homeData = await this.getStudentHomeData(studentId, forceRefresh);
    return homeData.schedules;
  },

  async getTodaysClasses(studentId: string, forceRefresh = false): Promise<LessonScheduleItem[]> {
    const homeData = await this.getStudentHomeData(studentId, forceRefresh);
    return homeData.todaysClasses;
  },

  async getNextClass(studentId: string, forceRefresh = false): Promise<LessonScheduleItem | null> {
    const homeData = await this.getStudentHomeData(studentId, forceRefresh);
    return homeData.nextClass;
  },

  async getStudentProgress(studentId: string, forceRefresh = false): Promise<StudentProgressStats> {
    const homeData = await this.getStudentHomeData(studentId, forceRefresh);
    return homeData.progress;
  },

  async getStudentAssignments(studentId: string, forceRefresh = false): Promise<StudentAssignmentItem[]> {
    const cacheKey = `student_assignments_${studentId}`;
    const result = await cacheManager.fetchWithCache<StudentAssignmentItem[]>(
      cacheKey,
      async () => {
        const groupIds = await this.getEnrolledGroupIds(studentId);
        if (groupIds.length === 0) return [];

        const [assignRes, subRes] = await Promise.all([
          supabase
            .from('assignments')
            .select(`
              id, group_id, title, description, due_date, max_score,
              groups:group_id ( name, programs:program_id ( name ) )
            `)
            .in('group_id', groupIds)
            .order('due_date', { ascending: false }),
          supabase.from('assignment_submissions').select('*').eq('student_id', studentId),
        ]);

        if (assignRes.error || !assignRes.data) return [];

        const submissionMap = new Map((subRes.data || []).map((s) => [s.assignment_id, s]));

        return assignRes.data.map((a: any) => {
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
      },
      2 * 60 * 1000,
      forceRefresh
    );

    return result.data;
  },

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    submissionText: string
  ): Promise<{ success: boolean; error?: string }> {
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
        const { error } = await supabase.from('assignment_submissions').insert({
          assignment_id: assignmentId,
          student_id: studentId,
          submission_text: submissionText,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        });

        if (error) return { success: false, error: error.message };
      }

      // Invalidate assignments cache
      await cacheManager.invalidate(`student_assignments_${studentId}`);
      await cacheManager.invalidate(`student_home_${studentId}`);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getStudentExams(studentId: string, forceRefresh = false): Promise<StudentExamItem[]> {
    const cacheKey = `student_exams_${studentId}`;
    const result = await cacheManager.fetchWithCache<StudentExamItem[]>(
      cacheKey,
      async () => {
        const groupIds = await this.getEnrolledGroupIds(studentId);
        if (groupIds.length === 0) return [];

        const [examRes, resultRes] = await Promise.all([
          supabase
            .from('exams')
            .select(`
              id, group_id, title, exam_date, max_score,
              groups:group_id ( name, programs:program_id ( name ) )
            `)
            .in('group_id', groupIds)
            .order('exam_date', { ascending: false }),
          supabase.from('exam_results').select('*').eq('student_id', studentId),
        ]);

        if (examRes.error || !examRes.data) return [];

        const resultMap = new Map((resultRes.data || []).map((r) => [r.exam_id, r]));

        return examRes.data.map((ex: any) => {
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
      },
      3 * 60 * 1000,
      forceRefresh
    );

    return result.data;
  },

  async getStudentAttendanceHistory(studentId: string, forceRefresh = false): Promise<AttendanceRow[]> {
    const cacheKey = `student_attendance_${studentId}`;
    const result = await cacheManager.fetchWithCache<AttendanceRow[]>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentId)
          .order('date', { ascending: false });

        if (error || !data) return [];
        return data as AttendanceRow[];
      },
      2 * 60 * 1000,
      forceRefresh
    );

    return result.data;
  },

  async getStudentPaymentSummary(studentId: string, forceRefresh = false): Promise<StudentPaymentSummary> {
    const homeData = await this.getStudentHomeData(studentId, forceRefresh);
    return homeData.paymentSummary;
  },
};
