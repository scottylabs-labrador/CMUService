// src/components/layout/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overWhite, setOverWhite] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setOverWhite(true);
      return;
    }

    const update = () => {
      // Make sure an element with this ID exists on your homepage
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

  // This logic is now correct for both states
  const navText = isHome
    ? overWhite
      ? "text-gray-900 hover:text-gray-700"
      : "text-white hover:text-gray-200"
    : "text-gray-900 hover:text-gray-700";

  const navItems = [
    ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    { href: "/services", label: "Browse Services" },
    { href: "/requests", label: "Browse Requests" },
  ];

  return (
    // This is the outer morphing container
    <motion.div
      layoutId="navbar-container"
      className={cn(
        "sticky z-50",
        isHome
          ? "top-4 p-4"
          // --- THIS IS THE FIX ---
          // Removed 'py-4' to make the bar thinner
          : "top-0 w-full bg-white border-b border-gray-200 shadow-sm"
      )}
      // This is the slower transition you wanted
      transition={{
        type: "spring",
        stiffness: 170,
        damping: 26,
      }}
    >
      {/* This is the inner morphing container */}
      <motion.div
        layoutId="navbar-container-inner" 
        id="site-navbar"
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between px-6",
          isHome
            ? "max-w-screen-xl rounded-[2rem] border border-white/30 bg-white/20 shadow-lg backdrop-blur-lg"
            : "max-w-screen-xl"
        )}
      >
        {/* This wrapper stops the logo from warping */}
        <motion.div layout="position">
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
        </motion.div>

        {/* This wrapper stops the links from warping */}
        <motion.div layout="position" className="flex items-center gap-6">
          <ul className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative z-10 block rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      // Text is white if pill is active, otherwise use dynamic text
                      isActive ? "text-white" : navText
                    )}
                  >
                    {item.label}
                  </Link>

                  {/* Bouncy pill now renders on ALL pages */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 z-0 bg-gray-900"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* (All your login/logout logic is unchanged) */}
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="transition-colors hover:bg-red-600 hover:text-white hover:border-red-500"
            >
              Logout
            </Button>
          ) : isHome ? (
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
            <Button asChild>
              <Link href="/login">Login with Andrew ID</Link>
            </Button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}