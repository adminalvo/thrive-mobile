'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface UserProfile {
  id: string;
  user_id?: string;
  first_name: string;
  last_name?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  groupName?: string;
  programName?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
}

interface AuthContextProps {
  user: any | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (input: string, pass: string) => Promise<{ error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  profile: null,
  role: 'student',
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
});

// Client-side Rate Limiting Tracker
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);

  // Fast parallel session resolution
  const resolveUserSession = async (userId: string, email: string): Promise<UserProfile> => {
    try {
      const [roleRes, profRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId).limit(1).maybeSingle(),
        supabase.from('user_profiles').select('*').eq('user_id', userId).limit(1).maybeSingle()
      ]);

      let userRole: UserRole = (roleRes.data?.role as UserRole) || 'student';
      if (!roleRes.data?.role) {
        if (email.includes('teacher') || email.includes('muellim')) userRole = 'teacher';
        else if (email.includes('parent') || email.includes('valideyn')) userRole = 'parent';
        else if (email.includes('admin')) userRole = 'admin';
      }

      const profData = profRes.data;
      const firstName = profData?.first_name || email.split('@')[0] || 'User';
      const lastName = profData?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();

      let studentId: string | undefined;
      let teacherId: string | undefined;
      let parentId: string | undefined;

      if (userRole === 'student') {
        const { data: s } = await supabase.from('students').select('id').eq('profile_id', profData?.id || userId).limit(1).maybeSingle();
        studentId = s?.id;
      } else if (userRole === 'teacher') {
        const { data: t } = await supabase.from('teachers').select('id').eq('profile_id', profData?.id || userId).limit(1).maybeSingle();
        teacherId = t?.id;
      } else if (userRole === 'parent') {
        const { data: p } = await supabase.from('parents').select('id').eq('profile_id', profData?.id || userId).limit(1).maybeSingle();
        parentId = p?.id;
      }

      const resProfile: UserProfile = {
        id: profData?.id || userId,
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        name: fullName,
        email,
        phone: profData?.phone || '',
        role: userRole,
        studentId,
        teacherId,
        parentId
      };

      setProfile(resProfile);
      setRole(userRole);
      localStorage.setItem('thrive_portal_profile', JSON.stringify(resProfile));
      return resProfile;
    } catch (e) {
      console.error('Session resolve error:', e);
      const fallback: UserProfile = {
        id: userId,
        first_name: email.split('@')[0],
        name: email.split('@')[0],
        email,
        role: 'student'
      };
      setProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('thrive_portal_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setRole(parsed.role || 'student');
      }
    } catch {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        resolveUserSession(session.user.id, session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        resolveUserSession(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('thrive_portal_profile');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkRateLimit = (): boolean => {
    try {
      const trackerStr = localStorage.getItem('thrive_auth_tracker');
      const now = Date.now();
      if (!trackerStr) return true;

      const tracker = JSON.parse(trackerStr);
      if (now - tracker.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        localStorage.removeItem('thrive_auth_tracker');
        return true;
      }

      if (tracker.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const recordFailedAttempt = () => {
    try {
      const now = Date.now();
      const trackerStr = localStorage.getItem('thrive_auth_tracker');
      let tracker = trackerStr ? JSON.parse(trackerStr) : { attempts: 0, firstAttempt: now };

      if (now - tracker.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        tracker = { attempts: 1, firstAttempt: now };
      } else {
        tracker.attempts += 1;
      }

      localStorage.setItem('thrive_auth_tracker', JSON.stringify(tracker));
    } catch {}
  };

  const resetRateLimit = () => {
    try {
      localStorage.removeItem('thrive_auth_tracker');
    } catch {}
  };

  const signIn = async (input: string, pass: string) => {
    if (!checkRateLimit()) {
      return { error: 'Too many authentication attempts. Please wait 5 minutes before trying again.' };
    }

    setLoading(true);
    let emailToAuth = input.trim();

    if (!emailToAuth.includes('@')) {
      try {
        const { data: resolvedEmail } = await supabase.rpc('get_email_by_phone', { p_phone: emailToAuth });
        if (resolvedEmail && typeof resolvedEmail === 'string') {
          emailToAuth = resolvedEmail;
        }
      } catch {}
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: pass,
    });

    if (error || !data.user) {
      recordFailedAttempt();
      setLoading(false);
      return { error: error?.message || 'Invalid email or password' };
    }

    resetRateLimit();
    const resolved = await resolveUserSession(data.user.id, data.user.email || emailToAuth);
    setLoading(false);
    return { role: resolved.role };
  };

  const signOut = async () => {
    localStorage.removeItem('thrive_portal_profile');
    setUser(null);
    setProfile(null);
    supabase.auth.signOut().catch(() => {});
    window.location.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
