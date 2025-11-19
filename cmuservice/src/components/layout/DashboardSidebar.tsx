// src/components/layout/DashboardSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
// 1. Import LayoutGroup along with motion
import { motion, LayoutGroup } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderKanban,
  Settings,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-services", label: "My Services", icon: ShoppingBag },
  { href: "/dashboard/my-requests", label: "My Requests", icon: FolderKanban },
  { href: "/dashboard/selling", label: "Active Selling", icon: DollarSign },
  { href: "/dashboard/buying", label: "Active Purchases", icon: ShoppingCart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 h-screen sticky top-0">
      {/* Preserved your pt-9 spacing */}
      <nav className="flex flex-col gap-2 p-4 pt-9">
        {/* 2. Wrap the list in LayoutGroup to fix the "teleport" bug */}
        <LayoutGroup>
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "relative flex items-center gap-3 justify-start overflow-hidden",
                  // Text logic: White if active, Muted if not
                  isActive 
                    ? "text-primary-foreground hover:text-primary-foreground hover:bg-transparent" 
                    : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className="absolute inset-0 bg-primary rounded-md"
                    // 3. initial={false} prevents "fly-in" on page load
                    initial={false}
                    // 4. Matches your Navbar's snappy physics
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                
                {/* Content sits on top of the pill */}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </LayoutGroup>
      </nav>
    </aside>
  );
}