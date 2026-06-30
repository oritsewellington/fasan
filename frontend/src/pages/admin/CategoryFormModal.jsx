import { useState, useEffect } from "react";
import { toast } from "sonner";
import Modal from "../../components/ui/Modal.jsx";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../../store/api/categoriesApi.js";

const SUGGESTED_GROUPS = [
  "Popularity",
  "Social",
  "Leadership",
  "Fashion",
  "Creative",
  "Business",
  "Academic",
  "Sports",
  "General",
];

const SUGGESTED_EMOJI = [
  "🏆",
  "👑",
  "⭐",
  "🎨",
  "🎤",
  "💼",
  "📖",
  "✨",
  "🤝",
  "👗",
];

export default function CategoryFormModal({ open, onClose, category }) {
  const isEdit = !!category;
  const [form, setForm] = useState(emptyForm());

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        group: category.group || "",
        emoji: category.emoji || "🏆",
        description: category.description || "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [category, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required.");
    if (!form.group.trim()) return toast.error("Pick or type a group.");

    try {
      if (isEdit) {
        await updateCategory({ categoryId: category._id, ...form }).unwrap();
        toast.success("Category updated.");
      } else {
        await createCategory(form).unwrap();
        toast.success(
          "Category created — it's now ready to attach to an event.",
        );
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Save failed.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "New Award Category"}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category name *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. Most Innovative FASA"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Group *
          </label>
          <input
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value })}
            className="input-field"
            placeholder="e.g. Leadership"
            list="category-group-suggestions"
            required
          />
          <datalist id="category-group-suggestions">
            {SUGGESTED_GROUPS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          <p className="text-xs text-gray-400 mt-1">
            Groups are used to filter categories on the homepage. Reuse an
            existing group, or type a new one.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input-field resize-none"
            placeholder="What this category recognizes, e.g. Honors the student whose leadership and vision have shaped..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Shown to voters on the category and event pages — a short,
            professional sentence works best.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Icon
          </label>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gold-50 border border-gold-100 flex items-center justify-center text-xl flex-shrink-0">
              {form.emoji || "🏆"}
            </div>
            <input
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="input-field"
              placeholder="Paste an emoji"
              maxLength={4}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_EMOJI.map((em) => (
              <button
                type="button"
                key={em}
                onClick={() => setForm({ ...form, emoji: em })}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base transition-all ${
                  form.emoji === em
                    ? "border-gold-400 bg-gold-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
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
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create category"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function emptyForm() {
  return { name: "", group: "", emoji: "🏆", description: "" };
}
