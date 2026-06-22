import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeWatcher } from "@/components/app-shell/theme-watcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Terragon",
  description: "The calm execution layer for teams that live in GitHub.",
};

// Apply persisted theme + card-view before paint to avoid a flash / hydration mismatch.
// Theme: stored value is the mode (light|dark|system); unset/system → follow the OS.
const prefsScript = `(function(){try{var t=localStorage.getItem('terragon-theme');var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=t==='dark'?'dark':t==='light'?'light':(dark?'dark':'light');document.documentElement.setAttribute('data-theme',resolved);var c=localStorage.getItem('terragon-card-view');if(c==='summary'||c==='detailed'){document.documentElement.setAttribute('data-card-view',c);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-card-view="detailed"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body>
        <ThemeWatcher />
        {children}
      </body>
    </html>
  );
}
