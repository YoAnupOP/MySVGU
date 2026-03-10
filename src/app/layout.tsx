import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import AppProviders from "@/components/app-providers";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const themeInitializationScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
  }
})();`;

export const metadata: Metadata = {
  title: "MySVGU | Smart Student Portal",
  description: "A modern SVGU student super-app for attendance, community, updates, timetable, and AI help.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${spaceGrotesk.variable} antialiased`}>
        <Script id="mysvgu-theme-init" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
        <AppProviders>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}