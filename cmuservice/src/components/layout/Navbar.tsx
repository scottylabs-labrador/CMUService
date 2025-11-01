// src/components/layout/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="text-2xl font-bold text-red-700 transition-colors hover:text-red-600"
        >
          CMUService
        </Link>

        <div className="flex items-center gap-6">
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Browse Services
          </Link>
          <Link
            href="/requests"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
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
