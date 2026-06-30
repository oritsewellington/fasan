import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-4 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-gold-50'}`}>
          <AlertTriangle size={18} className={danger ? 'text-red-500' : 'text-gold-600'} />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`}
        >
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processingâ€¦</> : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
