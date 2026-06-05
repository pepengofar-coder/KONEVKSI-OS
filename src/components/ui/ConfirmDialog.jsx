import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Batal', variant = 'primary' }) {
  const buttonVariants = {
    primary: 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/20 text-white hover:scale-105 active:scale-95',
    error: 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/20 text-white hover:scale-105 active:scale-95',
    success: 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20 text-white hover:scale-105 active:scale-95',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-slate-300 mb-8 font-medium leading-relaxed">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/[0.06] hover:text-white transition-all duration-200"
        >
          {cancelText}
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${buttonVariants[variant]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

