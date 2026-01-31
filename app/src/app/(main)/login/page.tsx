// src/app/login/page.tsx

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
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
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F5] dark:bg-[#0A0A0A] overflow-hidden">
      {/* Animated Gradient Orb - matching home screen */}
      <div className="absolute top-[30%] right-[-15%] md:right-[-5%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0 animate-[move-in-circle_8s_linear_infinite]">
        <div
          className="w-full h-full animate-[pulse-glow_8s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle at center, #FF8800 0%, #FF6600 15%, #FF7700 30%, #FF5500 45%, #FF6699 65%, #FF88AA 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 sm:px-12 lg:px-24 py-8">
        {/* Back to Home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Main content */}
        <div className="flex-1 flex items-start pt-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                WELCOME <span className="text-orange-500">BACK</span>
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Sign in to your CMU Service account.
                <br />
                Access your dashboard and services.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@andrew.cmu.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/80 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-orange-400/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/80 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-orange-400/20 transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40"
              >
                Sign In
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
