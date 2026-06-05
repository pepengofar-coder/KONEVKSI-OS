import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Batal', variant = 'primary' }) {
  const buttonVariants = {
    primary: 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/20 text-white hover:scale-[1.02] active:scale-[0.98]',
    error: 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/20 text-white hover:scale-[1.02] active:scale-[0.98]',
    success: 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20 text-white hover:scale-[1.02] active:scale-[0.98]',
  };

  const iconConfig = {
    primary: { icon: 'help', color: 'text-purple-400 bg-purple-500/10' },
    error: { icon: 'warning', color: 'text-red-400 bg-red-500/10' },
    success: { icon: 'check_circle', color: 'text-emerald-400 bg-emerald-500/10' },
  };

  const ic = iconConfig[variant] || iconConfig.primary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${ic.color} flex items-center justify-center mb-4`}>
          <span className="material-symbols-outlined text-[28px]">{ic.icon}</span>
        </div>
        
        <p className="text-sm text-slate-300 mb-8 font-medium leading-relaxed">{message}</p>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/[0.06] hover:text-white border border-white/[0.06] transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${buttonVariants[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
