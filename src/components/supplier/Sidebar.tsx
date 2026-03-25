"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { supabaseBrowser } from "@/lib/supabase";
import { Share2, Package } from "lucide-react";

const NAV = [
  { key: "dashboard",   icon: "📊",  href: "/supplier/dashboard",  lucide: null },
  { key: "products",    icon: "📦",  href: "/supplier/products",   lucide: null },
  { key: "campaigns",   icon: "📢",  href: "/supplier/campaigns",  lucide: null },
  { key: "flash-sales", icon: "⚡",  href: "/supplier/flash-sales", lucide: null },
  { key: "analytics",  icon: "📈",  href: "/supplier/analytics",  lucide: null },
  { key: "impact",     icon: "🌱",  href: "/supplier/impact",     lucide: null },
  { key: "ripple",     icon: null,  href: "/supplier/ripple",     lucide: "share2" },
  { key: "bundles",    icon: null,  href: "/supplier/bundles",    lucide: "package" },
] as const;

export default function Sidebar() {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseBrowser().auth.signOut();
    sessionStorage.removeItem("supplier_session");
    router.push("/supplier/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-[#1B4332] flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <a href="/" className="text-xl font-bold text-white tracking-tight">
          fulflo<span className="text-[#10B981]">.</span>
          <span className="ml-2 text-xs text-white/40 font-normal">{t("supplier.sidebar.title")}</span>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <a
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-[#10B981] text-[#1B4332]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.lucide === "share2" ? <Share2 size={16} /> : item.lucide === "package" ? <Package size={16} /> : <span>{item.icon}</span>}
              {t(`nav.${item.key}`)}
            </a>
          );
        })}
      </nav>

      {/* Language switcher */}
      <div className="px-4 pb-4">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-2 px-1">Langue</p>
        <div className="grid grid-cols-2 gap-1">
          {([
            { code: "fr" as const, flag: "🇫🇷", label: "FR" },
            { code: "en" as const, flag: "🇬🇧", label: "EN" },
            { code: "de" as const, flag: "🇩🇪", label: "DE" },
            { code: "ar" as const, flag: "🇸🇦", label: "AR" },
          ]).map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                lang === code
                  ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span>{flag}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <span>↩</span>
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
