// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer"; // 👈 1. Import the Footer

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 👇 2. Updated the metadata
export const metadata: Metadata = {
  title: "CMUService",
  description: "A peer-to-peer service marketplace for CMU students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar /> {/* 👈 3. Add the Navbar here */}
        <main className="min-h-screen">
          {children} {/* Your page content goes here */}
        </main>
        <Footer /> {/* 👈 4. Add the Footer here */}
      </body>
    </html>
  );
}