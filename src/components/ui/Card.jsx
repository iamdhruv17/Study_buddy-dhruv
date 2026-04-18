const variants = {
  default:  'bg-surface-850 border border-white/8 shadow-card-dark',
  glass:    'bg-white/4 backdrop-blur-md border border-white/10',
  bordered: 'bg-surface-850 border border-brand-400/30 shadow-[0_0_0_1px_rgba(108,99,255,0.15)]',
  elevated: 'bg-surface-800 border border-white/6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
  flat:     'bg-white/4 border border-transparent',
};

const paddings = {
  none: '', sm: 'p-3', md: 'p-5', lg: 'p-6',
};

const Card = ({ children, variant = 'default', padding = 'md', header, footer, hoverable = false, onClick, className = '', style }) => {
  const base = [
    'rounded-xl overflow-hidden transition-all duration-300',
    hoverable || onClick ? 'hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-pointer' : '',
    onClick ? 'active:scale-[0.99]' : '',
  ].join(' ');

  return (
    <div className={`${base} ${variants[variant] ?? variants.default} ${className}`} onClick={onClick} style={style}>
      {header && (
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={paddings[padding] ?? paddings.md}>{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-white/8 bg-white/2">{footer}</div>
      )}
    </div>
  );
};

export const StatCard = ({ label, value, icon, trend, trendLabel, color = 'brand' }) => {
  const colorMap = {
    brand:   'text-brand-400  bg-brand-400/10  border-brand-400/20',
    teal:    'text-teal-400   bg-teal-400/10   border-teal-400/20',
    success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    warning: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
    danger:  'text-red-400    bg-red-400/10    border-red-400/20',
  };
  return (
    <div className="bg-surface-850 border border-white/8 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/50 font-body uppercase tracking-wide">{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${colorMap[color] ?? colorMap.brand}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold font-display text-white">{value}</p>
      {(trend !== undefined || trendLabel) && (
        <p className={`text-xs font-body ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
        </p>
      )}
    </div>
  );
};

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-lg font-semibold text-white font-display">{title}</h2>
      {subtitle && <p className="text-sm text-white/50 font-body mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;