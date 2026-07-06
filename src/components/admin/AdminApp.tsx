"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store, Plus, LogOut, Package, Tag, Receipt, Settings as Cog,
  Loader2, Trash2, Pencil, Check, X, ExternalLink, Home,
} from "lucide-react";
import type { Shop, Category, Product, Order, Settings } from "@/lib/types";
import { baht, mediaUrl, STATUS_TH } from "@/lib/format";

interface AdminData {
  shops: Shop[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: Settings;
}

type Tab = "orders" | "products" | "categories" | "shop";

export default function AdminApp() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [shopId, setShopId] = useState<string>("");
  const [tab, setTab] = useState<Tab>("orders");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const d: AdminData = await res.json();
    setData(d);
    setShopId((cur) => cur || d.shops[0]?.id || "");
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function addShop() {
    const name = window.prompt("ชื่อร้านใหม่ (เช่น ร้านกำยาน)");
    if (!name?.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const d = await res.json();
    await reload();
    if (d.shop) setShopId(d.shop.id);
    setBusy(false);
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center text-bear-subtle">
        <Loader2 className="w-6 h-6 animate-spin text-bear-gold" />
      </main>
    );
  }

  const shop = data.shops.find((s) => s.id === shopId);
  const shopOrders = data.orders.filter((o) => o.shopId === shopId);
  const pendingCount = shopOrders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar: shops */}
      <aside className="lg:w-64 shrink-0 glass-strong border-b lg:border-b-0 lg:border-r border-white/6 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold text-gradient-gold">{data.settings.siteName}</span>
          <button onClick={logout} title="ออกจากระบบ" className="text-bear-subtle hover:text-bear-danger">
            <LogOut size={18} />
          </button>
        </div>

        <p className="text-[10px] font-semibold text-bear-subtle uppercase tracking-widest mb-2">ร้านย่อย</p>
        <div className="space-y-1 flex-1">
          {data.shops.map((s) => {
            const unseen = data.orders.filter((o) => o.shopId === s.id && o.status === "pending").length;
            return (
              <button
                key={s.id}
                onClick={() => setShopId(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-colors ${
                  s.id === shopId ? "bg-white/5 text-white" : "text-bear-text/70 hover:bg-white/4"
                }`}
              >
                <Store size={16} className={s.id === shopId ? "text-bear-gold" : ""} />
                <span className="flex-1 truncate">{s.name}</span>
                {!s.active && <span className="text-[10px] text-bear-subtle">ปิด</span>}
                {unseen > 0 && (
                  <span className="w-5 h-5 rounded-full bg-bear-gold text-black text-[10px] font-bold flex items-center justify-center">
                    {unseen}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={addShop}
          disabled={busy}
          className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-bear-gold/30 text-bear-gold text-sm font-semibold hover:bg-bear-gold/10"
        >
          <Plus size={15} /> เพิ่มร้าน
        </button>
        <SiteSettings settings={data.settings} onSaved={reload} />
        <Link href="/" className="mt-2 flex items-center gap-1.5 text-xs text-bear-subtle hover:text-bear-gold justify-center">
          <Home size={13} /> ดูหน้าเว็บ
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 sm:p-8 max-w-4xl">
        {!shop ? (
          <p className="text-bear-subtle">ยังไม่มีร้าน — กด “เพิ่มร้าน” เพื่อเริ่มต้น</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold">{shop.name}</h1>
                <a
                  href={`/shop/${shop.slug}`}
                  target="_blank"
                  className="text-xs text-bear-gold inline-flex items-center gap-1 mt-0.5"
                >
                  /shop/{shop.slug} <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6 border-b border-white/6">
              <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={<Receipt size={15} />}>
                ออเดอร์ {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
              </TabBtn>
              <TabBtn active={tab === "products"} onClick={() => setTab("products")} icon={<Package size={15} />}>
                สินค้า & สต็อก
              </TabBtn>
              <TabBtn active={tab === "categories"} onClick={() => setTab("categories")} icon={<Tag size={15} />}>
                หมวดหมู่
              </TabBtn>
              <TabBtn active={tab === "shop"} onClick={() => setTab("shop")} icon={<Cog size={15} />}>
                ตั้งค่าร้าน
              </TabBtn>
            </div>

            {tab === "orders" && <OrdersTab orders={shopOrders} onChange={reload} />}
            {tab === "products" && (
              <ProductsTab
                shop={shop}
                categories={data.categories.filter((c) => c.shopId === shop.id)}
                products={data.products.filter((p) => p.shopId === shop.id)}
                onChange={reload}
              />
            )}
            {tab === "categories" && (
              <CategoriesTab
                shop={shop}
                categories={data.categories.filter((c) => c.shopId === shop.id)}
                products={data.products.filter((p) => p.shopId === shop.id)}
                onChange={reload}
              />
            )}
            {tab === "shop" && <ShopSettingsTab shop={shop} onChange={reload} onDeleted={() => { setShopId(""); reload(); }} />}
          </>
        )}
      </main>
    </div>
  );
}

// ───────── shared atoms ─────────
function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-bear-gold text-bear-gold" : "border-transparent text-bear-text/60 hover:text-white"
      }`}
    >
      {icon} {children}
    </button>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="ml-1 px-1.5 py-0.5 rounded-full bg-bear-gold text-black text-[10px] font-bold">{children}</span>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm focus:border-bear-gold/50 focus:outline-none ${props.className || ""}`} />;
}

// ───────── Site settings ─────────
function SiteSettings({ settings, onSaved }: { settings: Settings; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteTagline, setSiteTagline] = useState(settings.siteTagline);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteName, siteTagline }),
    });
    setOpen(false);
    onSaved();
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mt-2 flex items-center gap-1.5 text-xs text-bear-subtle hover:text-bear-gold justify-center">
        <Cog size={13} /> ตั้งค่าเว็บ
      </button>
    );

  return (
    <div className="mt-3 glass rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-bear-subtle">ตั้งค่าเว็บ</p>
      <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="ชื่อเว็บ" className="w-full" />
      <Input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="คำโปรย" className="w-full" />
      <div className="flex gap-2">
        <button onClick={save} className="flex-1 bg-bear-gold text-black text-xs font-bold py-1.5 rounded-lg">บันทึก</button>
        <button onClick={() => setOpen(false)} className="px-3 text-xs text-bear-subtle">ยกเลิก</button>
      </div>
    </div>
  );
}

// ───────── Orders ─────────
function OrdersTab({ orders, onChange }: { orders: Order[]; onChange: () => void }) {
  const [viewSlip, setViewSlip] = useState<string>("");

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChange();
  }

  if (orders.length === 0) return <Empty>ยังไม่มีออเดอร์</Empty>;

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="glass rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono font-bold text-bear-gold">{o.code}</span>
              <span className="text-xs text-bear-subtle ml-2">
                {new Date(o.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <select
              value={o.status}
              onChange={(e) => setStatus(o.id, e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              {["pending", "paid", "shipped", "cancelled"].map((s) => (
                <option key={s} value={s}>{STATUS_TH[s]}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <div className="text-sm space-y-1">
              <p className="font-semibold">{o.customerName} · {o.phone}</p>
              <p className="text-bear-text/60 whitespace-pre-wrap">{o.address}</p>
              {o.note && <p className="text-xs text-bear-subtle">หมายเหตุ: {o.note}</p>}
              <div className="pt-2 space-y-0.5">
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{it.name} × {it.qty}</span>
                    <span>{baht(it.price * it.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-white/6 mt-1">
                  <span>รวม</span><span className="text-bear-gold">{baht(o.total)}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-bear-subtle mb-1">สลิปการโอน</p>
              {o.slip ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(o.slip)}
                  alt="slip"
                  onClick={() => setViewSlip(mediaUrl(o.slip))}
                  className="max-h-48 rounded-lg cursor-zoom-in bg-black/40 object-contain"
                />
              ) : (
                <p className="text-xs text-bear-subtle">— ไม่มีสลิป —</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {viewSlip && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6" onClick={() => setViewSlip("")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewSlip} alt="slip full" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

// ───────── Products ─────────
function ProductsTab({ shop, categories, products, onChange }: {
  shop: Shop; categories: Category[]; products: Product[]; onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);

  async function del(id: string) {
    if (!confirm("ลบสินค้านี้?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    onChange();
  }
  async function patchStock(p: Product, delta: number) {
    const fd = new FormData();
    fd.append("stock", String(Math.max(0, p.stock + delta)));
    await fetch(`/api/admin/products/${p.id}`, { method: "PUT", body: fd });
    onChange();
  }
  async function toggleActive(p: Product) {
    const fd = new FormData();
    fd.append("active", String(!p.active));
    await fetch(`/api/admin/products/${p.id}`, { method: "PUT", body: fd });
    onChange();
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "—";

  if (categories.length === 0) {
    return <Empty>กรุณาเพิ่มหมวดหมู่ก่อน (แท็บ “หมวดหมู่”) แล้วจึงเพิ่มสินค้า</Empty>;
  }

  return (
    <div className="space-y-3">
      {products.length === 0 && <Empty>ยังไม่มีสินค้าในร้านนี้</Empty>}

      {products.map((p) => (
        <div key={p.id} className="glass rounded-2xl p-3 flex gap-3 items-center">
          <div className="w-16 h-16 rounded-lg bg-black/40 shrink-0 flex items-center justify-center overflow-hidden">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6 text-white/15" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{p.name}</p>
              {!p.active && <span className="text-[10px] text-bear-subtle border border-white/10 rounded px-1">ซ่อน</span>}
            </div>
            <p className="text-xs text-bear-subtle">{catName(p.categoryId)} · {baht(p.price)}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <button onClick={() => patchStock(p, -1)} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-sm">−</button>
              <span className="text-sm font-bold w-14 text-center">สต็อก {p.stock}</span>
              <button onClick={() => patchStock(p, +1)} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-sm">+</button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button onClick={() => toggleActive(p)} className="text-xs text-bear-subtle hover:text-bear-gold">
              {p.active ? "ซ่อน" : "แสดง"}
            </button>
            <EditProduct product={p} categories={categories} onChange={onChange} />
            <button onClick={() => del(p.id)} className="text-bear-subtle hover:text-bear-danger self-center">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <ProductForm shop={shop} categories={categories} onDone={() => { setAdding(false); onChange(); }} onCancel={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-bear-gold/30 text-bear-gold text-sm font-semibold hover:bg-bear-gold/10"
        >
          <Plus size={16} /> เพิ่มสินค้า
        </button>
      )}
    </div>
  );
}

function ProductForm({ shop, categories, onDone, onCancel, product }: {
  shop: Shop; categories: Category[]; onDone: () => void; onCancel: () => void; product?: Product;
}) {
  const [name, setName] = useState(product?.name || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [description, setDescription] = useState(product?.description || "");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("shopId", shop.id);
    fd.append("categoryId", categoryId);
    fd.append("name", name.trim());
    fd.append("price", price || "0");
    fd.append("stock", stock || "0");
    fd.append("description", description);
    if (image) fd.append("image", image);

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    await fetch(url, { method: product ? "PUT" : "POST", body: fd });
    setSaving(false);
    onDone();
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <p className="font-semibold text-sm">{product ? "แก้ไขสินค้า" : "สินค้าใหม่"}</p>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อสินค้า" className="w-full" />
      <div className="grid grid-cols-2 gap-3">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm focus:outline-none">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ราคา (บาท)" type="number" className="w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="จำนวนสต็อก" type="number" className="w-full" />
        <label className="flex items-center gap-2 text-xs text-bear-subtle bg-black/40 border border-white/8 rounded-lg px-3 py-2 cursor-pointer">
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
          {image ? image.name.slice(0, 18) : "เลือกรูปสินค้า"}
        </label>
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="รายละเอียด (ถ้ามี)"
        className="w-full bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="flex-1 bg-bear-gold text-black text-sm font-bold py-2 rounded-lg disabled:opacity-50">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button onClick={onCancel} className="px-4 text-sm text-bear-subtle">ยกเลิก</button>
      </div>
    </div>
  );
}

function EditProduct({ product, categories, onChange }: { product: Product; categories: Category[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  if (open)
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5" onClick={() => setOpen(false)}>
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <ProductForm
            shop={{ id: product.shopId } as Shop}
            categories={categories}
            product={product}
            onDone={() => { setOpen(false); onChange(); }}
            onCancel={() => setOpen(false)}
          />
        </div>
      </div>
    );
  return (
    <button onClick={() => setOpen(true)} className="text-bear-subtle hover:text-bear-gold self-center">
      <Pencil size={15} />
    </button>
  );
}

// ───────── Categories ─────────
function CategoriesTab({ shop, categories, products, onChange }: {
  shop: Shop; categories: Category[]; products: Product[]; onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string>("");
  const [editName, setEditName] = useState("");

  async function add() {
    if (!name.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: shop.id, name: name.trim() }),
    });
    setName("");
    onChange();
  }
  async function rename(id: string) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditing("");
    onChange();
  }
  async function del(id: string) {
    const count = products.filter((p) => p.categoryId === id).length;
    if (count > 0) return alert(`มีสินค้า ${count} รายการในหมวดนี้ — ย้าย/ลบสินค้าก่อน`);
    if (!confirm("ลบหมวดนี้?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <div key={c.id} className="glass rounded-xl p-3 flex items-center gap-3">
          <Tag size={15} className="text-bear-gold" />
          {editing === c.id ? (
            <>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
              <button onClick={() => rename(c.id)} className="text-bear-gold"><Check size={16} /></button>
              <button onClick={() => setEditing("")} className="text-bear-subtle"><X size={16} /></button>
            </>
          ) : (
            <>
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-bear-subtle">{products.filter((p) => p.categoryId === c.id).length} รายการ</span>
              <button onClick={() => { setEditing(c.id); setEditName(c.name); }} className="text-bear-subtle hover:text-bear-gold"><Pencil size={14} /></button>
              <button onClick={() => del(c.id)} className="text-bear-subtle hover:text-bear-danger"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="ชื่อหมวดใหม่ เช่น กำยาน" className="flex-1" />
        <button onClick={add} className="bg-bear-gold text-black text-sm font-bold px-4 rounded-lg">เพิ่ม</button>
      </div>
    </div>
  );
}

// ───────── Shop settings ─────────
function ShopSettingsTab({ shop, onChange, onDeleted }: { shop: Shop; onChange: () => void; onDeleted: () => void }) {
  const [f, setF] = useState({
    name: shop.name, description: shop.description,
    promptpayId: shop.promptpayId, promptpayName: shop.promptpayName,
    shippingNote: shop.shippingNote, active: shop.active,
  });
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch(`/api/admin/shops/${shop.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onChange();
  }
  async function del() {
    if (!confirm(`ลบร้าน "${shop.name}"? สินค้าและหมวดหมู่ทั้งหมดจะถูกลบ (ออเดอร์เก่ายังเก็บไว้)`)) return;
    await fetch(`/api/admin/shops/${shop.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4 max-w-lg">
      <Row label="ชื่อร้าน">
        <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="w-full" />
      </Row>
      <Row label="คำอธิบายร้าน">
        <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2}
          className="w-full bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
      </Row>
      <div className="border-t border-white/6 pt-4">
        <p className="text-xs font-semibold text-bear-gold mb-3">การรับเงิน (PromptPay)</p>
        <Row label="พร้อมเพย์ (เบอร์/เลขบัตร ปชช./e-Wallet)">
          <Input value={f.promptpayId} onChange={(e) => setF({ ...f, promptpayId: e.target.value })} placeholder="0812345678" className="w-full" />
        </Row>
        <Row label="ชื่อบัญชี (แสดงให้ลูกค้า)">
          <Input value={f.promptpayName} onChange={(e) => setF({ ...f, promptpayName: e.target.value })} className="w-full" />
        </Row>
      </div>
      <Row label="ข้อความแจ้งลูกค้า (เช่น รอบจัดส่ง)">
        <textarea value={f.shippingNote} onChange={(e) => setF({ ...f, shippingNote: e.target.value })} rows={2}
          className="w-full bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
      </Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
        เปิดร้าน (แสดงบนหน้าเว็บ)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} className="bg-bear-gold text-black text-sm font-bold px-6 py-2 rounded-lg">
          {saved ? "บันทึกแล้ว ✓" : "บันทึก"}
        </button>
        <button onClick={del} className="text-sm text-bear-danger hover:underline ml-auto">ลบร้านนี้</button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-bear-subtle">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-2xl p-10 text-center text-bear-subtle text-sm">{children}</div>;
}
