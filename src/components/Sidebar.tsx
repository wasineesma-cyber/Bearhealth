"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Moon,
  Zap,
  TrendingUp,
  Heart,
  Activity,
  Settings,
  Watch,
  Languages,
} from "lucide-react";
import { clsx } from "clsx";
import { useLang } from "@/hooks/useLang";

export default function Sidebar() {
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLang();

  const navItems = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/recovery", label: t.nav.recovery, icon: Heart },
    { href: "/sleep", label: t.nav.sleep, icon: Moon },
    { href: "/activity", label: t.nav.activity, icon: Activity },
    { href: "/trends", label: t.nav.trends, icon: TrendingUp },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen bg-bear-card border-r border-bear-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-bear-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bear-recovery to-emerald-400 flex items-center justify-center">
            <Watch className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="font-bold text-base tracking-tight">BearHealth</p>
            <p className="text-xs text-bear-subtle">Analytics Pro</p>
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-bear-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bear-sleep to-purple-400 flex items-center justify-center font-bold text-sm">
            WN
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">Wasinee S.</p>
            <p className="text-xs text-bear-subtle">{t.common.premium}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-bear-recovery animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-medium text-bear-subtle px-3 mb-3 uppercase tracking-wider">
          Analytics
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-bear-muted text-bear-text"
                  : "text-bear-subtle hover:text-bear-text hover:bg-white/5"
              )}
            >
              <Icon
                className={clsx(
                  "transition-colors",
                  active ? "text-bear-recovery" : "text-inherit"
                )}
                size={18}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-bear-recovery" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-bear-border space-y-2">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-bear-subtle hover:text-bear-text hover:bg-white/5 transition-all"
        >
          <Languages size={16} />
          <span>{lang === "th" ? "🇹🇭 ภาษาไทย" : "🇬🇧 English"}</span>
          <span className="ml-auto text-xs text-bear-muted">
            {lang === "th" ? "EN" : "TH"}
          </span>
        </button>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-bear-subtle">
            <Zap size={12} className="text-bear-warning" />
            <span>
              {t.common.syncedAgo} 2{t.common.minsAgo}
            </span>
          </div>
          <button className="text-bear-subtle hover:text-bear-text transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
