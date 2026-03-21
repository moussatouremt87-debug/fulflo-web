"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useI18n } from "@/lib/i18n";

interface SupplierShellProps {
  children: ReactNode;
}

export default function SupplierShell({ children }: SupplierShellProps) {
  const { dir } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/supplier/login") {
      setReady(true);
      return;
    }
    const session = sessionStorage.getItem("supplier_session");
    if (!session) {
      router.replace("/supplier/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (pathname === "/supplier/login") {
    return <>{children}</>;
  }

  return (
    <div dir={dir} className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 relative z-10">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <span className="text-lg font-bold text-[#1B4332]">
            fulflo<span className="text-[#10B981]">.</span>
          </span>
        </div>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
