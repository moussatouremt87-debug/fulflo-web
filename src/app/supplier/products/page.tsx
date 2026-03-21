"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/supplier/Header";

interface Product {
  id: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  stock_units: number;
  current_price: number;
  original_price: number;
  expiry_date: string;
  flash_sale_end_time: string | null;
  ai_pricing_enabled: boolean;
}

const DEMO_PRODUCTS: Product[] = [
  { id: "1", brand: "Nestlé", name: "Nescafé Gold Blend",  size: "200g",       category: "alimentation", stock_units: 183, current_price: 3.99,  original_price: 8.90,  expiry_date: new Date(Date.now() + 110 * 86400000).toISOString(), flash_sale_end_time: null, ai_pricing_enabled: false },
  { id: "2", brand: "Nestlé", name: "KitKat Chunky Box",   size: "×24",        category: "alimentation", stock_units: 44,  current_price: 5.49,  original_price: 11.90, expiry_date: new Date(Date.now() + 6   * 86400000).toISOString(), flash_sale_end_time: new Date(Date.now() + 2 * 3600000).toISOString(), ai_pricing_enabled: true  },
  { id: "3", brand: "Nestlé", name: "Maggi Bouillon ×72",  size: "×72 cubes",  category: "alimentation", stock_units: 320, current_price: 1.59,  original_price: 3.80,  expiry_date: new Date(Date.now() + 35  * 86400000).toISOString(), flash_sale_end_time: null, ai_pricing_enabled: false },
  { id: "4", brand: "Nestlé", name: "Nespresso Blend 12",  size: "×50 pods",   category: "boissons",     stock_units: 12,  current_price: 7.20,  original_price: 14.50, expiry_date: new Date(Date.now() + 12  * 86400000).toISOString(), flash_sale_end_time: null, ai_pricing_enabled: true  },
  { id: "5", brand: "Nestlé", name: "Milo Activ-Go 400g",  size: "400g",       category: "boissons",     stock_units: 560, current_price: 4.10,  original_price: 8.20,  expiry_date: new Date(Date.now() + 55  * 86400000).toISOString(), flash_sale_end_time: null, ai_pricing_enabled: false },
];

function getStatus(p: Product): "flash" | "critical" | "active" | "expired" {
  if (new Date(p.expiry_date) < new Date()) return "expired";
  if (p.flash_sale_end_time && new Date(p.flash_sale_end_time) > new Date()) return "flash";
  const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000);
  if (days <= 14) return "critical";
  return "active";
}

const statusStyles = {
  active:   "bg-[#D1FAE5] text-[#065F46]",
  critical: "bg-red-100 text-red-700",
  expired:  "bg-gray-100 text-gray-500",
  flash:    "bg-amber-100 text-amber-700",
};

export default function SupplierProducts() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return DEMO_PRODUCTS;
    const q = search.toLowerCase();
    return DEMO_PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))
    );
  };

  return (
    <div>
      <Header
        title={t("products.title")}
        subtitle={`${DEMO_PRODUCTS.length} produits dans votre catalogue`}
        action={
          <a
            href="/supplier/products/new"
            className="bg-[#10B981] text-[#1B4332] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#D1FAE5] transition-colors"
          >
            + {t("products.add")}
          </a>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("products.search")}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>
        {selected.size > 0 && (
          <button className="bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
            🗑 {t("products.bulkDelete")} ({selected.size})
          </button>
        )}
        <button className="bg-white border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors ml-auto">
          ↓ {t("products.export")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]"
                  />
                </th>
                {[
                  t("products.columns.name"),
                  t("products.columns.category"),
                  t("products.columns.stock"),
                  t("products.columns.price"),
                  t("products.columns.discount"),
                  t("products.columns.expiry"),
                  t("products.columns.status"),
                  t("products.columns.actions"),
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400">
                    <p className="text-3xl mb-2">📦</p>
                    <p className="font-semibold">{t("products.empty")}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const status = getStatus(p);
                  const discountPct = Math.round(((p.original_price - p.current_price) / p.original_price) * 100);
                  const days = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000);
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand} · {p.size}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full capitalize">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-700">{p.stock_units.toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-bold text-[#1B4332]">€{p.current_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 line-through">€{p.original_price.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${discountPct >= 50 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-amber-50 text-amber-700"}`}>
                          -{discountPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold ${days <= 14 ? "text-red-600" : "text-gray-500"}`}>
                          {days > 0 ? `J-${days}` : "Expiré"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
                          {t(`products.status.${status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <a
                            href={`/supplier/products/${p.id}/edit`}
                            className="text-xs font-semibold text-[#10B981] hover:underline px-2 py-1"
                          >
                            {t("products.actions.edit")}
                          </a>
                          <span className="text-gray-200">|</span>
                          <button className="text-xs font-semibold text-gray-400 hover:text-red-500 px-2 py-1 transition-colors">
                            {t("products.actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
