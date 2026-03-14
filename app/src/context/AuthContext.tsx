// src/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";

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
  const { user: clerkUser, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const user = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        fullName: clerkUser.fullName ?? undefined,
        imageUrl: clerkUser.imageUrl ?? undefined,
      }
    : null;

  // When a user signs in, ensure their profile row exists in Supabase.
  // ignoreDuplicates: true means we never overwrite a profile they've already customized.
  useEffect(() => {
    if (!isSignedIn || !clerkUser) return;

    const supabase = createClient();
    supabase
      .from("profiles")
      .upsert(
        {
          id: clerkUser.id,
          full_name: clerkUser.fullName ?? "",
          avatar_url: clerkUser.imageUrl ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .then(({ error }) => {
        if (error) console.warn("Failed to ensure profile:", error.message);
      });
  }, [isSignedIn, clerkUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
