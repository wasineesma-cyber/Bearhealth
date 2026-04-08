"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Moon, Zap, TrendingUp,
  Heart, Activity, Settings, Watch, Languages, Menu, X,
} from "lucide-react";
import { clsx } from "clsx";
import { useLang } from "@/hooks/useLang";

const NAV = [
  { href: "/",          icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/recovery",  icon: Heart,            key: "recovery"  as const },
  { href: "/sleep",     icon: Moon,             key: "sleep"     as const },
  { href: "/activity",  icon: Activity,         key: "activity"  as const },
  { href: "/trends",    icon: TrendingUp,       key: "trends"    as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLang();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bear-recovery to-emerald-400 flex items-center justify-center shadow-lg shadow-bear-recovery/30">
            <Watch className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="font-bold text-base tracking-tight">BearHealth</p>
            <p className="text-[11px] text-bear-subtle">Analytics Pro</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bear-sleep to-purple-400 flex items-center justify-center font-bold text-sm shadow-lg">
            WN
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">Wasinee S.</p>
            <p className="text-xs text-bear-subtle">{t.common.premium}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-bear-recovery animate-pulse" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-bear-subtle px-3 mb-3 uppercase tracking-widest">
          Analytics
        </p>
        {NAV.map(({ href, icon: Icon, key }) => {
          const active = pathname === href;
          const label = t.nav[key];
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "glass text-bear-text shadow-sm"
                  : "text-bear-subtle hover:text-bear-text hover:bg-white/5"
              )}
            >
              <Icon
                size={18}
                className={clsx(active ? "text-bear-recovery" : "text-inherit")}
              />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-bear-recovery" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/8 space-y-1">
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-bear-subtle hover:text-bear-text hover:bg-white/5 transition-all"
        >
          <Languages size={16} />
          <span>{lang === "th" ? "🇹🇭 ภาษาไทย" : "🇬🇧 English"}</span>
          <span className="ml-auto text-xs opacity-50">{lang === "th" ? "EN" : "TH"}</span>
        </button>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-bear-subtle">
            <Zap size={12} className="text-bear-warning" />
            <span>{t.common.syncedAgo} 2{t.common.minsAgo}</span>
          </div>
          <button className="text-bear-subtle hover:text-bear-text transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen flex-col glass-strong border-r border-white/8 relative z-20">
        <NavContent />
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={clsx(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col glass-strong border-r border-white/8 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg glass flex items-center justify-center"
        >
          <X size={16} />
        </button>
        <NavContent />
      </aside>
    </>
  );
}
