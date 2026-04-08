import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";

export const metadata: Metadata = {
  title: "BearHealth — Smartwatch Analytics",
  description: "Advanced health & performance analytics powered by your smartwatch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bear-bg text-bear-text antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <AIChat />
      </body>
    </html>
  );
}
