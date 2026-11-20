'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth, signOutUser } from '@/lib/firebase/auth';
import { CustomerUser } from '@/types';
import { toast } from '@/lib/toast';

interface AuthContextType {
  user: FirebaseUser | null;
  customerProfile: CustomerUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'google' | 'phone' | 'email';
  openAuthModal: (tab?: 'google' | 'phone' | 'email') => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
  syncProfileWithBackend: (fbUser: FirebaseUser, providerHint?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  customerProfile: null,
  loading: true,
  isAuthModalOpen: false,
  authModalTab: 'google',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  logout: async () => {},
  syncProfileWithBackend: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'google' | 'phone' | 'email'>('google');

  // Sync Firebase user details with MongoDB customer store
  const syncProfileWithBackend = async (fbUser: FirebaseUser, providerHint?: string) => {
    try {
      const provider =
        providerHint ||
        (fbUser.providerData[0]?.providerId.includes('google')
          ? 'google'
          : fbUser.providerData[0]?.providerId.includes('phone')
          ? 'phone'
          : 'password');

      const res = await fetch('/api/customer/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fbUser.uid,
          name: fbUser.displayName || (fbUser.phoneNumber ? `Guest ${fbUser.phoneNumber.slice(-4)}` : 'Valued Guest'),
          email: fbUser.email,
          phone: fbUser.phoneNumber,
          avatarUrl: fbUser.photoURL,
          authProvider: provider,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomerProfile(data.customer);
        }
      }
    } catch (err) {
      console.warn('Customer backend sync warning:', err);
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfileWithBackend(currentUser);
      } else {
        setCustomerProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (tab: 'google' | 'phone' | 'email' = 'google') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setCustomerProfile(null);
      toast.info('You have been signed out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        logout,
        syncProfileWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
