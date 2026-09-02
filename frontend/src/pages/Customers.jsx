import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Users, Pencil, Trash2, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const emptyForm = { name: "", email: "", phone: "", address: "" };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [segments, setSegments] = useState({});
  const [segmentsLoading, setSegmentsLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/customers");
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      setSegmentsLoading(true);
      const { data } = await api.get("/customer-segments");
      const byId = {};
      data.forEach((s) => { byId[s._id] = s; });
      setSegments(byId);
    } catch (err) {
      console.error(err);
    } finally {
      setSegmentsLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); fetchSegments(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setIsModalOpen(true); };
  const openEdit = (c) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" });
    setEditId(c._id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, form);
        toast.success("Customer updated");
      } else {
        await api.post("/customers", form);
        toast.success("Customer added");
      }
      setIsModalOpen(false);
      fetchCustomers();
      fetchSegments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      fetchCustomers();
      fetchSegments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting customer");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name", label: "Customer", sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="font-medium text-white">{r.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (r) => r.email || "—" },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "address", label: "Address", render: (r) => r.address || "—" },
    {
      key: "segment",
      label: "Segment",
      render: (r) => {
        if (segmentsLoading) {
          return <span className="text-xs text-slate-500">—</span>;
        }
        const segment = segments[r._id]?.segment;
        if (!segment) return <span className="text-xs text-slate-500">—</span>;
        return <Badge status={segment} label={segment} />;
      },
    },
    {
      key: "actions", label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} aria-label={`Edit ${r.name}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleteTarget(r)} aria-label={`Delete ${r.name}`} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="@container w-full min-w-0">
        <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-white truncate">Customers</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage your customer relationships</p>
          </div>
          <Button onClick={openAdd} className="w-full @lg:w-auto flex-shrink-0">
            <Plus size={16} />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Total count card */}
      <div className="glass rounded-xl p-5 border border-slate-700/30 flex items-center gap-4 flex-wrap">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
          <Users size={22} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Total Customers</p>
          <p className="text-3xl font-black text-white">{customers.length}</p>
        </div>
        <div className="flex items-center gap-1.5 ml-auto text-xs text-violet-400 font-medium">
          <Sparkles size={13} />
          Segments trained on your order history (k-means)
        </div>
      </div>

      <Card className="!p-4 sm:!p-5 lg:!p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={customers}
            searchable
            searchKeys={["name", "email", "phone"]}
            emptyMessage="No customers yet. Add your first customer!"
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Customer name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={Users}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="customer@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            icon={Mail}
          />
          <Input
            label="Phone"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            icon={Phone}
          />
          <Input
            label="Address"
            placeholder="City, State"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            icon={MapPin}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editId ? "Save Changes" : "Add Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete customer?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed.` : ""}
      />
    </div>
  );
}

export default Customers;