import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Trophy, PackageSearch, Download, Sparkles, CheckCircle2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import api from "../services/api";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import { getMonthlySeries } from "../utils/analytics";

const TOP_PRODUCTS_LIMIT = 5;
const SLOW_PRODUCTS_LIMIT = 5;
const RECENT_SALES_WINDOW_DAYS = 30;
const REORDER_HORIZON_DAYS = 30;

function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCSV(filename, headers, rows) {
  const lines = [headers.map(csvEscape).join(",")];
  rows.forEach((row) => lines.push(row.map(csvEscape).join(",")));
  const csv = lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const dateStamp = () => new Date().toISOString().slice(0, 10);

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

function Reports() {
  const [report, setReport] = useState({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [perfLoading, setPerfLoading] = useState(true);
  const [productInsight, setProductInsight] = useState("");
  const [loadingProductInsight, setLoadingProductInsight] = useState(false);

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

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setPerfLoading(true);
        const [ordersRes, productsRes, expensesRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
          api.get("/expenses"),
        ]);
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
        setExpenses(expensesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPerfLoading(false);
      }
    };
    fetchPerformanceData();
  }, []);

  const pieData = [
    { name: "Revenue", value: report.totalRevenue },
    { name: "Expenses", value: report.totalExpenses },
    { name: "Profit", value: Math.max(0, report.profit) },
  ];

  const profitMargin = report.totalRevenue > 0
    ? ((report.profit / report.totalRevenue) * 100).toFixed(1)
    : 0;

  const monthlySeries = getMonthlySeries(orders, expenses, 6);

  // Product performance — completed orders only, cancelled orders excluded
  const completedOrders = orders.filter(
    (o) => (o.status || o.orderStatus || "Pending").toLowerCase() === "completed"
  );

  const salesByProduct = {};
  completedOrders.forEach((order) => {
    (order.products || []).forEach((item) => {
      const prod = item.product;
      if (!prod || !prod._id) return;
      const id = prod._id;
      if (!salesByProduct[id]) {
        salesByProduct[id] = { _id: id, name: prod.name || "Unknown product", quantitySold: 0, revenue: 0 };
      }
      salesByProduct[id].quantitySold += item.quantity || 0;
      salesByProduct[id].revenue += (item.price || 0) * (item.quantity || 0);
    });
  });

  const topProducts = Object.values(salesByProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, TOP_PRODUCTS_LIMIT)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const slowProducts = products
    .map((p) => ({
      _id: p._id,
      name: p.name,
      quantitySold: salesByProduct[p._id]?.quantitySold || 0,
    }))
    .sort((a, b) => a.quantitySold - b.quantitySold)
    .slice(0, SLOW_PRODUCTS_LIMIT);

  const topProductColumns = [
    { key: "rank", label: "#", render: (r) => <span className="font-bold text-slate-500">{r.rank}</span> },
    { key: "name", label: "Product", sortable: true, render: (r) => <span className="font-medium text-white">{r.name}</span> },
    { key: "quantitySold", label: "Qty Sold", sortable: true },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
      render: (r) => <span className="font-bold text-emerald-400">₹{r.revenue.toLocaleString()}</span>,
    },
  ];

  // Full catalog performance (completed orders only) — used for the Product Performance export
  const fullProductPerformance = products
    .map((p) => ({
      _id: p._id,
      name: p.name,
      category: p.category || "",
      quantitySold: salesByProduct[p._id]?.quantitySold || 0,
      revenue: salesByProduct[p._id]?.revenue || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  // Reorder suggestions — sales velocity from completed orders in the last
  // 30 days, projected against current stock. No ML, just arithmetic.
  const recentCutoff = new Date(Date.now() - RECENT_SALES_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentSalesByProduct = {};
  completedOrders.forEach((order) => {
    if (!order.createdAt || new Date(order.createdAt) < recentCutoff) return;
    (order.products || []).forEach((item) => {
      const prod = item.product;
      if (!prod || !prod._id) return;
      recentSalesByProduct[prod._id] = (recentSalesByProduct[prod._id] || 0) + (item.quantity || 0);
    });
  });

  const reorderSuggestions = products
    .map((p) => {
      const soldRecently = recentSalesByProduct[p._id] || 0;
      const dailyVelocity = soldRecently / RECENT_SALES_WINDOW_DAYS;
      const daysUntilStockout = dailyVelocity > 0 ? Math.floor(p.quantity / dailyVelocity) : null;
      return { _id: p._id, name: p.name, quantity: p.quantity, dailyVelocity, daysUntilStockout };
    })
    .filter((p) => p.daysUntilStockout !== null && p.daysUntilStockout <= REORDER_HORIZON_DAYS)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
    .slice(0, 6);

  const fetchProductInsight = async () => {
    setLoadingProductInsight(true);
    try {
      const topList = topProducts.length
        ? topProducts.map((p) => `${p.name} (₹${p.revenue.toLocaleString()} revenue, ${p.quantitySold} sold)`).join("; ")
        : "none yet";
      const slowList = slowProducts.length
        ? slowProducts.map((p) => `${p.name} (${p.quantitySold} sold)`).join("; ")
        : "none";
      const message = `Here is my product performance data from completed orders.\nTop performers: ${topList}.\nSlow movers: ${slowList}.\nGive me a 2-3 sentence analysis of what's working and one specific, actionable recommendation.`;
      const { data } = await api.post("/ai/chat", { message });
      setProductInsight(data.reply);
    } catch (err) {
      setProductInsight(err.response?.data?.message || "AI insight unavailable right now.");
    } finally {
      setLoadingProductInsight(false);
    }
  };

  const exportOrders = () => {
    const headers = ["Order ID", "Customer", "Payment Method", "Status", "Date", "Total Amount"];
    const rows = completedOrders.map((o) => [
      o._id,
      o.customer?.name || "—",
      o.paymentMethod || "—",
      o.status || o.orderStatus || "Completed",
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—",
      o.totalAmount ?? 0,
    ]);
    downloadCSV(`completed-orders-${dateStamp()}.csv`, headers, rows);
  };

  const exportInventory = () => {
    const headers = ["Product Name", "Category", "Price", "Stock Quantity", "Status"];
    const rows = products.map((p) => [
      p.name || "—",
      p.category || "—",
      p.price ?? 0,
      p.quantity ?? 0,
      p.quantity === 0 ? "Out of Stock" : p.quantity <= 5 ? "Low Stock" : "In Stock",
    ]);
    downloadCSV(`inventory-${dateStamp()}.csv`, headers, rows);
  };

  const exportProductPerformance = () => {
    const headers = ["Rank", "Product Name", "Category", "Quantity Sold", "Revenue"];
    const rows = fullProductPerformance.map((p) => [p.rank, p.name, p.category || "—", p.quantitySold, p.revenue]);
    downloadCSV(`product-performance-${dateStamp()}.csv`, headers, rows);
  };

  const exportExpenses = () => {
    const headers = ["Description", "Category", "Amount", "Date"];
    const rows = expenses.map((e) => [
      e.title || "—",
      e.category || "Other",
      e.amount ?? 0,
      e.date || e.createdAt ? new Date(e.date || e.createdAt).toLocaleDateString("en-IN") : "—",
    ]);
    downloadCSV(`expenses-${dateStamp()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-5">
      <div className="@container w-full min-w-0">
        <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-white truncate">Reports</h1>
            <p className="text-slate-400 text-sm mt-0.5">Business performance overview and analytics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportOrders}
              title="Export completed orders as CSV"
            >
              <Download size={14} />
              Orders
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportExpenses}
              title="Export expenses as CSV"
            >
              <Download size={14} />
              Expenses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportInventory}
              title="Export product inventory as CSV"
            >
              <Download size={14} />
              Inventory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportProductPerformance}
              title="Export product performance as CSV"
            >
              <Download size={14} />
              Performance
            </Button>
          </div>
        </div>
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
                <BarChart data={monthlySeries} barCategoryGap="30%" barGap={4}>
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
              <AreaChart data={monthlySeries}>
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

          {/* Product Performance */}
          <Card>
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-bold text-white">Product Performance</h2>
                <p className="text-xs text-slate-400 mt-0.5">Based on completed orders only</p>
              </div>
              <div className="flex items-center gap-3">
                {!perfLoading && completedOrders.length > 0 && (
                  <button
                    onClick={fetchProductInsight}
                    disabled={loadingProductInsight}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-all disabled:opacity-50"
                  >
                    {loadingProductInsight ? (
                      <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {productInsight ? "Refresh AI Insight" : "AI Insight"}
                  </button>
                )}
                <Trophy size={16} className="text-amber-400" />
              </div>
            </div>

            {productInsight && (
              <div className="mb-5 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-violet-400" />
                  <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{productInsight}</p>
              </div>
            )}

            {perfLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <PackageSearch size={30} className="text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">No completed orders yet</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Product performance will appear here once orders are marked Completed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
                {/* Top Performing Products — compact table */}
                <div className="xl:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Top Performing Products</h3>
                  <Table
                    columns={topProductColumns}
                    data={topProducts}
                    emptyMessage="No product sales in completed orders yet."
                  />
                </div>

                {/* Slow-Moving Products */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Slow-Moving Products</h3>
                  <div className="space-y-2">
                    {slowProducts.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60"
                      >
                        <span className="text-xs text-slate-300 truncate">{p.name}</span>
                        <span className="text-xs font-bold text-slate-500 flex-shrink-0">
                          {p.quantitySold} sold
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Reorder Suggestions */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Reorder Suggestions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Based on sales pace over the last 30 days</p>
              </div>
              <TrendingDown size={16} className="text-rose-400" />
            </div>

            {perfLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : reorderSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <CheckCircle2 size={30} className="text-emerald-500" />
                <p className="text-sm font-semibold text-slate-300">No products at risk of running out soon.</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  We'll flag items here once current stock is projected to run out within {REORDER_HORIZON_DAYS} days.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {reorderSuggestions.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.quantity} in stock · selling ~{p.dailyVelocity.toFixed(1)}/day
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        p.daysUntilStockout <= 7
                          ? "bg-rose-500/15 text-rose-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      ~{p.daysUntilStockout}d left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default Reports;