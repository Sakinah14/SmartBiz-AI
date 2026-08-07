import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import api from "../services/api";
import Card from "../components/ui/Card";

const COLORS = ["#6366f1", "#f43f5e", "#10b981"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 border border-indigo-500/20 text-sm">
        <p className="text-slate-400 mb-1 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: ₹{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const chartData = [
  { month: "Feb", revenue: 42000, expenses: 18000, profit: 24000 },
  { month: "Mar", revenue: 55000, expenses: 22000, profit: 33000 },
  { month: "Apr", revenue: 38000, expenses: 15000, profit: 23000 },
  { month: "May", revenue: 71000, expenses: 28000, profit: 43000 },
  { month: "Jun", revenue: 63000, expenses: 24000, profit: 39000 },
  { month: "Jul", revenue: 84000, expenses: 30000, profit: 54000 },
];

function Reports() {
  const [report, setReport] = useState({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/reports");
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const pieData = [
    { name: "Revenue", value: report.totalRevenue },
    { name: "Expenses", value: report.totalExpenses },
    { name: "Profit", value: Math.max(0, report.profit) },
  ];

  const profitMargin = report.totalRevenue > 0
    ? ((report.profit / report.totalRevenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <p className="text-slate-400 text-sm mt-0.5">Business performance overview and analytics</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6 border border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Revenue</p>
                  <p className="text-3xl font-black text-white mt-1">₹{report.totalRevenue?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
                  <DollarSign size={22} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Gross income from all orders</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-rose-500/20 hover:shadow-lg hover:shadow-rose-500/10 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Expenses</p>
                  <p className="text-3xl font-black text-white mt-1">₹{report.totalExpenses?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500">
                  <TrendingDown size={22} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Total cost of operations</p>
            </div>

            <div className={`glass rounded-2xl p-6 border ${report.profit >= 0 ? "border-emerald-500/20" : "border-rose-500/20"} hover:shadow-lg transition-all hover:-translate-y-1`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Net Profit</p>
                  <p className={`text-3xl font-black mt-1 ${report.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    ₹{report.profit?.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${report.profit >= 0 ? "from-emerald-500 to-teal-500" : "from-rose-500 to-pink-500"}`}>
                  <TrendingUp size={22} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${report.profit >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {profitMargin}% margin
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Revenue vs Expenses Trend */}
            <Card className="xl:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">Revenue vs Expenses Trend</h2>
                  <p className="text-xs text-slate-400 mt-0.5">6-month comparison</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="revenue" name="Revenue" fill="url(#gradRev)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="url(#gradExp)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card>
              <h2 className="text-base font-bold text-white mb-2">Financial Split</h2>
              <p className="text-xs text-slate-400 mb-4">Revenue, expenses & profit</p>
              {report.totalRevenue > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value?.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data</div>
              )}
              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-slate-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-white">₹{d.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Profit trend */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Profit Trend</h2>
                <p className="text-xs text-slate-400 mt-0.5">Monthly net profit</p>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart2 size={16} className="text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold">+{profitMargin}% avg margin</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2.5} fill="url(#colorProfit)" dot={{ fill: "#10b981", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}

export default Reports;