"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser, type Customer } from "@/lib/supabase";
import {
  ChevronLeft, Copy, LogOut, ShoppingBag, Tag, Gift,
  ChevronRight, Bell, MapPin, CreditCard, HelpCircle, Star,
} from "lucide-react";

const MENU_SECTIONS = [
  {
    title: "COMMANDES",
    items: [
      { icon: "📦", color: "#1D4D35", label: "Mes commandes", href: "/deals" },
      { icon: "❤️", color: "#DC2626", label: "Mes favoris",   href: "/deals" },
    ],
  },
  {
    title: "COMPTE",
    items: [
      { icon: "⭐", color: "#F4A623", label: "FulFlo Pass", href: "/membership", badge: "PREMIUM" },
      { icon: "💳", color: "#1E40AF", label: "Paiements",      href: "#" },
      { icon: "📍", color: "#7C3AED", label: "Adresses",        href: "#" },
      { icon: "🎁", color: "#059669", label: "Mon code parrainage", href: "#" },
      { icon: "🌐", color: "#0284C7", label: "Langue",          href: "#" },
      { icon: "🔔", color: "#F4A623", label: "Notifications",   href: "#" },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { icon: "❓", color: "#4A6155", label: "Aide & Contact",  href: "#" },
      { icon: "⚙️", color: "#6B8070", label: "Paramètres",     href: "#" },
    ],
  },
];

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
      const { data } = await sb.from("customers").select("*").eq("email", session.user.email!).maybeSingle();
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
      <div className="max-w-sm mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = customer?.first_name ? customer.first_name : email?.split("@")[0] ?? "Compte";
  const totalOrders = customer?.total_orders ?? 0;
  const totalSpent  = Number(customer?.total_spent ?? 0);
  const totalSavings = totalSpent * 0.35; // estimated 35% savings
  const ecoKg = Math.round(totalSpent * 0.4);
  const loyaltyPoints = Math.round(totalSpent * 10);
  const loyaltyProgress = Math.min(100, (loyaltyPoints % 1000) / 10);
  const memberSince = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;
  const tierLabel = loyaltyPoints >= 5000 ? "Platinum" : loyaltyPoints >= 1000 ? "Or" : "Argent";
  const TIER_PERKS: Record<string, string[]> = {
    Argent: ["Livraison offerte dès 40€", "Accès aux offres flash", "Support email 48h"],
    Or: ["Livraison offerte dès 25€", "Accès prioritaire aux flash sales", "Support prioritaire 24h", "+5% de réductions supplémentaires"],
    Platinum: ["Livraison offerte sans seuil", "Accès exclusif avant ouverture", "Support dédié 24/7", "+10% de réductions", "FulFlo Pass inclus"],
  };

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-sm mx-auto min-h-screen relative pb-8">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div
          className="px-5 pt-5 pb-8"
          style={{ background: "linear-gradient(160deg, #0F2D1E 0%, #246040 100%)" }}
        >
          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
              <ChevronLeft size={18} className="text-white" />
            </Link>
            <span className="text-white font-display font-semibold text-sm">Mon Profil</span>
            <button onClick={signOut} className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
              <LogOut size={14} className="text-white" />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-[20px] flex items-center justify-center text-3xl font-black text-white shrink-0">
              {displayName[0]?.toUpperCase() ?? "A"}
            </div>
            <div>
              <p className="text-white font-display font-black text-xl leading-tight">Bonjour, {displayName} 👋</p>
              <p className="text-white/50 text-xs mt-0.5">{email}</p>
              <p className="text-white/40 text-[10px] mt-0.5">Membre FulFlo · Tier {tierLabel}{memberSince ? ` · depuis ${memberSince}` : ""}</p>
            </div>
          </div>

          {/* Loyalty glassmorphism card */}
          <div
            className="rounded-[20px] p-5"
            style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.18)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Points fidélité</p>
                <p className="font-display font-black text-white leading-none" style={{ fontSize: 44 }}>
                  {loyaltyPoints.toLocaleString("fr-FR")}
                </p>
                <p className="text-white/40 text-[10px] mt-1">points</p>
                <p className="text-[#A7F3D0] text-xs mt-0.5">≈ €{(loyaltyPoints * 0.01).toFixed(2)} à dépenser · 1pt = €0.01</p>
              </div>
              <div className="flex items-center gap-1.5 bg-gold/20 border border-gold/30 px-3 py-1.5 rounded-full">
                <Star size={11} className="text-gold fill-gold" />
                <span className="text-gold text-xs font-bold">Or</span>
              </div>
            </div>
            {/* Progress */}
            <div className="bg-white/15 rounded-full h-2 mb-2">
              <div
                className="h-2 bg-green-400 rounded-full transition-all"
                style={{ width: `${loyaltyProgress}%` }}
              />
            </div>
            <p className="text-white/40 text-[10px]">
              {1000 - (loyaltyPoints % 1000)} pts → Platinum
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wide mb-2">Vos avantages</p>
              {(TIER_PERKS[tierLabel] ?? []).slice(0, 3).map((b) => (
                <p key={b} className="text-white/70 text-xs mb-1">✓ {b}</p>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push("/membership")}
            className="w-full mt-3 py-3 rounded-[14px] font-bold text-sm flex items-center justify-center gap-2 shadow-md"
            style={{ background: "linear-gradient(90deg, #F4A623 0%, #E8831A 100%)", color: "#fff" }}
          >
            ⭐ Passer au FulFlo Pass Premium · €9.99/mois
          </button>
        </div>

        {/* ── 3 STAT CARDS ──────────────────────────────────────────────── */}
        <div className="px-4 -mt-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <ShoppingBag size={18} className="text-green-700" />, value: String(totalOrders), label: "Commandes" },
              { icon: <span className="text-lg">♻️</span>,                   value: `${ecoKg}kg`,       label: "kg évités" },
              { icon: <Tag size={18} className="text-green-700" />,          value: `€${Math.round(totalSavings)}`, label: "Économies" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-[16px] py-4 px-3 text-center shadow-xs">
                <div className="flex justify-center mb-1">{card.icon}</div>
                <p className="font-display font-black text-ink-900 text-lg leading-none">{card.value}</p>
                <p className="text-ink-400 text-[10px] mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>
          {/* Eco badge */}
          <div className="mt-3 bg-[#E8F5EE] rounded-[14px] p-4 flex items-center gap-3 border border-[#C2EDD5]">
            <span className="text-2xl shrink-0">♻️</span>
            <div>
              <span className="font-bold text-[#1D4D35] text-base">{ecoKg} kg</span>
              <span className="text-sm text-ink-500"> de déchets évités depuis votre inscription</span>
            </div>
          </div>
        </div>

        {/* ── REFERRAL ──────────────────────────────────────────────────── */}
        {customer?.referral_code && (
          <div className="px-4 pt-4">
            <div className="bg-white border border-ink-100 rounded-[20px] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={16} className="text-green-500" />
                <h3 className="font-display font-bold text-ink-900 text-sm">Parrainez — gagnez €5 chacun</h3>
              </div>
              <p className="text-ink-400 text-xs mb-3">
                Partagez votre lien et recevez €5 à leur première commande.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-ink-100 rounded-[10px] px-3 py-2 text-xs text-ink-500 font-mono truncate">
                  fulflo.app/invite?ref={customer.referral_code}
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 bg-green-500 text-white font-bold text-xs px-4 py-2 rounded-[10px] hover:bg-green-400 transition-colors whitespace-nowrap"
                >
                  <Copy size={11} />
                  {copied ? "Copié ✓" : "Copier"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RECENT ORDERS ─────────────────────────────────────────────── */}
        {totalOrders > 0 && (
          <div className="px-4 pt-5">
            <p className="text-[10px] font-bold text-ink-300 uppercase tracking-widest mb-2 px-1">Dernières commandes</p>
            <div className="bg-white rounded-[20px] overflow-hidden shadow-xs">
              {[
                { id: "ORD-001", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), total_eur: 34.80, status: "delivered", items_count: 3 },
                { id: "ORD-002", created_at: new Date(Date.now() - 10 * 86400000).toISOString(), total_eur: 18.50, status: "pending",   items_count: 2 },
              ].map((order, idx, arr) => (
                <div key={order.id} className={`flex items-center justify-between py-3.5 px-5 ${idx < arr.length - 1 ? "border-b border-ink-100" : ""}`}>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-ink-400">{order.items_count} article(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink-900 text-sm">€{order.total_eur.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      order.status === "delivered" ? "bg-[#E8F5EE] text-[#1D4D35]" :
                      order.status === "pending"   ? "bg-[#EEF4FE] text-[#2A7AE8]" : "bg-[#FEF0EE] text-[#E8382A]"
                    }`}>
                      {order.status === "delivered" ? "Livré" : order.status === "pending" ? "En cours" : "Annulé"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENU SECTIONS ─────────────────────────────────────────────── */}
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="px-4 pt-5">
            <p className="text-[10px] font-bold text-ink-300 uppercase tracking-widest mb-2 px-1">{section.title}</p>
            <div className="bg-white rounded-[20px] overflow-hidden shadow-xs">
              {section.items.map((item, idx) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-green-50 transition-colors ${
                    idx < section.items.length - 1 ? "border-b border-ink-100" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg" style={{ background: item.color + "18" }}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-ink-700">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full mr-1" style={{ background: "#F4A62320", color: "#F4A623" }}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-ink-300" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* ── CTA → Deals ───────────────────────────────────────────────── */}
        <div className="px-4 pt-5">
          <Link
            href="/deals"
            className="block bg-green-800 text-white font-display font-bold text-center py-4 rounded-[20px] text-sm hover:bg-green-700 transition-colors"
            style={{ boxShadow: "0 6px 20px rgba(15,45,30,.18)" }}
          >
            Voir les offres surplus →
          </Link>
        </div>

      </div>
    </div>
  );
}
