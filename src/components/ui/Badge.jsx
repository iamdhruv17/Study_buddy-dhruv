const variants = {
  'priority-low':    { wrap: 'bg-amber-400/10  border-amber-400/25  text-amber-300',   dot: 'bg-amber-400'   },
  'priority-medium': { wrap: 'bg-orange-400/10 border-orange-400/25 text-orange-300',  dot: 'bg-orange-400'  },
  'priority-high':   { wrap: 'bg-red-400/10    border-red-400/25    text-red-300',     dot: 'bg-red-400'     },
  'diff-easy':       { wrap: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300', dot: 'bg-emerald-400' },
  'diff-medium':     { wrap: 'bg-blue-400/10   border-blue-400/25   text-blue-300',    dot: 'bg-blue-400'    },
  'diff-hard':       { wrap: 'bg-purple-400/10 border-purple-400/25 text-purple-300',  dot: 'bg-purple-400'  },
  'status-done':     { wrap: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300', dot: 'bg-emerald-400' },
  'status-missed':   { wrap: 'bg-red-400/10    border-red-400/25    text-red-300',     dot: 'bg-red-400'     },
  'status-pending':  { wrap: 'bg-amber-400/10  border-amber-400/25  text-amber-300',   dot: 'bg-amber-400'   },
  brand:   { wrap: 'bg-brand-400/15  border-brand-400/30  text-brand-300',  dot: 'bg-brand-400'   },
  teal:    { wrap: 'bg-teal-400/15   border-teal-400/30   text-teal-300',   dot: 'bg-teal-400'    },
  default: { wrap: 'bg-white/8       border-white/12      text-white/70',   dot: 'bg-white/50'    },
};

const sizes    = { xs: 'text-2xs px-1.5 py-0.5 gap-1', sm: 'text-xs px-2 py-0.5 gap-1.5', md: 'text-xs px-2.5 py-1 gap-1.5' };
const dotSizes = { xs: 'w-1 h-1', sm: 'w-1.5 h-1.5', md: 'w-1.5 h-1.5' };

export const ScoreBadge = ({ score }) => {
  const max = 6;
  const pct = score / max;
  const gradient = pct >= 0.83 ? 'from-red-500 to-orange-400' : pct >= 0.5 ? 'from-brand-400 to-purple-400' : 'from-teal-400 to-emerald-400';
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} text-white text-sm font-bold font-display shadow-glow-brand animate-score-pop`}>
      {score}
    </span>
  );
};

const Badge = ({ children, variant = 'default', size = 'sm', dot = false, pulse = false, className = '', onClick }) => {
  const v  = variants[variant] ?? variants.default;
  const sz = sizes[size] ?? sizes.sm;
  const ds = dotSizes[size] ?? dotSizes.sm;
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium font-body rounded-md border select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${v.wrap} ${sz} ${className}`}
    >
      {dot && <span className={`rounded-full flex-shrink-0 ${v.dot} ${ds} ${pulse ? 'animate-pulse' : ''}`} />}
      {children}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const map = { Low: 'priority-low', Medium: 'priority-medium', High: 'priority-high' };
  return <Badge variant={map[priority] ?? 'default'} dot size="sm">{priority}</Badge>;
};
export const DifficultyBadge = ({ difficulty }) => {
  const map = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' };
  return <Badge variant={map[difficulty] ?? 'default'} dot size="sm">{difficulty}</Badge>;
};
export const StatusBadge = ({ status }) => {
  const map    = { done: 'status-done', missed: 'status-missed', pending: 'status-pending' };
  const labels = { done: 'Done', missed: 'Missed', pending: 'Pending' };
  return <Badge variant={map[status] ?? 'default'} dot pulse={status === 'pending'} size="sm">{labels[status] ?? status}</Badge>;
};

export default Badge;