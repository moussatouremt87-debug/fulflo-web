"use client";

import { useI18n, LOCALES } from "@/lib/i18n";

export default function LangSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.key}
          onClick={() => setLocale(l.key)}
          title={l.label}
          className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
            locale === l.key
              ? "bg-white/20 text-white font-bold"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
