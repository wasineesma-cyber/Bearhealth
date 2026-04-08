import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import PwaRegister from "@/components/PwaRegister";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "BearHealth — Smartwatch Analytics",
  description: "วิเคราะห์ข้อมูล smartwatch พร้อม AI Health Coach",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BearHealth",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080c10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-transparent text-bear-text antialiased">
        <SessionWrapper>
          <div className="flex h-screen overflow-hidden relative z-10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
          <AIChat />
          <PwaRegister />
        </SessionWrapper>
      </body>
    </html>
  );
}
