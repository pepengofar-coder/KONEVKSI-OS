export default function FAB({ onClick, icon = 'add', label, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ${label ? 'pl-5 pr-6 py-3.5' : 'p-4'} ${className}`}
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {label && <span className="text-sm font-bold tracking-wide">{label}</span>}
    </button>
  );
}

