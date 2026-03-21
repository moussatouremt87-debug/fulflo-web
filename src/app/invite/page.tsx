"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface CustomerData {
  referral_code: string;
  invite_count: number;
  credit_active: number;
  credit_pending: number;
}

const BASE_URL = "https://fulflo.app";

function InviteContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lookupEmail, setLookupEmail] = useState(email);
  const [inputEmail, setInputEmail] = useState(email);

  const fetchData = useCallback(async (e: string) => {
    if (!e) { setLoading(false); return; }
    setLoading(true);
    const res = await fetch(`/api/referral?email=${encodeURIComponent(e)}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(lookupEmail);
  }, [lookupEmail, fetchData]);

  const referralLink = data ? `${BASE_URL}/ref/${data.referral_code}` : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      await navigator.share({
        title: "Fulflo — €5 offerts",
        text: "J'utilise Fulflo pour acheter des grandes marques à -40% à -70%. Rejoins-moi et on reçoit tous les deux €5 de crédit !",
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupEmail(inputEmail);
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <a href="/" className="block text-center text-3xl font-bold text-forest mb-10 tracking-tight">
          fulflo<span className="text-mint">.</span>
        </a>

        <h1 className="text-3xl font-bold text-forest text-center mb-2">
          Invitez vos amis 🎁
        </h1>
        <p className="text-text-mid text-center mb-8">
          Vous et votre ami recevez chacun <span className="font-bold text-forest">€5 de crédit</span> à chaque invitation acceptée.
        </p>

        {/* Email lookup if no data */}
        {!data && !loading && (
          <form onSubmit={handleLookup} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <p className="text-sm text-text-mid mb-3">Entrez votre email pour voir votre lien :</p>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-mint-light focus:outline-none focus:ring-2 focus:ring-mint text-sm text-forest"
              />
              <button
                type="submit"
                className="bg-forest text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-forest-mid transition-colors"
              >
                Voir
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="text-center py-12 text-text-mid text-sm">Chargement…</div>
        )}

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { value: data.invite_count, label: "Amis invités", icon: "👥" },
                {
                  value: `€${(data.credit_active + data.credit_pending).toFixed(0)}`,
                  label: "Crédits gagnés",
                  icon: "💶",
                },
                {
                  value: `€${data.credit_active.toFixed(0)}`,
                  label: "Disponibles",
                  icon: "✅",
                },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-2xl font-bold text-forest">{s.value}</p>
                  <p className="text-xs text-text-mid mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Referral link card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <p className="text-xs font-bold text-text-mid uppercase tracking-wider mb-3">
                Votre lien personnel
              </p>

              {/* Link display */}
              <div className="flex items-center gap-2 bg-surface rounded-xl px-4 py-3 mb-4">
                <span className="flex-1 text-sm text-forest font-mono truncate">
                  {referralLink}
                </span>
                <span className="shrink-0 bg-mint-light text-text-dark text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.referral_code}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-surface text-forest font-semibold py-3 rounded-xl text-sm hover:bg-mint-light transition-colors border border-mint-light"
                >
                  {copied ? "✅ Copié !" : "📋 Copier le lien"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-forest text-white font-semibold py-3 rounded-xl text-sm hover:bg-forest-mid transition-colors"
                >
                  🔗 Partager
                </button>
              </div>
            </div>

            {/* WhatsApp / social share */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <p className="text-xs font-bold text-text-mid uppercase tracking-wider mb-3">
                Partager via
              </p>
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`J'utilise Fulflo pour acheter des grandes marques à -70%. On reçoit tous les deux €5 de crédit : ${referralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 bg-green-50 hover:bg-green-100 rounded-xl py-3 transition-colors"
                >
                  <span className="text-2xl">💬</span>
                  <span className="text-xs font-semibold text-green-700">WhatsApp</span>
                </a>
                <a
                  href={`mailto:?subject=€5 offerts chez Fulflo&body=Salut, je t'invite sur Fulflo — grandes marques à -70% sur le surplus fabricant. On reçoit chacun €5 de crédit : ${referralLink}`}
                  className="flex flex-col items-center gap-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl py-3 transition-colors"
                >
                  <span className="text-2xl">📧</span>
                  <span className="text-xs font-semibold text-blue-700">Email</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("€5 de crédit sur Fulflo — grandes marques à -70% !")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 bg-sky-50 hover:bg-sky-100 rounded-xl py-3 transition-colors"
                >
                  <span className="text-2xl">✈️</span>
                  <span className="text-xs font-semibold text-sky-700">Telegram</span>
                </a>
              </div>
            </div>

            {/* Pending credit notice */}
            {data.credit_pending > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 flex items-start gap-3">
                <span className="text-xl shrink-0">⏳</span>
                <div>
                  <p className="font-semibold mb-0.5">€{data.credit_pending.toFixed(2)} en attente</p>
                  <p className="text-xs opacity-80">Activé automatiquement à votre première commande.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* How it works */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold text-text-mid uppercase tracking-wider mb-4">Comment ça marche</p>
          <div className="space-y-3">
            {[
              { n: "01", text: "Partagez votre lien personnel avec vos amis" },
              { n: "02", text: "Ils s'inscrivent et reçoivent €5 de crédit" },
              { n: "03", text: "Vous recevez aussi €5 — activés à leur première commande" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-forest text-mint text-xs font-bold flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <p className="text-sm text-text-mid pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-text-mid text-sm">Chargement…</div>}>
      <InviteContent />
    </Suspense>
  );
}
