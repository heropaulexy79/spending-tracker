import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { TrackingProvider } from "@/context/TrackingContext";
import InstallPrompt from "@/components/InstallPrompt";
import AppShell from "@/components/layout/AppShell";

const dmSans = {
  variable: "--font-dm-sans",
  className: "font-sans",
};

const playfair = {
  variable: "--font-playfair",
  className: "font-serif",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Crafting the Mind – Spending & Behavioral Tracker",
  description: "Master your intentions with guided behavioral tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "S&B Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#b08447",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import OfflineStatus from "@/components/OfflineStatus";
import AnalyticsTracker from "@/components/AnalyticsTracker";

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GX3LZ0H8ET"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GX3LZ0H8ET', { page_path: window.location.pathname });
          `}
        </Script>
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${dmSans.className} pb-24 min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TrackingProvider>
              <AnalyticsTracker />
              <InstallPrompt />
              <OfflineStatus />
              <Toaster position="top-center" />
              <AppShell>
                {children}
              </AppShell>
            </TrackingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
