import { supabase } from '../config/supabase';
import { ChildOverview } from '../types/parent.types';
import { studentService } from './studentService';
import { cacheManager } from '../utils/cacheManager';

export const parentService = {
  async getChildren(parentId: string, forceRefresh = false): Promise<ChildOverview[]> {
    const cacheKey = `parent_children_${parentId}`;
    const result = await cacheManager.fetchWithCache<ChildOverview[]>(
      cacheKey,
      async () => {
        // 1. Fetch student-parent links
        const { data: studentParents } = await supabase
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

        if (studentRows.length === 0) {
          return [];
        }

        // 2. Fetch all children data in parallel
        const children = await Promise.all(
          studentRows.map(async (s: any) => {
            const profile = s.user_profiles || {};
            const fullName = `${profile.first_name || 'Tələbə'} ${profile.last_name || ''}`.trim();
            const programsList = s.program
              ? s.program.split(',').map((p: string) => p.trim())
              : ['Ümumi Proqram'];

            // 1-Hop batched retrieval for each child
            const homeData = await studentService.getStudentHomeData(s.id, forceRefresh);

            return {
              studentId: s.id,
              fullName,
              email: profile.email,
              phone: profile.phone,
              programs: programsList,
              attendanceRate: homeData.progress.attendanceRate,
              nextClassTime: homeData.nextClass
                ? `${homeData.nextClass.startTime} - ${homeData.nextClass.endTime}`
                : undefined,
              nextClassSubject: homeData.nextClass?.programName || homeData.nextClass?.groupName,
              pendingAssignmentsCount: homeData.progress.pendingAssignmentsCount,
              paymentStatus:
                homeData.paymentSummary.remainingDebt <= 0
                  ? 'Ödənilib'
                  : `${homeData.paymentSummary.remainingDebt} ₼ Qalıq`,
              stats: homeData.progress,
              paymentSummary: homeData.paymentSummary,
            };
          })
        );

        return children;
      },
      3 * 60 * 1000,
      forceRefresh
    );

    return result.data;
  },
};
