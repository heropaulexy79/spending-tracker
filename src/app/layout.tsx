import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { TrackingProvider } from "@/context/TrackingContext";
import NotificationManager from "@/components/NotificationManager";
import InstallPrompt from "@/components/InstallPrompt";
import AppShell from "@/components/layout/AppShell";

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              <NotificationManager />
              <InstallPrompt />
              <OfflineStatus />
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
