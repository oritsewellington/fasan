import { useState } from "react";
import { Plus, Users, Mail, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  useGetStaffQuery,
  useCreateStaffMutation,
  useDeleteStaffMutation,
} from "../../store/api/authApi.js";
import {
  PageLoader,
  EmptyState,
  Modal,
  ConfirmDialog,
} from "../../components/ui/index.jsx";
import { formatShortDate } from "../../utils/helpers.js";

export default function AdminStaffPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data: staff = [], isLoading } = useGetStaffQuery();
  const [deleteStaff, { isLoading: deleting }] = useDeleteStaffMutation();

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteTarget._id).unwrap();
      toast.success("Staff access revoked.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove access.");
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Staff
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Staff accounts can create and manage all events, categories, and
            candidates — there's no per-person ownership.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff accounts yet"
          description="Seed a login for the people helping you manage this year's awards."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={15} /> Add staff
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map((member) => (
            <div key={member._id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gold-50 text-gold-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                    <Mail size={11} />
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Added {formatShortDate(member.createdAt)}
                </span>
                <button
                  onClick={() => setDeleteTarget(member)}
                  className="flex items-center gap-1 text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  <Trash2 size={12} /> Remove access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateStaffModal open={showForm} onClose={() => setShowForm(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove staff access?"
        message={`${deleteTarget?.name} will no longer be able to log in or manage events. This cannot be undone.`}
        confirmLabel="Remove access"
        danger
        loading={deleting}
      />
    </div>
  );
}

function CreateStaffModal({ open, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [createStaff, { isLoading }] = useCreateStaffMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("Fill in all fields.");
    try {
      await createStaff(form).unwrap();
      toast.success("Staff account created.");
      setForm({ name: "", email: "", password: "" });
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Creation failed.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Staff" maxWidth="max-w-sm">
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
