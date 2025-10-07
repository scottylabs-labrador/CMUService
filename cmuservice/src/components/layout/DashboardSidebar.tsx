//src/components/layout/DashboardSidebar.tsx

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, FolderKanban, Settings } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/my-services", label: "My Services", icon: ShoppingBag },
    { href: "/dashboard/my-requests", label: "My Requests", icon: FolderKanban },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 border-r bg-gray-50 p-4">
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

