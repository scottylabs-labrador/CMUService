"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Option A: remove footer on the home page
  if (isHome) return null;

  // Option B (alternative): to keep but force white, replace the return above with:
  // return (
  //   <div className="bg-white">
  //     <Footer />
  //   </div>
  // );

  return <Footer />;
}
