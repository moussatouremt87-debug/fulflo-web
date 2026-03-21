"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n, LOCALES } from "@/lib/i18n";

const DEMO_EMAIL    = "demo@nestle.com";
const DEMO_PASSWORD = "Fulflo2026!";
const DEMO_COMPANY  = "Nestlé Suisse SA";

export default function SupplierLogin() {
  const { t, locale, setLocale, dir } = useI18n();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleDemoLogin = () => {
    localStorage.setItem("fulflo_demo_supplier", JSON.stringify({
      id: "demo-nestle",
      company_name: "Nestlé Suisse SA",
      contact_name: "Demo User",
      email: "demo@nestle.com",
      isDemo: true,
    }));
    sessionStorage.setItem(
      "supplier_session",
      JSON.stringify({ email: DEMO_EMAIL, company: DEMO_COMPANY, role: "supplier" })
    );
    window.location.href = "/supplier/dashboard";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800)); // simulate auth

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      handleDemoLogin();
      return;
    } else {
      // Try Supabase auth
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key && key !== "placeholder") {
          const { createClient } = await import("@supabase/supabase-js");
          const sb = createClient(url, key);
          const { data, error: authErr } = await sb.auth.signInWithPassword({ email, password });
          if (!authErr && data.user) {
            const { data: supplier } = await sb
              .from("suppliers")
              .select("company_name, email")
              .eq("user_id", data.user.id)
              .single();
            sessionStorage.setItem(
              "supplier_session",
              JSON.stringify({ email, company: supplier?.company_name ?? email, role: "supplier" })
            );
            router.push("/supplier/dashboard");
            return;
          }
        }
      } catch { /* fall through */ }
      setError(t("login.error"));
    }
    setLoading(false);
  };


  return (
    <div dir={dir} className="min-h-screen bg-[#F0FDF4] flex flex-col">
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-8">
        <a href="/" className="text-xl font-bold text-[#1B4332]">
          fulflo<span className="text-[#10B981]">.</span>
        </a>
        {/* Language pills */}
        <div className="flex items-center gap-1">
          {LOCALES.map((l) => (
            <button
              key={l.key}
              onClick={() => setLocale(l.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                locale === l.key
                  ? "bg-[#1B4332] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {l.flag} {l.key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B4332] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              📦
            </div>
            <h1 className="text-2xl font-bold text-[#1B4332]">{t("login.title")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("login.subtitle")}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* Demo banner */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full mb-5 py-2.5 rounded-xl border-2 border-dashed border-[#10B981] text-[#065F46] text-sm font-semibold hover:bg-[#ecfdf5] transition-colors flex items-center justify-center gap-2"
            >
              🎯 {t("login.demo")}
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">ou</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                  placeholder="vous@entreprise.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t("login.password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <div className="flex justify-end mt-1.5">
                  <a href="#" className="text-xs text-[#10B981] hover:underline">
                    {t("login.forgotPassword")}
                  </a>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl hover:bg-[#2d6a4f] transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {loading ? t("common.loading") : t("login.submit")}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            fulflo. · Portail Fournisseur Certifié · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
