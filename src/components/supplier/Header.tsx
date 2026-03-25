"use client";

import { useI18n } from "@/lib/i18n";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { t, dir } = useI18n();
  const name = typeof window !== "undefined"
    ? (JSON.parse(sessionStorage.getItem("supplier_session") ?? "{}").company ?? "Maison Favrichon")
    : "Maison Favrichon";

  return (
    <div
      dir={dir}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {action}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold">
            F
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-gray-700">{name}</p>
            <p className="text-xs text-gray-400">Supplier Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
