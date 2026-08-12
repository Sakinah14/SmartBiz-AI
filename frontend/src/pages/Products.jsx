import { useEffect, useState, useRef } from "react";
import { Plus, Package, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

const emptyForm = { name: "", price: "", quantity: "", category: "", description: "", imageUrl: "" };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      category: p.category || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
    });
    setImagePreview(p.imageUrl || "");
    setEditId(p._id);
    setIsModalOpen(true);
  };

  // Convert uploaded file to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/products/${editId}`, form);
      } else {
        await api.post("/products", form);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const columns = [
    {
      key: "image",
      label: "",
      render: (r) =>
        r.imageUrl ? (
          <img
            src={r.imageUrl}
            alt={r.name}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              objectFit: "cover",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          />
        ) : (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={18} color="#6366f1" />
          </div>
        ),
    },
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", render: (r) => r.category || "—" },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (r) => <span className="font-bold text-white">₹{Number(r.price).toLocaleString()}</span>,
    },
    {
      key: "quantity",
      label: "Stock",
      sortable: true,
      render: (r) => (
        <Badge
          status={r.quantity <= 5 ? "low" : "in-stock"}
          label={r.quantity <= 5 ? `${r.quantity} (Low)` : r.quantity.toString()}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
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
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your product inventory</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Total Products", value: products.length, color: "from-indigo-500 to-violet-500", border: "border-indigo-500/20" },
          { label: "In Stock", value: products.filter((p) => p.quantity > 5).length, color: "from-emerald-500 to-teal-500", border: "border-emerald-500/20" },
          { label: "Low Stock", value: products.filter((p) => p.quantity <= 5 && p.quantity > 0).length, color: "from-amber-500 to-orange-500", border: "border-amber-500/20" },
          { label: "Out of Stock", value: products.filter((p) => p.quantity === 0).length, color: "from-rose-500 to-pink-500", border: "border-rose-500/20" },
        ].map((s) => (
          <div key={s.label} className={`glass-card rounded-2xl px-5 py-6 border ${s.border} transition-all duration-200 hover:-translate-y-0.5`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{s.label}</p>
            <p className={`text-3xl font-black bg-gradient-to-r ${s.color} text-transparent bg-clip-text leading-none`}>
              {s.value}
            </p>
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
            data={products}
            searchable
            searchKeys={["name", "category"]}
            emptyMessage="No products found. Add your first product!"
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? "Edit Product" : "Add New Product"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: "8px",
              }}
            >
              Product Image
            </label>

            {imagePreview ? (
              /* Preview */
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "180px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(15,23,42,0.85)",
                    border: "1px solid rgba(244,63,94,0.4)",
                    borderRadius: "8px",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fb7185",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Upload dropzone */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "28px 16px",
                  borderRadius: "14px",
                  border: "2px dashed rgba(99,102,241,0.3)",
                  background: "rgba(99,102,241,0.05)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)";
                  e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                  e.currentTarget.style.background = "rgba(99,102,241,0.05)";
                }}
              >
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "rgba(99,102,241,0.15)",
                    color: "#818cf8",
                  }}
                >
                  <ImagePlus size={22} />
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#a5b4fc" }}>
                    Click to upload product image
                  </p>
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    PNG, JPG, WEBP · Max 2MB
                  </p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          <Input
            label="Product Name"
            placeholder="e.g. Wireless Headphones"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={Package}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              label="Quantity"
              type="number"
              placeholder="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>
          <Input
            label="Category"
            placeholder="e.g. Electronics"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Description (optional)"
            placeholder="Short product description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editId ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Products;