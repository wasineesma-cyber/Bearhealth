"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QrCode, Upload, CheckCircle2, Loader2, Receipt, Ban } from "lucide-react";
import { baht } from "@/lib/format";
import type { OrderItem } from "@/lib/types";

interface BillData {
  code: string;
  shopName: string;
  shopSlug: string;
  hasPromptpay: boolean;
  promptpayName: string;
  shippingNote: string;
  items: OrderItem[];
  total: number;
  status: "open" | "completed" | "cancelled";
  orderCode: string;
}

export default function BillPage() {
  const { code } = useParams<{ code: string }>();
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({ customerName: "", phone: "", address: "", note: "" });
  const [slip, setSlip] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [qr, setQr] = useState<{ qr: string; promptpayName: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string } | null>(null);

  useEffect(() => {
    fetch(`/api/bills/${code}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: BillData) => setBill(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (!bill?.hasPromptpay || !bill.shopSlug || bill.total <= 0 || bill.status !== "open") return;
    fetch(`/api/promptpay?shop=${bill.shopSlug}&amount=${bill.total}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setQr(d))
      .catch(() => {});
  }, [bill]);

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
    fd.append("customerName", form.customerName);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    fd.append("note", form.note);
    fd.append("slip", slip);
    try {
      const res = await fetch(`/api/bills/${code}/complete`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "out_of_stock"
            ? `สินค้า "${data.product}" เหลือไม่พอ (เหลือ ${data.stock})`
            : data.error?.startsWith("bill_")
            ? "บิลนี้ถูกใช้ไปแล้วหรือถูกยกเลิก"
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

  if (loading) {
    return (
      <main className="max-w-xl mx-auto px-5 py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-bear-gold" />
      </main>
    );
  }

  if (notFound || !bill) {
    return (
      <main className="max-w-xl mx-auto px-5 py-20 text-center">
        <p className="text-bear-subtle">ไม่พบบิลนี้ หรือลิงก์ไม่ถูกต้อง</p>
        <Link href="/" className="text-bear-gold text-sm mt-3 inline-block">← กลับหน้าแรก</Link>
      </main>
    );
  }

  if (done || bill.status === "completed") {
    const shownCode = done?.code || bill.orderCode;
    return (
      <main className="max-w-lg mx-auto px-5 py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-bear-gold mx-auto" />
        <h1 className="text-2xl font-bold mt-4">รับข้อมูลแล้ว!</h1>
        {shownCode && (
          <p className="text-bear-text/60 mt-2">
            หมายเลขคำสั่งซื้อ <span className="font-mono font-bold text-bear-gold">{shownCode}</span>
          </p>
        )}
        <p className="text-sm text-bear-subtle mt-4">ทางร้านจะตรวจสอบสลิปและจัดส่งให้เร็วที่สุด ขอบคุณค่ะ 🙏</p>
      </main>
    );
  }

  if (bill.status === "cancelled") {
    return (
      <main className="max-w-lg mx-auto px-5 py-20 text-center">
        <Ban className="w-14 h-14 text-bear-subtle mx-auto" />
        <h1 className="text-xl font-bold mt-4">บิลนี้ถูกยกเลิกแล้ว</h1>
        <p className="text-sm text-bear-subtle mt-2">กรุณาติดต่อร้านค้าเพื่อขอบิลใหม่</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-8 pb-16">
      <div className="flex items-center gap-2 text-bear-gold mb-1">
        <Receipt size={18} />
        <span className="text-sm font-semibold uppercase tracking-widest">บิลค่าสินค้า</span>
      </div>
      <h1 className="text-2xl font-bold">{bill.shopName}</h1>
      <p className="text-xs text-bear-subtle mb-6">บิล #{bill.code}</p>

      {/* Items */}
      <section className="glass rounded-2xl p-5 mb-5">
        <div className="space-y-2">
          {bill.items.map((it, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-bear-text/80">{it.name} <span className="text-bear-subtle">× {it.qty}</span></span>
              <span>{baht(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/6 mt-3 pt-3 flex justify-between font-bold">
          <span>รวมทั้งหมด</span>
          <span className="text-bear-gold">{baht(bill.total)}</span>
        </div>
      </section>

      {/* Shipping */}
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
        {bill.hasPromptpay && qr ? (
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.qr} alt="PromptPay QR" className="w-56 h-56 rounded-xl bg-white p-2" />
            {qr.promptpayName && <p className="mt-2 text-sm">{qr.promptpayName}</p>}
            <p className="text-bear-gold font-bold text-lg mt-1">{baht(bill.total)}</p>
            <p className="text-xs text-bear-subtle mt-1">สแกนด้วยแอปธนาคารเพื่อชำระเงิน</p>
          </div>
        ) : bill.hasPromptpay ? (
          <p className="text-sm text-bear-subtle text-center py-4">กำลังสร้าง QR...</p>
        ) : (
          <p className="text-sm text-bear-subtle text-center py-4">
            ร้านยังไม่ได้ตั้งค่า PromptPay — กรุณาติดต่อร้านเพื่อรับข้อมูลการชำระเงิน
          </p>
        )}
      </section>

      {/* Slip */}
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
        {submitting ? "กำลังส่ง..." : `ยืนยัน · ${baht(bill.total)}`}
      </button>

      {bill.shippingNote && <p className="text-xs text-bear-subtle text-center mt-4">{bill.shippingNote}</p>}
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
