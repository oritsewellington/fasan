import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Hash } from "lucide-react";
import { Modal } from "../ui/index.jsx";
import {
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
} from "../../store/api/candidatesApi.js";

export default function CandidateFormModal({
  open,
  onClose,
  eventId,
  candidate,
  nextCandidateNumber,
}) {
  const isEdit = !!candidate;
  const [form, setForm] = useState(emptyForm());
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [createCandidate, { isLoading: creating }] =
    useCreateCandidateMutation();
  const [updateCandidate, { isLoading: updating }] =
    useUpdateCandidateMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (candidate) {
      setForm({
        name: candidate.name || "",
        department: candidate.department || "",
        level: candidate.level || "",
      });
      setPhotoPreview(candidate.photo || "");
    } else {
      setForm(emptyForm());
      setPhotoPreview("");
    }
    setPhotoFile(null);
  }, [candidate, open]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Candidate name is required.");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("department", form.department);
    fd.append("level", form.level);
    if (photoFile) fd.append("photo", photoFile);

    try {
      if (isEdit)
        await updateCandidate({
          eventId,
          candidateId: candidate._id,
          formData: fd,
        }).unwrap();
      else await createCandidate({ eventId, formData: fd }).unwrap();
      toast.success(isEdit ? "Candidate updated." : "Candidate added.");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Save failed.");
    }
  };

  const previewCode = isEdit
    ? candidate.candidateCode ||
      `FASA-${String(candidate.candidateNumber).padStart(4, "0")}`
    : `FASA-${String(nextCandidateNumber || 1).padStart(4, "0")}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Candidate" : "Add Candidate"}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Auto candidate number preview */}
        <div className="flex items-center gap-2 bg-gold-50 border border-gold-100 rounded-xl px-4 py-2.5">
          <Hash size={14} className="text-gold-600" />
          <span className="text-xs text-gold-700">
            {isEdit ? "Candidate number" : "Auto-assigned candidate number"}:{" "}
            <strong>{previewCode}</strong>
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Photo
          </label>
          <label className="flex items-center justify-center h-40 w-32 mx-auto rounded-xl border-2 border-dashed border-gray-200 hover:border-gold-300 cursor-pointer overflow-hidden bg-gray-50">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="text-center">
                <ImageIcon size={20} className="text-gray-300 mx-auto mb-1" />
                <p className="text-2xs text-gray-400">Upload photo</p>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Candidate's full name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Department
            </label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input-field"
              placeholder="e.g. Theatre Arts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Level
            </label>
            <input
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="input-field"
              placeholder="e.g. 300L"
            />
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
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add candidate"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function emptyForm() {
  return { name: "", department: "", level: "" };
}
