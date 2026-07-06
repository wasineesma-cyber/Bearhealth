"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("รหัสผ่านไม่ถูกต้อง");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-black border border-bear-gold/25 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-5 h-5 text-bear-gold" />
        </div>
        <h1 className="text-xl font-bold text-center">เข้าสู่ระบบร้านค้า</h1>
        <p className="text-sm text-bear-subtle text-center mt-1 mb-6">สำหรับผู้ดูแลร้านเท่านั้น</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="รหัสผ่าน"
          autoFocus
          className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-sm focus:border-bear-gold/50 focus:outline-none"
        />
        {error && <p className="text-bear-danger text-sm mt-3 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-bear-gold text-black font-bold py-2.5 rounded-xl hover:bg-bear-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          เข้าสู่ระบบ
        </button>
      </form>
    </main>
  );
}
