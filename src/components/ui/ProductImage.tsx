"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductImageProps {
  ean?: string | null;
  category?: string;
  brand?: string;
  className?: string;
  size?: number;
}

function categoryEmoji(cat?: string): string {
  switch (cat) {
    case "hygiene":      return "🧴";
    case "alimentation": return "🍝";
    case "entretien":    return "🧹";
    case "boissons":     return "💧";
    case "beaute":       return "💄";
    case "bebe":         return "👶";
    case "animaux":      return "🐾";
    case "sport":        return "⚽";
    case "pharmacie":    return "💊";
    default:             return "📦";
  }
}

export default function ProductImage({ ean, category, brand, className = "", size = 80 }: ProductImageProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!ean);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ean) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    fetch(`/api/product-image?ean=${encodeURIComponent(ean)}`)
      .then((r) => r.json())
      .then((d) => { setImgUrl(d.url || null); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [ean]);

  if (loading) {
    return (
      <div className={`bg-green-100 animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-3xl opacity-30">{categoryEmoji(category)}</span>
      </div>
    );
  }

  if (imgUrl && !error) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imgUrl}
          alt={brand || category || "product"}
          fill
          sizes={`${size}px`}
          className="object-contain p-2"
          onError={() => setError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={`bg-green-50 flex items-center justify-center ${className}`}>
      <span className="text-4xl">{categoryEmoji(category)}</span>
    </div>
  );
}
