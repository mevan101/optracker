import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
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

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "OpTracker",
    template: "%s · OpTracker",
  },
  description:
    "Live roles from public job-board APIs. Expired, broken, mock, and placeholder listings are removed.",
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
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className={`${inter.className} min-h-dvh bg-obsidian antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
