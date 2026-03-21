"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { TrackingResult, TrackingEvent } from "@/lib/3pl/index";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TrackingEvent["status"],
  { label: string; icon: string; color: string; bg: string }
> = {
  pending:          { label: "Commande créée",        icon: "📋", color: "text-gray-500",       bg: "bg-gray-100" },
  picked:           { label: "Collecté",               icon: "📦", color: "text-blue-600",       bg: "bg-blue-100" },
  in_transit:       { label: "En transit",             icon: "🚚", color: "text-amber-600",      bg: "bg-amber-100" },
  out_for_delivery: { label: "En cours de livraison", icon: "🛵", color: "text-orange-600",     bg: "bg-orange-100" },
  delivered:        { label: "Livré",                  icon: "✅", color: "text-[#065F46]",      bg: "bg-[#D1FAE5]" },
  failed:           { label: "Problème de livraison", icon: "❌", color: "text-red-600",        bg: "bg-red-100" },
};

const TIMELINE_STEPS: TrackingEvent["status"][] = [
  "pending", "picked", "in_transit", "out_for_delivery", "delivered",
];

// ─── Demo fallback ────────────────────────────────────────────────────────────

function buildDemoTracking(orderId: string): TrackingResult {
  const now = new Date();
  return {
    shipmentId: `SHP-${orderId}`,
    trackingNumber: `BB12345678FR`,
    carrier: "Colissimo",
    currentStatus: "in_transit",
    estimatedDelivery: new Date(now.getTime() + 2 * 86400000),
    events: [
      {
        timestamp: new Date(now.getTime() - 2 * 86400000),
        status: "pending",
        location: "Entrepôt Paris",
        description: "Commande créée — en attente de collecte",
      },
      {
        timestamp: new Date(now.getTime() - 1 * 86400000),
        status: "picked",
        location: "Centre de tri Roissy",
        description: "Colis collecté et scanné",
      },
      {
        timestamp: new Date(now.getTime() - 6 * 3600000),
        status: "in_transit",
        location: "Hub Lyon",
        description: "En transit vers votre agence locale",
      },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Try to load from Supabase order to get shipmentId
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (url && key && key !== "placeholder") {
          const { createClient } = await import("@supabase/supabase-js");
          const sb = createClient(url, key);
          const { data } = await sb
            .from("orders")
            .select("shipment_id, fulfillment_provider")
            .eq("id", orderId)
            .single();

          if (data?.shipment_id) {
            const res = await fetch(`/api/fulfillment/${data.shipment_id}/tracking`);
            if (res.ok) {
              const t = await res.json();
              setTracking(t);
              setLoading(false);
              return;
            }
          }
        }
      } catch { /* fall through to demo */ }

      // Demo fallback
      await new Promise((r) => setTimeout(r, 600));
      setTracking(buildDemoTracking(orderId));
      setLoading(false);
    }

    load();
  }, [orderId]);

  const currentStepIndex = tracking
    ? TIMELINE_STEPS.indexOf(tracking.currentStatus)
    : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#1B4332] font-semibold">Chargement du suivi…</p>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">📦</p>
          <h1 className="text-xl font-bold text-[#1B4332] mb-2">Commande introuvable</h1>
          <p className="text-gray-500 text-sm mb-4">{error || `Commande ${orderId} non trouvée.`}</p>
          <a href="/" className="text-[#10B981] font-semibold hover:underline text-sm">← Retour à l&apos;accueil</a>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[tracking.currentStatus];

  return (
    <div className="min-h-screen bg-[#F0FDF4]">
      {/* Header */}
      <div className="bg-[#1B4332] text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <a href="/" className="text-[#10B981] text-sm font-semibold mb-3 block">
            fulflo<span className="text-white">.</span>
          </a>
          <h1 className="text-xl font-bold mb-1">Suivi de commande</h1>
          <p className="text-white/60 text-sm">Commande #{orderId}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Current status card */}
        <div className={`${cfg.bg} rounded-2xl p-5`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cfg.icon}</span>
            <div>
              <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-sm text-gray-600">
                {tracking.carrier} · Colis {tracking.trackingNumber}
              </p>
            </div>
          </div>
          {tracking.currentStatus !== "delivered" && tracking.currentStatus !== "failed" && (
            <div className="mt-3 pt-3 border-t border-white/40 flex items-center gap-2">
              <span className="text-sm text-gray-600">Livraison estimée :</span>
              <span className="text-sm font-bold text-[#1B4332]">
                {tracking.estimatedDelivery.toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Progress timeline */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Progression
          </h2>
          <div className="space-y-4">
            {TIMELINE_STEPS.filter((s) => s !== "failed").map((step, i) => {
              const done   = i <= currentStepIndex && tracking.currentStatus !== "failed";
              const active = i === currentStepIndex && tracking.currentStatus !== "failed";
              const sCfg   = STATUS_CONFIG[step];
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                    active ? `${sCfg.bg} ${sCfg.color} ring-2 ring-offset-1 ring-[#10B981]` :
                    done   ? "bg-[#D1FAE5] text-[#065F46]" :
                              "bg-gray-100 text-gray-400"
                  }`}>
                    {done ? (active ? sCfg.icon : "✓") : sCfg.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${done ? "text-gray-800" : "text-gray-400"}`}>
                      {sCfg.label}
                    </p>
                  </div>
                  {active && (
                    <span className="text-xs font-bold bg-[#10B981] text-white px-2 py-0.5 rounded-full animate-pulse">
                      En cours
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event history */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Historique
          </h2>
          <div className="space-y-4">
            {[...tracking.events].reverse().map((event, i) => {
              const eCfg = STATUS_CONFIG[event.status];
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${eCfg.bg} ${eCfg.color}`}>
                      {eCfg.icon}
                    </div>
                    {i < tracking.events.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-semibold text-gray-800">{event.description}</p>
                    {event.location && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 {event.location}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support CTA */}
        <div className="bg-[#1B4332] rounded-2xl p-5 text-center">
          <p className="text-white font-semibold mb-1">Un problème avec votre livraison ?</p>
          <p className="text-white/60 text-sm mb-4">Notre équipe répond sous 2h</p>
          <a
            href="mailto:sarah@fulflo.app"
            className="inline-flex items-center gap-2 bg-[#10B981] text-[#1B4332] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#D1FAE5] transition-colors"
          >
            💬 Contacter le support
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          fulflo. · Surplus économique certifié · <a href="/" className="hover:underline">fulflo.app</a>
        </p>
      </div>
    </div>
  );
}
