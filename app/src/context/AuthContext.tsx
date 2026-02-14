// src/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface AuthContextType {
  user: {
    id: string;
    email?: string;
    fullName?: string;
  } | null;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const user = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        fullName: clerkUser.fullName ?? undefined,
      }
    : null;

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
