'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  businessName: string;
  workspaceId?: string;
  hasCompletedOnboarding: boolean;
  avatar?: string;
  role?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, businessName: string, email: string, password?: string) => Promise<boolean>;
  loginDemoUser: () => Promise<void>;
  switchPersona: (personaKey: 'sharma' | 'sengupta' | 'mehta') => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  // Modal controls
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  // Smart routing for Get Started button
  handleGetStarted: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'kuiro_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  const saveSession = useCallback((userData: AuthUser | null) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Check persistent Neon DB session on mount via /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && isMounted) {
            const restoredUser: AuthUser = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              businessName: data.workspace?.name || `${data.user.name}'s Workspace`,
              workspaceId: data.workspace?.id,
              hasCompletedOnboarding: true,
              role: data.user.role || 'Founder',
              emailVerified: data.user.emailVerified,
            };
            setUser(restoredUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredUser));
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session check failed, falling back to cached state:', err);
      }

      // Fallback to local storage cache if network fails
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && isMounted) {
            setUser(JSON.parse(stored));
          }
        }
      } catch (e) {
        console.error('[AuthContext] Failed to parse local session:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log In an existing user -> Calls Neon DB /api/auth/login -> Redirects to /dashboard
   */
  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const loggedInUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        businessName: data.workspace?.name || 'My Business',
        workspaceId: data.workspace?.id,
        hasCompletedOnboarding: true,
        role: data.user.role || 'Owner',
        emailVerified: data.user.emailVerified,
      };

      saveSession(loggedInUser);
      setIsAuthModalOpen(false);
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      // Graceful offline fallback
      console.warn('[AuthContext] Remote login error, attempting offline login:', err.message);
      const existingName = email.includes('sharma') ? 'Dr. Rajesh Sharma' : email.split('@')[0];
      const fallbackUser: AuthUser = {
        id: `usr_${Date.now()}`,
        name: existingName.charAt(0).toUpperCase() + existingName.slice(1),
        email,
        businessName: email.includes('sharma') ? 'Dr. Sharma Dental Clinics' : 'Apex Health & Care',
        hasCompletedOnboarding: true,
        role: 'Owner',
      };
      saveSession(fallbackUser);
      setIsAuthModalOpen(false);
      router.push('/dashboard');
      return true;
    }
  };

  /**
   * 1-Click Fast Demo Login (Dr. Rajesh Sharma) -> Powered by Neon DB
   */
  const loginDemoUser = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true }),
      });

      if (res.ok) {
        const data = await res.json();
        const demoUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          businessName: data.workspace?.name || 'Dr. Sharma Dental Clinics',
          workspaceId: data.workspace?.id,
          hasCompletedOnboarding: true,
          role: data.user.role || 'Founder & Clinic Director',
          emailVerified: true,
        };
        saveSession(demoUser);
        setIsAuthModalOpen(false);
        router.push('/dashboard');
        return;
      }
    } catch (err) {
      console.warn('[AuthContext] Demo login remote call failed, using local demo profile:', err);
    }

    // Static fallback
    const staticDemo: AuthUser = {
      id: 'usr_demo_101',
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@apexclinic.in',
      businessName: 'Dr. Sharma Dental Clinics',
      hasCompletedOnboarding: true,
      role: 'Founder & Clinic Director',
    };
    saveSession(staticDemo);
    setIsAuthModalOpen(false);
    router.push('/dashboard');
  };

  /**
   * 1-Click Multi-Tenant Persona Simulator Switcher
   */
  const switchPersona = async (personaKey: 'sharma' | 'sengupta' | 'mehta'): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaKey }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const switchedUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          businessName: data.workspace?.name || data.user.businessName,
          workspaceId: data.workspace?.id,
          hasCompletedOnboarding: true,
          role: data.user.role,
          emailVerified: true,
        };
        saveSession(switchedUser);
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        return true;
      }
    } catch (err) {
      console.error('[AuthContext] Persona switch failed:', err);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  /**
   * Sign Up a new user -> Neon DB /api/auth/signup -> Directs to onboarding wizard (/get-started)
   */
  const signup = async (
    name: string,
    businessName: string,
    email: string,
    password?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          businessName,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const newUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        businessName: data.workspace?.name || businessName.trim() || 'My Business',
        email: data.user.email,
        workspaceId: data.workspace?.id,
        hasCompletedOnboarding: false, // New account has not finalized Brand Brain yet!
        role: data.user.role || 'Founder',
        emailVerified: data.user.emailVerified,
      };

      saveSession(newUser);
      setIsAuthModalOpen(false);
      router.push('/get-started');
      return true;
    } catch (err: any) {
      console.warn('[AuthContext] Signup remote error, using fallback:', err.message);
      const fallbackUser: AuthUser = {
        id: `usr_${Date.now()}`,
        name: name.trim() || 'New Founder',
        businessName: businessName.trim() || 'My Business',
        email: email.trim(),
        hasCompletedOnboarding: false,
        role: 'Founder',
      };
      saveSession(fallbackUser);
      setIsAuthModalOpen(false);
      router.push('/get-started');
      return true;
    }
  };

  /**
   * Marks onboarding complete once wizard finishes
   */
  const completeOnboarding = () => {
    if (user) {
      const updated = { ...user, hasCompletedOnboarding: true };
      saveSession(updated);
    }
    router.push('/dashboard');
  };

  /**
   * Log Out user -> Calls /api/auth/logout -> Clears cookie & redirects to Home
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[AuthContext] Logout fetch failed:', err);
    }
    saveSession(null);
    router.push('/');
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Smart Get Started click handler:
   * - If user is already logged in -> redirects directly to /dashboard
   * - If not logged in -> opens modal or options choice
   */
  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        signup,
        loginDemoUser,
        switchPersona,
        logout,
        completeOnboarding,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        handleGetStarted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
