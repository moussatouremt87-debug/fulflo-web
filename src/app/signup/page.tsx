"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [show, setShow]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Mot de passe : 8 caractères minimum."); return; }
    setLoading(true);
    setError("");

    // 1. Create Supabase Auth user
    const { data, error: authErr } = await supabaseBrowser().auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    });

    if (authErr) {
      setError(authErr.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : authErr.message);
      setLoading(false);
      return;
    }

    // 2. Create customer record in public.customers table
    if (data.user) {
      await supabaseBrowser()
        .from("customers")
        .upsert({
          email:        email.toLowerCase(),
          first_name:   firstName || null,
          referral_code: generateCode(),
        }, { onConflict: "email" });
    }

    router.push("/account");
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
          <h1 className="text-2xl font-black text-gray-900 mb-1">Créer un compte</h1>
          <p className="text-sm text-gray-500 mb-6">
            Déjà client ?{" "}
            <Link href="/login" className="text-[#1B4332] font-semibold hover:underline">
              Se connecter
            </Link>
          </p>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Prénom
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Marie"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1B4332] transition-colors"
                  />
                </div>
              </div>

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
                    placeholder="8 caractères minimum"
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
                className="w-full bg-[#1B4332] hover:bg-[#2d6a4f] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                {loading ? "Création…" : "Créer mon compte →"}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                En créant un compte, vous acceptez nos{" "}
                <Link href="/terms" className="underline">conditions d&apos;utilisation</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
