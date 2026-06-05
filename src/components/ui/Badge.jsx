export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-container-high text-on-surface-variant',
    primary: 'bg-primary-fixed text-on-primary-fixed',
    success: 'bg-tertiary-fixed/30 text-tertiary',
    warning: 'bg-warning-container text-on-warning-container',
    error: 'bg-error-container text-on-error-container',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
