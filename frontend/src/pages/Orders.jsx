import { useEffect, useState } from "react";
import { Plus, ShoppingCart, Trash2, ChevronDown } from "lucide-react";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New order form
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderItems, setOrderItems] = useState([]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [o, c, p] = await Promise.all([
        api.get("/orders"),
        api.get("/customers"),
        api.get("/products"),
      ]);
      setOrders(o.data);
      setCustomers(c.data);
      setProducts(p.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem = () => {
    if (!selectedProduct) return;
    const prod = products.find((p) => p._id === selectedProduct);
    if (!prod) return;
    const existing = orderItems.find((i) => i.product === selectedProduct);
    if (existing) {
      setOrderItems(orderItems.map((i) => i.product === selectedProduct ? { ...i, quantity: i.quantity + Number(quantity) } : i));
    } else {
      setOrderItems([...orderItems, { product: selectedProduct, name: prod.name, price: prod.price, quantity: Number(quantity) }]);
    }
    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (productId) => setOrderItems(orderItems.filter((i) => i.product !== productId));

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    let finalItems = [...orderItems];
    if (finalItems.length === 0 && selectedProduct) {
      const prod = products.find((p) => p._id === selectedProduct);
      if (prod) {
        finalItems.push({
          product: selectedProduct,
          name: prod.name,
          price: prod.price,
          quantity: Number(quantity),
        });
      }
    }

    if (!selectedCustomer || finalItems.length === 0) {
      alert("Please select a customer and select at least one product.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/orders", {
        customer: selectedCustomer,
        products: finalItems.map((i) => ({ product: i.product, quantity: i.quantity })),
        paymentMethod,
      });
      setIsModalOpen(false);
      setOrderItems([]);
      setSelectedCustomer("");
      setSelectedProduct("");
      setPaymentMethod("Cash");
      setQuantity(1);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating order");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    await api.delete(`/orders/${id}`);
    fetchAll();
  };

  const totalItems = orderItems.reduce((s, i) => s + i.quantity * i.price, 0);

  const columns = [
    { key: "_id", label: "Order ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r._id?.slice(-6)?.toUpperCase()}</span> },
    { key: "customer", label: "Customer", sortable: true, render: (r) => r.customer?.name || "—" },
    { key: "totalAmount", label: "Amount", sortable: true, render: (r) => <span className="font-bold text-white">₹{r.totalAmount?.toLocaleString()}</span> },
    { key: "paymentMethod", label: "Payment", render: (r) => <span className="capitalize text-slate-400 text-xs">{r.paymentMethod}</span> },
    {
      key: "status", label: "Status",
      render: (r) => {
        const currentStatus = r.status || r.orderStatus || "Pending";
        return (
          <div className="relative group">
            <select
              value={currentStatus}
              onChange={(e) => handleUpdateStatus(r._id, e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {["Pending", "Processing", "Completed", "Delivered", "Cancelled"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        );
      },
    },
    { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN") },
    {
      key: "actions", label: "",
      render: (r) => (
        <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  const getCount = (st) =>
    orders.filter((o) => (o.status || o.orderStatus || "").toLowerCase() === st.toLowerCase()).length;

  const statusCounts = {
    total: orders.length,
    pending: getCount("Pending"),
    completed: getCount("Completed"),
    delivered: getCount("Delivered"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all customer orders</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New Order
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Total Orders", value: statusCounts.total, color: "from-indigo-500 to-violet-500", border: "border-indigo-500/20" },
          { label: "Pending", value: statusCounts.pending, color: "from-amber-500 to-orange-500", border: "border-amber-500/20" },
          { label: "Completed", value: statusCounts.completed, color: "from-emerald-500 to-teal-500", border: "border-emerald-500/20" },
          { label: "Delivered", value: statusCounts.delivered, color: "from-cyan-500 to-blue-500", border: "border-cyan-500/20" },
        ].map((s) => (
          <div key={s.label} className={`glass-card rounded-2xl px-5 py-6 border ${s.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{s.label}</p>
            <p className={`text-3xl font-black bg-gradient-to-r ${s.color} text-transparent bg-clip-text leading-none`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card className="!p-4 sm:!p-5 lg:!p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={orders}
            searchable
            searchKeys={["status"]}
            emptyMessage="No orders yet. Create your first order!"
          />
        )}
      </Card>

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setOrderItems([]); }}
        title="Create New Order"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {/* Customer */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Customer *</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Add Product */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 space-y-3">
            <p className="text-sm font-semibold text-white">Add Products</p>
            <div className="flex gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="">Select product</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price} ({p.quantity} left)</option>)}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center"
              />
              <button type="button" onClick={addItem} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors">
                <Plus size={16} />
              </button>
            </div>

            {orderItems.length > 0 && (
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.product} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.name} × {item.quantity}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button type="button" onClick={() => removeItem(item.product)} className="text-rose-400 hover:text-rose-300">×</button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-700/40 flex justify-between font-bold">
                  <span className="text-slate-400">Total</span>
                  <span className="text-white">₹{totalItems.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Create Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Orders;