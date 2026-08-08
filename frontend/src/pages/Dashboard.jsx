import { useEffect, useState } from "react";
import {
  TrendingUp, ShoppingCart, Users, Package, DollarSign, Bot, ArrowRight, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";

const revenueData = [
  { month: "Feb", revenue: 42000, expenses: 18000 },
  { month: "Mar", revenue: 55000, expenses: 22000 },
  { month: "Apr", revenue: 38000, expenses: 15000 },
  { month: "May", revenue: 71000, expenses: 28000 },
  { month: "Jun", revenue: 63000, expenses: 24000 },
  { month: "Jul", revenue: 84000, expenses: 30000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-2xl p-4 border border-slate-700/60 shadow-2xl text-sm min-w-[140px]">
        <p className="text-slate-400 mb-2 font-semibold text-xs uppercase tracking-wider">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-bold text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}: ₹{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalCustomers: 0,
    totalProducts: 0, profit: 0, totalExpenses: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashData, ordersData] = await Promise.all([
          api.get("/dashboard"),
          api.get("/orders"),
        ]);
        setStats(dashData.data);
        setRecentOrders(ordersData.data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchAll();
  }, []);

  const fetchAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const { data } = await api.post("/ai/chat", {
        message: "Give me a 2-sentence summary of my business performance and one key recommendation.",
      });
      setAiInsight(data.reply);
    } catch {
      setAiInsight("AI insight unavailable. Please check your Gemini API key.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const chartTickColor = isDark ? "#94a3b8" : "#475569";
  const gridColor = isDark ? "rgba(148,163,184,0.07)" : "rgba(203,213,225,0.6)";

  return (
    <div className="space-y-12 lg:space-y-14 animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm lg:text-base mt-2 font-medium">
            Here is your business performance overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm flex-shrink-0 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-500">All systems operational</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon={DollarSign} color="indigo" trend="up" trendValue="+12.5%" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="cyan" trend="up" trendValue="+8.2%" />
        <StatCard title="Customers" value={stats.totalCustomers} icon={Users} color="emerald" trend="up" trendValue="+5.1%" />
        <StatCard title="Products" value={stats.totalProducts} icon={Package} color="amber" />
        <StatCard title="Net Profit" value={`₹${stats.profit?.toLocaleString()}`} icon={TrendingUp} color={stats.profit >= 0 ? "emerald" : "rose"} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
        {/* Revenue Chart — 2/3 width */}
        <Card className="xl:col-span-2 !p-8 lg:!p-10 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Revenue Overview</h2>
              <p className="text-xs lg:text-sm text-slate-400 mt-1 font-medium">Monthly revenue vs expenses trend</p>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
                Revenue
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
                Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ left: 10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} dx={-6} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRev)" dot={{ fill: "#6366f1", r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={3} fill="url(#colorExp)" dot={{ fill: "#f43f5e", r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Expense Breakdown — 1/3 width */}
        <Card className="!p-8 lg:!p-10 rounded-3xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">Monthly Expenses</h2>
            <p className="text-xs lg:text-sm text-slate-400 mt-1 font-medium">6-month expense distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} barSize={24} margin={{ left: 0, right: 8, top: 10 }}>
              <defs>
                <linearGradient id="roseBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} dx={-6} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="expenses" name="Expenses" fill="url(#roseBarGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Bottom Row: Recent Orders + AI Insight ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
        {/* Recent Orders — 2/3 */}
        <Card className="xl:col-span-2 !p-8 lg:!p-10 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Orders</h2>
              <p className="text-xs lg:text-sm text-slate-400 mt-1 font-medium">Latest customer transactions</p>
            </div>
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-xs lg:text-sm font-bold text-indigo-500 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500/10 transition-all"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShoppingCart size={44} className="mx-auto mb-3 opacity-25" />
              <p className="text-base font-semibold">No orders found yet</p>
              <p className="text-xs mt-1 text-slate-400">Create your first order to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 24px",
                    borderRadius: "20px",
                    background: isDark ? "rgba(15,23,42,0.6)" : "#f8fafc",
                    border: isDark ? "1px solid rgba(30,41,59,0.8)" : "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/25 flex items-center justify-center text-indigo-500 font-bold text-base flex-shrink-0">
                      {order.customer?.name?.[0]?.toUpperCase() || "#"}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white leading-tight">
                        {order.customer?.name || "Unknown Customer"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-black text-white">
                      ₹{order.totalAmount?.toLocaleString()}
                    </span>
                    <Badge status={order.status} label={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Insight Widget — 1/3, full height */}
        <Card className="border-indigo-500/25 relative overflow-hidden flex flex-col !p-8 lg:!p-10 rounded-3xl">
          {/* ambient glow blobs */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-violet-600/15 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/10 rounded-full filter blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-start gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-xl shadow-violet-500/30 flex-shrink-0">
              <Bot size={26} color="white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Advisor</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Gemini Business Intelligence</p>
            </div>
          </div>

          {/* Insight Box */}
          <div className="relative z-10 flex-1 mb-8">
            {aiInsight ? (
              <div
                style={{
                  height: "100%",
                  padding: "24px",
                  borderRadius: "20px",
                  background: isDark ? "rgba(15,23,42,0.6)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(30,41,59,0.8)" : "1px solid #e2e8f0",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-violet-500" />
                  <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {aiInsight}
                </p>
              </div>
            ) : (
              <div
                style={{
                  height: "100%",
                  padding: "24px",
                  borderRadius: "20px",
                  background: isDark ? "rgba(15,23,42,0.6)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(30,41,59,0.8)" : "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "14px",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">READY TO ANALYZE</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Get a real-time AI summary and strategic recommendation based on your current revenue & inventory data.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-1">
                  {["Revenue", "Orders", "Inventory", "Growth"].map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "10px",
                        background: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0",
                        color: isDark ? "#94a3b8" : "#475569",
                        border: isDark ? "1px solid rgba(51,65,85,0.6)" : "1px solid #cbd5e1",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="relative z-10 space-y-3">
            <button
              onClick={fetchAIInsight}
              disabled={loadingInsight}
              style={{
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px -4px rgba(99,102,241,0.35)",
              }}
            >
              {loadingInsight ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span style={{ color: "#ffffff" }}>Analyzing business data...</span>
                </>
              ) : (
                <>
                  <Bot size={18} color="white" />
                  <span style={{ color: "#ffffff" }}>{aiInsight ? "Refresh AI Insight" : "Generate AI Insight"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/ai-assistant")}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/8 rounded-xl transition-all"
            >
              Open full AI Chat Assistant <ArrowRight size={14} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;