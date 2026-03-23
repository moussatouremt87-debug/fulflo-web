"use client";

import { useI18n } from "@/lib/i18n";

export default function LangSwitcher() {
  const { lang, setLang } = useI18n();

  const LANGS = [
    { code: "fr" as const, flag: "🇫🇷", label: "Français" },
    { code: "en" as const, flag: "🇬🇧", label: "English"  },
    { code: "de" as const, flag: "🇩🇪", label: "Deutsch"  },
    { code: "ar" as const, flag: "🇸🇦", label: "العربية"  },
  ];

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setLang("fr")} title="Français"
        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${lang === "fr" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white/80"}`}>
        🇫🇷
      </button>
      <button onClick={() => setLang("en")} title="English"
        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${lang === "en" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white/80"}`}>
        🇬🇧
      </button>
      <button onClick={() => setLang("de")} title="Deutsch"
        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${lang === "de" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white/80"}`}>
        🇩🇪
      </button>
      <button onClick={() => setLang("ar")} title="العربية"
        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${lang === "ar" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white/80"}`}>
        🇸🇦
      </button>
    </div>
  );
}
