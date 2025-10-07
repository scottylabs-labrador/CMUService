// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import your supabase client
import { User } from '@supabase/supabase-js';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void; // We'll trigger a simple prompt for testing
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = !!user; // isLoggedIn is true if the user object exists

  useEffect(() => {
    // This effect runs once on startup to check if a user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkSession();

    // This listens for changes in auth state (login/logout events)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  const login = async () => {
    // For testing, we'll use a simple prompt to get credentials
    const email = prompt("Enter your test email:");
    const password = prompt("Enter your test password:");

    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error logging in: " + error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}