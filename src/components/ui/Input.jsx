import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Formats a number with Indonesian thousand separators (dots).
 * e.g. 1500000 → "1.500.000"
 */
function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'string' ? value.replace(/\./g, '') : String(value);
  const cleaned = num.replace(/[^\d]/g, '');
  if (!cleaned) return '';
  return parseInt(cleaned, 10).toLocaleString('id-ID');
}

/**
 * Parses a formatted number string back to an integer.
 * e.g. "1.500.000" → 1500000
 */
function parseFormattedNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/\./g, '').replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Standardized Input component with consistent styling across the app.
 * Supports text, number, currency, date, and email modes.
 */
export default function Input({
  label,
  error,
  icon,
  type = 'text',
  currency = false,
  prefix,
  value,
  onChange,
  className = '',
  containerClassName = '',
  ...props
}) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);

  // Sync display value for currency mode
  useEffect(() => {
    if (currency) {
      setDisplayValue(value ? formatNumber(value) : '');
    }
  }, [currency, value]);

  const handleCurrencyChange = useCallback((e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^\d]/g, '');
    
    if (!cleaned) {
      setDisplayValue('');
      onChange?.({ target: { value: 0, name: props.name } });
      return;
    }

    const numericValue = parseInt(cleaned, 10);
    setDisplayValue(formatNumber(numericValue));
    
    // Pass the raw numeric value to the parent
    onChange?.({ target: { value: numericValue, name: props.name } });
  }, [onChange, props.name]);

  const inputClasses = `input-base ${icon || prefix || currency ? 'pl-10' : ''} ${error ? 'border-red-500/50 focus:border-red-500 focus:shadow-red-500/15' : ''} ${className}`;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Icon or prefix */}
        {(icon || currency) && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {currency ? (
              <span className="text-xs font-bold">Rp</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            )}
          </span>
        )}
        {prefix && !icon && !currency && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        
        {currency ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleCurrencyChange}
            className={inputClasses}
            {...props}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={onChange}
            className={inputClasses}
            inputMode={type === 'number' ? 'numeric' : undefined}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

// Export utilities for use elsewhere
Input.formatNumber = formatNumber;
Input.parseFormattedNumber = parseFormattedNumber;
