interface KPICardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: number; // positive = up, negative = down
  icon: string;
  accent?: "green" | "amber" | "red" | "blue";
}

const accentMap = {
  green: "bg-[#D1FAE5] text-[#065F46]",
  amber: "bg-amber-50 text-amber-700",
  red:   "bg-red-50 text-red-700",
  blue:  "bg-blue-50 text-blue-700",
};

export default function KPICard({ title, value, subtext, trend, icon, accent = "green" }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${accentMap[accent]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-red-50 text-red-600"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
