"use client";

import { useState, useCallback } from "react";
import { th, en, type Lang, type Translations } from "@/lib/i18n";

// Simple global state via module-level variable (works fine for single-tab use)
let globalLang: Lang =
  typeof window !== "undefined"
    ? ((localStorage.getItem("lang") as Lang) ?? "th")
    : "th";

const listeners = new Set<() => void>();

export function useLang(): {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
} {
  const [lang, setLang] = useState<Lang>(globalLang);

  const toggleLang = useCallback(() => {
    const next: Lang = globalLang === "th" ? "en" : "th";
    globalLang = next;
    localStorage.setItem("lang", next);
    setLang(next);
    listeners.forEach((fn) => fn());
  }, []);

  return {
    lang,
    t: lang === "th" ? th : en,
    toggleLang,
  };
}
