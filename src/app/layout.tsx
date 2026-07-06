import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ร้านไพ่พระแม่ — สั่งซื้อไพ่ & กำยาน",
  description: "เลือกสินค้า กรอกที่อยู่ ชำระผ่าน PromptPay แล้วแนบสลิปได้ในที่เดียว",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-bear-bg text-bear-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
