/**
 * Standardized Card component for consistent glassmorphism cards across the app.
 */
export default function Card({ children, variant = 'default', accent, hover = false, onClick, className = '' }) {
  const baseClass = 'glass-card relative overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'p-5 md:p-6',
    compact: 'p-4',
    flush: 'p-0',
  };

  const accentColors = {
    purple: 'border-l-4 border-l-purple-500',
    cyan: 'border-l-4 border-l-cyan-500',
    emerald: 'border-l-4 border-l-emerald-500',
    amber: 'border-l-4 border-l-amber-500',
    red: 'border-l-4 border-l-red-500',
  };

  const hoverClass = hover
    ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-950/15 cursor-pointer active:scale-[0.99]'
    : '';

  const accentClass = accent ? accentColors[accent] || '' : '';

  return (
    <div
      className={`${baseClass} ${variants[variant] || variants.default} ${accentClass} ${hoverClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
