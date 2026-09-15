import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserRole } from '../types/business';
import { isUserAdmin } from '../services/adminService';

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  register: (name: string, email: string, pass: string) => Promise<User>;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = isUserAdmin(user?.email);
  const role: UserRole = isAdmin ? 'admin' : 'msme';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (name: string, email: string, pass: string): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      try {
        await updateProfile(credential.user, { displayName: name.trim() });
      } catch (err) {
        console.warn('Could not update user displayName:', err);
      }
    }
    setUser(credential.user);
    return credential.user;
  };

  const login = async (email: string, pass: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    setUser(credential.user);
    return credential.user;
  };

  const logout = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        loading,
        register,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
