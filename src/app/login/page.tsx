"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Watch, Chrome } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/");
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background glow blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-bear-recovery opacity-10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-bear-sleep opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 flex flex-col items-center gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bear-recovery to-emerald-400 flex items-center justify-center shadow-2xl shadow-bear-recovery/40">
              <Watch size={30} className="text-black" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">BearHealth</h1>
              <p className="text-bear-subtle text-sm mt-1">Analytics Pro</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/8" />

          {/* Welcome text */}
          <div className="text-center">
            <h2 className="text-lg font-semibold">ยินดีต้อนรับ</h2>
            <p className="text-bear-subtle text-sm mt-1 leading-relaxed">
              วิเคราะห์ข้อมูล smartwatch และสุขภาพ<br />
              พร้อม AI Health Coach ส่วนตัว
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl glass border border-white/15 hover:border-white/25 hover:bg-white/8 transition-all duration-200 font-medium text-sm group disabled:opacity-60"
          >
            {/* Google icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>

          {/* Footer note */}
          <p className="text-xs text-bear-subtle text-center leading-relaxed">
            ข้อมูลสุขภาพของคุณปลอดภัย<br />
            ไม่มีการแชร์กับบุคคลภายนอก
          </p>
        </div>

        {/* Feature pills */}
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
