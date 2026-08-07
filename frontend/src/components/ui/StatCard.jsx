import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({ title, value, icon: Icon, trend, trendValue, color = "indigo" }) {
  const colors = {
    indigo: {
      icon: "from-indigo-500 to-violet-600",
      glow: "hover:shadow-indigo-500/15",
      border: "border-indigo-500/20",
      pill: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    cyan: {
      icon: "from-cyan-500 to-blue-600",
      glow: "hover:shadow-cyan-500/15",
      border: "border-cyan-500/20",
      pill: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    emerald: {
      icon: "from-emerald-500 to-teal-600",
      glow: "hover:shadow-emerald-500/15",
      border: "border-emerald-500/20",
      pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    amber: {
      icon: "from-amber-500 to-orange-600",
      glow: "hover:shadow-amber-500/15",
      border: "border-amber-500/20",
      pill: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    rose: {
      icon: "from-rose-500 to-pink-600",
      glow: "hover:shadow-rose-500/15",
      border: "border-rose-500/20",
      pill: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
  };

  const c = colors[color] || colors.indigo;

  return (
    <div
      className={`
        glass-card rounded-2xl p-6 border ${c.border}
        ${c.glow} hover:border-slate-600
        transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl
        animate-fade-in-up flex flex-col justify-between gap-4
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${c.icon} shadow-lg shadow-black/20 flex-shrink-0`}>
            <Icon size={20} className="text-white" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none">
          {value}
        </h3>
      </div>

      {trendValue !== undefined ? (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${trend === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
            {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendValue}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">vs last month</span>
        </div>
      ) : (
        <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">Updated just now</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default StatCard;