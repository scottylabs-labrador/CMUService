"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthContextType {
  user: {
    id: string;
    email?: string;
    fullName?: string;
    imageUrl?: string;
  } | null;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? undefined,
        fullName: session.user.name ?? undefined,
        imageUrl: session.user.image ?? undefined,
      }
    : null;

  const logout = async () => {
    await authClient.signOut();
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
