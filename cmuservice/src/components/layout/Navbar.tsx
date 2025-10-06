// src/components/layout/Navbar.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="p-4 border-b">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-red-700">
          CMUService
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Browse Services
          </Link>
          {/* 👇 Add this new link */}
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Browse Requests
          </Link>
          <Button>Login with Andrew ID</Button>
        </div>
      </nav>
    </header>
  );
}