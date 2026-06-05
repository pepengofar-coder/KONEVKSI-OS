import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Batal', variant = 'primary' }) {
  const buttonVariants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container',
    error: 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container',
    success: 'bg-tertiary text-on-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-on-surface-variant mb-8">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${buttonVariants[variant]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
