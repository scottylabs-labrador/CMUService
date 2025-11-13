// app/(main)/layout.tsx

import { Navbar } from "@/components/layout/Navbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // This div adds the white background ONLY to pages in the (main) group
    <div className="relative min-h-screen w-full bg-white text-black">
      <Navbar />
      <div className="relative z-10 flex min-h-screen flex-col pt-6 sm:pt-8">
        <main className="flex-grow">{children}</main>
        <ConditionalFooter />
      </div>
    </div>
  );
}