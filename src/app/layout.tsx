import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define viewport configuration separately as recommended in Next.js 15+
export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Athena - Personal Life Management Platform",
  description: "Manage your daily routines, health, finances, and get AI-driven insights to optimize your life.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Athena",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "Athena",
  keywords: ["health tracker", "finance tracker", "task planner", "AI assistant", "personal management"],
  creator: "Athena Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://athena-life.app",
    title: "Athena - Personal Life Management Platform",
    description: "Manage your daily routines, health, finances, and get AI-driven insights to optimize your life.",
    siteName: "Athena"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/assets/logos/athena-icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="serviceworker" href="/api/service-worker" />
      </head>
      <ClientBody>
        {children}
        <Toaster />
      </ClientBody>
    </html>
  );
}
