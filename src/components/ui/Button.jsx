/**
 * Standardized Button component with consistent variants and sizes.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:from-purple-600/50 disabled:to-cyan-600/50',
    secondary: 'bg-white/[0.04] border border-white/[0.08] text-slate-200 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15] hover:scale-[1.02] active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/15 hover:shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/15 hover:scale-[1.02] active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm rounded-xl gap-2',
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 ${v} ${s} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
          {children}
          {iconRight && <span className="material-symbols-outlined text-[18px]">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
