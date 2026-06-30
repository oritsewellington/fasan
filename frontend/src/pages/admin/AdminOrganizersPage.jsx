import { useState } from "react";
import { Plus, Users, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  useGetOrganizersQuery,
  useCreateOrganizerMutation,
  useUpdateCommissionMutation,
} from "../../store/api/authApi.js";
import { PageLoader, EmptyState, Modal } from "../../components/ui/index.jsx";
import { formatNaira } from "../../utils/helpers.js";

export default function AdminOrganizersPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: organizers = [], isLoading } = useGetOrganizersQuery();

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Organizers
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Add Organizer
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : organizers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No organizers yet"
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={15} /> Add organizer
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {organizers.map((org) => (
            <OrganizerCard key={org._id} organizer={org} />
          ))}
        </div>
      )}

      <CreateOrganizerModal
        open={showForm}
        onClose={() => setShowForm(false)}
      />
    </div>
  );
}

function OrganizerCard({ organizer }) {
  const [editing, setEditing] = useState(false);
  const [commission, setCommission] = useState(
    (organizer.platformCommission * 100).toString(),
  );
  const [updateCommission, { isLoading }] = useUpdateCommissionMutation();

  const handleSave = async () => {
    const val = parseFloat(commission) / 100;
    if (isNaN(val) || val < 0 || val > 1)
      return toast.error("Enter a value between 0 and 100.");
    try {
      await updateCommission({
        organizerId: organizer._id,
        commission: val,
      }).unwrap();
      toast.success("Commission updated.");
      setEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Update failed.");
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gold-50 text-gold-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
          {organizer.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {organizer.name}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
            <Mail size={11} />
            {organizer.email}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-400 mb-0.5">Events</p>
          <p className="font-bold text-gray-900">
            {organizer.totalEvents || 0}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-400 mb-0.5">Earnings</p>
          <p className="font-bold text-gray-900">
            {formatNaira(organizer.totalEarnings || 0)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <span className="text-xs text-gray-500">Platform commission</span>
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg"
            />
            <span className="text-xs text-gray-400">%</span>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="text-xs font-semibold text-gold-600"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-gray-900 hover:text-gold-600"
          >
            {(organizer.platformCommission * 100).toFixed(0)}%{" "}
            <span className="text-gray-400 ml-0.5">✏</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CreateOrganizerModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    commission: "15",
  });
  const [createOrganizer, { isLoading }] = useCreateOrganizerMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("Fill in all fields.");
    try {
      await createOrganizer({
        name: form.name,
        email: form.email,
        password: form.password,
        platformCommission: parseFloat(form.commission) / 100,
      }).unwrap();
      toast.success("Organizer created.");
      setForm({ name: "", email: "", password: "", commission: "15" });
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Creation failed.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Organizer"
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Platform commission (%)
          </label>
          <input
            type="number"
            value={form.commission}
            onChange={(e) => setForm({ ...form, commission: e.target.value })}
            className="input-field"
            min="0"
            max="100"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
