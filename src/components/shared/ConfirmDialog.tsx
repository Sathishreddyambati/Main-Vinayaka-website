import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3 mb-6">
        {danger && <AlertTriangle className="text-maroon-light shrink-0 mt-0.5" size={20} />}
        <p className="text-ivory/75 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-ivory/70 hover:text-ivory hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            danger ? 'bg-maroon hover:bg-maroon-light text-ivory' : 'bg-saffron hover:bg-saffron-light text-charcoal'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
