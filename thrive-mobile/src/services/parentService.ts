import { supabase } from '../config/supabase';
import { ChildOverview } from '../types/parent.types';
import { studentService } from './studentService';

export const parentService = {
  async getChildren(parentId: string): Promise<ChildOverview[]> {
    try {
      // 1. Check student_parents first
      const { data: studentParents, error } = await supabase
        .from('student_parents')
        .select(`
          student_id,
          relation_type,
          students:student_id (
            id,
            program,
            user_profiles:profile_id (
              first_name,
              last_name,
              email,
              phone
            )
          )
        `)
        .eq('parent_id', parentId);

      let studentRows: any[] = (studentParents || []).map((sp: any) => sp.students).filter(Boolean);

      // Fallback: check parent_students if empty
      if (studentRows.length === 0) {
        const { data: ps } = await supabase
          .from('parent_students')
          .select(`
            student_id,
            students:student_id (
              id,
              program,
              user_profiles:profile_id (
                first_name,
                last_name,
                email,
                phone
              )
            )
          `)
          .eq('parent_id', parentId);

        studentRows = (ps || []).map((p: any) => p.students).filter(Boolean);
      }

      // If still empty, grab any students for demonstration if in testing, or return empty
      if (studentRows.length === 0) {
        return [];
      }

      const children: ChildOverview[] = [];

      for (const s of studentRows) {
        const profile = s.user_profiles || {};
        const fullName = `${profile.first_name || 'Tələbə'} ${profile.last_name || ''}`.trim();
        const programsList = s.program
          ? s.program.split(',').map((p: string) => p.trim())
          : ['Ümumi Proqram'];

        // Fetch child quick stats
        const [progress, nextClass, payments] = await Promise.all([
          studentService.getStudentProgress(s.id),
          studentService.getNextClass(s.id),
          studentService.getStudentPaymentSummary(s.id),
        ]);

        children.push({
          studentId: s.id,
          fullName,
          email: profile.email,
          phone: profile.phone,
          programs: programsList,
          attendanceRate: progress.attendanceRate,
          nextClassTime: nextClass ? `${nextClass.startTime} - ${nextClass.endTime}` : undefined,
          nextClassSubject: nextClass?.programName || nextClass?.groupName,
          pendingAssignmentsCount: progress.pendingAssignmentsCount,
          paymentStatus: payments.remainingDebt <= 0 ? 'Ödənilib' : `${payments.remainingDebt} ₼ Qalıq`,
          stats: progress,
          paymentSummary: payments,
        });
      }

      return children;
    } catch (e) {
      console.error('Error fetching parent children:', e);
      return [];
    }
  },
};
