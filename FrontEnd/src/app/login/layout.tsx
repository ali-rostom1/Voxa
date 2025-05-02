import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/protected-route";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voxa login",
  description: "Video streaming and chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
          <ProtectedRoute isPublic>
        <div
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}
