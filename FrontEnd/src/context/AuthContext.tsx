"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
  
type AuthContextType = {
    user: UserProfile | null;
    isAuthenticated: boolean;
    login: (userData: UserProfile) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const isAuthenticated = !!user;
  
    useEffect(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }, []);
  
    const login = (userData: UserProfile) => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    };
  
    const logout = () => {
      setUser(null);    
      localStorage.removeItem('user');
    };
  
    return (
      <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
