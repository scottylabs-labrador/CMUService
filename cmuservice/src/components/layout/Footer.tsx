// src/components/layout/Footer.tsx

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} CMUService. Built by Tartans, for Tartans.
        </p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/contact" className="hover:text-primary">Contact</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}