// src/components/layout/DashboardSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
    // This outer container is unchanged (sticky, h-screen)
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 h-screen sticky top-0">
      {/* --- THIS IS THE FIX --- */}
      {/* Changed 'pt-20' to 'pt-16' to move the links up */}
      <nav className="flex flex-col gap-2 p-4 pt-9">
      {/* --- END OF FIX --- */}
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
                buttonVariants({
                  variant: isActive ? "default" : "ghost",
                }),
                "flex items-center gap-3 justify-start"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}