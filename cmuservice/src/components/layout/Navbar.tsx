// src/components/layout/Navbar.tsx

'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="py-4 border-b">
      <nav className="container mx-auto flex justify-between items-center">
        <Link 
          href={isLoggedIn ? "/dashboard" : "/"} 
          className="text-2xl font-bold text-red-700"
        >
          CMUService
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Browse Services
          </Link>
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Browse Requests
          </Link>
          
          {isLoggedIn ? (
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          ) : (
            // This button now links to the login page
            <Button asChild>
              <Link href="/login">Login with Andrew ID</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}