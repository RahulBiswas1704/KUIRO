'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  businessName: string;
  hasCompletedOnboarding: boolean;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, businessName: string, email: string, password?: string) => Promise<boolean>;
  loginDemoUser: () => void;
  logout: () => void;
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

const DEMO_USER: AuthUser = {
  id: 'usr_demo_101',
  name: 'Dr. Rajesh Sharma',
  email: 'dr.sharma@apexclinic.in',
  businessName: 'Dr. Sharma Dental Clinics',
  hasCompletedOnboarding: true,
  role: 'Founder & Clinic Director',
};

const STORAGE_KEY = 'kuiro_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  // Load persisted session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (userData: AuthUser | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  /**
   * Log In an existing user -> Always redirects to dashboard
   */
  const login = async (email: string, password?: string): Promise<boolean> => {
    // Simulated auth check
    const existingName = email.includes('sharma') ? 'Dr. Rajesh Sharma' : email.split('@')[0];
    const loggedInUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: existingName.charAt(0).toUpperCase() + existingName.slice(1),
      email,
      businessName: email.includes('sharma') ? 'Dr. Sharma Dental Clinics' : 'Apex Health & Care',
      hasCompletedOnboarding: true,
      role: 'Owner',
    };

    saveSession(loggedInUser);
    setIsAuthModalOpen(false);
    router.push('/dashboard');
    return true;
  };

  /**
   * 1-Click Demo Login as Dr. Rajesh Sharma
   */
  const loginDemoUser = () => {
    saveSession(DEMO_USER);
    setIsAuthModalOpen(false);
    router.push('/dashboard');
  };

  /**
   * Sign Up a new user -> Directs to onboarding wizard (/get-started) to set up Brand Brain
   */
  const signup = async (
    name: string,
    businessName: string,
    email: string,
    password?: string
  ): Promise<boolean> => {
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'New Founder',
      businessName: businessName.trim() || 'My Business',
      email: email.trim(),
      hasCompletedOnboarding: false, // New account has not set up Brand Brain yet!
      role: 'Founder',
    };

    saveSession(newUser);
    setIsAuthModalOpen(false);
    router.push('/get-started');
    return true;
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
   * Log Out user -> Redirects to Home
   */
  const logout = () => {
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

