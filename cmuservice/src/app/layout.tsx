// app/layout.tsx

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            <div className="relative min-h-screen w-full bg-white">
              <Navbar />
              <div className="relative z-10 flex min-h-screen flex-col pt-24">
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
