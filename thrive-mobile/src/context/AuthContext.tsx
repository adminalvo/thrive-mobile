import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { UserSession } from '../types/auth.types';
import { authService } from '../services/authService';

interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  activeChildId: string | null;
  setActiveChildId: (childId: string) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  activeChildId: null,
  setActiveChildId: () => {},
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const initSession = async () => {
    try {
      setLoading(true);
      const userSession = await authService.getCurrentSession();
      setSession(userSession);
    } catch (e) {
      console.error('Error initializing auth session:', e);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      if (!supaSession?.user) {
        setSession(null);
        setActiveChildId(null);
      } else {
        const userSession = await authService.resolveUserSession(supaSession.user.id, supaSession.user.email || '');
        setSession(userSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const res = await authService.signIn(email, pass);
    if (res.success && res.session) {
      setSession(res.session);
    }
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    await authService.signOut();
    setSession(null);
    setActiveChildId(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (session?.userId) {
      const refreshed = await authService.resolveUserSession(session.userId, session.email);
      setSession(refreshed);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        activeChildId,
        setActiveChildId,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
