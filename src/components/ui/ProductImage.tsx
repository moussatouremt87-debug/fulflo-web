"use client";

import { useState, useEffect } from "react";

interface Props {
  imageUrl?: string | null; // Priority 1: brand-uploaded via supplier portal
  ean?: string | null;      // Priority 2: Open Food Facts lookup
  name: string;             // Priority 3: initial letter fallback
  className?: string;
}

export default function ProductImage({ imageUrl, ean, name, className = "" }: Props) {
  const [src, setSrc] = useState<string | null>(imageUrl || null);
  const [loading, setLoading] = useState(!imageUrl && !!ean);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Priority 1: brand already uploaded
    if (imageUrl) { setSrc(imageUrl); setLoading(false); setFailed(false); return; }
    // Priority 2: fetch from OFF via EAN
    if (ean) {
      setLoading(true);
      setFailed(false);
      fetch(`/api/product-image?ean=${encodeURIComponent(ean)}`)
        .then((r) => r.json())
        .then((d) => setSrc((d.url as string | null) || null))
        .catch(() => setSrc(null))
        .finally(() => setLoading(false));
    } else {
      setSrc(null);
      setLoading(false);
    }
  }, [imageUrl, ean]);

  // Shimmer skeleton while fetching
  if (loading) {
    return <div className={`bg-[#E8F5EE] animate-pulse ${className}`} />;
  }

  // Real image (brand or OFF)
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`object-contain ${className}`}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: brand initial on green bg
  return (
    <div className={`bg-[#E8F5EE] flex items-center justify-center ${className}`}>
      <span className="text-[#1D4D35] font-bold text-3xl opacity-25 font-display select-none">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
