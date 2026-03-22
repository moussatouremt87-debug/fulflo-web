"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]         = useState<"password" | "magic">("password");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message === "Invalid login credentials"
        ? "Email ou mot de passe incorrect."
        : err.message);
      setLoading(false);
      return;
    }
    router.push("/account");
  };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/account` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <nav className="bg-[#1B4332] h-14 flex items-center px-6">
        <Link href="/" className="text-xl font-black text-white tracking-tight">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Connexion</h1>
          <p className="text-sm text-gray-500 mb-6">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-[#1B4332] font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>

          {/* Tabs */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 mb-6 gap-1">
            {(["password", "magic"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSent(false); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-md transition-colors ${
                  tab === t ? "bg-[#1B4332] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "password" ? "Mot de passe" : "Lien magique"}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail size={22} className="text-[#10B981]" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Vérifiez votre boîte mail</p>
                <p className="text-sm text-gray-500">
                  Lien envoyé à <span className="font-semibold">{email}</span>.
                  Cliquez dessus pour vous connecter.
                </p>
              </div>
            ) : tab === "password" ? (
              <form onSubmit={handlePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1B4332] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={show ? "text" : "password"} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1B4332] transition-colors"
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#1B4332] hover:bg-[#2d6a4f] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                  {loading ? "Connexion…" : "Se connecter →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagic} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1B4332] transition-colors"
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#1B4332] hover:bg-[#2d6a4f] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                  {loading ? "Envoi…" : "Envoyer le lien magique →"}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Sans mot de passe — un lien sécurisé vous sera envoyé par email.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
