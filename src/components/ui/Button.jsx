import { forwardRef } from 'react';

const variants = {
  primary:   'bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white border border-brand-500 shadow-glow-brand',
  secondary: 'bg-white/8 hover:bg-white/12 text-white/90 border border-white/10 hover:border-white/20',
  outline:   'bg-transparent hover:bg-brand-400/10 text-brand-300 hover:text-brand-200 border border-brand-400/60 hover:border-brand-400',
  ghost:     'bg-transparent hover:bg-white/6 text-white/70 hover:text-white border border-transparent',
  danger:    'bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60',
  success:   'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30',
  teal:      'bg-teal-400/15 hover:bg-teal-400/25 text-teal-400 hover:text-teal-300 border border-teal-400/30 hover:border-teal-400/60',
};

const sizes = {
  xs: 'h-7  px-2.5 text-xs  gap-1   rounded-sm',
  sm: 'h-8  px-3   text-sm  gap-1.5 rounded-md',
  md: 'h-10 px-4   text-sm  gap-2   rounded-md',
  lg: 'h-12 px-6   text-base gap-2.5 rounded-lg',
};

const Spinner = ({ size }) => (
  <svg className={`animate-spin ${size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Button = forwardRef(({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, leftIcon, rightIcon, fullWidth = false,
  className = '', as = 'button', type = 'button', onClick, ...props
}, ref) => {
  const Tag = as;
  const isDisabled = disabled || loading;
  const base = [
    'inline-flex items-center justify-center font-body font-medium',
    'transition-all duration-200 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50',
    'active:scale-[0.97]',
    isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    fullWidth   ? 'w-full' : '',
  ].join(' ');

  return (
    <Tag
      ref={ref}
      type={as === 'button' ? type : undefined}
      disabled={as === 'button' ? isDisabled : undefined}
      onClick={!isDisabled ? onClick : undefined}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {loading ? <Spinner size={size} /> : leftIcon ? <span className="text-sm">{leftIcon}</span> : null}
      {children && <span className={loading ? 'opacity-0 absolute' : ''}>{children}</span>}
      {!loading && rightIcon && <span className="text-sm">{rightIcon}</span>}
    </Tag>
  );
});

Button.displayName = 'Button';
export default Button;