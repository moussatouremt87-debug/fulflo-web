"use client";

import { useState } from "react";
import Countdown from "./Countdown";

interface FlashSaleBannerProps {
  productName: string;
  brand: string;
  originalPrice: number;
  currentPrice: number;
  endTime: string;
  stockUnits: number;
}

export default function FlashSaleBanner({
  productName,
  brand,
  originalPrice,
  currentPrice,
  endTime,
  stockUnits,
}: FlashSaleBannerProps) {
  const [expired, setExpired] = useState(false);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  if (expired || new Date(endTime) <= new Date()) return null;

  return (
    <div className="bg-forest border-b border-forest-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Left: badge + deal info */}
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 bg-mint text-forest text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
              Flash 2H
            </div>
            <span className="text-white font-semibold text-sm">
              {brand} — {productName}
            </span>
            <span className="bg-white/10 text-mint text-sm font-bold px-2.5 py-0.5 rounded-full">
              -{discount}%
            </span>
            <span className="text-white/60 text-sm line-through">
              €{originalPrice.toFixed(2)}
            </span>
            <span className="text-mint font-bold text-base">
              €{currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Right: countdown + stock */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-white/50 text-xs mb-1 uppercase tracking-wider">Se termine dans</p>
              <Countdown endTime={endTime} onExpire={() => setExpired(true)} size="lg" />
            </div>
            <div className="hidden sm:block h-10 w-px bg-white/10" />
            <div className="text-center hidden sm:block">
              <p className="text-white/50 text-xs mb-1 uppercase tracking-wider">Stock</p>
              <p className="text-white font-bold text-lg">{stockUnits}</p>
            </div>
            <button className="bg-mint text-forest font-bold text-sm px-5 py-2.5 rounded-full hover:bg-mint-light transition-colors whitespace-nowrap">
              Acheter ⚡
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
