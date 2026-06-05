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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      {/* Sheet */}
      <div className="relative w-full md:max-w-lg bg-surface-container-lowest rounded-t-[2rem] md:rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto animate-slide-up md:animate-scale-in shadow-2xl">
        {/* Handle (mobile) */}
        <div className="md:hidden flex justify-center mb-4">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-outline"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {/* Content */}
        {children}
      </div>
    </div>
  );
}
