/**
 * Standardized Select component with consistent styling.
 */
export default function Select({
  label,
  error,
  icon,
  value,
  onChange,
  children,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </span>
        )}
        <select
          value={value}
          onChange={onChange}
          className={`input-base appearance-none cursor-pointer ${icon ? 'pl-10' : ''} pr-10 ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        {/* Custom arrow */}
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500 pointer-events-none">
          expand_more
        </span>
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}
