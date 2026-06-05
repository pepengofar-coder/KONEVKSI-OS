import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in px-0 md:px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
      {/* Sheet */}
      <div className="relative w-full md:max-w-lg bg-slate-900/90 backdrop-blur-2xl border-t md:border border-white/[0.08] rounded-t-[2rem] md:rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto animate-slide-up md:animate-scale-in shadow-2xl shadow-black/80 text-white z-10">
        {/* Handle (mobile) */}
        <div className="md:hidden flex justify-center mb-4">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-black text-slate-100 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {/* Content */}
        <div className="text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

