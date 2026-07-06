"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft, ShoppingBag, Plus, Minus, Trash2, QrCode,
  Upload, CheckCircle2, Loader2, Package,
} from "lucide-react";
import { baht, mediaUrl } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

interface ShopInfo {
  slug: string;
  name: string;
  description: string;
  promptpayName: string;
  shippingNote: string;
  hasPromptpay: boolean;
}

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>();

  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);

  useEffect(() => {
    fetch(`/api/shops/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setShop(d.shop);
        setCategories(d.categories || []);
        setProducts(d.products || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, qty]) => ({ product: productById[id], qty }))
        .filter((l) => l.product),
    [cart, productById]
  );

  const total = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);

  function setQty(id: string, qty: number) {
    const product = productById[id];
    const max = product ? product.stock : 0;
    const clamped = Math.max(0, Math.min(qty, max));
    setCart((c) => ({ ...c, [id]: clamped }));
  }

  const visibleProducts =
    activeCat === "all" ? products : products.filter((p) => p.categoryId === activeCat);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-5 py-20 text-center text-bear-subtle">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-bear-gold" />
      </main>
    );
  }

  if (notFound || !shop) {
    return (
      <main className="max-w-5xl mx-auto px-5 py-20 text-center">
        <p className="text-bear-subtle">ไม่พบร้านนี้</p>
        <Link href="/" className="text-bear-gold text-sm mt-3 inline-block">
          ← กลับหน้าแรก
        </Link>
      </main>
    );
  }

  if (checkout) {
    return (
      <Checkout
        shop={shop}
        lines={cartLines}
        total={total}
        onBack={() => setCheckout(false)}
      />
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-8 pb-32">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-bear-subtle hover:text-bear-gold">
          <ChevronLeft size={16} /> ทุกร้าน
        </Link>
        <h1 className="text-3xl font-extrabold mt-3 text-gradient-gold">{shop.name}</h1>
        {shop.description && <p className="text-bear-text/55 mt-1">{shop.description}</p>}
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <Tab active={activeCat === "all"} onClick={() => setActiveCat("all")}>
            ทั้งหมด
          </Tab>
          {categories.map((c) => (
            <Tab key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
              {c.name}
            </Tab>
          ))}
        </div>
      )}

      {/* Products */}
      {visibleProducts.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-bear-subtle">
          ยังไม่มีสินค้าในหมวดนี้
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              qty={cart[p.id] || 0}
              onAdd={() => setQty(p.id, (cart[p.id] || 0) + 1)}
              onInc={() => setQty(p.id, (cart[p.id] || 0) + 1)}
              onDec={() => setQty(p.id, (cart[p.id] || 0) - 1)}
            />
          ))}
        </div>
      )}

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-4">
          <div className="max-w-5xl mx-auto glass-strong rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-bear-gold" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-bear-gold text-black text-[11px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="font-bold text-lg">{baht(total)}</span>
            </div>
            <button
              onClick={() => setCheckout(true)}
              className="bg-bear-gold text-black font-bold px-6 py-2.5 rounded-xl hover:bg-bear-gold-light transition-colors"
            >
              สั่งซื้อ
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-bear-gold text-black" : "glass text-bear-text/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product, qty, onAdd, onInc, onDec,
}: {
  product: Product; qty: number; onAdd: () => void; onInc: () => void; onDec: () => void;
}) {
  const out = product.stock <= 0;
  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-black/40 flex items-center justify-center overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-10 h-10 text-white/15" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-bear-text/50 mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-bear-gold">{baht(product.price)}</span>
          <span className={`text-xs ${out ? "text-bear-danger" : "text-bear-subtle"}`}>
            {out ? "หมด" : `เหลือ ${product.stock}`}
          </span>
        </div>

        <div className="mt-3">
          {qty > 0 ? (
            <div className="flex items-center justify-between glass rounded-xl px-2 py-1.5">
              <button onClick={onDec} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
                <Minus size={16} />
              </button>
              <span className="font-bold">{qty}</span>
              <button
                onClick={onInc}
                disabled={qty >= product.stock}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              disabled={out}
              className="w-full py-2 rounded-xl border border-bear-gold/30 text-bear-gold text-sm font-semibold hover:bg-bear-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {out ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Checkout ─────────────────────────

function Checkout({
  shop, lines, total, onBack,
}: {
  shop: ShopInfo;
  lines: { product: Product; qty: number }[];
  total: number;
  onBack: () => void;
}) {
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", note: "" });
  const [slip, setSlip] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>("");
  const [qr, setQr] = useState<{ qr: string; promptpayName: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string } | null>(null);

  useEffect(() => {
    if (!shop.hasPromptpay || total <= 0) return;
    fetch(`/api/promptpay?shop=${shop.slug}&amount=${total}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setQr(d))
      .catch(() => {});
  }, [shop.slug, shop.hasPromptpay, total]);

  function onSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setSlip(f);
    setSlipPreview(f ? URL.createObjectURL(f) : "");
  }

  async function submit() {
    setError("");
    if (!form.customerName || !form.phone || !form.address) {
      setError("กรุณากรอกชื่อ เบอร์โทร และที่อยู่จัดส่ง");
      return;
    }
    if (!slip) {
      setError("กรุณาแนบรูปสลิปการโอนเงิน");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append("shop", shop.slug);
    fd.append("customerName", form.customerName);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    fd.append("note", form.note);
    fd.append("items", JSON.stringify(lines.map((l) => ({ productId: l.product.id, qty: l.qty }))));
    fd.append("slip", slip);

    try {
      const res = await fetch("/api/orders", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "out_of_stock"
            ? `สินค้า "${data.product}" เหลือไม่พอ (เหลือ ${data.stock})`
            : "เกิดข้อผิดพลาด กรุณาลองใหม่"
        );
        setSubmitting(false);
        return;
      }
      setDone({ code: data.code });
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="max-w-lg mx-auto px-5 py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-bear-gold mx-auto" />
        <h1 className="text-2xl font-bold mt-4">รับออเดอร์แล้ว!</h1>
        <p className="text-bear-text/60 mt-2">
          หมายเลขคำสั่งซื้อ <span className="font-mono font-bold text-bear-gold">{done.code}</span>
        </p>
        <p className="text-sm text-bear-subtle mt-4">
          ทางร้านจะตรวจสอบสลิปและจัดส่งให้เร็วที่สุด ขอบคุณค่ะ 🙏
        </p>
        <Link href="/" className="inline-block mt-8 bg-bear-gold text-black font-bold px-6 py-2.5 rounded-xl">
          กลับหน้าแรก
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-8 pb-16">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-bear-subtle hover:text-bear-gold mb-5">
        <ChevronLeft size={16} /> เลือกสินค้าต่อ
      </button>

      <h1 className="text-2xl font-bold mb-6">ยืนยันการสั่งซื้อ</h1>

      {/* Order summary */}
      <section className="glass rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-bear-subtle uppercase tracking-widest mb-3">รายการ</h2>
        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.product.id} className="flex justify-between text-sm">
              <span className="text-bear-text/80">
                {l.product.name} <span className="text-bear-subtle">× {l.qty}</span>
              </span>
              <span>{baht(l.product.price * l.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/6 mt-3 pt-3 flex justify-between font-bold">
          <span>รวมทั้งหมด</span>
          <span className="text-bear-gold">{baht(total)}</span>
        </div>
      </section>

      {/* Shipping form */}
      <section className="glass rounded-2xl p-5 mb-5 space-y-3">
        <h2 className="text-sm font-semibold text-bear-subtle uppercase tracking-widest">ที่อยู่จัดส่ง</h2>
        <Field label="ชื่อผู้รับ *" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
        <Field label="เบอร์โทร *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div>
          <label className="text-xs text-bear-subtle">ที่อยู่จัดส่ง *</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
            className="w-full mt-1 bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-sm focus:border-bear-gold/50 focus:outline-none resize-none"
          />
        </div>
        <Field label="หมายเหตุ (ถ้ามี)" value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
      </section>

      {/* Payment */}
      <section className="glass rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-bear-subtle uppercase tracking-widest mb-3 flex items-center gap-2">
          <QrCode size={15} /> ชำระเงิน (PromptPay)
        </h2>
        {shop.hasPromptpay && qr ? (
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.qr} alt="PromptPay QR" className="w-56 h-56 rounded-xl bg-white p-2" />
            {qr.promptpayName && <p className="mt-2 text-sm">{qr.promptpayName}</p>}
            <p className="text-bear-gold font-bold text-lg mt-1">{baht(total)}</p>
            <p className="text-xs text-bear-subtle mt-1">สแกนด้วยแอปธนาคารเพื่อชำระเงิน</p>
          </div>
        ) : shop.hasPromptpay ? (
          <p className="text-sm text-bear-subtle text-center py-4">กำลังสร้าง QR...</p>
        ) : (
          <p className="text-sm text-bear-subtle text-center py-4">
            ร้านยังไม่ได้ตั้งค่า PromptPay — กรุณาติดต่อร้านเพื่อรับข้อมูลการชำระเงิน
          </p>
        )}
      </section>

      {/* Slip upload */}
      <section className="glass rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-bear-subtle uppercase tracking-widest mb-3">แนบสลิปการโอน *</h2>
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" onChange={onSlipChange} className="hidden" />
          {slipPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slipPreview} alt="slip" className="w-full max-h-72 object-contain rounded-xl bg-black/40" />
          ) : (
            <div className="border-2 border-dashed border-white/10 rounded-xl py-10 flex flex-col items-center text-bear-subtle hover:border-bear-gold/40 transition-colors">
              <Upload size={22} />
              <span className="text-sm mt-2">แตะเพื่อเลือกรูปสลิป</span>
            </div>
          )}
        </label>
      </section>

      {error && <p className="text-bear-danger text-sm text-center mb-4">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full bg-bear-gold text-black font-bold py-3.5 rounded-xl hover:bg-bear-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "กำลังส่ง..." : `ยืนยันคำสั่งซื้อ · ${baht(total)}`}
      </button>

      {shop.shippingNote && (
        <p className="text-xs text-bear-subtle text-center mt-4">{shop.shippingNote}</p>
      )}
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-bear-subtle">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-sm focus:border-bear-gold/50 focus:outline-none"
      />
    </div>
  );
}
