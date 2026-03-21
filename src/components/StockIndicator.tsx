interface StockIndicatorProps {
  units: number;
}

export default function StockIndicator({ units }: StockIndicatorProps) {
  if (units <= 0) {
    return (
      <span className="text-xs font-semibold text-red-500">Épuisé</span>
    );
  }

  if (units <= 5) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-red-500 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        {units} restant{units > 1 ? "s" : ""} — presque fini !
      </span>
    );
  }

  if (units <= 20) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        Plus que {units} en stock
      </span>
    );
  }

  // Stock bar for higher quantities
  const maxDisplay = 200;
  const pct = Math.min((units / maxDisplay) * 100, 100);
  const barColor = pct > 60 ? "bg-mint" : pct > 30 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-mid">{units} en stock</span>
      </div>
      <div className="h-1 bg-mint-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
