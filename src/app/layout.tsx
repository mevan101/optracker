import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["SF Pro Text", "SF Pro Display", "system-ui", "sans-serif"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OpTracker",
  description:
    "A quiet job-platform viewer. Live roles from public APIs, with expired, broken, mock, and placeholder listings removed.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OpTracker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-dvh bg-obsidian antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
