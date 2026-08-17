import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  History, PackageX, AlertTriangle, ShoppingCart, CheckCircle2,
  Clock, EyeOff, ArrowRight, RotateCcw,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const TYPE_META = {
  out_of_stock: { icon: PackageX, iconBg: "bg-rose-500/15", iconColor: "text-rose-400", path: "/products" },
  low_stock: { icon: AlertTriangle, iconBg: "bg-amber-500/15", iconColor: "text-amber-400", path: "/products" },
  stalled_order: { icon: ShoppingCart, iconBg: "bg-indigo-500/15", iconColor: "text-indigo-400", path: "/orders" },
};

const SNOOZE_OPTIONS = [
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
];

function EventCard({ event, onUpdate, navigate }) {
  const meta = TYPE_META[event.type] || TYPE_META.stalled_order;
  const Icon = meta.icon;
  const [busy, setBusy] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const snoozeRef = useRef(null);

  useEffect(() => {
    if (!snoozeOpen) return;
    const handleOutsideClick = (e) => {
      if (snoozeRef.current && !snoozeRef.current.contains(e.target)) {
        setSnoozeOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setSnoozeOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [snoozeOpen]);

  const updateStatus = async (status, extra = {}) => {
    setBusy(true);
    try {
      await api.patch(`/decision-events/${event._id}`, { status, ...extra });
      toast.success(
        status === "done" ? "Marked done" : status === "ignored" ? "Ignored" : status === "snoozed" ? "Snoozed" : "Reopened"
      );
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update this item");
    } finally {
      setBusy(false);
      setSnoozeOpen(false);
    }
  };

  const handleSnooze = (days) => {
    const snoozeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    updateStatus("snoozed", { snoozeUntil });
  };

  const isActive = event.status === "open" || event.status === "snoozed";

  return (
    <div
      className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${meta.iconBg}`}>
          <Icon size={16} className={meta.iconColor} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">{event.title}</p>
            {event.status === "snoozed" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
                <Clock size={10} /> Snoozed
              </span>
            )}
            {event.status === "ignored" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400">
                <EyeOff size={10} /> Ignored
              </span>
            )}
            {event.status === "done" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 size={10} /> Done
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">{event.reason}</p>
          <p className="text-xs text-indigo-400 mt-1.5 font-medium">→ {event.recommendation}</p>
          {event.status === "snoozed" && event.snoozeUntil && (
            <p className="text-[11px] text-slate-500 mt-1">
              Until {new Date(event.snoozeUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          )}
          {!isActive && event.resolvedAt && (
            <p className="text-[11px] text-slate-500 mt-1">
              {event.status === "done" ? "Resolved" : "Ignored"} {new Date(event.resolvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {event.outcomeNote ? ` — ${event.outcomeNote}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pl-[52px]">
        <button
          onClick={() => navigate(meta.path)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-400 transition-all"
        >
          View <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-2 relative">
          {isActive ? (
            <>
              <Button size="sm" variant="success" onClick={() => updateStatus("done")} loading={busy}>
                Done
              </Button>
              <div className="relative" ref={snoozeRef}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSnoozeOpen((o) => !o)}
                  disabled={busy}
                  aria-haspopup="true"
                  aria-expanded={snoozeOpen}
                >
                  Snooze
                </Button>
                {snoozeOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden z-20 w-32"
                  >
                    {SNOOZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.days}
                        role="menuitem"
                        onClick={() => handleSnooze(opt.days)}
                        className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800/60 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => updateStatus("ignored")} loading={busy}>
                Ignore
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => updateStatus("open")} loading={busy}>
              <RotateCcw size={12} />
              Reopen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DecisionTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/decision-events");
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimeline(); }, []);

  const open = events.filter((e) => e.status === "open");
  const snoozed = events.filter((e) => e.status === "snoozed");
  const history = events.filter((e) => e.status === "done" || e.status === "ignored");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <History size={22} className="text-indigo-400" />
          Decision Timeline
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          What changed, why it matters, and what happened when you acted on it
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-sm font-semibold text-slate-300">You&rsquo;re all caught up.</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Low-stock, out-of-stock, and stalled-order alerts will show up here as they happen.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Needs a decision</h2>
              <span className="text-xs font-bold text-slate-500">{open.length}</span>
            </div>
            {open.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Nothing open right now.</p>
            ) : (
              <div className="space-y-3">
                {open.map((e) => (
                  <EventCard key={e._id} event={e} onUpdate={fetchTimeline} navigate={navigate} />
                ))}
              </div>
            )}
          </Card>

          {snoozed.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Snoozed</h2>
                <span className="text-xs font-bold text-slate-500">{snoozed.length}</span>
              </div>
              <div className="space-y-3">
                {snoozed.map((e) => (
                  <EventCard key={e._id} event={e} onUpdate={fetchTimeline} navigate={navigate} />
                ))}
              </div>
            </Card>
          )}

          {history.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">History</h2>
                <span className="text-xs font-bold text-slate-500">{history.length}</span>
              </div>
              <div className="space-y-3">
                {history.map((e) => (
                  <EventCard key={e._id} event={e} onUpdate={fetchTimeline} navigate={navigate} />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default DecisionTimeline;
