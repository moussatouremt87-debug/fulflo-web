"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser, type Customer } from "@/lib/supabase";
import { User, Copy, LogOut, ShoppingBag, Tag, Gift } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [email, setEmail]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();

    async function load() {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      setEmail(session.user.email ?? null);

      const { data } = await sb
        .from("customers")
        .select("*")
        .eq("email", session.user.email!)
        .maybeSingle();
      setCustomer(data ?? null);
      setLoading(false);
    }

    load();
  }, [router]);

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/");
  };

  const copyCode = () => {
    if (!customer?.referral_code) return;
    navigator.clipboard.writeText(`https://fulflo.app/invite?ref=${customer.referral_code}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = customer?.first_name
    ? customer.first_name
    : email?.split("@")[0] ?? "Compte";

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <nav className="bg-[#1B4332] h-14 flex items-center gap-3 px-6">
        <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
        <span className="text-white/30 ml-auto text-sm">{email}</span>
        <button onClick={signOut}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors">
          <LogOut size={14} /> Déconnexion
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-4">

        {/* Header */}
        <div className="bg-[#1B4332] rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <User size={26} className="text-[#10B981]" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-0.5">Mon compte</p>
              <p className="text-2xl font-black">Bonjour, {displayName} 👋</p>
              <p className="text-white/60 text-sm">{email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={16} className="text-[#1B4332]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commandes</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{customer?.total_orders ?? 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={16} className="text-[#10B981]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total dépensé</span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {customer?.total_spent
                ? `€${Number(customer.total_spent).toFixed(2).replace(".", ",")}`
                : "€0"}
            </p>
          </div>
        </div>

        {/* Referral */}
        {customer?.referral_code && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift size={16} className="text-[#10B981]" />
              <h2 className="font-bold text-gray-900 text-sm">Parrainez vos amis — gagnez €5 chacun</h2>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Partagez votre lien. Vous recevez €5 de crédit à leur première commande.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate">
                fulflo.app/invite?ref={customer.referral_code}
              </div>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 bg-[#10B981] text-[#1B4332] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#D1FAE5] transition-colors whitespace-nowrap">
                <Copy size={12} />
                {copied ? "Copié ✓" : "Copier"}
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        <Link href="/deals"
          className="block bg-[#1B4332] hover:bg-[#2d6a4f] text-white font-bold text-center py-3.5 rounded-xl transition-colors">
          Voir les offres surplus →
        </Link>

      </div>
    </div>
  );
}
