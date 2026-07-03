import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  AlertCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { Modal } from "../ui/index.jsx";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "../../store/api/eventsApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoriesApi.js";
import { selectCurrentUser } from "../../store/slices/authSlice.js";

import "react-datepicker/dist/react-datepicker.css";

export default function EventFormModal({ open, onClose, event }) {
  const isEdit = !!event;
  const currentUser = useSelector(selectCurrentUser);
  const [form, setForm] = useState(emptyForm());
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const { data: categories = [], isLoading: catLoading } =
    useGetCategoriesQuery(undefined, { skip: !open });

  const [createEvent, { isLoading: creating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        organization: event.organization || "",
        categoryId: event.categoryId || "",
        category: event.category || "",
        startDate: event.startDate ? new Date(event.startDate) : null,
        endDate: event.endDate ? new Date(event.endDate) : null,
        pricePerVote: event.pricePerVote
          ? (event.pricePerVote / 100).toString()
          : "",
      });
      setBannerPreview(event.bannerImage || "");
    } else {
      setForm(emptyForm());
      setBannerPreview("");
    }
    setBannerFile(null);
  }, [event, open]);

  const handleCategoryChange = (catId) => {
    const cat = categories.find((c) => c._id === catId);
    setForm((f) => ({
      ...f,
      categoryId: catId,
      category: cat?.name || "",
      title: f.title || (cat ? `${cat.name} 2026` : ""),
      description: f.description || cat?.description || "",
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.organization ||
      !form.startDate ||
      !form.endDate ||
      !form.pricePerVote
    ) {
      return toast.error("Please fill in all required fields.");
    }
    if (form.endDate <= form.startDate) {
      return toast.error("End date must be after start date.");
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("organization", form.organization);
    fd.append("category", form.category);
    fd.append("categoryId", form.categoryId);
    fd.append("startDate", form.startDate.toISOString());
    fd.append("endDate", form.endDate.toISOString());
    fd.append("pricePerVote", Math.round(parseFloat(form.pricePerVote) * 100));
    if (bannerFile) fd.append("banner", bannerFile);

    try {
      if (isEdit) {
        await updateEvent({ id: event._id, formData: fd }).unwrap();
      } else {
        await createEvent(fd).unwrap();
      }
      toast.success(isEdit ? "Event updated." : "Event created.");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Save failed.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Event" : "Create Award Event"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Banner image
          </label>
          <label className="flex items-center justify-center h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-gold-300 cursor-pointer overflow-hidden bg-gray-50 transition-colors">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <ImageIcon size={24} className="text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Click to upload banner</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        </div>

        {/* Category selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Award category *
          </label>
          {catLoading ? (
            <div className="input-field text-gray-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3">
              <AlertCircle
                size={15}
                className="text-amber-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-700">
                No categories exist yet. Create one first, then come back to
                attach it to this event.{" "}
                <Link
                  to="/admin/categories"
                  className="font-semibold underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Categories
                </Link>
              </p>
            </div>
          ) : (
            <select
              value={form.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.emoji ? `${c.emoji} ` : ""}
                  {c.name} {c.group ? `· ${c.group}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Event title *
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
            placeholder="e.g. Most Popular FASAN (Male) 2026"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="input-field resize-none"
            placeholder="Short description (optional)"
          />
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Organization *
          </label>
          <input
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="input-field"
            placeholder="Faculty of Arts, UNIBEN"
            required
          />
        </div>

        {/* Custom Rich DatePicker Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative z-[50]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start date *
            </label>
            <div className="relative">
              <DatePicker
                selected={form.startDate}
                onChange={(date) => setForm({ ...form, startDate: date })}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                placeholderText="Select start date & time"
                className="input-field w-full pl-10"
                required
              />
              <CalendarIcon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="relative z-[50]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              End date *
            </label>
            <div className="relative">
              <DatePicker
                selected={form.endDate}
                onChange={(date) => setForm({ ...form, endDate: date })}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                placeholderText="Select end date & time"
                className="input-field w-full pl-10"
                minDate={form.startDate || new Date()}
                required
              />
              <CalendarIcon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Price Per Vote */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Price per vote (₦) *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={form.pricePerVote}
            onChange={(e) => setForm({ ...form, pricePerVote: e.target.value })}
            className="input-field"
            placeholder="50"
            required
          />
        </div>

        {/* Action Buttons */}
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
            disabled={saving || categories.length === 0}
            className="btn-primary flex-1"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create event"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function emptyForm() {
  return {
    title: "",
    description: "",
    organization: "",
    categoryId: "",
    category: "",
    startDate: null,
    endDate: null,
    pricePerVote: "",
  };
}
