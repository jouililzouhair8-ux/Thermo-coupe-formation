import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, UserRole } from './types';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } from './constants';

const ADMIN_PHONE = '0600452313';
const ADMIN_LOCAL_SESSION_KEY = 'thermo_admin_local_session';

interface AdminLocalSession {
  role: 'admin';
  full_name: string;
  phone_number: string;
  email: string;
}

function getAdminLocalSession(): AdminLocalSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_LOCAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminLocalSession;
  } catch {
    return null;
  }
}

function setAdminLocalSession(s: AdminLocalSession | null) {
  try {
    if (s) localStorage.setItem(ADMIN_LOCAL_SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(ADMIN_LOCAL_SESSION_KEY);
  } catch {
    // ignore
  }
}

function isAdminLocalInput(input: string): boolean {
  const v = input.trim().toLowerCase();
  return v === ADMIN_PHONE || v === ADMIN_EMAIL;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  blocked: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; blocked?: boolean; role?: UserRole }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const localAdmin = getAdminLocalSession();
      if (localAdmin) {
        if (!mounted) return;
        setProfile({
          id: ADMIN_PHONE,
          email: localAdmin.email,
          full_name: localAdmin.full_name,
          phone_number: localAdmin.phone_number,
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      const { data: { session: sbSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(sbSession);

      if (sbSession?.user) {
        await loadProfile(sbSession.user.id, sbSession.user.email ?? '');
      }
      if (mounted) setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      (async () => {
        setSession(sbSession);
        if (sbSession?.user) {
          await loadProfile(sbSession.user.id, sbSession.user.email ?? '');
        } else {
          setProfile(null);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error.message);
      return;
    }

    if (data) {
      const profileData = data as Profile;
      if (profileData.status === 'blocked' && profileData.role === 'trainee') {
        setBlocked(true);
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        return;
      }
      setProfile(profileData);
      setBlocked(false);
    } else {
      const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'trainee';
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ id: userId, email, role, full_name: role === 'admin' ? '' : '', status: 'active' })
        .select('*')
        .maybeSingle();
      if (newProfile) setProfile(newProfile as Profile);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null; blocked?: boolean; role?: UserRole }> => {
    const normalizedInput = email.trim().toLowerCase();

    if (isAdminLocalInput(normalizedInput) && password === ADMIN_PASSWORD) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
        if (!authError && authData.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
          if (profileData) {
            const p = profileData as Profile;
            setSession(authData.session);
            setProfile(p);
            setBlocked(false);
            return { error: null, role: p.role };
          }
        }
      } catch {
        // Fall through to localStorage bypass
      }

      const adminSession: AdminLocalSession = {
        role: 'admin',
        full_name: ADMIN_NAME,
        phone_number: ADMIN_PHONE,
        email: ADMIN_EMAIL,
      };
      setAdminLocalSession(adminSession);
      setProfile({
        id: ADMIN_PHONE,
        email: ADMIN_EMAIL,
        full_name: ADMIN_NAME,
        phone_number: ADMIN_PHONE,
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
      });
      setBlocked(false);
      return { error: null, role: 'admin' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedInput,
        password,
      });
      if (error) return { error: 'بيانات الدخول غير صحيحة' };

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileData) {
          const p = profileData as Profile;
          if (p.status === 'blocked' && p.role === 'trainee') {
            setBlocked(true);
            await supabase.auth.signOut();
            setSession(null);
            setProfile(null);
            return { error: 'تم تعليق حسابك من طرف الإدارة. يرجى التواصل مع المشرف.', blocked: true };
          }
          setProfile(p);
          setBlocked(false);
          return { error: null, role: p.role };
        }
        await loadProfile(data.user.id, data.user.email ?? '');
      }
      return { error: null };
    } catch {
      return { error: 'فشل الاتصال بالخادم' };
    }
  };

  const signOut = async () => {
    setProfile(null);
    setSession(null);
    setBlocked(false);
    setAdminLocalSession(null);
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await loadProfile(session.user.id, session.user.email ?? '');
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, blocked, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
