export default function StatCard({ icon, label, value, subtitle, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-container-lowest',
    primary: 'bg-primary-container text-on-primary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    warning: 'bg-warning-container text-on-warning-container',
  };

  return (
    <div className={`${variants[variant]} p-5 md:p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${className}`}>
      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70 mb-1">{label}</p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight">{value}</h3>
        {subtitle && <p className="text-[11px] mt-1.5 opacity-80 font-medium">{subtitle}</p>}
      </div>
      {icon && (
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.08] transition-transform duration-500 group-hover:scale-110">
          {icon}
        </span>
      )}
    </div>
  );
}
