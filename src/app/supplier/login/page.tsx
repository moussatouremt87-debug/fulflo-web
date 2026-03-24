"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n, LOCALES } from "@/lib/i18n";
import { supabaseBrowser } from "@/lib/supabase";

export default function SupplierLogin() {
  const { t, locale, setLocale, dir } = useI18n();
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sb = supabaseBrowser();
    const { data, error: authErr } = await sb.auth.signInWithPassword({ email, password });

    if (authErr || !data.session) {
      setError(t("login.error"));
      setLoading(false);
      return;
    }

    // Store minimal session info for UI display
    const meta = data.user?.user_metadata ?? {};
    sessionStorage.setItem(
      "supplier_session",
      JSON.stringify({
        email:      data.user?.email,
        company:    meta.company ?? email,
        role:       "supplier",
        supplier_id: meta.supplier_id ?? "unknown",
      })
    );

    router.push("/supplier/dashboard");
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B4332] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              📦
            </div>
            <h1 className="text-2xl font-bold text-[#1B4332]">{t("login.title")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("login.subtitle")}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
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
                  autoComplete="email"
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
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition"
                  placeholder="••••••••"
                />
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

            <p className="text-center text-xs text-gray-400 mt-6">
              Première connexion ? Contactez{" "}
              <a href="mailto:ops@fulflo.app" className="text-[#10B981] hover:underline">
                ops@fulflo.app
              </a>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            fulflo. · {t("supplier.portal")} · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
