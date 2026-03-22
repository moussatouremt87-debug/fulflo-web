interface StockIndicatorProps {
  units: number;
}

export default function StockIndicator({ units }: StockIndicatorProps) {
  if (units <= 0) {
    return (
      <span className="text-xs font-semibold text-gray-400">Épuisé</span>
    );
  }

  if (units <= 4) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-red-600 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
        🔴 Dernières unités !
      </span>
    );
  }

  if (units <= 9) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
        ⚠ Plus que {units} !
      </span>
    );
  }

  if (units <= 20) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        {units} en stock · Commandez vite
      </span>
    );
  }

  return (
    <span className="text-xs text-gray-400">{units} en stock</span>
  );
}
