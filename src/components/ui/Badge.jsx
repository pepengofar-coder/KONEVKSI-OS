export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/[0.06] text-slate-300 border border-white/[0.04]',
    primary: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

