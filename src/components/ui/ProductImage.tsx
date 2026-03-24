"use client";

import { useState, useEffect } from "react";

interface Props {
  imageUrl?: string | null; // Priority 1: brand-uploaded via supplier portal
  ean?: string | null;      // Priority 2: Open Food Facts lookup
  name: string;             // Priority 3: initial letter fallback
  className?: string;
  style?: React.CSSProperties;
}

export default function ProductImage({ imageUrl, ean, name, className = "", style }: Props) {
  const [src, setSrc] = useState<string | null>(imageUrl || null);
  const [loading, setLoading] = useState(!imageUrl && !!ean);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (imageUrl) { setSrc(imageUrl); setLoading(false); setFailed(false); return; }
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

  if (loading) {
    return <div className={`bg-[#F4FAF6] shimmer-bg ${className}`} style={style} />;
  }

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`object-contain bg-[#F4FAF6] ${className}`}
        style={{ mixBlendMode: "multiply", ...style }}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: initial letter
  return (
    <div className={`bg-[#F4FAF6] flex items-center justify-center ${className}`} style={style}>
      <span className="text-[#1D4D35] font-bold text-3xl opacity-25 font-display select-none">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
