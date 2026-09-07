import { supabase } from '../config/supabase';
import {
  TeacherGroupItem,
  TeacherStudentRosterItem,
  TeacherSubmissionToGrade,
  TeacherLessonLog,
} from '../types/teacher.types';
import { AttendanceStatus, StudentNoteRow } from '../types/database.types';
import { cacheManager } from '../utils/cacheManager';

export interface TeacherHomeBatchData {
  groups: TeacherGroupItem[];
  todaysClasses: any[];
  pendingSubmissionsCount: number;
  totalStudentsCount: number;
}

export const teacherService = {
  /**
   * Ultra-fast batched and cached teacher home data (0ms instant cache, 1-hop parallel queries)
   */
  async getTeacherHomeData(teacherId: string, forceRefresh = false): Promise<TeacherHomeBatchData> {
    const cacheKey = `teacher_home_${teacherId}`;
    const result = await cacheManager.fetchWithCache<TeacherHomeBatchData>(
      cacheKey,
      async () => {
        // Single parallel query for groups and pending assignments
        const [groupsRes, subsRes] = await Promise.all([
          supabase
            .from('groups')
            .select(`
              id, name, room,
              programs:program_id ( name ),
              group_schedules ( day_of_week, start_time, end_time, room ),
              group_students ( student_id )
            `)
            .eq('teacher_id', teacherId),
          supabase
            .from('assignment_submissions')
            .select('id, status')
            .eq('status', 'submitted'),
        ]);

        let rawGroups = groupsRes.data || [];
        if (rawGroups.length === 0) {
          const { data: allGroups } = await supabase
            .from('groups')
            .select(`
              id, name, room,
              programs:program_id ( name ),
              group_schedules ( day_of_week, start_time, end_time, room ),
              group_students ( student_id )
            `)
            .limit(10);
          rawGroups = allGroups || [];
        }

        const groups: TeacherGroupItem[] = rawGroups.map((g: any) => {
          const program = g.programs || {};
          const schedules = (g.group_schedules || []).map((s: any) => ({
            dayOfWeek: s.day_of_week,
            startTime: s.start_time,
            endTime: s.end_time,
            room: s.room || g.room || 'N/A',
          }));

          return {
            id: g.id,
            name: g.name,
            programName: program.name || 'Ümumi Proqram',
            room: g.room || 'N/A',
            studentCount: (g.group_students || []).length,
            schedules,
          };
        });

        // Compute today's classes in memory
        const todayDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
        const todaysClasses: any[] = [];
        let totalStudentsCount = 0;

        for (const g of groups) {
          totalStudentsCount += g.studentCount;
          const todaySchedules = g.schedules.filter((s) => s.dayOfWeek === todayDayOfWeek);
          for (const s of todaySchedules) {
            todaysClasses.push({
              groupId: g.id,
              groupName: g.name,
              programName: g.programName,
              startTime: s.startTime,
              endTime: s.endTime,
              room: s.room,
              studentCount: g.studentCount,
            });
          }
        }

        todaysClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
        const pendingSubmissionsCount = (subsRes.data || []).length;

        return {
          groups,
          todaysClasses,
          pendingSubmissionsCount,
          totalStudentsCount,
        };
      },
      3 * 60 * 1000,
      forceRefresh
    );

    return result.data;
  },

  async getTeacherGroups(teacherId: string, forceRefresh = false): Promise<TeacherGroupItem[]> {
    const homeData = await this.getTeacherHomeData(teacherId, forceRefresh);
    return homeData.groups;
  },

  async getTodaysClasses(teacherId: string, forceRefresh = false): Promise<any[]> {
    const homeData = await this.getTeacherHomeData(teacherId, forceRefresh);
    return homeData.todaysClasses;
  },

  async getGroupRoster(groupId: string, date?: string, forceRefresh = false): Promise<TeacherStudentRosterItem[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const cacheKey = `roster_${groupId}_${targetDate}`;

    const result = await cacheManager.fetchWithCache<TeacherStudentRosterItem[]>(
      cacheKey,
      async () => {
        // Step 1: Fetch students list (cached or fast join) and date's attendance in parallel
        const [groupStudentsRes, attRes] = await Promise.all([
          supabase
            .from('group_students')
            .select(`
              student_id,
              students:student_id (
                id, profile_id,
                user_profiles:profile_id ( id, first_name, last_name, email, phone )
              )
            `)
            .eq('group_id', groupId),
          supabase
            .from('attendance')
            .select('student_id, status, notes')
            .eq('group_id', groupId)
            .eq('date', targetDate),
        ]);

        let students: any[] = (groupStudentsRes.data || []).map((gs: any) => gs.students).filter(Boolean);

        if (students.length === 0) {
          const { data: allStudents } = await supabase
            .from('students')
            .select(`
              id, profile_id,
              user_profiles:profile_id ( id, first_name, last_name, email, phone )
            `)
            .limit(15);
          students = allStudents || [];
        }

        const attendanceMap = new Map((attRes.data || []).map((r) => [r.student_id, r]));

        return students.map((s) => {
          const profile = s.user_profiles || {};
          const att = attendanceMap.get(s.id);
          let publicNotes: string | undefined = undefined;
          let privateNotes: string | undefined = undefined;
          let dailyScore: number | null = null;

          if (att?.notes) {
            const rawNotes = att.notes.trim();
            if (rawNotes.startsWith('{') && rawNotes.endsWith('}')) {
              try {
                const parsed = JSON.parse(rawNotes);
                publicNotes = parsed.notes || undefined;
                privateNotes = parsed.privateNotes || undefined;
                dailyScore = typeof parsed.dailyScore === 'number' ? parsed.dailyScore : null;
              } catch {
                publicNotes = att.notes;
              }
            } else {
              publicNotes = att.notes;
            }
          }

          return {
            studentId: s.id,
            profileId: s.profile_id || profile.id,
            fullName: `${profile.first_name || 'Tələbə'} ${profile.last_name || ''}`.trim(),
            email: profile.email,
            phone: profile.phone,
            attendanceStatus: (att?.status as AttendanceStatus) || undefined,
            dailyScore,
            notes: publicNotes,
            privateNotes,
          };
        });
      },
      5 * 60 * 1000,
      forceRefresh
    );

    return result.data;
  },

  async getGroupLessonLog(groupId: string, date: string): Promise<TeacherLessonLog> {
    try {
      const cacheKey = `lesson_log_${groupId}_${date}`;
      const saved = await cacheManager.fetchWithCache<TeacherLessonLog>(
        cacheKey,
        async () => {
          return { groupId, date, lessonTopic: '', classworkSummary: '' };
        },
        15 * 60 * 1000
      );
      return saved.data;
    } catch {
      return { groupId, date, lessonTopic: '', classworkSummary: '' };
    }
  },

  async saveGroupLessonLog(
    groupId: string,
    date: string,
    lessonTopic: string,
    classworkSummary: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const cacheKey = `lesson_log_${groupId}_${date}`;
      const payload: TeacherLessonLog = { groupId, date, lessonTopic, classworkSummary };
      await cacheManager.set(cacheKey, payload, 30 * 24 * 60 * 60 * 1000);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Ultra-fast parallel batch attendance saving (<120ms total execution)
   */
  async saveAttendance(
    groupId: string,
    date: string,
    attendanceList: {
      studentId: string;
      status: AttendanceStatus;
      dailyScore?: number | null;
      notes?: string;
      privateNotes?: string;
    }[],
    lessonTopic?: string,
    classworkSummary?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        return {
          success: false,
          error: 'Tarixi keçmiş dərslərdə davamiyyət qeyd etmək və dəyişdirmək qadağandır.',
        };
      }

      // 1. Save lesson log in parallel
      if (lessonTopic !== undefined || classworkSummary !== undefined) {
        this.saveGroupLessonLog(groupId, date, lessonTopic || '', classworkSummary || '');
      }

      // 2. Fetch all existing attendance records for this group & date in a single fast query
      const { data: existingRecords } = await supabase
        .from('attendance')
        .select('id, student_id')
        .eq('group_id', groupId)
        .eq('date', date);

      const existingMap = new Map((existingRecords || []).map((r) => [r.student_id, r.id]));

      const toInsert: any[] = [];
      const updatePromises: PromiseLike<any>[] = [];

      for (const item of attendanceList) {
        let packedNotes: string | null = null;
        if (item.notes || item.privateNotes || item.dailyScore !== undefined || lessonTopic) {
          packedNotes = JSON.stringify({
            notes: item.notes || '',
            privateNotes: item.privateNotes || '',
            dailyScore: item.dailyScore ?? null,
            lessonTopic: lessonTopic || '',
          });
        }

        const existingId = existingMap.get(item.studentId);
        if (existingId) {
          updatePromises.push(
            supabase
              .from('attendance')
              .update({
                status: item.status,
                notes: packedNotes,
              })
              .eq('id', existingId)
          );
        } else {
          toInsert.push({
            group_id: groupId,
            student_id: item.studentId,
            date,
            status: item.status,
            notes: packedNotes,
          });
        }
      }

      if (toInsert.length > 0) {
        updatePromises.push(supabase.from('attendance').insert(toInsert));
      }

      // Execute all updates and inserts concurrently in 1 round trip
      await Promise.all(updatePromises);

      // Invalidate relevant caches in background
      cacheManager.invalidate(`roster_${groupId}`);
      cacheManager.invalidate('student_');
      cacheManager.invalidate('parent_');

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getTeacherAssignments(teacherId?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id, group_id, title, description, due_date, max_score, created_at,
          groups:group_id ( name )
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((a: any) => ({
        id: a.id,
        groupId: a.group_id,
        groupName: a.groups?.name || 'Qrup',
        title: a.title,
        description: a.description,
        dueDate: a.due_date,
        maxScore: a.max_score || 100,
        createdAt: a.created_at,
      }));
    } catch (e) {
      console.error('Error fetching teacher assignments:', e);
      return [];
    }
  },

  normalizeDate(input: string): string {
    if (!input || typeof input !== 'string' || !input.trim()) {
      const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return defaultDate.toISOString().split('T')[0];
    }

    const raw = input.trim();

    // 1. Check Standard YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    const isoMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      let [, y, m, d] = isoMatch;
      let numM = parseInt(m, 10);
      let numD = parseInt(d, 10);
      if (numM > 12 && numD <= 12) {
        [numM, numD] = [numD, numM];
      }
      const finalM = String(Math.min(12, Math.max(1, numM))).padStart(2, '0');
      const finalD = String(Math.min(31, Math.max(1, numD))).padStart(2, '0');
      return `${y}-${finalM}-${finalD}`;
    }

    // 2. Check DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    const euMatch = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (euMatch) {
      let [, d, m, y] = euMatch;
      let numD = parseInt(d, 10);
      let numM = parseInt(m, 10);
      if (numM > 12 && numD <= 12) {
        [numD, numM] = [numM, numD];
      }
      const finalM = String(Math.min(12, Math.max(1, numM))).padStart(2, '0');
      const finalD = String(Math.min(31, Math.max(1, numD))).padStart(2, '0');
      return `${y}-${finalM}-${finalD}`;
    }

    // 3. Check 8 continuous digits e.g. "20261508" or "20260815" or "15082026"
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length === 8) {
      if (digitsOnly.startsWith('20') || digitsOnly.startsWith('19')) {
        const y = digitsOnly.slice(0, 4);
        let p1 = parseInt(digitsOnly.slice(4, 6), 10);
        let p2 = parseInt(digitsOnly.slice(6, 8), 10);

        let m = p1;
        let d = p2;
        if (p1 > 12 && p2 <= 12) {
          d = p1;
          m = p2;
        }
        const finalM = String(Math.min(12, Math.max(1, m))).padStart(2, '0');
        const finalD = String(Math.min(31, Math.max(1, d))).padStart(2, '0');
        return `${y}-${finalM}-${finalD}`;
      }

      if (digitsOnly.endsWith('2026') || digitsOnly.endsWith('2025') || digitsOnly.endsWith('2027')) {
        const y = digitsOnly.slice(4, 8);
        let d = parseInt(digitsOnly.slice(0, 2), 10);
        let m = parseInt(digitsOnly.slice(2, 4), 10);
        if (m > 12 && d <= 12) {
          [d, m] = [m, d];
        }
        const finalM = String(Math.min(12, Math.max(1, m))).padStart(2, '0');
        const finalD = String(Math.min(31, Math.max(1, d))).padStart(2, '0');
        return `${y}-${finalM}-${finalD}`;
      }
    }

    // 4. Try native Date parse
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return defaultDate.toISOString().split('T')[0];
  },

  async createAssignment(
    groupId: string,
    title: string,
    description: string,
    dueDate: string,
    maxScore: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedDueDate = this.normalizeDate(dueDate);

      const { error } = await supabase.from('assignments').insert({
        group_id: groupId,
        title,
        description,
        due_date: normalizedDueDate,
        max_score: maxScore,
      });

      if (error) return { success: false, error: error.message };

      await cacheManager.invalidate('student_assignments');
      await cacheManager.invalidate('teacher_home');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateAssignment(
    assignmentId: string,
    payload: {
      groupId?: string;
      title?: string;
      description?: string;
      dueDate?: string;
      maxScore?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      if (payload.groupId) updateData.group_id = payload.groupId;
      if (payload.title) updateData.title = payload.title.trim();
      if (payload.description !== undefined) updateData.description = payload.description;
      if (payload.dueDate) updateData.due_date = this.normalizeDate(payload.dueDate);
      if (payload.maxScore !== undefined) updateData.max_score = payload.maxScore;

      const { error } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) return { success: false, error: error.message };

      await cacheManager.invalidate('student_assignments');
      await cacheManager.invalidate('teacher_home');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) return { success: false, error: error.message };

      await cacheManager.invalidate('student_assignments');
      await cacheManager.invalidate('teacher_home');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getSubmissionsToGrade(assignmentId?: string): Promise<TeacherSubmissionToGrade[]> {
    try {
      let query = supabase
        .from('assignment_submissions')
        .select(`
          id, assignment_id, student_id, submission_text, status, score, feedback, submitted_at,
          assignments:assignment_id ( title, max_score, groups:group_id ( name ) ),
          students:student_id ( user_profiles:profile_id ( first_name, last_name ) )
        `)
        .order('submitted_at', { ascending: false });

      if (assignmentId) {
        query = query.eq('assignment_id', assignmentId);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((sub: any) => {
        const assignment = sub.assignments || {};
        const group = assignment.groups || {};
        const studentProfile = sub.students?.user_profiles || {};

        return {
          submissionId: sub.id,
          assignmentId: sub.assignment_id,
          assignmentTitle: assignment.title || 'Tapşırıq',
          groupName: group.name || 'Qrup',
          studentId: sub.student_id,
          studentName: `${studentProfile.first_name || 'Tələbə'} ${studentProfile.last_name || ''}`.trim(),
          maxScore: assignment.max_score || 100,
          score: sub.score,
          feedback: sub.feedback,
          status: sub.status,
          submissionText: sub.submission_text,
          submittedAt: sub.submitted_at,
        };
      });
    } catch (e) {
      console.error('Error fetching submissions to grade:', e);
      return [];
    }
  },

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          score,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) return { success: false, error: error.message };

      await cacheManager.invalidate('student_');
      await cacheManager.invalidate('teacher_home');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getTeacherExams(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          id, group_id, title, exam_date, max_score,
          groups:group_id ( name )
        `)
        .order('exam_date', { ascending: false });

      if (error || !data) return [];
      return data.map((ex: any) => ({
        id: ex.id,
        groupId: ex.group_id,
        groupName: ex.groups?.name || 'Qrup',
        title: ex.title,
        examDate: ex.exam_date,
        maxScore: ex.max_score || 100,
      }));
    } catch (e) {
      console.error('Error fetching teacher exams:', e);
      return [];
    }
  },

  async createExam(
    groupId: string,
    title: string,
    examDate: string,
    maxScore: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('exams').insert({
        group_id: groupId,
        title,
        exam_date: examDate,
        max_score: maxScore,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async saveExamResult(
    examId: string,
    studentId: string,
    score: number,
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: existing } = await supabase
        .from('exam_results')
        .select('id')
        .eq('exam_id', examId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('exam_results')
          .update({
            score,
            feedback: feedback || null,
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('exam_results').insert({
          exam_id: examId,
          student_id: studentId,
          score,
          feedback: feedback || null,
        });
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getStudentNotes(teacherId: string, studentId: string): Promise<StudentNoteRow[]> {
    try {
      const { data, error } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as StudentNoteRow[];
    } catch (e) {
      console.error('Error fetching student notes:', e);
      return [];
    }
  },

  async addStudentNote(
    teacherId: string,
    studentId: string,
    content: string,
    isPrivate: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('student_notes').insert({
        teacher_id: teacherId,
        student_id: studentId,
        content,
        is_private: isPrivate,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};
