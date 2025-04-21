"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
  
type AuthContextType = {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: UserProfile) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!user;
  
    useEffect(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      setLoading(false);
    }, []);
  
    const login = (userData: UserProfile) => {
      setLoading(true);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
    };
  
    const logout = () => {
      setLoading(true);
      setUser(null);    
      localStorage.removeItem('user');
      setLoading(false);
    };
  
    return (
      <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
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
