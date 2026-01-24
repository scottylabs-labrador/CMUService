// app/dashboard/layout.tsx

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // --- THIS IS THE FIX ---
    // 1. Removed 'min-h-screen'
    // 2. Added 'pt-16' (4rem) to push this whole layout
    //    down, right below your h-16 (4rem) navbar.
    <div className="flex pt-0">
    {/* --- END OF FIX --- */}
      <DashboardSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}