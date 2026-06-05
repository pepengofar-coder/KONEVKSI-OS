export default function Badge({ children, variant = 'default', icon, className = '' }) {
  const variants = {
    default: 'bg-white/[0.06] text-slate-300 border border-white/[0.06]',
    primary: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    secondary: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  const v = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${v} ${className}`}>
      {icon && <span className="material-symbols-outlined text-[12px]">{icon}</span>}
      {children}
    </span>
  );
}
