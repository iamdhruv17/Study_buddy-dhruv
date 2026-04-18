import { forwardRef, useId } from 'react';

const sizes = {
  sm: { input: 'h-8  px-3 text-sm',   label: 'text-xs', icon: 'text-sm w-8'  },
  md: { input: 'h-10 px-3 text-sm',   label: 'text-sm', icon: 'text-sm w-10' },
  lg: { input: 'h-12 px-4 text-base', label: 'text-sm', icon: 'text-base w-12'},
};

const baseInput = [
  'w-full bg-white/5 hover:bg-white/7',
  'border border-white/10 hover:border-white/20',
  'focus:border-brand-400/60 focus:bg-white/8',
  'focus:outline-none focus:ring-2 focus:ring-brand-400/25',
  'text-white placeholder-white/30',
  'rounded-md transition-all duration-200 font-body',
].join(' ');

const Input = forwardRef(({
  label, error, hint, leftIcon, rightIcon,
  type = 'text', textarea = false, rows = 4,
  select = false, options = [],
  size = 'md', fullWidth = true, className = '',
  id: propId, ...props
}, ref) => {
  const autoId = useId();
  const id = propId ?? autoId;
  const sz = sizes[size] ?? sizes.md;

  const inputCls = [
    baseInput, sz.input,
    leftIcon  ? 'pl-9' : '',
    rightIcon ? 'pr-9' : '',
    error ? 'border-red-500/50 focus:border-red-400/60 focus:ring-red-400/20' : '',
    textarea ? 'h-auto py-2.5 resize-none' : '',
    className,
  ].join(' ');

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'w-auto'}`}>
      {label && (
        <label htmlFor={id} className={`${sz.label} font-medium text-white/70 font-body`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && !textarea && !select && (
          <span className={`absolute left-0 top-0 ${sz.icon} h-full flex items-center justify-center text-white/40 pointer-events-none`}>
            {leftIcon}
          </span>
        )}
        {textarea ? (
          <textarea ref={ref} id={id} rows={rows} className={inputCls} {...props} />
        ) : select ? (
          <select ref={ref} id={id} className={`${inputCls} appearance-none cursor-pointer pr-9 [&>option]:bg-surface-850 [&>option]:text-white`} {...props}>
            {options.map(({ value, label: optLabel }) => (
              <option key={value} value={value}>{optLabel}</option>
            ))}
          </select>
        ) : (
          <input ref={ref} id={id} type={type} className={inputCls} {...props} />
        )}
        {(rightIcon || select) && !textarea && (
          <span className={`absolute right-0 top-0 ${sz.icon} h-full flex items-center justify-center text-white/40 pointer-events-none`}>
            {select ? (
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : rightIcon}
          </span>
        )}
      </div>
      {(error || hint) && (
        <p className={`text-xs font-body ${error ? 'text-red-400' : 'text-white/40'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;