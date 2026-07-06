"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface ShopCard {
  slug: string;
  name: string;
  description: string;
}

export default function Landing() {
  const [site, setSite] = useState({ siteName: "Bear Cards", siteTagline: "" });
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shops")
      .then((r) => r.json())
      .then((d) => {
        setSite(d.site);
        setShops(d.shops || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-5 py-10 sm:py-16">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-bear-gold mb-5">
          <Sparkles size={13} /> ร้านค้าออนไลน์
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-gold">
          {site.siteName}
        </h1>
        {site.siteTagline && (
          <p className="mt-4 text-bear-text/60 max-w-xl mx-auto">{site.siteTagline}</p>
        )}
      </header>

      {/* Shops */}
      <section>
        <h2 className="text-sm font-semibold text-bear-subtle uppercase tracking-widest mb-4">
          เลือกร้าน
        </h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-bear-subtle">
            ยังไม่มีร้านที่เปิดขาย — เพิ่มร้านได้ที่หน้าแอดมิน
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {shops.map((shop) => (
              <Link
                key={shop.slug}
                href={`/shop/${shop.slug}`}
                className="group glass rounded-2xl p-6 hover:border-bear-gold/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black border border-bear-gold/25 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-bear-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg group-hover:text-bear-gold transition-colors">
                      {shop.name}
                    </h3>
                    {shop.description && (
                      <p className="text-sm text-bear-text/55 mt-1 line-clamp-2">
                        {shop.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-bear-gold mt-3">
                      เข้าชมร้าน{" "}
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-white/6 flex items-center justify-between text-xs text-bear-subtle">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={13} /> ชำระผ่าน PromptPay · แนบสลิปได้ในเว็บ
        </span>
        <Link href="/admin" className="hover:text-bear-gold transition-colors">
          สำหรับร้านค้า
        </Link>
      </footer>
    </main>
  );
}
