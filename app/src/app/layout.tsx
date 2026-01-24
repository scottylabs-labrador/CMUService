// app/layout.tsx

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
// Navbar and Footer are removed from here
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMUService",
  description: "A peer-to-peer service marketplace for CMU students.",
  icons: {
    icon: "/favicon.png", // Relative path from the public directory
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <NotificationProvider>
            {/* No wrapper div, no bg-white. 
              This lets the homepage be transparent. 
            */}
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
