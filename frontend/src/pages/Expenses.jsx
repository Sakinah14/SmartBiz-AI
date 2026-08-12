import { useEffect, useState } from "react";
import { Plus, Wallet, Pencil, Trash2, Tag } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";

const CATEGORIES = ["Rent", "Salary", "Utilities", "Electricity", "Internet", "Marketing", "Supplies", "Transport", "Other"];
const emptyForm = { title: "", amount: "", category: "Other", date: "" };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 border border-rose-500/20 text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-rose-400 font-bold">₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/expenses");
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setIsModalOpen(true); };
  const openEdit = (e) => {
    setForm({ title: e.title, amount: e.amount, category: e.category || "Other", date: e.date?.split("T")[0] || "" });
    setEditId(e._id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/expenses/${editId}`, form);
      } else {
        await api.post("/expenses", form);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Build category chart data
  const categoryData = CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.amount > 0);

  const columns = [
    { key: "title", label: "Description", sortable: true, render: (r) => <span className="font-medium text-white">{r.title}</span> },
    {
      key: "category", label: "Category",
      render: (r) => (
        <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
          {r.category || "Other"}
        </span>
      ),
    },
    { key: "amount", label: "Amount", sortable: true, render: (r) => <span className="font-bold text-rose-400">₹{Number(r.amount).toLocaleString()}</span> },
    { key: "date", label: "Date", render: (r) => r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—" },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Expenses</h1>
          <p className="text-slate-400 text-sm mt-1">Track and categorize your business costs</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Expense
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl px-6 py-5 border border-rose-500/20 flex items-center gap-5 hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25 flex-shrink-0">
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Expenses</p>
            <p className="text-3xl font-black text-rose-400 leading-none">₹{totalExpenses.toLocaleString()}</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl px-6 py-5 border border-slate-700/30 hover:-translate-y-0.5 transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Total Records</p>
          <p className="text-3xl font-black text-white leading-none">{expenses.length}</p>
        </div>
        <div className="glass-card rounded-2xl px-6 py-5 border border-slate-700/30 hover:-translate-y-0.5 transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Average Expense</p>
          <p className="text-3xl font-black text-white leading-none">
            ₹{expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Chart + Table row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
        <Card>
          <h2 className="text-base font-bold text-white mb-4">By Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} barSize={18} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#f43f5e" radius={[0, 6, 6, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
          )}
        </Card>

        <Card className="xl:col-span-2 !p-4 sm:!p-5 lg:!p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <Table
              columns={columns}
              data={expenses}
              searchable
              searchKeys={["title", "category"]}
              emptyMessage="No expenses recorded yet."
            />
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? "Edit Expense" : "Add New Expense"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Office rent"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            icon={Tag}
            required
          />
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            icon={Wallet}
            required
          />
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editId ? "Save Changes" : "Add Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Expenses;