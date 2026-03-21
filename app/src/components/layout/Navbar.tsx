// src/components/layout/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread notifications count + profile avatar
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUnreadCount(0);
      setAvatarUrl(null);
      return;
    }

    const supabase = createClient();

    const fetchData = async () => {
      try {
        const [{ count }, { data: profile }] = await Promise.all([
          supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("is_read", false),
          supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .single(),
        ]);

        setUnreadCount(count || 0);
        setAvatarUrl(profile?.avatar_url ?? null);
      } catch (error) {
        console.warn("Failed to fetch navbar data:", error);
      }
    };

    fetchData();

    // Set up realtime subscription for notifications
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
          supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("is_read", false)
            .then(({ count }) => setUnreadCount(count || 0));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
  };

  // Avatar image source: Supabase custom > Keycloak OAuth > fallback icon
  const profileImage = avatarUrl || user?.imageUrl || null;

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

          {/* User avatar / Login */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden ring-2 ring-orange-200 hover:ring-orange-400 transition-all duration-200 hover:scale-105"
                title="Account"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-orange-100">
                    <User className="w-4 h-4 text-orange-500" />
                  </span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-orange-100 py-1 z-50">
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-orange-400" />
                    Dashboard
                  </Link>
                  <hr className="my-1 border-orange-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-orange-400" />
                    Logout
                  </button>
                </div>
              )}
            </div>
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
