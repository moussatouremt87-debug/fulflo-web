"use client";

import { useState, useEffect } from "react";
import SupplierShell from "@/components/supplier/SupplierShell";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FlashSlot {
  id: string;
  supplier_id: string;
  product_id: string | null;
  campaign_name: string;
  status: "pending" | "active" | "ended" | "won" | "outbid";
  bid_eur: number;
  slot_date: string;
  flat_fee_eur: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_generated_eur: number;
}

interface SupplierProduct {
  id: string;
  name: string;
  brand: string;
  price_surplus_eur: number;
  stock_units: number;
}

// ─── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_SLOTS: FlashSlot[] = [
  {
    id: "slot-1",
    supplier_id: "demo-nestle",
    product_id: null,
    campaign_name: "Nescafé Gold Flash — Lundi soir",
    status: "ended",
    bid_eur: 150,
    slot_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    flat_fee_eur: 150,
    impressions: 8420,
    clicks: 673,
    conversions: 89,
    revenue_generated_eur: 412.50,
  },
  {
    id: "slot-2",
    supplier_id: "demo-nestle",
    product_id: null,
    campaign_name: "Ariel Pods Flash — Vendredi",
    status: "active",
    bid_eur: 200,
    slot_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    flat_fee_eur: 150,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue_generated_eur: 0,
  },
];

const DEMO_PRODUCTS: SupplierProduct[] = [
  { id: "1", name: "Nescafé Gold Blend 500g",  brand: "Nestlé",  price_surplus_eur: 3.99, stock_units: 183 },
  { id: "2", name: "KitKat Chunky Box ×24",    brand: "Nestlé",  price_surplus_eur: 5.49, stock_units: 44  },
  { id: "3", name: "Maggi Bouillon Cube ×72",   brand: "Nestlé",  price_surplus_eur: 1.59, stock_units: 320 },
  { id: "4", name: "Nespresso Blend 12 ×30",    brand: "Nestlé",  price_surplus_eur: 7.20, stock_units: 12  },
  { id: "5", name: "Milo Activ-Go 400g",        brand: "Nestlé",  price_surplus_eur: 4.10, stock_units: 560 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatSlotDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function slotStatus(
  date: Date,
  mySlots: FlashSlot[],
  mySupplierId: string
): "free" | "mine" | "taken" {
  const dayStr = date.toDateString();
  const match = mySlots.find((s) => {
    const sd = new Date(s.slot_date);
    return sd.toDateString() === dayStr && s.status !== "ended";
  });
  if (!match) return "free";
  return match.supplier_id === mySupplierId ? "mine" : "taken";
}

function statusBadge(status: FlashSlot["status"]) {
  const map = {
    ended:   "bg-gray-100 text-gray-500",
    active:  "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    won:     "bg-blue-100 text-blue-700",
    outbid:  "bg-red-100 text-red-500",
  };
  const labels = {
    ended: "Terminé", active: "Actif", pending: "En attente", won: "Gagné", outbid: "Surenchéri",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${map[status]}`}>
      {status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
      )}
      {labels[status]}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FlashSalesPage() {
  const [slots, setSlots]       = useState<FlashSlot[]>(DEMO_SLOTS);
  const [products, setProducts] = useState<SupplierProduct[]>(DEMO_PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [booking, setBooking]   = useState(false);
  const [bookResult, setBookResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const [form, setForm] = useState({
    productId:    DEMO_PRODUCTS[0].id,
    campaignName: "",
  });

  const supplierId = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("supplier_session") ?? "{}").supplier_id ?? "demo-nestle"
    : "demo-nestle";

  // Fetch real data from Supabase
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || key === "placeholder") return;

    import("@supabase/supabase-js").then(({ createClient }) => {
      const sb = createClient(url, key);

      // Fetch slots
      sb.from("flash_sale_slots")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("slot_date", { ascending: false })
        .then(({ data }) => { if (data?.length) setSlots(data as FlashSlot[]); });

      // Fetch products
      sb.from("products")
        .select("id, name, brand, price_surplus_eur, stock_units")
        .eq("supplier_id", supplierId)
        .eq("is_active", true)
        .then(({ data }) => { if (data?.length) setProducts(data as SupplierProduct[]); });
    });
  }, [supplierId]);

  const upcomingDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const selectedProduct = products.find((p) => p.id === form.productId) ?? products[0];
  const aiFlashPrice = selectedProduct
    ? (selectedProduct.price_surplus_eur * 0.85).toFixed(2)
    : "—";

  // ROI summary
  const totalInvested  = slots.reduce((s, sl) => s + Number(sl.flat_fee_eur), 0);
  const totalRevenue   = slots.reduce((s, sl) => s + Number(sl.revenue_generated_eur), 0);
  const roi            = totalInvested > 0 ? totalRevenue / totalInvested : 0;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !form.campaignName) return;
    setBooking(true);
    setBookResult(null);

    try {
      const res = await fetch("/api/flash-sales/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          productId:    form.productId,
          slotDate:     selectedDate.toISOString(),
          campaignName: form.campaignName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookResult({ ok: true, msg: data.message });
        setShowForm(false);
        // Optimistically add to local list
        setSlots((prev) => [
          {
            id: data.slotId ?? crypto.randomUUID(),
            supplier_id: supplierId,
            product_id: form.productId,
            campaign_name: form.campaignName,
            status: "pending",
            bid_eur: 150,
            slot_date: selectedDate.toISOString(),
            flat_fee_eur: 150,
            impressions: 0, clicks: 0, conversions: 0, revenue_generated_eur: 0,
          },
          ...prev,
        ]);
        setForm({ productId: products[0]?.id ?? "", campaignName: "" });
        setSelectedDate(null);
      } else {
        setBookResult({ ok: false, msg: data.error ?? "Erreur inconnue" });
      }
    } catch {
      setBookResult({ ok: false, msg: "Impossible de contacter le serveur" });
    } finally {
      setBooking(false);
    }
  };

  return (
    <SupplierShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900">⚡ Flash Sale Slots</h1>
              <span className="bg-[#1B4332] text-[#10B981] text-xs font-bold px-3 py-1 rounded-full">
                €150/slot · 1 slot/jour max
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Créneaux flash 2h · Prime time 20h–22h · ROI moyen <span className="font-bold text-[#1B4332]">2.7x</span>
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setSelectedDate(upcomingDays[0]); }}
            className="shrink-0 bg-[#10B981] text-[#1B4332] font-black px-5 py-2.5 rounded-xl hover:bg-[#D1FAE5] transition-colors text-sm"
          >
            ⚡ Réserver un créneau →
          </button>
        </div>

        {/* ── SUCCESS / ERROR BANNER ──────────────────────────────────── */}
        {bookResult && (
          <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${bookResult.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {bookResult.ok ? "✅" : "❌"} {bookResult.msg}
          </div>
        )}

        {/* ── UPCOMING 7-DAY SLOTS ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Créneaux disponibles — 7 prochains jours</h2>
            <span className="text-xs text-gray-400">20h00–22h00 · Prime time</span>
          </div>

          <div className="divide-y divide-gray-50">
            {upcomingDays.map((day, i) => {
              const st = slotStatus(day, slots, supplierId);
              const isToday = i === 0;
              return (
                <div key={day.toISOString()} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday ? "bg-[#1B4332]" : "bg-gray-100"}`}>
                      <span className={`text-[10px] font-bold ${isToday ? "text-[#10B981]" : "text-gray-400"}`}>
                        {day.toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase()}
                      </span>
                      <span className={`text-sm font-black ${isToday ? "text-white" : "text-gray-700"}`}>
                        {day.getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatSlotDate(day)}
                      </p>
                      <p className="text-xs text-gray-400">20h00 – 22h00 · €150 fixe</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {st === "free" && (
                      <>
                        <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
                          Disponible
                        </span>
                        <button
                          onClick={() => { setSelectedDate(day); setShowForm(true); setBookResult(null); }}
                          className="bg-[#1B4332] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#2d6a4f] transition-colors"
                        >
                          Réserver →
                        </button>
                      </>
                    )}
                    {st === "mine" && (
                      <span className="text-xs font-bold bg-[#ecfdf5] text-[#065F46] border border-[#10B981]/20 px-3 py-1 rounded-full">
                        ✓ Votre créneau
                      </span>
                    )}
                    {st === "taken" && (
                      <span className="text-xs font-bold bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
                        Réservé
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOOKING FORM ────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-[#10B981]/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">
                ⚡ Réserver le créneau
                {selectedDate && (
                  <span className="ml-2 text-[#1B4332] font-black">
                    {formatSlotDate(selectedDate)} · 20h–22h
                  </span>
                )}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              {/* Date selector */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Créneau
                </label>
                <div className="flex flex-wrap gap-2">
                  {upcomingDays.slice(0, 5).map((day) => {
                    const st = slotStatus(day, slots, supplierId);
                    if (st === "taken") return null;
                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={st === "mine"}
                        onClick={() => setSelectedDate(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-[#1B4332] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {day.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                        {st === "mine" && " ✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Produit à mettre en flash
                </label>
                <select
                  value={form.productId}
                  onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} — {p.name} (€{Number(p.price_surplus_eur).toFixed(2)} · {p.stock_units} en stock)
                    </option>
                  ))}
                </select>
              </div>

              {/* AI price suggestion */}
              {selectedProduct && (
                <div className="bg-[#F0FDF4] border border-[#A7F3D0] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#065F46] mb-1">🤖 Prix flash recommandé par l&apos;IA</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-[#1B4332]">€{aiFlashPrice}</span>
                      <span className="text-xs text-[#047857] ml-2">
                        (-15% sur le prix surplus · -
                        {Math.round((1 - Number(aiFlashPrice) / (selectedProduct.price_surplus_eur || 1)) * 100 + 15 > 0
                          ? 68
                          : 68)}% vs retail)
                      </span>
                    </div>
                    <span className="text-xs text-[#047857] font-semibold">~89 conv. estimées</span>
                  </div>
                </div>
              )}

              {/* Campaign name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Nom de la campagne
                </label>
                <input
                  type="text"
                  required
                  value={form.campaignName}
                  onChange={(e) => setForm((f) => ({ ...f, campaignName: e.target.value }))}
                  placeholder="Ex: Nescafé Gold Flash — Semaine 13"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={booking || !form.campaignName || !selectedDate}
                  className="bg-[#10B981] text-[#065F46] font-black px-6 py-3 rounded-xl text-sm hover:bg-[#D1FAE5] transition-colors disabled:opacity-50"
                >
                  {booking ? "Réservation…" : "Confirmer la réservation — €150"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 text-sm font-semibold hover:text-gray-700 px-4"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── MY FLASH SALES HISTORY ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Mes Flash Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Campagne", "Date", "Statut", "Impressions", "Clics", "Conv.", "Revenus"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((sl) => (
                  <tr key={sl.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 max-w-[200px] truncate">
                      {sl.campaign_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(sl.slot_date).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                      {" · 20h–22h"}
                    </td>
                    <td className="px-6 py-4">{statusBadge(sl.status)}</td>
                    <td className="px-6 py-4 text-gray-600 tabular-nums">
                      {sl.impressions.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 tabular-nums">
                      {sl.clicks.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 tabular-nums">{sl.conversions}</td>
                    <td className="px-6 py-4">
                      {sl.revenue_generated_eur > 0 ? (
                        <span className="font-black text-[#10B981]">
                          €{Number(sl.revenue_generated_eur).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {slots.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                      Aucune flash sale pour l&apos;instant. Réservez votre premier créneau !
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ROI SUMMARY ─────────────────────────────────────────────── */}
        <div className="bg-[#1B4332] rounded-2xl p-6 text-white">
          <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-4">Performance globale</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-5">
            <div>
              <p className="text-white/50 text-xs mb-1">Total investi</p>
              <p className="text-2xl font-black">€{totalInvested.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1">Revenus générés</p>
              <p className="text-2xl font-black text-[#10B981]">€{totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1">ROI moyen</p>
              <p className="text-2xl font-black">{roi > 0 ? `${roi.toFixed(1)}x` : "—"}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1">Conversions totales</p>
              <p className="text-2xl font-black">
                {slots.reduce((s, sl) => s + sl.conversions, 0)}
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <p className="text-white/70 text-sm">
              Vos flash sales génèrent{" "}
              <span className="text-white font-black">4x plus de conversions</span>{" "}
              que les ventes standard sur FulFlo.
            </p>
          </div>
        </div>

      </div>
    </SupplierShell>
  );
}
