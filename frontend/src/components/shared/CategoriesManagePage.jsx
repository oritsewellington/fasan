import { useState } from "react";
import { Plus, Edit2, Trash2, Tag, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../../store/api/categoriesApi.js";
import { PageLoader, EmptyState, ConfirmDialog } from "../ui/index.jsx";
import CategoryFormModal from "../../pages/admin/CategoryFormModal.jsx";

export default function CategoriesManagePage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.group?.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce((acc, c) => {
    const key = c.group || "Uncategorized";
    acc[key] = acc[key] || [];
    acc[key].push(c);
    return acc;
  }, {});

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteTarget._id).unwrap();
      toast.success("Category deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Couldn't delete — it may still be attached to an event.",
      );
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Award Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create categories here so they're ready to pick from when you set up
            an event.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="input-field pl-10"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Add your first award category — it'll show up instantly in the event-creation form."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={15} /> New category
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {group}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((cat) => (
                  <div
                    key={cat._id}
                    className="card p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-100 flex items-center justify-center text-lg flex-shrink-0">
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {cat.eventCount || 0} event
                        {cat.eventCount === 1 ? "" : "s"} attached
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        category={editingCategory}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        message={`Delete "${deleteTarget?.name}"? Events already using it will keep their name, but it'll no longer appear when creating new events.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
