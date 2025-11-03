// src/app/login/page.tsx

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Use the new client-side client
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CMUFuturisticBackground } from "@/components/ui/CMUFuturisticBackground";

export default function LoginPage() {
  const supabase = createClient(); // Create client instance here
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      router.push("/dashboard");
      router.refresh(); // Refresh the page to ensure server components reload
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <CMUFuturisticBackground />
      <div className="relative z-10 flex min-h-screen items-start justify-center pt-20 sm:pt-24">
        <Card className="w-full max-w-md bg-white/20 border-white/30 backdrop-blur-lg shadow-2xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Login</CardTitle>
            <CardDescription className="text-white/90">
              Enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {/* Sign In with conic gradient perimeter, same style as home login */}
              <div className="inline-flex w-full rounded-full p-[3px] bg-[conic-gradient(#ee7752,#e73c7e,#23a6d5,#23d5ab,#ee7752)] shadow-[0_0_18px_rgba(231,60,126,0.35)]">
                <Button
                  type="submit"
                  className="w-full rounded-full bg-black/50 text-white border border-white/40 backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
