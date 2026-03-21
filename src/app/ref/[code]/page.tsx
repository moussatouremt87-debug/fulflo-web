"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string ?? "").toUpperCase();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  // Validate referral code on mount
  useEffect(() => {
    if (!code) return;
    fetch(`/api/referral?code=${code}`)
      .then((r) => setReferralValid(r.ok))
      .catch(() => setReferralValid(false));
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referral_code: code }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setStatus("success");
      // Redirect to invite page after 2s
      setTimeout(() => {
        router.push(`/invite?email=${encodeURIComponent(email)}`);
      }, 2000);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <a href="/" className="text-3xl font-bold text-forest mb-12 tracking-tight">
        fulflo<span className="text-mint">.</span>
      </a>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
        {/* Gift badge */}
        <div className="w-16 h-16 bg-mint-light rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎁</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-mint-light text-text-dark text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-mint" />
          INVITATION PERSONNELLE
        </div>

        <h1 className="text-3xl font-bold text-forest mb-3 leading-tight">
          Votre ami vous offre<br />
          <span className="text-mint">€5 de crédit</span>
        </h1>

        <p className="text-text-mid mb-2 leading-relaxed">
          Inscrivez-vous avec ce lien d&apos;invitation et recevez <strong>€5</strong> de crédit sur votre première commande. Votre ami en reçoit aussi.
        </p>

        {referralValid === false && (
          <p className="text-xs text-red-500 mb-4">
            Ce lien d&apos;invitation a expiré ou est invalide.
          </p>
        )}

        {/* Code display */}
        <div className="bg-surface rounded-xl px-4 py-2 mb-6 inline-flex items-center gap-2">
          <span className="text-xs text-text-mid">Code:</span>
          <span className="font-mono font-bold text-forest tracking-widest">{code}</span>
        </div>

        {status === "success" ? (
          <div className="bg-mint-light text-text-dark rounded-2xl p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-forest text-lg mb-1">Bienvenue chez Fulflo !</p>
            <p className="text-sm text-text-mid">€5 de crédit ajouté. Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email..."
              className="w-full px-4 py-3 rounded-xl border border-mint-light bg-white text-forest placeholder:text-text-mid/50 focus:outline-none focus:ring-2 focus:ring-mint text-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-forest text-white font-bold py-3.5 rounded-xl hover:bg-forest-mid transition-colors text-sm disabled:opacity-60"
            >
              {status === "loading" ? "Inscription…" : "Réclamer mes €5 →"}
            </button>
            {status === "error" && (
              <p className="text-xs text-red-500">Une erreur s&apos;est produite. Réessayez.</p>
            )}
          </form>
        )}

        <p className="text-xs text-text-mid mt-4 opacity-60">
          Crédit activé à la première commande · Sans engagement
        </p>
      </div>

      {/* Value props */}
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md w-full text-center">
        {[
          { icon: "🏭", label: "Surplus fabricant" },
          { icon: "✅", label: "100% authentique" },
          { icon: "🚚", label: "Livraison 24h" },
        ].map((p) => (
          <div key={p.label} className="bg-white rounded-2xl py-4 px-2 shadow-sm">
            <div className="text-2xl mb-1">{p.icon}</div>
            <p className="text-xs text-text-mid font-medium">{p.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
