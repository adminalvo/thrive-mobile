import { supabase } from '../config/supabase';
import { UserSession } from '../types/auth.types';
import { UserRole, UserProfileRow } from '../types/database.types';

export const authService = {
  async signIn(input: string, pass: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const trimmed = input.trim();
      let emailToAuth = trimmed;

      // If user input is not an email (e.g. phone number like 0557596383 or +994509803400), resolve email via RPC
      if (!trimmed.includes('@')) {
        const { data: resolvedEmail } = await supabase.rpc('get_email_by_phone', {
          p_phone: trimmed,
        });

        if (resolvedEmail && typeof resolvedEmail === 'string') {
          emailToAuth = resolvedEmail;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: pass,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Invalid login credentials' };
      }

      const userSession = await this.resolveUserSession(data.user.id, data.user.email || emailToAuth);
      if (!userSession) {
        await supabase.auth.signOut();
        return { success: false, error: 'User profile or role not found in system.' };
      }

      const allowedRoles: UserRole[] = ['student', 'parent', 'teacher'];
      if (!allowedRoles.includes(userSession.role)) {
        await supabase.auth.signOut();
        return { success: false, error: 'unauthorizedRole' };
      }

      return { success: true, session: userSession };
    } catch (e: any) {
      return { success: false, error: e.message || 'An unexpected error occurred during sign in.' };
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
  },

  async getCurrentSession(): Promise<UserSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        return null;
      }
      return await this.resolveUserSession(session.user.id, session.user.email || '');
    } catch (e) {
      console.error('Error getting current session:', e);
      return null;
    }
  },

  async resolveUserSession(userId: string, email: string): Promise<UserSession | null> {
    try {
      // 1. Fetch user role from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      let role: UserRole = (roleData?.role as UserRole) || 'student';

      // 2. Fetch user profile from user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      const profile: UserProfileRow = profileData || {
        id: userId,
        user_id: userId,
        first_name: email.split('@')[0] || 'User',
        last_name: '',
        email,
        phone: null,
        fin_code: null,
        id_card_number: null,
        created_at: new Date().toISOString(),
      };

      let studentId: string | undefined;
      let parentId: string | undefined;
      let teacherId: string | undefined;

      // 3. Resolve role entity
      if (role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', profile.id)
          .limit(1)
          .maybeSingle();
        studentId = student?.id;
      } else if (role === 'parent') {
        const { data: parent } = await supabase
          .from('parents')
          .select('id')
          .eq('profile_id', profile.id)
          .limit(1)
          .maybeSingle();
        parentId = parent?.id;
      } else if (role === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('profile_id', profile.id)
          .limit(1)
          .maybeSingle();
        teacherId = teacher?.id;
      }

      return {
        userId,
        email,
        role,
        profile,
        studentId,
        parentId,
        teacherId,
      };
    } catch (e) {
      console.error('Error resolving user session:', e);
      return null;
    }
  },
};
