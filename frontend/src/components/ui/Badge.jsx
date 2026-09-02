const statusColors = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  delivered: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  processing: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  low: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "in-stock": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  vip: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  regular: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "at-risk": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  new: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function Badge({ status, label, className = "" }) {
  const key = (status || label || "").toLowerCase();
  const colorClass = statusColors[key] || "bg-slate-500/15 text-slate-400 border-slate-500/30";

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border tracking-wide
        ${colorClass} ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-90 animate-pulse" />
      {label || status}
    </span>
  );
}

export default Badge;
