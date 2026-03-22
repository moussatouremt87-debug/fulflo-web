"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import { User } from "lucide-react";

export default function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();

    sb.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (email) {
    return (
      <Link
        href="/account"
        className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
      >
        <User size={14} />
        <span className="hidden sm:inline">{email.split("@")[0]}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
    >
      Connexion
    </Link>
  );
}
