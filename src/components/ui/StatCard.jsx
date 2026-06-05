export default function StatCard({ icon, label, value, subtitle, variant = 'default', className = '' }) {
  const glowVariants = {
    default: 'from-slate-500/10 to-slate-400/0 hover:border-slate-500/30',
    primary: 'from-purple-500/20 to-purple-500/0 hover:border-purple-500/30 text-purple-300',
    tertiary: 'from-cyan-500/20 to-cyan-500/0 hover:border-cyan-500/30 text-cyan-300',
    secondary: 'from-cyan-500/20 to-cyan-500/0 hover:border-cyan-500/30 text-cyan-300',
    warning: 'from-amber-500/20 to-amber-500/0 hover:border-amber-500/30 text-amber-300',
  };

  const borders = {
    default: 'border-white/[0.08] hover:border-white/[0.15]',
    primary: 'border-white/[0.08] hover:border-purple-500/30',
    tertiary: 'border-white/[0.08] hover:border-cyan-500/30',
    secondary: 'border-white/[0.08] hover:border-cyan-500/30',
    warning: 'border-white/[0.08] hover:border-amber-500/30',
  };

  const textColors = {
    default: 'text-slate-100',
    primary: 'text-purple-400',
    tertiary: 'text-cyan-400',
    secondary: 'text-cyan-400',
    warning: 'text-amber-400',
  };

  return (
    <div className={`relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border ${borders[variant]} p-5 md:p-6 rounded-3xl overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/20 ${className}`}>
      {/* Glow effect at top-right */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${glowVariants[variant]} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700`} />
      
      <div className="relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">{label}</p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">{value}</h3>
        {subtitle && <p className="text-[10px] mt-2 text-slate-400 font-medium tracking-wide">{subtitle}</p>}
      </div>
      {icon && (
        <span className={`material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.05] transition-all duration-500 group-hover:scale-115 group-hover:opacity-[0.08] ${textColors[variant]}`}>
          {icon}
        </span>
      )}
    </div>
  );
}

