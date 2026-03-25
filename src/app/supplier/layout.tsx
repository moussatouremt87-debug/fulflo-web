import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import SupplierShell from "@/components/supplier/SupplierShell";

export const metadata = {
  title: "Fulflo — Portail Partenaires",
  description: "Gérez vos stocks surplus avec l'IA",
};

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <SupplierShell>{children}</SupplierShell>
    </I18nProvider>
  );
}
