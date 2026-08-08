import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({ title, value, icon: Icon, trend, trendValue, color = "indigo" }) {
  const colors = {
    indigo: {
      icon: "from-indigo-500 to-violet-600",
      glow: "hover:shadow-indigo-500/15",
      border: "border-indigo-500/20",
    },
    cyan: {
      icon: "from-cyan-500 to-blue-600",
      glow: "hover:shadow-cyan-500/15",
      border: "border-cyan-500/20",
    },
    emerald: {
      icon: "from-emerald-500 to-teal-600",
      glow: "hover:shadow-emerald-500/15",
      border: "border-emerald-500/20",
    },
    amber: {
      icon: "from-amber-500 to-orange-600",
      glow: "hover:shadow-amber-500/15",
      border: "border-amber-500/20",
    },
    rose: {
      icon: "from-rose-500 to-pink-600",
      glow: "hover:shadow-rose-500/15",
      border: "border-rose-500/20",
    },
  };

  const c = colors[color] || colors.indigo;

  return (
    <div
      className={`
        glass-card rounded-3xl p-7 lg:p-8 border ${c.border}
        ${c.glow} hover:border-indigo-500/40
        transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl
        animate-fade-in-up flex flex-col justify-between
      `}
      style={{ minHeight: "180px" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${c.icon} shadow-lg shadow-black/10 flex-shrink-0`}>
            <Icon size={20} color="white" />
          </div>
        )}
      </div>

      <div className="my-2">
        <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
          {value}
        </h3>
      </div>

      {trendValue !== undefined ? (
        <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-200 dark:border-slate-800/80">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            }`}
          >
            {trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{trendValue}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">vs last month</span>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-200 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 font-medium">Updated just now</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default StatCard;