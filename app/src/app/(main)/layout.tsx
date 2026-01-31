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
  const isServicesPage =
    pathname === "/services" || pathname.startsWith("/services/");
  const isRequestsPage =
    pathname === "/requests" || pathname.startsWith("/requests/");

  return (
    <div className={cn("relative min-h-screen w-full text-black bg-white")}>
      {!isLoginPage && <Navbar />}

      <div
        className={cn(
          "relative z-10 flex min-h-screen flex-col",
          // Remove padding for dashboard, services, and requests pages
          !isLoginPage &&
            !isDashboard &&
            !isServicesPage &&
            !isRequestsPage &&
            "pt-6 sm:pt-8",
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
