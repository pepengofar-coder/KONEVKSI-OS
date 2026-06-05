export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-4xl text-slate-400">{icon}</span>
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-200 mb-1.5">{title}</h3>
      {description && <p className="text-xs md:text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
        >
          {action.icon && <span className="material-symbols-outlined text-[18px]">{action.icon}</span>}
          {action.label}
        </button>
      )}
    </div>
  );
}
