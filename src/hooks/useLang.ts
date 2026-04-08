"use client";

import { useState, useEffect, useCallback } from "react";
import { th, en, type Lang, type Translations } from "@/lib/i18n";

export function useLang(): {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
} {
  // Always start with "th" — same on server + client = no hydration mismatch
  const [lang, setLang] = useState<Lang>("th");

  // Read localStorage only after mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "th") {
      setLang(stored);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "th" ? "en" : "th";
      localStorage.setItem("lang", next);
      return next;
    });
  }, []);

  return { lang, t: lang === "th" ? th : en, toggleLang };
}
