// src/components/layout/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("is_read", false);

        if (!error) {
          setUnreadCount(count || 0);
        }
      } catch (error) {
        console.warn("Failed to fetch notifications:", error);
      }
    };

    fetchUnreadCount();

    // Set up realtime subscription for notifications
    const supabase = createClient();
    const channel = supabase
      .channel("navbar-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFF0E8]/90 backdrop-blur-md border border-[#FFD4C4]/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo with gradient */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#FF5500] via-[#FF7744] to-[#FF69B4] bg-clip-text text-transparent">
            CMUSERVICE
          </span>
        </Link>

        {/* Right side navigation */}
        <div className="flex items-center gap-3">
          {/* Browse Services - Soft background button */}
          <Button
            asChild
            variant="ghost"
            className="rounded-full px-6 py-2 bg-white/70 border border-orange-200 text-black hover:bg-white/70 hover:text-black hover:scale-105 active:scale-95 transition-transform duration-300 shadow-sm"
          >
            <Link href="/services">Browse Services</Link>
          </Button>

          {/* List a Service - Gradient button */}
          <Link
            href={isLoggedIn ? "/dashboard/my-services/create" : "/login"}
            className="rounded-full px-6 py-2 bg-gradient-to-r from-[#FF4D00] to-[#FF8534] text-white text-sm font-medium hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            List a Service
          </Link>

          {/* Mail icon with notification badge */}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="relative p-2 hover:bg-orange-100 rounded-full transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User icon / Login */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-orange-100 rounded-full transition-colors"
              title="Logout"
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <Link
              href="/login"
              className="p-2 hover:bg-orange-100 rounded-full transition-colors"
              title="Login"
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
