import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './services/storage';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());

  const handleSetUser = (user: User | null) => {
    storage.setCurrentUser(user as any); // Update storage
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
