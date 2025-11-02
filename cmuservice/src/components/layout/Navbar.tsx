// src/components/layout/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[2rem] border border-white/30 bg-white/20 px-6 shadow-lg backdrop-blur-lg"
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
          <span className="text-xl font-bold text-white transition-colors hover:text-gray-200">
            CMUService
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white transition-colors hover:text-gray-200"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/services"
            className="text-sm font-semibold text-white transition-colors hover:text-gray-200"
          >
            Browse Services
          </Link>
          <Link
            href="/requests"
            className="text-sm font-semibold text-white transition-colors hover:text-gray-200"
          >
            Browse Requests
          </Link>

          {isLoggedIn ? (
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          ) : (
            // This button now links to the login page
            <Button asChild>
              <Link href="/login">Login with Andrew ID</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
