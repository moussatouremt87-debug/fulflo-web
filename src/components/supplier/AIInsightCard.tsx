"use client";

import { useState } from "react";
import { AIInsight } from "@/lib/ai-insights";
import { useI18n } from "@/lib/i18n";

const severityConfig = {
  critical: { bg: "bg-red-50",    border: "border-red-200",  dot: "bg-red-500",    badge: "bg-red-100 text-red-700" },
  warning:  { bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  info:     { bg: "bg-[#ecfdf5]", border: "border-[#D1FAE5]", dot: "bg-[#10B981]", badge: "bg-[#D1FAE5] text-[#065F46]" },
};

interface AIInsightCardProps {
  insight: AIInsight;
  onApply?: (insight: AIInsight) => void;
}

export default function AIInsightCard({ insight, onApply }: AIInsightCardProps) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  if (dismissed) return null;

  const cfg = severityConfig[insight.severity];

  const handleApply = () => {
    setApplied(true);
    onApply?.(insight);
  };

  return (
    <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} block ${insight.severity === "critical" ? "animate-pulse" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {t(`ai.insightTypes.${insight.type}`)}
            </span>
            <span className="text-xs text-gray-400">{insight.confidence}% confiance</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">{insight.title}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{insight.body}</p>
          {insight.suggested_action && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleApply}
                disabled={applied}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  applied
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-[#1B4332] text-white hover:bg-[#2d6a4f]"
                }`}
              >
                {applied ? "✓ Appliqué" : insight.suggested_action.label}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t("dashboard.insights.dismiss")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
