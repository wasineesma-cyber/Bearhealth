"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Watch } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Username หรือ Password ไม่ถูกต้อง");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-bear-recovery opacity-10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-bear-sleep opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="glass-strong rounded-3xl p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bear-recovery to-emerald-400 flex items-center justify-center shadow-2xl shadow-bear-recovery/40">
              <Watch size={30} className="text-black" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">BearHealth</h1>
              <p className="text-bear-subtle text-sm mt-1">Analytics Pro</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/8" />

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass border border-white/15 bg-transparent text-white placeholder-bear-subtle text-sm focus:outline-none focus:border-bear-recovery"
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass border border-white/15 bg-transparent text-white placeholder-bear-subtle text-sm focus:outline-none focus:border-bear-recovery"
              autoComplete="current-password"
            />
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-bear-recovery text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="text-xs text-bear-subtle text-center leading-relaxed">
            ข้อมูลสุขภาพของคุณปลอดภัย<br />
            ไม่มีการแชร์กับบุคคลภายนอก
          </p>
        </div>

        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {["💚 Recovery", "😴 Sleep", "⚡ Strain", "🤖 AI Coach"].map((f) => (
            <span key={f} className="glass text-xs px-3 py-1.5 rounded-full text-bear-subtle">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
