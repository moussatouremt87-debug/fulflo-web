"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
import ar from "@/messages/ar.json";

export type Locale = "fr" | "en" | "de" | "ar";

const messages: Record<Locale, typeof fr> = { fr, en, de, ar };

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K) : never }[keyof T]
  : never;

type MessageKey = string;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string ?? path;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue>({
  locale: "fr",
  setLocale: () => {},
  t: (k) => k,
  dir: "ltr",
});

export function I18nProvider({ children, defaultLocale = "fr" }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = (key: MessageKey, vars?: Record<string, string | number>): string => {
    let str = getNestedValue(messages[locale] as unknown as Record<string, unknown>, key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{{${k}}}`, String(v));
      });
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: locale === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

export const LOCALES: { key: Locale; label: string; flag: string }[] = [
  { key: "fr", label: "Français", flag: "🇫🇷" },
  { key: "en", label: "English",  flag: "🇬🇧" },
  { key: "de", label: "Deutsch",  flag: "🇩🇪" },
  { key: "ar", label: "العربية",  flag: "🇲🇦" },
];
