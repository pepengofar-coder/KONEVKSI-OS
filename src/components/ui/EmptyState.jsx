export default function EmptyState({ icon = 'inbox', title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5 shadow-inner">
        <span className="material-symbols-outlined text-4xl text-slate-400">{icon}</span>
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-xs md:text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>}
    </div>
  );
}

