export default function StatCard({ icon, label, value, subtitle, trend, variant = 'default', className = '' }) {
  const config = {
    default: {
      glow: 'from-slate-500/10 to-slate-400/0',
      border: 'border-white/[0.06] hover:border-white/[0.15]',
      iconBg: 'bg-white/[0.06] text-slate-400',
      text: 'text-slate-100',
    },
    primary: {
      glow: 'from-purple-500/15 to-purple-500/0',
      border: 'border-white/[0.06] hover:border-purple-500/25',
      iconBg: 'bg-purple-500/10 text-purple-400',
      text: 'text-purple-400',
    },
    secondary: {
      glow: 'from-cyan-500/15 to-cyan-500/0',
      border: 'border-white/[0.06] hover:border-cyan-500/25',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      text: 'text-cyan-400',
    },
    tertiary: {
      glow: 'from-emerald-500/15 to-emerald-500/0',
      border: 'border-white/[0.06] hover:border-emerald-500/25',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      text: 'text-emerald-400',
    },
    warning: {
      glow: 'from-amber-500/15 to-amber-500/0',
      border: 'border-white/[0.06] hover:border-amber-500/25',
      iconBg: 'bg-amber-500/10 text-amber-400',
      text: 'text-amber-400',
    },
  };

  const c = config[variant] || config.default;

  return (
    <div className={`glass-card relative p-5 md:p-6 overflow-hidden group transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-950/20 border ${c.border} ${className}`}>
      {/* Glow effect */}
      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${c.glow} rounded-full blur-2xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700`} />
      
      <div className="relative z-10">
        {/* Icon + Label row */}
        <div className="flex items-center gap-2 mb-3">
          {icon && (
            <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        </div>
        
        {/* Value */}
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{value}</h3>
        
        {/* Subtitle + Trend */}
        <div className="flex items-center gap-2 mt-2">
          {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              trend.startsWith('+') || trend.startsWith('↑') 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      
      {/* Watermark icon */}
      {icon && (
        <span className={`material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.04] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.07] ${c.text}`}>
          {icon}
        </span>
      )}
    </div>
  );
}
