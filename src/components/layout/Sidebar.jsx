import { useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const icons = {
  planner:   (<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h2M8 18h2M12 14h4M12 18h4"/></svg>),
  tasks:     (<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>),
  analytics: (<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>),
  logout:    (<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>),
};

const navItems = [
  { path: '/planner',   label: 'Planner',   icon: 'planner'   },
  { path: '/tasks',     label: 'Tasks',     icon: 'tasks'     },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
];

const Sidebar = () => {
  const { state, dispatch } = useContext(AppContext);
  const { tasks = [], subjects = [] } = state;
  const location     = useLocation();
  const navigate     = useNavigate();
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <aside
      className="fixed top-0 left-0 z-40 flex flex-col border-r bg-surface-900/95 border-white/8"
      style={{ width: 'var(--sidebar-w)', height: '100dvh' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/8 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-glow-brand">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold font-display leading-none text-white">Study Buddy</span>
          <span className="text-2xs text-brand-400 font-body mt-0.5">Ace your semester</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-3 mt-4 mb-2 rounded-lg p-3 bg-brand-400/8 border border-brand-400/15">
        <div className="flex justify-between text-center">
          <div>
            <p className="text-base font-bold font-display text-white">{subjects.length}</p>
            <p className="text-2xs text-white/40 font-body">Subjects</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-base font-bold font-display text-white">{tasks.length}</p>
            <p className="text-2xs text-white/40 font-body">Tasks</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-base font-bold font-display text-emerald-400">
              {tasks.filter(t => t.status === 'done').length}
            </p>
            <p className="text-2xs text-white/40 font-body">Done</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 pt-3 overflow-y-auto">
        <p className="text-2xs font-medium uppercase tracking-widest text-white/25 px-2 mb-2 font-body">Navigation</p>
        {navItems.map(({ path, label, icon }) => {
          const isActive = location.pathname.startsWith(path);
          const badge    = icon === 'tasks' && pendingCount > 0 ? pendingCount : null;
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-body transition-all duration-200
                ${isActive
                  ? 'bg-brand-400/15 text-brand-300 border-l-2 border-brand-400 pl-[10px]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span className={isActive ? 'text-brand-400' : ''}>{icons[icon]}</span>
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="w-5 h-5 rounded-full bg-brand-400 text-white text-2xs font-bold font-mono flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/8 pt-3 flex-shrink-0">
        <button
          onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-body transition-all duration-200 text-white/40 hover:text-red-400 hover:bg-red-400/8"
        >
          {icons.logout}
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;