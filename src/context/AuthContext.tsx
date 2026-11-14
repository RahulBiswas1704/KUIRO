'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  isDemo?: boolean;
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

const LEGACY_STORAGE_KEY = 'kuiro_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  // Verify server-side session strictly through /api/auth/me on mount
  // NEVER use localStorage as proof of authentication
  useEffect(() => {
    let isMounted = true;

    async function checkServerSession() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && isMounted) {
            const verifiedUser: AuthUser = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              businessName: data.workspace?.name || `${data.user.name}'s Workspace`,
              workspaceId: data.workspace?.id,
              hasCompletedOnboarding: true,
              role: data.user.role || 'Founder',
              emailVerified: data.user.emailVerified,
              isDemo: !!data.user.isDemo,
            };
            setUser(verifiedUser);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Verification against /api/auth/me failed:', err);
      }

      // If server verification fails or unauthenticated, user is strictly null!
      // Purge any legacy localStorage cache to prevent spoofing
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
          // ignore storage error
        }
      }

      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    }

    checkServerSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log In an existing user -> Strictly validates with Neon DB /api/auth/login
   * No local fallback, no fake users. Fails if server or database is unavailable.
   */
  const login = async (email: string, password?: string): Promise<boolean> => {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Network error: Unable to connect to the authentication server. Please check your connection.');
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Authentication server error (${res.status}). Please try again later.`);
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Invalid credentials or login failed.');
    }

    if (!data.user || !data.workspace) {
      throw new Error('Authentication failed: Incomplete session returned by server.');
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
      isDemo: false,
    };

    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    router.push('/dashboard');
    return true;
  };

  /**
   * 1-Click Fast Demo Login (Rajesh Sharma) -> Powered strictly by Neon DB
   * Rejects immediately if database is unavailable. No local mock account created.
   */
  const loginDemoUser = async () => {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true }),
      });
    } catch {
      throw new Error('Network error: Unable to reach demo authentication service. Please check your connection.');
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Demo authentication failed (Server error ${res.status}).`);
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Demo session provision failed on server.');
    }

    if (!data.user || !data.workspace) {
      throw new Error('Demo initialization failed: Incomplete demo session returned by server.');
    }

    const demoUser: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      businessName: data.workspace?.name || 'Sharma Heritage Retail & Studio (Demo Sandbox)',
      workspaceId: data.workspace?.id,
      hasCompletedOnboarding: true,
      role: data.user.role || 'Demo Founder',
      emailVerified: true,
      isDemo: true,
    };

    setUser(demoUser);
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
          isDemo: true,
        };
        setUser(switchedUser);
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
   * Sign Up a new user -> Strictly registers with Neon DB /api/auth/signup
   * Directs to onboarding wizard (/get-started). Fails if server or database is unavailable.
   */
  const signup = async (
    name: string,
    businessName: string,
    email: string,
    password?: string
  ): Promise<boolean> => {
    let res: Response;
    try {
      res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          businessName,
          email,
          password,
        }),
      });
    } catch {
      throw new Error('Network error: Unable to connect to the registration server. Please check your connection.');
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Registration server error (${res.status}). Please try again later.`);
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Registration failed');
    }

    if (!data.user || !data.workspace) {
      throw new Error('Registration failed: Incomplete account details returned by server.');
    }

    const newUser: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      businessName: data.workspace?.name || businessName.trim() || 'My Business',
      email: data.user.email,
      workspaceId: data.workspace?.id,
      hasCompletedOnboarding: false,
      role: data.user.role || 'Founder',
      emailVerified: data.user.emailVerified,
      isDemo: false,
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    router.push('/get-started');
    return true;
  };

  /**
   * Marks onboarding complete once wizard finishes
   */
  const completeOnboarding = () => {
    if (user) {
      setUser({ ...user, hasCompletedOnboarding: true });
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
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
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
   * - If not logged in -> opens modal
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
