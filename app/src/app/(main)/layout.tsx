// app/(main)/layout.tsx

"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div 
      className={cn(
        "relative min-h-screen w-full text-black",
        isLoginPage ? "bg-black" : "bg-white"
      )}
    >
      {!isLoginPage && <Navbar />}

      <div 
        className={cn(
          "relative z-10 flex min-h-screen flex-col",
          // This correctly removes the gap on dashboard pages
          !isLoginPage && !isDashboard && "pt-6 sm:pt-8"
        )}
      >
        <main className="flex-grow">{children}</main>
        
        {/* --- THIS IS THE FIX --- */}
        {/* Removed '!isDashboard' to show the footer on the dashboard */}
        {!isLoginPage && <ConditionalFooter />}
        {/* --- END OF FIX --- */}
      </div>
    </div>
  );
}