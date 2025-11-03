// src/components/layout/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overWhite, setOverWhite] = useState(!isHome);

  useEffect(() => {
    // On non-home pages, always dark text
    if (!isHome) {
      setOverWhite(true);
      return;
    }

    const update = () => {
      const sentinel = document.getElementById("white-bg-sentinel");
      const header = document.getElementById("site-navbar");
      if (!sentinel || !header) return;
      const navHeight = header.offsetHeight || 64;
      const sentinelTop = sentinel.getBoundingClientRect().top + window.scrollY;
      const scrolled = window.scrollY + navHeight >= sentinelTop;
      setOverWhite(scrolled);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navText = overWhite
    ? "text-gray-900 hover:text-gray-700"
    : "text-white hover:text-gray-200";

  return (
    <header id="site-navbar" className="sticky top-0 z-50 w-full p-4">
      <div
        className={cn(
          "mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between rounded-[2rem] border border-white/30 bg-white/20 px-6 shadow-lg backdrop-blur-lg"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.png"
            alt="CMU Service Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className={cn("text-xl font-bold transition-colors", navText)}>
            CMUService
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={cn("text-sm font-semibold transition-colors", navText)}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/services"
            className={cn("text-sm font-semibold transition-colors", navText)}
          >
            Browse Services
          </Link>
          <Link
            href="/requests"
            className={cn("text-sm font-semibold transition-colors", navText)}
          >
            Browse Requests
          </Link>

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="transition-colors hover:bg-red-600 hover:text-white hover:border-red-500"
            >
              Logout
            </Button>
          ) : isHome ? (
            // Home page: login button with static multi-color ring (no animation)
            <div className="relative inline-flex rounded-full p-[3px] overflow-hidden">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(#ee7752,#e73c7e,#23a6d5,#23d5ab,#ee7752)]"
              />
              <Button
                asChild
                className="relative rounded-full px-5 py-2 bg-black/50 text-white border border-white/40 backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <Link href="/login">Login with Andrew ID</Link>
              </Button>
            </div>
          ) : (
            // Other pages: normal login button
            <Button asChild>
              <Link href="/login">Login with Andrew ID</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
